// YouTube API Configuration
const YOUTUBE_API_KEY = 'AIzaSyBATxf5D7ZDeiQ61dbEdzEd4Tq72N713Y8';

// App State Management
let isMining = false;
let miningSeconds = 0;
let miningInterval;
let userPoints = parseInt(localStorage.getItem('userPoints')) || 1000;
let watchedVideos = parseInt(localStorage.getItem('watchedVideos')) || 0;
let referrals = parseInt(localStorage.getItem('referrals')) || 0;

// YouTube Video State
let currentVideoId = null;
let currentPoints = 0;
let currentTitle = '';
let videoTrackingInterval = null;
let watchedVideoIds = JSON.parse(localStorage.getItem('watchedVideos')) || [];

// Transaction History
let transactions = JSON.parse(localStorage.getItem('transactions')) || [];

// Referral System
let referralData = JSON.parse(localStorage.getItem('referralData')) || {
    referralCode: generateReferralCode(),
    referredUsers: [],
    totalEarnings: 0,
    referralCount: 0
};

// Initialize App
document.addEventListener('DOMContentLoaded', function() {
    updateUI();
    loadTransactionHistory();
    console.log('🎯 TapEarn App Initialized with Transaction System');
});

// Generate Referral Code
function generateReferralCode() {
    return 'REF' + Math.random().toString(36).substr(2, 6).toUpperCase();
}

// Update UI
function updateUI() {
    document.getElementById('walletPoints').textContent = formatNumber(userPoints);
    document.getElementById('totalPoints').textContent = formatNumber(userPoints);
    document.getElementById('videosWatched').textContent = watchedVideos;
    document.getElementById('totalReferrals').textContent = referrals;
    
    // Save to localStorage
    localStorage.setItem('userPoints', userPoints);
    localStorage.setItem('watchedVideos', watchedVideos);
    localStorage.setItem('referrals', referrals);
    
    // Update mining time display
    updateMiningTimeDisplay();
}

// Format numbers with commas
function formatNumber(num) {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

// Update Mining Time Display
function updateMiningTimeDisplay() {
    const hours = Math.floor(miningSeconds / 3600);
    const minutes = Math.floor((miningSeconds % 3600) / 60);
    const seconds = miningSeconds % 60;
    document.getElementById('miningTime').textContent = 
        `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
}

// Add Transaction to History
function addTransaction(type, amount, description, details = '') {
    const transaction = {
        id: Date.now(),
        type: type,
        amount: amount,
        description: description,
        details: details,
        timestamp: new Date().toLocaleString('en-IN'),
        date: new Date().toLocaleDateString('en-IN'),
        time: new Date().toLocaleTimeString('en-IN')
    };
    
    transactions.unshift(transaction);
    localStorage.setItem('transactions', JSON.stringify(transactions));
    
    // Update transaction display if open
    if (document.getElementById('transactionHistory')) {
        loadTransactionHistory();
    }
}

// Load Transaction History
function loadTransactionHistory() {
    const container = document.getElementById('transactionHistory');
    if (!container) return;
    
    if (transactions.length === 0) {
        container.innerHTML = `
            <div class="no-transactions">
                <div style="text-align: center; padding: 40px 20px;">
                    <div style="font-size: 48px; margin-bottom: 15px;">📝</div>
                    <h4>No Transactions Yet</h4>
                    <p style="opacity: 0.7;">Start earning points to see your transaction history!</p>
                </div>
            </div>
        `;
        return;
    }
    
    let html = '';
    transactions.forEach(transaction => {
        const sign = transaction.amount >= 0 ? '+' : '';
        const amountClass = transaction.amount >= 0 ? 'transaction-credit' : 'transaction-debit';
        const icon = getTransactionIcon(transaction.type);
        
        html += `
            <div class="transaction-item">
                <div class="transaction-icon">${icon}</div>
                <div class="transaction-details">
                    <div class="transaction-title">${transaction.description}</div>
                    <div class="transaction-meta">
                        <span class="transaction-date">${transaction.timestamp}</span>
                        ${transaction.details ? `<span class="transaction-info">• ${transaction.details}</span>` : ''}
                    </div>
                </div>
                <div class="transaction-amount ${amountClass}">
                    ${sign}${transaction.amount}
                </div>
            </div>
        `;
    });
    
    container.innerHTML = html;
}

// Get Transaction Icon
function getTransactionIcon(type) {
    const icons = {
        'video': '🎬',
        'mining': '⛏️',
        'referral': '👥',
        'task': '📋',
        'boost': '🚀',
        'reward': '🎁',
        'withdrawal': '💰'
    };
    return icons[type] || '💳';
}

// Toggle Mining
function toggleMining() {
    if (isMining) {
        stopMining();
    } else {
        startMining();
    }
}

// Start Mining - FIXED TIMER
function startMining() {
    if (isMining) return;
    
    isMining = true;
    const miningCard = document.querySelector('.main-feature-card');
    miningCard.classList.add('mining-active');
    document.getElementById('miningStatusText').textContent = 'Mining Active - 5 pts/min';
    document.getElementById('miningStatusText').style.color = '#FFD700';
    document.getElementById('miningRate').textContent = '300/hr';
    
    // Start mining interval
    miningInterval = setInterval(() => {
        miningSeconds++;
        updateMiningTimeDisplay();
        
        // Add 5 points every minute - FIXED
        if (miningSeconds % 60 === 0) {
            userPoints += 5;
            addTransaction('mining', 5, 'Mining Rewards', '5 points per minute');
            updateUI();
            showNotification('⛏️ +5 Points from Mining!', 'success');
        }
        
        // Add bonus every hour
        if (miningSeconds % 3600 === 0) {
            userPoints += 50;
            addTransaction('mining', 50, 'Mining Bonus', '1 hour complete');
            updateUI();
            showNotification('🎉 +50 Bonus Points! 1 Hour Complete!', 'success');
        }
    }, 1000);
    
    addTransaction('mining', 0, 'Mining Started', 'Earning 5 points per minute');
    showNotification('⛏️ Mining Started! Earning 5 points per minute...', 'success');
}

// Stop Mining
function stopMining() {
    if (!isMining) return;
    
    isMining = false;
    clearInterval(miningInterval);
    const miningCard = document.querySelector('.main-feature-card');
    miningCard.classList.remove('mining-active');
    document.getElementById('miningStatusText').textContent = 'Click to start mining';
    document.getElementById('miningStatusText').style.color = '';
    
    addTransaction('mining', 0, 'Mining Stopped', `Mined for ${Math.floor(miningSeconds/60)} minutes`);
    showNotification('⏹️ Mining Stopped. Points saved!', 'info');
}

// Claim Boost
function claimBoost() {
    userPoints += 100;
    addTransaction('boost', 100, 'Boost Claimed', 'Daily bonus');
    updateUI();
    showNotification('🚀 +100 Points! Boost claimed successfully!', 'success');
}

// Show Video Section with YouTube Search
function showVideoSection() {
    document.getElementById('appContent').innerHTML = `
        <div class="video-section">
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
        
        if (!response.ok) throw new Error(`YouTube API error: ${response.status}`);
        
        const data = await response.json();
        if (!data.items || data.items.length === 0) throw new Error('No videos found');
        
        return data.items;
    } catch (error) {
        throw error;
    }
}

// Display YouTube Videos
function displayYouTubeVideos(videos, query) {
    const container = document.getElementById('videoResultsContainer');
    
    let html = `
        <div style="margin-bottom: 15px; text-align: center;">
            <h3>🎥 YouTube Shorts</h3>
            <p style="font-size: 12px; opacity: 0.8;">Found ${videos.length} videos for "${query}"</p>
        </div>
        <div class="videos-grid">
    `;
    
    videos.forEach((video, index) => {
        const videoId = video.id.videoId;
        const thumbnail = video.snippet.thumbnails.medium?.url || video.snippet.thumbnails.default.url;
        const title = video.snippet.title;
        const channel = video.snippet.channelTitle;
        const points = calculatePoints(title, index);
        const isWatched = watchedVideoIds.includes(videoId);
        
        html += `
            <div class="video-card" onclick="selectVideoForEarning('${videoId}', ${points}, '${title.replace(/'/g, "\\'")}', '${channel.replace(/'/g, "\\'")}')">
                <div class="thumbnail">
                    <img src="${thumbnail}" alt="${title}" onerror="this.src='https://via.placeholder.com/300/667eea/ffffff?text=YouTube+Short'">
                    <div class="points-badge">+${points} pts</div>
                    <div class="youtube-badge">YouTube</div>
                    ${isWatched ? '<div class="watched-badge">✅ WATCHED</div>' : ''}
                </div>
                <div class="video-details">
                    <h4 class="video-title">${title}</h4>
                    <div class="video-meta">
                        <span class="channel">${channel}</span>
                        ${isWatched ? 
                            '<span class="watch-now">✅ Earned</span>' : 
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
function calculatePoints(title, index) {
    const basePoints = 10;
    const bonus = Math.floor(Math.random() * 6);
    return basePoints + bonus;
}

// Select Video for Earning - FIXED POINTS SYSTEM
function selectVideoForEarning(videoId, points, title, channel) {
    if (watchedVideoIds.includes(videoId)) {
        showNotification('❌ You have already earned points for this video!', 'warning');
        return;
    }
    
    currentVideoId = videoId;
    currentPoints = points;
    currentTitle = title;
    
    document.getElementById('appContent').innerHTML = `
        <div class="video-player-interface">
            <div class="player-header">
                <button onclick="showVideoSection()" class="back-btn">← Back to Search</button>
                <h3>🎯 Earn ${points} Points</h3>
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
                <p style="font-size: 12px;">Don't close this page - points awarded automatically</p>
            </div>
            
            <div class="tracking-section">
                <div class="tracking-status">
                    <div class="status-indicator" id="statusIndicator"></div>
                    <div class="status-text" id="statusText">🎯 Ready to earn ${points} points</div>
                </div>
                
                <div class="progress-container">
                    <div class="progress-bar">
                        <div class="progress-fill" id="progressFill"></div>
                    </div>
                    <div class="progress-text" id="progressText">Waiting for video completion...</div>
                </div>
                
                <div class="tracking-controls">
                    <button onclick="cancelVideoEarning()" class="cancel-btn">❌ Cancel Earning</button>
                </div>
            </div>
            
            <div class="instructions-panel">
                <h4>📱 Important Instructions:</h4>
                <div class="instruction-list">
                    <div class="instruction">✅ Video is playing on this page</div>
                    <div class="instruction">✅ Watch the video for complete 1 minute</div>
                    <div class="instruction">❌ Don't close or minimize this page</div>
                    <div class="instruction">❌ Don't refresh or go back</div>
                    <div class="instruction">💰 Points automatically after 1 minute</div>
                </div>
                
                <div class="warning-note">
                    <strong>⚠️ Warning:</strong> If you leave this page, you won't get points!
                </div>
            </div>
        </div>
    `;
    
    startVideoTracking();
}

// Start Video Tracking - FIXED
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

// Complete Video Earning - FIXED POINTS ADDITION
function completeVideoEarning() {
    // Add to watched videos
    if (currentVideoId && !watchedVideoIds.includes(currentVideoId)) {
        watchedVideoIds.push(currentVideoId);
        localStorage.setItem('watchedVideos', JSON.stringify(watchedVideoIds));
    }
    
    // Add points and transaction
    userPoints += currentPoints;
    watchedVideos++;
    
    // Add transaction
    addTransaction('video', currentPoints, 'Video Watched', currentTitle);
    
    updateUI();
    showEarningSuccess();
}

// Show Earning Success
function showEarningSuccess() {
    document.getElementById('appContent').innerHTML = `
        <div class="earning-success">
            <div class="success-icon">🎉</div>
            <h3>Points Earned Successfully!</h3>
            <div class="points-earned-large">+${currentPoints} Points</div>
            
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
                <div class="detail-item">
                    <span class="detail-label">Watch Time:</span>
                    <span class="detail-value">1 minute complete</span>
                </div>
            </div>
            
            <div class="success-actions">
                <button onclick="showVideoSection()" class="continue-btn">🔍 Watch More Videos</button>
                <button onclick="showWallet()" class="continue-btn" style="background: #667eea;">💰 Check Wallet</button>
            </div>
        </div>
    `;
    
    showNotification(`✅ +${currentPoints} Points earned for watching video!`, 'success');
}

// Cancel Video Earning
function cancelVideoEarning() {
    if (videoTrackingInterval) clearInterval(videoTrackingInterval);
    showNotification('❌ Points earning cancelled', 'warning');
    showVideoSection();
}

// Show Wallet with Transaction History
function showWallet() {
    document.getElementById('appContent').innerHTML = `
        <div class="wallet-container">
            <div class="wallet-header">
                <button onclick="showDashboard()" class="back-btn">← Back</button>
                <h3>💰 My Wallet</h3>
                <div class="wallet-balance">${formatNumber(userPoints)} Points</div>
            </div>
            
            <div class="wallet-stats">
                <div class="wallet-stat">
                    <div class="stat-value">${watchedVideos}</div>
                    <div class="stat-label">Videos Watched</div>
                </div>
                <div class="wallet-stat">
                    <div class="stat-value">${referrals}</div>
                    <div class="stat-label">Referrals</div>
                </div>
                <div class="wallet-stat">
                    <div class="stat-value">${transactions.length}</div>
                    <div class="stat-label">Transactions</div>
                </div>
            </div>
            
            <div class="transaction-section">
                <div class="section-header">
                    <h4>📝 Transaction History</h4>
                    <button onclick="clearTransactions()" class="clear-btn">Clear All</button>
                </div>
                <div class="transaction-list" id="transactionHistory">
                    <!-- Transactions will be loaded here -->
                </div>
            </div>
        </div>
    `;
    
    loadTransactionHistory();
}

// Clear Transactions
function clearTransactions() {
    if (confirm('Are you sure you want to clear all transaction history?')) {
        transactions = [];
        localStorage.setItem('transactions', JSON.stringify(transactions));
        loadTransactionHistory();
        showNotification('✅ Transaction history cleared', 'success');
    }
}

// Show Referral System - FIXED WITH PROPER LINK
function showReferralSystem() {
    const referralLink = `https://reward-browser-app.vercel.app/?ref=${referralData.referralCode}`;
    
    document.getElementById('appContent').innerHTML = `
        <div class="referral-container">
            <div class="referral-header">
                <button onclick="showDashboard()" class="back-btn">← Back</button>
                <h3>👥 Refer & Earn</h3>
                <div class="referral-badge">+50 pts each</div>
            </div>
            
            <div class="referral-stats">
                <div class="referral-stat">
                    <div class="stat-value">${referralData.referralCount}</div>
                    <div class="stat-label">Referred</div>
                </div>
                <div class="referral-stat">
                    <div class="stat-value">${referralData.totalEarnings}</div>
                    <div class="stat-label">Points Earned</div>
                </div>
                <div class="referral-stat">
                    <div class="stat-value">50</div>
                    <div class="stat-label">Per Referral</div>
                </div>
            </div>
            
            <div class="referral-code-section">
                <h4>🎯 Your Referral Code</h4>
                <div class="referral-code-display">
                    <span class="referral-code">${referralData.referralCode}</span>
                    <button onclick="copyReferralCode()" class="copy-btn">📋 Copy</button>
                </div>
            </div>
            
            <div class="referral-link-section">
                <h4>🔗 Your Referral Link</h4>
                <div class="referral-link-display">
                    <span class="referral-link">${referralLink}</span>
                    <button onclick="copyReferralLink()" class="copy-btn">📋 Copy</button>
                </div>
                <p class="referral-note">Share this link with friends to earn 50 points each!</p>
            </div>
            
            <div class="referral-share-buttons">
                <button onclick="shareOnWhatsApp()" class="share-btn whatsapp">📱 WhatsApp</button>
                <button onclick="shareOnTelegram()" class="share-btn telegram">✈️ Telegram</button>
                <button onclick="testReferral()" class="share-btn test">🧪 Test Referral</button>
            </div>
            
            <div class="referral-instructions">
                <h4>💡 How it Works:</h4>
                <div class="instruction-steps">
                    <div class="step">1. Share your referral link/code</div>
                    <div class="step">2. Friends sign up using your link</div>
                    <div class="step">3. You get 50 points for each referral</div>
                    <div class="step">4. Friends also get 25 bonus points</div>
                </div>
            </div>
        </div>
    `;
}

// Copy Referral Code
function copyReferralCode() {
    navigator.clipboard.writeText(referralData.referralCode);
    showNotification('✅ Referral code copied!', 'success');
}

// Copy Referral Link
function copyReferralLink() {
    const referralLink = `https://reward-browser-app.vercel.app/?ref=${referralData.referralCode}`;
    navigator.clipboard.writeText(referralLink);
    showNotification('✅ Referral link copied!', 'success');
}

// Share on WhatsApp
function shareOnWhatsApp() {
    const text = `Join TapEarn and earn money by watching videos! Use my referral code: ${referralData.referralCode} - https://reward-browser-app.vercel.app/?ref=${referralData.referralCode}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
}

// Share on Telegram
function shareOnTelegram() {
    const text = `Join TapEarn and earn money by watching videos! Use my referral code: ${referralData.referralCode}`;
    window.open(`https://t.me/share/url?url=${encodeURIComponent('https://reward-browser-app.vercel.app/')}&text=${encodeURIComponent(text)}`, '_blank');
}

// Test Referral
function testReferral() {
    referrals++;
    userPoints += 50;
    referralData.referralCount++;
    referralData.totalEarnings += 50;
    
    addTransaction('referral', 50, 'Referral Bonus', 'Test referral added');
    updateUI();
    localStorage.setItem('referralData', JSON.stringify(referralData));
    
    showNotification('🎉 +50 Points! Test referral added successfully!', 'success');
}

// Show Tasks
function showTasks() {
    document.getElementById('appContent').innerHTML = `
        <div class="welcome-message">
            <h3>📋 Daily Tasks</h3>
            <div style="text-align: left; margin: 15px 0;">
                <div style="display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid rgba(255,255,255,0.1);">
                    <span>Watch 5 videos</span>
                    <button onclick="completeTask('videos')" style="background: #4CAF50; color: white; border: none; padding: 5px 10px; border-radius: 5px; cursor: pointer; font-size: 12px;">+25 pts</button>
                </div>
                <div style="display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid rgba(255,255,255,0.1);">
                    <span>Refer 1 friend</span>
                    <button onclick="completeTask('referral')" style="background: #4CAF50; color: white; border: none; padding: 5px 10px; border-radius: 5px; cursor: pointer; font-size: 12px;">+50 pts</button>
                </div>
                <div style="display: flex; justify-content: space-between; padding: 10px 0;">
                    <span>Mine for 1 hour</span>
                    <button onclick="completeTask('mining')" style="background: #4CAF50; color: white; border: none; padding: 5px 10px; border-radius: 5px; cursor: pointer; font-size: 12px;">+50 pts</button>
                </div>
            </div>
        </div>
    `;
}

// Complete Task
function completeTask(task) {
    let points = 0;
    let description = '';
    
    switch(task) {
        case 'videos':
            points = 25;
            description = 'Complete 5 videos task';
            break;
        case 'referral':
            points = 50;
            description = 'Refer a friend task';
            break;
        case 'mining':
            points = 50;
            description = '1 hour mining task';
            break;
    }
    
    userPoints += points;
    addTransaction('task', points, 'Task Completed', description);
    updateUI();
    showNotification(`✅ +${points} Points! Task completed!`, 'success');
    showTasks();
}

// Show Skills
function showSkills() {
    document.getElementById('appContent').innerHTML = `
        <div class="welcome-message">
            <h3>⚡ Skills</h3>
            <p>Upgrade your mining power and earning rate!</p>
            <div style="text-align: left; margin: 15px 0;">
                <div style="display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid rgba(255,255,255,0.1);">
                    <span>Mining Speed</span>
                    <button onclick="upgradeSkill('mining')" style="background: #FFA726; color: white; border: none; padding: 5px 10px; border-radius: 5px; cursor: pointer; font-size: 12px;">Upgrade</button>
                </div>
                <div style="display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid rgba(255,255,255,0.1);">
                    <span>Video Rewards</span>
                    <button onclick="upgradeSkill('video')" style="background: #FFA726; color: white; border: none; padding: 5px 10px; border-radius: 5px; cursor: pointer; font-size: 12px;">Upgrade</button>
                </div>
            </div>
        </div>
    `;
}

// Upgrade Skill
function upgradeSkill(skill) {
    if (userPoints >= 100) {
        userPoints -= 100;
        addTransaction('reward', -100, 'Skill Upgrade', `${skill} skill upgraded`);
        updateUI();
        showNotification('⚡ Skill upgraded! Earning rate increased!', 'success');
    } else {
        showNotification('❌ Not enough points! Need 100 points.', 'warning');
    }
}

// Show Account
function showAccount() {
    document.getElementById('appContent').innerHTML = `
        <div class="welcome-message">
            <h3>👤 Account</h3>
            <div style="text-align: left; margin: 15px 0;">
                <div style="padding: 10px 0; border-bottom: 1px solid rgba(255,255,255,0.1);">
                    <div style="font-size: 12px; opacity: 0.8;">Username</div>
                    <div style="font-weight: bold;">TapEarn User</div>
                </div>
                <div style="padding: 10px 0; border-bottom: 1px solid rgba(255,255,255,0.1);">
                    <div style="font-size: 12px; opacity: 0.8;">Level</div>
                    <div style="font-weight: bold; color: #CD7F32;">Bronze</div>
                </div>
                <div style="padding: 10px 0;">
                    <div style="font-size: 12px; opacity: 0.8;">Member Since</div>
                    <div style="font-weight: bold;">2024</div>
                </div>
            </div>
        </div>
    `;
}

// Show Cashier
function showCashier() {
    document.getElementById('appContent').innerHTML = `
        <div class="welcome-message">
            <h3>💰 Cashier</h3>
            <p>Redeem your points for rewards!</p>
            <div style="text-align: left; margin: 15px 0;">
                <div style="display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid rgba(255,255,255,0.1);">
                    <span>Amazon Gift Card</span>
                    <button onclick="redeemReward('amazon')" style="background: #FFA726; color: white; border: none; padding: 5px 10px; border-radius: 5px; cursor: pointer; font-size: 12px;">1000 pts</button>
                </div>
                <div style="display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid rgba(255,255,255,0.1);">
                    <span>PayPal Cash</span>
                    <button onclick="redeemReward('paypal')" style="background: #FFA726; color: white; border: none; padding: 5px 10px; border-radius: 5px; cursor: pointer; font-size: 12px;">5000 pts</button>
                </div>
            </div>
        </div>
    `;
}

// Redeem Reward
function redeemReward(reward) {
    let cost = reward === 'amazon' ? 1000 : 5000;
    if (userPoints >= cost) {
        userPoints -= cost;
        addTransaction('withdrawal', -cost, 'Reward Redeemed', `${reward.toUpperCase()} gift card`);
        updateUI();
        showNotification(`🎉 ${reward.toUpperCase()} gift card redeemed successfully!`, 'success');
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
        if (notification.parentElement) notification.remove();
    }, 4000);
}

// Check for referral code on page load
function checkReferralCode() {
    const urlParams = new URLSearchParams(window.location.search);
    const refCode = urlParams.get('ref');
    
    if (refCode && refCode !== referralData.referralCode) {
        userPoints += 25;
        addTransaction('referral', 25, 'Welcome Bonus', `Used referral: ${refCode}`);
        updateUI();
        showNotification(`🎉 Welcome! You used referral code: ${refCode}. You get 25 bonus points!`, 'success');
    }
}

// Initialize referral check
checkReferralCode();
