// Admin Panel Management System
class AdminPanel {
    constructor() {
        this.users = [];
        this.transactions = [];
        this.settings = {};
        this.init();
    }

    init() {
        this.loadAllData();
        this.updateDashboard();
        this.loadUsersList();
        this.loadTransactions();
        this.loadSettings();
        this.updateSystemStatus();
        
        console.log('🎯 Admin Panel Initialized');
    }

    // Load all data from localStorage
    loadAllData() {
        // Load user data
        const miningState = JSON.parse(localStorage.getItem('miningState')) || { userPoints: 5564 };
        this.users = [{
            id: 'current_user',
            name: 'Current User',
            points: miningState.userPoints || 5564,
            videosWatched: parseInt(localStorage.getItem('watchedVideos')) || 24,
            referrals: 3,
            level: 'Bronze',
            joinDate: new Date().toISOString()
        }];

        // Load transactions
        this.transactions = JSON.parse(localStorage.getItem('transactionHistory')) || [];
        
        // Load settings
        this.settings = JSON.parse(localStorage.getItem('adminSettings')) || {
            miningRate: 5,
            videoPoints: 10,
            referralPoints: 50,
            dailyLimit: 20
        };
    }

    // Update dashboard statistics
    updateDashboard() {
        document.getElementById('totalUsers').textContent = this.users.length;
        document.getElementById('totalPoints').textContent = this.users.reduce((sum, user) => sum + user.points, 0);
        document.getElementById('totalVideos').textContent = this.users.reduce((sum, user) => sum + user.videosWatched, 0);
        document.getElementById('totalReferrals').textContent = this.users.reduce((sum, user) => sum + user.referrals, 0);
    }

    // Load users list
    loadUsersList() {
        const usersList = document.getElementById('usersList');
        usersList.innerHTML = '';

        this.users.forEach(user => {
            const userItem = document.createElement('div');
            userItem.className = 'user-item';
            userItem.innerHTML = `
                <div class="user-info">
                    <div class="user-avatar">${user.name.charAt(0)}</div>
                    <div>
                        <div style="font-weight: bold;">${user.name}</div>
                        <div style="font-size: 0.9rem; color: #666;">ID: ${user.id} | Level: ${user.level}</div>
                    </div>
                </div>
                <div style="text-align: right;">
                    <div style="font-weight: bold; font-size: 1.2rem;">${user.points} pts</div>
                    <div style="font-size: 0.9rem; color: #666;">
                        Videos: ${user.videosWatched} | Ref: ${user.referrals}
                    </div>
                </div>
            `;
            usersList.appendChild(userItem);
        });
    }

    // Load transactions table
    loadTransactions() {
        const table = document.getElementById('transactionsTable');
        table.innerHTML = '';

        this.transactions.slice(0, 50).forEach(transaction => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${new Date(transaction.timestamp).toLocaleString()}</td>
                <td>${transaction.icon} ${transaction.type}</td>
                <td>Current User</td>
                <td class="${transaction.amount > 0 ? 'positive' : 'negative'}">
                    ${transaction.amount > 0 ? '+' : ''}${transaction.amount}
                </td>
                <td>${transaction.description}</td>
                <td>
                    <button class="btn" onclick="admin.deleteTransaction(${transaction.timestamp})" style="padding: 5px 10px; font-size: 0.8rem;">🗑️</button>
                </td>
            `;
            table.appendChild(row);
        });
    }

    // Load settings
    loadSettings() {
        document.getElementById('miningRate').value = this.settings.miningRate;
        document.getElementById('videoPoints').value = this.settings.videoPoints;
        document.getElementById('referralPoints').value = this.settings.referralPoints;
        document.getElementById('dailyLimit').value = this.settings.dailyLimit;
    }

    // Save settings
    saveSettings() {
        this.settings = {
            miningRate: parseInt(document.getElementById('miningRate').value),
            videoPoints: parseInt(document.getElementById('videoPoints').value),
            referralPoints: parseInt(document.getElementById('referralPoints').value),
            dailyLimit: parseInt(document.getElementById('dailyLimit').value)
        };

        localStorage.setItem('adminSettings', JSON.stringify(this.settings));
        this.showAlert('Settings saved successfully!', 'success');
    }

    // Reset settings to default
    resetSettings() {
        this.settings = {
            miningRate: 5,
            videoPoints: 10,
            referralPoints: 50,
            dailyLimit: 20
        };
        this.loadSettings();
        this.saveSettings();
    }

    // Add points to all users
    addPointsToAll(points) {
        this.users.forEach(user => {
            user.points += points;
        });
        
        // Update main app storage
        const miningState = JSON.parse(localStorage.getItem('miningState')) || {};
        miningState.userPoints = (miningState.userPoints || 5564) + points;
        localStorage.setItem('miningState', JSON.stringify(miningState));

        this.updateDashboard();
        this.loadUsersList();
        this.showAlert(`Added ${points} points to all users!`, 'success');
    }

    // Reset all tasks
    resetAllTasks() {
        // Reset social tasks
        const socialTasks = {
            youtube: [
                { id: 'youtube_task_1', title: 'Subscribe to Tech Channel', points: 40, completed: false },
                { id: 'youtube_task_2', title: 'Watch 3 Videos', points: 25, completed: false },
                { id: 'youtube_task_3', title: 'Like & Comment', points: 15, completed: false }
            ],
            twitter: [
                { id: 'twitter_task_1', title: 'Follow Tech News', points: 25, completed: false },
                { id: 'twitter_task_2', title: 'Retweet Post', points: 20, completed: false },
                { id: 'twitter_task_3', title: 'Like 5 Tweets', points: 15, completed: false }
            ],
            instagram: [
                { id: 'instagram_task_1', title: 'Follow Fashion Page', points: 30, completed: false },
                { id: 'instagram_task_2', title: 'Watch 5 Reels', points: 20, completed: false },
                { id: 'instagram_task_3', title: 'Like & Share Story', points: 15, completed: false }
            ],
            telegram: [
                { id: 'telegram_task_1', title: 'Join Crypto Channel', points: 50, completed: false },
                { id: 'telegram_task_2', title: 'Watch 3 Ads', points: 25, completed: false },
                { id: 'telegram_task_3', title: 'Share Channel', points: 20, completed: false }
            ]
        };
        
        localStorage.setItem('socialTasks', JSON.stringify(socialTasks));
        
        // Reset followed accounts
        localStorage.removeItem('followedInstagramAccounts');
        localStorage.removeItem('followedXAccounts');
        localStorage.removeItem('followedTelegramChannels');
        localStorage.removeItem('subscribedYouTubeChannels');

        this.showAlert('All tasks reset successfully!', 'success');
    }

    // Clear all data
    clearAllData() {
        if (confirm('⚠️ Are you sure you want to clear ALL data? This cannot be undone!')) {
            localStorage.clear();
            this.init();
            this.showAlert('All data cleared successfully!', 'success');
        }
    }

    // Backup data
    backupData() {
        const backup = {
            users: this.users,
            transactions: this.transactions,
            settings: this.settings,
            timestamp: new Date().toISOString()
        };

        const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `tapearn-backup-${new Date().toISOString().split('T')[0]}.json`;
        a.click();
        
        this.showAlert('Backup created successfully!', 'success');
    }

    // Add test users
    addTestUsers() {
        const testUsers = [
            { id: 'test1', name: 'Test User 1', points: 1000, videosWatched: 10, referrals: 1, level: 'Bronze' },
            { id: 'test2', name: 'Test User 2', points: 2500, videosWatched: 25, referrals: 3, level: 'Silver' },
            { id: 'test3', name: 'Test User 3', points: 5000, videosWatched: 50, referrals: 5, level: 'Gold' }
        ];

        this.users.push(...testUsers);
        this.updateDashboard();
        this.loadUsersList();
        this.showAlert('Test users added successfully!', 'success');
    }

    // Generate report
    generateReport() {
        const report = {
            generatedAt: new Date().toISOString(),
            totalUsers: this.users.length,
            totalPoints: this.users.reduce((sum, user) => sum + user.points, 0),
            totalVideos: this.users.reduce((sum, user) => sum + user.videosWatched, 0),
            totalReferrals: this.users.reduce((sum, user) => sum + user.referrals, 0),
            averagePoints: Math.round(this.users.reduce((sum, user) => sum + user.points, 0) / this.users.length),
            settings: this.settings
        };

        const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `tapearn-report-${new Date().toISOString().split('T')[0]}.json`;
        a.click();
        
        this.showAlert('Report generated successfully!', 'success');
    }

    // Update system status
    updateSystemStatus() {
        document.getElementById('lastBackup').textContent = new Date().toLocaleString();
        
        // Check localStorage status
        try {
            localStorage.setItem('test', 'test');
            localStorage.removeItem('test');
            document.getElementById('storageStatus').textContent = 'Active';
            document.getElementById('storageStatus').className = 'status-online';
        } catch (e) {
            document.getElementById('storageStatus').textContent = 'Full';
            document.getElementById('storageStatus').className = 'status-offline';
        }
    }

    // Show alert message
    showAlert(message, type) {
        const alert = document.createElement('div');
        alert.className = `alert alert-${type}`;
        alert.textContent = message;
        
        document.querySelector('.admin-content').insertBefore(alert, document.querySelector('.admin-content').firstChild);
        
        setTimeout(() => {
            alert.remove();
        }, 5000);
    }

    // Delete transaction
    deleteTransaction(timestamp) {
        this.transactions = this.transactions.filter(t => t.timestamp !== timestamp);
        localStorage.setItem('transactionHistory', JSON.stringify(this.transactions));
        this.loadTransactions();
        this.showAlert('Transaction deleted!', 'success');
    }

    // Add sample videos
    addSampleVideos() {
        const sampleVideos = [
            {
                id: 'sample1',
                title: '🎵 Trending Music Short',
                points: 15,
                platform: 'youtube'
            },
            {
                id: 'sample2',
                title: '😂 Comedy Skit',
                points: 12,
                platform: 'instagram'
            },
            {
                id: 'sample3',
                title: '💪 Fitness Motivation',
                points: 18,
                platform: 'telegram'
            }
        ];
        
        localStorage.setItem('sampleVideos', JSON.stringify(sampleVideos));
        this.showAlert('Sample videos added!', 'success');
    }

    // Clear watched videos
    clearWatchedVideos() {
        localStorage.removeItem('watchedVideos');
        localStorage.removeItem('watchedInstagramVideos');
        localStorage.removeItem('watchedTelegramVideos');
        localStorage.removeItem('watchedXVideos');
        
        this.users.forEach(user => user.videosWatched = 0);
        this.updateDashboard();
        this.loadUsersList();
        this.showAlert('Watched videos cleared!', 'success');
    }

    // Reset video stats
    resetVideoStats() {
        this.clearWatchedVideos();
        this.showAlert('Video statistics reset!', 'success');
    }

    // Add bonus tasks
    addBonusTasks() {
        const bonusTasks = {
            bonus: [
                { id: 'bonus1', title: 'Watch 10 Videos', points: 100, completed: false },
                { id: 'bonus2', title: 'Refer 5 Friends', points: 250, completed: false },
                { id: 'bonus3', title: 'Complete All Social Tasks', points: 500, completed: false }
            ]
        };
        
        localStorage.setItem('bonusTasks', JSON.stringify(bonusTasks));
        this.showAlert('Bonus tasks added!', 'success');
    }

    // Reset social tasks
    resetSocialTasks() {
        localStorage.removeItem('followedInstagramAccounts');
        localStorage.removeItem('followedXAccounts');
        localStorage.removeItem('followedTelegramChannels');
        localStorage.removeItem('subscribedYouTubeChannels');
        this.showAlert('Social tasks reset!', 'success');
    }

    // Add social challenges
    addSocialChallenges() {
        const challenges = {
            challenges: [
                { id: 'challenge1', title: 'Social Media Master', description: 'Complete 10 social tasks', reward: 200 },
                { id: 'challenge2', title: 'Video Watcher Pro', description: 'Watch 50 videos', reward: 300 },
                { id: 'challenge3', title: 'Referral King', description: 'Get 10 referrals', reward: 500 }
            ]
        };
        
        localStorage.setItem('challenges', JSON.stringify(challenges));
        this.showAlert('Social challenges added!', 'success');
    }

    // Export transactions
    exportTransactions() {
        const csv = this.transactions.map(t => 
            `${new Date(t.timestamp).toLocaleString()},${t.type},${t.amount},${t.description}`
        ).join('\n');
        
        const header = 'Date,Type,Amount,Description\n';
        const blob = new Blob([header + csv], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `transactions-${new Date().toISOString().split('T')[0]}.csv`;
        a.click();
        
        this.showAlert('Transactions exported to CSV!', 'success');
    }

    // Clear old transactions
    clearOldTransactions() {
        const oneWeekAgo = Date.now() - (7 * 24 * 60 * 60 * 1000);
        this.transactions = this.transactions.filter(t => t.timestamp > oneWeekAgo);
        localStorage.setItem('transactionHistory', JSON.stringify(this.transactions));
        this.loadTransactions();
        this.showAlert('Old transactions cleared!', 'success');
    }

    // Optimize storage
    optimizeStorage() {
        // Remove duplicate entries
        const uniqueTransactions = this.transactions.filter((t, index, self) =>
            index === self.findIndex(tr => tr.timestamp === t.timestamp && tr.type === t.type)
        );
        
        this.transactions = uniqueTransactions;
        localStorage.setItem('transactionHistory', JSON.stringify(this.transactions));
        this.loadTransactions();
        this.showAlert('Storage optimized!', 'success');
    }

    // Check system health
    checkSystemHealth() {
        let healthScore = 100;
        const issues = [];

        // Check localStorage
        try {
            localStorage.setItem('health_check', 'test');
            localStorage.removeItem('health_check');
        } catch (e) {
            healthScore -= 30;
            issues.push('LocalStorage is full or not accessible');
        }

        // Check critical data
        if (!localStorage.getItem('miningState')) {
            healthScore -= 20;
            issues.push('Mining state data missing');
        }

        if (this.transactions.length === 0) {
            healthScore -= 10;
            issues.push('No transaction history');
        }

        // Show health report
        let message = `System Health: ${healthScore}%`;
        if (issues.length > 0) {
            message += '\n\nIssues found:\n' + issues.join('\n');
        }

        alert(message);
    }

    // Reset everything
    resetEverything() {
        if (confirm('🚨 NUCLEAR OPTION! This will reset EVERYTHING to factory defaults. Are you absolutely sure?')) {
            localStorage.clear();
            sessionStorage.clear();
            this.init();
            this.showAlert('Complete system reset performed!', 'success');
        }
    }

    // Export all data
    exportAllData() {
        const allData = {
            users: this.users,
            transactions: this.transactions,
            settings: this.settings,
            miningState: JSON.parse(localStorage.getItem('miningState')),
            watchedVideos: JSON.parse(localStorage.getItem('watchedVideos')),
            socialTasks: JSON.parse(localStorage.getItem('socialTasks')),
            timestamp: new Date().toISOString()
        };

        const blob = new Blob([JSON.stringify(allData, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `tapearn-complete-export-${new Date().toISOString().split('T')[0]}.json`;
        a.click();
        
        this.showAlert('All data exported successfully!', 'success');
    }
}

// Global admin instance
const admin = new AdminPanel();

// Navigation functions
function showSection(sectionName) {
    // Hide all sections
    document.querySelectorAll('.section').forEach(section => {
        section.classList.remove('active');
    });
    
    // Remove active class from all tabs
    document.querySelectorAll('.nav-tab').forEach(tab => {
        tab.classList.remove('active');
    });
    
    // Show selected section and activate tab
    document.getElementById(sectionName).classList.add('active');
    event.target.classList.add('active');
}

// Search users function
function searchUsers() {
    const searchTerm = document.getElementById('searchUser').value.toLowerCase();
    // Implementation for user search
    console.log('Searching for:', searchTerm);
}

// Filter transactions
function filterTransactions() {
    const filterType = document.getElementById('filterType').value;
    // Implementation for transaction filtering
    console.log('Filtering by:', filterType);
}

// Add new user
function addNewUser() {
    const userName = prompt('Enter new user name:');
    if (userName) {
        admin.users.push({
            id: 'user_' + Date.now(),
            name: userName,
            points: 0,
            videosWatched: 0,
            referrals: 0,
            level: 'Bronze',
            joinDate: new Date().toISOString()
        });
        admin.updateDashboard();
        admin.loadUsersList();
        admin.showAlert(`User "${userName}" added successfully!`, 'success');
    }
}

// Export users
function exportUsers() {
    const csv = admin.users.map(user => 
        `${user.id},${user.name},${user.points},${user.videosWatched},${user.referrals},${user.level}`
    ).join('\n');
    
    const header = 'ID,Name,Points,Videos Watched,Referrals,Level\n';
    const blob = new Blob([header + csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `users-export-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    
    admin.showAlert('Users exported to CSV!', 'success');
}

// Manage user points
function manageUserPoints() {
    const userId = document.getElementById('pointsUser').value;
    const action = document.getElementById('pointsAction').value;
    const amount = parseInt(document.getElementById('pointsAmount').value);
    const reason = document.getElementById('pointsReason').value;

    if (!userId || !amount) {
        alert('Please select a user and enter amount!');
        return;
    }

    const user = admin.users.find(u => u.id === userId);
    if (user) {
        switch(action) {
            case 'add':
                user.points += amount;
                break;
            case 'remove':
                user.points = Math.max(0, user.points - amount);
                break;
            case 'set':
                user.points = amount;
                break;
        }
        
        // Add transaction record
        admin.transactions.unshift({
            type: 'admin',
            amount: action === 'remove' ? -amount : amount,
            description: `Admin ${action}: ${reason}`,
            timestamp: Date.now(),
            icon: '👨‍💼'
        });
        
        localStorage.setItem('transactionHistory', JSON.stringify(admin.transactions));
        
        admin.updateDashboard();
        admin.loadUsersList();
        admin.loadTransactions();
        admin.showAlert(`Points ${action}ed for user!`, 'success');
    }
}

// Reset all points
function resetAllPoints() {
    if (confirm('Reset all users points to zero?')) {
        admin.users.forEach(user => user.points = 0);
        
        const miningState = JSON.parse(localStorage.getItem('miningState')) || {};
        miningState.userPoints = 0;
        localStorage.setItem('miningState', JSON.stringify(miningState));
        
        admin.updateDashboard();
        admin.loadUsersList();
        admin.showAlert('All points reset to zero!', 'success');
    }
}

// Restore data (placeholder)
function restoreData() {
    alert('Restore feature would require file upload implementation');
}

// Auto-save settings when inputs change
document.addEventListener('DOMContentLoaded', function() {
    const settingInputs = ['miningRate', 'videoPoints', 'referralPoints', 'dailyLimit'];
    settingInputs.forEach(id => {
        document.getElementById(id).addEventListener('change', () => {
            admin.saveSettings();
        });
    });
});