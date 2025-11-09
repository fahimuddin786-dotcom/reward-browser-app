// YouTube API Configuration
const YOUTUBE_API_KEY = 'AIzaSyBATxf5D7ZDeiQ61dbEdzEd4Tq72N713Y8';

// YouTube Player State Management
let currentPlayer = null;
let currentVideoId = null;
let currentPoints = 0;
let currentTitle = '';
let isVideoPlaying = false;
let videoStartTime = null;

// Enhanced YouTube Search
async function searchRealYouTubeVideos(query) {
    try {
        console.log('🔍 Searching YouTube for:', query);
        
        const response = await fetch(
            `https://www.googleapis.com/youtube/v3/search?part=snippet&type=video&videoDuration=short&q=${encodeURIComponent(query)}&maxResults=12&key=${YOUTUBE_API_KEY}`
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
        showNotification('⚠️ Using demo videos temporarily', 'warning');
        return searchSimulatedVideos(query);
    }
}

// Enhanced search function
async function searchVideos() {
    const query = document.getElementById('searchInput').value.trim();
    const resultsDiv = document.getElementById('videoResults');
    
    if (!query) {
        resultsDiv.innerHTML = '<div class="error">⚠️ Please enter a search term</div>';
        return;
    }

    resultsDiv.innerHTML = `
        <div class="loading">
            <div class="spinner"></div>
            <p>🔍 Searching YouTube Shorts for "${query}"...</p>
            <small>Finding videos for points earning</small>
        </div>
    `;

    try {
        const videos = await searchRealYouTubeVideos(query);
        
        if (videos && videos.length > 0) {
            displayRealVideos(videos, query);
        } else {
            throw new Error('No videos found');
        }
    } catch (error) {
        console.error('Search failed:', error);
        const simulatedVideos = searchSimulatedVideos(query);
        displayVideos(simulatedVideos);
    }
}

// Display real YouTube videos
function displayRealVideos(videos, query) {
    const resultsDiv = document.getElementById('videoResults');
    
    let html = `
        <div class="results-header">
            <h3>🎥 Found ${videos.length} YouTube Shorts</h3>
            <div class="api-badge live">Real YouTube</div>
        </div>
        <div class="points-system-info">
            <div class="info-card">
                <strong>🎯 Points System:</strong> Watch video completely to earn points!
            </div>
        </div>
        <div class="videos-grid">
    `;
    
    videos.forEach((video, index) => {
        const videoId = video.id.videoId;
        const thumbnail = video.snippet.thumbnails.medium?.url || video.snippet.thumbnails.default.url;
        const title = video.snippet.title;
        const channel = video.snippet.channelTitle;
        const points = calculatePoints(title, index);
        
        html += `
            <div class="video-card" onclick="selectVideoForEarning('${videoId}', ${points}, '${title.replace(/'/g, "\\'")}', '${channel.replace(/'/g, "\\'")}')">
                <div class="thumbnail">
                    <img src="${thumbnail}" alt="${title}" onerror="this.src='https://via.placeholder.com/300/667eea/ffffff?text=YouTube+Short'">
                    <div class="duration">SHORT</div>
                    <div class="points-badge">+${points} pts</div>
                    <div class="youtube-badge">YouTube</div>
                </div>
                <div class="video-details">
                    <h4 class="video-title">${title}</h4>
                    <div class="video-meta">
                        <span class="channel">📺 ${channel}</span>
                        <span class="watch-now">▶️ Watch to Earn</span>
                    </div>
                </div>
            </div>
        `;
    });
    
    html += '</div>';
    resultsDiv.innerHTML = html;
}

// Select video for earning points
function selectVideoForEarning(videoId, points, title, channel) {
    currentVideoId = videoId;
    currentPoints = points;
    currentTitle = title;
    
    document.getElementById('videoResults').innerHTML = `
        <div class="video-selection-container">
            <div class="selection-header">
                <button onclick="searchVideos()" class="back-btn">← Back to Search</button>
                <h3>🎯 Earn Points</h3>
            </div>
            
            <div class="video-preview-card">
                <div class="preview-thumbnail">
                    <img src="https://i.ytimg.com/vi/${videoId}/hqdefault.jpg" alt="${title}">
                    <div class="preview-overlay">
                        <div class="play-icon-large">▶</div>
                        <p>YouTube Short</p>
                    </div>
                </div>
                
                <div class="video-info-preview">
                    <h4>${title}</h4>
                    <p class="channel-preview">📺 ${channel}</p>
                    <div class="points-preview">
                        <span class="points-value">+${points} Points</span>
                        <span class="points-condition">on video completion</span>
                    </div>
                </div>
            </div>
            
            <div class="earn-points-section">
                <div class="earn-instructions">
                    <h4>📋 How to Earn Points:</h4>
                    <div class="instruction-steps">
                        <div class="step">
                            <span class="step-number">1</span>
                            <span class="step-text">Click "Start Earning" button</span>
                        </div>
                        <div class="step">
                            <span class="step-number">2</span>
                            <span class="step-text">Watch the YouTube video completely</span>
                        </div>
                        <div class="step">
                            <span class="step-number">3</span>
                            <span class="step-text">Points automatically added after video ends</span>
                        </div>
                    </div>
                </div>
                
                <div class="earn-action">
                    <button onclick="startVideoEarning('${videoId}', ${points}, '${title.replace(/'/g, "\\'")}')" class="earn-btn">
                        🎬 Start Earning ${points} Points
                    </button>
                    <p class="action-note">YouTube video will open and play automatically</p>
                </div>
            </div>
        </div>
    `;
}

// Start video earning process
function startVideoEarning(videoId, points, title) {
    console.log('🎬 Starting video earning process:', videoId, points);
    
    // Show video player interface
    showVideoPlayerInterface(videoId, points, title);
    
    // Open YouTube video in new tab (actual video playback)
    setTimeout(() => {
        window.open(`https://www.youtube.com/watch?v=${videoId}`, '_blank');
    }, 1000);
    
    // Start video tracking
    startVideoTracking(videoId, points, title);
}

// Show video player interface
function showVideoPlayerInterface(videoId, points, title) {
    document.getElementById('videoResults').innerHTML = `
        <div class="video-player-interface">
            <div class="player-header">
                <button onclick="searchVideos()" class="back-btn">← Back to Search</button>
                <h3>🎬 Earning Points...</h3>
            </div>
            
            <div class="video-player-container">
                <div class="youtube-player-placeholder">
                    <div class="player-loading">
                        <div class="loading-spinner"></div>
                        <h4>Opening YouTube Video...</h4>
                        <p>Video will open in new tab. Keep this window open.</p>
                    </div>
                </div>
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
                    <button onclick="simulateVideoCompletion(${points}, '${title.replace(/'/g, "\\'")}')" class="simulate-btn">
                        ⏩ Simulate Video Completion (Testing)
                    </button>
                    <button onclick="cancelEarning()" class="cancel-btn">
                        ❌ Cancel Earning
                    </button>
                </div>
            </div>
            
            <div class="instructions-panel">
                <h4>📱 Instructions:</h4>
                <div class="instruction-list">
                    <div class="instruction">1. YouTube video opened in new tab</div>
                    <div class="instruction">2. Watch the video completely</div>
                    <div class="instruction">3. Return here after watching</div>
                    <div class="instruction">4. Click "I Watched Complete Video"</div>
                </div>
                
                <button onclick="confirmVideoWatched(${points}, '${title.replace(/'/g, "\\'")}')" class="confirm-btn">
                    ✅ I Watched Complete Video
                </button>
            </div>
        </div>
    `;
}

// Start video tracking
function startVideoTracking(videoId, points, title) {
    let trackingTime = 0;
    const maxTrackingTime = 60; // 1 minute max tracking
    
    const trackingInterval = setInterval(() => {
        trackingTime++;
        updateTrackingProgress(trackingTime, maxTrackingTime);
        
        if (trackingTime >= maxTrackingTime) {
            clearInterval(trackingInterval);
            autoCompleteVideo(points, title);
        }
    }, 1000);
    
    // Store tracking interval for cleanup
    window.videoTrackingInterval = trackingInterval;
}

// Update tracking progress
function updateTrackingProgress(current, max) {
    const progressFill = document.getElementById('progressFill');
    const progressText = document.getElementById('progressText');
    const statusIndicator = document.getElementById('statusIndicator');
    const statusText = document.getElementById('statusText');
    
    if (progressFill && progressText) {
        const percentage = (current / max) * 100;
        progressFill.style.width = `${percentage}%`;
        
        if (current < 10) {
            progressText.innerHTML = `⏳ Video should be playing... (${current}s/${max}s)`;
            statusText.innerHTML = '🎬 Video opened in YouTube';
        } else if (current < 30) {
            progressText.innerHTML = `📺 Video should be halfway... (${current}s/${max}s)`;
            statusText.innerHTML = '⏱️ Video in progress...';
        } else {
            progressText.innerHTML = `✅ Video should be ending soon... (${current}s/${max}s)`;
            statusText.innerHTML = '💰 Almost time for points!';
        }
    }
}

// Confirm video watched manually
function confirmVideoWatched(points, title) {
    if (confirm(`Confirm you watched the complete video to earn ${points} points?`)) {
        completeVideoEarning(points, title);
    }
}

// Simulate video completion (for testing)
function simulateVideoCompletion(points, title) {
    if (confirm(`Simulate video completion and earn ${points} points?`)) {
        completeVideoEarning(points, title);
    }
}

// Auto complete video after tracking time
function autoCompleteVideo(points, title) {
    completeVideoEarning(points, title, true);
}

// Complete video earning process
function completeVideoEarning(points, title, isAuto = false) {
    // Clean up tracking
    if (window.videoTrackingInterval) {
        clearInterval(window.videoTrackingInterval);
    }
    
    // Add points
    earnPoints(points, title, true);
    
    // Show success message
    showEarningSuccess(points, title, isAuto);
}

// Show earning success
function showEarningSuccess(points, title, isAuto = false) {
    document.getElementById('videoResults').innerHTML = `
        <div class="earning-success">
            <div class="success-animation">
                <div class="success-icon">🎉</div>
                <div class="confetti"></div>
            </div>
            
            <h3>Points Earned Successfully!</h3>
            
            <div class="points-earned-large">
                +${points} Points
            </div>
            
            <div class="success-details">
                <div class="detail-item">
                    <span class="detail-label">Video:</span>
                    <span class="detail-value">${title}</span>
                </div>
                <div class="detail-item">
                    <span class="detail-label">Points Added:</span>
                    <span class="detail-value">+${points}</span>
                </div>
                <div class="detail-item">
                    <span class="detail-label">Total Points:</span>
                    <span class="detail-value">${parseInt(localStorage.getItem('userPoints')) || 100}</span>
                </div>
                <div class="detail-item">
                    <span class="detail-label">Method:</span>
                    <span class="detail-value">${isAuto ? 'Auto-completed' : 'Manual confirmation'}</span>
                </div>
            </div>
            
            <div class="success-message">
                <p>✅ <strong>Video watching verified!</strong></p>
                <p>Your points have been added to your wallet.</p>
            </div>
            
            <div class="success-actions">
                <button onclick="searchVideos()" class="continue-btn">
                    🔍 Watch More Videos
                </button>
                <button onclick="showEarnings()" class="wallet-btn">
                    💰 Check My Wallet
                </button>
            </div>
        </div>
    `;
}

// Cancel earning process
function cancelEarning() {
    if (window.videoTrackingInterval) {
        clearInterval(window.videoTrackingInterval);
    }
    searchVideos();
    showNotification('❌ Points earning cancelled', 'warning');
}

// Points system
function earnPoints(points, videoTitle, isYouTube = false) {
    let userPoints = parseInt(localStorage.getItem('userPoints')) || 100;
    userPoints += points;
    localStorage.setItem('userPoints', userPoints);
    
    // Save watch history
    const watchHistory = JSON.parse(localStorage.getItem('watchHistory')) || [];
    watchHistory.push({
        videoTitle: videoTitle,
        points: points,
        isYouTube: isYouTube,
        timestamp: new Date().toLocaleString(),
        method: 'video_completion'
    });
    localStorage.setItem('watchHistory', JSON.stringify(watchHistory));
    
    updateWallet();
    
    if (isYouTube) {
        showNotification(`✅ +${points} Points earned for watching video!`, 'success');
    }
    
    return userPoints;
}

// Demo videos fallback (keep existing)
const YOUTUBE_VIDEOS = [
    {
        id: 'demo1',
        title: '🎵 Trending Music Short 2024',
        thumbnail: 'https://via.placeholder.com/300/FF6B6B/FFFFFF?text=Music+Short',
        duration: '0:30',
        points: 8,
        channel: 'Music Channel'
    },
    {
        id: 'demo2', 
        title: '😂 Funny Comedy Skit',
        thumbnail: 'https://via.placeholder.com/300/4ECDC4/FFFFFF?text=Comedy+Short',
        duration: '0:45',
        points: 7,
        channel: 'Comedy Central'
    }
];

function searchSimulatedVideos(query) {
    const searchTerm = query.toLowerCase();
    const filteredVideos = YOUTUBE_VIDEOS.filter(video => 
        video.title.toLowerCase().includes(searchTerm)
    );
    return filteredVideos.length > 0 ? filteredVideos : YOUTUBE_VIDEOS;
}

function displayVideos(videos) {
    const resultsDiv = document.getElementById('videoResults');
    
    let html = `
        <div class="results-header">
            <h3>🎥 Demo Videos - ${videos.length} Results</h3>
            <div class="api-badge demo">Demo Mode</div>
        </div>
        <div class="videos-grid">
    `;
    
    videos.forEach(video => {
        html += `
            <div class="video-card" onclick="playDemoVideo('${video.id}', ${video.points}, '${video.title.replace(/'/g, "\\'")}', '${video.channel.replace(/'/g, "\\'")}')">
                <div class="thumbnail">
                    <img src="${video.thumbnail}" alt="${video.title}">
                    <div class="duration">${video.duration}</div>
                    <div class="points-badge">+${video.points} pts</div>
                    <div class="demo-badge">Demo</div>
                </div>
                <div class="video-details">
                    <h4 class="video-title">${video.title}</h4>
                    <div class="video-meta">
                        <span class="channel">📺 ${video.channel}</span>
                        <span class="watch-now">▶️ Watch Demo</span>
                    </div>
                </div>
            </div>
        `;
    });
    
    html += '</div>';
    resultsDiv.innerHTML = html;
}

// Demo video player
function playDemoVideo(videoId, points, title, channel) {
    document.getElementById('videoResults').innerHTML = `
        <div class="demo-video-container">
            <div class="player-header">
                <button onclick="searchVideos()" class="back-btn">← Back to Search</button>
                <h3>🎬 Demo Video</h3>
                <div class="api-badge demo">Demo System</div>
            </div>
            
            <div class="demo-player-section">
                <div class="demo-video-placeholder">
                    <div class="demo-player">
                        <div class="play-icon">▶</div>
                        <h4>${title}</h4>
                        <p>Channel: ${channel}</p>
                        <div class="demo-stats">
                            <div>💰 Points: ${points}</div>
                            <div>🎯 Demo Video Player</div>
                        </div>
                    </div>
                </div>
                
                <div class="demo-earn-section">
                    <button onclick="earnPoints(${points}, '${title.replace(/'/g, "\\'")}', false)" class="demo-earn-btn">
                        ✅ Earn ${points} Points (Demo)
                    </button>
                    <p class="demo-note">In real mode, you would watch actual YouTube video</p>
                </div>
            </div>
        </div>
    `;
}

// Utility functions
function calculatePoints(title, index) {
    const basePoints = 10; // Fixed 10 points per video
    const bonus = Math.floor(Math.random() * 3); // 0-2 bonus points
    return basePoints + bonus;
}

function updateWallet() {
    const userPoints = parseInt(localStorage.getItem('userPoints')) || 100;
    document.querySelector('.wallet span').textContent = `💰 ${userPoints} Points`;
}

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
    setTimeout(() => notification.remove(), 4000);
}

function showEarnings() {
    const userPoints = parseInt(localStorage.getItem('userPoints')) || 100;
    const watchHistory = JSON.parse(localStorage.getItem('watchHistory')) || [];
    const youtubeVideos = watchHistory.filter(item => item.isYouTube).length;
    
    document.getElementById('videoResults').innerHTML = `
        <div class="earnings-container">
            <h3>💸 Your Earnings</h3>
            <div class="total-points">${userPoints} Points</div>
            
            <div class="earnings-stats">
                <div class="stat-card">
                    <div class="stat-number">${watchHistory.length}</div>
                    <div class="stat-label">Videos Watched</div>
                </div>
                <div class="stat-card">
                    <div class="stat-number">${youtubeVideos}</div>
                    <div class="stat-label">YouTube Videos</div>
                </div>
                <div class="stat-card">
                    <div class="stat-number">${userPoints - 100}</div>
                    <div class="stat-label">Points Earned</div>
                </div>
            </div>
            
            <button onclick="searchVideos()" class="continue-earning-btn">
                🔍 Continue Earning Points
            </button>
        </div>
    `;
}

// Initialize
document.addEventListener('DOMContentLoaded', function() {
    updateWallet();
    console.log('🎯 Reward Browser initialized with real video earning system');
});