package com.omscompanion;

import android.app.Application;
import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.content.Intent;
import android.media.AudioAttributes;
import android.media.RingtoneManager;
import android.net.Uri;
import android.os.Build;
import com.onesignal.OneSignal;
import com.onesignal.debug.LogLevel;
import org.json.JSONObject;

public class MainApplication extends Application {

    // OneSignal App ID
    public static final String ONESIGNAL_APP_ID = "cd9df2b6-fda0-463e-bebb-7d8b49edf74c";

    @Override
    public void onCreate() {
        super.onCreate();

        // Verbose Logging for Debugging
        OneSignal.getDebug().setLogLevel(LogLevel.VERBOSE);

        // Initialize OneSignal
        OneSignal.initWithContext(this, ONESIGNAL_APP_ID);

        // Ensure clicking notification opens the APK rather than external browser
        OneSignal.getNotifications().addClickListener(event -> {
            String targetUrl = null;

            // 1. Check custom additionalData payload
            if (event.getNotification() != null && event.getNotification().getAdditionalData() != null) {
                JSONObject data = event.getNotification().getAdditionalData();
                if (data.has("target_url") && !data.isNull("target_url")) {
                    targetUrl = data.optString("target_url", null);
                } else if (data.has("url") && !data.isNull("url")) {
                    targetUrl = data.optString("url", null);
                }
            }

            // 2. Check launchURL if provided
            if ((targetUrl == null || targetUrl.isEmpty()) && event.getNotification() != null) {
                targetUrl = event.getNotification().getLaunchURL();
            }

            if (targetUrl == null || targetUrl.isEmpty()) {
                targetUrl = "http://omscompanion.com";
            }

            // Always open or bring MainActivity to front inside the APK
            Intent intent = new Intent(getApplicationContext(), MainActivity.class);
            intent.setFlags(Intent.FLAG_ACTIVITY_REORDER_TO_FRONT | Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_ACTIVITY_SINGLE_TOP);
            intent.putExtra("target_url", targetUrl);
            intent.putExtra("launchUrl", targetUrl);
            intent.putExtra("url", targetUrl);
            startActivity(intent);
        });

        // Create high-importance sound channel for Android 8.0+
        createNotificationChannel();
    }

    private void createNotificationChannel() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            String channelId = "oms_push_channel";
            CharSequence name = "OMS Companion Notifications";
            String description = "Important push notifications from OMS Companion";
            int importance = NotificationManager.IMPORTANCE_HIGH;

            NotificationChannel channel = new NotificationChannel(channelId, name, importance);
            channel.setDescription(description);
            channel.enableVibration(true);
            channel.setVibrationPattern(new long[]{0, 500, 250, 500});

            Uri defaultSoundUri = RingtoneManager.getDefaultUri(RingtoneManager.TYPE_NOTIFICATION);
            AudioAttributes audioAttributes = new AudioAttributes.Builder()
                    .setContentType(AudioAttributes.CONTENT_TYPE_SONIFICATION)
                    .setUsage(AudioAttributes.USAGE_NOTIFICATION)
                    .build();
            channel.setSound(defaultSoundUri, audioAttributes);

            NotificationManager notificationManager = getSystemService(NotificationManager.class);
            if (notificationManager != null) {
                notificationManager.createNotificationChannel(channel);
            }
        }
    }
}
