// ==================== CONFIGURATION ====================
const CONFIG = {
    APP_ID: 'kve_video_platform_v5.0',
    ENCRYPTION_KEY: 'KVE_Secure_Device_Locked_Password_System_2024',
    DEVICE_ID_KEY: 'kve_secure_device_id',
    PASSWORD_STORAGE_KEY: 'kve_device_password_data',
    VIDEO_CACHE_KEY: 'kve_video_cache',
    STORAGE_LOCATION_KEY: 'kve_storage_location',
    CACHE_EXPIRY_DAYS: 3,
    CUSTOM_IMAGE_URL: 'https://res.cloudinary.com/zaumaran/image/upload/v1764932924/Kachin_Vision_Empire_For_Logo_zpkdbg.png'
};

const firebaseConfig = {
    apiKey: "AIzaSyCJGR8dXeawpg6RNpF1iUC7TD65RWm-oxE",
    authDomain: "sun-day-video-production-298c8.firebaseapp.com",
    projectId: "sun-day-video-production-298c8",
    storageBucket: "sun-day-video-production-298c8.firebasestorage.app",
    messagingSenderId: "927333523323",
    appId: "1:927333523323:web:16375e95732c5acb4767de",
    measurementId: "G-ZY2Y2Y749H"
};

// ==================== APP STATE ====================
let videos = [];
let stories = [];
let contactLinks = [];
let passwords = [];
let unlockedVideos = new Set();
let currentStory = null;
let isOnline = true;
let currentVideoToUnlock = null;
let deviceId = null;
let devicePasswordData = null;
let isPasswordVisible = false;
let isVideoPasswordVisible = false;
let passwordSectionHoverTimer = null;
let passwordSectionExpanded = false;

// Video optimization state
let networkQuality = 'good';
let currentQuality = 'auto';
let videoBufferSize = 0;
let isBuffering = false;
let bufferingTimeout = null;
let lastPlayTime = 0;

// Preloading state
let isPreloading = false;
let preloadedVideos = new Set();
let preloadQueue = [];
let preloadProgress = {};
let cachedVideos = {};

// Storage state
let storageLocation = 'default';
let storagePath = '';
let storageFolder = 'KVE_Videos';
let isStorageInitialized = false;

// Sorting state
let currentSortMode = 'name_asc'; // Default: Sort by name A-Z

// Scroll and touch state (အရေးကြီး: Scroll နဲ့ Tap ကို ခွဲခြားရန်)
let isScrolling = false;
let scrollTimeout = null;
let touchStartTime = 0;
let touchStartY = 0;
let touchStartX = 0;
let isTouchMove = false;
const SCROLL_THRESHOLD = 10; // pixels
const TAP_THRESHOLD = 200; // milliseconds

// ==================== DOM ELEMENTS ====================
const screens = document.querySelectorAll('.screen');
const loadingOverlay = document.getElementById('loadingOverlay');
const loadingText = document.getElementById('loadingText');
const connectionStatus = document.getElementById('connectionStatus');
const toast = document.getElementById('toast');
const passwordIndicator = document.getElementById('passwordIndicator');
const deviceInfoDisplay = document.getElementById('deviceInfoDisplay');
const deviceIdShort = document.getElementById('deviceIdShort');
const deviceInfo = document.getElementById('deviceInfo');
const storageInfo = document.getElementById('storageInfo');
const storageText = document.getElementById('storageText');
const storageLocationEl = document.getElementById('storageLocation');
const locationPath = document.getElementById('locationPath');
const storageSelection = document.getElementById('storageSelection');

// Stories menu
const storiesToggle = document.getElementById('storiesToggle');
const storiesMenu = document.getElementById('storiesMenu');
const storyList = document.getElementById('storyList');

// Password section
const passwordSection = document.getElementById('passwordSection');
const passwordInput = document.getElementById('passwordInput');
const passwordToggle = document.getElementById('passwordToggle');
const unlockBtn = document.getElementById('unlockBtn');
const passwordStatus = document.getElementById('passwordStatus');

// Video elements
const videoPlayer = document.getElementById('videoPlayer');
const defaultImage = document.getElementById('defaultImage');
const appImage = document.getElementById('appImage');
const videoList = document.getElementById('videoList');
const fullscreenBtn = document.getElementById('fullscreenBtn');
const bufferingIndicator = document.getElementById('bufferingIndicator');
const qualitySelector = document.getElementById('qualitySelector');
const qualityButtons = document.querySelectorAll('.quality-btn');

// Preloading elements
const preloadProgressEl = document.getElementById('preloadProgress');
const preloadProgressFill = document.getElementById('preloadProgressFill');
const preloadProgressText = document.getElementById('preloadProgressText');
const preloadProgressList = document.getElementById('preloadProgressList');
const closePreloadProgress = document.getElementById('closePreloadProgress');
const preloadBtn = document.getElementById('preloadBtn');

// Navigation
const contactBtn = document.getElementById('contactBtn');
const refreshBtn = document.getElementById('refreshBtn');
const logoutBtn = document.getElementById('logoutBtn');
const optimizeBtn = document.getElementById('optimizeBtn');
const storageBtn = document.getElementById('storageBtn');
const backButton = document.getElementById('backButton');
const backToMain = document.getElementById('backToMain');

// Modals
const videoPasswordModal = document.getElementById('videoPasswordModal');
const videoPassword = document.getElementById('videoPassword');
const videoPasswordToggle = document.getElementById('videoPasswordToggle');
const submitVideoPassword = document.getElementById('submitVideoPassword');
const cancelVideoPassword = document.getElementById('cancelVideoPassword');
const videoPasswordStatus = document.getElementById('videoPasswordStatus');
const noInternetModal = document.getElementById('noInternetModal');
const retryConnectionBtn = document.getElementById('retryConnectionBtn');
const passwordResetModal = document.getElementById('passwordResetModal');
const confirmPasswordReset = document.getElementById('confirmPasswordReset');
const storageModal = document.getElementById('storageModal');

// Storage buttons
const selectDefaultStorage = document.getElementById('selectDefaultStorage');
const selectLocalStorage = document.getElementById('selectLocalStorage');
const selectSDCard = document.getElementById('selectSDCard');
const selectCustomStorage = document.getElementById('selectCustomStorage');

// Lists
const contactList = document.getElementById('contactList');

// ==================== SCROLL AND TOUCH HANDLING ====================
// အရေးကြီး: Scroll နဲ့ Tap ကို ခွဲခြားရန် Function
function setupScrollAndTouchHandling() {
    if (!videoList) return;
    
    // Touch start event - ဘယ်နေရာကို စနှိပ်သလဲ
    videoList.addEventListener('touchstart', function(e) {
        touchStartTime = Date.now();
        touchStartY = e.touches[0].clientY;
        touchStartX = e.touches[0].clientX;
        isTouchMove = false;
        
        // Scroll လုပ်နေကြောင်း အမှတ်အသားပြု
        this.classList.add('scrolling');
        isScrolling = true;
        
        // Scroll timeout ကို ရှင်းလင်း
        if (scrollTimeout) {
            clearTimeout(scrollTimeout);
        }
        
        // Scroll ရပ်သွားရင် ပြန်ဖွင့်ရန်
        scrollTimeout = setTimeout(function() {
            videoList.classList.remove('scrolling');
            isScrolling = false;
        }, 100);
    }, { passive: true });
    
    // Touch move event - ရွေ့လျားနေလား
    videoList.addEventListener('touchmove', function(e) {
        const currentY = e.touches[0].clientY;
        const currentX = e.touches[0].clientX;
        
        // Scroll လုပ်နေကြောင်း စစ်ဆေး
        const deltaY = Math.abs(currentY - touchStartY);
        const deltaX = Math.abs(currentX - touchStartX);
        
        if (deltaY > SCROLL_THRESHOLD || deltaX > SCROLL_THRESHOLD) {
            isTouchMove = true;
            isScrolling = true;
            this.classList.add('scrolling');
            
            // Scroll timeout ကို ရှင်းလင်း
            if (scrollTimeout) {
                clearTimeout(scrollTimeout);
            }
            
            // Scroll ရပ်သွားရင် ပြန်ဖွင့်ရန်
            scrollTimeout = setTimeout(function() {
                videoList.classList.remove('scrolling');
                isScrolling = false;
            }, 150);
        }
    }, { passive: true });
    
    // Touch end event - Tap လား Scroll လား
    videoList.addEventListener('touchend', function(e) {
        const touchEndTime = Date.now();
        const touchDuration = touchEndTime - touchStartTime;
        
        // Scroll timeout ကို ရှင်းလင်း
        if (scrollTimeout) {
            clearTimeout(scrollTimeout);
        }
        
        // Scroll ရပ်သွားရင် ပြန်ဖွင့်ရန်
        scrollTimeout = setTimeout(function() {
            videoList.classList.remove('scrolling');
            isScrolling = false;
        }, 100);
        
        // Scroll လုပ်နေရင် tap ကို ignore လုပ်မယ်
        if (isTouchMove || isScrolling) {
            e.preventDefault();
            return;
        }
        
        // Tap duration စစ်ဆေး
        if (touchDuration > TAP_THRESHOLD) {
            return; // Long press, ignore
        }
        
        // ဘယ် video item ကို နှိပ်သလဲ စစ်ဆေး
        const target = e.target;
        const videoItem = target.closest('.video-item');
        
        if (videoItem && !videoItem.classList.contains('scrolling')) {
            // နှိပ်တဲ့ element က play button လား စစ်ဆေး
            const playButton = target.closest('.action-btn.play');
            
            if (playButton) {
                // Play button ကို သီးသန့်နှိပ်တာ
                e.preventDefault();
                e.stopPropagation();
                handlePlayButtonClick(videoItem, playButton);
            } else {
                // Video item ကို နှိပ်တာ
                e.preventDefault();
                e.stopPropagation();
                handleVideoItemClick(videoItem);
            }
        }
    }, { passive: false });
    
    // Click event ကိုလည်း handle လုပ်မယ်
    videoList.addEventListener('click', function(e) {
        if (isScrolling) {
            e.preventDefault();
            e.stopPropagation();
            return;
        }
        
        const target = e.target;
        const videoItem = target.closest('.video-item');
        
        if (videoItem) {
            const playButton = target.closest('.action-btn.play');
            
            if (playButton) {
                e.preventDefault();
                e.stopPropagation();
                handlePlayButtonClick(videoItem, playButton);
            } else if (!target.closest('.video-actions')) {
                e.preventDefault();
                e.stopPropagation();
                handleVideoItemClick(videoItem);
            }
        }
    });
    
    // Scroll event listener
    videoList.addEventListener('scroll', function() {
        isScrolling = true;
        this.classList.add('scrolling');
        
        if (scrollTimeout) {
            clearTimeout(scrollTimeout);
        }
        
        scrollTimeout = setTimeout(function() {
            videoList.classList.remove('scrolling');
            isScrolling = false;
        }, 150);
    });
}

// Play button click handler
function handlePlayButtonClick(videoItem, playButton) {
    if (isScrolling) return;
    
    const videoId = playButton.getAttribute('data-id');
    const video = videos.find(v => v.id === videoId);
    
    if (!video) return;
    
    const isFree = video.passwordType === 'free';
    const isUnlocked = isFree || unlockedVideos.has(video.id) || 
                     (video.storyName && unlockedVideos.has(video.storyName));
    
    if (!isUnlocked) {
        if (video.passwordType === 'password') {
            currentVideoToUnlock = video;
            showVideoPasswordModal();
        } else {
            showToast('Password required', 'error');
        }
    } else {
        playVideo(video);
    }
}

// Video item click handler
function handleVideoItemClick(videoItem) {
    if (isScrolling) return;
    
    // Video item ထဲမှာ play button ကို ရှာမယ်
    const playButton = videoItem.querySelector('.action-btn.play');
    if (playButton) {
        handlePlayButtonClick(videoItem, playButton);
    }
}

// ==================== SORTING FUNCTIONS ====================
function sortVideosByNameAsc(a, b) {
    return a.name.localeCompare(b.name);
}

function sortVideosByNameDesc(a, b) {
    return b.name.localeCompare(a.name);
}

function sortVideosByStoryAsc(a, b) {
    if (a.storyName && b.storyName) {
        return a.storyName.localeCompare(b.storyName);
    }
    return a.name.localeCompare(b.name);
}

function sortVideosByStoryDesc(a, b) {
    if (a.storyName && b.storyName) {
        return b.storyName.localeCompare(a.storyName);
    }
    return b.name.localeCompare(a.name);
}

function extractStoryNumber(storyName) {
    if (!storyName) return 0;
    const match = storyName.match(/\d+/);
    return match ? parseInt(match[0]) : 0;
}

function sortVideosByStoryNumberAsc(a, b) {
    const numA = extractStoryNumber(a.storyName);
    const numB = extractStoryNumber(b.storyName);
    return numA - numB;
}

function sortVideosByStoryNumberDesc(a, b) {
    const numA = extractStoryNumber(a.storyName);
    const numB = extractStoryNumber(b.storyName);
    return numB - numA;
}

function applySorting(videosArray) {
    const sortedVideos = [...videosArray];
    
    switch(currentSortMode) {
        case 'name_asc':
            sortedVideos.sort(sortVideosByNameAsc);
            break;
        case 'name_desc':
            sortedVideos.sort(sortVideosByNameDesc);
            break;
        case 'story_asc':
            sortedVideos.sort(sortVideosByStoryAsc);
            break;
        case 'story_desc':
            sortedVideos.sort(sortVideosByStoryDesc);
            break;
        case 'story_number_asc':
            sortedVideos.sort(sortVideosByStoryNumberAsc);
            break;
        case 'story_number_desc':
            sortedVideos.sort(sortVideosByStoryNumberDesc);
            break;
        default:
            sortedVideos.sort(sortVideosByNameAsc);
    }
    
    return sortedVideos;
}

function addSortingUI() {
    const videoListTitle = document.querySelector('.video-list-title');
    
    // Create sorting dropdown
    const sortContainer = document.createElement('div');
    sortContainer.className = 'sort-container';
    sortContainer.style.position = 'relative';
    sortContainer.style.display = 'inline-block';
    sortContainer.style.marginLeft = '10px';
    
    // Sort button
    const sortButton = document.createElement('button');
    sortButton.className = 'sort-button';
    sortButton.innerHTML = '<i class="fas fa-sort"></i> Sort';
    sortButton.style.background = 'rgba(255, 153, 0, 0.2)';
    sortButton.style.color = '#ff9900';
    sortButton.style.border = '1px solid rgba(255, 153, 0, 0.3)';
    sortButton.style.padding = '4px 8px';
    sortButton.style.borderRadius = '4px';
    sortButton.style.fontSize = '10px';
    sortButton.style.cursor = 'pointer';
    sortButton.style.display = 'flex';
    sortButton.style.alignItems = 'center';
    sortButton.style.gap = '5px';
    
    // Sort dropdown menu
    const sortDropdown = document.createElement('div');
    sortDropdown.className = 'sort-dropdown';
    sortDropdown.style.display = 'none';
    sortDropdown.style.position = 'absolute';
    sortDropdown.style.top = '100%';
    sortDropdown.style.left = '0';
    sortDropdown.style.background = 'rgba(15, 20, 40, 0.95)';
    sortDropdown.style.border = '1px solid rgba(255, 153, 0, 0.3)';
    sortDropdown.style.borderRadius = '6px';
    sortDropdown.style.padding = '8px';
    sortDropdown.style.zIndex = '1000';
    sortDropdown.style.minWidth = '180px';
    sortDropdown.style.backdropFilter = 'blur(10px)';
    sortDropdown.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.3)';
    
    // Sort options
    const sortOptions = [
        { id: 'name_asc', label: 'Sort by Name (A-Z)', icon: 'fa-sort-alpha-down' },
        { id: 'name_desc', label: 'Sort by Name (Z-A)', icon: 'fa-sort-alpha-down-alt' },
        { id: 'story_asc', label: 'Sort by Story (A-Z)', icon: 'fa-book' },
        { id: 'story_desc', label: 'Sort by Story (Z-A)', icon: 'fa-book' },
        { id: 'story_number_asc', label: 'Sort by Story (1-100)', icon: 'fa-sort-numeric-down' },
        { id: 'story_number_desc', label: 'Sort by Story (100-1)', icon: 'fa-sort-numeric-down-alt' }
    ];
    
    sortOptions.forEach(option => {
        const optionElement = document.createElement('div');
        optionElement.className = 'sort-option';
        optionElement.dataset.sort = option.id;
        optionElement.innerHTML = `
            <i class="fas ${option.icon}"></i>
            <span>${option.label}</span>
        `;
        optionElement.style.padding = '6px 8px';
        optionElement.style.borderRadius = '4px';
        optionElement.style.cursor = 'pointer';
        optionElement.style.display = 'flex';
        optionElement.style.alignItems = 'center';
        optionElement.style.gap = '8px';
        optionElement.style.fontSize = '11px';
        optionElement.style.transition = 'all 0.2s ease';
        
        // Active state
        if (option.id === currentSortMode) {
            optionElement.style.background = 'rgba(255, 153, 0, 0.2)';
            optionElement.style.color = '#ff9900';
        } else {
            optionElement.style.background = 'transparent';
            optionElement.style.color = '#f0f8ff';
        }
        
        // Hover effect
        optionElement.addEventListener('mouseenter', () => {
            if (option.id !== currentSortMode) {
                optionElement.style.background = 'rgba(255, 153, 0, 0.1)';
            }
        });
        
        optionElement.addEventListener('mouseleave', () => {
            if (option.id !== currentSortMode) {
                optionElement.style.background = 'transparent';
            }
        });
        
        // Click event
        optionElement.addEventListener('click', () => {
            currentSortMode = option.id;
            renderVideoList();
            sortDropdown.style.display = 'none';
            sortButton.innerHTML = `<i class="fas ${option.icon}"></i> ${option.label.split(' ')[0]}`;
        });
        
        // Touch event for mobile
        optionElement.addEventListener('touchend', (e) => {
            e.preventDefault();
            e.stopPropagation();
            currentSortMode = option.id;
            renderVideoList();
            sortDropdown.style.display = 'none';
            sortButton.innerHTML = `<i class="fas ${option.icon}"></i> ${option.label.split(' ')[0]}`;
        });
        
        sortDropdown.appendChild(optionElement);
    });
    
    // Toggle dropdown
    sortButton.addEventListener('click', (e) => {
        e.stopPropagation();
        sortDropdown.style.display = sortDropdown.style.display === 'none' ? 'block' : 'none';
    });
    
    sortButton.addEventListener('touchend', (e) => {
        e.preventDefault();
        e.stopPropagation();
        sortDropdown.style.display = sortDropdown.style.display === 'none' ? 'block' : 'none';
    });
    
    // Close dropdown when clicking outside
    document.addEventListener('click', (e) => {
        if (!sortContainer.contains(e.target)) {
            sortDropdown.style.display = 'none';
        }
    });
    
    document.addEventListener('touchstart', (e) => {
        if (!sortContainer.contains(e.target)) {
            sortDropdown.style.display = 'none';
        }
    });
    
    // Assemble UI
    sortContainer.appendChild(sortButton);
    sortContainer.appendChild(sortDropdown);
    videoListTitle.appendChild(sortContainer);
}

// ==================== INITIALIZATION ====================
async function initApp() {
    showLoading('Initializing Secure Video Platform...');
    
    try {
        // Check internet connection first
        if (!navigator.onLine) {
            hideLoading();
            noInternetModal.style.display = 'flex';
            return;
        }
        
        // Initialize Firebase
        firebase.initializeApp(firebaseConfig);
        
        // Generate or get secure device ID
        deviceId = getSecureDeviceId();
        updateDeviceInfoDisplay();
        
        // Load custom image
        loadCustomImage();
        
        // Setup storage system
        await setupStorageSystem();
        
        // Load cached videos
        loadCachedVideos();
        
        // Setup event listeners
        setupEventListeners();
        
        // Setup video optimization
        optimizeVideoPlayback();
        
        // Check connection
        updateConnectionStatus();
        
        // Monitor network quality
        monitorNetworkQuality();
        
        // Load all data
        await Promise.all([
            loadVideos(),
            loadPasswords(),
            loadContactLinks()
        ]);
        
        // Check for existing device password
        checkDevicePassword();
        
        // Render UI
        renderStoryList();
        renderVideoList();
        renderContactList();
        
        // Setup password section hover behavior
        setupPasswordSectionHover();
        
        // Add sorting UI
        addSortingUI();
        
        // Setup scroll and touch handling (အရေးကြီး)
        setupScrollAndTouchHandling();
        
        // Start auto-preloading
        startAutoPreloading();
        
        // Hide loading
        setTimeout(() => {
            hideLoading();
            showToast('Secure Video Platform Ready', 'success');
        }, 1000);
        
    } catch (error) {
        console.error('Initialization error:', error);
        hideLoading();
        showToast('Initialization failed. Please check your connection.', 'error');
    }
}

// ==================== STORAGE SYSTEM ====================
async function setupStorageSystem() {
    // Load saved storage location
    const savedLocation = localStorage.getItem(CONFIG.STORAGE_LOCATION_KEY);
    if (savedLocation) {
        storageLocation = savedLocation;
    }
    
    // Setup storage path based on location
    await setupStoragePath();
    
    // Update UI
    updateStorageLocationDisplay();
}

async function setupStoragePath() {
    try {
        switch(storageLocation) {
            case 'default':
                storagePath = '';
                locationPath.textContent = 'Default App Storage';
                break;
                
            case 'local':
                // Try to use local storage
                if (typeof window.requestFileSystem === 'undefined' && 
                    typeof window.webkitRequestFileSystem === 'undefined') {
                    // Fallback to default
                    storageLocation = 'default';
                    storagePath = '';
                    localStorage.setItem(CONFIG.STORAGE_LOCATION_KEY, 'default');
                    showToast('Local storage not available, using default', 'info');
                } else {
                    try {
                        // Request local file system
                        const requestFileSystem = window.requestFileSystem || window.webkitRequestFileSystem;
                        storagePath = 'local://KVE_Videos/';
                        locationPath.textContent = 'Local Device Storage';
                    } catch (error) {
                        console.error('Local storage error:', error);
                        storageLocation = 'default';
                        storagePath = '';
                        localStorage.setItem(CONFIG.STORAGE_LOCATION_KEY, 'default');
                    }
                }
                break;
                
            case 'sd':
                // Check for SD card support
                if (typeof window.requestFileSystem === 'undefined' && 
                    typeof window.webkitRequestFileSystem === 'undefined') {
                    storageLocation = 'default';
                    storagePath = '';
                    localStorage.setItem(CONFIG.STORAGE_LOCATION_KEY, 'default');
                    showToast('SD card storage not available', 'info');
                } else {
                    try {
                        // Try to access external storage
                        storagePath = 'external://KVE_Videos/';
                        locationPath.textContent = 'SD Card Storage';
                    } catch (error) {
                        console.error('SD card error:', error);
                        storageLocation = 'local';
                        await setupStoragePath(); // Fallback to local
                    }
                }
                break;
                
            case 'custom':
                // Custom path will be set by user
                const customPath = localStorage.getItem('kve_custom_storage_path');
                if (customPath) {
                    storagePath = customPath;
                    locationPath.textContent = `Custom: ${customPath}`;
                } else {
                    storageLocation = 'default';
                    storagePath = '';
                    localStorage.setItem(CONFIG.STORAGE_LOCATION_KEY, 'default');
                }
                break;
        }
        
        isStorageInitialized = true;
        
    } catch (error) {
        console.error('Storage setup error:', error);
        storageLocation = 'default';
        storagePath = '';
        localStorage.setItem(CONFIG.STORAGE_LOCATION_KEY, 'default');
        locationPath.textContent = 'Default App Storage';
        isStorageInitialized = true;
    }
}

function updateStorageLocationDisplay() {
    if (isStorageInitialized) {
        storageLocationEl.style.display = 'flex';
        
        // Update path display
        let displayPath = '';
        switch(storageLocation) {
            case 'default': displayPath = 'Default App Storage'; break;
            case 'local': displayPath = 'Local Device Storage'; break;
            case 'sd': displayPath = 'SD Card Storage'; break;
            case 'custom': 
                const customPath = localStorage.getItem('kve_custom_storage_path') || 'Custom Folder';
                displayPath = `Custom: ${customPath}`;
                break;
        }
        
        locationPath.textContent = displayPath;
    }
}

function showStorageSelection() {
    storageSelection.classList.toggle('active');
}

async function selectStorage(type) {
    storageLocation = type;
    localStorage.setItem(CONFIG.STORAGE_LOCATION_KEY, type);
    
    // Setup new storage path
    await setupStoragePath();
    
    // Update display
    updateStorageLocationDisplay();
    
    // Close selection
    storageSelection.classList.remove('active');
    
    showToast(`Storage location set to ${type}`, 'success');
}

async function selectCustomStorageLocation() {
    try {
        // For Android, we can use file picker API
        if (window.showOpenFilePicker) {
            const handle = await window.showDirectoryPicker();
            const path = handle.name;
            
            localStorage.setItem('kve_custom_storage_path', path);
            await selectStorage('custom');
            
        } else {
            // Fallback for browsers without file picker API
            const path = prompt('Enter custom storage path:', 'KVE_Videos');
            if (path) {
                localStorage.setItem('kve_custom_storage_path', path);
                await selectStorage('custom');
            }
        }
    } catch (error) {
        console.error('Custom storage selection error:', error);
        showToast('Cannot access custom storage location', 'error');
    }
}

// ==================== PRELOADING SYSTEM ====================
function startAutoPreloading() {
    if (!navigator.onLine || videos.length === 0) return;
    
    // Start preloading after a short delay
    setTimeout(() => {
        startPreloading();
    }, 3000);
}

function startPreloading() {
    if (isPreloading) return;
    
    isPreloading = true;
    preloadProgressEl.style.display = 'block';
    preloadQueue = [...videos];
    preloadProgress = {};
    
    // Initialize progress for each video
    videos.forEach(video => {
        preloadProgress[video.id] = {
            name: video.name,
            progress: 0,
            isCached: preloadedVideos.has(video.id)
        };
    });
    
    updatePreloadProgressDisplay();
    showToast('Started preloading videos', 'info');
    
    // Start preloading in batches (3 at a time)
    preloadBatch(0, 3);
}

function preloadBatch(startIndex, batchSize) {
    const endIndex = Math.min(startIndex + batchSize, preloadQueue.length);
    
    for (let i = startIndex; i < endIndex; i++) {
        const video = preloadQueue[i];
        if (!preloadedVideos.has(video.id)) {
            preloadVideo(video);
        }
    }
    
    // Continue with next batch if needed
    if (endIndex < preloadQueue.length) {
        setTimeout(() => {
            preloadBatch(endIndex, batchSize);
        }, 2000);
    }
}

async function preloadVideo(video) {
    if (preloadedVideos.has(video.id)) return;
    
    try {
        // Create video element for preloading
        const preloadVideo = document.createElement('video');
        preloadVideo.preload = 'auto';
        preloadVideo.crossOrigin = 'anonymous';
        
        // Track progress
        let loaded = 0;
        let total = 0;
        
        preloadVideo.addEventListener('progress', () => {
            if (preloadVideo.buffered.length > 0) {
                loaded = preloadVideo.buffered.end(0);
                total = preloadVideo.duration || 1;
                
                const progress = Math.min((loaded / total) * 100, 99);
                preloadProgress[video.id].progress = progress;
                updatePreloadProgressDisplay();
            }
        });
        
        preloadVideo.addEventListener('canplaythrough', () => {
            preloadProgress[video.id].progress = 100;
            preloadedVideos.add(video.id);
            cacheVideo(video, preloadVideo);
            updatePreloadProgressDisplay();
            updateStorageInfo();
            
            if (isPreloadingComplete()) {
                finishPreloading();
            }
        });
        
        preloadVideo.addEventListener('error', () => {
            preloadProgress[video.id].progress = -1; // Error
            updatePreloadProgressDisplay();
        });
        
        // Start loading
        preloadVideo.src = video.url;
        preloadVideo.load();
        
    } catch (error) {
        console.error('Preloading error:', error);
        preloadProgress[video.id].progress = -1;
        updatePreloadProgressDisplay();
    }
}

function cacheVideo(video, videoElement) {
    const cacheKey = `video_cache_${video.id}`;
    const cacheData = {
        id: video.id,
        name: video.name,
        url: video.url,
        timestamp: Date.now(),
        duration: videoElement.duration || 0
    };
    
    try {
        localStorage.setItem(cacheKey, JSON.stringify(cacheData));
        cachedVideos[video.id] = cacheData;
        updateStorageInfo();
    } catch (error) {
        console.error('Cache error:', error);
        // Clear old caches if storage is full
        cleanupOldCache();
    }
}

function loadCachedVideos() {
    const now = Date.now();
    const expiryTime = CONFIG.CACHE_EXPIRY_DAYS * 24 * 60 * 60 * 1000;
    
    for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key.startsWith('video_cache_')) {
            try {
                const cacheData = JSON.parse(localStorage.getItem(key));
                
                // Check if cache is expired
                if (now - cacheData.timestamp > expiryTime) {
                    localStorage.removeItem(key);
                    continue;
                }
                
                cachedVideos[cacheData.id] = cacheData;
                preloadedVideos.add(cacheData.id);
            } catch (error) {
                console.error('Cache load error:', error);
                localStorage.removeItem(key);
            }
        }
    }
    
    updateStorageInfo();
}

function cleanupOldCache() {
    const now = Date.now();
    const expiryTime = CONFIG.CACHE_EXPIRY_DAYS * 24 * 60 * 60 * 1000;
    let freedSpace = 0;
    
    for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key.startsWith('video_cache_')) {
            try {
                const cacheData = JSON.parse(localStorage.getItem(key));
                if (now - cacheData.timestamp > expiryTime) {
                    localStorage.removeItem(key);
                    freedSpace++;
                }
            } catch (error) {
                localStorage.removeItem(key);
            }
        }
    }
    
    if (freedSpace > 0) {
        showToast(`Cleaned up ${freedSpace} expired caches`, 'info');
    }
    
    updateStorageInfo();
}

function isPreloadingComplete() {
    return videos.every(video => 
        preloadedVideos.has(video.id) || preloadProgress[video.id]?.progress === -1
    );
}

function finishPreloading() {
    isPreloading = false;
    setTimeout(() => {
        preloadProgressEl.style.display = 'none';
        showToast('All videos preloaded and cached', 'success');
    }, 2000);
}

function updatePreloadProgressDisplay() {
    const totalVideos = videos.length;
    const cachedVideosCount = Object.values(preloadProgress).filter(p => p.isCached).length;
    const completedVideos = Object.values(preloadProgress).filter(p => p.progress >= 100).length;
    const totalProgress = ((cachedVideosCount + completedVideos) / (totalVideos * 2)) * 100;
    
    preloadProgressFill.style.width = `${totalProgress}%`;
    preloadProgressText.textContent = `${completedVideos}/${totalVideos} videos preloaded`;
    
    // Update list
    preloadProgressList.innerHTML = '';
    videos.forEach(video => {
        const progress = preloadProgress[video.id] || { progress: 0, isCached: false };
        const item = document.createElement('div');
        item.className = 'preload-item';
        
        let statusIcon = '⏳';
        let statusText = '';
        
        if (progress.progress === -1) {
            statusIcon = '❌';
            statusText = 'Failed';
        } else if (progress.progress >= 100) {
            statusIcon = '✅';
            statusText = 'Ready';
        } else if (progress.isCached) {
            statusIcon = '💾';
            statusText = 'Cached';
        }
        
        item.innerHTML = `
            <div class="preload-item-name">${video.name}</div>
            <div class="preload-item-progress">
                <div class="preload-item-progress-fill" style="width: ${Math.max(0, progress.progress)}%;"></div>
            </div>
            <div class="preload-item-percent">
                ${progress.progress >= 0 ? `${Math.round(progress.progress)}%` : statusText} ${statusIcon}
            </div>
        `;
        
        preloadProgressList.appendChild(item);
    });
}

function updateStorageInfo() {
    const totalVideos = videos.length;
    const cachedCount = preloadedVideos.size;
    const cachePercentage = totalVideos > 0 ? Math.round((cachedCount / totalVideos) * 100) : 0;
    
    storageText.textContent = `${cachedCount}/${totalVideos} (${cachePercentage}%)`;
    storageInfo.style.display = cachedCount > 0 ? 'flex' : 'none';
}

// ==================== VIDEO SECURITY SYSTEM ====================
function encryptVideoData(data) {
    try {
        const encrypted = CryptoJS.AES.encrypt(
            JSON.stringify(data),
            CONFIG.ENCRYPTION_KEY + deviceId
        ).toString();
        return encrypted;
    } catch (error) {
        console.error('Encryption error:', error);
        return null;
    }
}

function decryptVideoData(encryptedData) {
    try {
        const decrypted = CryptoJS.AES.decrypt(
            encryptedData,
            CONFIG.ENCRYPTION_KEY + deviceId
        ).toString(CryptoJS.enc.Utf8);
        return JSON.parse(decrypted);
    } catch (error) {
        console.error('Decryption error:', error);
        return null;
    }
}

function protectVideoFromDownload() {
    // Disable right-click on video
    videoPlayer.addEventListener('contextmenu', (e) => {
        e.preventDefault();
        return false;
    });
    
    // Disable video download
    videoPlayer.controlsList = 'nodownload noremoteplayback';
    
    // Disable picture-in-picture
    videoPlayer.disablePictureInPicture = true;
}

// ==================== VIDEO PLAYBACK OPTIMIZATION ====================
function optimizeVideoPlayback() {
    // Android-specific optimizations
    videoPlayer.preload = 'metadata';
    videoPlayer.setAttribute('preload', 'metadata');
    videoPlayer.crossOrigin = 'anonymous';
    videoPlayer.playsInline = true;
    videoPlayer.disableRemotePlayback = true;
    
    // Android Chrome specific settings
    if (navigator.userAgent.toLowerCase().indexOf('android') > -1) {
        videoPlayer.setAttribute('webkit-playsinline', 'true');
        videoPlayer.setAttribute('playsinline', 'true');
        videoPlayer.setAttribute('x5-video-player-type', 'h5');
        videoPlayer.setAttribute('x5-video-player-fullscreen', 'false');
        videoPlayer.setAttribute('x5-video-orientation', 'portrait');
        videoPlayer.setAttribute('t7-video-player-type', 'inline');
    }
    
    // Prevent hardware acceleration issues
    videoPlayer.style.transform = 'translateZ(0)';
    videoPlayer.style.webkitTransform = 'translateZ(0)';
    videoPlayer.style.backfaceVisibility = 'hidden';
    
    // Video event listeners for buffering control
    videoPlayer.addEventListener('waiting', function() {
        showBufferingIndicator();
    });
    
    videoPlayer.addEventListener('playing', function() {
        hideBufferingIndicator();
    });
    
    videoPlayer.addEventListener('canplay', function() {
        hideBufferingIndicator();
    });
    
    videoPlayer.addEventListener('canplaythrough', function() {
        hideBufferingIndicator();
    });
    
    videoPlayer.addEventListener('progress', function() {
        updateBufferInfo();
    });
    
    videoPlayer.addEventListener('error', function(e) {
        console.log('Video error:', e);
        handleVideoError();
    });
    
    // Prevent accidental play on scroll
    videoPlayer.addEventListener('touchstart', function(e) {
        e.stopPropagation();
    });
    
    // Quality selector events
    qualityButtons.forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.stopPropagation();
            const quality = this.getAttribute('data-quality');
            setVideoQuality(quality);
        });
        
        btn.addEventListener('touchend', function(e) {
            e.preventDefault();
            e.stopPropagation();
            const quality = this.getAttribute('data-quality');
            setVideoQuality(quality);
        });
    });
    
    // Add video security
    protectVideoFromDownload();
}

function showBufferingIndicator() {
    if (!isBuffering) {
        isBuffering = true;
        bufferingIndicator.style.display = 'flex';
        
        // Auto-hide after 10 seconds
        bufferingTimeout = setTimeout(() => {
            hideBufferingIndicator();
            // If still buffering, try to fix
            if (videoPlayer.readyState < 3) {
                retryVideoPlayback();
            }
        }, 10000);
    }
}

function hideBufferingIndicator() {
    isBuffering = false;
    bufferingIndicator.style.display = 'none';
    if (bufferingTimeout) {
        clearTimeout(bufferingTimeout);
        bufferingTimeout = null;
    }
}

function updateBufferInfo() {
    if (videoPlayer.buffered.length > 0) {
        const bufferedEnd = videoPlayer.buffered.end(videoPlayer.buffered.length - 1);
        const currentTime = videoPlayer.currentTime;
        videoBufferSize = bufferedEnd - currentTime;
        
        // Show quality selector if buffer is low
        if (videoBufferSize < 5 && networkQuality !== 'good') {
            qualitySelector.style.display = 'flex';
        } else {
            qualitySelector.style.display = 'none';
        }
        
        // Auto-optimize based on buffer
        if (videoBufferSize < 2) {
            autoOptimizePlayback();
        }
    }
}

function autoOptimizePlayback() {
    if (networkQuality === 'slow-2g' || networkQuality === '2g') {
        // Slow network - reduce quality
        setVideoQuality('360p');
        showToast('Auto-switched to 360p for better playback', 'info');
    } else if (networkQuality === '3g') {
        // Medium network - use 480p
        setVideoQuality('480p');
    }
}

function setVideoQuality(quality) {
    currentQuality = quality;
    
    // Update active button
    qualityButtons.forEach(btn => {
        if (btn.getAttribute('data-quality') === quality) {
            btn.classList.add('active');
        } else {
            btn.classList.remove('active');
        }
    });
    
    // If video is playing, we could switch to different quality stream
    // For now, just adjust playback rate for optimization
    switch(quality) {
        case '360p':
            videoPlayer.playbackRate = 1.0;
            videoPlayer.defaultPlaybackRate = 1.0;
            break;
        case '480p':
            videoPlayer.playbackRate = 1.0;
            videoPlayer.defaultPlaybackRate = 1.0;
            break;
        case 'auto':
            // Auto-detect based on network
            if (networkQuality === 'slow-2g' || networkQuality === '2g') {
                videoPlayer.playbackRate = 0.8;
            } else {
                videoPlayer.playbackRate = 1.0;
            }
            break;
    }
    
    showToast(`Quality set to ${quality}`, 'info');
}

function retryVideoPlayback() {
    if (!videoPlayer.src) return;
    
    showToast('Retrying playback...', 'info');
    
    const currentTime = videoPlayer.currentTime;
    const currentSrc = videoPlayer.src;
    
    // Pause and reset
    videoPlayer.pause();
    videoPlayer.src = '';
    
    setTimeout(() => {
        videoPlayer.src = currentSrc;
        videoPlayer.currentTime = currentTime > 5 ? currentTime - 5 : 0;
        videoPlayer.load();
        
        setTimeout(() => {
            videoPlayer.play().catch(e => {
                console.log('Retry play failed:', e);
            });
        }, 500);
    }, 1000);
}

function handleVideoError() {
    showToast('Video playback error. Trying to fix...', 'error');
    
    setTimeout(() => {
        if (videoPlayer.error) {
            // Try to reload the video
            const src = videoPlayer.src;
            videoPlayer.src = src;
            videoPlayer.load();
            
            setTimeout(() => {
                videoPlayer.play().catch(e => {
                    console.log('Error recovery failed:', e);
                });
            }, 500);
        }
    }, 1000);
}

// ==================== NETWORK OPTIMIZATION ====================
function monitorNetworkQuality() {
    if ('connection' in navigator) {
        const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
        
        if (connection) {
            networkQuality = connection.effectiveType || 'unknown';
            console.log('Network quality:', networkQuality);
            
            // Adjust settings based on network
            adjustForNetworkQuality();
            
            // Listen for network changes
            connection.addEventListener('change', function() {
                networkQuality = connection.effectiveType;
                console.log('Network changed to:', networkQuality);
                adjustForNetworkQuality();
                showToast(`Network: ${networkQuality}`, 'info');
            });
        }
    }
}

function adjustForNetworkQuality() {
    switch(networkQuality) {
        case 'slow-2g':
        case '2g':
            // Very slow network - aggressive optimization
            videoPlayer.preload = 'none';
            setVideoQuality('360p');
            break;
        case '3g':
            // Medium network - moderate optimization
            videoPlayer.preload = 'metadata';
            setVideoQuality('480p');
            break;
        case '4g':
        default:
            // Good network - normal settings
            videoPlayer.preload = 'auto';
            setVideoQuality('auto');
            break;
    }
}

// ==================== PASSWORD SECTION HOVER BEHAVIOR ====================
function setupPasswordSectionHover() {
    // Mouse enter event
    passwordSection.addEventListener('mouseenter', () => {
        clearTimeout(passwordSectionHoverTimer);
        expandPasswordSection();
    });

    // Mouse leave event
    passwordSection.addEventListener('mouseleave', () => {
        // Wait 6 seconds before collapsing
        passwordSectionHoverTimer = setTimeout(() => {
            collapsePasswordSection();
        }, 6000);
    });

    // Touch events for mobile
    passwordSection.addEventListener('touchstart', (e) => {
        e.preventDefault();
        clearTimeout(passwordSectionHoverTimer);
        expandPasswordSection();
    });

    // Android အတွက် improved touch handling
    passwordSection.addEventListener('touchend', (e) => {
        e.preventDefault();
    });

    document.addEventListener('touchstart', (e) => {
        if (!passwordSection.contains(e.target)) {
            collapsePasswordSection();
        }
    });
}

function expandPasswordSection() {
    passwordSectionExpanded = true;
    passwordSection.classList.add('expanded');
    // Android မှာ input ကို focus လုပ်နိုင်အောင်
    setTimeout(() => {
        passwordInput.focus();
    }, 300);
}

function collapsePasswordSection() {
    passwordSectionExpanded = false;
    passwordSection.classList.remove('expanded');
}

// ==================== SECURE DEVICE ID SYSTEM ====================
function getSecureDeviceId() {
    // Try to get existing device ID
    let storedId = localStorage.getItem(CONFIG.DEVICE_ID_KEY);
    
    if (!storedId) {
        // Generate new secure device ID
        const timestamp = Date.now();
        const randomPart = Math.random().toString(36).substr(2, 12);
        const userAgentHash = CryptoJS.SHA256(navigator.userAgent).toString().substr(0, 8);
        const screenHash = CryptoJS.SHA256(`${screen.width}x${screen.height}`).toString().substr(0, 6);
        
        storedId = `kve_dev_${timestamp}_${randomPart}_${userAgentHash}_${screenHash}`;
        localStorage.setItem(CONFIG.DEVICE_ID_KEY, storedId);
        
        // Clear any existing password data (new device)
        clearDevicePassword();
        showToast('New device detected', 'info');
    }
    
    return storedId;
}

function updateDeviceInfoDisplay() {
    if (deviceId) {
        const shortId = deviceId.substr(0, 12) + '...';
        deviceIdShort.textContent = shortId;
        deviceInfoDisplay.style.display = 'flex';
        deviceInfo.innerHTML = `<i class="fas fa-fingerprint"></i> Device ID: ${shortId}`;
    }
}

// ==================== DEVICE-LOCKED PASSWORD SYSTEM ====================
function checkDevicePassword() {
    const stored = localStorage.getItem(CONFIG.PASSWORD_STORAGE_KEY);
    
    if (stored) {
        try {
            const data = JSON.parse(stored);
            
            // Verify the password is for this device
            if (data.deviceId === deviceId) {
                devicePasswordData = data;
                
                // Check if password still exists on server and is not used elsewhere
                checkPasswordValidity(data.password);
            } else {
                // Different device trying to use password
                clearDevicePassword();
                showToast('This password is locked to another device', 'error');
            }
        } catch (e) {
            clearDevicePassword();
        }
    }
}

function checkPasswordValidity(password) {
    if (!passwords.length) return;
    
    const matchingPassword = passwords.find(p => p.password === password);
    
    if (matchingPassword) {
        // Check password usage on server
        checkPasswordUsageOnServer(password, matchingPassword);
    } else {
        // Password deleted by admin
        clearDevicePassword();
        passwordResetModal.style.display = 'flex';
    }
}

async function checkPasswordUsageOnServer(password, passwordData) {
    try {
        const db = firebase.firestore();
        
        // Check if there's a usage record for this password
        const usageRef = db.collection('passwordUsage').where('password', '==', password);
        const snapshot = await usageRef.get();
        
        if (!snapshot.empty) {
            const usageDoc = snapshot.docs[0];
            const usageData = usageDoc.data();
            
            if (usageData.deviceId === deviceId) {
                // This device is authorized to use this password
                autoUnlockWithDevicePassword(password, passwordData);
            } else {
                // Password is being used on another device
                clearDevicePassword();
                passwordResetModal.style.display = 'flex';
                showToast('Password is already in use on another device', 'error');
            }
        } else {
            // No usage record found, create one for this device
            await recordPasswordUsage(password);
            autoUnlockWithDevicePassword(password, passwordData);
        }
        
    } catch (error) {
        console.error('Error checking password usage:', error);
        // Fallback to local validation
        autoUnlockWithDevicePassword(password, passwordData);
    }
}

async function recordPasswordUsage(password) {
    try {
        const db = firebase.firestore();
        
        // Create or update usage record
        await db.collection('passwordUsage').doc(password).set({
            password: password,
            deviceId: deviceId,
            timestamp: firebase.firestore.FieldValue.serverTimestamp(),
            lastUsed: Date.now()
        });
        
    } catch (error) {
        console.error('Error recording password usage:', error);
    }
}

function autoUnlockWithDevicePassword(password, passwordData) {
    if (passwordData.storyName) {
        unlockedVideos.add(passwordData.storyName);
        updatePasswordIndicator(true, passwordData.storyName);
    } else {
        videos.forEach(video => {
            if (video.passwordType === 'password') {
                unlockedVideos.add(video.id);
            }
        });
        updatePasswordIndicator(true, 'All Videos');
    }
    
    renderVideoList();
    logoutBtn.style.display = 'flex';
    showToast('Auto-logged in with device password', 'success');
}

function clearDevicePassword() {
    devicePasswordData = null;
    unlockedVideos.clear();
    localStorage.removeItem(CONFIG.PASSWORD_STORAGE_KEY);
    updatePasswordIndicator(false);
    renderVideoList();
    logoutBtn.style.display = 'none';
    
    // Clear password input
    passwordInput.value = '';
}

async function logout() {
    if (devicePasswordData) {
        try {
            // Remove usage record from server
            const db = firebase.firestore();
            await db.collection('passwordUsage').doc(devicePasswordData.password).delete();
        } catch (error) {
            console.error('Error removing usage record:', error);
        }
    }
    
    clearDevicePassword();
    showToast('Logged out successfully', 'success');
}

// ==================== EVENT LISTENERS ====================
function setupEventListeners() {
    // Android အတွက် improved touch events
    setupTouchEvents();
    
    // Stories menu
    storiesToggle.addEventListener('click', toggleStoriesMenu);
    storiesToggle.addEventListener('touchend', (e) => {
        e.preventDefault();
        e.stopPropagation();
        toggleStoriesMenu(e);
    });
    document.addEventListener('click', closeStoriesMenuOnClickOutside);
    document.addEventListener('touchstart', closeStoriesMenuOnClickOutside);
    
    // Password toggle
    passwordToggle.addEventListener('click', togglePasswordVisibility);
    passwordToggle.addEventListener('touchend', (e) => {
        e.preventDefault();
        togglePasswordVisibility();
    });
    
    videoPasswordToggle.addEventListener('click', toggleVideoPasswordVisibility);
    videoPasswordToggle.addEventListener('touchend', (e) => {
        e.preventDefault();
        toggleVideoPasswordVisibility();
    });
    
    // Password section
    unlockBtn.addEventListener('click', unlockVideos);
    unlockBtn.addEventListener('touchend', (e) => {
        e.preventDefault();
        unlockVideos();
    });
    
    passwordInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') unlockVideos();
    });
    
    // Android အတွက် input focus ပြဿနာ ဖြေရှင်းခြင်း
    passwordInput.addEventListener('touchstart', (e) => {
        e.stopPropagation();
    });
    
    // Storage selection
    storageBtn.addEventListener('click', () => {
        storageModal.style.display = 'flex';
    });
    
    storageBtn.addEventListener('touchend', (e) => {
        e.preventDefault();
        storageModal.style.display = 'flex';
    });
    
    // Storage option buttons
    selectDefaultStorage.addEventListener('click', () => {
        selectStorage('default');
        storageModal.style.display = 'none';
    });
    
    selectLocalStorage.addEventListener('click', () => {
        selectStorage('local');
        storageModal.style.display = 'none';
    });
    
    selectSDCard.addEventListener('click', () => {
        selectStorage('sd');
        storageModal.style.display = 'none';
    });
    
    selectCustomStorage.addEventListener('click', async () => {
        storageModal.style.display = 'none';
        await selectCustomStorageLocation();
    });
    
    // Navigation
    contactBtn.addEventListener('click', () => showScreen(2));
    contactBtn.addEventListener('touchend', (e) => {
        e.preventDefault();
        showScreen(2);
    });
    
    refreshBtn.addEventListener('click', refreshData);
    refreshBtn.addEventListener('touchend', (e) => {
        e.preventDefault();
        refreshData();
    });
    
    logoutBtn.addEventListener('click', logout);
    logoutBtn.addEventListener('touchend', (e) => {
        e.preventDefault();
        logout();
    });
    
    preloadBtn.addEventListener('click', startPreloading);
    preloadBtn.addEventListener('touchend', (e) => {
        e.preventDefault();
        startPreloading();
    });
    
    closePreloadProgress.addEventListener('click', () => {
        preloadProgressEl.style.display = 'none';
    });
    
    closePreloadProgress.addEventListener('touchend', (e) => {
        e.preventDefault();
        preloadProgressEl.style.display = 'none';
    });
    
    optimizeBtn.addEventListener('click', () => {
        optimizeVideoPlayback();
        showToast('Video playback optimized for Android', 'success');
    });
    optimizeBtn.addEventListener('touchend', (e) => {
        e.preventDefault();
        optimizeVideoPlayback();
        showToast('Video playback optimized for Android', 'success');
    });
    
    backButton.addEventListener('click', handleBackButton);
    backButton.addEventListener('touchend', (e) => {
        e.preventDefault();
        handleBackButton();
    });
    
    backToMain.addEventListener('click', () => showScreen(1));
    backToMain.addEventListener('touchend', (e) => {
        e.preventDefault();
        showScreen(1);
    });
    
    // Video player
    fullscreenBtn.addEventListener('click', toggleFullScreen);
    fullscreenBtn.addEventListener('touchend', (e) => {
        e.preventDefault();
        toggleFullScreen();
    });
    
    // Video password modal
    submitVideoPassword.addEventListener('click', unlockCurrentVideo);
    submitVideoPassword.addEventListener('touchend', (e) => {
        e.preventDefault();
        unlockCurrentVideo();
    });
    
    cancelVideoPassword.addEventListener('click', closeVideoPasswordModal);
    cancelVideoPassword.addEventListener('touchend', (e) => {
        e.preventDefault();
        closeVideoPasswordModal();
    });
    
    videoPassword.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') unlockCurrentVideo();
    });
    
    // Android အတွက် modal touch handling
    videoPasswordModal.addEventListener('touchmove', (e) => {
        e.stopPropagation();
    });
    
    // Close modal when clicking outside
    videoPasswordModal.addEventListener('click', (e) => {
        if (e.target === videoPasswordModal) {
            closeVideoPasswordModal();
        }
    });
    
    videoPasswordModal.addEventListener('touchstart', (e) => {
        if (e.target === videoPasswordModal) {
            closeVideoPasswordModal();
        }
    });
    
    passwordResetModal.addEventListener('click', (e) => {
        if (e.target === passwordResetModal) {
            passwordResetModal.style.display = 'none';
        }
    });
    
    passwordResetModal.addEventListener('touchstart', (e) => {
        if (e.target === passwordResetModal) {
            passwordResetModal.style.display = 'none';
        }
    });
    
    storageModal.addEventListener('click', (e) => {
        if (e.target === storageModal) {
            storageModal.style.display = 'none';
        }
    });
    
    storageModal.addEventListener('touchstart', (e) => {
        if (e.target === storageModal) {
            storageModal.style.display = 'none';
        }
    });
    
    // No internet modal
    retryConnectionBtn.addEventListener('click', () => {
        noInternetModal.style.display = 'none';
        initApp();
    });
    
    retryConnectionBtn.addEventListener('touchend', (e) => {
        e.preventDefault();
        noInternetModal.style.display = 'none';
        initApp();
    });
    
    confirmPasswordReset.addEventListener('click', () => {
        passwordResetModal.style.display = 'none';
        passwordInput.focus();
    });
    
    confirmPasswordReset.addEventListener('touchend', (e) => {
        e.preventDefault();
        passwordResetModal.style.display = 'none';
        passwordInput.focus();
    });
    
    // Network events
    window.addEventListener('online', updateConnectionStatus);
    window.addEventListener('offline', updateConnectionStatus);
    
    // Video player security
    videoPlayer.addEventListener('contextmenu', (e) => {
        e.preventDefault();
        return false;
    });
    
    // Fullscreen change
    document.addEventListener('fullscreenchange', handleFullScreenChange);
    document.addEventListener('webkitfullscreenchange', handleFullScreenChange);
    document.addEventListener('mozfullscreenchange', handleFullScreenChange);
    document.addEventListener('MSFullscreenChange', handleFullScreenChange);
    
    // Android အတွက် pull-to-refresh ကာကွယ်ခြင်း
    let startY = 0;
    document.addEventListener('touchstart', (e) => {
        startY = e.touches[0].clientY;
    }, { passive: true });
    
    document.addEventListener('touchmove', (e) => {
        const currentY = e.touches[0].clientY;
        // ပထမဆုံး scroll position မှာဆိုရင် pull-to-refresh ကာကွယ်မယ်
        if (window.scrollY === 0 && currentY > startY) {
            e.preventDefault();
        }
    }, { passive: false });
    
    // Handle app visibility changes
    document.addEventListener('visibilitychange', function() {
        if (document.hidden && !videoPlayer.paused) {
            videoPlayer.pause();
        }
    });
    
    // Android keyboard အတွက်
    window.addEventListener('resize', function() {
        // Keyboard ထွက်လာရင် မပျက်အောင်
        setTimeout(() => {
            if (document.activeElement && document.activeElement.scrollIntoViewIfNeeded) {
                document.activeElement.scrollIntoViewIfNeeded();
            }
        }, 100);
    });
}

function setupTouchEvents() {
    // Android အတွက် button များ နှိပ်ရလွယ်အောင်
    document.querySelectorAll('button, .video-item, .story-item, .nav-btn, .action-btn').forEach(element => {
        element.addEventListener('touchstart', function() {
            this.style.opacity = '0.8';
        });
        
        element.addEventListener('touchend', function() {
            this.style.opacity = '1';
        });
        
        element.addEventListener('touchcancel', function() {
            this.style.opacity = '1';
        });
    });
}

function togglePasswordVisibility() {
    isPasswordVisible = !isPasswordVisible;
    passwordInput.type = isPasswordVisible ? 'text' : 'password';
    passwordToggle.innerHTML = isPasswordVisible ? 
        '<i class="fas fa-eye-slash"></i>' : 
        '<i class="fas fa-eye"></i>';
}

function toggleVideoPasswordVisibility() {
    isVideoPasswordVisible = !isVideoPasswordVisible;
    videoPassword.type = isVideoPasswordVisible ? 'text' : 'password';
    videoPasswordToggle.innerHTML = isVideoPasswordVisible ? 
        '<i class="fas fa-eye-slash"></i>' : 
        '<i class="fas fa-eye"></i>';
}

// ==================== STORIES MENU ====================
function toggleStoriesMenu(e) {
    if (e) {
        e.stopPropagation();
        e.preventDefault();
    }
    storiesMenu.classList.toggle('active');
}

function closeStoriesMenuOnClickOutside(e) {
    if (!storiesToggle.contains(e.target) && !storiesMenu.contains(e.target)) {
        storiesMenu.classList.remove('active');
    }
}

// ==================== DATA LOADING ====================
async function loadVideos() {
    try {
        const db = firebase.firestore();
        const snapshot = await db.collection('videos').get();
        videos = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));
        
        // Extract stories
        const storySet = new Set();
        videos.forEach(video => {
            if (video.storyName) {
                storySet.add(video.storyName);
            }
        });
        stories = Array.from(storySet).sort();
        
        console.log(`${videos.length} videos loaded`);
    } catch (error) {
        console.error('Error loading videos:', error);
        throw error;
    }
}

async function loadPasswords() {
    try {
        const db = firebase.firestore();
        const snapshot = await db.collection('passwords').get();
        passwords = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));
    } catch (error) {
        console.error('Error loading passwords:', error);
        throw error;
    }
}

async function loadContactLinks() {
    try {
        const db = firebase.firestore();
        const snapshot = await db.collection('contactLinks').get();
        contactLinks = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));
    } catch (error) {
        console.error('Error loading contact links:', error);
        throw error;
    }
}

async function refreshData() {
    showLoading('Refreshing data...');
    
    try {
        await Promise.all([
            loadVideos(),
            loadPasswords(),
            loadContactLinks()
        ]);
        
        // Re-check password validity after refresh
        if (devicePasswordData) {
            checkPasswordValidity(devicePasswordData.password);
        }
        
        renderStoryList();
        renderVideoList();
        renderContactList();
        
        hideLoading();
        showToast('Data refreshed successfully', 'success');
    } catch (error) {
        hideLoading();
        showToast('Refresh failed', 'error');
    }
}

// ==================== PASSWORD UNLOCK SYSTEM ====================
async function unlockVideos() {
    const password = passwordInput.value.trim();
    
    if (!password) {
        showToast('Enter password', 'error');
        passwordStatus.textContent = '✗ Please enter password';
        passwordStatus.style.color = '#ff3e3e';
        return;
    }
    
    // Check for matching password
    const matchingPassword = passwords.find(p => p.password === password);
    
    if (matchingPassword) {
        // Check if password is already in use on another device
        const isAvailable = await checkPasswordAvailability(password);
        
        if (!isAvailable) {
            showToast('Password already in use on another device', 'error');
            passwordStatus.textContent = '✗ Password locked to another device';
            passwordStatus.style.color = '#ff3e3e';
            return;
        }
        
        // Save device password data
        devicePasswordData = {
            password: password,
            deviceId: deviceId,
            storyName: matchingPassword.storyName,
            timestamp: Date.now()
        };
        
        localStorage.setItem(CONFIG.PASSWORD_STORAGE_KEY, JSON.stringify(devicePasswordData));
        
        // Record password usage on server
        await recordPasswordUsage(password);
        
        // Unlock videos
        if (matchingPassword.storyName) {
            unlockedVideos.add(matchingPassword.storyName);
            showToast(`Unlocked: ${matchingPassword.storyName}`, 'success');
            updatePasswordIndicator(true, matchingPassword.storyName);
        } else {
            videos.forEach(video => {
                if (video.passwordType === 'password') {
                    unlockedVideos.add(video.id);
                }
            });
            showToast('All videos unlocked', 'success');
            updatePasswordIndicator(true, 'All Videos');
        }
        
        renderVideoList();
        passwordInput.value = '';
        passwordStatus.textContent = '✓ Access granted - Password locked to this device';
        passwordStatus.style.color = '#00ff00';
        
        // Show logout button
        logoutBtn.style.display = 'flex';
        
    } else {
        showToast('Invalid password', 'error');
        passwordStatus.textContent = '✗ Invalid password';
        passwordStatus.style.color = '#ff3e3e';
    }
}

async function checkPasswordAvailability(password) {
    try {
        const db = firebase.firestore();
        const usageRef = db.collection('passwordUsage').doc(password);
        const doc = await usageRef.get();
        
        if (doc.exists) {
            const data = doc.data();
            // Password is available if it's not used or used by this device
            return !data.deviceId || data.deviceId === deviceId;
        }
        
        // No usage record found, password is available
        return true;
        
    } catch (error) {
        console.error('Error checking password availability:', error);
        // In case of error, allow local validation
        return true;
    }
}

async function unlockCurrentVideo() {
    const password = videoPassword.value.trim();
    
    if (!password) {
        videoPasswordStatus.textContent = 'Enter password';
        videoPasswordStatus.style.color = '#ff3e3e';
        return;
    }
    
    if (!currentVideoToUnlock) {
        closeVideoPasswordModal();
        return;
    }
    
    const matchingPassword = passwords.find(p => 
        p.password === password && 
        (p.storyName === currentVideoToUnlock.storyName || !p.storyName)
    );
    
    if (matchingPassword) {
        // Check if password is already in use on another device
        const isAvailable = await checkPasswordAvailability(password);
        
        if (!isAvailable) {
            videoPasswordStatus.textContent = 'Password locked to another device';
            videoPasswordStatus.style.color = '#ff3e3e';
            videoPassword.value = '';
            videoPassword.focus();
            return;
        }
        
        // Save device password data
        devicePasswordData = {
            password: password,
            deviceId: deviceId,
            storyName: matchingPassword.storyName,
            timestamp: Date.now()
        };
        
        localStorage.setItem(CONFIG.PASSWORD_STORAGE_KEY, JSON.stringify(devicePasswordData));
        
        // Record password usage
        await recordPasswordUsage(password);
        
        unlockedVideos.add(currentVideoToUnlock.id);
        closeVideoPasswordModal();
        playVideo(currentVideoToUnlock);
        renderVideoList();
        showToast('Video unlocked', 'success');
        
        updatePasswordIndicator(true, currentVideoToUnlock.storyName || currentVideoToUnlock.name);
        logoutBtn.style.display = 'flex';
        
    } else {
        videoPasswordStatus.textContent = 'Invalid password for this video';
        videoPasswordStatus.style.color = '#ff3e3e';
        videoPassword.value = '';
        videoPassword.focus();
    }
}

function updatePasswordIndicator(isUnlocked, name = '') {
    if (isUnlocked) {
        passwordIndicator.className = 'password-indicator';
        passwordIndicator.innerHTML = `<i class="fas fa-unlock"></i> <span>${name || 'Unlocked'}</span>`;
    } else {
        passwordIndicator.className = 'password-indicator locked';
        passwordIndicator.innerHTML = `<i class="fas fa-lock"></i> <span>Locked</span>`;
    }
}

// ==================== RENDER FUNCTIONS ====================
function renderStoryList() {
    storyList.innerHTML = '';
    
    // Add "All Stories" option
    const allItem = document.createElement('div');
    allItem.className = `story-item ${!currentStory ? 'active' : ''}`;
    allItem.textContent = 'All Stories';
    allItem.addEventListener('click', () => {
        currentStory = null;
        renderVideoList();
        storiesMenu.classList.remove('active');
    });
    allItem.addEventListener('touchend', (e) => {
        e.preventDefault();
        currentStory = null;
        renderVideoList();
        storiesMenu.classList.remove('active');
    });
    storyList.appendChild(allItem);
    
    // Add each story
    stories.forEach(story => {
        const storyItem = document.createElement('div');
        storyItem.className = `story-item ${currentStory === story ? 'active' : ''}`;
        storyItem.textContent = story;
        storyItem.addEventListener('click', () => {
            currentStory = story;
            renderVideoList();
            storiesMenu.classList.remove('active');
        });
        storyItem.addEventListener('touchend', (e) => {
            e.preventDefault();
            currentStory = story;
            renderVideoList();
            storiesMenu.classList.remove('active');
        });
        storyList.appendChild(storyItem);
    });
}

function renderVideoList() {
    videoList.innerHTML = '';
    
    if (videos.length === 0) {
        videoList.innerHTML = `
            <div style="text-align: center; padding: 20px; color: #8a93a7;">
                <i class="fas fa-film" style="font-size: 24px; margin-bottom: 10px;"></i>
                <div>No videos available</div>
            </div>
        `;
        return;
    }
    
    let videosToShow = videos;
    
    // Filter by selected story
    if (currentStory) {
        videosToShow = videos.filter(v => v.storyName === currentStory);
        backButton.style.display = 'flex';
    } else {
        backButton.style.display = 'none';
    }
    
    // Apply sorting
    videosToShow = applySorting(videosToShow);
    
    videosToShow.forEach(video => {
        const isFree = video.passwordType === 'free';
        const isUnlocked = isFree || unlockedVideos.has(video.id) || 
                         (video.storyName && unlockedVideos.has(video.storyName));
        const isCached = preloadedVideos.has(video.id);
        
        const videoItem = document.createElement('div');
        videoItem.className = `video-item ${!isUnlocked ? 'locked' : 'unlocked'} ${isFree ? 'free' : ''}`;
        
        let cacheIndicator = '';
        if (isCached) {
            cacheIndicator = '<i class="fas fa-hdd" style="color: #00ff00; margin-left: 5px; font-size: 10px;"></i>';
        }
        
        videoItem.innerHTML = `
            <div class="video-info">
                <div class="video-name">${video.name}${cacheIndicator}</div>
                <div class="video-meta">
                    ${video.type || 'Video'} ${video.storyName ? `• ${video.storyName}` : ''}
                </div>
            </div>
            <div class="video-actions">
                ${isFree ? '<span class="free-badge">FREE</span>' : ''}
                <button class="action-btn play" data-action="play" data-id="${video.id}">
                    <i class="fas fa-play"></i>
                </button>
            </div>
        `;
        
        videoList.appendChild(videoItem);
    });
}

function renderContactList() {
    contactList.innerHTML = '';
    
    if (contactLinks.length === 0) {
        contactList.innerHTML = `
            <div style="text-align: center; padding: 20px; color: #8a93a7;">
                <i class="fas fa-link" style="font-size: 24px; margin-bottom: 10px;"></i>
                <div>No contact links available</div>
            </div>
        `;
        return;
    }
    
    contactLinks.forEach(link => {
        const linkItem = document.createElement('div');
        linkItem.className = 'video-item';
        
        let icon = 'fa-link';
        let color = '#ff9900';
        
        switch(link.type) {
            case 'facebook': icon = 'fa-facebook'; color = '#1877F2'; break;
            case 'telegram': icon = 'fa-telegram'; color = '#0088cc'; break;
            case 'viber': icon = 'fa-viber'; color = '#7360F2'; break;
        }
        
        linkItem.innerHTML = `
            <div class="video-info">
                <div class="video-name">${link.name}</div>
                <div class="video-meta">${link.type.charAt(0).toUpperCase() + link.type.slice(1)}</div>
            </div>
            <a href="${link.url}" target="_blank" class="action-btn play" 
               style="text-decoration: none; background: ${color};">
                <i class="fab ${icon}"></i>
            </a>
        `;
        
        contactList.appendChild(linkItem);
    });
}

// ==================== VIDEO FUNCTIONS ====================
function playVideo(video) {
    try {
        showLoading('Loading video...');
        
        // Check internet connection before playing
        if (!navigator.onLine && !preloadedVideos.has(video.id)) {
            hideLoading();
            noInternetModal.style.display = 'flex';
            return;
        }
        
        // Reset video player state
        videoPlayer.pause();
        videoPlayer.currentTime = 0;
        
        defaultImage.style.display = 'none';
        videoPlayer.style.display = 'block';
        fullscreenBtn.style.display = 'block';
        
        // Check if video is cached
        if (preloadedVideos.has(video.id)) {
            videoPlayer.src = video.url;
            showToast('Playing from cache', 'info');
        } else {
            videoPlayer.src = video.url;
        }
        
        // Add security attributes
        videoPlayer.setAttribute('controlsList', 'nodownload noremoteplayback');
        videoPlayer.setAttribute('disablepictureinpicture', 'true');
        
        // Android optimization
        videoPlayer.load();
        
        // Set video quality based on network
        adjustVideoQualityForNetwork();
        
        videoPlayer.oncanplay = () => {
            hideLoading();
            
            // Try to play with a small delay for Android
            setTimeout(() => {
                videoPlayer.play().catch(e => {
                    console.log('Auto-play prevented:', e);
                    // Android အတွက် user interaction မပါဘဲ play မလုပ်နိုင်ရင်
                    videoPlayer.controls = true;
                });
            }, 300);
            
            // Highlight playing video
            document.querySelectorAll('.video-item').forEach(item => {
                item.classList.remove('playing');
            });
            
            const currentItem = Array.from(document.querySelectorAll('.video-item')).find(item => {
                const nameDiv = item.querySelector('.video-name');
                return nameDiv && nameDiv.textContent.includes(video.name);
            });
            
            if (currentItem) {
                currentItem.classList.add('playing');
            }
        };
        
        videoPlayer.onerror = () => {
            hideLoading();
            showToast('Error loading video', 'error');
            defaultImage.style.display = 'flex';
            videoPlayer.style.display = 'none';
            fullscreenBtn.style.display = 'none';
        };
        
        // Track play time
        lastPlayTime = Date.now();
        
    } catch (error) {
        hideLoading();
        showToast('Error playing video', 'error');
        console.error('Play video error:', error);
    }
}

function adjustVideoQualityForNetwork() {
    if (networkQuality === 'slow-2g' || networkQuality === '2g') {
        // Slow network - reduce buffering
        videoPlayer.preload = 'none';
        videoPlayer.playbackRate = 0.8;
    } else if (networkQuality === '3g') {
        // Medium network - moderate buffering
        videoPlayer.preload = 'metadata';
        videoPlayer.playbackRate = 1.0;
    } else {
        // Good network - normal buffering
        videoPlayer.preload = 'auto';
        videoPlayer.playbackRate = 1.0;
    }
}

// ==================== MODAL FUNCTIONS ====================
function showVideoPasswordModal() {
    videoPasswordModal.style.display = 'flex';
    videoPassword.value = '';
    videoPasswordStatus.textContent = '';
    videoPassword.focus();
    
    // Android keyboard အတွက်
    setTimeout(() => {
        if (videoPassword.scrollIntoViewIfNeeded) {
            videoPassword.scrollIntoViewIfNeeded();
        }
    }, 100);
}

function closeVideoPasswordModal() {
    videoPasswordModal.style.display = 'none';
    videoPassword.value = '';
    videoPasswordStatus.textContent = '';
    currentVideoToUnlock = null;
}

// ==================== SCREEN NAVIGATION ====================
function showScreen(screenNumber) {
    screens.forEach(screen => {
        screen.classList.remove('active');
    });
    
    document.getElementById(`screen${screenNumber}`).classList.add('active');
    
    // Pause video when switching screens
    if (!videoPlayer.paused) {
        videoPlayer.pause();
    }
    
    // Hide modals when switching screens
    videoPasswordModal.style.display = 'none';
    noInternetModal.style.display = 'none';
    storageModal.style.display = 'none';
    
    // Hide fullscreen button
    fullscreenBtn.style.display = 'none';
    
    // Collapse password section when switching screens
    collapsePasswordSection();
    
    // Scroll to top when changing screens
    window.scrollTo(0, 0);
    
    // Android keyboard ပိတ်ခြင်း
    if (document.activeElement && document.activeElement.blur) {
        document.activeElement.blur();
    }
}

function handleBackButton() {
    if (currentStory) {
        currentStory = null;
        renderVideoList();
    }
}

// ==================== FULL SCREEN FUNCTIONS ====================
function toggleFullScreen() {
    if (!document.fullscreenElement) {
        if (videoPlayer.requestFullscreen) {
            videoPlayer.requestFullscreen();
        } else if (videoPlayer.webkitRequestFullscreen) {
            videoPlayer.webkitRequestFullscreen();
        } else if (videoPlayer.mozRequestFullScreen) {
            videoPlayer.mozRequestFullScreen();
        } else if (videoPlayer.msRequestFullscreen) {
            videoPlayer.msRequestFullscreen();
        }
        fullscreenBtn.innerHTML = '<i class="fas fa-compress"></i>';
    } else {
        if (document.exitFullscreen) {
            document.exitFullscreen();
        } else if (document.webkitExitFullscreen) {
            document.webkitExitFullscreen();
        } else if (document.mozCancelFullScreen) {
            document.mozCancelFullScreen();
        } else if (document.msExitFullscreen) {
            document.msExitFullscreen();
        }
        fullscreenBtn.innerHTML = '<i class="fas fa-expand"></i>';
    }
}

function handleFullScreenChange() {
    if (!document.fullscreenElement && !document.webkitIsFullScreen && !document.mozFullScreen && !document.msFullscreenElement) {
        fullscreenBtn.innerHTML = '<i class="fas fa-expand"></i>';
    }
}

// ==================== NETWORK FUNCTIONS ====================
function updateConnectionStatus() {
    isOnline = navigator.onLine;
    
    if (isOnline) {
        connectionStatus.className = 'connection-status';
        connectionStatus.innerHTML = '<i class="fas fa-wifi"></i> Online';
        
    } else {
        connectionStatus.className = 'connection-status offline';
        connectionStatus.innerHTML = '<i class="fas fa-wifi-slash"></i> Offline';
        
        // Show no internet modal
        noInternetModal.style.display = 'flex';
    }
}

// ==================== UI FEEDBACK FUNCTIONS ====================
function showToast(message, type = 'info') {
    const icon = type === 'success' ? 'fa-check-circle' :
                type === 'error' ? 'fa-exclamation-circle' :
                'fa-info-circle';
    
    const color = type === 'success' ? '#00ff00' :
                 type === 'error' ? '#ff3e3e' : '#ff9900';
    
    toast.innerHTML = `<i class="fas ${icon}" style="color: ${color};"></i> ${message}`;
    toast.style.display = 'flex';
    
    setTimeout(() => {
        toast.style.display = 'none';
    }, 3000);
}

function showLoading(text = 'Loading...') {
    loadingText.textContent = text;
    loadingOverlay.style.display = 'flex';
}

function hideLoading() {
    loadingOverlay.style.display = 'none';
}

function loadCustomImage() {
    appImage.onload = function() {
        appImage.style.display = 'block';
        defaultImage.querySelector('div').style.display = 'none';
    };
    appImage.onerror = function() {
        appImage.style.display = 'none';
        defaultImage.querySelector('div').style.display = 'block';
    };
    appImage.src = CONFIG.CUSTOM_IMAGE_URL;
}

// ==================== MEMORY MANAGEMENT ====================
function clearVideoCache() {
    // Clear video src to free memory
    if (videoPlayer.src) {
        videoPlayer.src = '';
        videoPlayer.load();
    }
    
    // Clear any blob URLs
    if (videoPlayer.src && videoPlayer.src.startsWith('blob:')) {
        URL.revokeObjectURL(videoPlayer.src);
    }
}

// ==================== CLEANUP OLD CACHE ====================
function cleanupExpiredCache() {
    const now = Date.now();
    const expiryTime = CONFIG.CACHE_EXPIRY_DAYS * 24 * 60 * 60 * 1000;
    
    for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key.startsWith('video_cache_')) {
            try {
                const cacheData = JSON.parse(localStorage.getItem(key));
                if (now - cacheData.timestamp > expiryTime) {
                    localStorage.removeItem(key);
                    preloadedVideos.delete(cacheData.id);
                    delete cachedVideos[cacheData.id];
                }
            } catch (error) {
                localStorage.removeItem(key);
            }
        }
    }
    
    updateStorageInfo();
}

// ==================== INITIALIZE APP ====================
document.addEventListener('DOMContentLoaded', () => {
    // Android အတွက် initial setup
    document.body.style.overflow = 'auto';
    document.body.style.height = '100%';
    
    // Set Android-specific optimizations
    if (navigator.userAgent.toLowerCase().indexOf('android') > -1) {
        document.body.classList.add('android-optimized');
        
        // Disable some animations for better performance
        document.querySelectorAll('.video-item, .story-item').forEach(el => {
            el.style.transition = 'transform 0.1s ease';
        });
        
        // Fix scrolling issues on Android
        document.body.style.overflowScrolling = 'touch';
        document.body.style.webkitOverflowScrolling = 'touch';
        
        // Show SD card option only if available
        try {
            if (typeof window.requestFileSystem !== 'undefined' || 
                typeof window.webkitRequestFileSystem !== 'undefined') {
                selectSDCard.style.display = 'flex';
            }
        } catch (error) {
            console.log('SD card not available');
        }
    }
    
    // Clean up old cache
    cleanupExpiredCache();
    
    // Initialize app
    initApp();
    
    // Prevent pull-to-refresh on mobile
    document.body.style.overscrollBehavior = 'none';
    
    // Android keyboard အတွက်
    window.addEventListener('orientationchange', function() {
        setTimeout(() => {
            if (document.activeElement && document.activeElement.blur) {
                document.activeElement.blur();
            }
        }, 100);
    });
    
    // Clean up on page unload
    window.addEventListener('beforeunload', function() {
        clearVideoCache();
    });
    
    // Handle visibility change
    document.addEventListener('visibilitychange', function() {
        if (document.hidden) {
            clearVideoCache();
        }
    });
});

// Android back button ကို handle လုပ်ခြင်း
document.addEventListener('backbutton', function(e) {
    e.preventDefault();
    if (currentStory) {
        currentStory = null;
        renderVideoList();
    } else if (videoPasswordModal.style.display === 'flex') {
        closeVideoPasswordModal();
    } else if (noInternetModal.style.display === 'flex') {
        noInternetModal.style.display = 'none';
    } else if (passwordResetModal.style.display === 'flex') {
        passwordResetModal.style.display = 'none';
    } else if (storageModal.style.display === 'flex') {
        storageModal.style.display = 'none';
    } else if (preloadProgressEl.style.display === 'block') {
        preloadProgressEl.style.display = 'none';
    } else {
        // Default back behavior
        if (document.getElementById('screen2').classList.contains('active')) {
            showScreen(1);
        }
    }
}, false);