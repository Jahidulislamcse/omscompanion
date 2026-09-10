package com.omscompanion;

import android.app.Application;
import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.media.AudioAttributes;
import android.media.RingtoneManager;
import android.net.Uri;
import android.os.Build;
import com.onesignal.OneSignal;
import com.onesignal.debug.LogLevel;

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
