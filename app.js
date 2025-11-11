// YouTube API Configuration
const YOUTUBE_API_KEY = 'AIzaSyBATxf5D7ZDeiQ61dbEdzEd4Tq72N713Y8';

// App State Management
let isMining = false;
let miningSeconds = 0;
let miningInterval = null;
let userPoints = 0;
let watchedVideos = 0;
let referrals = 0;

// ==================== ENHANCED USER SESSION MANAGEMENT ====================

// Generate session-based storage keys
function getSessionKey(key) {
    const urlParams = new URLSearchParams(window.location.search);
    const sessionId = urlParams.get('session') || 'default';
    const userId = urlParams.get('userid') || 'default_user';
    return `${key}_${sessionId}_${userId}`;
}

// Check if fresh start requested - ONLY when explicitly requested
function shouldStartFresh() {
    const urlParams = new URLSearchParams(window.location.search);
    const hasFresh = urlParams.has('fresh') || urlParams.has('clear_cache');
    
    if (hasFresh) {
        console.log('🔄 Fresh start requested via URL parameter');
        return true;
    }
    
    return false;
}

// Clear all existing data for fresh start
function clearExistingData() {
    const keysToRemove = [];
    for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && (key.includes('userProfile') || key.includes('transactionHistory') || 
            key.includes('referralData') || key.includes('watchedVideos') || 
            key.includes('miningState') || key.includes('followed'))) {
            keysToRemove.push(key);
        }
    }
    
    keysToRemove.forEach(key => localStorage.removeItem(key));
    console.log('🧹 Cleared existing data for fresh start');
}

// Initialize with session management
function initializeSession() {
    const urlParams = new URLSearchParams(window.location.search);
    
    // Only clear data if explicitly requested
    if (shouldStartFresh()) {
        clearExistingData();
        showNotification('🔄 Starting fresh session with new account!', 'success');
    } else {
        console.log('🔍 Continuing with existing session data');
    }
    
    // Generate session-specific keys
    const sessionUserProfileKey = getSessionKey('userProfile');
    const sessionTransactionKey = getSessionKey('transactionHistory');
    const sessionReferralKey = getSessionKey('referralData');
    const sessionMiningKey = getSessionKey('miningState');
    
    console.log(`🆕 Session initialized: ${sessionUserProfileKey}`);
    
    return {
        userProfileKey: sessionUserProfileKey,
        transactionKey: sessionTransactionKey,
        referralKey: sessionReferralKey,
        miningKey: sessionMiningKey
    };
}

// Initialize sessions
const sessionKeys = initializeSession();

// User Profile with Enhanced Session Management
let userProfile = JSON.parse(localStorage.getItem(sessionKeys.userProfileKey)) || {
    telegramUsername: '',
    userId: generateUserId(),
    joinDate: new Date().toISOString(),
    isPremium: false,
    level: 'Bronze',
    firstName: '',
    lastName: '',
    sessionId: new URLSearchParams(window.location.search).get('session') || 'default',
    isNewUser: true
};

// Check if this is a referred new user
function checkNewUserReferral() {
    const urlParams = new URLSearchParams(window.location.search);
    const isNewUser = urlParams.get('newuser') === 'true';
    const referralCode = urlParams.get('ref');
    
    if (isNewUser && referralCode && userProfile.isNewUser) {
        // Give welcome bonus to new referred user
        userPoints += 25;
        userProfile.isNewUser = false;
        addTransaction('welcome_bonus', 25, 'Welcome Bonus - Referred User', '🎁');
        showNotification('🎉 +25 Welcome Bonus! You were referred by a friend!', 'success');
        updateUI();
        
        console.log('✅ New referred user bonus awarded');
    }
}

// Transaction History with Session Management
let transactionHistory = JSON.parse(localStorage.getItem(sessionKeys.transactionKey)) || [];

// Add welcome bonus only for truly new users
if (transactionHistory.length === 0 && userProfile.isNewUser) {
    transactionHistory = [
        { type: 'welcome', amount: 25, description: 'Welcome Bonus', timestamp: Date.now(), icon: '🎁' }
    ];
    userPoints += 25;
    userProfile.isNewUser = false;
}

// Referral System with Session Management
let referralData = JSON.parse(localStorage.getItem(sessionKeys.referralKey)) || {
    referralCode: generateReferralCode(),
    referredUsers: [],
    totalEarned: 0,
    pendingReferrals: [],
    sessionId: new URLSearchParams(window.location.search).get('session') || 'default'
};

// YouTube Video State with Session Management
let currentVideoId = null;
let currentPoints = 0;
let currentTitle = '';
let videoTrackingInterval = null;

// Generate session-specific storage keys for videos
function getVideoStorageKey(baseKey) {
    return getSessionKey(baseKey);
}

let watchedVideoIds = JSON.parse(localStorage.getItem(getVideoStorageKey('watchedVideos'))) || [];
let watchedInstagramVideoIds = JSON.parse(localStorage.getItem(getVideoStorageKey('watchedInstagramVideos'))) || [];
let watchedTelegramVideoIds = JSON.parse(localStorage.getItem(getVideoStorageKey('watchedTelegramVideos'))) || [];
let watchedXVideoIds = JSON.parse(localStorage.getItem(getVideoStorageKey('watchedXVideos'))) || [];
let likedXTweetIds = JSON.parse(localStorage.getItem(getVideoStorageKey('likedXTweets'))) || [];
let retweetedXTweetIds = JSON.parse(localStorage.getItem(getVideoStorageKey('retweetedXTweets'))) || [];

// Follow State with Session Management
let followedInstagramAccounts = JSON.parse(localStorage.getItem(getVideoStorageKey('followedInstagramAccounts'))) || [];
let followedXAccounts = JSON.parse(localStorage.getItem(getVideoStorageKey('followedXAccounts'))) || [];
let followedTelegramChannels = JSON.parse(localStorage.getItem(getVideoStorageKey('followedTelegramChannels'))) || [];
let subscribedYouTubeChannels = JSON.parse(localStorage.getItem(getVideoStorageKey('subscribedYouTubeChannels'))) || [];

// Social Tasks Data
const SOCIAL_TASKS = {
    youtube: [
        {
            id: 'youtube_task_1',
            title: 'Subscribe to Tech Channel',
            description: 'Subscribe to our tech review channel',
            points: 40,
            platform: 'youtube',
            completed: false,
            icon: '📺'
        }
    ],
    twitter: [
        {
            id: 'twitter_task_1',
            title: 'Follow Tech News',
            description: 'Follow our tech news account',
            points: 25,
            platform: 'twitter',
            completed: false,
            icon: '🐦'
        }
    ],
    instagram: [
        {
            id: 'instagram_task_1',
            title: 'Follow Fashion Page',
            description: 'Follow our fashion inspiration page',
            points: 30,
            platform: 'instagram',
            completed: false,
            icon: '📷'
        }
    ],
    telegram: [
        {
            id: 'telegram_task_1',
            title: 'Join Crypto Channel',
            description: 'Join our crypto signals channel',
            points: 50,
            platform: 'telegram',
            completed: false,
            icon: '📱'
        }
    ]
};

// Real Instagram Videos Data
const REAL_INSTAGRAM_VIDEOS = [
    {
        id: 'instagram_real_1',
        video_url: 'https://example.com/instagram-reel-1.mp4',
        thumbnail: 'https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=300&h=400&fit=crop',
        title: '💃 Trending Dance Reel - Bollywood Style',
        username: 'dance.king.india',
        points: 15,
        likes: '2.5M',
        duration: '0:30',
        views: '15.2M',
        music: 'Bollywood Remix - DJ Chetas',
        type: 'reel'
    }
];

// Telegram Videos Data
const TELEGRAM_VIDEOS = [
    {
        id: 'telegram_ad_1',
        video_url: 'https://example.com/telegram-ad-1.mp4',
        thumbnail: 'https://images.unsplash.com/photo-1611605698335-8b1569810432?w=300&h=200&fit=crop',
        title: '📱 Crypto Trading Bot - Limited Offer',
        channel: 'Crypto Signals Pro',
        points: 18,
        duration: '0:45',
        views: '2.1M',
        type: 'ad',
        category: 'crypto'
    }
];

// X (Twitter) Content Data
const X_CONTENT = [
    {
        id: 'x_video_1',
        type: 'video',
        thumbnail: 'https://images.unsplash.com/photo-1611162616305-c69b3fa7fbe0?w=300&h=200&fit=crop',
        title: '🚀 SpaceX Rocket Launch - Amazing Footage',
        username: 'SpaceX',
        handle: '@SpaceX',
        points: 20,
        duration: '1:15',
        views: '2.5M',
        likes: '150K',
        retweets: '45K',
        timestamp: '2 hours ago',
        content: 'Watch our latest Falcon 9 launch and landing! 🚀✨',
        video_url: 'https://example.com/spacex-launch.mp4'
    }
];

// Follow Tasks Data
const FOLLOW_TASKS = {
    instagram: [
        {
            id: 'instagram_follow_1',
            username: 'fashion.ista',
            name: 'Fashion World',
            points: 25,
            followers: '2.5M',
            avatar: 'https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?w=150&h=150&fit=crop'
        }
    ],
    x: [
        {
            id: 'x_follow_1',
            username: 'TechNews',
            handle: '@TechUpdate',
            points: 25,
            followers: '2.1M',
            avatar: 'https://images.unsplash.com/photo-1611605698335-8b1569810432?w=150&h=150&fit=crop',
            description: 'Latest tech news and updates'
        }
    ],
    telegram: [
        {
            id: 'telegram_follow_1',
            channel: 'Crypto Signals Pro',
            points: 50,
            members: '125K',
            avatar: 'https://images.unsplash.com/photo-1621761191319-c6fb62004040?w=150&h=150&fit=crop',
            description: 'Premium crypto trading signals'
        }
    ],
    youtube: [
        {
            id: 'youtube_follow_1',
            channel: 'Tech Review Channel',
            points: 40,
            subscribers: '2.5M',
            avatar: 'https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=150&h=150&fit=crop',
            description: 'Tech product reviews and unboxing'
        }
    ]
};

// Leaderboard Data
const LEADERBOARD_DATA = [
    { rank: 1, name: 'CryptoKing', points: 15240, level: 'Diamond', avatar: '👑' },
    { rank: 2, name: 'EarnMaster', points: 12850, level: 'Platinum', avatar: '💎' },
    { rank: 3, name: 'TapPro', points: 11200, level: 'Gold', avatar: '⭐' },
    { rank: 8, name: 'You', points: 0, level: 'Bronze', avatar: '😊' }
];

// Generate Unique User ID
function generateUserId() {
    const urlParams = new URLSearchParams(window.location.search);
    const sessionId = urlParams.get('session') || 'default';
    const userId = urlParams.get('userid') || 'default_user';
    return 'USER_' + userId + '_' + sessionId;
}

// Generate Referral Code based on Session
function generateReferralCode() {
    const urlParams = new URLSearchParams(window.location.search);
    const sessionId = urlParams.get('session') || 'default';
    const userId = urlParams.get('userid') || 'default_user';
    
    if (userProfile.telegramUsername) {
        return 'TAPEARN_' + userProfile.telegramUsername.toUpperCase() + '_' + userId;
    } else {
        return 'TAPEARN_' + userId + '_' + sessionId;
    }
}

// Initialize App with Enhanced Session Management
document.addEventListener('DOMContentLoaded', function() {
    console.log('🆕 Initializing app with improved session management...');
    
    initializeTelegramIntegration();
    loadAppState();
    checkReferralOnStart();
    checkNewUserReferral();
    updateUI();
    
    console.log('🎯 TapEarn App Initialized - Improved Session System Active');
    console.log('🔑 Session Key:', sessionKeys.userProfileKey);
    console.log('👤 User ID:', userProfile.userId);
    console.log('💰 Current Points:', userPoints);
});

// Enhanced Telegram Mini App Integration
function initializeTelegramIntegration() {
    // Check if we're in Telegram Web App
    if (window.Telegram && window.Telegram.WebApp) {
        const tg = window.Telegram.WebApp;
        
        // Expand the app
        tg.expand();
        
        // Get user data from Telegram
        const user = tg.initDataUnsafe.user;
        if (user) {
            // Check if we already have this user's data
            const existingProfile = localStorage.getItem(sessionKeys.userProfileKey);
            
            if (!existingProfile) {
                // Only update if this is truly a new user
                userProfile.telegramUsername = user.username || '';
                userProfile.userId = 'TG_' + user.id;
                userProfile.firstName = user.first_name || '';
                userProfile.lastName = user.last_name || '';
                userProfile.sessionId = new URLSearchParams(window.location.search).get('session') || 'default';
                
                // Generate fresh referral code based on Telegram username
                referralData.referralCode = generateReferralCode();
                
                console.log('✅ New Telegram user detected:', userProfile);
                
                // Save updated profile with session key
                localStorage.setItem(sessionKeys.userProfileKey, JSON.stringify(userProfile));
                localStorage.setItem(sessionKeys.referralKey, JSON.stringify(referralData));
            } else {
                console.log('🔍 Existing Telegram user, keeping data');
            }
        }
        
        // Set theme
        document.documentElement.style.setProperty('--tg-theme-bg-color', tg.themeParams.bg_color || '#1a1a2e');
        document.documentElement.style.setProperty('--tg-theme-text-color', tg.themeParams.text_color || '#ffffff');
        document.documentElement.style.setProperty('--tg-theme-button-color', tg.themeParams.button_color || '#4CAF50');
        
    } else {
        // Simulate Telegram environment for development
        console.log('🚧 Development mode - Telegram Web App not detected');
        simulateTelegramEnvironment();
    }
}

// Enhanced Simulate Telegram environment
function simulateTelegramEnvironment() {
    const urlParams = new URLSearchParams(window.location.search);
    const existingProfile = localStorage.getItem(sessionKeys.userProfileKey);
    
    if (!existingProfile) {
        userProfile.telegramUsername = 'demo_user_' + Math.random().toString(36).substr(2, 5);
        userProfile.sessionId = new URLSearchParams(window.location.search).get('session') || 'default';
        localStorage.setItem(sessionKeys.userProfileKey, JSON.stringify(userProfile));
    }
    
    if (!referralData.referralCode) {
        referralData.referralCode = generateReferralCode();
        localStorage.setItem(sessionKeys.referralKey, JSON.stringify(referralData));
    }
}

// Enhanced Check for referral on app start
function checkReferralOnStart() {
    const urlParams = new URLSearchParams(window.location.search);
    const referralCode = urlParams.get('ref');
    const sessionId = urlParams.get('session') || 'default';
    
    // Create session-specific referral processed key
    const referralProcessedKey = `referralProcessed_${sessionId}`;
    
    if (referralCode && !localStorage.getItem(referralProcessedKey)) {
        processReferralJoin(referralCode);
        localStorage.setItem(referralProcessedKey, 'true');
    }
}

// Enhanced Process referral when new user joins
function processReferralJoin(referralCode) {
    // Prevent self-referral
    if (referralCode === referralData.referralCode) {
        console.log('❌ Self-referral detected');
        return;
    }
    
    // Extract referrer info from code
    const referrerUsername = referralCode.replace('TAPEARN_', '').split('_')[0].toLowerCase();
    
    // Add to pending referrals
    referralData.pendingReferrals.push({
        code: referralCode,
        referrer: referrerUsername,
        timestamp: Date.now(),
        status: 'pending'
    });
    
    // Save with session key
    localStorage.setItem(sessionKeys.referralKey, JSON.stringify(referralData));
    
    // Give welcome bonus to new user
    userPoints += 25;
    addTransaction('referral_bonus', 25, 'Welcome Bonus - Referred by ' + referrerUsername, '🎁');
    
    showNotification(`🎉 +25 Welcome Bonus! You were referred by ${referrerUsername}`, 'success');
    updateUI();
    
    console.log('✅ Referral processed for:', referrerUsername);
}

// Enhanced Load App State from Session Storage
function loadAppState() {
    const savedState = localStorage.getItem(sessionKeys.miningKey);
    if (savedState) {
        const state = JSON.parse(savedState);
        isMining = state.isMining || false;
        miningSeconds = state.miningSeconds || 0;
        userPoints = state.userPoints || 0;
        
        if (isMining) {
            startMining();
        }
    }
    
    // Load watched videos count
    watchedVideos = watchedVideoIds.length + watchedInstagramVideoIds.length + 
                   watchedTelegramVideoIds.length + watchedXVideoIds.length;
    
    // Load referrals count
    referrals = referralData.referredUsers.length;
    
    console.log('📊 Loaded app state:', { userPoints, watchedVideos, referrals });
}

// Enhanced Save App State to Session Storage
function saveAppState() {
    const miningState = {
        isMining: isMining,
        miningSeconds: miningSeconds,
        userPoints: userPoints,
        lastUpdated: Date.now(),
        sessionId: new URLSearchParams(window.location.search).get('session') || 'default'
    };
    localStorage.setItem(sessionKeys.miningKey, JSON.stringify(miningState));
    
    // Also save user profile and referral data
    localStorage.setItem(sessionKeys.userProfileKey, JSON.stringify(userProfile));
    localStorage.setItem(sessionKeys.transactionKey, JSON.stringify(transactionHistory));
    localStorage.setItem(sessionKeys.referralKey, JSON.stringify(referralData));
}

// Enhanced Add Transaction to History
function addTransaction(type, amount, description, icon) {
    const transaction = {
        type: type,
        amount: amount,
        description: description,
        timestamp: Date.now(),
        icon: icon,
        sessionId: new URLSearchParams(window.location.search).get('session') || 'default'
    };
    
    transactionHistory.unshift(transaction);
    
    if (transactionHistory.length > 50) {
        transactionHistory = transactionHistory.slice(0, 50);
    }
    
    localStorage.setItem(sessionKeys.transactionKey, JSON.stringify(transactionHistory));
    saveAppState(); // Auto-save after transaction
}

// Enhanced Save Video Watched State
function saveVideoState(storageKey, videoArray) {
    localStorage.setItem(getVideoStorageKey(storageKey), JSON.stringify(videoArray));
    saveAppState(); // Auto-save after video state change
}

// Enhanced Save Follow State
function saveFollowState(storageKey, followArray) {
    localStorage.setItem(getVideoStorageKey(storageKey), JSON.stringify(followArray));
    saveAppState(); // Auto-save after follow state change
}

// Update UI
function updateUI() {
    // Safe DOM updates with null checks
    const walletPointsEl = document.getElementById('walletPoints');
    const totalPointsEl = document.getElementById('totalPoints');
    const videosWatchedEl = document.getElementById('videosWatched');
    const totalReferralsEl = document.getElementById('totalReferrals');
    
    if (walletPointsEl) walletPointsEl.textContent = formatNumber(userPoints);
    if (totalPointsEl) totalPointsEl.textContent = formatNumber(userPoints);
    if (videosWatchedEl) videosWatchedEl.textContent = watchedVideos;
    if (totalReferralsEl) totalReferralsEl.textContent = referrals;
    
    updateMiningTimerDisplay();
    saveAppState(); // Auto-save when UI updates
}

// Format numbers with commas
function formatNumber(num) {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

// Update Mining Timer Display
function updateMiningTimerDisplay() {
    const miningTimeEl = document.getElementById('miningTime');
    if (!miningTimeEl) return;
    
    const hours = Math.floor(miningSeconds / 3600);
    const minutes = Math.floor((miningSeconds % 3600) / 60);
    const seconds = miningSeconds % 60;
    
    miningTimeEl.textContent = 
        `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
}

// Toggle Mining
function toggleMining() {
    if (isMining) {
        stopMining();
    } else {
        startMining();
    }
}

// Start Mining
function startMining() {
    if (isMining) return;
    
    isMining = true;
    const miningCard = document.querySelector('.main-feature-card');
    if (miningCard) miningCard.classList.add('mining-active');
    
    const miningStatusText = document.getElementById('miningStatusText');
    const miningRate = document.getElementById('miningRate');
    
    if (miningStatusText) {
        miningStatusText.textContent = 'Mining Active - 5 pts/min';
        miningStatusText.style.color = '#FFD700';
    }
    if (miningRate) miningRate.textContent = '300/hr';
    
    if (miningInterval) {
        clearInterval(miningInterval);
        miningInterval = null;
    }
    
    let lastMinuteCheck = Math.floor(miningSeconds / 60);
    let lastHourCheck = Math.floor(miningSeconds / 3600);
    
    miningInterval = setInterval(() => {
        miningSeconds++;
        
        updateMiningTimerDisplay();
        
        const currentMinute = Math.floor(miningSeconds / 60);
        const currentHour = Math.floor(miningSeconds / 3600);
        
        if (currentMinute > lastMinuteCheck) {
            userPoints += 5;
            addTransaction('mining', 5, 'Mining Points', '⛏️');
            updateUI();
            showNotification('⛏️ +5 Points from Mining!', 'success');
            lastMinuteCheck = currentMinute;
        }
        
        if (currentHour > lastHourCheck) {
            userPoints += 50;
            addTransaction('bonus', 50, 'Hourly Mining Bonus', '🎉');
            updateUI();
            showNotification('🎉 +50 Bonus Points! 1 Hour Complete!', 'success');
            lastHourCheck = currentHour;
        }
        
        saveAppState();
        
    }, 1000);
    
    showNotification('⛏️ Mining Started! Earning 5 points per minute...', 'success');
    saveAppState();
}

// Stop Mining
function stopMining() {
    if (!isMining) return;
    
    isMining = false;
    
    if (miningInterval) {
        clearInterval(miningInterval);
        miningInterval = null;
    }
    
    const miningCard = document.querySelector('.main-feature-card');
    const miningStatusText = document.getElementById('miningStatusText');
    
    if (miningCard) miningCard.classList.remove('mining-active');
    if (miningStatusText) {
        miningStatusText.textContent = 'Click to start mining';
        miningStatusText.style.color = '';
    }
    
    showNotification('⏹️ Mining Stopped. Points saved!', 'info');
    saveAppState();
}

// Claim Boost
function claimBoost() {
    userPoints += 100;
    addTransaction('boost', 100, 'Daily Boost', '🚀');
    updateUI();
    showNotification('🚀 +100 Points! Boost claimed successfully!', 'success');
}

// Show Wallet Details with Earnings Breakdown
function showWalletDetails() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const todayEarnings = transactionHistory
        .filter(t => new Date(t.timestamp) >= today && t.amount > 0)
        .reduce((sum, t) => sum + t.amount, 0);
    
    const allTimeEarnings = transactionHistory
        .filter(t => t.amount > 0)
        .reduce((sum, t) => sum + t.amount, 0);
    
    const appContent = document.getElementById('appContent');
    if (!appContent) return;
    
    appContent.innerHTML = `
        <div class="wallet-details">
            <div class="section-header">
                <button onclick="showDashboard()" class="back-btn">← Back</button>
                <h3>💰 Wallet Details</h3>
            </div>
            
            <div class="wallet-summary-card">
                <div class="wallet-total">
                    <div class="total-amount">${formatNumber(userPoints)}</div>
                    <div class="total-label">Total Points</div>
                </div>
                
                <div class="wallet-earnings-breakdown">
                    <div class="earning-item">
                        <div class="earning-icon">📅</div>
                        <div class="earning-info">
                            <div class="earning-title">Today's Earnings</div>
                            <div class="earning-amount positive">+${todayEarnings}</div>
                        </div>
                    </div>
                    
                    <div class="earning-item">
                        <div class="earning-icon">⏳</div>
                        <div class="earning-info">
                            <div class="earning-title">All Time Earnings</div>
                            <div class="earning-amount positive">+${allTimeEarnings}</div>
                        </div>
                    </div>
                    
                    <div class="earning-item">
                        <div class="earning-icon">💸</div>
                        <div class="earning-info">
                            <div class="earning-title">Total Redeemed</div>
                            <div class="earning-amount negative">-${allTimeEarnings - userPoints}</div>
                        </div>
                    </div>
                </div>
            </div>
            
            <div class="wallet-actions">
                <button class="wallet-action-btn" onclick="showWalletHistory()">
                    <span class="action-icon">📊</span>
                    <span class="action-text">Transaction History</span>
                </button>
                
                <button class="wallet-action-btn" onclick="showCashier()">
                    <span class="action-icon">💰</span>
                    <span class="action-text">Redeem Rewards</span>
                </button>
                
                <button class="wallet-action-btn" onclick="showReferralSystem()">
                    <span class="action-icon">👥</span>
                    <span class="action-text">Refer & Earn</span>
                </button>
            </div>
            
            <div class="earning-stats">
                <h4>📈 Earning Statistics</h4>
                <div class="stats-grid">
                    <div class="stat-item">
                        <div class="stat-value">${watchedVideos}</div>
                        <div class="stat-label">Videos Watched</div>
                    </div>
                    <div class="stat-item">
                        <div class="stat-value">${referrals}</div>
                        <div class="stat-label">Referrals</div>
                    </div>
                    <div class="stat-item">
                        <div class="stat-value">${Math.floor(miningSeconds / 3600)}h</div>
                        <div class="stat-label">Mining Time</div>
                    </div>
                    <div class="stat-item">
                        <div class="stat-value">${followedInstagramAccounts.length + followedXAccounts.length + followedTelegramChannels.length + subscribedYouTubeChannels.length}</div>
                        <div class="stat-label">Accounts Followed</div>
                    </div>
                </div>
            </div>
        </div>
    `;
}

// Show Referral System with Enhanced Session Management
function showReferralSystem() {
    const totalEarned = referralData.referredUsers.reduce((sum, user) => sum + user.pointsEarned, 0);
    const pendingCount = referralData.pendingReferrals.length;
    
    const appContent = document.getElementById('appContent');
    if (!appContent) return;
    
    appContent.innerHTML = `
        <div class="referral-section">
            <div class="section-header">
                <button onclick="showDashboard()" class="back-btn">← Back</button>
                <h3>👥 Refer & Earn</h3>
            </div>
            
            <div class="user-profile-card">
                <div class="profile-avatar">👤</div>
                <div class="profile-details">
                    <div class="profile-name">${userProfile.telegramUsername || 'User'}</div>
                    <div class="profile-level">${userProfile.level} Level</div>
                    <div class="profile-session">Session: ${userProfile.sessionId.substring(0, 8)}...</div>
                </div>
            </div>
            
            <div class="referral-card">
                <div class="referral-code">${referralData.referralCode}</div>
                <p class="referral-note">Your unique Telegram referral code</p>
                
                <div class="referral-stats">
                    <div class="referral-stat">
                        <span class="stat-value">${referralData.referredUsers.length}</span>
                        <span class="stat-label">Confirmed</span>
                    </div>
                    <div class="referral-stat">
                        <span class="stat-value">${pendingCount}</span>
                        <span class="stat-label">Pending</span>
                    </div>
                    <div class="referral-stat">
                        <span class="stat-value">${totalEarned}</span>
                        <span class="stat-label">Earned</span>
                    </div>
                </div>
                
                <div class="sharing-options">
                    <button class="share-btn telegram" onclick="shareOnTelegramWithDeepLink()">
                        📱 Share on Telegram
                    </button>
                    <button class="share-btn copy" onclick="copyReferralWithDeepLink()">
                        📋 Copy Referral Link
                    </button>
                    <button class="share-btn whatsapp" onclick="shareOnWhatsAppWithDeepLink()">
                        💚 Share on WhatsApp
                    </button>
                </div>
                
                ${pendingCount > 0 ? `
                    <div class="pending-referrals">
                        <h4>⏳ Pending Referrals (${pendingCount})</h4>
                        <div class="pending-list">
                            ${referralData.pendingReferrals.map(ref => `
                                <div class="pending-item">
                                    <span class="pending-user">${ref.referrer}</span>
                                    <span class="pending-status">Waiting confirmation</span>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                ` : ''}
                
                <button onclick="addTestReferral()" class="action-btn primary" style="margin-top: 15px;">
                    👥 Add Test Referral
                </button>
            </div>
            
            <div class="referral-benefits">
                <h4>🎁 How Referral Works</h4>
                <ul>
                    <li>✅ Share your unique Telegram referral link</li>
                    <li>✅ Friends join using YOUR link</li>
                    <li>✅ You get <strong>50 points</strong> when they sign up</li>
                    <li>✅ Your friend gets <strong>25 bonus points</strong></li>
                    <li>✅ Track all referrals in real-time</li>
                </ul>
            </div>
        </div>
    `;
}

// Share with Telegram Deep Link
function shareOnTelegramWithDeepLink() {
    const referralLink = `https://t.me/tapearn_bot?start=ref${userProfile.userId}`;
    const message = `Join TapEarn and earn free points! Use my referral code: ${referralData.referralCode}\n\nGet your bonus: ${referralLink}`;
    
    const shareUrl = `https://t.me/share/url?url=${encodeURIComponent(referralLink)}&text=${encodeURIComponent(message)}`;
    window.open(shareUrl, '_blank');
    showNotification('✅ Telegram sharing opened! Share with your friends.', 'success');
}

// Copy referral link with deep link
function copyReferralWithDeepLink() {
    const referralLink = `https://t.me/tapearn_bot?start=ref${userProfile.userId}`;
    const referralText = `Join TapEarn using my referral! \nCode: ${referralData.referralCode}\nLink: ${referralLink}\n\nGet 25 bonus points when you join!`;
    
    navigator.clipboard.writeText(referralText)
        .then(() => showNotification('✅ Referral link copied! Share with friends.', 'success'))
        .catch(() => showNotification('❌ Failed to copy', 'warning'));
}

// Share on WhatsApp with Deep Link
function shareOnWhatsAppWithDeepLink() {
    const referralLink = `https://t.me/tapearn_bot?start=ref${userProfile.userId}`;
    const message = `Join TapEarn and earn free points! Use my referral code: ${referralData.referralCode}\n\nGet your bonus: ${referralLink}`;
    
    const shareUrl = `https://wa.me/?text=${encodeURIComponent(message)}`;
    window.open(shareUrl, '_blank');
    showNotification('✅ WhatsApp sharing opened!', 'success');
}

// Add test referral (for demo purposes)
function addTestReferral() {
    const testUsername = 'test_user_' + Math.random().toString(36).substr(2, 5);
    
    // Add to referred users
    referralData.referredUsers.push({
        username: testUsername,
        pointsEarned: 50,
        timestamp: Date.now()
    });
    
    // Update points
    userPoints += 50;
    referrals = referralData.referredUsers.length;
    
    // Add transaction
    addTransaction('referral', 50, 'Referral: ' + testUsername, '👥');
    
    // Save data
    localStorage.setItem(sessionKeys.referralKey, JSON.stringify(referralData));
    
    // Update UI
    updateUI();
    showNotification(`🎉 +50 Points! New referral from ${testUsername}`, 'success');
    
    // Refresh referral section
    showReferralSystem();
}

// Show Wallet History
function showWalletHistory() {
    const appContent = document.getElementById('appContent');
    if (!appContent) return;
    
    appContent.innerHTML = `
        <div class="wallet-history">
            <div class="section-header">
                <button onclick="showWalletDetails()" class="back-btn">← Back</button>
                <h3>💰 Wallet History</h3>
            </div>
            
            <div class="wallet-summary">
                <div class="wallet-balance">${formatNumber(userPoints)}</div>
                <div class="wallet-label">Total Points</div>
            </div>
            
            <div class="transaction-list">
                ${transactionHistory.length > 0 ? 
                    transactionHistory.map(transaction => `
                        <div class="transaction-item">
                            <div class="transaction-icon">${transaction.icon}</div>
                            <div class="transaction-details">
                                <div class="transaction-title">${transaction.description}</div>
                                <div class="transaction-time">${new Date(transaction.timestamp).toLocaleString()}</div>
                            </div>
                            <div class="transaction-amount ${transaction.amount > 0 ? 'positive' : 'negative'}">
                                ${transaction.amount > 0 ? '+' : ''}${transaction.amount}
                            </div>
                        </div>
                    `).join('') 
                    : 
                    '<div class="no-transactions">No transactions yet</div>'
                }
            </div>
        </div>
    `;
}

// Show Dashboard (Home)
function showDashboard() {
    const appContent = document.getElementById('appContent');
    if (!appContent) return;
    
    appContent.innerHTML = `
        <div class="welcome-message">
            <div class="stats-grid-mini">
                <div class="stat-card-mini">
                    <span class="stat-number-mini">${formatNumber(userPoints)}</span>
                    <span class="stat-label-mini">Total Points</span>
                </div>
                <div class="stat-card-mini">
                    <span class="stat-number-mini">${watchedVideos}</span>
                    <span class="stat-label-mini">Videos</span>
                </div>
                <div class="stat-card-mini">
                    <span class="stat-number-mini">${referrals}</span>
                    <span class="stat-label-mini">Referrals</span>
                </div>
            </div>
            <p class="welcome-note">Start mining or complete tasks to earn more points!</p>
        </div>
    `;
}

// Show Leaderboard
function showLeaderboard() {
    // Update "You" in leaderboard with current points
    const updatedLeaderboard = LEADERBOARD_DATA.map(user => 
        user.name === 'You' ? {...user, points: userPoints} : user
    ).sort((a, b) => b.points - a.points)
    .map((user, index) => ({...user, rank: index + 1}));

    const userRank = updatedLeaderboard.find(u => u.name === 'You')?.rank || 8;
    const userLevel = userPoints >= 10000 ? 'Diamond' : 
                     userPoints >= 5000 ? 'Platinum' : 
                     userPoints >= 2000 ? 'Gold' : 
                     userPoints >= 1000 ? 'Silver' : 'Bronze';

    const appContent = document.getElementById('appContent');
    if (!appContent) return;
    
    appContent.innerHTML = `
        <div class="leaderboard-section">
            <div class="section-header">
                <button onclick="showDashboard()" class="back-btn">← Back</button>
                <h3>🏆 Global Leaderboard</h3>
            </div>
            
            <div class="user-rank-card">
                <div class="user-rank-info">
                    <div class="user-rank">#${userRank}</div>
                    <div class="user-details">
                        <div class="user-name">You</div>
                        <div class="user-points">${formatNumber(userPoints)} points</div>
                    </div>
                    <div class="user-level-badge ${userLevel.toLowerCase()}">${userLevel}</div>
                </div>
            </div>
            
            <div class="leaderboard-list">
                ${updatedLeaderboard.map(user => `
                    <div class="leaderboard-item ${user.name === 'You' ? 'current-user' : ''}">
                        <div class="user-rank">${user.rank}</div>
                        <div class="user-avatar">${user.avatar}</div>
                        <div class="user-info">
                            <div class="user-name">${user.name}</div>
                            <div class="user-level ${user.level.toLowerCase()}">${user.level}</div>
                        </div>
                        <div class="user-points">${formatNumber(user.points)}</div>
                    </div>
                `).join('')}
            </div>
        </div>
    `;
}

// Show Support Section
function showSupport() {
    const appContent = document.getElementById('appContent');
    if (!appContent) return;
    
    appContent.innerHTML = `
        <div class="support-section">
            <div class="section-header">
                <button onclick="showDashboard()" class="back-btn">← Back</button>
                <h3>💬 Support Center</h3>
            </div>
            
            <div class="support-cards">
                <div class="support-card">
                    <div class="support-icon">❓</div>
                    <h4>FAQ</h4>
                    <p>Find answers to common questions</p>
                    <button class="support-btn" onclick="showFAQ()">View FAQ</button>
                </div>
                
                <div class="support-card">
                    <div class="support-icon">📧</div>
                    <h4>Contact Us</h4>
                    <p>Get help from our support team</p>
                    <button class="support-btn" onclick="showContactForm()">Contact</button>
                </div>
                
                <div class="support-card">
                    <div class="support-icon">🐛</div>
                    <h4>Report Issue</h4>
                    <p>Report bugs or problems</p>
                    <button class="support-btn" onclick="showReportForm()">Report</button>
                </div>
            </div>
        </div>
    `;
}

// Show FAQ
function showFAQ() {
    const appContent = document.getElementById('appContent');
    if (!appContent) return;
    
    appContent.innerHTML = `
        <div class="faq-section">
            <div class="section-header">
                <button onclick="showSupport()" class="back-btn">← Back</button>
                <h3>❓ Frequently Asked Questions</h3>
            </div>
            
            <div class="faq-list">
                <div class="faq-item">
                    <div class="faq-question">How do I earn points?</div>
                    <div class="faq-answer">You can earn points by mining, watching videos, following accounts, completing tasks, and referring friends.</div>
                </div>
                
                <div class="faq-item">
                    <div class="faq-question">When can I redeem my points?</div>
                    <div class="faq-answer">You can redeem points once you reach the minimum threshold for each reward type (usually 1000 points).</div>
                </div>
                
                <div class="faq-item">
                    <div class="faq-question">Is there a daily limit?</div>
                    <div class="faq-answer">No, you can earn unlimited points by completing various tasks and watching videos.</div>
                </div>
            </div>
        </div>
    `;
}

// Show Video Section
function showVideoSection() {
    const appContent = document.getElementById('appContent');
    if (!appContent) return;
    
    appContent.innerHTML = `
        <div class="video-section">
            <div class="video-platform-tabs">
                <button class="platform-tab active" onclick="showYouTubeTab()">YouTube</button>
                <button class="platform-tab" onclick="showInstagramTab()">Instagram</button>
            </div>
            <div class="search-container">
                <input type="text" id="youtubeSearchInput" placeholder="Search YouTube Shorts..." value="trending shorts">
                <button onclick="searchYouTubeVideos()">🔍 Search</button>
            </div>
            <div id="videoResultsContainer">
                <div class="loading">
                    <div class="spinner"></div>
                    <p>Loading YouTube videos...</p>
                </div>
            </div>
        </div>
    `;
    searchYouTubeVideos();
}

// Show YouTube Tab
function showYouTubeTab() {
    document.querySelectorAll('.platform-tab').forEach(tab => tab.classList.remove('active'));
    event.target.classList.add('active');
    
    const appContent = document.getElementById('appContent');
    if (!appContent) return;
    
    appContent.innerHTML = `
        <div class="video-section">
            <div class="video-platform-tabs">
                <button class="platform-tab active" onclick="showYouTubeTab()">YouTube</button>
                <button class="platform-tab" onclick="showInstagramTab()">Instagram</button>
            </div>
            <div class="search-container">
                <input type="text" id="youtubeSearchInput" placeholder="Search YouTube Shorts..." value="trending shorts">
                <button onclick="searchYouTubeVideos()">🔍 Search</button>
            </div>
            <div id="videoResultsContainer">
                <div class="loading">
                    <div class="spinner"></div>
                    <p>Loading YouTube videos...</p>
                </div>
            </div>
        </div>
    `;
    searchYouTubeVideos();
}

// Show Instagram Tab
function showInstagramTab() {
    document.querySelectorAll('.platform-tab').forEach(tab => tab.classList.remove('active'));
    event.target.classList.add('active');
    
    const appContent = document.getElementById('appContent');
    if (!appContent) return;
    
    appContent.innerHTML = `
        <div class="video-section">
            <div class="video-platform-tabs">
                <button class="platform-tab" onclick="showYouTubeTab()">YouTube</button>
                <button class="platform-tab active" onclick="showInstagramTab()">Instagram</button>
            </div>
            
            <div class="instagram-categories">
                <button class="category-btn active" onclick="showInstagramReels()">🎬 Reels</button>
                <button class="category-btn" onclick="showInstagramFollow()">👤 Follow</button>
            </div>
            
            <div id="instagramResultsContainer">
                <div class="loading">
                    <div class="spinner"></div>
                    <p>Loading Instagram videos...</p>
                </div>
            </div>
        </div>
    `;
    showInstagramReels();
}

// Show Instagram Reels
function showInstagramReels() {
    document.querySelectorAll('.category-btn').forEach(btn => btn.classList.remove('active'));
    event.target.classList.add('active');
    
    const reels = REAL_INSTAGRAM_VIDEOS.filter(video => video.type === 'reel');
    displayInstagramVideos(reels, 'Instagram Reels');
}

// Show Instagram Follow
function showInstagramFollow() {
    document.querySelectorAll('.category-btn').forEach(btn => btn.classList.remove('active'));
    event.target.classList.add('active');
    
    displayInstagramFollowAccounts();
}

// Display Instagram Follow Accounts
function displayInstagramFollowAccounts() {
    const container = document.getElementById('instagramResultsContainer');
    if (!container) return;
    
    let html = `
        <div class="section-title">
            <h3>👤 Instagram Follow</h3>
            <p class="section-subtitle">Follow accounts and earn points</p>
        </div>
        <div class="follow-accounts-grid">
    `;
    
    FOLLOW_TASKS.instagram.forEach(account => {
        const isFollowed = followedInstagramAccounts.includes(account.id);
        
        html += `
            <div class="follow-account-card">
                <div class="account-avatar">
                    <img src="${account.avatar}" alt="${account.username}">
                </div>
                <div class="account-details">
                    <h4 class="account-name">${account.name}</h4>
                    <p class="account-username">@${account.username}</p>
                    <p class="account-followers">${account.followers} followers</p>
                </div>
                <div class="account-actions">
                    ${isFollowed ? 
                        '<span class="follow-btn followed">✅ Followed</span>' : 
                        `<button class="follow-btn" onclick="followInstagramAccount('${account.id}', ${account.points}, '${account.username}')">Follow +${account.points}</button>`
                    }
                </div>
            </div>
        `;
    });
    
    html += '</div>';
    container.innerHTML = html;
}

// Follow Instagram Account
function followInstagramAccount(accountId, points, username) {
    if (followedInstagramAccounts.includes(accountId)) {
        showNotification('❌ You have already followed this account!', 'warning');
        return;
    }
    
    userPoints += points;
    followedInstagramAccounts.push(accountId);
    saveFollowState('followedInstagramAccounts', followedInstagramAccounts);
    addTransaction('instagram_follow', points, 'Instagram Follow: ' + username, '👤');
    updateUI();
    showNotification(`✅ +${points} Points! You followed @${username}`, 'success');
    
    // Refresh the Instagram follow section to update the UI
    showInstagramFollow();
}

// Display Instagram Videos
function displayInstagramVideos(videos, title) {
    const container = document.getElementById('instagramResultsContainer');
    if (!container) return;
    
    let html = `
        <div class="section-title">
            <h3>📷 ${title}</h3>
            <p class="section-subtitle">${videos.length} videos found</p>
        </div>
        <div class="videos-grid">
    `;
    
    videos.forEach((video) => {
        const isWatched = watchedInstagramVideoIds.includes(video.id);
        
        html += `
            <div class="video-card instagram-card" onclick="selectInstagramVideo('${video.id}', ${video.points}, '${video.title.replace(/'/g, "\\'")}', '${video.username.replace(/'/g, "\\'")}')">
                <div class="thumbnail">
                    <img src="${video.thumbnail}" alt="${video.title}">
                    <div class="points-badge">+${video.points} pts</div>
                    <div class="instagram-badge">${video.type === 'story' ? 'Story' : 'Reel'}</div>
                    <div class="video-duration">${video.duration}</div>
                </div>
                <div class="video-details">
                    <h4 class="video-title">${video.title}</h4>
                    <div class="video-meta">
                        <span class="channel">@${video.username}</span>
                        <span class="video-likes">❤️ ${video.likes}</span>
                    </div>
                    <div class="video-meta">
                        <span class="video-views">👁️ ${video.views}</span>
                        ${isWatched ? 
                            '<span class="watch-now watched">✅ Earned</span>' : 
                            '<span class="watch-now">▶️ Watch</span>'
                        }
                    </div>
                </div>
            </div>
        `;
    });
    
    html += '</div>';
    container.innerHTML = html;
}

// Select Instagram Video for Earning
function selectInstagramVideo(videoId, points, title, username) {
    if (watchedInstagramVideoIds.includes(videoId)) {
        showNotification('❌ You have already earned points for this video!', 'warning');
        return;
    }
    
    currentVideoId = videoId;
    currentPoints = points;
    currentTitle = title;
    
    const videoData = REAL_INSTAGRAM_VIDEOS.find(v => v.id === videoId);
    const appContent = document.getElementById('appContent');
    if (!appContent) return;
    
    appContent.innerHTML = `
        <div class="video-player-section">
            <div class="section-header">
                <button onclick="showInstagramTab()" class="back-btn">← Back to Instagram</button>
                <h3>🎯 Earn Points</h3>
            </div>
            
            <div class="instagram-player-container">
                <div class="instagram-player-header">
                    <div class="instagram-user-info">
                        <div class="user-avatar">👤</div>
                        <div class="user-details">
                            <div class="username">@${username}</div>
                            <div class="location">Instagram</div>
                        </div>
                    </div>
                </div>
                
                <div class="instagram-video-placeholder">
                    <div class="instagram-logo">📷</div>
                    <h3>Instagram ${videoData.type === 'story' ? 'Story' : 'Reel'}</h3>
                    <p>"${title}"</p>
                    <div class="instagram-stats">
                        <span>❤️ ${videoData.likes}</span>
                        <span>👁️ ${videoData.views}</span>
                    </div>
                </div>
            </div>
            
            <div class="video-timer instagram-timer">
                <p>⏰ <strong>Watch for 1 minute to earn ${points} points</strong></p>
                <p class="timer-note">Don't close this page - points awarded automatically</p>
            </div>
            
            <div class="tracking-section">
                <div class="tracking-status">
                    <div class="status-indicator" id="statusIndicator"></div>
                    <div class="status-text" id="statusText">
                        🎯 Ready to earn ${points} points
                    </div>
                </div>
                
                <div class="progress-container">
                    <div class="progress-bar">
                        <div class="progress-fill" id="progressFill"></div>
                    </div>
                    <div class="progress-text" id="progressText">
                        Waiting for video completion...
                    </div>
                </div>
                
                <div class="tracking-controls">
                    <button onclick="cancelVideoEarning()" class="cancel-btn">
                        ❌ Cancel Earning
                    </button>
                </div>
            </div>
        </div>
    `;
    
    startVideoTracking();
}

// Search YouTube Videos
async function searchYouTubeVideos() {
    const query = document.getElementById('youtubeSearchInput')?.value.trim() || 'trending shorts';
    const container = document.getElementById('videoResultsContainer');
    if (!container) return;
    
    container.innerHTML = `
        <div class="loading">
            <div class="spinner"></div>
            <p>Searching YouTube for "${query}"...</p>
        </div>
    `;

    try {
        // For demo purposes, show demo videos
        showDemoVideos();
    } catch (error) {
        console.error('YouTube search failed:', error);
        showDemoVideos();
    }
}

// Show Demo Videos Fallback
function showDemoVideos() {
    const demoVideos = [
        {
            id: { videoId: 'demo1' },
            snippet: {
                title: '🎵 Trending Music Short 2024',
                thumbnails: { 
                    medium: { url: 'https://via.placeholder.com/300/FF6B6B/FFFFFF?text=Music+Short' }
                },
                channelTitle: 'Music Channel'
            }
        },
        {
            id: { videoId: 'demo2' },
            snippet: {
                title: '😂 Funny Comedy Skit',
                thumbnails: { 
                    medium: { url: 'https://via.placeholder.com/300/4ECDC4/FFFFFF?text=Comedy+Short' }
                },
                channelTitle: 'Comedy Central'
            }
        }
    ];
    
    displayYouTubeVideos(demoVideos, 'demo videos');
}

// Display YouTube Videos
function displayYouTubeVideos(videos, query) {
    const container = document.getElementById('videoResultsContainer');
    if (!container) return;
    
    let html = `
        <div class="section-title">
            <h3>🎥 YouTube Shorts</h3>
            <p class="section-subtitle">Found ${videos.length} videos for "${query}"</p>
        </div>
        <div class="videos-grid">
    `;
    
    videos.forEach((video) => {
        const videoId = video.id.videoId;
        const thumbnail = video.snippet.thumbnails.medium?.url || video.snippet.thumbnails.default.url;
        const title = video.snippet.title;
        const channel = video.snippet.channelTitle;
        const points = calculatePoints(title);
        const isWatched = watchedVideoIds.includes(videoId);
        
        html += `
            <div class="video-card youtube-card" onclick="selectYouTubeVideo('${videoId}', ${points}, '${title.replace(/'/g, "\\'")}', '${channel.replace(/'/g, "\\'")}')">
                <div class="thumbnail">
                    <img src="${thumbnail}" alt="${title}">
                    <div class="points-badge">+${points} pts</div>
                    <div class="youtube-badge">YouTube</div>
                </div>
                <div class="video-details">
                    <h4 class="video-title">${title}</h4>
                    <div class="video-meta">
                        <span class="channel">${channel}</span>
                        ${isWatched ? 
                            '<span class="watch-now watched">✅ Earned</span>' : 
                            '<span class="watch-now">▶️ Watch</span>'
                        }
                    </div>
                </div>
            </div>
        `;
    });
    
    html += '</div>';
    container.innerHTML = html;
}

// Calculate Points for Video
function calculatePoints(title) {
    const basePoints = 10;
    const bonus = Math.floor(Math.random() * 6);
    return basePoints + bonus;
}

// Select YouTube Video for Earning
function selectYouTubeVideo(videoId, points, title, channel) {
    if (watchedVideoIds.includes(videoId)) {
        showNotification('❌ You have already earned points for this video!', 'warning');
        return;
    }
    
    currentVideoId = videoId;
    currentPoints = points;
    currentTitle = title;
    
    const appContent = document.getElementById('appContent');
    if (!appContent) return;
    
    appContent.innerHTML = `
        <div class="video-player-section">
            <div class="section-header">
                <button onclick="showVideoSection()" class="back-btn">← Back to Videos</button>
                <h3>🎯 Earn Points</h3>
            </div>
            
            <div class="youtube-iframe-container">
                <div class="video-placeholder">
                    <div class="youtube-logo">🎬</div>
                    <h3>YouTube Short</h3>
                    <p>"${title}"</p>
                    <div class="video-stats">
                        <span>⏱️ 0:30</span>
                        <span>👁️ 1.2M views</span>
                        <span>💰 +${points} points</span>
                    </div>
                </div>
            </div>
            
            <div class="video-timer">
                <p>⏰ <strong>Watch for 1 minute to earn ${points} points</strong></p>
                <p class="timer-note">Don't close this page - points awarded automatically</p>
            </div>
            
            <div class="tracking-section">
                <div class="tracking-status">
                    <div class="status-indicator" id="statusIndicator"></div>
                    <div class="status-text" id="statusText">
                        🎯 Ready to earn ${points} points
                    </div>
                </div>
                
                <div class="progress-container">
                    <div class="progress-bar">
                        <div class="progress-fill" id="progressFill"></div>
                    </div>
                    <div class="progress-text" id="progressText">
                        Waiting for video completion...
                    </div>
                </div>
                
                <div class="tracking-controls">
                    <button onclick="cancelVideoEarning()" class="cancel-btn">
                        ❌ Cancel Earning
                    </button>
                </div>
            </div>
        </div>
    `;
    
    startVideoTracking();
}

// Start Video Tracking
function startVideoTracking() {
    let trackingTime = 0;
    const maxTrackingTime = 60;
    
    videoTrackingInterval = setInterval(() => {
        trackingTime++;
        updateVideoTrackingProgress(trackingTime, maxTrackingTime);
        
        if (trackingTime >= maxTrackingTime) {
            clearInterval(videoTrackingInterval);
            completeVideoEarning();
        }
    }, 1000);
}

// Update Video Tracking Progress
function updateVideoTrackingProgress(current, max) {
    const progressFill = document.getElementById('progressFill');
    const progressText = document.getElementById('progressText');
    const statusText = document.getElementById('statusText');
    
    if (progressFill && progressText) {
        const percentage = (current / max) * 100;
        progressFill.style.width = `${percentage}%`;
        
        const timeLeft = max - current;
        
        if (current < 10) {
            progressText.innerHTML = `⏳ Video started... (${current}s/60s) - ${timeLeft}s left`;
            statusText.innerHTML = '🎬 Video playing...';
        } else if (current < 30) {
            progressText.innerHTML = `📺 Video in progress... (${current}s/60s) - ${timeLeft}s left`;
            statusText.innerHTML = '⏱️ Keep watching...';
        } else if (current < 50) {
            progressText.innerHTML = `✅ Halfway done... (${current}s/60s) - ${timeLeft}s left`;
            statusText.innerHTML = '💰 Almost there...';
        } else {
            progressText.innerHTML = `🎉 Almost done... (${current}s/60s) - ${timeLeft}s left`;
            statusText.innerHTML = '⚡ Points coming soon!';
        }
    }
}

// Complete Video Earning
function completeVideoEarning() {
    const isInstagram = watchedInstagramVideoIds.includes(currentVideoId) || REAL_INSTAGRAM_VIDEOS.some(v => v.id === currentVideoId);
    const isTelegram = watchedTelegramVideoIds.includes(currentVideoId) || TELEGRAM_VIDEOS.some(v => v.id === currentVideoId);
    const isX = watchedXVideoIds.includes(currentVideoId) || X_CONTENT.some(v => v.id === currentVideoId && v.type === 'video');
    
    if (isInstagram) {
        // Instagram video
        if (currentVideoId && !watchedInstagramVideoIds.includes(currentVideoId)) {
            watchedInstagramVideoIds.push(currentVideoId);
            saveVideoState('watchedInstagramVideos', watchedInstagramVideoIds);
        }
        addTransaction('instagram', currentPoints, 'Instagram: ' + currentTitle.substring(0, 20) + '...', '📷');
    } else if (isTelegram) {
        // Telegram video
        if (currentVideoId && !watchedTelegramVideoIds.includes(currentVideoId)) {
            watchedTelegramVideoIds.push(currentVideoId);
            saveVideoState('watchedTelegramVideos', watchedTelegramVideoIds);
        }
        addTransaction('telegram', currentPoints, 'Telegram: ' + currentTitle.substring(0, 20) + '...', '📱');
    } else if (isX) {
        // X video
        if (currentVideoId && !watchedXVideoIds.includes(currentVideoId)) {
            watchedXVideoIds.push(currentVideoId);
            saveVideoState('watchedXVideos', watchedXVideoIds);
        }
        addTransaction('x_video', currentPoints, 'X Video: ' + currentTitle.substring(0, 20) + '...', '🐦');
    } else {
        // YouTube video
        if (currentVideoId && !watchedVideoIds.includes(currentVideoId)) {
            watchedVideoIds.push(currentVideoId);
            saveVideoState('watchedVideos', watchedVideoIds);
        }
        addTransaction('video', currentPoints, 'YouTube: ' + currentTitle.substring(0, 20) + '...', '🎬');
    }
    
    userPoints += currentPoints;
    watchedVideos++;
    updateUI();
    
    showEarningSuccess();
}

// Show Earning Success
function showEarningSuccess() {
    const appContent = document.getElementById('appContent');
    if (!appContent) return;
    
    appContent.innerHTML = `
        <div class="earning-success">
            <div class="success-icon">🎉</div>
            
            <h3>Points Earned Successfully!</h3>
            
            <div class="points-earned">
                +${currentPoints} Points
            </div>
            
            <div class="success-details">
                <div class="detail-item">
                    <span class="detail-label">Video:</span>
                    <span class="detail-value">${currentTitle}</span>
                </div>
                <div class="detail-item">
                    <span class="detail-label">Points Added:</span>
                    <span class="detail-value">+${currentPoints}</span>
                </div>
                <div class="detail-item">
                    <span class="detail-label">Total Points:</span>
                    <span class="detail-value">${userPoints}</span>
                </div>
            </div>
            
            <div class="success-actions">
                <button onclick="showVideoSection()" class="action-btn primary">
                    🔍 Watch More Videos
                </button>
                <button onclick="showDashboard()" class="action-btn secondary">
                    🏠 Back to Dashboard
                </button>
            </div>
        </div>
    `;
    
    showNotification(`✅ +${currentPoints} Points earned!`, 'success');
}

// Cancel Video Earning
function cancelVideoEarning() {
    if (videoTrackingInterval) {
        clearInterval(videoTrackingInterval);
    }
    showNotification('❌ Points earning cancelled', 'warning');
    showVideoSection();
}

// Show Tasks
function showTasks() {
    const appContent = document.getElementById('appContent');
    if (!appContent) return;
    
    appContent.innerHTML = `
        <div class="tasks-section">
            <div class="section-header">
                <button onclick="showDashboard()" class="back-btn">← Back</button>
                <h3>📋 Daily Tasks</h3>
            </div>
            
            <div class="tasks-list">
                <div class="task-item">
                    <div class="task-info">
                        <div class="task-title">Watch 5 videos</div>
                        <div class="task-reward">+25 pts</div>
                    </div>
                    <button onclick="completeTask('videos')" class="task-btn">Complete</button>
                </div>
                
                <div class="task-item">
                    <div class="task-info">
                        <div class="task-title">Refer 1 friend</div>
                        <div class="task-reward">+50 pts</div>
                    </div>
                    <button onclick="completeTask('referral')" class="task-btn">Complete</button>
                </div>
            </div>
        </div>
    `;
}

// Complete Task
function completeTask(task) {
    let points = 0;
    let description = '';
    let icon = '';
    
    switch(task) {
        case 'videos':
            points = 25;
            description = 'Daily Task: Watch Videos';
            icon = '📋';
            break;
        case 'referral':
            points = 50;
            description = 'Daily Task: Refer Friend';
            icon = '👥';
            break;
    }
    
    userPoints += points;
    addTransaction('task', points, description, icon);
    updateUI();
    showNotification(`✅ +${points} Points! Task completed!`, 'success');
}

// Show Cashier
function showCashier() {
    const appContent = document.getElementById('appContent');
    if (!appContent) return;
    
    appContent.innerHTML = `
        <div class="cashier-section">
            <div class="section-header">
                <button onclick="showDashboard()" class="back-btn">← Back</button>
                <h3>💰 Rewards</h3>
            </div>
            
            <div class="rewards-list">
                <div class="reward-item">
                    <div class="reward-info">
                        <div class="reward-title">Amazon Gift Card</div>
                        <div class="reward-cost">1000 pts</div>
                    </div>
                    <button onclick="redeemReward('amazon')" class="reward-btn">Redeem</button>
                </div>
                
                <div class="reward-item">
                    <div class="reward-info">
                        <div class="reward-title">PayPal Cash</div>
                        <div class="reward-cost">5000 pts</div>
                    </div>
                    <button onclick="redeemReward('paypal')" class="reward-btn">Redeem</button>
                </div>
            </div>
        </div>
    `;
}

// Redeem Reward
function redeemReward(reward) {
    let cost = 0;
    switch(reward) {
        case 'amazon': cost = 1000; break;
        case 'paypal': cost = 5000; break;
    }
    
    if (userPoints >= cost) {
        userPoints -= cost;
        addTransaction('redeem', -cost, 'Redeemed: ' + reward.toUpperCase(), '🎁');
        updateUI();
        showNotification(`🎉 ${reward.toUpperCase()} gift card redeemed!`, 'success');
    } else {
        showNotification(`❌ Not enough points! Need ${cost} points.`, 'warning');
    }
}

// Notification System
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.innerHTML = `
        <div class="notification-content">
            <span class="notification-message">${message}</span>
            <button class="notification-close" onclick="this.parentElement.parentElement.remove()">×</button>
        </div>
    `;
    document.body.appendChild(notification);
    
    // Auto-remove after 4 seconds
    setTimeout(() => {
        if (notification.parentElement) {
            notification.remove();
        }
    }, 4000);
}

// Make functions globally available
window.toggleMining = toggleMining;
window.claimBoost = claimBoost;
window.showWalletDetails = showWalletDetails;
window.showReferralSystem = showReferralSystem;
window.showWalletHistory = showWalletHistory;
window.showDashboard = showDashboard;
window.showLeaderboard = showLeaderboard;
window.showSupport = showSupport;
window.showFAQ = showFAQ;
window.showVideoSection = showVideoSection;
window.showYouTubeTab = showYouTubeTab;
window.showInstagramTab = showInstagramTab;
window.showInstagramReels = showInstagramReels;
window.showInstagramFollow = showInstagramFollow;
window.searchYouTubeVideos = searchYouTubeVideos;
window.selectYouTubeVideo = selectYouTubeVideo;
window.selectInstagramVideo = selectInstagramVideo;
window.followInstagramAccount = followInstagramAccount;
window.cancelVideoEarning = cancelVideoEarning;
window.showTasks = showTasks;
window.completeTask = completeTask;
window.showCashier = showCashier;
window.redeemReward = redeemReward;
window.shareOnTelegramWithDeepLink = shareOnTelegramWithDeepLink;
window.copyReferralWithDeepLink = copyReferralWithDeepLink;
window.shareOnWhatsAppWithDeepLink = shareOnWhatsAppWithDeepLink;
window.addTestReferral = addTestReferral;

console.log('✅ All functions initialized and ready!');
