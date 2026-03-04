# ProGuard Rules for Compass (React Native / Capacitor)

# Simplify package names
-repackageclasses ''
-allowaccessmodification

# Keep native methods and classes used by Capacitor
-keep class com.getcapacitor.** { *; }
-keep interface com.getcapacitor.** { *; }

# Keep Cordova plugins (if any legacy ones used)
-keep class org.apache.cordova.** { *; }

# Keep React Native (if mixed) - though we are using Capacitor, mostly just webview
# Standard WebView keep rules
-keep class android.webkit.** { *; }

# Remove logging in production (Clean & Build)
-assumenosideeffects class android.util.Log {
    public static boolean isLoggable(java.lang.String, int);
    public static int v(...);
    public static int i(...);
    public static int w(...);
    public static int d(...);
    public static int e(...);
}
