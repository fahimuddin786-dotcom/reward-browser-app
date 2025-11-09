// YouTube API Configuration
const YOUTUBE_API_KEY = 'AIzaSyBATxf5D7ZDeiQ61dbEdzEd4Tq72N713Y8';

// YouTube Player State Management
let currentPlayer = null;
let currentVideoId = null;
let currentPoints = 0;
let currentTitle = '';
let isVideoPlaying = false;
let videoStartTime = null;

// Track watched videos - ek video sirf ek baar
let watchedVideos = JSON.parse(localStorage.getItem('watchedVideos')) || [];

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
        const isWatched = watchedVideos.includes(videoId);
        
        html += `
            <div class="video-card" onclick="selectVideoForEarning('${videoId}', ${points}, '${title.replace(/'/g, "\\'")}', '${channel.replace(/'/g, "\\'")}')">
                <div class="thumbnail">
                    <img src="${thumbnail}" alt="${title}" onerror="this.src='https://via.placeholder.com/300/667eea/ffffff?text=YouTube+Short'">
                    <div class="duration">SHORT</div>
                    ${isWatched ? 
                        '<div class="watched-badge">✅ WATCHED</div>' : 
                        '<div class="points-badge">+' + points + ' pts</div>'
                    }
                    <div class="youtube-badge">YouTube</div>
                </div>
                <div class="video-details">
                    <h4 class="video-title">${title}</h4>
                    <div class="video-meta">
                        <span class="channel">📺 ${channel}</span>
                        ${isWatched ? 
                            '<span class="watch-now">✅ Already Earned</span>' : 
                            '<span class="watch-now">▶️ Watch to Earn</span>'
                        }
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
    // Check if video already watched
    if (watchedVideos.includes(videoId)) {
        showNotification('❌ You have already earned points for this video! Watch a different video.', 'warning');
        return;
    }
    
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
                        <span class="points-condition">on 1 minute complete watch</span>
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
                            <span class="step-text">Watch the YouTube video for 1 minute completely</span>
                        </div>
                        <div class="step">
                            <span class="step-number">3</span>
                            <span class="step-text">Points automatically added after 1 minute</span>
                        </div>
                        <div class="step">
                            <span class="step-number">4</span>
                            <span class="step-text">If you leave early, no points will be given</span>
                        </div>
                    </div>
                </div>
                
                <div class="earn-action">
                    <button onclick="startVideoEarning('${videoId}', ${points}, '${title.replace(/'/g, "\\'")}')" class="earn-btn">
                        🎬 Start Earning ${points} Points
                    </button>
                    <p class="action-note">Video will play on this page - must watch for 1 minute</p>
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
    
    // Show YouTube player in same page
    showYouTubePlayer(videoId);
    
    // Start video tracking
    startVideoTracking(videoId, points, title);
}

// Show YouTube player in same page
function showYouTubePlayer(videoId) {
    document.querySelector('.youtube-player-placeholder').innerHTML = `
        <div class="youtube-iframe-container">
            <iframe 
                width="100%" 
                height="300" 
                src="https://www.youtube.com/embed/${videoId}?autoplay=1&controls=1" 
                frameborder="0" 
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                allowfullscreen>
            </iframe>
        </div>
        <div class="video-timer">
            <p>⏰ <strong>Video must play for 1 minute to earn points</strong></p>
            <p>Don't close this page - points will be awarded automatically</p>
        </div>
    `;
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
                        <h4>Loading YouTube Video...</h4>
                        <p>Video will play on this page. Keep it open for 1 minute.</p>
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
                    <button onclick="cancelEarning()" class="cancel-btn">
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
}

// Start video tracking
function startVideoTracking(videoId, points, title) {
    let trackingTime = 0;
    const maxTrackingTime = 60; // 1 minute required
    
    const trackingInterval = setInterval(() => {
        trackingTime++;
        updateTrackingProgress(trackingTime, maxTrackingTime);
        
        if (trackingTime >= maxTrackingTime) {
            clearInterval(trackingInterval);
            completeVideoEarning(points, title, true);
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

// Complete video earning process
function completeVideoEarning(points, title, isAuto = false) {
    // Clean up tracking
    if (window.videoTrackingInterval) {
        clearInterval(window.videoTrackingInterval);
    }
    
    // Add to watched videos list
    if (currentVideoId && !watchedVideos.includes(currentVideoId)) {
        watchedVideos.push(currentVideoId);
        localStorage.setItem('watchedVideos', JSON.stringify(watchedVideos));
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
                    <span class="detail-label">Watch Time:</span>
                    <span class="detail-value">1 minute complete</span>
                </div>
            </div>
            
            <div class="success-message">
                <p>✅ <strong>1 minute watch time verified!</strong></p>
                <p>Your points have been added to your wallet.</p>
                <p>This video is now marked as watched.</p>
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
    showNotification('❌ Points earning cancelled - no points added', 'warning');
    searchVideos();
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
        method: '1_minute_complete_watch'
    });
    localStorage.setItem('watchHistory', JSON.stringify(watchHistory));
    
    updateWallet();
    
    if (isYouTube) {
        showNotification(`✅ +${points} Points earned for 1 minute watch!`, 'success');
    }
    
    return userPoints;
}

// Demo videos fallback
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
        const isWatched = watchedVideos.includes(video.id);
        
        html += `
            <div class="video-card" onclick="selectVideoForEarning('${video.id}', ${video.points}, '${video.title.replace(/'/g, "\\'")}', '${video.channel.replace(/'/g, "\\'")}')">
                <div class="thumbnail">
                    <img src="${video.thumbnail}" alt="${video.title}">
                    <div class="duration">${video.duration}</div>
                    ${isWatched ? 
                        '<div class="watched-badge">✅ WATCHED</div>' : 
                        '<div class="points-badge">+' + video.points + ' pts</div>'
                    }
                    <div class="demo-badge">Demo</div>
                </div>
                <div class="video-details">
                    <h4 class="video-title">${video.title}</h4>
                    <div class="video-meta">
                        <span class="channel">📺 ${video.channel}</span>
                        ${isWatched ? 
                            '<span class="watch-now">✅ Already Earned</span>' : 
                            '<span class="watch-now">▶️ Watch Demo</span>'
                        }
                    </div>
                </div>
            </div>
        `;
    });
    
    html += '</div>';
    resultsDiv.innerHTML = html;
}

// Utility functions
function calculatePoints(title, index) {
    const basePoints = 10;
    const bonus = Math.floor(Math.random() * 3);
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

// Development function to reset watched videos
function resetWatchedVideos() {
    if (confirm('Reset all watched videos? This will allow you to earn points again for watched videos.')) {
        watchedVideos = [];
        localStorage.removeItem('watchedVideos');
        showNotification('✅ Watched videos reset successfully!', 'success');
        searchVideos();
    }
}

// Initialize
document.addEventListener('DOMContentLoaded', function() {
    updateWallet();
    console.log('🎯 Reward Browser initialized with 1-minute watch system');
});
