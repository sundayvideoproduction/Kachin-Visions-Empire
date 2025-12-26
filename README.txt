QuickChat Messenger - Installation Guide for WebIntoApp

1. FILE STRUCTURE:
   - index.html (main HTML file)
   - styles.css (all CSS styles)
   - app.js (all JavaScript code)
   - service-worker.js (PWA service worker)
   - manifest.json (PWA manifest)
   - README.txt (this file)

2. UPLOAD TO WEBINTOAPP:
   a. Go to www.webintoapp.com
   b. Create a new application
   c. Upload all 5 files (index.html, styles.css, app.js, service-worker.js, manifest.json)
   d. Set the following configurations:

   APP DETAILS:
   - App Name: QuickChat Messenger
   - Start URL: /
   - Orientation: Portrait
   - Enable PWA: Yes
   - Fullscreen: Yes

   PERMISSIONS:
   - Internet Access: Required
   - Storage: Required
   - Notifications: Optional

   ICONS:
   - Use the icon from: https://img.icons8.com/color/512/000000/chat.png
   - Adaptive icons: Enabled

   ADVANCED SETTINGS:
   - JavaScript: Enabled
   - DOM Storage: Enabled
   - Geolocation: Disabled
   - Camera: Disabled
   - Microphone: Disabled

3. BUILD SETTINGS:
   - Minimum SDK: Android 5.0 (API 21)
   - Target SDK: Android 13 (API 33)
   - Build Type: App Bundle (AAB) for Play Store
   - Version: 1.0.0
   - Version Code: 1

4. KEY FEATURES INCLUDED:
   - Mobile-responsive design
   - Touch-optimized UI
   - Offline support
   - Push notifications
   - Dark mode
   - Real-time messaging
   - User authentication
   - Contact management

5. TROUBLESHOOTING:
   If app doesn't work properly:
   a. Clear browser cache
   b. Check internet connection
   c. Ensure Supabase URL and Key are correct
   d. Rebuild application

6. SUPPORT:
   For issues with WebIntoApp, contact their support.
   For app functionality issues, check browser console for errors.