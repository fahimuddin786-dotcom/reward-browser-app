// YouTube API Configuration
const YOUTUBE_API_KEY = 'AIzaSyBATxf5D7ZDeiQ61dbEdzEd4Tq72N713Y8';

// App State Management
let isMining = false;
let miningSeconds = 0;
let miningInterval = null;
let userPoints = 0;
let watchedVideos = 0;
let referrals = 0;

// Session Management
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

// Data Persistence System
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

        console.log('✅ Data loaded - Points:', userPoints);
        
    } catch (error) {
        console.error('❌ Error loading data:', error);
        initializeFreshData();
    }
}

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

    } catch (error) {
        console.error('❌ Error saving data:', error);
    }
}

// Points Management
function addPoints(amount, reason, icon = '💰') {
    userPoints += amount;
    addTransaction('earn', amount, reason, icon);
    saveAllData();
    updateUI();
    return userPoints;
}

function deductPoints(amount, reason, icon = '💸') {
    if (userPoints >= amount) {
        userPoints -= amount;
        addTransaction('spend', -amount, reason, icon);
        saveAllData();
        updateUI();
        return true;
    } else {
        showNotification(`❌ Not enough points! Need ${amount} but have ${userPoints}`, 'warning');
        return false;
    }
}

// Initialize fresh data
function initializeFreshData() {
    userProfile = createFreshUserProfile();
    referralData = createFreshReferralData();
    transactionHistory = [
        { type: 'welcome', amount: 25, description: 'Welcome Bonus', timestamp: Date.now(), icon: '🎁' }
    ];
    userPoints = 25;
    saveAllData();
}

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
        },
        {
            id: 'youtube_task_2',
            title: 'Watch 3 Videos',
            description: 'Watch any 3 YouTube Shorts',
            points: 25,
            platform: 'youtube',
            completed: false,
            icon: '🎬'
        },
        {
            id: 'youtube_task_3',
            title: 'Like & Comment',
            description: 'Like and comment on a video',
            points: 15,
            platform: 'youtube',
            completed: false,
            icon: '💬'
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
        },
        {
            id: 'twitter_task_2',
            title: 'Retweet Post',
            description: 'Retweet our latest announcement',
            points: 20,
            platform: 'twitter',
            completed: false,
            icon: '🔄'
        },
        {
            id: 'twitter_task_3',
            title: 'Like 5 Tweets',
            description: 'Like 5 tweets from our feed',
            points: 15,
            platform: 'twitter',
            completed: false,
            icon: '❤️'
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
        },
        {
            id: 'instagram_task_2',
            title: 'Watch 5 Reels',
            description: 'Watch 5 Instagram Reels',
            points: 20,
            platform: 'instagram',
            completed: false,
            icon: '🎥'
        },
        {
            id: 'instagram_task_3',
            title: 'Like & Share Story',
            description: 'Like and share our story',
            points: 15,
            platform: 'instagram',
            completed: false,
            icon: '📖'
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
        },
        {
            id: 'telegram_task_2',
            title: 'Watch 3 Ads',
            description: 'Watch 3 sponsored ads',
            points: 25,
            platform: 'telegram',
            completed: false,
            icon: '📢'
        },
        {
            id: 'telegram_task_3',
            title: 'Share Channel',
            description: 'Share channel with friends',
            points: 20,
            platform: 'telegram',
            completed: false,
            icon: '📤'
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
    },
    {
        id: 'instagram_real_2', 
        video_url: 'https://example.com/instagram-reel-2.mp4',
        thumbnail: 'https://images.unsplash.com/photo-1542744094-3a31f272c490?w=300&h=400&fit=crop',
        title: '😂 Comedy Skit - Family Funny Moments',
        username: 'comedy.india',
        points: 12,
        likes: '1.8M',
        duration: '0:45',
        views: '12.7M',
        music: 'Trending Sound',
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
    },
    {
        id: 'telegram_ad_2',
        video_url: 'https://example.com/telegram-ad-2.mp4',
        thumbnail: 'https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=300&h=200&fit=crop',
        title: '💼 Earn $500 Daily - Forex Signals',
        channel: 'Forex Masters',
        points: 15,
        duration: '0:30',
        views: '1.8M',
        type: 'ad',
        category: 'forex'
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
    },
    {
        id: 'x_tweet_1',
        type: 'tweet',
        points: 15,
        username: 'Elon Musk',
        handle: '@elonmusk',
        content: 'The future of AI is going to be incredible! 🤖 Working on some exciting updates for Grok...',
        likes: '250K',
        retweets: '85K',
        timestamp: '5 hours ago',
        media: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=300&h=200&fit=crop'
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
        },
        {
            id: 'instagram_follow_2',
            username: 'travel.diaries',
            name: 'Travel Diaries',
            points: 30,
            followers: '1.8M',
            avatar: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=150&h=150&fit=crop'
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
        },
        {
            id: 'x_follow_2',
            username: 'Crypto Expert',
            handle: '@CryptoGuru',
            points: 30,
            followers: '1.5M',
            avatar: 'https://images.unsplash.com/photo-1621761191319-c6fb62004040?w=150&h=150&fit=crop',
            description: 'Crypto market analysis and signals'
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
        },
        {
            id: 'telegram_follow_2',
            channel: 'Forex Masters',
            points: 45,
            members: '89K',
            avatar: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=150&h=150&fit=crop',
            description: 'Forex trading education and signals'
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
        },
        {
            id: 'youtube_follow_2',
            channel: 'Cooking Master',
            points: 35,
            subscribers: '3.8M',
            avatar: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=150&h=150&fit=crop',
            description: 'Easy cooking recipes and tutorials'
        }
    ]
};

// Leaderboard Data
const LEADERBOARD_DATA = [
    { rank: 1, name: 'CryptoKing', points: 15240, level: 'Diamond', avatar: '👑' },
    { rank: 2, name: 'EarnMaster', points: 12850, level: 'Platinum', avatar: '💎' },
    { rank: 3, name: 'TapPro', points: 11200, level: 'Gold', avatar: '⭐' },
    { rank: 4, name: 'PointHunter', points: 9850, level: 'Gold', avatar: '🎯' },
    { rank: 5, name: 'MiningExpert', points: 8760, level: 'Silver', avatar: '⛏️' },
    { rank: 6, name: 'VideoWatcher', points: 7540, level: 'Silver', avatar: '🎬' },
    { rank: 7, name: 'ReferralGuru', points: 6890, level: 'Bronze', avatar: '👥' },
    { rank: 8, name: 'You', points: 0, level: 'Bronze', avatar: '😊' },
    { rank: 9, name: 'TaskComplete', points: 4320, level: 'Bronze', avatar: '✅' },
    { rank: 10, name: 'Newbie123', points: 2980, level: 'Bronze', avatar: '🆕' }
];

// Utility Functions
function generateUserId() {
    const urlParams = new URLSearchParams(window.location.search);
    const sessionId = urlParams.get('session') || 'default';
    return 'USER_' + sessionId + '_' + Math.random().toString(36).substr(2, 9).toUpperCase();
}

function generateReferralCode() {
    const urlParams = new URLSearchParams(window.location.search);
    const sessionId = urlParams.get('session') || 'default';
    
    if (userProfile.telegramUsername) {
        return 'TAPEARN_' + userProfile.telegramUsername.toUpperCase() + '_' + sessionId;
    } else {
        return 'TAPEARN_' + userProfile.userId + '_' + sessionId;
    }
}

function formatNumber(num) {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

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

// App Initialization
document.addEventListener('DOMContentLoaded', function() {
    console.log('🆕 Initializing TapEarn App...');
    
    loadAllData();
    initializeTelegramIntegration();
    checkReferralOnStart();
    checkNewUserReferral();
    updateUI();
    initializeEventListeners();
    
    if (isMining) {
        startMining();
    }
    
    console.log('🎯 App Initialized - Points:', userPoints);
});

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

function checkReferralOnStart() {
    const urlParams = new URLSearchParams(window.location.search);
    const referralCode = urlParams.get('ref');
    
    if (referralCode && !localStorage.getItem('referralProcessed')) {
        processReferralJoin(referralCode);
        localStorage.setItem('referralProcessed', 'true');
    }
}

function processReferralJoin(referralCode) {
    if (referralCode === referralData.referralCode) {
        return;
    }
    
    const referrerUsername = referralCode.replace('TAPEARN_', '').split('_')[0].toLowerCase();
    
    referralData.pendingReferrals.push({
        code: referralCode,
        referrer: referrerUsername,
        timestamp: Date.now(),
        status: 'pending'
    });
    
    addPoints(25, 'Welcome Bonus - Referred by ' + referrerUsername, '🎁');
    showNotification(`🎉 +25 Welcome Bonus! You were referred by ${referrerUsername}`, 'success');
}

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

// UI Management
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

// Mining System
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
        
    }, 1000);
    
    showNotification('⛏️ Mining Started! Earning 5 points per minute...', 'success');
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
}

// Event Listeners
function initializeEventListeners() {
    const miningCard = document.querySelector('.main-feature-card');
    if (miningCard) {
        miningCard.addEventListener('click', toggleMining);
    }
    
    const boostBtn = document.querySelector('.boost-btn');
    if (boostBtn) {
        boostBtn.addEventListener('click', claimBoost);
    }
    
    const walletBtn = document.querySelector('.wallet-btn');
    if (walletBtn) {
        walletBtn.addEventListener('click', showWalletDetails);
    }
}

// Feature Functions
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

function searchYouTubeVideos() {
    const container = document.getElementById('videoResultsContainer');
    
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

function shareOnTelegramWithDeepLink() {
    showNotification('✅ Telegram sharing opened!', 'success');
}

function copyReferralWithDeepLink() {
    showNotification('✅ Referral link copied!', 'success');
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
    setTimeout(() => {
        if (notification.parentElement) {
            notification.remove();
        }
    }, 4000);
}

// Global Exports
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
window.selectYouTubeVideo = selectYouTubeVideo;

console.log('🎯 TapEarn App - Data Persistence System Active');
