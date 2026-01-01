package com.mindfulgamer.usageevents;

import android.app.usage.UsageEvents;
import android.app.usage.UsageStatsManager;
import android.content.Context;

import com.getcapacitor.JSArray;
import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;

@CapacitorPlugin(name = "UsageEventsPlugin")
public class UsageEventsPlugin extends Plugin {

    @PluginMethod
    public void queryEvents(PluginCall call) {
        Long beginTime = call.getLong("beginTime");
        Long endTime = call.getLong("endTime");

        if (beginTime == null || endTime == null) {
            call.reject("beginTime and endTime are required");
            return;
        }

        try {
            UsageStatsManager usm = (UsageStatsManager)
                    getContext().getSystemService(Context.USAGE_STATS_SERVICE);

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
                // Only include foreground/background transitions
                if (type == UsageEvents.Event.MOVE_TO_FOREGROUND ||
                        type == UsageEvents.Event.MOVE_TO_BACKGROUND) {
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
        } catch (Exception e) {
            call.reject("Error querying events: " + e.getMessage());
        }
    }

    @PluginMethod
    public void getCurrentForegroundApp(PluginCall call) {
        try {
            long now = System.currentTimeMillis();
            long beginTime = now - 60000; // Last minute

            UsageStatsManager usm = (UsageStatsManager)
                    getContext().getSystemService(Context.USAGE_STATS_SERVICE);

            if (usm == null) {
                JSObject ret = new JSObject();
                ret.put("packageName", null);
                call.resolve(ret);
                return;
            }

            UsageEvents events = usm.queryEvents(beginTime, now);
            String foregroundApp = null;
            long latestTimestamp = 0;

            while (events.hasNextEvent()) {
                UsageEvents.Event event = new UsageEvents.Event();
                events.getNextEvent(event);

                if (event.getEventType() == UsageEvents.Event.MOVE_TO_FOREGROUND) {
                    if (event.getTimeStamp() > latestTimestamp) {
                        foregroundApp = event.getPackageName();
                        latestTimestamp = event.getTimeStamp();
                    }
                }
            }

            JSObject ret = new JSObject();
            ret.put("packageName", foregroundApp);
            ret.put("timestamp", latestTimestamp > 0 ? latestTimestamp : null);
            call.resolve(ret);
        } catch (Exception e) {
            call.reject("Error getting foreground app: " + e.getMessage());
        }
    }
}
