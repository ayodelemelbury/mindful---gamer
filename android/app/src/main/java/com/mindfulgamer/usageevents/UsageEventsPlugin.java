package com.mindfulgamer.usageevents;

import android.app.AppOpsManager;
import android.app.usage.UsageEvents;
import android.app.usage.UsageStatsManager;
import android.content.Context;
import android.os.Build;
import android.os.Process;

import com.getcapacitor.JSArray;
import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;

@CapacitorPlugin(name = "UsageEventsPlugin")
public class UsageEventsPlugin extends Plugin {

    // ACTIVITY_RESUMED constant (available API 29+, but we define it for compatibility)
    private static final int ACTIVITY_RESUMED = 23;

    /**
     * Check if PACKAGE_USAGE_STATS permission is granted using AppOpsManager.
     * Returns true if permission is granted, false otherwise.
     */
    private boolean hasUsageStatsPermission() {
        Context ctx = getContext();
        if (ctx == null) {
            return false;
        }

        AppOpsManager appOps = (AppOpsManager) ctx.getSystemService(Context.APP_OPS_SERVICE);
        if (appOps == null) {
            return false;
        }

        int mode = appOps.checkOpNoThrow(
                AppOpsManager.OPSTR_GET_USAGE_STATS,
                Process.myUid(),
                ctx.getPackageName()
        );

        return mode == AppOpsManager.MODE_ALLOWED;
    }

    /**
     * Reject a call with a permission error message.
     */
    private void rejectPermissionDenied(PluginCall call) {
        call.reject(
                "PACKAGE_USAGE_STATS permission not granted. " +
                        "Please enable 'Usage access' for this app in Settings > Apps > Special access > Usage access, " +
                        "or open Settings.ACTION_USAGE_ACCESS_SETTINGS.",
                "PERMISSION_DENIED"
        );
    }

    @PluginMethod
    public void queryEvents(PluginCall call) {
        // Validate context
        Context ctx = getContext();
        if (ctx == null) {
            call.reject("Context not available");
            return;
        }

        // Check permission explicitly using AppOpsManager
        if (!hasUsageStatsPermission()) {
            rejectPermissionDenied(call);
            return;
        }

        // Validate parameters
        Long beginTime = call.getLong("beginTime");
        Long endTime = call.getLong("endTime");

        if (beginTime == null || endTime == null) {
            call.reject("beginTime and endTime are required");
            return;
        }

        try {
            UsageStatsManager usm = (UsageStatsManager)
                    ctx.getSystemService(Context.USAGE_STATS_SERVICE);

            if (usm == null) {
                call.reject("UsageStatsManager not available");
                return;
            }

            UsageEvents events = usm.queryEvents(beginTime, endTime);
            JSArray result = new JSArray();

            while (events.hasNextEvent()) {
                UsageEvents.Event event = new UsageEvents.Event();
                events.getNextEvent(event);

                int type = event.getEventType();

                // Include foreground/background transitions
                // MOVE_TO_FOREGROUND = 1, MOVE_TO_BACKGROUND = 2
                // ACTIVITY_RESUMED = 23 (API 29+, more accurate on newer devices)
                boolean isForegroundEvent = (type == UsageEvents.Event.MOVE_TO_FOREGROUND);
                boolean isBackgroundEvent = (type == UsageEvents.Event.MOVE_TO_BACKGROUND);
                boolean isResumedEvent = (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q && type == ACTIVITY_RESUMED);

                if (isForegroundEvent || isBackgroundEvent || isResumedEvent) {
                    JSObject obj = new JSObject();
                    obj.put("packageName", event.getPackageName());
                    obj.put("className", event.getClassName());
                    obj.put("eventType", type);
                    obj.put("timestamp", event.getTimeStamp());
                    result.put(obj);
                }
            }

            JSObject ret = new JSObject();
            ret.put("events", result);
            call.resolve(ret);
        } catch (SecurityException e) {
            // Permission was revoked between check and use
            rejectPermissionDenied(call);
        } catch (Exception e) {
            call.reject("Error querying events: " + e.getMessage());
        }
    }

    @PluginMethod
    public void getCurrentForegroundApp(PluginCall call) {
        // Validate context
        Context ctx = getContext();
        if (ctx == null) {
            call.reject("Context not available");
            return;
        }

        // Check permission explicitly using AppOpsManager
        if (!hasUsageStatsPermission()) {
            rejectPermissionDenied(call);
            return;
        }

        try {
            long now = System.currentTimeMillis();
            long beginTime = now - 60000; // Last minute

            UsageStatsManager usm = (UsageStatsManager)
                    ctx.getSystemService(Context.USAGE_STATS_SERVICE);

            if (usm == null) {
                JSObject ret = new JSObject();
                ret.put("packageName", null);
                ret.put("timestamp", null);
                call.resolve(ret);
                return;
            }

            UsageEvents events = usm.queryEvents(beginTime, now);
            String foregroundApp = null;
            long latestTimestamp = 0;

            while (events.hasNextEvent()) {
                UsageEvents.Event event = new UsageEvents.Event();
                events.getNextEvent(event);

                int type = event.getEventType();

                // Check for MOVE_TO_FOREGROUND or ACTIVITY_RESUMED (API 29+)
                boolean isForeground = (type == UsageEvents.Event.MOVE_TO_FOREGROUND);
                boolean isResumed = (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q && type == ACTIVITY_RESUMED);

                if ((isForeground || isResumed) && event.getTimeStamp() > latestTimestamp) {
                    foregroundApp = event.getPackageName();
                    latestTimestamp = event.getTimeStamp();
                }
            }

            JSObject ret = new JSObject();
            ret.put("packageName", foregroundApp);
            ret.put("timestamp", latestTimestamp > 0 ? latestTimestamp : null);
            call.resolve(ret);
        } catch (SecurityException e) {
            // Permission was revoked between check and use
            rejectPermissionDenied(call);
        } catch (Exception e) {
            call.reject("Error getting foreground app: " + e.getMessage());
        }
    }
}
