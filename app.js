// Configuration
const SUPABASE_URL = 'https://apmhwagvmjajitsagruk.supabase.co';
const SUPABASE_KEY = 'sb_publishable_OSovGbln41HG96yLOuxwAA_fIKU73gQ';

// Application State
const appState = {
    supabase: null,
    currentUser: null,
    activeChat: null,
    users: [],
    messages: {},
    onlineUsers: new Set(),
    subscriptions: [],
    pollingInterval: null,
    isOnline: true
};

// Initialize App
document.addEventListener('DOMContentLoaded', initializeApp);

async function initializeApp() {
    console.log('🚀 Starting QuickChat Messenger...');
    
    try {
        // Initialize Supabase
        appState.supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY, {
            auth: {
                persistSession: true,
                autoRefreshToken: true
            }
        });

        // Check connection
        await verifyConnection();

        // Check for existing session
        const savedSession = getSavedSession();
        if (savedSession) {
            await restoreSession(savedSession);
        } else {
            showAuthScreen();
        }

    } catch (error) {
        console.error('Initialization error:', error);
        showToast('Failed to initialize application', 'error');
    } finally {
        hideLoader();
    }
}

// Connection Management
async function verifyConnection() {
    try {
        const { data, error } = await appState.supabase
            .from('users')
            .select('count')
            .limit(1);

        if (error) {
            updateConnectionStatus(false);
            return false;
        }

        updateConnectionStatus(true);
        return true;
    } catch (error) {
        updateConnectionStatus(false);
        return false;
    }
}

function updateConnectionStatus(connected) {
    const statusEl = document.getElementById('connectionStatus');
    if (!statusEl) return;
    
    appState.isOnline = connected;
    
    if (connected) {
        statusEl.textContent = 'Connected';
        statusEl.className = 'connection-status online';
        setTimeout(() => {
            statusEl.style.display = 'none';
        }, 2000);
    } else {
        statusEl.textContent = 'Disconnected - Check your connection';
        statusEl.className = 'connection-status offline';
        statusEl.style.display = 'block';
    }
}

// Session Management
function getSavedSession() {
    try {
        return JSON.parse(localStorage.getItem('quickchat_session'));
    } catch {
        return null;
    }
}

function saveSession(user) {
    try {
        localStorage.setItem('quickchat_session', JSON.stringify(user));
    } catch (error) {
        console.error('Failed to save session:', error);
    }
}

function clearSession() {
    localStorage.removeItem('quickchat_session');
}

async function restoreSession(savedUser) {
    try {
        const { data: user, error } = await appState.supabase
            .from('users')
            .select('*')
            .eq('id', savedUser.id)
            .single();

        if (error || !user) {
            clearSession();
            showAuthScreen();
            return;
        }

        appState.currentUser = user;
        await startApplication();

    } catch (error) {
        console.error('Session restoration failed:', error);
        showAuthScreen();
    }
}

// Authentication
function showAuthScreen() {
    document.getElementById('loader').style.display = 'none';
    document.getElementById('authScreen').style.display = 'block';
    document.getElementById('appWrapper').style.display = 'none';
    showAuthForm('login');
}

function showAuthForm(formType) {
    document.querySelectorAll('.auth-tab').forEach(tab => {
        tab.classList.remove('active');
    });
    document.querySelectorAll('.auth-form').forEach(form => {
        form.classList.remove('active');
    });

    if (formType === 'login') {
        document.querySelectorAll('.auth-tab')[0].classList.add('active');
        document.getElementById('loginForm').classList.add('active');
    } else {
        document.querySelectorAll('.auth-tab')[1].classList.add('active');
        document.getElementById('signupForm').classList.add('active');
    }

    ['loginError', 'loginSuccess', 'signupError', 'signupSuccess'].forEach(id => {
        const el = document.getElementById(id);
        if (el) {
            el.style.display = 'none';
            el.textContent = '';
        }
    });
}

async function handleLogin() {
    const username = document.getElementById('loginUsername').value.trim();
    const password = document.getElementById('loginPassword').value;
    const errorEl = document.getElementById('loginError');
    const btn = document.getElementById('loginBtn');

    if (!username || !password) {
        showAlert(errorEl, 'Please enter username and password');
        return;
    }

    btn.disabled = true;
    btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Signing In...';

    try {
        const { data: user, error } = await appState.supabase
            .from('users')
            .select('*')
            .eq('username', username)
            .eq('password', password)
            .single();

        if (error || !user) {
            throw new Error('Invalid credentials');
        }

        appState.currentUser = user;
        saveSession(user);
        await startApplication();
        showToast(`Welcome back, ${user.display_name || user.username}!`, 'success');

    } catch (error) {
        console.error('Login error:', error);
        showAlert(errorEl, 'Invalid username or password');
        btn.disabled = false;
        btn.innerHTML = '<span>Sign In</span>';
    }
}

async function handleSignup() {
    const username = document.getElementById('signupUsername').value.trim();
    const password = document.getElementById('signupPassword').value;
    const displayName = document.getElementById('signupDisplayName').value.trim() || username;
    const phone = document.getElementById('signupPhone').value.trim();
    const errorEl = document.getElementById('signupError');
    const successEl = document.getElementById('signupSuccess');
    const btn = document.getElementById('signupBtn');

    if (!username || !password) {
        showAlert(errorEl, 'Username and password are required');
        return;
    }

    if (username.length < 3) {
        showAlert(errorEl, 'Username must be at least 3 characters');
        return;
    }

    if (password.length < 6) {
        showAlert(errorEl, 'Password must be at least 6 characters');
        return;
    }

    btn.disabled = true;
    btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Creating Account...';

    try {
        const { data: existingUser } = await appState.supabase
            .from('users')
            .select('id')
            .eq('username', username)
            .single();

        if (existingUser) {
            throw new Error('Username already taken');
        }

        const { data: user, error } = await appState.supabase
            .from('users')
            .insert({
                username: username,
                password: password,
                display_name: displayName,
                phone: phone,
                role: 'user',
                last_seen: new Date().toISOString()
            })
            .select()
            .single();

        if (error) throw error;

        showAlert(successEl, 'Account created successfully! Redirecting...');

        setTimeout(async () => {
            appState.currentUser = user;
            saveSession(user);
            await startApplication();
            showToast('Welcome to QuickChat!', 'success');
        }, 1500);

    } catch (error) {
        console.error('Signup error:', error);
        showAlert(errorEl, error.message || 'Registration failed');
        btn.disabled = false;
        btn.innerHTML = '<span>Create Account</span>';
    }
}

// Application Core
async function startApplication() {
    console.log('Starting application for:', appState.currentUser.username);

    document.getElementById('authScreen').style.display = 'none';
    document.getElementById('appWrapper').style.display = 'flex';

    updateUserInterface();
    await loadInitialData();

    setupRealtimeSubscriptions();
    startPollingServices();
    
    // Setup event listeners
    setupEventListeners();
}

function setupEventListeners() {
    // Search functionality
    const searchInput = document.getElementById('chatSearch');
    if (searchInput) {
        searchInput.addEventListener('input', debounce(function(e) {
            const term = e.target.value.toLowerCase();
            filterChats(term);
        }, 300));
    }
    
    // Online/offline detection
    window.addEventListener('online', () => {
        updateConnectionStatus(true);
        showToast('Back online', 'success');
    });
    
    window.addEventListener('offline', () => {
        updateConnectionStatus(false);
        showToast('You are offline', 'error');
    });
}

function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

function filterChats(term) {
    const chatCards = document.querySelectorAll('.chat-card');
    chatCards.forEach(card => {
        const name = card.querySelector('.chat-name').textContent.toLowerCase();
        const message = card.querySelector('.chat-message').textContent.toLowerCase();
        card.style.display = (name.includes(term) || message.includes(term)) ? 'flex' : 'none';
    });
}

function updateUserInterface() {
    const user = appState.currentUser;
    if (!user) return;

    const firstLetter = (user.display_name || user.username).charAt(0).toUpperCase();
    document.getElementById('userAvatar').textContent = firstLetter;
    document.getElementById('userName').textContent = user.display_name || user.username;
    document.getElementById('userStatus').textContent = 'Online';

    document.getElementById('profileAvatarLarge').textContent = firstLetter;
    document.getElementById('profileName').textContent = user.display_name || user.username;
    document.getElementById('profileUsername').textContent = '@' + user.username;
}

async function loadInitialData() {
    try {
        await loadAllUsers();
        await loadUserChats();
        updateStatistics();
    } catch (error) {
        console.error('Failed to load initial data:', error);
        showToast('Failed to load data', 'error');
    }
}

// User Management
async function loadAllUsers() {
    try {
        const { data, error } = await appState.supabase
            .from('users')
            .select('*')
            .neq('id', appState.currentUser.id)
            .order('display_name');

        if (error) throw error;

        appState.users = data || [];
        renderContactsList();
    } catch (error) {
        console.error('Failed to load users:', error);
        throw error;
    }
}

async function refreshOnlineUsers() {
    try {
        const { data, error } = await appState.supabase
            .from('users')
            .select('id, last_seen')
            .neq('id', appState.currentUser.id);

        if (error) throw error;

        appState.onlineUsers.clear();
        const now = new Date();

        if (data) {
            data.forEach(user => {
                const lastSeen = new Date(user.last_seen);
                const minutesDiff = (now - lastSeen) / (1000 * 60);
                if (minutesDiff < 3) {
                    appState.onlineUsers.add(user.id);
                }
            });
        }
    } catch (error) {
        console.error('Failed to refresh online users:', error);
    }
}

// Chat Management
async function loadUserChats() {
    try {
        const { data: allMessages, error } = await appState.supabase
            .from('messages')
            .select('*')
            .or(`sender_id.eq.${appState.currentUser.id},receiver_id.eq.${appState.currentUser.id}`)
            .order('created_at', { ascending: false });

        if (error) throw error;

        const chatMap = new Map();

        if (allMessages) {
            allMessages.forEach(msg => {
                const contactId = msg.sender_id === appState.currentUser.id 
                    ? msg.receiver_id 
                    : msg.sender_id;

                if (!chatMap.has(contactId)) {
                    chatMap.set(contactId, {
                        lastMessage: msg,
                        unreadCount: msg.sender_id !== appState.currentUser.id && !msg.read ? 1 : 0,
                        totalMessages: 1
                    });
                } else {
                    const chat = chatMap.get(contactId);
                    if (msg.sender_id !== appState.currentUser.id && !msg.read) {
                        chat.unreadCount++;
                    }
                    chat.totalMessages++;
                }
            });
        }

        renderChatsList(chatMap);
    } catch (error) {
        console.error('Failed to load chats:', error);
        throw error;
    }
}

async function loadChatMessages(contactId) {
    try {
        const { data, error } = await appState.supabase
            .from('messages')
            .select('*')
            .or(`and(sender_id.eq.${appState.currentUser.id},receiver_id.eq.${contactId}),and(sender_id.eq.${contactId},receiver_id.eq.${appState.currentUser.id})`)
            .order('created_at', { ascending: true });

        if (error) throw error;

        appState.messages[contactId] = data || [];
        renderChatMessages();
    } catch (error) {
        console.error('Failed to load messages:', error);
        throw error;
    }
}

async function sendMessage() {
    if (!appState.isOnline) {
        showToast('No internet connection', 'error');
        return;
    }

    const input = document.getElementById('messageInput');
    const message = input.value.trim();

    if (!message || !appState.activeChat) return;

    const btn = document.getElementById('sendBtn');
    btn.disabled = true;
    btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';

    try {
        const newMessage = {
            sender_id: appState.currentUser.id,
            receiver_id: appState.activeChat.id,
            message: message,
            read: false,
            created_at: new Date().toISOString()
        };

        // Optimistic update
        addMessageToChat(newMessage, true);
        input.value = '';
        adjustTextarea(input);

        const { data, error } = await appState.supabase
            .from('messages')
            .insert([newMessage])
            .select()
            .single();

        if (error) throw error;

        if (!appState.messages[appState.activeChat.id]) {
            appState.messages[appState.activeChat.id] = [];
        }
        appState.messages[appState.activeChat.id].push(data);

        playNotification();

    } catch (error) {
        console.error('Failed to send message:', error);
        showToast('Failed to send message', 'error');
    } finally {
        btn.disabled = false;
        btn.innerHTML = '<i class="fas fa-paper-plane"></i>';
        input.focus();
    }
}

// Real-time Subscriptions
function setupRealtimeSubscriptions() {
    appState.subscriptions.forEach(sub => {
        try {
            appState.supabase.removeSubscription(sub);
        } catch (e) {}
    });
    appState.subscriptions = [];

    const messagesSub = appState.supabase
        .channel('messages')
        .on('postgres_changes', {
            event: 'INSERT',
            schema: 'public',
            table: 'messages',
            filter: `receiver_id=eq.${appState.currentUser.id}`
        }, (payload) => {
            handleIncomingMessage(payload.new);
        })
        .subscribe();

    appState.subscriptions.push(messagesSub);
}

function handleIncomingMessage(message) {
    if (appState.activeChat && appState.activeChat.id === message.sender_id) {
        addMessageToChat(message, false);
        
        if (!appState.messages[message.sender_id]) {
            appState.messages[message.sender_id] = [];
        }
        appState.messages[message.sender_id].push(message);
        
        playNotification();
    } else {
        showMessageNotification(message);
        playNotification();
    }
    
    loadUserChats();
}

// Polling
function startPollingServices() {
    if (appState.pollingInterval) clearInterval(appState.pollingInterval);

    appState.pollingInterval = setInterval(async () => {
        if (appState.currentUser && appState.isOnline) {
            await checkForNewMessages();
            await refreshOnlineUsers();
            updateStatistics();
        }
    }, 7000);
}

async function checkForNewMessages() {
    if (!appState.isOnline) return;
    
    try {
        const { data: newMessages, error } = await appState.supabase
            .from('messages')
            .select('*')
            .eq('receiver_id', appState.currentUser.id)
            .eq('read', false)
            .order('created_at', { ascending: true });

        if (error) throw error;

        if (newMessages && newMessages.length > 0) {
            const grouped = {};
            newMessages.forEach(msg => {
                if (!grouped[msg.sender_id]) {
                    grouped[msg.sender_id] = [];
                }
                grouped[msg.sender_id].push(msg);
            });

            for (const senderId in grouped) {
                const messages = grouped[senderId];
                
                if (appState.activeChat && appState.activeChat.id === senderId) {
                    messages.forEach(msg => {
                        if (!appState.messages[senderId] || 
                            !appState.messages[senderId].find(m => m.id === msg.id)) {
                            addMessageToChat(msg, false);
                            if (!appState.messages[senderId]) {
                                appState.messages[senderId] = [];
                            }
                            appState.messages[senderId].push(msg);
                        }
                    });
                } else {
                    showMessageNotification(messages[0]);
                }
            }
            
            await loadUserChats();
        }
    } catch (error) {
        console.error('Failed to check for new messages:', error);
    }
}

// UI Rendering
function renderContactsList() {
    const container = document.getElementById('contactsList');
    if (!container) return;

    if (appState.users.length === 0) {
        container.innerHTML = `
            <div style="text-align: center; padding: 5rem; color: #666;">
                <i class="fas fa-user-plus" style="font-size: 4.8rem; margin-bottom: 1.5rem; color: #ddd;"></i>
                <p style="font-size: 1.6rem; margin-bottom: 0.8rem;">No contacts available</p>
                <p style="font-size: 1.4rem; color: #999;">Other users will appear here</p>
            </div>
        `;
        return;
    }

    container.innerHTML = '';
    appState.users.forEach(user => {
        const isOnline = appState.onlineUsers.has(user.id);
        const firstLetter = (user.display_name || user.username).charAt(0).toUpperCase();
        
        const div = document.createElement('div');
        div.className = 'contact-item';
        div.onclick = () => startChat(user);
        
        div.innerHTML = `
            <div class="contact-avatar">
                ${firstLetter}
            </div>
            <div class="contact-info">
                <div class="contact-name">${escapeHtml(user.display_name || user.username)}</div>
                <div class="contact-status">
                    <span class="status-text">${escapeHtml(user.role || 'User')}</span>
                    ${isOnline ? '<span class="online-dot"></span>' : ''}
                </div>
            </div>
        `;
        
        container.appendChild(div);
    });
}

function renderChatsList(chatMap) {
    const container = document.getElementById('chatsList');
    if (!container) return;

    if (chatMap.size === 0) {
        container.innerHTML = `
            <div style="text-align: center; padding: 5rem; color: #666;">
                <i class="fas fa-comments" style="font-size: 4.8rem; margin-bottom: 1.5rem; color: #ddd;"></i>
                <p style="font-size: 1.6rem; margin-bottom: 0.8rem;">No conversations yet</p>
                <p style="font-size: 1.4rem; color: #999;">Start chatting with contacts</p>
            </div>
        `;
        return;
    }

    container.innerHTML = '';
    
    Array.from(chatMap.entries()).forEach(([contactId, chat]) => {
        const user = appState.users.find(u => u.id === contactId);
        if (!user) return;

        const isOnline = appState.onlineUsers.has(contactId);
        const firstLetter = (user.display_name || user.username).charAt(0).toUpperCase();
        const lastMsg = chat.lastMessage;
        const time = formatTime(lastMsg.created_at);
        const preview = lastMsg.message.length > 35 
            ? lastMsg.message.substring(0, 35) + '...' 
            : lastMsg.message;
        const isFromMe = lastMsg.sender_id === appState.currentUser.id;
        
        const div = document.createElement('div');
        div.className = `chat-card ${chat.unreadCount > 0 ? 'unread' : ''}`;
        div.onclick = () => startChat(user);
        
        div.innerHTML = `
            <div class="chat-avatar">
                ${firstLetter}
            </div>
            <div class="chat-details">
                <div class="chat-header">
                    <div class="chat-name">${escapeHtml(user.display_name || user.username)}</div>
                    <div class="chat-time">${time}</div>
                </div>
                <div class="chat-preview">
                    <div class="chat-message">${isFromMe ? 'You: ' : ''}${escapeHtml(preview)}</div>
                    ${chat.unreadCount > 0 ? 
                        `<div class="chat-badge">${chat.unreadCount}</div>` : ''}
                </div>
            </div>
        `;
        
        container.appendChild(div);
    });
}

function renderChatMessages() {
    const container = document.getElementById('chatMessages');
    if (!container || !appState.activeChat || !appState.messages[appState.activeChat.id]) {
        container.innerHTML = `
            <div style="text-align: center; padding: 5rem; color: #999;">
                <i class="fas fa-comment-dots" style="font-size: 4.8rem; margin-bottom: 1.5rem;"></i>
                <p style="font-size: 1.6rem; margin-bottom: 0.8rem;">Start a conversation</p>
                <p style="font-size: 1.4rem; color: #999;">Send your first message below</p>
            </div>
        `;
        return;
    }

    container.innerHTML = '';
    
    let currentDate = '';
    const messages = appState.messages[appState.activeChat.id];
    
    messages.forEach(msg => {
        const msgDate = formatDate(msg.created_at);
        if (msgDate !== currentDate) {
            const dateDiv = document.createElement('div');
            dateDiv.style.textAlign = 'center';
            dateDiv.style.margin = '2rem 0';
            dateDiv.style.color = '#999';
            dateDiv.style.fontSize = '1.3rem';
            dateDiv.style.fontWeight = '500';
            dateDiv.textContent = msgDate;
            container.appendChild(dateDiv);
            currentDate = msgDate;
        }
        
        addMessageToChat(msg, false);
    });

    setTimeout(() => {
        container.scrollTop = container.scrollHeight;
    }, 100);
}

function addMessageToChat(message, isOptimistic) {
    const container = document.getElementById('chatMessages');
    if (!container) return;

    // Remove placeholder if exists
    const placeholder = container.querySelector('div[style*="text-align: center"]');
    if (placeholder && container.children.length > 1) {
        placeholder.remove();
    }

    const isSent = message.sender_id === appState.currentUser.id;
    const time = formatTime(message.created_at);
    
    const groupDiv = document.createElement('div');
    groupDiv.className = `message-group ${isSent ? 'sent' : 'received'}`;
    if (isOptimistic) {
        groupDiv.style.opacity = '0.7';
    }
    
    groupDiv.innerHTML = `
        <div class="message">
            ${escapeHtml(message.message)}
            <div class="message-time">${time}</div>
        </div>
    `;
    
    container.appendChild(groupDiv);
    
    // Scroll to bottom
    setTimeout(() => {
        container.scrollTop = container.scrollHeight;
    }, 50);
}

function startChat(user) {
    appState.activeChat = user;
    
    const firstLetter = (user.display_name || user.username).charAt(0).toUpperCase();
    document.getElementById('chatUserAvatar').textContent = firstLetter;
    document.getElementById('chatUserName').textContent = user.display_name || user.username;
    
    const isOnline = appState.onlineUsers.has(user.id);
    document.getElementById('chatUserStatus').textContent = isOnline ? 'Online' : 'Offline';
    const statusDot = document.querySelector('.chat-user-status .status-dot');
    if (statusDot) {
        statusDot.style.display = isOnline ? 'block' : 'none';
    }
    
    // Enable input
    document.getElementById('messageInput').disabled = false;
    document.getElementById('sendBtn').disabled = false;
    
    // Load messages
    loadChatMessages(user.id);
    
    // Switch to chat page
    showPage('chatPage');
    
    // Focus input after a short delay
    setTimeout(() => {
        const input = document.getElementById('messageInput');
        if (input) input.focus();
    }, 300);
}

function updateStatistics() {
    const chatCount = Object.keys(appState.messages).length;
    const contactCount = appState.users.length;
    const onlineCount = appState.onlineUsers.size;
    
    document.getElementById('chatsCount').textContent = chatCount;
    document.getElementById('contactsCount').textContent = contactCount;
    document.getElementById('onlineCount').textContent = onlineCount;
}

// Utilities
function formatTime(dateString) {
    try {
        const date = new Date(dateString);
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch {
        return '--:--';
    }
}

function formatDate(dateString) {
    try {
        const date = new Date(dateString);
        const now = new Date();
        const diffDays = Math.floor((now - date) / (1000 * 60 * 60 * 24));
        
        if (diffDays === 0) return 'Today';
        if (diffDays === 1) return 'Yesterday';
        if (diffDays < 7) return date.toLocaleDateString([], { weekday: 'long' });
        
        return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
    } catch {
        return '';
    }
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function adjustTextarea(textarea) {
    textarea.style.height = 'auto';
    const newHeight = Math.min(textarea.scrollHeight, 120);
    textarea.style.height = newHeight + 'px';
}

function checkSendKey(event) {
    if (event.key === 'Enter' && !event.shiftKey) {
        event.preventDefault();
        sendMessage();
    }
}

function playNotification() {
    try {
        const audio = document.getElementById('notificationAudio');
        if (audio) {
            audio.currentTime = 0;
            audio.play().catch(() => {});
        }
    } catch (error) {
        console.error('Failed to play notification:', error);
    }
}

function showMessageNotification(message) {
    const sender = appState.users.find(u => u.id === message.sender_id);
    if (sender) {
        const preview = message.message.length > 40 
            ? message.message.substring(0, 40) + '...' 
            : message.message;
        showToast(`New message from ${sender.display_name || sender.username}: ${preview}`, 'info');
    }
}

function showAlert(element, message) {
    if (!element) return;
    element.textContent = message;
    element.style.display = 'block';
    setTimeout(() => {
        element.style.display = 'none';
    }, 5000);
}

function showToast(message, type = 'info') {
    const container = document.getElementById('toastContainer');
    if (!container) return;
    
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.innerHTML = `
        <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle'}"></i>
        <span>${escapeHtml(message)}</span>
    `;
    
    container.appendChild(toast);
    
    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transform = 'translateY(-1rem)';
        setTimeout(() => {
            if (toast.parentNode === container) {
                container.removeChild(toast);
            }
        }, 300);
    }, 4000);
}

function hideLoader() {
    const loader = document.getElementById('loader');
    if (loader) {
        loader.style.display = 'none';
    }
}

// Navigation
function showPage(pageId) {
    // Hide all pages
    document.querySelectorAll('.page').forEach(page => {
        page.classList.remove('active');
    });
    
    // Show selected page
    const page = document.getElementById(pageId);
    if (page) {
        page.classList.add('active');
    }
    
    // Update nav buttons
    document.querySelectorAll('.nav-item').forEach(btn => {
        btn.classList.remove('active');
    });
    
    if (pageId === 'chatsPage') {
        document.querySelectorAll('.nav-item')[0]?.classList.add('active');
    } else if (pageId === 'contactsPage') {
        document.querySelectorAll('.nav-item')[1]?.classList.add('active');
    } else if (pageId === 'profilePage') {
        document.querySelectorAll('.nav-item')[2]?.classList.add('active');
    }
    
    // Reset chat search if leaving chats page
    if (pageId !== 'chatsPage') {
        const search = document.getElementById('chatSearch');
        if (search) search.value = '';
    }
}

function goBackToChats() {
    showPage('chatsPage');
    appState.activeChat = null;
    
    // Disable message input
    const messageInput = document.getElementById('messageInput');
    if (messageInput) {
        messageInput.disabled = true;
        messageInput.value = '';
        adjustTextarea(messageInput);
    }
    
    const sendBtn = document.getElementById('sendBtn');
    if (sendBtn) {
        sendBtn.disabled = true;
    }
}

function toggleDarkMode() {
    const body = document.body;
    body.classList.toggle('dark-mode');
    localStorage.setItem('theme', body.classList.contains('dark-mode') ? 'dark' : 'light');
}

// Check saved theme
function loadTheme() {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
        document.body.classList.add('dark-mode');
    }
}

// Initialize theme
loadTheme();

// Placeholder functions
function startCall() {
    if (!appState.activeChat) {
        showToast('Select a contact to call', 'error');
        return;
    }
    
    showToast(`Calling ${appState.activeChat.display_name || appState.activeChat.username}...`, 'info');
}

function showNotifications() {
    showToast('No new notifications', 'info');
}

// Logout
function confirmLogout() {
    // Simple logout confirmation
    if (confirm('Are you sure you want to logout?')) {
        performLogout();
    }
}

async function performLogout() {
    try {
        showToast('Logging out...', 'info');

        if (appState.pollingInterval) {
            clearInterval(appState.pollingInterval);
        }

        appState.subscriptions.forEach(sub => {
            try {
                appState.supabase.removeSubscription(sub);
            } catch (error) {}
        });

        appState.currentUser = null;
        appState.activeChat = null;
        appState.users = [];
        appState.messages = {};
        appState.onlineUsers.clear();

        clearSession();

        setTimeout(() => {
            showAuthScreen();
            showToast('Logged out successfully', 'success');
        }, 500);

    } catch (error) {
        console.error('Logout error:', error);
        showToast('Logout failed. Please try again.', 'error');
    }
}

console.log('QuickChat Messenger initialized successfully');