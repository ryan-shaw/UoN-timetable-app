rm Timetable.apk
ionic build --release android
jarsigner -verbose -sigalg SHA1withRSA -digestalg SHA1 -keystore release-key.keystore ./platforms/android/build/outputs/apk/android-release-unsigned.apk timetable
$ANDROID_HOME/build-tools/23.0.1/zipalign -v 4 platforms/android/build/outputs/apk/android-release-unsigned.apk Timetable.apk
