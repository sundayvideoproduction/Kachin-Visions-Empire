// Configuration for QuickChat
const QuickChatConfig = {
    // Supabase Configuration
    supabase: {
        url: 'https://apmhwagvmjajitsagruk.supabase.co',
        key: 'sb_publishable_OSovGbln41HG96yLOuxwAA_fIKU73gQ'
    },
    
    // App Settings
    app: {
        name: 'QuickChat Messenger',
        version: '2.0.0',
        defaultTheme: 'light',
        pollInterval: 7000, // milliseconds
        reconnectAttempts: 5,
        messageLimit: 50,
        maxFileSize: 10 * 1024 * 1024, // 10MB
        supportedImageTypes: ['image/jpeg', 'image/png', 'image/gif']
    },
    
    // Features
    features: {
        offlineMode: true,
        pushNotifications: true,
        fileSharing: false, // Enable when ready
        voiceMessages: false, // Enable when ready
        videoCalls: false // Enable when ready
    },
    
    // URLs
    urls: {
        privacyPolicy: 'https://yourdomain.com/privacy',
        termsOfService: 'https://yourdomain.com/terms',
        support: 'mailto:support@quickchat.com'
    },
    
    // Default values
    defaults: {
        userStatus: 'online',
        notificationSound: 'on',
        avatarColors: [
            '#6a11cb', '#2575fc', '#ff6b6b', '#4ecdc4',
            '#ffe66d', '#1a936f', '#ff9a76', '#8a4fff',
            '#00bbf9', '#f15bb5'
        ]
    }
};

// Make config available globally
window.QuickChatConfig = QuickChatConfig;