package com.boxel3d.app;

import android.graphics.Color;
import android.os.Bundle;
import android.view.View;
import android.view.ViewGroup;
import android.view.WindowManager;
import android.webkit.WebView;
import androidx.core.view.WindowCompat;
import androidx.core.view.WindowInsetsCompat;
import androidx.core.view.WindowInsetsControllerCompat;
import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        getWindow().setStatusBarColor(Color.TRANSPARENT);
        getWindow().setNavigationBarColor(Color.TRANSPARENT);
        getWindow().getAttributes().layoutInDisplayCutoutMode =
            WindowManager.LayoutParams.LAYOUT_IN_DISPLAY_CUTOUT_MODE_ALWAYS;
        WindowCompat.setDecorFitsSystemWindows(getWindow(), false);

        // Force Capacitor's WebView and its parent to extend into the cutout area
        View content = getWindow().getDecorView().findViewById(android.R.id.content);
        if (content != null) {
            content.setFitsSystemWindows(false);
            content.setBackgroundColor(Color.BLACK);
        }
        WebView webView = getBridge().getWebView();
        if (webView != null) {
            webView.setFitsSystemWindows(false);
            webView.setPadding(0, 0, 0, 0);
            webView.setBackgroundColor(Color.BLACK);
            ViewGroup parent = (ViewGroup) webView.getParent();
            if (parent != null) {
                parent.setFitsSystemWindows(false);
                parent.setPadding(0, 0, 0, 0);
                parent.setClipToPadding(false);
                parent.setBackgroundColor(Color.BLACK);
            }
        }

        hideSystemBars();
    }

    @Override
    public void onWindowFocusChanged(boolean hasFocus) {
        super.onWindowFocusChanged(hasFocus);
        if (hasFocus) {
            hideSystemBars();
        }
    }

    private void hideSystemBars() {
        WindowInsetsControllerCompat controller =
            WindowCompat.getInsetsController(getWindow(), getWindow().getDecorView());
        controller.hide(WindowInsetsCompat.Type.systemBars());
        controller.setSystemBarsBehavior(
            WindowInsetsControllerCompat.BEHAVIOR_SHOW_TRANSIENT_BARS_BY_SWIPE
        );
    }
}
