# QuickChat Messenger

A real-time messaging application built with HTML, CSS, JavaScript and Supabase.

## Live Demo
https://yourusername.github.io/quickchat-messenger/

## Features
- Real-time messaging
- User authentication
- Contact list
- Dark/Light theme
- Android app support

## How to Use with WebIntoApp
1. Go to https://www.webintoapp.com
2. Choose "Convert Website to App"
3. Enter this GitHub URL: https://github.com/yourusername/quickchat-messenger
4. Configure Android settings
5. Generate APK

## Database Setup
This app uses Supabase. Create these tables:

```sql
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    display_name VARCHAR(100),
    phone VARCHAR(20),
    role VARCHAR(20) DEFAULT 'user',
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE messages (
    id SERIAL PRIMARY KEY,
    sender_id INTEGER REFERENCES users(id),
    receiver_id INTEGER REFERENCES users(id),
    message TEXT NOT NULL,
    read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT NOW()
);