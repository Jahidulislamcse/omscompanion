package com.omscompanion;

import android.Manifest;
import android.annotation.SuppressLint;
import android.content.ClipData;
import android.content.Intent;
import android.content.pm.PackageManager;
import android.graphics.Bitmap;
import android.net.Uri;
import android.os.Build;
import android.os.Bundle;
import android.os.Environment;
import android.provider.MediaStore;
import android.view.View;
import android.webkit.PermissionRequest;
import android.webkit.ValueCallback;
import android.webkit.WebChromeClient;
import android.webkit.WebResourceError;
import android.webkit.WebResourceRequest;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import android.widget.ProgressBar;
import android.widget.Toast;
import androidx.appcompat.app.AppCompatActivity;
import androidx.core.content.FileProvider;
import java.io.File;
import java.io.IOException;
import java.text.SimpleDateFormat;
import java.util.Date;
import java.util.Locale;
import org.json.JSONObject;

public class MainActivity extends AppCompatActivity {

    // IMPORTANT: Change this to your actual production domain
    private static final String APP_URL = "http://omscompanion.com";

    private WebView webView;
    private ProgressBar progressBar;
    private android.widget.FrameLayout customViewContainer;
    private View customView;
    private WebChromeClient.CustomViewCallback customViewCallback;
    private ValueCallback<Uri[]> uploadMessage;
    private Uri cameraImageUri;
    private final static int FILECHOOSER_RESULTCODE = 1;
    private final static int PERMISSION_REQUEST_CAMERA = 102;

    private File createImageFile() throws IOException {
        String timeStamp = new SimpleDateFormat("yyyyMMdd_HHmmss", Locale.getDefault()).format(new Date());
        String imageFileName = "JPEG_" + timeStamp + "_";
        File storageDir = getExternalFilesDir(Environment.DIRECTORY_PICTURES);
        if (storageDir == null) {
            storageDir = getCacheDir();
        }
        return File.createTempFile(imageFileName, ".jpg", storageDir);
    }

    @Override
    @SuppressLint("SetJavaScriptEnabled")
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_main);

        // Request Notification Permission on Android 13+ (API 33+)
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
            if (checkSelfPermission(Manifest.permission.POST_NOTIFICATIONS) != PackageManager.PERMISSION_GRANTED) {
                requestPermissions(new String[]{Manifest.permission.POST_NOTIFICATIONS}, 101);
            }
        }

        // Request Camera Permission on Android 6.0+ (API 23+)
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
            if (checkSelfPermission(Manifest.permission.CAMERA) != PackageManager.PERMISSION_GRANTED) {
                requestPermissions(new String[]{Manifest.permission.CAMERA}, PERMISSION_REQUEST_CAMERA);
            }
        }

        com.onesignal.OneSignal.getNotifications().requestPermission(true, com.onesignal.Continue.none());
        com.onesignal.OneSignal.getUser().getPushSubscription().optIn();

        // Handle OneSignal Push Notification Click inside WebView
        com.onesignal.OneSignal.getNotifications().addClickListener(event -> {
            String targetUrl = null;
            if (event.getNotification() != null && event.getNotification().getAdditionalData() != null) {
                JSONObject data = event.getNotification().getAdditionalData();
                if (data.has("target_url") && !data.isNull("target_url")) {
                    targetUrl = data.optString("target_url", null);
                } else if (data.has("url") && !data.isNull("url")) {
                    targetUrl = data.optString("url", null);
                }
            }
            if ((targetUrl == null || targetUrl.isEmpty()) && event.getNotification() != null) {
                targetUrl = event.getNotification().getLaunchURL();
            }
            if (targetUrl == null || targetUrl.isEmpty()) {
                targetUrl = APP_URL;
            }
            final String urlToLoad = targetUrl;
            runOnUiThread(() -> {
                if (webView != null) {
                    webView.loadUrl(urlToLoad);
                }
            });
        });

        webView = findViewById(R.id.webview);
        progressBar = findViewById(R.id.progressBar);
        customViewContainer = findViewById(R.id.customViewContainer);

        // Disable Android system autofill popups / strong password suggestion overlay
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            try {
                if (getWindow() != null && getWindow().getDecorView() != null) {
                    getWindow().getDecorView().setImportantForAutofill(View.IMPORTANT_FOR_AUTOFILL_NO_EXCLUDE_DESCENDANTS);
                }
                webView.setImportantForAutofill(View.IMPORTANT_FOR_AUTOFILL_NO_EXCLUDE_DESCENDANTS);
                android.view.autofill.AutofillManager afm = getSystemService(android.view.autofill.AutofillManager.class);
                if (afm != null) {
                    afm.cancel();
                    afm.disableAutofillServices();
                }
            } catch (Exception ignored) {
            }
        }

        WebSettings webSettings = webView.getSettings();
        webSettings.setJavaScriptEnabled(true);
        webSettings.setDomStorageEnabled(true);
        webSettings.setDatabaseEnabled(true);
        webSettings.setAllowFileAccess(true);
        webSettings.setAllowContentAccess(true);
        webSettings.setSupportZoom(true);
        webSettings.setBuiltInZoomControls(false);
        webSettings.setUseWideViewPort(true);
        webSettings.setLoadWithOverviewMode(true);
        webSettings.setMixedContentMode(WebSettings.MIXED_CONTENT_ALWAYS_ALLOW);
        webSettings.setMediaPlaybackRequiresUserGesture(false);
        webSettings.setSavePassword(false);
        webSettings.setSaveFormData(false);

        // Customize User Agent so mobile app requests can be identified on web
        String defaultUa = webSettings.getUserAgentString();
        webSettings.setUserAgentString(defaultUa + " OMSCompanionAndroidApp");

        webView.addJavascriptInterface(new Object() {
            @android.webkit.JavascriptInterface
            public String getSubscriptionId() {
                try {
                    String subId = com.onesignal.OneSignal.getUser().getPushSubscription().getId();
                    return subId != null ? subId : "";
                } catch (Exception e) {
                    return "";
                }
            }

            @android.webkit.JavascriptInterface
            public String getPushToken() {
                try {
                    String token = com.onesignal.OneSignal.getUser().getPushSubscription().getToken();
                    return token != null ? token : "";
                } catch (Exception e) {
                    return "";
                }
            }

            @android.webkit.JavascriptInterface
            public void setUserId(String userId) {
                setUserInfo(userId, "member", false);
            }

            @android.webkit.JavascriptInterface
            public void setUserInfo(String userId, String role, boolean isAdmin) {
                try {
                    if (userId != null && !userId.isEmpty() && !userId.equals("0")) {
                        com.onesignal.OneSignal.login(userId);
                        com.onesignal.OneSignal.getUser().addTag("user_id", userId);
                        String cleanRole = role != null ? role.trim().toLowerCase() : "member";
                        com.onesignal.OneSignal.getUser().addTag("role", cleanRole);
                        boolean admin = isAdmin || "admin".equalsIgnoreCase(cleanRole);
                        if (admin) {
                            com.onesignal.OneSignal.getUser().addTag("is_admin", "true");
                            com.onesignal.OneSignal.getUser().addTag("role", "admin");
                        }
                        com.onesignal.OneSignal.getUser().getPushSubscription().optIn();

                        // Sync with backend API in background thread
                        final String subId = com.onesignal.OneSignal.getUser().getPushSubscription().getId();
                        final String fUserId = userId;
                        final String fRole = cleanRole;
                        final boolean fIsAdmin = admin;
                        new Thread(() -> {
                            syncDeviceWithBackend(fUserId, fRole, fIsAdmin, subId);
                        }).start();
                    }
                } catch (Exception e) {
                    android.util.Log.e("OMSCompanion", "setUserInfo native error", e);
                }
            }

            @android.webkit.JavascriptInterface
            public boolean isApp() {
                return true;
            }
        }, "OMSCompanionNative");

        webView.setWebViewClient(new WebViewClient() {
            @Override
            public void onPageStarted(WebView view, String url, Bitmap favicon) {
                progressBar.setVisibility(View.VISIBLE);
                super.onPageStarted(view, url, favicon);
                view.evaluateJavascript(
                    "(function() { " +
                    "window.isOMSCompanionApp = true; " +
                    "try { " +
                    "  localStorage.setItem('oms_app_installed', 'true'); " +
                    "  document.cookie = 'oms_app_installed=true;path=/;max-age=31536000'; " +
                    "  window.dispatchEvent(new Event('app-installed-status-changed')); " +
                    "} catch(e) {} " +
                    "})();",
                    null
                );
            }

            @Override
            public void onPageFinished(WebView view, String url) {
                progressBar.setVisibility(View.GONE);
                super.onPageFinished(view, url);
                view.evaluateJavascript(
                    "(function() { " +
                    "window.isOMSCompanionApp = true; " +
                    "try { " +
                    "  localStorage.setItem('oms_app_installed', 'true'); " +
                    "  document.cookie = 'oms_app_installed=true;path=/;max-age=31536000'; " +
                    "  window.dispatchEvent(new Event('app-installed-status-changed')); " +
                    "} catch(e) {} " +
                    "if (window.authUser && window.authUser.id && window.OMSCompanionNative) { " +
                    "  try { " +
                    "    var isAdm = (window.authUser.role === 'admin' || window.authUser.isAdmin === true); " +
                    "    if (window.OMSCompanionNative.setUserInfo) { " +
                    "      window.OMSCompanionNative.setUserInfo(String(window.authUser.id), String(window.authUser.role || ''), isAdm); " +
                    "    } else { " +
                    "      window.OMSCompanionNative.setUserId(String(window.authUser.id)); " +
                    "    } " +
                    "  } catch(e) {} " +
                    "} " +
                    "})();",
                    null
                );
            }

            @Override
            public void onReceivedError(WebView view, WebResourceRequest request, WebResourceError error) {
                progressBar.setVisibility(View.GONE);
                super.onReceivedError(view, request, error);
            }

            @Override
            public boolean shouldOverrideUrlLoading(WebView view, WebResourceRequest request) {
                String url = request.getUrl().toString();
                if (url.startsWith("mailto:") || url.startsWith("tel:") || url.startsWith("sms:") || url.startsWith("whatsapp:")) {
                    try {
                        Intent intent = new Intent(Intent.ACTION_VIEW, Uri.parse(url));
                        startActivity(intent);
                        return true;
                    } catch (Exception e) {
                        Toast.makeText(MainActivity.this, "Application not found to handle this request", Toast.LENGTH_SHORT).show();
                        return true;
                    }
                }
                return false;
            }
        });

        webView.setWebChromeClient(new WebChromeClient() {
            @Override
            public void onProgressChanged(WebView view, int newProgress) {
                progressBar.setProgress(newProgress);
                if (newProgress == 100) {
                    progressBar.setVisibility(View.GONE);
                } else {
                    progressBar.setVisibility(View.VISIBLE);
                }
                super.onProgressChanged(view, newProgress);
            }

            // Grant WebRTC camera & microphone permissions for in-page camera capture
            @Override
            public void onPermissionRequest(final PermissionRequest request) {
                runOnUiThread(() -> {
                    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.LOLLIPOP) {
                        request.grant(request.getResources());
                    }
                });
            }

            // Enable HTML5 and YouTube full screen video
            @Override
            public void onShowCustomView(View view, CustomViewCallback callback) {
                showCustomViewInternal(view, callback);
            }

            @Override
            public void onHideCustomView() {
                hideCustomViewInternal();
            }

            // For Android 5.0+ (File & Camera Chooser for uploads)
            @Override
            public boolean onShowFileChooser(WebView mWebView, ValueCallback<Uri[]> filePathCallback, WebChromeClient.FileChooserParams fileChooserParams) {
                if (uploadMessage != null) {
                    uploadMessage.onReceiveValue(null);
                    uploadMessage = null;
                }
                uploadMessage = filePathCallback;

                // Request Camera permission if needed
                if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
                    if (checkSelfPermission(Manifest.permission.CAMERA) != PackageManager.PERMISSION_GRANTED) {
                        requestPermissions(new String[]{Manifest.permission.CAMERA}, PERMISSION_REQUEST_CAMERA);
                    }
                }

                Intent takePictureIntent = null;
                try {
                    File photoFile = createImageFile();
                    if (photoFile != null) {
                        cameraImageUri = FileProvider.getUriForFile(
                            MainActivity.this,
                            getPackageName() + ".fileprovider",
                            photoFile
                        );
                        takePictureIntent = new Intent(MediaStore.ACTION_IMAGE_CAPTURE);
                        takePictureIntent.putExtra(MediaStore.EXTRA_OUTPUT, cameraImageUri);
                        takePictureIntent.addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION | Intent.FLAG_GRANT_WRITE_URI_PERMISSION);
                    }
                } catch (Exception ex) {
                    cameraImageUri = null;
                }

                // If the HTML element has capture attribute (e.g. capture="user")
                boolean isCapture = fileChooserParams != null && fileChooserParams.isCaptureEnabled();
                if (isCapture && takePictureIntent != null) {
                    try {
                        startActivityForResult(takePictureIntent, FILECHOOSER_RESULTCODE);
                        return true;
                    } catch (Exception e) {
                        // Fall back to chooser
                    }
                }

                // General content selection intent (Gallery / Files)
                Intent contentSelectionIntent = fileChooserParams != null ? fileChooserParams.createIntent() : new Intent(Intent.ACTION_GET_CONTENT);
                if (contentSelectionIntent.getType() == null || contentSelectionIntent.getType().isEmpty()) {
                    contentSelectionIntent.setType("image/*");
                }

                Intent chooserIntent = new Intent(Intent.ACTION_CHOOSER);
                chooserIntent.putExtra(Intent.EXTRA_INTENT, contentSelectionIntent);
                chooserIntent.putExtra(Intent.EXTRA_TITLE, "Select Photo or Camera");

                if (takePictureIntent != null) {
                    chooserIntent.putExtra(Intent.EXTRA_INITIAL_INTENTS, new Intent[]{takePictureIntent});
                }

                try {
                    startActivityForResult(chooserIntent, FILECHOOSER_RESULTCODE);
                } catch (Exception e) {
                    if (uploadMessage != null) {
                        uploadMessage.onReceiveValue(null);
                        uploadMessage = null;
                    }
                    Toast.makeText(MainActivity.this, "Cannot Open File Chooser", Toast.LENGTH_LONG).show();
                    return false;
                }
                return true;
            }
        });

        String initialUrl = APP_URL;
        Intent startingIntent = getIntent();
        if (startingIntent != null) {
            if (startingIntent.hasExtra("target_url")) {
                initialUrl = startingIntent.getStringExtra("target_url");
            } else if (startingIntent.hasExtra("launchUrl")) {
                initialUrl = startingIntent.getStringExtra("launchUrl");
            } else if (startingIntent.hasExtra("url")) {
                initialUrl = startingIntent.getStringExtra("url");
            } else if (startingIntent.getData() != null) {
                initialUrl = startingIntent.getData().toString();
            }
        }

        if (savedInstanceState == null) {
            webView.loadUrl(initialUrl);
        }
    }

    @Override
    protected void onNewIntent(Intent intent) {
        super.onNewIntent(intent);
        setIntent(intent);
        if (intent != null) {
            String targetUrl = null;
            if (intent.hasExtra("target_url")) {
                targetUrl = intent.getStringExtra("target_url");
            } else if (intent.hasExtra("launchUrl")) {
                targetUrl = intent.getStringExtra("launchUrl");
            } else if (intent.hasExtra("url")) {
                targetUrl = intent.getStringExtra("url");
            } else if (intent.getData() != null) {
                targetUrl = intent.getData().toString();
            }
            if (targetUrl != null && !targetUrl.isEmpty() && webView != null) {
                webView.loadUrl(targetUrl);
            }
        }
    }

    @Override
    protected void onActivityResult(int requestCode, int resultCode, Intent intent) {
        super.onActivityResult(requestCode, resultCode, intent);
        if (requestCode == FILECHOOSER_RESULTCODE) {
            if (uploadMessage == null) return;
            Uri[] results = null;
            if (resultCode == RESULT_OK) {
                if (intent == null || (intent.getData() == null && intent.getClipData() == null)) {
                    // Image was captured from Camera intent
                    if (cameraImageUri != null) {
                        results = new Uri[]{cameraImageUri};
                    }
                } else {
                    String dataString = intent.getDataString();
                    ClipData clipData = intent.getClipData();
                    if (clipData != null) {
                        results = new Uri[clipData.getItemCount()];
                        for (int i = 0; i < clipData.getItemCount(); i++) {
                            results[i] = clipData.getItemAt(i).getUri();
                        }
                    } else if (dataString != null) {
                        results = new Uri[]{Uri.parse(dataString)};
                    } else if (cameraImageUri != null) {
                        results = new Uri[]{cameraImageUri};
                    }
                }
            }
            uploadMessage.onReceiveValue(results);
            uploadMessage = null;
            cameraImageUri = null;
        }
    }

    private void syncDeviceWithBackend(String userId, String role, boolean isAdmin, String subscriptionId) {
        if (subscriptionId == null || subscriptionId.isEmpty()) {
            return;
        }
        try {
            java.net.URL url = new java.net.URL(APP_URL + "/api/native/sync-device");
            java.net.HttpURLConnection conn = (java.net.HttpURLConnection) url.openConnection();
            conn.setRequestMethod("POST");
            conn.setRequestProperty("Content-Type", "application/json; charset=UTF-8");
            conn.setRequestProperty("Accept", "application/json");
            conn.setDoOutput(true);
            conn.setConnectTimeout(6000);
            conn.setReadTimeout(6000);

            JSONObject json = new JSONObject();
            json.put("user_id", userId);
            json.put("role", role);
            json.put("is_admin", isAdmin);
            json.put("subscription_id", subscriptionId);
            json.put("device_model", Build.MANUFACTURER + " " + Build.MODEL);
            json.put("device_os", String.valueOf(Build.VERSION.SDK_INT));

            byte[] input = json.toString().getBytes("utf-8");
            try (java.io.OutputStream os = conn.getOutputStream()) {
                os.write(input, 0, input.length);
            }
            int code = conn.getResponseCode();
            android.util.Log.i("OMSCompanion", "syncDeviceWithBackend response code: " + code);
            conn.disconnect();
        } catch (Exception e) {
            android.util.Log.w("OMSCompanion", "syncDeviceWithBackend network notice: " + e.getMessage());
        }
    }

    private void showCustomViewInternal(View view, WebChromeClient.CustomViewCallback callback) {
        if (customView != null) {
            hideCustomViewInternal();
            return;
        }
        customView = view;
        customViewCallback = callback;

        if (webView != null) {
            webView.setVisibility(View.GONE);
        }
        if (customViewContainer != null) {
            customViewContainer.setVisibility(View.VISIBLE);
            customViewContainer.removeAllViews();
            customViewContainer.addView(view, new android.widget.FrameLayout.LayoutParams(
                android.widget.FrameLayout.LayoutParams.MATCH_PARENT,
                android.widget.FrameLayout.LayoutParams.MATCH_PARENT
            ));
        }

        try {
            setRequestedOrientation(android.content.pm.ActivityInfo.SCREEN_ORIENTATION_SENSOR_LANDSCAPE);
        } catch (Exception ignored) {}

        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.R) {
            try {
                getWindow().setDecorFitsSystemWindows(false);
                android.view.WindowInsetsController controller = getWindow().getInsetsController();
                if (controller != null) {
                    controller.hide(android.view.WindowInsets.Type.statusBars() | android.view.WindowInsets.Type.navigationBars());
                    controller.setSystemBarsBehavior(android.view.WindowInsetsController.BEHAVIOR_SHOW_TRANSIENT_BARS_BY_SWIPE);
                }
            } catch (Exception ignored) {}
        } else {
            try {
                getWindow().getDecorView().setSystemUiVisibility(
                    View.SYSTEM_UI_FLAG_FULLSCREEN
                    | View.SYSTEM_UI_FLAG_HIDE_NAVIGATION
                    | View.SYSTEM_UI_FLAG_IMMERSIVE_STICKY
                    | View.SYSTEM_UI_FLAG_LAYOUT_FULLSCREEN
                    | View.SYSTEM_UI_FLAG_LAYOUT_HIDE_NAVIGATION
                    | View.SYSTEM_UI_FLAG_LAYOUT_STABLE
                );
            } catch (Exception ignored) {}
        }
    }

    private void hideCustomViewInternal() {
        if (customView == null) return;

        if (customViewContainer != null) {
            customViewContainer.removeView(customView);
            customViewContainer.setVisibility(View.GONE);
        }
        customView = null;

        if (webView != null) {
            webView.setVisibility(View.VISIBLE);
        }

        if (customViewCallback != null) {
            try {
                customViewCallback.onCustomViewHidden();
            } catch (Exception ignored) {}
            customViewCallback = null;
        }

        try {
            setRequestedOrientation(android.content.pm.ActivityInfo.SCREEN_ORIENTATION_UNSPECIFIED);
        } catch (Exception ignored) {}

        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.R) {
            try {
                getWindow().setDecorFitsSystemWindows(true);
                android.view.WindowInsetsController controller = getWindow().getInsetsController();
                if (controller != null) {
                    controller.show(android.view.WindowInsets.Type.statusBars() | android.view.WindowInsets.Type.navigationBars());
                }
            } catch (Exception ignored) {}
        } else {
            try {
                getWindow().getDecorView().setSystemUiVisibility(View.SYSTEM_UI_FLAG_VISIBLE);
            } catch (Exception ignored) {}
        }
    }

    @Override
    public void onBackPressed() {
        if (customView != null) {
            hideCustomViewInternal();
            return;
        }
        if (webView != null && webView.canGoBack()) {
            webView.goBack();
        } else {
            super.onBackPressed();
        }
    }
}
