package com.workflow.compass;

import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
    @Override
    protected void onCreate(android.os.Bundle savedInstanceState) {
        android.util.Log.d("DIAGNOstic", "MainActivity onCreate started");
        super.onCreate(savedInstanceState);
        android.util.Log.d("DIAGNOstic", "MainActivity onCreate finished");
    }

    @Override
    public void onWindowFocusChanged(boolean hasFocus) {
        android.util.Log.d("DIAGNOstic", "onWindowFocusChanged: " + hasFocus);
        super.onWindowFocusChanged(hasFocus);
        if (hasFocus) {
            hideSystemBars();
        }
    }

    private void hideSystemBars() {
        androidx.core.view.WindowCompat.setDecorFitsSystemWindows(getWindow(), false);
        androidx.core.view.WindowInsetsControllerCompat controller = 
            androidx.core.view.WindowCompat.getInsetsController(getWindow(), getWindow().getDecorView());
        
        if (controller != null) {
            controller.hide(androidx.core.view.WindowInsetsCompat.Type.systemBars());
            controller.setSystemBarsBehavior(
                androidx.core.view.WindowInsetsControllerCompat.BEHAVIOR_SHOW_TRANSIENT_BARS_BY_SWIPE
            );
        }
        
        // Stop "Jumping"
        getWindow().getDecorView().setSystemUiVisibility(
            android.view.View.SYSTEM_UI_FLAG_LAYOUT_STABLE |
            android.view.View.SYSTEM_UI_FLAG_LAYOUT_HIDE_NAVIGATION |
            android.view.View.SYSTEM_UI_FLAG_LAYOUT_FULLSCREEN
        );
    }
}
