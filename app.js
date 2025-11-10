// YouTube API Configuration
const YOUTUBE_API_KEY = 'AIzaSyBATxf5D7ZDeiQ61dbEdzEd4Tq72N713Y8';

// App State Management
let isMining = false;
let miningSeconds = 0;
let miningInterval = null;
let userPoints = 5564;
let watchedVideos = 24;
let referrals = 3;

// Transaction History
let transactionHistory = JSON.parse(localStorage.getItem('transactionHistory')) || [
    { type: 'mining', amount: 5, description: 'Mining Points', timestamp: Date.now() - 3600000, icon: '⛏️' },
    { type: 'video', amount: 15, description: 'YouTube Video', timestamp: Date.now() - 7200000, icon: '🎬' },
    { type: 'instagram', amount: 12, description: 'Instagram Reel', timestamp: Date.now() - 10800000, icon: '📷' },
    { type: 'referral', amount: 50, description: 'Referral Bonus', timestamp: Date.now() - 86400000, icon: '👥' }
];

// YouTube Video State
let currentVideoId = null;
let currentPoints = 0;
let currentTitle = '';
let videoTrackingInterval = null;
let watchedVideoIds = JSON.parse(localStorage.getItem('watchedVideos')) || [];

// Instagram Video State
let watchedInstagramVideoIds = JSON.parse(localStorage.getItem('watchedInstagramVideos')) || [];

// Telegram Video State
let watchedTelegramVideoIds = JSON.parse(localStorage.getItem('watchedTelegramVideos')) || [];

// X (Twitter) State
let watchedXVideoIds = JSON.parse(localStorage.getItem('watchedXVideos')) || [];
let likedXTweetIds = JSON.parse(localStorage.getItem('likedXTweets')) || [];
let retweetedXTweetIds = JSON.parse(localStorage.getItem('retweetedXTweets')) || [];

// Follow State
let followedInstagramAccounts = JSON.parse(localStorage.getItem('followedInstagramAccounts')) || [];
let followedXAccounts = JSON.parse(localStorage.getItem('followedXAccounts')) || [];
let followedTelegramChannels = JSON.parse(localStorage.getItem('followedTelegramChannels')) || [];
let subscribedYouTubeChannels = JSON.parse(localStorage.getItem('subscribedYouTubeChannels')) || [];

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
    },
    {
        id: 'instagram_real_3',
        video_url: 'https://example.com/instagram-reel-3.mp4',
        thumbnail: 'https://images.unsplash.com/photo-1526947425960-945c6e72858f?w=300&h=400&fit=crop',
        title: '🍛 Street Food Review - Delhi Chaat',
        username: 'foodie.delhi',
        points: 10,
        likes: '3.2M',
        duration: '0:35',
        views: '25.4M',
        music: 'Street Food Vibe',
        type: 'reel'
    },
    {
        id: 'instagram_real_4',
        video_url: 'https://example.com/instagram-reel-4.mp4',
        thumbnail: 'https://images.unsplash.com/photo-1511988617509-a57c8a288659?w=300&h=400&fit=crop',
        title: '💪 Fitness Motivation - Home Workout',
        username: 'fitness.guru',
        points: 14,
        likes: '1.5M',
        duration: '0:50',
        views: '8.9M',
        music: 'Workout Music Mix',
        type: 'reel'
    },
    {
        id: 'instagram_story_1',
        video_url: 'https://example.com/instagram-story-1.mp4',
        thumbnail: 'https://images.unsplash.com/photo-1552058544-f2b08422138a?w=300&h=500&fit=crop',
        title: '🌟 Celebrity Daily Life Story',
        username: 'bollywood_star',
        points: 8,
        likes: '950K',
        duration: '0:15',
        views: '5.2M',
        music: 'Original Sound',
        type: 'story'
    },
    {
        id: 'instagram_story_2',
        video_url: 'https://example.com/instagram-story-2.mp4',
        thumbnail: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=300&h=500&fit=crop',
        title: '💃 Dance Practice Session',
        username: 'dance_queen',
        points: 7,
        likes: '1.1M',
        duration: '0:20',
        views: '7.8M',
        music: 'Practice Beat',
        type: 'story'
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
    },
    {
        id: 'telegram_ad_3',
        video_url: 'https://example.com/telegram-ad-3.mp4',
        thumbnail: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=300&h=200&fit=crop',
        title: '🛒 Amazon Deals - 90% OFF Today',
        channel: 'Deal Hunters',
        points: 12,
        duration: '0:40',
        views: '3.2M',
        type: 'ad',
        category: 'shopping'
    },
    {
        id: 'telegram_video_1',
        video_url: 'https://example.com/telegram-video-1.mp4',
        thumbnail: 'https://images.unsplash.com/photo-1573164713988-8665fc963095?w=300&h=200&fit=crop',
        title: '🎮 Free Fire Tournament - Join Now!',
        channel: 'Gaming Community',
        points: 20,
        duration: '1:20',
        views: '5.4M',
        type: 'video',
        category: 'gaming'
    },
    {
        id: 'telegram_video_2',
        video_url: 'https://example.com/telegram-video-2.mp4',
        thumbnail: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=300&h=200&fit=crop',
        title: '📈 Stock Market Analysis - Weekly',
        channel: 'Stock Experts',
        points: 25,
        duration: '2:15',
        views: '1.2M',
        type: 'video',
        category: 'education'
    },
    {
        id: 'telegram_video_3',
        video_url: 'https://example.com/telegram-video-3.mp4',
        thumbnail: 'https://images.unsplash.com/photo-1533750349088-cd871a92f312?w=300&h=200&fit=crop',
        title: '🤖 AI Tools 2024 - Must Have Apps',
        channel: 'Tech Updates',
        points: 22,
        duration: '1:45',
        views: '2.8M',
        type: 'video',
        category: 'technology'
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
    },
    {
        id: 'x_video_2',
        type: 'video',
        thumbnail: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=300&h=200&fit=crop',
        title: '💪 Amazing Workout Transformation',
        username: 'Fitness Motivation',
        handle: '@FitMotivation',
        points: 18,
        duration: '0:45',
        views: '1.8M',
        likes: '95K',
        retweets: '22K',
        timestamp: '1 day ago',
        content: '6 months transformation! Never give up on your goals 💯',
        video_url: 'https://example.com/fitness-transformation.mp4'
    },
    {
        id: 'x_tweet_2',
        type: 'tweet',
        points: 12,
        username: 'Tech News',
        handle: '@TechUpdate',
        content: 'BREAKING: New iPhone 16 features leaked! 📱 Revolutionary camera system and AI enhancements.',
        likes: '180K',
        retweets: '65K',
        timestamp: '3 hours ago',
        media: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=300&h=200&fit=crop'
    },
    {
        id: 'x_video_3',
        type: 'video',
        thumbnail: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=300&h=200&fit=crop',
        title: '🎵 Viral Dance Challenge',
        username: 'Dance Trends',
        handle: '@DanceViral',
        points: 16,
        duration: '0:30',
        views: '3.2M',
        likes: '210K',
        retweets: '78K',
        timestamp: '6 hours ago',
        content: 'Can you beat this dance challenge? 💃 Show us your moves!',
        video_url: 'https://example.com/dance-challenge.mp4'
    },
    {
        id: 'x_tweet_3',
        type: 'tweet',
        points: 10,
        username: 'Crypto Expert',
        handle: '@CryptoGuru',
        content: 'Bitcoin showing strong bullish signals! 📈 This could be the start of the next rally. #BTC #Crypto',
        likes: '45K',
        retweets: '18K',
        timestamp: '8 hours ago',
        media: 'https://images.unsplash.com/photo-1516245834210-8e0a79664e4e?w=300&h=200&fit=crop'
    },
    {
        id: 'x_video_4',
        type: 'video',
        thumbnail: 'https://images.unsplash.com/photo-1542744173-8e7e53415bb0?w=300&h=200&fit=crop',
        title: '🍳 5 Minute Breakfast Recipes',
        username: 'Quick Recipes',
        handle: '@QuickEats',
        points: 14,
        duration: '1:00',
        views: '1.2M',
        likes: '68K',
        retweets: '25K',
        timestamp: '1 day ago',
        content: 'Start your day right with these quick and healthy breakfast ideas! 🥑',
        video_url: 'https://example.com/breakfast-recipes.mp4'
    },
    {
        id: 'x_tweet_4',
        type: 'tweet',
        points: 8,
        username: 'Movie Updates',
        handle: '@FilmNews',
        content: 'First look at the new Avengers movie! 🎬 Which character are you most excited to see?',
        likes: '120K',
        retweets: '42K',
        timestamp: '4 hours ago',
        media: 'https://images.unsplash.com/photo-1635805737707-575885ab0820?w=300&h=200&fit=crop'
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
        },
        {
            id: 'instagram_follow_3',
            username: 'foodie.heaven',
            name: 'Foodie Heaven',
            points: 20,
            followers: '3.2M',
            avatar: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=150&h=150&fit=crop'
        },
        {
            id: 'instagram_follow_4',
            username: 'fitness.motivation',
            name: 'Fitness Motivation',
            points: 35,
            followers: '4.1M',
            avatar: 'https://images.unsplash.com/photo-1534368270820-9de3d8053205?w=150&h=150&fit=crop'
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
        },
        {
            id: 'x_follow_3',
            username: 'SpaceX',
            handle: '@SpaceX',
            points: 40,
            followers: '28.5M',
            avatar: 'https://images.unsplash.com/photo-1446776653964-20c1d3a81b06?w=150&h=150&fit=crop',
            description: 'Space exploration company'
        },
        {
            id: 'x_follow_4',
            username: 'Movie Updates',
            handle: '@FilmNews',
            points: 20,
            followers: '3.8M',
            avatar: 'https://images.unsplash.com/photo-1489599804158-8b3bf6d1a4ea?w=150&h=150&fit=crop',
            description: 'Latest movie news and reviews'
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
        },
        {
            id: 'telegram_follow_3',
            channel: 'Tech Updates',
            points: 35,
            members: '210K',
            avatar: 'https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=150&h=150&fit=crop',
            description: 'Latest technology news and updates'
        },
        {
            id: 'telegram_follow_4',
            channel: 'Gaming Community',
            points: 30,
            members: '156K',
            avatar: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=150&h=150&fit=crop',
            description: 'Gaming news and community'
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
        },
        {
            id: 'youtube_follow_3',
            channel: 'Fitness Guru',
            points: 45,
            subscribers: '1.9M',
            avatar: 'https://images.unsplash.com/photo-1534368270820-9de3d8053205?w=150&h=150&fit=crop',
            description: 'Workout routines and fitness tips'
        },
        {
            id: 'youtube_follow_4',
            channel: 'Travel Vlogs',
            points: 30,
            subscribers: '2.2M',
            avatar: 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=150&h=150&fit=crop',
            description: 'Travel adventures and guides'
        }
    ]
};

// Initialize App
document.addEventListener('DOMContentLoaded', function() {
    loadAppState();
    updateUI();
    console.log('🎯 TapEarn App Initialized - All Features Working');
});

// Load App State from LocalStorage
function loadAppState() {
    const savedState = localStorage.getItem('miningState');
    if (savedState) {
        const state = JSON.parse(savedState);
        isMining = state.isMining || false;
        miningSeconds = state.miningSeconds || 0;
        userPoints = state.userPoints || 5564;
        
        if (isMining) {
            startMining();
        }
    }
}

// Save App State to LocalStorage
function saveAppState() {
    const miningState = {
        isMining: isMining,
        miningSeconds: miningSeconds,
        userPoints: userPoints,
        lastUpdated: Date.now()
    };
    localStorage.setItem('miningState', JSON.stringify(miningState));
}

// Add Transaction to History
function addTransaction(type, amount, description, icon) {
    const transaction = {
        type: type,
        amount: amount,
        description: description,
        timestamp: Date.now(),
        icon: icon
    };
    
    transactionHistory.unshift(transaction);
    
    if (transactionHistory.length > 50) {
        transactionHistory = transactionHistory.slice(0, 50);
    }
    
    localStorage.setItem('transactionHistory', JSON.stringify(transactionHistory));
}

// Update UI
function updateUI() {
    document.getElementById('walletPoints').textContent = formatNumber(userPoints);
    document.getElementById('totalPoints').textContent = formatNumber(userPoints);
    document.getElementById('videosWatched').textContent = watchedVideos;
    document.getElementById('totalReferrals').textContent = referrals;
    
    updateMiningTimerDisplay();
}

// Format numbers with commas
function formatNumber(num) {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

// Update Mining Timer Display
function updateMiningTimerDisplay() {
    const hours = Math.floor(miningSeconds / 3600);
    const minutes = Math.floor((miningSeconds % 3600) / 60);
    const seconds = miningSeconds % 60;
    
    document.getElementById('miningTime').textContent = 
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
    miningCard.classList.add('mining-active');
    document.getElementById('miningStatusText').textContent = 'Mining Active - 5 pts/min';
    document.getElementById('miningStatusText').style.color = '#FFD700';
    document.getElementById('miningRate').textContent = '300/hr';
    
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
    miningCard.classList.remove('mining-active');
    document.getElementById('miningStatusText').textContent = 'Click to start mining';
    document.getElementById('miningStatusText').style.color = '';
    
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

// Show Wallet History
function showWalletHistory() {
    document.getElementById('appContent').innerHTML = `
        <div class="wallet-history">
            <div class="section-header">
                <button onclick="showDashboard()" class="back-btn">← Back</button>
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

// Show Video Section
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

// Show YouTube Tab
function showYouTubeTab() {
    document.querySelectorAll('.platform-tab').forEach(tab => tab.classList.remove('active'));
    event.target.classList.add('active');
    
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

// Show Instagram Tab
function showInstagramTab() {
    document.querySelectorAll('.platform-tab').forEach(tab => tab.classList.remove('active'));
    event.target.classList.add('active');
    
    document.getElementById('appContent').innerHTML = `
        <div class="video-section">
            <div class="video-platform-tabs">
                <button class="platform-tab" onclick="showYouTubeTab()">YouTube</button>
                <button class="platform-tab active" onclick="showInstagramTab()">Instagram</button>
            </div>
            
            <div class="instagram-categories">
                <button class="category-btn active" onclick="showInstagramReels()">🎬 Reels</button>
                <button class="category-btn" onclick="showInstagramStories()">📖 Stories</button>
                <button class="category-btn" onclick="showInstagramFollow()">👤 Follow</button>
                <button class="category-btn" onclick="showTrendingInstagram()">🔥 Trending</button>
            </div>
            
            <div class="search-container">
                <input type="text" id="instagramSearchInput" placeholder="Search Instagram Reels..." value="trending reels">
                <button onclick="searchInstagramVideos()">🔍 Search</button>
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

// Show Instagram Stories
function showInstagramStories() {
    document.querySelectorAll('.category-btn').forEach(btn => btn.classList.remove('active'));
    event.target.classList.add('active');
    
    const stories = REAL_INSTAGRAM_VIDEOS.filter(video => video.type === 'story');
    displayInstagramVideos(stories, 'Instagram Stories');
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
    localStorage.setItem('followedInstagramAccounts', JSON.stringify(followedInstagramAccounts));
    addTransaction('instagram_follow', points, 'Instagram Follow: ' + username, '👤');
    updateUI();
    showNotification(`✅ +${points} Points! You followed @${username}`, 'success');
    
    // Refresh the Instagram follow section to update the UI
    showInstagramFollow();
}

// Show Trending Instagram
function showTrendingInstagram() {
    document.querySelectorAll('.category-btn').forEach(btn => btn.classList.remove('active'));
    event.target.classList.add('active');
    
    const trending = [...REAL_INSTAGRAM_VIDEOS].sort(() => 0.5 - Math.random()).slice(0, 4);
    displayInstagramVideos(trending, 'Trending Instagram');
}

// Search Instagram Videos
function searchInstagramVideos() {
    const query = document.getElementById('instagramSearchInput').value.trim() || 'trending reels';
    const container = document.getElementById('instagramResultsContainer');
    
    container.innerHTML = `
        <div class="loading">
            <div class="spinner"></div>
            <p>Searching Instagram for "${query}"...</p>
        </div>
    `;

    setTimeout(() => {
        const filteredVideos = REAL_INSTAGRAM_VIDEOS.filter(video => 
            video.title.toLowerCase().includes(query.toLowerCase()) ||
            video.username.toLowerCase().includes(query.toLowerCase())
        );
        
        displayInstagramVideos(filteredVideos.length > 0 ? filteredVideos : REAL_INSTAGRAM_VIDEOS, query);
    }, 1500);
}

// Display Instagram Videos
function displayInstagramVideos(videos, title) {
    const container = document.getElementById('instagramResultsContainer');
    
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

// Show Follow Section
function showFollowSection() {
    document.getElementById('appContent').innerHTML = `
        <div class="follow-section">
            <div class="section-header">
                <button onclick="showDashboard()" class="back-btn">← Back</button>
                <h3>👥 Follow & Earn</h3>
            </div>
            
            <div class="follow-platform-tabs">
                <button class="platform-tab active" onclick="showAllFollowTasks()">All</button>
                <button class="platform-tab" onclick="showInstagramFollowTasks()">📷 Instagram</button>
                <button class="platform-tab" onclick="showXFollowTasks()">🐦 X</button>
                <button class="platform-tab" onclick="showTelegramFollowTasks()">📱 Telegram</button>
                <button class="platform-tab" onclick="showYouTubeFollowTasks()">🎬 YouTube</button>
            </div>
            
            <div class="follow-stats">
                <div class="follow-stat">
                    <span class="stat-value">${Object.values(FOLLOW_TASKS).flat().length}</span>
                    <span class="stat-label">Total Tasks</span>
                </div>
                <div class="follow-stat">
                    <span class="stat-value">${Math.max(...Object.values(FOLLOW_TASKS).flat().map(v => v.points))}</span>
                    <span class="stat-label">Max Points</span>
                </div>
                <div class="follow-stat">
                    <span class="stat-value">${followedInstagramAccounts.length + followedXAccounts.length + followedTelegramChannels.length + subscribedYouTubeChannels.length}</span>
                    <span class="stat-label">Completed</span>
                </div>
            </div>
            
            <div id="followResultsContainer">
                <div class="loading">
                    <div class="spinner"></div>
                    <p>Loading follow tasks...</p>
                </div>
            </div>
        </div>
    `;
    showAllFollowTasks();
}

// Show All Follow Tasks
function showAllFollowTasks() {
    document.querySelectorAll('.platform-tab').forEach(tab => tab.classList.remove('active'));
    event.target.classList.add('active');
    
    const allTasks = [
        ...FOLLOW_TASKS.instagram.map(task => ({...task, platform: 'instagram'})),
        ...FOLLOW_TASKS.x.map(task => ({...task, platform: 'x'})),
        ...FOLLOW_TASKS.telegram.map(task => ({...task, platform: 'telegram'})),
        ...FOLLOW_TASKS.youtube.map(task => ({...task, platform: 'youtube'}))
    ];
    
    displayFollowTasks(allTasks, 'All Follow Tasks');
}

// Show Instagram Follow Tasks
function showInstagramFollowTasks() {
    document.querySelectorAll('.platform-tab').forEach(tab => tab.classList.remove('active'));
    event.target.classList.add('active');
    
    const tasks = FOLLOW_TASKS.instagram.map(task => ({...task, platform: 'instagram'}));
    displayFollowTasks(tasks, 'Instagram Follow');
}

// Show X Follow Tasks
function showXFollowTasks() {
    document.querySelectorAll('.platform-tab').forEach(tab => tab.classList.remove('active'));
    event.target.classList.add('active');
    
    const tasks = FOLLOW_TASKS.x.map(task => ({...task, platform: 'x'}));
    displayFollowTasks(tasks, 'X Follow');
}

// Show Telegram Follow Tasks
function showTelegramFollowTasks() {
    document.querySelectorAll('.platform-tab').forEach(tab => tab.classList.remove('active'));
    event.target.classList.add('active');
    
    const tasks = FOLLOW_TASKS.telegram.map(task => ({...task, platform: 'telegram'}));
    displayFollowTasks(tasks, 'Telegram Join');
}

// Show YouTube Follow Tasks
function showYouTubeFollowTasks() {
    document.querySelectorAll('.platform-tab').forEach(tab => tab.classList.remove('active'));
    event.target.classList.add('active');
    
    const tasks = FOLLOW_TASKS.youtube.map(task => ({...task, platform: 'youtube'}));
    displayFollowTasks(tasks, 'YouTube Subscribe');
}

// Display Follow Tasks
function displayFollowTasks(tasks, title) {
    const container = document.getElementById('followResultsContainer');
    
    let html = `
        <div class="section-title">
            <h3>👥 ${title}</h3>
            <p class="section-subtitle">${tasks.length} tasks found • Earn up to ${Math.max(...tasks.map(v => v.points))} points each</p>
        </div>
        <div class="follow-tasks-grid">
    `;
    
    tasks.forEach((task) => {
        let isCompleted = false;
        let platformIcon = '';
        let actionText = '';
        
        switch(task.platform) {
            case 'instagram':
                isCompleted = followedInstagramAccounts.includes(task.id);
                platformIcon = '📷';
                actionText = 'Follow';
                break;
            case 'x':
                isCompleted = followedXAccounts.includes(task.id);
                platformIcon = '🐦';
                actionText = 'Follow';
                break;
            case 'telegram':
                isCompleted = followedTelegramChannels.includes(task.id);
                platformIcon = '📱';
                actionText = 'Join';
                break;
            case 'youtube':
                isCompleted = subscribedYouTubeChannels.includes(task.id);
                platformIcon = '🎬';
                actionText = 'Subscribe';
                break;
        }
        
        html += `
            <div class="follow-task-card ${task.platform}">
                <div class="follow-task-header">
                    <div class="platform-icon">${platformIcon}</div>
                    <div class="task-platform">${task.platform.charAt(0).toUpperCase() + task.platform.slice(1)}</div>
                    <div class="task-points">+${task.points}</div>
                </div>
                
                <div class="follow-task-content">
                    <div class="task-avatar">
                        <img src="${task.avatar}" alt="${task.name || task.channel || task.username}">
                    </div>
                    <div class="task-details">
                        <h4 class="task-name">${task.name || task.channel || task.username}</h4>
                        <p class="task-handle">${task.handle || task.username || `@${task.channel?.toLowerCase().replace(/\s+/g, '')}`}</p>
                        <p class="task-description">${task.description || `${task.followers || task.members || task.subscribers} ${task.platform === 'telegram' ? 'members' : task.platform === 'youtube' ? 'subscribers' : 'followers'}`}</p>
                    </div>
                </div>
                
                <div class="follow-task-actions">
                    ${isCompleted ? 
                        '<span class="follow-task-completed">✅ Completed</span>' : 
                        `<button class="follow-task-btn" onclick="completeFollowTask('${task.platform}', '${task.id}', ${task.points}, '${task.name || task.channel || task.username}')">
                            ${actionText} +${task.points}
                        </button>`
                    }
                </div>
            </div>
        `;
    });
    
    html += '</div>';
    container.innerHTML = html;
}

// Complete Follow Task
function completeFollowTask(platform, taskId, points, name) {
    let isCompleted = false;
    
    switch(platform) {
        case 'instagram':
            if (followedInstagramAccounts.includes(taskId)) {
                isCompleted = true;
            } else {
                followedInstagramAccounts.push(taskId);
                localStorage.setItem('followedInstagramAccounts', JSON.stringify(followedInstagramAccounts));
            }
            break;
        case 'x':
            if (followedXAccounts.includes(taskId)) {
                isCompleted = true;
            } else {
                followedXAccounts.push(taskId);
                localStorage.setItem('followedXAccounts', JSON.stringify(followedXAccounts));
            }
            break;
        case 'telegram':
            if (followedTelegramChannels.includes(taskId)) {
                isCompleted = true;
            } else {
                followedTelegramChannels.push(taskId);
                localStorage.setItem('followedTelegramChannels', JSON.stringify(followedTelegramChannels));
            }
            break;
        case 'youtube':
            if (subscribedYouTubeChannels.includes(taskId)) {
                isCompleted = true;
            } else {
                subscribedYouTubeChannels.push(taskId);
                localStorage.setItem('subscribedYouTubeChannels', JSON.stringify(subscribedYouTubeChannels));
            }
            break;
    }
    
    if (isCompleted) {
        showNotification('❌ You have already completed this task!', 'warning');
        return;
    }
    
    userPoints += points;
    let transactionType = '';
    let icon = '';
    
    switch(platform) {
        case 'instagram':
            transactionType = 'instagram_follow';
            icon = '📷';
            break;
        case 'x':
            transactionType = 'x_follow';
            icon = '🐦';
            break;
        case 'telegram':
            transactionType = 'telegram_join';
            icon = '📱';
            break;
        case 'youtube':
            transactionType = 'youtube_subscribe';
            icon = '🎬';
            break;
    }
    
    addTransaction(transactionType, points, `${platform.charAt(0).toUpperCase() + platform.slice(1)}: ${name}`, icon);
    updateUI();
    showNotification(`✅ +${points} Points! ${platform} task completed!`, 'success');
    
    // Refresh the follow section to update the UI
    showFollowSection();
}

// Show Telegram Section
function showTelegramSection() {
    document.getElementById('appContent').innerHTML = `
        <div class="telegram-section">
            <div class="section-header">
                <button onclick="showDashboard()" class="back-btn">← Back</button>
                <h3>📱 Telegram Videos & Ads</h3>
            </div>
            
            <div class="telegram-categories">
                <button class="category-btn active" onclick="showAllTelegramVideos()">All Videos</button>
                <button class="category-btn" onclick="showTelegramAds()">📢 Ads</button>
                <button class="category-btn" onclick="showTelegramVideos()">🎥 Videos</button>
                <button class="category-btn" onclick="showTelegramFollow()">👥 Join</button>
                <button class="category-btn" onclick="showTrendingTelegram()">🔥 Trending</button>
            </div>
            
            <div class="search-container">
                <input type="text" id="telegramSearchInput" placeholder="Search Telegram videos..." value="trending">
                <button onclick="searchTelegramVideos()">🔍 Search</button>
            </div>
            
            <div class="telegram-stats">
                <div class="telegram-stat">
                    <span class="stat-value">${TELEGRAM_VIDEOS.length}</span>
                    <span class="stat-label">Total Videos</span>
                </div>
                <div class="telegram-stat">
                    <span class="stat-value">${Math.max(...TELEGRAM_VIDEOS.map(v => v.points))}</span>
                    <span class="stat-label">Max Points</span>
                </div>
                <div class="telegram-stat">
                    <span class="stat-value">${watchedTelegramVideoIds.length}</span>
                    <span class="stat-label">Watched</span>
                </div>
            </div>
            
            <div id="telegramResultsContainer">
                <div class="loading">
                    <div class="spinner"></div>
                    <p>Loading Telegram videos...</p>
                </div>
            </div>
        </div>
    `;
    showAllTelegramVideos();
}

// Show Telegram Follow
function showTelegramFollow() {
    document.querySelectorAll('.category-btn').forEach(btn => btn.classList.remove('active'));
    event.target.classList.add('active');
    
    displayTelegramFollowChannels();
}

// Display Telegram Follow Channels
function displayTelegramFollowChannels() {
    const container = document.getElementById('telegramResultsContainer');
    
    let html = `
        <div class="section-title">
            <h3>👥 Telegram Join</h3>
            <p class="section-subtitle">Join channels and earn points</p>
        </div>
        <div class="follow-channels-grid">
    `;
    
    FOLLOW_TASKS.telegram.forEach(channel => {
        const isJoined = followedTelegramChannels.includes(channel.id);
        
        html += `
            <div class="follow-channel-card">
                <div class="channel-avatar">
                    <img src="${channel.avatar}" alt="${channel.channel}">
                </div>
                <div class="channel-details">
                    <h4 class="channel-name">${channel.channel}</h4>
                    <p class="channel-members">${channel.members} members</p>
                    <p class="channel-description">${channel.description}</p>
                </div>
                <div class="channel-actions">
                    ${isJoined ? 
                        '<span class="join-btn joined">✅ Joined</span>' : 
                        `<button class="join-btn" onclick="joinTelegramChannel('${channel.id}', ${channel.points}, '${channel.channel}')">Join +${channel.points}</button>`
                    }
                </div>
            </div>
        `;
    });
    
    html += '</div>';
    container.innerHTML = html;
}

// Join Telegram Channel
function joinTelegramChannel(channelId, points, channelName) {
    if (followedTelegramChannels.includes(channelId)) {
        showNotification('❌ You have already joined this channel!', 'warning');
        return;
    }
    
    userPoints += points;
    followedTelegramChannels.push(channelId);
    localStorage.setItem('followedTelegramChannels', JSON.stringify(followedTelegramChannels));
    addTransaction('telegram_join', points, 'Telegram Join: ' + channelName, '📱');
    updateUI();
    showNotification(`✅ +${points} Points! You joined ${channelName}`, 'success');
    
    // Refresh the Telegram follow section to update the UI
    showTelegramFollow();
}

// Show All Telegram Videos
function showAllTelegramVideos() {
    document.querySelectorAll('.category-btn').forEach(btn => btn.classList.remove('active'));
    event.target.classList.add('active');
    displayTelegramVideos(TELEGRAM_VIDEOS, 'All Telegram Videos');
}

// Show Telegram Ads
function showTelegramAds() {
    document.querySelectorAll('.category-btn').forEach(btn => btn.classList.remove('active'));
    event.target.classList.add('active');
    const ads = TELEGRAM_VIDEOS.filter(video => video.type === 'ad');
    displayTelegramVideos(ads, 'Telegram Ads');
}

// Show Telegram Videos
function showTelegramVideos() {
    document.querySelectorAll('.category-btn').forEach(btn => btn.classList.remove('active'));
    event.target.classList.add('active');
    const videos = TELEGRAM_VIDEOS.filter(video => video.type === 'video');
    displayTelegramVideos(videos, 'Telegram Videos');
}

// Show Trending Telegram
function showTrendingTelegram() {
    document.querySelectorAll('.category-btn').forEach(btn => btn.classList.remove('active'));
    event.target.classList.add('active');
    const trending = [...TELEGRAM_VIDEOS].sort((a, b) => b.points - a.points).slice(0, 4);
    displayTelegramVideos(trending, 'Trending on Telegram');
}

// Search Telegram Videos
function searchTelegramVideos() {
    const query = document.getElementById('telegramSearchInput').value.trim() || 'trending';
    const container = document.getElementById('telegramResultsContainer');
    
    container.innerHTML = `
        <div class="loading">
            <div class="spinner"></div>
            <p>Searching Telegram for "${query}"...</p>
        </div>
    `;

    setTimeout(() => {
        const filteredVideos = TELEGRAM_VIDEOS.filter(video => 
            video.title.toLowerCase().includes(query.toLowerCase()) ||
            video.channel.toLowerCase().includes(query.toLowerCase()) ||
            video.category.toLowerCase().includes(query.toLowerCase())
        );
        
        displayTelegramVideos(filteredVideos.length > 0 ? filteredVideos : TELEGRAM_VIDEOS, `Results for "${query}"`);
    }, 1500);
}

// Display Telegram Videos
function displayTelegramVideos(videos, title) {
    const container = document.getElementById('telegramResultsContainer');
    
    let html = `
        <div class="section-title">
            <h3>📱 ${title}</h3>
            <p class="section-subtitle">${videos.length} videos found • Earn up to ${Math.max(...videos.map(v => v.points))} points each</p>
        </div>
        <div class="telegram-videos-grid">
    `;
    
    videos.forEach((video) => {
        const isWatched = watchedTelegramVideoIds.includes(video.id);
        
        html += `
            <div class="telegram-video-card" onclick="selectTelegramVideo('${video.id}', ${video.points}, '${video.title.replace(/'/g, "\\'")}', '${video.channel.replace(/'/g, "\\'")}', '${video.type}')">
                <div class="telegram-thumbnail">
                    <img src="${video.thumbnail}" alt="${video.title}">
                    <div class="telegram-points-badge">+${video.points} pts</div>
                    <div class="telegram-type-badge ${video.type}">${video.type === 'ad' ? '📢 Ad' : '🎥 Video'}</div>
                    <div class="telegram-duration">${video.duration}</div>
                </div>
                <div class="telegram-video-details">
                    <h4 class="telegram-video-title">${video.title}</h4>
                    <div class="telegram-video-meta">
                        <span class="telegram-channel">${video.channel}</span>
                        <span class="telegram-category">#${video.category}</span>
                    </div>
                    <div class="telegram-video-meta">
                        <span class="telegram-views">👁️ ${video.views}</span>
                        ${isWatched ? 
                            '<span class="telegram-watch watched">✅ Earned</span>' : 
                            '<span class="telegram-watch">▶️ Watch & Earn</span>'
                        }
                    </div>
                </div>
            </div>
        `;
    });
    
    html += '</div>';
    container.innerHTML = html;
}

// Select Telegram Video for Earning
function selectTelegramVideo(videoId, points, title, channel, type) {
    if (watchedTelegramVideoIds.includes(videoId)) {
        showNotification('❌ You have already earned points for this video!', 'warning');
        return;
    }
    
    currentVideoId = videoId;
    currentPoints = points;
    currentTitle = title;
    
    const videoData = TELEGRAM_VIDEOS.find(v => v.id === videoId);
    
    document.getElementById('appContent').innerHTML = `
        <div class="video-player-section">
            <div class="section-header">
                <button onclick="showTelegramSection()" class="back-btn">← Back to Telegram</button>
                <h3>🎯 Earn Points</h3>
            </div>
            
            <div class="telegram-player-container">
                <div class="telegram-player-header">
                    <div class="telegram-channel-info">
                        <div class="channel-avatar">${type === 'ad' ? '📢' : '🎥'}</div>
                        <div class="channel-details">
                            <div class="channel-name">${channel}</div>
                            <div class="channel-status">${type === 'ad' ? 'Sponsored Content' : 'Telegram Channel'}</div>
                        </div>
                    </div>
                    <div class="telegram-options">⋯</div>
                </div>
                
                <div class="telegram-video-placeholder">
                    <div class="telegram-logo">📱</div>
                    <h3>Telegram ${type === 'ad' ? 'Advertisement' : 'Video'}</h3>
                    <p>"${title}"</p>
                    <div class="telegram-stats">
                        <span>⏱️ ${videoData.duration}</span>
                        <span>👁️ ${videoData.views}</span>
                        <span>💰 +${points} points</span>
                    </div>
                    <div class="telegram-simulation">
                        <div class="simulation-progress"></div>
                        <div class="telegram-message">
                            <div class="message-bubble">Watch this ${type} to earn ${points} points!</div>
                        </div>
                    </div>
                </div>
                
                <div class="telegram-player-actions">
                    <div class="telegram-action-btn">❤️</div>
                    <div class="telegram-action-btn">💬</div>
                    <div class="telegram-action-btn">🔄</div>
                    <div class="telegram-action-btn">📤</div>
                </div>
            </div>
            
            <div class="video-timer telegram-timer">
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

// Show X Section
function showXSection() {
    document.getElementById('appContent').innerHTML = `
        <div class="x-section">
            <div class="section-header">
                <button onclick="showDashboard()" class="back-btn">← Back</button>
                <h3>🐦 X (Twitter) Tasks</h3>
            </div>
            
            <div class="x-categories">
                <button class="category-btn active" onclick="showAllXContent()">All Content</button>
                <button class="category-btn" onclick="showXVideos()">🎬 Videos</button>
                <button class="category-btn" onclick="showXTweets()">💬 Tweets</button>
                <button class="category-btn" onclick="showXFollow()">👤 Follow</button>
                <button class="category-btn" onclick="showTrendingX()">🔥 Trending</button>
            </div>
            
            <div class="search-container">
                <input type="text" id="xSearchInput" placeholder="Search X content..." value="trending">
                <button onclick="searchXContent()">🔍 Search</button>
            </div>
            
            <div class="x-stats">
                <div class="x-stat">
                    <span class="stat-value">${X_CONTENT.length}</span>
                    <span class="stat-label">Total Tasks</span>
                </div>
                <div class="x-stat">
                    <span class="stat-value">${Math.max(...X_CONTENT.map(v => v.points))}</span>
                    <span class="stat-label">Max Points</span>
                </div>
                <div class="x-stat">
                    <span class="stat-value">${watchedXVideoIds.length + likedXTweetIds.length + retweetedXTweetIds.length + followedXAccounts.length}</span>
                    <span class="stat-label">Completed</span>
                </div>
            </div>
            
            <div id="xResultsContainer">
                <div class="loading">
                    <div class="spinner"></div>
                    <p>Loading X content...</p>
                </div>
            </div>
        </div>
    `;
    showAllXContent();
}

// Show X Follow
function showXFollow() {
    document.querySelectorAll('.category-btn').forEach(btn => btn.classList.remove('active'));
    event.target.classList.add('active');
    
    displayXFollowAccounts();
}

// Display X Follow Accounts
function displayXFollowAccounts() {
    const container = document.getElementById('xResultsContainer');
    
    let html = `
        <div class="section-title">
            <h3>👤 X Follow</h3>
            <p class="section-subtitle">Follow accounts and earn points</p>
        </div>
        <div class="follow-accounts-grid">
    `;
    
    FOLLOW_TASKS.x.forEach(account => {
        const isFollowed = followedXAccounts.includes(account.id);
        
        html += `
            <div class="follow-account-card x-follow">
                <div class="account-avatar">
                    <img src="${account.avatar}" alt="${account.username}">
                </div>
                <div class="account-details">
                    <h4 class="account-name">${account.username}</h4>
                    <p class="account-username">${account.handle}</p>
                    <p class="account-followers">${account.followers} followers</p>
                    <p class="account-description">${account.description}</p>
                </div>
                <div class="account-actions">
                    ${isFollowed ? 
                        '<span class="follow-btn followed">✅ Followed</span>' : 
                        `<button class="follow-btn" onclick="followXAccount('${account.id}', ${account.points}, '${account.username}')">Follow +${account.points}</button>`
                    }
                </div>
            </div>
        `;
    });
    
    html += '</div>';
    container.innerHTML = html;
}

// Follow X Account
function followXAccount(accountId, points, username) {
    if (followedXAccounts.includes(accountId)) {
        showNotification('❌ You have already followed this account!', 'warning');
        return;
    }
    
    userPoints += points;
    followedXAccounts.push(accountId);
    localStorage.setItem('followedXAccounts', JSON.stringify(followedXAccounts));
    addTransaction('x_follow', points, 'X Follow: ' + username, '🐦');
    updateUI();
    showNotification(`✅ +${points} Points! You followed @${username}`, 'success');
    
    // Refresh the X follow section to update the UI
    showXFollow();
}

// Show All X Content
function showAllXContent() {
    document.querySelectorAll('.category-btn').forEach(btn => btn.classList.remove('active'));
    event.target.classList.add('active');
    displayXContent(X_CONTENT, 'All X Content');
}

// Show X Videos
function showXVideos() {
    document.querySelectorAll('.category-btn').forEach(btn => btn.classList.remove('active'));
    event.target.classList.add('active');
    const videos = X_CONTENT.filter(item => item.type === 'video');
    displayXContent(videos, 'X Videos');
}

// Show X Tweets
function showXTweets() {
    document.querySelectorAll('.category-btn').forEach(btn => btn.classList.remove('active'));
    event.target.classList.add('active');
    const tweets = X_CONTENT.filter(item => item.type === 'tweet');
    displayXContent(tweets, 'X Tweets');
}

// Show Trending X
function showTrendingX() {
    document.querySelectorAll('.category-btn').forEach(btn => btn.classList.remove('active'));
    event.target.classList.add('active');
    const trending = [...X_CONTENT].sort((a, b) => b.points - a.points).slice(0, 6);
    displayXContent(trending, 'Trending on X');
}

// Search X Content
function searchXContent() {
    const query = document.getElementById('xSearchInput').value.trim() || 'trending';
    const container = document.getElementById('xResultsContainer');
    
    container.innerHTML = `
        <div class="loading">
            <div class="spinner"></div>
            <p>Searching X for "${query}"...</p>
        </div>
    `;

    setTimeout(() => {
        const filteredContent = X_CONTENT.filter(item => 
            item.title?.toLowerCase().includes(query.toLowerCase()) ||
            item.username.toLowerCase().includes(query.toLowerCase()) ||
            item.content.toLowerCase().includes(query.toLowerCase()) ||
            item.handle.toLowerCase().includes(query.toLowerCase())
        );
        
        displayXContent(filteredContent.length > 0 ? filteredContent : X_CONTENT, `Results for "${query}"`);
    }, 1500);
}

// Display X Content
function displayXContent(content, title) {
    const container = document.getElementById('xResultsContainer');
    
    let html = `
        <div class="section-title">
            <h3>🐦 ${title}</h3>
            <p class="section-subtitle">${content.length} tasks found • Earn up to ${Math.max(...content.map(v => v.points))} points each</p>
        </div>
        <div class="x-content-grid">
    `;
    
    content.forEach((item) => {
        const isWatched = watchedXVideoIds.includes(item.id);
        const isLiked = likedXTweetIds.includes(item.id);
        const isRetweeted = retweetedXTweetIds.includes(item.id);
        
        if (item.type === 'video') {
            html += `
                <div class="x-video-card" onclick="selectXVideo('${item.id}', ${item.points}, '${item.title.replace(/'/g, "\\'")}', '${item.username.replace(/'/g, "\\'")}', '${item.handle.replace(/'/g, "\\'")}')">
                    <div class="x-thumbnail">
                        <img src="${item.thumbnail}" alt="${item.title}">
                        <div class="x-points-badge">+${item.points} pts</div>
                        <div class="x-type-badge video">🎬 Video</div>
                        <div class="x-duration">${item.duration}</div>
                    </div>
                    <div class="x-content-details">
                        <h4 class="x-content-title">${item.title}</h4>
                        <div class="x-user-info">
                            <div class="x-avatar"></div>
                            <div class="x-user-details">
                                <div class="x-username">${item.username}</div>
                                <div class="x-handle">${item.handle}</div>
                            </div>
                        </div>
                        <p class="x-content-text">${item.content}</p>
                        <div class="x-stats-row">
                            <span class="x-stat">👁️ ${item.views}</span>
                            <span class="x-stat">❤️ ${item.likes}</span>
                            <span class="x-stat">🔄 ${item.retweets}</span>
                        </div>
                        <div class="x-actions">
                            ${isWatched ? 
                                '<span class="x-action-completed">✅ Video Watched</span>' : 
                                '<span class="x-action-available">▶️ Watch Video</span>'
                            }
                        </div>
                    </div>
                </div>
            `;
        } else {
            const canLike = !isLiked;
            const canRetweet = !isRetweeted;
            const totalPoints = (canLike ? 5 : 0) + (canRetweet ? 5 : 0);
            
            html += `
                <div class="x-tweet-card">
                    <div class="x-tweet-header">
                        <div class="x-user-info">
                            <div class="x-avatar"></div>
                            <div class="x-user-details">
                                <div class="x-username">${item.username}</div>
                                <div class="x-handle">${item.handle} • ${item.timestamp}</div>
                            </div>
                        </div>
                    </div>
                    <div class="x-tweet-content">
                        <p class="x-tweet-text">${item.content}</p>
                        ${item.media ? `<img src="${item.media}" alt="Tweet media" class="x-tweet-media">` : ''}
                    </div>
                    <div class="x-tweet-stats">
                        <span class="x-tweet-stat">${item.likes} Likes</span>
                        <span class="x-tweet-stat">${item.retweets} Retweets</span>
                    </div>
                    <div class="x-tweet-actions">
                        <div class="x-action-buttons">
                            ${canLike ? 
                                `<button class="x-action-btn like" onclick="likeXTweet('${item.id}', ${item.points}, '${item.content.substring(0, 30).replace(/'/g, "\\'")}...')">
                                    ❤️ Like (+5 pts)
                                </button>` : 
                                '<span class="x-action-completed">✅ Liked</span>'
                            }
                            ${canRetweet ? 
                                `<button class="x-action-btn retweet" onclick="retweetXTweet('${item.id}', ${item.points}, '${item.content.substring(0, 30).replace(/'/g, "\\'")}...')">
                                    🔄 Retweet (+5 pts)
                                </button>` : 
                                '<span class="x-action-completed">✅ Retweeted</span>'
                            }
                        </div>
                        ${totalPoints > 0 ? 
                            `<div class="x-total-points">Earn up to +${totalPoints} points</div>` : 
                            '<div class="x-total-points completed">✅ All tasks completed</div>'
                        }
                    </div>
                </div>
            `;
        }
    });
    
    html += '</div>';
    container.innerHTML = html;
}

// Select X Video for Earning
function selectXVideo(videoId, points, title, username, handle) {
    if (watchedXVideoIds.includes(videoId)) {
        showNotification('❌ You have already earned points for this video!', 'warning');
        return;
    }
    
    currentVideoId = videoId;
    currentPoints = points;
    currentTitle = title;
    
    const videoData = X_CONTENT.find(v => v.id === videoId);
    
    document.getElementById('appContent').innerHTML = `
        <div class="video-player-section">
            <div class="section-header">
                <button onclick="showXSection()" class="back-btn">← Back to X</button>
                <h3>🎯 Earn Points</h3>
            </div>
            
            <div class="x-player-container">
                <div class="x-player-header">
                    <div class="x-user-info">
                        <div class="x-avatar"></div>
                        <div class="x-user-details">
                            <div class="x-username">${username}</div>
                            <div class="x-handle">${handle}</div>
                        </div>
                    </div>
                    <div class="x-options">⋯</div>
                </div>
                
                <div class="x-video-placeholder">
                    <div class="x-logo">🐦</div>
                    <h3>X Video</h3>
                    <p>"${title}"</p>
                    <div class="x-stats">
                        <span>⏱️ ${videoData.duration}</span>
                        <span>👁️ ${videoData.views}</span>
                        <span>💰 +${points} points</span>
                    </div>
                    <div class="x-simulation">
                        <div class="simulation-progress x-progress"></div>
                        <div class="x-message">
                            <div class="message-bubble x-bubble">Watch this video to earn ${points} points!</div>
                        </div>
                    </div>
                </div>
                
                <div class="x-player-actions">
                    <div class="x-action-btn">❤️</div>
                    <div class="x-action-btn">💬</div>
                    <div class="x-action-btn">🔄</div>
                    <div class="x-action-btn">📤</div>
                </div>
            </div>
            
            <div class="video-timer x-timer">
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

// Like X Tweet
function likeXTweet(tweetId, points, content) {
    if (likedXTweetIds.includes(tweetId)) {
        showNotification('❌ You have already liked this tweet!', 'warning');
        return;
    }
    
    userPoints += 5;
    likedXTweetIds.push(tweetId);
    localStorage.setItem('likedXTweets', JSON.stringify(likedXTweetIds));
    addTransaction('x_like', 5, 'X Like: ' + content, '❤️');
    updateUI();
    showNotification('❤️ +5 Points! Tweet liked successfully!', 'success');
    
    // Refresh the X section to update the UI
    showXSection();
}

// Retweet X Tweet
function retweetXTweet(tweetId, points, content) {
    if (retweetedXTweetIds.includes(tweetId)) {
        showNotification('❌ You have already retweeted this tweet!', 'warning');
        return;
    }
    
    userPoints += 5;
    retweetedXTweetIds.push(tweetId);
    localStorage.setItem('retweetedXTweets', JSON.stringify(retweetedXTweetIds));
    addTransaction('x_retweet', 5, 'X Retweet: ' + content, '🔄');
    updateUI();
    showNotification('🔄 +5 Points! Tweet retweeted successfully!', 'success');
    
    // Refresh the X section to update the UI
    showXSection();
}

// Search YouTube Videos
async function searchYouTubeVideos() {
    const query = document.getElementById('youtubeSearchInput').value.trim() || 'trending shorts';
    const container = document.getElementById('videoResultsContainer');
    
    container.innerHTML = `
        <div class="loading">
            <div class="spinner"></div>
            <p>Searching YouTube for "${query}"...</p>
        </div>
    `;

    try {
        const videos = await searchRealYouTubeVideos(query);
        displayYouTubeVideos(videos, query);
    } catch (error) {
        console.error('YouTube search failed:', error);
        showDemoVideos();
    }
}

// Search Real YouTube Videos
async function searchRealYouTubeVideos(query) {
    try {
        const response = await fetch(
            `https://www.googleapis.com/youtube/v3/search?part=snippet&type=video&videoDuration=short&q=${encodeURIComponent(query)}&maxResults=8&key=${YOUTUBE_API_KEY}`
        );
        
        if (!response.ok) {
            throw new Error(`YouTube API error: ${response.status}`);
        }
        
        const data = await response.json();
        
        if (!data.items || data.items.length === 0) {
            throw new Error('No videos found');
        }
        
        return data.items;
    } catch (error) {
        console.error('YouTube API Error:', error.message);
        throw error;
    }
}

// Display YouTube Videos
function displayYouTubeVideos(videos, query) {
    const container = document.getElementById('videoResultsContainer');
    
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
    
    document.getElementById('appContent').innerHTML = `
        <div class="video-player-section">
            <div class="section-header">
                <button onclick="showVideoSection()" class="back-btn">← Back to Videos</button>
                <h3>🎯 Earn Points</h3>
            </div>
            
            <div class="youtube-iframe-container">
                <iframe 
                    width="100%" 
                    height="100%" 
                    src="https://www.youtube.com/embed/${videoId}?autoplay=1&controls=1" 
                    frameborder="0" 
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                    allowfullscreen>
                </iframe>
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
    
    document.getElementById('appContent').innerHTML = `
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
                    <div class="instagram-options">⋯</div>
                </div>
                
                <div class="instagram-video-placeholder">
                    <div class="instagram-logo">📷</div>
                    <h3>Instagram ${videoData.type === 'story' ? 'Story' : 'Reel'}</h3>
                    <p>"${title}"</p>
                    <div class="instagram-stats">
                        <span>❤️ ${videoData.likes}</span>
                        <span>👁️ ${videoData.views}</span>
                    </div>
                    <div class="video-simulation">
                        <div class="simulation-bar"></div>
                        <div class="simulation-bar"></div>
                        <div class="simulation-bar"></div>
                    </div>
                </div>
                
                <div class="instagram-player-actions">
                    <div class="action-btn">❤️</div>
                    <div class="action-btn">💬</div>
                    <div class="action-btn">↪️</div>
                    <div class="action-btn">📤</div>
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
            localStorage.setItem('watchedInstagramVideos', JSON.stringify(watchedInstagramVideoIds));
        }
        addTransaction('instagram', currentPoints, 'Instagram: ' + currentTitle.substring(0, 20) + '...', '📷');
    } else if (isTelegram) {
        // Telegram video
        if (currentVideoId && !watchedTelegramVideoIds.includes(currentVideoId)) {
            watchedTelegramVideoIds.push(currentVideoId);
            localStorage.setItem('watchedTelegramVideos', JSON.stringify(watchedTelegramVideoIds));
        }
        addTransaction('telegram', currentPoints, 'Telegram: ' + currentTitle.substring(0, 20) + '...', '📱');
    } else if (isX) {
        // X video
        if (currentVideoId && !watchedXVideoIds.includes(currentVideoId)) {
            watchedXVideoIds.push(currentVideoId);
            localStorage.setItem('watchedXVideos', JSON.stringify(watchedXVideoIds));
        }
        addTransaction('x_video', currentPoints, 'X Video: ' + currentTitle.substring(0, 20) + '...', '🐦');
    } else {
        // YouTube video
        if (currentVideoId && !watchedVideoIds.includes(currentVideoId)) {
            watchedVideoIds.push(currentVideoId);
            localStorage.setItem('watchedVideos', JSON.stringify(watchedVideoIds));
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

// Cancel Video Earning
function cancelVideoEarning() {
    if (videoTrackingInterval) {
        clearInterval(videoTrackingInterval);
    }
    showNotification('❌ Points earning cancelled', 'warning');
    showVideoSection();
}

// Show Referral System
function showReferralSystem() {
    document.getElementById('appContent').innerHTML = `
        <div class="referral-section">
            <div class="section-header">
                <button onclick="showDashboard()" class="back-btn">← Back</button>
                <h3>👥 Refer & Earn</h3>
            </div>
            
            <div class="referral-card">
                <div class="referral-code">TAPEARN123</div>
                <p class="referral-note">Share this code with friends to earn 50 points each!</p>
                
                <div class="referral-stats">
                    <div class="referral-stat">
                        <span class="stat-value">${referrals}</span>
                        <span class="stat-label">Total Referrals</span>
                    </div>
                    <div class="referral-stat">
                        <span class="stat-value">${referrals * 50}</span>
                        <span class="stat-label">Points Earned</span>
                    </div>
                    <div class="referral-stat">
                        <span class="stat-value">50</span>
                        <span class="stat-label">Per Referral</span>
                    </div>
                </div>
                
                <div class="sharing-options">
                    <button class="share-btn telegram" onclick="shareOnTelegram()">
                        📱 Telegram
                    </button>
                    <button class="share-btn whatsapp" onclick="shareOnWhatsApp()">
                        💚 WhatsApp
                    </button>
                    <button class="share-btn copy" onclick="copyReferralCode()">
                        📋 Copy Code
                    </button>
                </div>
                
                <button onclick="addReferral()" class="action-btn primary">
                    👥 Add Test Referral
                </button>
            </div>
            
            <div class="referral-benefits">
                <h4>🎁 Referral Benefits</h4>
                <ul>
                    <li>✅ Earn 50 points for each friend who joins</li>
                    <li>✅ Your friend gets 25 bonus points</li>
                    <li>✅ Unlimited referrals - no limits!</li>
                    <li>✅ Points credited instantly</li>
                </ul>
            </div>
        </div>
    `;
}

// Share on Telegram
function shareOnTelegram() {
    const message = `Join TapEarn and earn free points! Use my referral code: TAPEARN123 - Download now: https://tapearn.app`;
    const url = `https://t.me/share/url?url=https://tapearn.app&text=${encodeURIComponent(message)}`;
    window.open(url, '_blank');
    showNotification('✅ Telegram sharing opened!', 'success');
}

// Share on WhatsApp
function shareOnWhatsApp() {
    const message = `Join TapEarn and earn free points! Use my referral code: TAPEARN123 - Download now: https://tapearn.app`;
    const url = `https://wa.me/?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank');
    showNotification('✅ WhatsApp sharing opened!', 'success');
}

// Copy Referral Code
function copyReferralCode() {
    const referralText = `Join TapEarn using my referral code: TAPEARN123 - Download now: https://tapearn.app`;
    navigator.clipboard.writeText(referralText)
        .then(() => showNotification('✅ Referral code copied!', 'success'))
        .catch(() => showNotification('❌ Failed to copy', 'warning'));
}

// Add Referral
function addReferral() {
    referrals++;
    userPoints += 50;
    addTransaction('referral', 50, 'Referral Bonus', '👥');
    updateUI();
    showNotification('🎉 +50 Points! New referral added!', 'success');
    
    // Refresh the referral section to update the UI
    showReferralSystem();
}

// Show Tasks
function showTasks() {
    document.getElementById('appContent').innerHTML = `
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
                
                <div class="task-item">
                    <div class="task-info">
                        <div class="task-title">Mine for 1 hour</div>
                        <div class="task-reward">+50 pts</div>
                    </div>
                    <button onclick="completeTask('mining')" class="task-btn">Complete</button>
                </div>
                
                <div class="task-item">
                    <div class="task-info">
                        <div class="task-title">Follow 2 accounts</div>
                        <div class="task-reward">+40 pts</div>
                    </div>
                    <button onclick="completeTask('follow')" class="task-btn">Complete</button>
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
        case 'mining':
            points = 50;
            description = 'Daily Task: Mining';
            icon = '⛏️';
            break;
        case 'follow':
            points = 40;
            description = 'Daily Task: Follow Accounts';
            icon = '👤';
            break;
    }
    
    userPoints += points;
    addTransaction('task', points, description, icon);
    updateUI();
    showNotification(`✅ +${points} Points! Task completed!`, 'success');
}

// Show Skills
function showSkills() {
    document.getElementById('appContent').innerHTML = `
        <div class="skills-section">
            <div class="section-header">
                <button onclick="showDashboard()" class="back-btn">← Back</button>
                <h3>⚡ Skills</h3>
            </div>
            
            <div class="skills-list">
                <div class="skill-item">
                    <div class="skill-info">
                        <div class="skill-title">Mining Speed</div>
                        <div class="skill-cost">100 pts</div>
                    </div>
                    <button onclick="upgradeSkill('mining')" class="skill-btn">Upgrade</button>
                </div>
                
                <div class="skill-item">
                    <div class="skill-info">
                        <div class="skill-title">Video Rewards</div>
                        <div class="skill-cost">100 pts</div>
                    </div>
                    <button onclick="upgradeSkill('video')" class="skill-btn">Upgrade</button>
                </div>
                
                <div class="skill-item">
                    <div class="skill-info">
                        <div class="skill-title">Referral Bonus</div>
                        <div class="skill-cost">200 pts</div>
                    </div>
                    <button onclick="upgradeSkill('referral')" class="skill-btn">Upgrade</button>
                </div>
            </div>
        </div>
    `;
}

// Upgrade Skill
function upgradeSkill(skill) {
    if (userPoints >= 100) {
        userPoints -= 100;
        addTransaction('upgrade', -100, 'Skill Upgrade: ' + skill, '⚡');
        updateUI();
        showNotification('⚡ Skill upgraded! Earning rate increased!', 'success');
    } else {
        showNotification('❌ Not enough points! Need 100 points.', 'warning');
    }
}

// Show Cashier
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
                    <button onclick="redeemReward('amazon')" class="reward-btn">Redeem</button>
                </div>
                
                <div class="reward-item">
                    <div class="reward-info">
                        <div class="reward-title">PayPal Cash</div>
                        <div class="reward-cost">5000 pts</div>
                    </div>
                    <button onclick="redeemReward('paypal')" class="reward-btn">Redeem</button>
                </div>
                
                <div class="reward-item">
                    <div class="reward-info">
                        <div class="reward-title">Google Play Card</div>
                        <div class="reward-cost">2000 pts</div>
                    </div>
                    <button onclick="redeemReward('google')" class="reward-btn">Redeem</button>
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
        case 'google': cost = 2000; break;
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

// Show Dashboard
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
