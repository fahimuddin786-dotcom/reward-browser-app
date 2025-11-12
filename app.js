// YouTube API Configuration
const YOUTUBE_API_KEY = 'AIzaSyBATxf5D7ZDeiQ61dbEdzEd4Tq72N713Y8';

// App State Management
let isMining = false;
let miningSeconds = 0;
let miningInterval = null;
let userPoints = 0;
let watchedVideos = 0;
let referrals = 0;

// ==================== ENHANCED DATA PERSISTENCE SYSTEM ====================

// Simple Session Management
function initializeSession() {
    const urlParams = new URLSearchParams(window.location.search);
    const sessionId = urlParams.get('session') || 'default';
    
    return {
        userProfileKey: `TAPEARN_userProfile_${sessionId}`,
        transactionKey: `TAPEARN_transactions_${sessionId}`,
        referralKey: `TAPEARN_referral_${sessionId}`,
        miningKey: `TAPEARN_mining_${sessionId}`,
        videoKey: `TAPEARN_videos_${sessionId}`,
        followKey: `TAPEARN_follow_${sessionId}`
    };
}

const sessionKeys = initializeSession();

// ENHANCED DATA LOADING SYSTEM
function loadAllData() {
    console.log('📂 Loading all user data...');
    
    try {
        // Load Mining State
        const savedMining = JSON.parse(localStorage.getItem(sessionKeys.miningKey));
        if (savedMining) {
            isMining = savedMining.isMining || false;
            miningSeconds = savedMining.miningSeconds || 0;
            userPoints = savedMining.userPoints || 0;
            watchedVideos = savedMining.watchedVideos || 0;
            referrals = savedMining.referrals || 0;
        }

        // Load User Profile
        const savedProfile = JSON.parse(localStorage.getItem(sessionKeys.userProfileKey));
        if (savedProfile) {
            userProfile = savedProfile;
        } else {
            userProfile = createFreshUserProfile();
        }

        // Load Transaction History
        const savedTransactions = JSON.parse(localStorage.getItem(sessionKeys.transactionKey));
        if (savedTransactions && savedTransactions.length > 0) {
            transactionHistory = savedTransactions;
        } else {
            transactionHistory = [
                { type: 'welcome', amount: 25, description: 'Welcome Bonus', timestamp: Date.now(), icon: '🎁' }
            ];
            userPoints += 25;
        }

        // Load Referral Data
        const savedReferrals = JSON.parse(localStorage.getItem(sessionKeys.referralKey));
        if (savedReferrals) {
            referralData = savedReferrals;
            referrals = referralData.referredUsers.length;
        } else {
            referralData = createFreshReferralData();
        }

        // Load Video States
        const savedVideos = JSON.parse(localStorage.getItem(sessionKeys.videoKey));
        if (savedVideos) {
            watchedVideoIds = savedVideos.watchedVideoIds || [];
            watchedInstagramVideoIds = savedVideos.watchedInstagramVideoIds || [];
            watchedTelegramVideoIds = savedVideos.watchedTelegramVideoIds || [];
            watchedXVideoIds = savedVideos.watchedXVideoIds || [];
            likedXTweetIds = savedVideos.likedXTweetIds || [];
            retweetedXTweetIds = savedVideos.retweetedXTweetIds || [];
            watchedVideos = watchedVideoIds.length + watchedInstagramVideoIds.length + watchedTelegramVideoIds.length + watchedXVideoIds.length;
        }

        // Load Follow States
        const savedFollows = JSON.parse(localStorage.getItem(sessionKeys.followKey));
        if (savedFollows) {
            followedInstagramAccounts = savedFollows.followedInstagramAccounts || [];
            followedXAccounts = savedFollows.followedXAccounts || [];
            followedTelegramChannels = savedFollows.followedTelegramChannels || [];
            subscribedYouTubeChannels = savedFollows.subscribedYouTubeChannels || [];
        }

        console.log('✅ All data loaded successfully!');
        console.log('📊 Current State:', {
            points: userPoints,
            videos: watchedVideos,
            referrals: referrals,
            mining: miningSeconds
        });

    } catch (error) {
        console.error('❌ Error loading data:', error);
        initializeFreshData();
    }
}

// ENHANCED DATA SAVING SYSTEM
function saveAllData() {
    try {
        // Save Mining State
        const miningState = {
            isMining: isMining,
            miningSeconds: miningSeconds,
            userPoints: userPoints,
            watchedVideos: watchedVideos,
            referrals: referrals,
            lastSaved: Date.now()
        };
        localStorage.setItem(sessionKeys.miningKey, JSON.stringify(miningState));

        // Save User Profile
        localStorage.setItem(sessionKeys.userProfileKey, JSON.stringify(userProfile));

        // Save Transaction History
        localStorage.setItem(sessionKeys.transactionKey, JSON.stringify(transactionHistory));

        // Save Referral Data
        localStorage.setItem(sessionKeys.referralKey, JSON.stringify(referralData));

        // Save Video States
        const videoState = {
            watchedVideoIds: watchedVideoIds,
            watchedInstagramVideoIds: watchedInstagramVideoIds,
            watchedTelegramVideoIds: watchedTelegramVideoIds,
            watchedXVideoIds: watchedXVideoIds,
            likedXTweetIds: likedXTweetIds,
            retweetedXTweetIds: retweetedXTweetIds
        };
        localStorage.setItem(sessionKeys.videoKey, JSON.stringify(videoState));

        // Save Follow States
        const followState = {
            followedInstagramAccounts: followedInstagramAccounts,
            followedXAccounts: followedXAccounts,
            followedTelegramChannels: followedTelegramChannels,
            subscribedYouTubeChannels: subscribedYouTubeChannels
        };
        localStorage.setItem(sessionKeys.followKey, JSON.stringify(followState));

        console.log('💾 All data saved! Points:', userPoints);
        
    } catch (error) {
        console.error('❌ Error saving data:', error);
    }
}

// POINTS MANAGEMENT SYSTEM
function addPoints(amount, reason, icon = '💰') {
    const oldPoints = userPoints;
    userPoints += amount;
    
    // Add transaction
    addTransaction('earn', amount, reason, icon);
    
    // Auto-save data
    saveAllData();
    
    // Update UI
    updateUI();
    
    console.log(`✅ Points added: ${amount} | Total: ${userPoints} | Reason: ${reason}`);
    return userPoints;
}

function deductPoints(amount, reason, icon = '💸') {
    if (userPoints >= amount) {
        userPoints -= amount;
        addTransaction('spend', -amount, reason, icon);
        saveAllData();
        updateUI();
        console.log(`✅ Points deducted: ${amount} | Remaining: ${userPoints}`);
        return true;
    } else {
        showNotification(`❌ Not enough points! Need ${amount} but have ${userPoints}`, 'warning');
        return false;
    }
}

// Initialize fresh data if needed
function initializeFreshData() {
    userProfile = createFreshUserProfile();
    referralData = createFreshReferralData();
    transactionHistory = [
        { type: 'welcome', amount: 25, description: 'Welcome Bonus', timestamp: Date.now(), icon: '🎁' }
    ];
    userPoints = 25;
    saveAllData();
}

// Create fresh user profile
function createFreshUserProfile() {
    const urlParams = new URLSearchParams(window.location.search);
    const tg = window.Telegram?.WebApp;
    const user = tg?.initDataUnsafe?.user;
    
    return {
        telegramUsername: user?.username || 'User',
        userId: urlParams.get('userid') || generateUserId(),
        joinDate: new Date().toISOString(),
        isPremium: false,
        level: 'Bronze',
        firstName: user?.first_name || '',
        lastName: user?.last_name || '',
        sessionId: urlParams.get('session') || 'default',
        isNewUser: true,
        createdAt: Date.now(),
        isProfileCreated: true
    };
}

// Create fresh referral data
function createFreshReferralData() {
    return {
        referralCode: generateReferralCode(),
        referredUsers: [],
        totalEarned: 0,
        pendingReferrals: [],
        sessionId: new URLSearchParams(window.location.search).get('session') || 'default'
    };
}

// User Profile
let userProfile = createFreshUserProfile();

// Transaction History
let transactionHistory = [];

// Referral System
let referralData = createFreshReferralData();

// YouTube Video State
let currentVideoId = null;
let currentPoints = 0;
let currentTitle = '';
let videoTrackingInterval = null;

// Video Tracking Arrays
let watchedVideoIds = [];
let watchedInstagramVideoIds = [];
let watchedTelegramVideoIds = [];
let watchedXVideoIds = [];
let likedXTweetIds = [];
let retweetedXTweetIds = [];

// Follow State Arrays
let followedInstagramAccounts = [];
let followedXAccounts = [];
let followedTelegramChannels = [];
let subscribedYouTubeChannels = [];

// Social Tasks Data (Same as before)
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
        // ... rest of tasks same as before
    ]
    // ... other platforms same as before
};

// Real Instagram Videos Data (Same as before)
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
    // ... rest same as before
];

// Telegram Videos Data (Same as before)
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
    // ... rest same as before
];

// X (Twitter) Content Data (Same as before)
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
    // ... rest same as before
];

// Follow Tasks Data (Same as before)
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
        // ... rest same as before
    ]
    // ... other platforms same as before
};

// Leaderboard Data (Same as before)
const LEADERBOARD_DATA = [
    { rank: 1, name: 'CryptoKing', points: 15240, level: 'Diamond', avatar: '👑' }
    // ... rest same as before
];

// Generate Unique User ID
function generateUserId() {
    const urlParams = new URLSearchParams(window.location.search);
    const sessionId = urlParams.get('session') || 'default';
    return 'USER_' + sessionId + '_' + Math.random().toString(36).substr(2, 9).toUpperCase();
}

// Generate Referral Code
function generateReferralCode() {
    const urlParams = new URLSearchParams(window.location.search);
    const sessionId = urlParams.get('session') || 'default';
    
    if (userProfile.telegramUsername) {
        return 'TAPEARN_' + userProfile.telegramUsername.toUpperCase() + '_' + sessionId;
    } else {
        return 'TAPEARN_' + userProfile.userId + '_' + sessionId;
    }
}

// ==================== ENHANCED APP INITIALIZATION ====================

document.addEventListener('DOMContentLoaded', function() {
    console.log('🆕 Initializing TapEarn App...');
    
    // Load all data first
    loadAllData();
    
    // Initialize other systems
    initializeTelegramIntegration();
    checkReferralOnStart();
    checkNewUserReferral();
    updateUI();
    initializeEventListeners();
    
    // Start mining if it was active
    if (isMining) {
        startMining();
    }
    
    console.log('🎯 TapEarn App Fully Initialized');
    console.log('💰 Current Points:', userPoints);
    console.log('📊 Data Loaded:', {
        points: userPoints,
        videos: watchedVideos,
        referrals: referrals,
        mining: miningSeconds
    });
});

// Enhanced Telegram Integration
function initializeTelegramIntegration() {
    if (window.Telegram && window.Telegram.WebApp) {
        const tg = window.Telegram.WebApp;
        tg.expand();
        
        const user = tg.initDataUnsafe.user;
        if (user && !userProfile.telegramUsername) {
            userProfile.telegramUsername = user.username || '';
            userProfile.firstName = user.first_name || '';
            userProfile.lastName = user.last_name || '';
            saveAllData();
        }
    }
}

// Enhanced Check for referral
function checkReferralOnStart() {
    const urlParams = new URLSearchParams(window.location.search);
    const referralCode = urlParams.get('ref');
    
    if (referralCode && !localStorage.getItem('referralProcessed')) {
        processReferralJoin(referralCode);
        localStorage.setItem('referralProcessed', 'true');
    }
}

// Process referral when new user joins
function processReferralJoin(referralCode) {
    if (referralCode === referralData.referralCode) {
        console.log('❌ Self-referral detected');
        return;
    }
    
    const referrerUsername = referralCode.replace('TAPEARN_', '').split('_')[0].toLowerCase();
    
    referralData.pendingReferrals.push({
        code: referralCode,
        referrer: referrerUsername,
        timestamp: Date.now(),
        status: 'pending'
    });
    
    // Give welcome bonus to new user
    addPoints(25, 'Welcome Bonus - Referred by ' + referrerUsername, '🎁');
    
    showNotification(`🎉 +25 Welcome Bonus! You were referred by ${referrerUsername}`, 'success');
    
    saveAllData();
}

// Check if this is a referred new user
function checkNewUserReferral() {
    const urlParams = new URLSearchParams(window.location.search);
    const isNewUser = urlParams.get('newuser') === 'true';
    const referralCode = urlParams.get('ref');
    
    if (isNewUser && referralCode && userProfile.isNewUser) {
        addPoints(25, 'Welcome Bonus - Referred User', '🎁');
        userProfile.isNewUser = false;
        saveAllData();
    }
}

// Enhanced Add Transaction
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
}

// Update UI
function updateUI() {
    const walletPoints = document.getElementById('walletPoints');
    const totalPoints = document.getElementById('totalPoints');
    const videosWatched = document.getElementById('videosWatched');
    const totalReferrals = document.getElementById('totalReferrals');
    
    if (walletPoints) walletPoints.textContent = formatNumber(userPoints);
    if (totalPoints) totalPoints.textContent = formatNumber(userPoints);
    if (videosWatched) videosWatched.textContent = watchedVideos;
    if (totalReferrals) totalReferrals.textContent = referrals;
    
    updateMiningTimerDisplay();
}

// Format numbers with commas
function formatNumber(num) {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

// Update Mining Timer Display
function updateMiningTimerDisplay() {
    const miningTimeElement = document.getElementById('miningTime');
    if (miningTimeElement) {
        const hours = Math.floor(miningSeconds / 3600);
        const minutes = Math.floor((miningSeconds % 3600) / 60);
        const seconds = miningSeconds % 60;
        
        miningTimeElement.textContent = 
            `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }
}

// ==================== MINING SYSTEM ====================

function toggleMining() {
    if (isMining) {
        stopMining();
    } else {
        startMining();
    }
}

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
    }
    
    let lastMinuteCheck = Math.floor(miningSeconds / 60);
    let lastHourCheck = Math.floor(miningSeconds / 3600);
    
    miningInterval = setInterval(() => {
        miningSeconds++;
        
        updateMiningTimerDisplay();
        
        const currentMinute = Math.floor(miningSeconds / 60);
        const currentHour = Math.floor(miningSeconds / 3600);
        
        if (currentMinute > lastMinuteCheck) {
            addPoints(5, 'Mining Points', '⛏️');
            lastMinuteCheck = currentMinute;
        }
        
        if (currentHour > lastHourCheck) {
            addPoints(50, 'Hourly Mining Bonus', '🎉');
            lastHourCheck = currentHour;
        }
        
        saveAllData();
        
    }, 1000);
    
    showNotification('⛏️ Mining Started! Earning 5 points per minute...', 'success');
    saveAllData();
}

function stopMining() {
    if (!isMining) return;
    
    isMining = false;
    
    if (miningInterval) {
        clearInterval(miningInterval);
        miningInterval = null;
    }
    
    const miningCard = document.querySelector('.main-feature-card');
    if (miningCard) miningCard.classList.remove('mining-active');
    
    const miningStatusText = document.getElementById('miningStatusText');
    if (miningStatusText) {
        miningStatusText.textContent = 'Click to start mining';
        miningStatusText.style.color = '';
    }
    
    showNotification('⏹️ Mining Stopped. Points saved!', 'info');
    saveAllData();
}

// ==================== EVENT LISTENERS ====================

function initializeEventListeners() {
    console.log('🔧 Initializing event listeners...');
    
    // Mining button
    const miningCard = document.querySelector('.main-feature-card');
    if (miningCard) {
        miningCard.addEventListener('click', toggleMining);
    }
    
    // Boost button
    const boostBtn = document.querySelector('.boost-btn');
    if (boostBtn) {
        boostBtn.addEventListener('click', claimBoost);
    }
    
    // Wallet button
    const walletBtn = document.querySelector('.wallet-btn');
    if (walletBtn) {
        walletBtn.addEventListener('click', showWalletDetails);
    }
    
    console.log('✅ Event listeners initialized');
}

// ==================== FEATURE FUNCTIONS ====================

function claimBoost() {
    addPoints(100, 'Daily Boost', '🚀');
    showNotification('🚀 +100 Points! Boost claimed successfully!', 'success');
}

function showWalletDetails() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const todayEarnings = transactionHistory
        .filter(t => new Date(t.timestamp) >= today && t.amount > 0)
        .reduce((sum, t) => sum + t.amount, 0);
    
    const allTimeEarnings = transactionHistory
        .filter(t => t.amount > 0)
        .reduce((sum, t) => sum + t.amount, 0);
    
    document.getElementById('appContent').innerHTML = `
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

function showReferralSystem() {
    const totalEarned = referralData.referredUsers.reduce((sum, user) => sum + user.pointsEarned, 0);
    const pendingCount = referralData.pendingReferrals.length;
    
    document.getElementById('appContent').innerHTML = `
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
                </div>
            </div>
            
            <div class="referral-card">
                <div class="referral-code">${referralData.referralCode}</div>
                <p class="referral-note">Your unique referral code</p>
                
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
                </div>
                
                <button onclick="addTestReferral()" class="action-btn primary" style="margin-top: 15px;">
                    👥 Add Test Referral
                </button>
            </div>
            
            <div class="referral-benefits">
                <h4>🎁 How Referral Works</h4>
                <ul>
                    <li>✅ Share your unique referral link</li>
                    <li>✅ Friends join using YOUR link</li>
                    <li>✅ You get <strong>50 points</strong> when they sign up</li>
                    <li>✅ Your friend gets <strong>25 bonus points</strong></li>
                </ul>
            </div>
        </div>
    `;
}

function addTestReferral() {
    const testUsername = 'test_user_' + Math.random().toString(36).substr(2, 5);
    
    referralData.referredUsers.push({
        username: testUsername,
        pointsEarned: 50,
        timestamp: Date.now()
    });
    
    addPoints(50, 'Referral: ' + testUsername, '👥');
    referrals = referralData.referredUsers.length;
    
    showNotification(`🎉 +50 Points! New referral from ${testUsername}`, 'success');
    showReferralSystem();
}

function showWalletHistory() {
    document.getElementById('appContent').innerHTML = `
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

function showDashboard() {
    document.getElementById('appContent').innerHTML = `
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

function showVideoSection() {
    document.getElementById('appContent').innerHTML = `
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

// ==================== VIDEO EARNING SYSTEM ====================

function selectYouTubeVideo(videoId, points, title, channel) {
    if (watchedVideoIds.includes(videoId)) {
        showNotification('❌ You have already earned points for this video!', 'warning');
        return;
    }
    
    currentVideoId = videoId;
    currentPoints = points;
    currentTitle = title;
    
    document.getElementById('appContent').innerHTML = `
        <div class="video-player-section">
            <div class="section-header">
                <button onclick="showVideoSection()" class="back-btn">← Back to Videos</button>
                <h3>🎯 Earn Points</h3>
            </div>
            
            <div class="youtube-iframe-container">
                <div class="video-placeholder">
                    <div class="video-logo">🎬</div>
                    <h3>YouTube Short</h3>
                    <p>"${title}"</p>
                    <div class="video-stats">
                        <span>💰 +${points} points</span>
                    </div>
                </div>
            </div>
            
            <div class="video-timer">
                <p>⏰ <strong>Watch for 30 seconds to earn ${points} points</strong></p>
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
                    <button onclick="completeVideoEarning()" class="action-btn primary">
                        ✅ Complete & Earn Points
                    </button>
                    <button onclick="cancelVideoEarning()" class="cancel-btn">
                        ❌ Cancel
                    </button>
                </div>
            </div>
        </div>
    `;
}

function completeVideoEarning() {
    if (videoTrackingInterval) {
        clearInterval(videoTrackingInterval);
    }
    
    watchedVideoIds.push(currentVideoId);
    watchedVideos++;
    
    addPoints(currentPoints, 'YouTube: ' + currentTitle.substring(0, 30) + '...', '🎬');
    
    showEarningSuccess();
}

function showEarningSuccess() {
    document.getElementById('appContent').innerHTML = `
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

function cancelVideoEarning() {
    if (videoTrackingInterval) {
        clearInterval(videoTrackingInterval);
    }
    showNotification('❌ Points earning cancelled', 'warning');
    showVideoSection();
}

// ==================== OTHER FEATURES (SAME UI) ====================

function showCashier() {
    document.getElementById('appContent').innerHTML = `
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
                    <button onclick="redeemReward('amazon', 1000)" class="reward-btn">Redeem</button>
                </div>
                
                <div class="reward-item">
                    <div class="reward-info">
                        <div class="reward-title">PayPal Cash</div>
                        <div class="reward-cost">5000 pts</div>
                    </div>
                    <button onclick="redeemReward('paypal', 5000)" class="reward-btn">Redeem</button>
                </div>
                
                <div class="reward-item">
                    <div class="reward-info">
                        <div class="reward-title">Google Play Card</div>
                        <div class="reward-cost">2000 pts</div>
                    </div>
                    <button onclick="redeemReward('google', 2000)" class="reward-btn">Redeem</button>
                </div>
            </div>
        </div>
    `;
}

function redeemReward(reward, cost) {
    if (deductPoints(cost, 'Redeemed: ' + reward.toUpperCase(), '🎁')) {
        showNotification(`🎉 ${reward.toUpperCase()} gift card redeemed!`, 'success');
    }
}

// ==================== NOTIFICATION SYSTEM ====================

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
    setTimeout(() => {
        if (notification.parentElement) {
            notification.remove();
        }
    }, 4000);
}

// ==================== MISSING FUNCTIONS ====================

function showYouTubeTab() {
    showVideoSection();
}

function showInstagramTab() {
    document.getElementById('appContent').innerHTML = `
        <div class="video-section">
            <div class="video-platform-tabs">
                <button class="platform-tab" onclick="showYouTubeTab()">YouTube</button>
                <button class="platform-tab active" onclick="showInstagramTab()">Instagram</button>
            </div>
            
            <div class="instagram-videos-grid">
                ${REAL_INSTAGRAM_VIDEOS.map(video => `
                    <div class="video-card instagram-card" onclick="earnInstagramPoints(${video.points}, '${video.title}')">
                        <div class="thumbnail">
                            <img src="${video.thumbnail}" alt="${video.title}">
                            <div class="points-badge">+${video.points} pts</div>
                        </div>
                        <div class="video-details">
                            <h4 class="video-title">${video.title}</h4>
                            <div class="video-meta">
                                <span class="channel">@${video.username}</span>
                                <button class="watch-now">▶️ Watch</button>
                            </div>
                        </div>
                    </div>
                `).join('')}
            </div>
        </div>
    `;
}

function earnInstagramPoints(points, title) {
    addPoints(points, 'Instagram: ' + title, '📷');
    showNotification(`✅ +${points} Points from Instagram video!`, 'success');
}

function shareOnTelegramWithDeepLink() {
    const referralLink = `https://t.me/your_bot?start=ref${userProfile.userId}`;
    const message = `Join TapEarn and earn free points! Use my referral code: ${referralData.referralCode}`;
    
    showNotification('✅ Telegram sharing opened!', 'success');
}

function copyReferralWithDeepLink() {
    const referralLink = `https://t.me/your_bot?start=ref${userProfile.userId}`;
    const referralText = `Join TapEarn using my referral! Code: ${referralData.referralCode}`;
    
    navigator.clipboard.writeText(referralText)
        .then(() => showNotification('✅ Referral link copied!', 'success'))
        .catch(() => showNotification('❌ Failed to copy', 'warning'));
}

function searchYouTubeVideos() {
    const container = document.getElementById('videoResultsContainer');
    
    // Demo videos for testing
    const demoVideos = [
        {
            id: { videoId: 'demo1' },
            snippet: {
                title: '🎵 Trending Music Short 2024',
                thumbnails: { 
                    medium: { url: 'https://via.placeholder.com/300x200/FF6B6B/FFFFFF?text=Music+Short' }
                },
                channelTitle: 'Music Channel'
            }
        },
        {
            id: { videoId: 'demo2' },
            snippet: {
                title: '😂 Funny Comedy Skit',
                thumbnails: { 
                    medium: { url: 'https://via.placeholder.com/300x200/4ECDC4/FFFFFF?text=Comedy+Short' }
                },
                channelTitle: 'Comedy Central'
            }
        }
    ];
    
    displayYouTubeVideos(demoVideos, 'demo videos');
}

function displayYouTubeVideos(videos, query) {
    const container = document.getElementById('videoResultsContainer');
    
    let html = `
        <div class="section-title">
            <h3>🎥 YouTube Shorts</h3>
            <p class="section-subtitle">Found ${videos.length} videos</p>
        </div>
        <div class="videos-grid">
    `;
    
    videos.forEach((video) => {
        const videoId = video.id.videoId;
        const thumbnail = video.snippet.thumbnails.medium?.url || 'https://via.placeholder.com/300x200';
        const title = video.snippet.title;
        const channel = video.snippet.channelTitle;
        const points = 10 + Math.floor(Math.random() * 10);
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

// Export for global access
window.toggleMining = toggleMining;
window.claimBoost = claimBoost;
window.showWalletDetails = showWalletDetails;
window.showReferralSystem = showReferralSystem;
window.showWalletHistory = showWalletHistory;
window.showDashboard = showDashboard;
window.showVideoSection = showVideoSection;
window.showCashier = showCashier;
window.addTestReferral = addTestReferral;
window.redeemReward = redeemReward;
window.completeVideoEarning = completeVideoEarning;
window.cancelVideoEarning = cancelVideoEarning;
window.showYouTubeTab = showYouTubeTab;
window.showInstagramTab = showInstagramTab;
window.earnInstagramPoints = earnInstagramPoints;
window.shareOnTelegramWithDeepLink = shareOnTelegramWithDeepLink;
window.copyReferralWithDeepLink = copyReferralWithDeepLink;
window.searchYouTubeVideos = searchYouTubeVideos;

console.log('🎯 TapEarn App Code Loaded - Data Persistence System Active');
