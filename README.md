# QuickChat Messenger - Android App

A real-time messaging application built with HTML, CSS, JavaScript, and Supabase, packaged as an Android APK.

## Features

- Real-time messaging
- Online status tracking
- Contact management
- Dark/Light theme
- Offline support
- Push notifications
- Android app functionality

## Setup Instructions

### 1. Database Setup
1. Go to [Supabase](https://supabase.com)
2. Create a new project
3. Run the SQL from `database_setup.sql` in the SQL editor
4. Get your Supabase URL and anon key

### 2. Local Development
1. Clone this repository
2. Update Supabase credentials in `index.html`
3. Serve the files using any static server
4. Open in browser

### 3. Android APK Generation
1. Go to [WebIntoApp](https://www.webintoapp.com)
2. Upload all project files
3. Configure Android settings:
   - Package name: com.quickchat.messenger
   - Version: 2.0.0
   - Version code: 1
   - Minimum SDK: 21
   - Target SDK: 33
4. Generate and download APK

## File Structure
