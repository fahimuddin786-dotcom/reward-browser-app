// YouTube API Configuration
const YOUTUBE_API_KEY = 'AIzaSyBATxf5D7ZDeiQ61dbEdzEd4Tq72N713Y8';

// App State Management
let isMining = false;
let miningSeconds = 0;
let miningInterval;
let userPoints = 1010;
let watchedVideos = 24;
let referrals = 3;

// YouTube Video State
let currentVideoId = null;
let currentPoints = 0;
let currentTitle = '';
let videoTrackingInterval = null;
let watchedVideoIds = JSON.parse(localStorage.getItem('watchedVideos')) || [];

// Initialize App
document.addEventListener('DOMContentLoaded', function() {
    updateUI();
    console.log('🎯 TapEarn App Initialized with YouTube Videos');
});

// Update UI
function updateUI() {
    document.getElementById('walletPoints').textContent = formatNumber(userPoints);
    document.getElementById('totalPoints').textContent = formatNumber(userPoints);
    document.getElementById('videosWatched').textContent = watchedVideos;
    document.getElementById('totalReferrals').textContent = referrals;
    
    // Update mining time display
    const hours = Math.floor(miningSeconds / 3600);
    const minutes = Math.floor((miningSeconds % 3600) / 60);
    const seconds = miningSeconds % 60;
    document.getElementById('miningTime').textContent = 
        `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
}

// Format numbers with commas
function formatNumber(num) {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
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
    
    miningInterval = setInterval(() => {
        miningSeconds++;
        
        // Add 5 points every minute
        if (miningSeconds % 60 === 0) {
            userPoints += 5;
            updateUI();
            showNotification('⛏️ +5 Points from Mining!', 'success');
        }
        
        // Add bonus every hour
        if (miningSeconds % 3600 === 0) {
            userPoints += 50;
            updateUI();
            showNotification('🎉 +50 Bonus Points! 1 Hour Complete!', 'success');
        }
        
        updateUI();
    }, 1000);
    
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
    
    showNotification('⏹️ Mining Stopped. Points saved!', 'info');
}

// Claim Boost
function claimBoost() {
    userPoints += 100;
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
        container.innerHTML = `
            <div class="welcome-message">
                <h3>❌ YouTube Search Failed</h3>
                <p>Using demo videos instead...</p>
                <button onclick="showDemoVideos()" style="background: #4CAF50; color: white; border: none; padding: 10px 15px; border-radius: 8px; cursor: pointer; margin-top: 10px;">
                    Show Demo Videos
                </button>
            </div>
        `;
    }
}

// Search Real YouTube Videos
async function searchRealYouTubeVideos(query) {
    try {
        console.log('🔍 Searching YouTube for:', query);
        
        const response = await fetch(
            `https://www.googleapis.com/youtube/v3/search?part=snippet&type=video&videoDuration=short&q=${encodeURIComponent(query)}&maxResults=8&key=${YOUTUBE_API_KEY}`
        );
        
        if (!response.ok) {
            throw new Error(`YouTube API error: ${response.status}`);
        }
        
        const data = await response.json();
        console.log('✅ YouTube API Success:', data.items?.length, 'videos found');
        
        if (!data.items || data.items.length === 0) {
            throw new Error('No videos found');
        }
        
        return data.items;
    } catch (error) {
        console.error('❌ YouTube API Error:', error.message);
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
                    medium: { url: 'https://via.placeholder.com/300/FF6B6B/FFFFFF?text=Music+Short' },
                    default: { url: 'https://via.placeholder.com/300/FF6B6B/FFFFFF?text=Music+Short' }
                },
                channelTitle: 'Music Channel'
            }
        },
        {
            id: { videoId: 'demo2' },
            snippet: {
                title: '😂 Funny Comedy Skit',
                thumbnails: { 
                    medium: { url: 'https://via.placeholder.com/300/4ECDC4/FFFFFF?text=Comedy+Short' },
                    default: { url: 'https://via.placeholder.com/300/4ECDC4/FFFFFF?text=Comedy+Short' }
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

// Select Video for Earning
function selectVideoForEarning(videoId, points, title, channel) {
    // Check if video already watched
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
                <p style="font-size: 12px;">Don't close this page - points awarded automatically</p>
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
    
    // Start video tracking
    startVideoTracking();
}

// Start Video Tracking
function startVideoTracking() {
    let trackingTime = 0;
    const maxTrackingTime = 60; // 1 minute required
    
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
    // Add to watched videos list
    if (currentVideoId && !watchedVideoIds.includes(currentVideoId)) {
        watchedVideoIds.push(currentVideoId);
        localStorage.setItem('watchedVideos', JSON.stringify(watchedVideoIds));
    }
    
    // Add points
    userPoints += currentPoints;
    watchedVideos++;
    updateUI();
    
    // Show success message
    showEarningSuccess();
}

// Show Earning Success
function showEarningSuccess() {
    document.getElementById('appContent').innerHTML = `
        <div class="earning-success">
            <div class="success-icon">🎉</div>
            
            <h3>Points Earned Successfully!</h3>
            
            <div class="points-earned-large">
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
                <div class="detail-item">
                    <span class="detail-label">Watch Time:</span>
                    <span class="detail-value">1 minute complete</span>
                </div>
            </div>
            
            <div class="success-actions">
                <button onclick="showVideoSection()" class="continue-btn">
                    🔍 Watch More Videos
                </button>
                <button onclick="showDashboard()" class="continue-btn" style="background: #667eea;">
                    🏠 Back to Dashboard
                </button>
            </div>
        </div>
    `;
    
    showNotification(`✅ +${currentPoints} Points earned for 1 minute watch!`, 'success');
}

// Cancel Video Earning
function cancelVideoEarning() {
    if (videoTrackingInterval) {
        clearInterval(videoTrackingInterval);
    }
    showNotification('❌ Points earning cancelled - no points added', 'warning');
    showVideoSection();
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
    switch(task) {
        case 'videos':
            points = 25;
            break;
        case 'referral':
            points = 50;
            break;
        case 'mining':
            points = 50;
            break;
    }
    
    userPoints += points;
    updateUI();
    showNotification(`✅ +${points} Points! Task completed!`, 'success');
    showTasks();
}

// Show Referral System
function showReferralSystem() {
    document.getElementById('appContent').innerHTML = `
        <div class="welcome-message">
            <h3>👥 Refer & Earn</h3>
            <div style="margin: 15px 0;">
                <div style="background: rgba(255,255,255,0.1); padding: 15px; border-radius: 10px; margin-bottom: 15px;">
                    <div style="font-size: 14px; opacity: 0.8; margin-bottom: 5px;">Your Referral Code</div>
                    <div style="font-size: 24px; font-weight: bold; color: #FFD700; letter-spacing: 2px;">TAPEARN123</div>
                </div>
                <button onclick="copyReferralCode()" style="background: #2196F3; color: white; border: none; padding: 12px 20px; border-radius: 10px; cursor: pointer; width: 100%; margin-bottom: 10px;">
                    📋 Copy Code
                </button>
                <button onclick="addReferral()" style="background: #4CAF50; color: white; border: none; padding: 12px 20px; border-radius: 10px; cursor: pointer; width: 100%;">
                    👥 + Add Referral
                </button>
            </div>
        </div>
    `;
}

// Add Referral
function addReferral() {
    referrals++;
    userPoints += 50;
    updateUI();
    showNotification('🎉 +50 Points! New referral added!', 'success');
    showDashboard();
}

// Copy Referral Code
function copyReferralCode() {
    navigator.clipboard.writeText('TAPEARN123');
    showNotification('✅ Referral code copied!', 'success');
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
        updateUI();
        showNotification(`🎉 Reward redeemed successfully! ${reward.toUpperCase()} gift card sent!`, 'success');
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
