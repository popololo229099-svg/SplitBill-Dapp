# Keep line numbers for stack traces
-keepattributes SourceFile,LineNumberTable

# Retrofit + Gson models
-keepattributes Signature, InnerClasses, EnclosingMethod
-keep class com.splitbill.android.data.** { *; }
-keep class com.google.gson.reflect.TypeToken { *; }
-keep class * extends com.google.gson.reflect.TypeToken

# Mixpanel
-dontwarn com.mixpanel.android.**
-keep class com.mixpanel.android.** { *; }
