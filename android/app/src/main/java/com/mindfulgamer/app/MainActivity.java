package com.mindfulgamer.app;

import android.os.Bundle;
import com.getcapacitor.BridgeActivity;
import com.mindfulgamer.usageevents.UsageEventsPlugin;

public class MainActivity extends BridgeActivity {
    @Override
    public void onCreate(Bundle savedInstanceState) {
        registerPlugin(UsageEventsPlugin.class);
        super.onCreate(savedInstanceState);
    }
}
