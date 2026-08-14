# OMSCOMPANION - Android WebView Wrapper

This folder contains a pre-configured native Android wrapper project (using Java / Android WebView) for the **OMSCOMPANION** website.

## Prerequisites
1. Download and install [Android Studio](https://developer.android.com/studio).
2. Android Studio will automatically install the JDK (Java Development Kit) and Android SDK.

## How to Build the APK in 5 Minutes

### Step 1: Open the Project in Android Studio
1. Open Android Studio.
2. Select **Open an Existing Project** or **File -> Open**.
3. Select this folder (`OMSCOMPANION/android-app`) as the project directory.
4. Allow Android Studio a few minutes to index the files and download dependencies.

### Step 2: Customize Logo / Icons
- Place your app icons inside the `app/src/main/res/mipmap-*` directories to replace the default Android logo.

### Step 3: Build the `.apk`
1. In the top toolbar of Android Studio, click **Build**.
2. Select **Build Bundle(s) / APK(s)** -> **Build APK(s)**.
3. Once completed, a pop-up in the bottom right corner will show: "APK(s) generated successfully".
4. Click **Locate** to find your compiled `app-debug.apk` (which you can rename to `omscompanion.apk` and install directly on any Android device!).

---

### Key Features Implemented:
- **Fast Web Rendering**: Enabled Javascript & DOM Storage for running React/Vite.
- **File Upload Support**: Full file chooser capability (enables members to upload registration copies or photos).
- **Navigation Controls**: Back button returns to previous page inside the webview instead of closing the app instantly.
- **Protocol Handler**: Opens system calls for mailto, phone calls, SMS, and WhatsApp directly.
