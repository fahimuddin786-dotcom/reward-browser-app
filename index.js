const { Telegraf } = require('telegraf');
const https = require('https');
const fs = require('fs');
require('dotenv').config();

console.log('🚀 Starting Reward Browser Bot with Enhanced Points System...');

// IPv4 force karne ke liye custom agent
const agent = new https.Agent({
    family: 4,
    keepAlive: true
});

// Web App URL - apni actual URL se replace karein
const WEB_APP_URL = process.env.WEB_APP_URL || 'https://reward-browser-app.vercel.app/';

const bot = new Telegraf(process.env.BOT_TOKEN, {
    telegram: {
        apiRoot: 'https://api.telegram.org',
        agent: agent,
        retryAfter: 1
    }
});

// Persistent Storage Files
const USER_POINTS_FILE = 'user_points.json';
const REFERRAL_STORAGE_FILE = 'referral_storage.json';
const USER_SESSIONS_FILE = 'user_sessions.json';
const USER_TRANSACTIONS_FILE = 'user_transactions.json';

// Persistent storage functions
function loadUserPoints() {
    try {
        if (fs.existsSync(USER_POINTS_FILE)) {
            const data = fs.readFileSync(USER_POINTS_FILE, 'utf8');
            const parsed = JSON.parse(data);
            console.log(`📊 Loaded ${Object.keys(parsed).length} users' points`);
            return parsed; // Object use karenge Map ki jagah
        }
    } catch (error) {
        console.log('❌ Error loading user points:', error);
    }
    console.log('🆕 Starting with fresh user points storage');
    return {};
}

function saveUserPoints() {
    try {
        fs.writeFileSync(USER_POINTS_FILE, JSON.stringify(userPoints, null, 2));
        console.log(`💾 User points saved: ${Object.keys(userPoints).length} users`);
    } catch (error) {
        console.log('❌ Error saving user points:', error);
    }
}

function loadReferralStorage() {
    try {
        if (fs.existsSync(REFERRAL_STORAGE_FILE)) {
            const data = fs.readFileSync(REFERRAL_STORAGE_FILE, 'utf8');
            const parsed = JSON.parse(data);
            console.log(`📊 Loaded ${Object.keys(parsed).length} referrals`);
            return parsed;
        }
    } catch (error) {
        console.log('❌ Error loading referral storage:', error);
    }
    console.log('🆕 Starting with fresh referral storage');
    return {};
}

function saveReferralStorage() {
    try {
        fs.writeFileSync(REFERRAL_STORAGE_FILE, JSON.stringify(referralStorage, null, 2));
        console.log(`💾 Referral storage saved: ${Object.keys(referralStorage).length} referrals`);
    } catch (error) {
        console.log('❌ Error saving referral storage:', error);
    }
}

function loadUserSessions() {
    try {
        if (fs.existsSync(USER_SESSIONS_FILE)) {
            const data = fs.readFileSync(USER_SESSIONS_FILE, 'utf8');
            const parsed = JSON.parse(data);
            console.log(`📊 Loaded ${Object.keys(parsed).length} user sessions`);
            return parsed;
        }
    } catch (error) {
        console.log('❌ Error loading user sessions:', error);
    }
    console.log('🆕 Starting with fresh user sessions');
    return {};
}

function saveUserSessions() {
    try {
        fs.writeFileSync(USER_SESSIONS_FILE, JSON.stringify(userSessions, null, 2));
        console.log(`💾 User sessions saved: ${Object.keys(userSessions).length} sessions`);
    } catch (error) {
        console.log('❌ Error saving user sessions:', error);
    }
}

function loadUserTransactions() {
    try {
        if (fs.existsSync(USER_TRANSACTIONS_FILE)) {
            const data = fs.readFileSync(USER_TRANSACTIONS_FILE, 'utf8');
            const parsed = JSON.parse(data);
            console.log(`📊 Loaded transactions for ${Object.keys(parsed).length} users`);
            return parsed;
        }
    } catch (error) {
        console.log('❌ Error loading user transactions:', error);
    }
    console.log('🆕 Starting with fresh transactions storage');
    return {};
}

function saveUserTransactions() {
    try {
        fs.writeFileSync(USER_TRANSACTIONS_FILE, JSON.stringify(userTransactions, null, 2));
        console.log(`💾 User transactions saved: ${Object.keys(userTransactions).length} users`);
    } catch (error) {
        console.log('❌ Error saving user transactions:', error);
    }
}

// Enhanced Points storage (with persistent storage)
const userPoints = loadUserPoints();
const referralStorage = loadReferralStorage();
const userSessions = loadUserSessions();
const userTransactions = loadUserTransactions();

// Web App Menu Setup
const setupWebApp = async (retryCount = 0) => {
    try {
        await bot.telegram.setChatMenuButton({
            menu_button: {
                type: 'web_app',
                text: '🎬 Earn Points',
                web_app: { url: WEB_APP_URL }
            }
        });
        console.log('✅ Web App menu configured successfully!');
        return true;
    } catch (error) {
        console.log(`❌ Menu setup attempt ${retryCount + 1} failed:`, error.message);
        if (retryCount < 3) {
            setTimeout(() => setupWebApp(retryCount + 1), 5000);
        }
        return false;
    }
};

// ==================== ENHANCED POINTS MANAGEMENT SYSTEM ====================

function generateReferralCode(userId) {
    return 'REF_' + userId + '_' + Math.random().toString(36).substr(2, 6).toUpperCase();
}

function generateSessionId(userId) {
    return 'SESSION_' + userId + '_' + Date.now() + '_' + Math.random().toString(36).substr(2, 8);
}

function storeReferral(referrerId, referredUserId, referredUserName) {
    const referralCode = generateReferralCode(referrerId);
    referralStorage[referralCode] = {
        referrerId: referrerId,
        referredUserId: referredUserId,
        referredUserName: referredUserName,
        timestamp: Date.now(),
        status: 'pending',
        bonusGiven: false,
        sessionId: generateSessionId(referredUserId)
    };
    saveReferralStorage();
    return referralCode;
}

function getReferral(code) {
    return referralStorage[code];
}

function createUserSession(userId) {
    const sessionId = generateSessionId(userId);
    userSessions[userId] = {
        sessionId: sessionId,
        createdAt: Date.now(),
        isNewUser: true,
        lastActive: Date.now()
    };
    saveUserSessions();
    return sessionId;
}

function getUserSession(userId) {
    return userSessions[userId];
}

// ✅ ENHANCED: Points management with proper persistence
function updateUserPoints(userId, points, transactionType = 'earned', description = '') {
    const currentPoints = userPoints[userId] || 0;
    const newPoints = currentPoints + points;
    userPoints[userId] = newPoints;
    
    // Transaction history maintain karo
    if (!userTransactions[userId]) {
        userTransactions[userId] = [];
    }
    
    userTransactions[userId].push({
        type: transactionType,
        amount: points,
        description: description,
        timestamp: Date.now(),
        balance: newPoints
    });
    
    // Keep only last 50 transactions
    if (userTransactions[userId].length > 50) {
        userTransactions[userId] = userTransactions[userId].slice(-50);
    }
    
    // Save both points and transactions
    saveUserPoints();
    saveUserTransactions();
    
    console.log(`💰 Points updated: User ${userId} | ${points > 0 ? '+' : ''}${points} | Total: ${newPoints} | Reason: ${description}`);
    
    return newPoints;
}

function getUserPoints(userId) {
    return userPoints[userId] || 0;
}

function getUserTransactions(userId) {
    return userTransactions[userId] || [];
}

// Award referral bonus to referrer
function awardReferralBonus(referrerId, referredUserName) {
    const bonusPoints = 50;
    const newTotal = updateUserPoints(
        referrerId, 
        bonusPoints, 
        'referral_bonus', 
        `Referral: ${referredUserName}`
    );
    console.log(`💰 Referral bonus awarded: ${referrerId} got +${bonusPoints} points for referring ${referredUserName}`);
    return { bonusPoints, newTotal };
}

// ✅ NEW: Web app se points update karne ka function
function handlePointsUpdateFromWebApp(userId, pointsData) {
    try {
        const { points, type, description, sessionId } = pointsData;
        
        if (typeof points !== 'number') {
            console.log('❌ Invalid points data received:', pointsData);
            return false;
        }
        
        // Session verify karo (optional security)
        if (sessionId && userSessions[userId] && userSessions[userId].sessionId !== sessionId) {
            console.log('❌ Session mismatch for user:', userId);
            return false;
        }
        
        const newTotal = updateUserPoints(userId, points, type, description);
        
        console.log(`✅ Web App Points Updated: User ${userId} | +${points} | Total: ${newTotal} | ${description}`);
        return { success: true, newTotal: newTotal };
        
    } catch (error) {
        console.log('❌ Error handling points update from web app:', error);
        return false;
    }
}

// ✅ NEW: Points sync karne ka endpoint (web app ke liye)
bot.on('message', (ctx) => {
    // Check if message contains points data from web app
    if (ctx.message && ctx.message.text && ctx.message.text.startsWith('POINTS_UPDATE:')) {
        try {
            const pointsData = JSON.parse(ctx.message.text.replace('POINTS_UPDATE:', ''));
            const userId = ctx.from.id;
            
            const result = handlePointsUpdateFromWebApp(userId, pointsData);
            
            if (result) {
                // Silent acknowledgment - no message send karenge
                console.log(`✅ Points sync successful for user ${userId}`);
            } else {
                console.log(`❌ Points sync failed for user ${userId}`);
            }
            
        } catch (error) {
            console.log('❌ Error parsing points update:', error);
        }
        return; // Is message ko process mat karo as normal text
    }
});

// ==================== BOT COMMANDS WITH ENHANCED POINTS SYSTEM ====================

// Start Command - Enhanced Points Handling
bot.start(async (ctx) => {
    const userName = ctx.from.first_name || 'User';
    const userID = ctx.from.id.toString();
    const startPayload = ctx.startPayload;
    
    console.log(`👤 User started bot: ${userName} (ID: ${userID})`);
    console.log(`📦 Start payload: ${startPayload}`);
    
    let referralMessage = '';
    let webAppUrl = WEB_APP_URL;
    let sessionId = '';
    let isReferredUser = false;
    let referrerId = null;
    
    // Welcome bonus check karo
    const hasWelcomeBonus = userSessions[userID] && userSessions[userID].welcomeBonusGiven;
    
    // Handle referral if start payload exists
    if (startPayload && startPayload.startsWith('ref')) {
        referrerId = startPayload.replace('ref', '');
        const referralCode = storeReferral(referrerId, userID, userName);
        sessionId = referralStorage[referralCode].sessionId;
        isReferredUser = true;
        
        referralMessage = `\n🎁 *REFERRAL BONUS!* You were invited by a friend!\nYou'll get 25 BONUS POINTS when you start!`;
        webAppUrl = `${WEB_APP_URL}?ref=${referralCode}&newuser=true&timestamp=${Date.now()}&userid=${userID}&session=${sessionId}&fresh=true`;
        
        console.log(`✅ Referral detected: ${userName} referred by ${referrerId}`);
    } else {
        // Normal user - create new session with cache busting
        sessionId = createUserSession(userID);
        webAppUrl = `${WEB_APP_URL}?timestamp=${Date.now()}&userid=${userID}&session=${sessionId}&fresh=true`;
        console.log(`🆕 New user session: ${sessionId}`);
    }
    
    // Welcome bonus de do agar pehli baar start kar raha hai
    if (!hasWelcomeBonus) {
        updateUserPoints(userID, 25, 'welcome_bonus', 'Welcome Bonus');
        if (userSessions[userID]) {
            userSessions[userID].welcomeBonusGiven = true;
            saveUserSessions();
        }
        console.log(`🎁 Welcome bonus given to user ${userID}`);
    }
    
    // Welcome message with enhanced formatting
    const welcomeMessage = `\
🤖 *Welcome ${userName}!* ${referralMessage}

🎯 *Reward Browser - Watch Videos & Earn Money!*

✨ *Get Started:*
1. Click "🎬 OPEN EARNING APP" below
2. Watch YouTube videos & Instagram Reels
3. Earn points automatically
4. Redeem rewards for real money!

💰 *Your Current Points: ${getUserPoints(userID)}*

📊 *Earning Opportunities:*
• 🎬 Watch Videos: 10-15 points each
• ⛏️ Auto Mining: 5 points/minute  
• 👥 Refer Friends: 50 points each
• 📱 Follow Accounts: 25-50 points
• 📋 Complete Tasks: 15-40 points

*Click the button below to start earning!* 🚀\
    `;

    try {
        await ctx.reply(welcomeMessage, { 
            parse_mode: 'Markdown',
            reply_markup: {
                inline_keyboard: [
                    [
                        { 
                            text: '🎬 OPEN EARNING APP', 
                            web_app: { url: webAppUrl } 
                        }
                    ],
                    [
                        { text: '👥 Invite Friends', callback_data: 'invite_friends' },
                        { text: '💰 Check Wallet', callback_data: 'check_wallet' }
                    ],
                    [
                        { text: '🔄 Fresh Start', callback_data: 'fresh_start' },
                        { text: '📊 Statistics', callback_data: 'show_stats' }
                    ]
                ]
            }
        });

        // Award referral bonus to referrer after successful message
        if (isReferredUser && referrerId) {
            setTimeout(() => {
                try {
                    const bonusInfo = awardReferralBonus(referrerId, userName);
                    // Notify referrer about the bonus
                    ctx.telegram.sendMessage(
                        referrerId, 
                        `🎉 *Referral Bonus!*\n\nYou just earned +${bonusInfo.bonusPoints} points!\n👤 ${userName} joined using your referral link.\n💰 Your total points: ${bonusInfo.newTotal}`,
                        { parse_mode: 'Markdown' }
                    ).catch(err => console.log('Could not notify referrer:', err.message));
                } catch (error) {
                    console.log('Error awarding referral bonus:', error.message);
                }
            }, 1000);
        }

    } catch (error) {
        console.error('Error sending welcome message:', error);
        // Fallback simple message
        ctx.reply(`Welcome ${userName}! Click the button below to start earning points! 🚀`, {
            reply_markup: {
                inline_keyboard: [[
                    { text: '🎬 Start Earning', web_app: { url: webAppUrl } }
                ]]
            }
        });
    }
});

// Refer Command - Personal Referral Links
bot.command('refer', (ctx) => {
    const userId = ctx.from.id.toString();
    const userName = ctx.from.first_name || 'Friend';
    const botUsername = ctx.botInfo.username;
    
    const personalReferralLink = `https://t.me/${botUsername}?start=ref${userId}`;
    const userTotalPoints = getUserPoints(userId);
    
    // Count user referrals
    const userReferrals = Object.values(referralStorage).filter(ref => ref.referrerId === userId);
    const completedReferrals = userReferrals.filter(ref => ref.bonusGiven).length;
    const pendingReferrals = userReferrals.filter(ref => !ref.bonusGiven).length;
    
    const referralMessage = `\
👥 *Invite Friends & Earn 50 Points Each!*

🎁 *HOW IT WORKS:*
• Share your personal referral link
• Friends join using YOUR link  
• You get *50 BONUS POINTS* instantly
• Your friend gets *25 WELCOME POINTS*
• Track all your referrals in real-time

💰 *YOUR EARNINGS:*
• Total Points: *${userTotalPoints}*
• Referrals Completed: *${completedReferrals}*
• Pending Referrals: *${pendingReferrals}*
• Earned from Referrals: *${completedReferrals * 50} points*

🔗 *YOUR PERSONAL REFERRAL LINK:*
\`${personalReferralLink}\`

📤 *QUICK SHARE OPTIONS:*\
    `;

    ctx.reply(referralMessage, {
        parse_mode: 'Markdown',
        reply_markup: {
            inline_keyboard: [
                [
                    { 
                        text: '📱 Share on Telegram', 
                        url: `https://t.me/share/url?url=${encodeURIComponent(personalReferralLink)}&text=Join Reward Browser and earn money by watching videos! Use my referral for 25 BONUS POINTS! 🎬💰` 
                    }
                ],
                [
                    { 
                        text: '💚 Share on WhatsApp', 
                        url: `https://wa.me/?text=${encodeURIComponent(`Join Reward Browser - Watch videos and earn money! 💰\n\nUse my referral link for 25 BONUS POINTS:\n${personalReferralLink}\n\nStart earning today! 🎬`)}` 
                    }
                ],
                [
                    { 
                        text: '📋 Copy Referral Link', 
                        callback_data: 'copy_referral' 
                    }
                ],
                [
                    { text: '📊 My Referrals', callback_data: 'my_referrals' },
                    { text: '🎬 Earn More', callback_data: 'earn_more' }
                ]
            ]
        }
    });
});

// Wallet Command - Enhanced with Transaction History
bot.command('wallet', (ctx) => {
    const userId = ctx.from.id.toString();
    const sessionId = generateSessionId(userId);
    const userTotalPoints = getUserPoints(userId);
    const userTransactionHistory = getUserTransactions(userId);
    
    // Recent transactions (last 5)
    const recentTransactions = userTransactionHistory.slice(-5).reverse();
    
    let transactionText = '';
    if (recentTransactions.length > 0) {
        transactionText = `\n📝 *Recent Transactions:*\n`;
        recentTransactions.forEach(transaction => {
            const time = new Date(transaction.timestamp).toLocaleTimeString();
            const sign = transaction.amount > 0 ? '+' : '';
            transactionText += `• ${time}: ${sign}${transaction.amount} - ${transaction.description}\n`;
        });
    } else {
        transactionText = `\n📝 *No transactions yet.*\nStart earning points to see your history here!`;
    }
    
    ctx.reply(`💰 *Your Points Wallet*\n\n*Current Balance:* ${userTotalPoints} points\n*Estimated Value:* $${(userTotalPoints / 1000).toFixed(2)}${transactionText}`, {
        parse_mode: 'Markdown',
        reply_markup: {
            inline_keyboard: [
                [
                    { text: '📊 View Full History', web_app: { url: `${WEB_APP_URL}#history&session=${sessionId}` } }
                ],
                [
                    { text: '🎬 Earn More Points', web_app: { url: `${WEB_APP_URL}?session=${sessionId}` } },
                    { text: '💰 Redeem Rewards', web_app: { url: `${WEB_APP_URL}#rewards&session=${sessionId}` } }
                ],
                [
                    { text: '🔄 Refresh Balance', callback_data: 'check_wallet' }
                ]
            ]
        }
    });
});

// Stats Command - Enhanced with Detailed Points Breakdown
bot.command('stats', (ctx) => {
    const userId = ctx.from.id.toString();
    const userTotalPoints = getUserPoints(userId);
    const userTransactionHistory = getUserTransactions(userId);
    
    // Points breakdown by type
    const pointsByType = {};
    userTransactionHistory.forEach(transaction => {
        if (transaction.amount > 0) {
            pointsByType[transaction.type] = (pointsByType[transaction.type] || 0) + transaction.amount;
        }
    });
    
    // User referrals
    const userReferrals = Object.values(referralStorage).filter(ref => ref.referrerId === userId);
    const completedReferrals = userReferrals.filter(ref => ref.bonusGiven).length;
    
    let breakdownText = '';
    Object.entries(pointsByType).forEach(([type, points]) => {
        const typeName = type.replace('_', ' ').toUpperCase();
        breakdownText += `• ${typeName}: ${points} points\n`;
    });
    
    const statsMessage = `\
📊 *Your Detailed Statistics*

💰 *Points Overview:*
• Total Points: *${userTotalPoints}*
• Available for Redeem: *${userTotalPoints}*
• Estimated Value: *$${(userTotalPoints / 1000).toFixed(2)}*

📈 *Points Breakdown:*
${breakdownText || '• No points earned yet'}

👥 *Referral Stats:*
• Completed Referrals: *${completedReferrals}*
• Pending Referrals: *${userReferrals.length - completedReferrals}*
• Total Referral Earnings: *${completedReferrals * 50} points*

🎯 *Earning Tips:*
• Watch 10 videos/day: ~150 points
• Mine for 1 hour: ~300 points  
• Refer 1 friend: 50 points
• Complete all tasks: ~100 points

*Keep inviting friends and watching videos to increase your earnings!* 🚀\
    `;
    
    ctx.reply(statsMessage, {
        parse_mode: 'Markdown',
        reply_markup: {
            inline_keyboard: [
                [
                    { text: '👥 Invite Friends', callback_data: 'invite_friends' },
                    { text: '🎬 Earn More', callback_data: 'earn_more' }
                ]
            ]
        }
    });
});

// Admin command to check bot stats - Enhanced with Points Overview
bot.command('admin', (ctx) => {
    // Basic admin check - in production, use proper admin validation
    const adminUsers = process.env.ADMIN_USERS ? process.env.ADMIN_USERS.split(',') : [];
    
    if (!adminUsers.includes(ctx.from.id.toString())) {
        ctx.reply('❌ Access denied. Admin only.');
        return;
    }
    
    const totalUsers = Object.keys(userSessions).length;
    const totalReferrals = Object.keys(referralStorage).length;
    const activeReferrals = Object.values(referralStorage).filter(ref => !ref.bonusGiven).length;
    const totalPoints = Object.values(userPoints).reduce((sum, points) => sum + points, 0);
    
    // Points distribution analysis
    const usersWithPoints = Object.values(userPoints).filter(points => points > 0).length;
    const topUsers = Object.entries(userPoints)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 5)
        .map(([id, points]) => `${id}: ${points} points`);
    
    const adminMessage = `\
👑 *Admin Statistics*

📊 *User Stats:*
• Total Users: *${totalUsers}*
• Active Users (with points): *${usersWithPoints}*
• Total Points Distributed: *${totalPoints}*

👥 *Referral Stats:*
• Total Referrals: *${totalReferrals}*
• Active Referrals: *${activeReferrals}*
• Completed Referrals: *${totalReferrals - activeReferrals}*

💰 *Points Distribution:*
• Average Points/User: *${(totalPoints / Math.max(usersWithPoints, 1)).toFixed(1)}*
• Top 5 Users:
${topUsers.map(user => `  - ${user}`).join('\n')}

💾 *Storage:*
• User Sessions: *${Object.keys(userSessions).length}*
• Referral Codes: *${Object.keys(referralStorage).length}*
• User Points: *${Object.keys(userPoints).length}*
• User Transactions: *${Object.keys(userTransactions).length}*

🔄 *Bot Status:*
• Uptime: *${process.uptime().toFixed(0)}s*
• Memory: *${(process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2)} MB*
• Platform: *Node.js ${process.version}*\
    `;
    
    ctx.reply(adminMessage, { parse_mode: 'Markdown' });
});

// ==================== CALLBACK QUERIES - ENHANCED WITH POINTS ====================

bot.on('callback_query', async (ctx) => {
    const callbackData = ctx.callbackQuery.data;
    const userId = ctx.from.id.toString();
    const userName = ctx.from.first_name || 'User';
    const botUsername = ctx.botInfo.username;
    
    try {
        switch (callbackData) {
            case 'check_wallet':
                const userTotalPoints = getUserPoints(userId);
                const walletSessionId = generateSessionId(userId);
                await ctx.editMessageText(`💰 *Your Wallet*\n\n*Balance:* ${userTotalPoints} points\n*Value:* $${(userTotalPoints / 1000).toFixed(2)}\n\n*Next Goal:* ${userTotalPoints >= 1000 ? 'Redeem Reward! 🎉' : `${1000 - userTotalPoints} points to redeem`}`, {
                    parse_mode: 'Markdown',
                    reply_markup: {
                        inline_keyboard: [
                            [
                                { text: '📊 View Details', web_app: { url: `${WEB_APP_URL}#earnings&session=${walletSessionId}` } }
                            ],
                            [
                                { text: '🎬 Earn More', web_app: { url: `${WEB_APP_URL}?session=${walletSessionId}` } },
                                { text: '💰 Redeem', web_app: { url: `${WEB_APP_URL}#rewards&session=${walletSessionId}` } }
                            ],
                            [
                                { text: '🔄 Refresh', callback_data: 'check_wallet' },
                                { text: '🔙 Back to Menu', callback_data: 'back_to_main' }
                            ]
                        ]
                    }
                });
                break;
                
            // ... (previous callback cases remain same, just using enhanced points system)
            
            default:
                await ctx.answerCbQuery('⚠️ Unknown action');
                break;
        }
        await ctx.answerCbQuery();
    } catch (error) {
        console.error('Callback error:', error);
        await ctx.answerCbQuery('❌ Error processing request');
    }
});

// ==================== ENHANCED TEXT MESSAGE HANDLING ====================

bot.on('text', (ctx) => {
    const messageText = ctx.message.text.toLowerCase().trim();
    if (messageText.startsWith('/')) return;
    
    // ✅ NEW: Points update from web app handle karo
    if (messageText.startsWith('POINTS_UPDATE:')) {
        try {
            const pointsData = JSON.parse(messageText.replace('POINTS_UPDATE:', ''));
            const userId = ctx.from.id.toString();
            
            const result = handlePointsUpdateFromWebApp(userId, pointsData);
            
            if (result) {
                console.log(`✅ Points updated via message: User ${userId} | +${pointsData.points}`);
                // No reply - silent update
            }
        } catch (error) {
            console.log('❌ Error processing points update message:', error);
        }
        return;
    }
    
    // ... (rest of text handling remains same)
});

// ==================== BOT STARTUP ====================

const connectBot = (retryCount = 0) => {
    const maxRetries = 5;
    const retryDelays = [5000, 10000, 15000, 20000, 30000];
    
    console.log(`🚀 Attempting to start bot (Attempt ${retryCount + 1}/${maxRetries})...`);
    
    bot.launch().then(() => {
        console.log('✅ Bot successfully connected to Telegram!');
        console.log('🤖 Bot is now online and listening for messages...');
        console.log('🌐 Web App URL:', WEB_APP_URL);
        console.log('💰 Enhanced Points System: ✅ ACTIVE');
        console.log('👥 Referral System: ✅ ACTIVE');
        console.log('💾 Persistent Storage: ✅ ACTIVE');
        
        // Storage statistics
        console.log('📊 Storage Loaded:');
        console.log(`   - Users: ${Object.keys(userSessions).length}`);
        console.log(`   - Points Records: ${Object.keys(userPoints).length}`);
        console.log(`   - Referrals: ${Object.keys(referralStorage).length}`);
        console.log(`   - Transactions: ${Object.keys(userTransactions).length}`);
        
        setupWebApp();
        
    }).catch((error) => {
        console.log(`❌ Connection attempt ${retryCount + 1}/${maxRetries} failed:`, error.message);
        if (retryCount < maxRetries - 1) {
            const delay = retryDelays[retryCount];
            console.log(`🔄 Retrying in ${delay/1000} seconds...`);
            setTimeout(() => connectBot(retryCount + 1), delay);
        } else {
            console.log('💡 MAXIMUM RETRIES REACHED');
            console.log('💡 Troubleshooting tips:');
            console.log('💡 1. Check your BOT_TOKEN in .env file');
            console.log('💡 2. Verify internet connection');
            console.log('💡 3. Check if bot is banned');
            console.log('💡 4. Try different network/VPN');
            process.exit(1);
        }
    });
};

// Start the bot
connectBot();

// Keep alive monitoring with enhanced logging
setInterval(() => {
    const now = new Date().toLocaleTimeString();
    const activeUsers = Object.values(userSessions).filter(s => Date.now() - s.lastActive < 24 * 60 * 60 * 1000).length;
    const totalPoints = Object.values(userPoints).reduce((sum, points) => sum + points, 0);
    const usersWithPoints = Object.values(userPoints).filter(points => points > 0).length;
    
    console.log(`⏰ [${now}] Bot running - Users: ${Object.keys(userSessions).length}, Active: ${activeUsers}, With Points: ${usersWithPoints}, Total Points: ${totalPoints}`);
}, 60000);

// Clean up old sessions (24 hours)
setInterval(() => {
    const now = Date.now();
    const twentyFourHours = 24 * 60 * 60 * 1000;
    let cleanedCount = 0;
    
    Object.keys(userSessions).forEach(userId => {
        if (now - userSessions[userId].lastActive > twentyFourHours) {
            delete userSessions[userId];
            cleanedCount++;
        }
    });
    
    if (cleanedCount > 0) {
        console.log(`🧹 Cleaned ${cleanedCount} inactive sessions`);
        saveUserSessions();
    }
}, 60 * 60 * 1000); // Run every hour

// Graceful shutdown
const gracefulShutdown = (signal) => {
    console.log(`\n${signal} received, shutting down gracefully...`);
    console.log(`💾 Saving data...`);
    
    try {
        // Save all data before shutdown
        saveUserPoints();
        saveReferralStorage();
        saveUserSessions();
        saveUserTransactions();
        
        bot.stop(signal);
        console.log('✅ Bot stopped gracefully');
        console.log('📊 Final Stats:');
        console.log(`   - Total Users: ${Object.keys(userSessions).length}`);
        console.log(`   - Total Referrals: ${Object.keys(referralStorage).length}`);
        console.log(`   - Active Referrals: ${Object.values(referralStorage).filter(ref => !ref.bonusGiven).length}`);
        console.log(`   - Total Points Distributed: ${Object.values(userPoints).reduce((sum, points) => sum + points, 0)}`);
        process.exit(0);
    } catch (error) {
        console.error('❌ Error during shutdown:', error);
        process.exit(1);
    }
};

process.once('SIGINT', () => gracefulShutdown('SIGINT'));
process.once('SIGTERM', () => gracefulShutdown('SIGTERM'));

process.on('uncaughtException', (error) => {
    console.error('❌ Uncaught Exception:', error);
});

process.on('unhandledRejection', (reason, promise) => {
    console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
});

module.exports = bot;

console.log(`\
🎉 BOT STARTED WITH ENHANCED POINTS SYSTEM!
🔗 Web App: ${WEB_APP_URL}
💰 Points System: ✅ ACTIVE  
👥 Referral System: ✅ ACTIVE
🆕 Fresh Accounts: ✅ ACTIVE  
📊 Transaction History: ✅ ACTIVE
💾 Persistent Storage: ✅ ACTIVE

📋 Available Commands:
/start - Main menu
/earn - Start earning
/refer - Invite friends  
/fresh - Fresh start
/wallet - Check balance (with history)
/stats - Detailed statistics
/search - Video search
/help - Help guide
/admin - Admin stats (admin only)

🚀 Key Features:
• Points persist after app close
• Real-time points synchronization  
• Transaction history tracking
• Referral bonus system
• Welcome bonus for new users
• Persistent storage across restarts

🤖 Bot is ready to use!\
`);
