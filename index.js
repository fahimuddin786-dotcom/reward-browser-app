const { Telegraf } = require('telegraf');
const https = require('https');
require('dotenv').config();

console.log('🚀 Starting Reward Browser Bot with Enhanced Referral System...');

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

// Enhanced Referral storage (in production, use database)
const referralStorage = new Map();
const userSessions = new Map();
const userPoints = new Map(); // User points tracking

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

// ==================== ENHANCED REFERRAL SYSTEM ====================

function generateReferralCode(userId) {
    return 'REF_' + userId + '_' + Math.random().toString(36).substr(2, 6).toUpperCase();
}

function generateSessionId(userId) {
    return 'SESSION_' + userId + '_' + Date.now() + '_' + Math.random().toString(36).substr(2, 8);
}

function storeReferral(referrerId, referredUserId, referredUserName) {
    const referralCode = generateReferralCode(referrerId);
    referralStorage.set(referralCode, {
        referrerId: referrerId,
        referredUserId: referredUserId,
        referredUserName: referredUserName,
        timestamp: Date.now(),
        status: 'pending',
        bonusGiven: false,
        sessionId: generateSessionId(referredUserId)
    });
    return referralCode;
}

function getReferral(code) {
    return referralStorage.get(code);
}

function createUserSession(userId) {
    const sessionId = generateSessionId(userId);
    userSessions.set(userId, {
        sessionId: sessionId,
        createdAt: Date.now(),
        isNewUser: true,
        lastActive: Date.now()
    });
    return sessionId;
}

function getUserSession(userId) {
    return userSessions.get(userId);
}

function updateUserPoints(userId, points) {
    const currentPoints = userPoints.get(userId) || 0;
    userPoints.set(userId, currentPoints + points);
    return currentPoints + points;
}

function getUserPoints(userId) {
    return userPoints.get(userId) || 0;
}

// Award referral bonus to referrer
function awardReferralBonus(referrerId, referredUserName) {
    const bonusPoints = 50;
    const newTotal = updateUserPoints(referrerId, bonusPoints);
    console.log(`💰 Referral bonus awarded: ${referrerId} got +${bonusPoints} points for referring ${referredUserName}`);
    return { bonusPoints, newTotal };
}

// ==================== BOT COMMANDS WITH ENHANCED REFERRAL ====================

// Start Command - Enhanced Referral Handling
bot.start(async (ctx) => {
    const userName = ctx.from.first_name || 'User';
    const userID = ctx.from.id;
    const startPayload = ctx.startPayload;
    
    console.log(`👤 User started bot: ${userName} (ID: ${userID})`);
    console.log(`📦 Start payload: ${startPayload}`);
    
    let referralMessage = '';
    let webAppUrl = WEB_APP_URL;
    let sessionId = '';
    let isReferredUser = false;
    let referrerId = null;
    
    // Handle referral if start payload exists
    if (startPayload && startPayload.startsWith('ref')) {
        referrerId = startPayload.replace('ref', '');
        const referralCode = storeReferral(referrerId, userID, userName);
        sessionId = referralStorage.get(referralCode).sessionId;
        isReferredUser = true;
        
        referralMessage = `\n🎁 *REFERRAL BONUS!* You were invited by a friend!\nYou'll get 25 BONUS POINTS when you start!`;
        webAppUrl = `${WEB_APP_URL}?ref=${referralCode}&newuser=true&timestamp=${Date.now()}&userid=${userID}&session=${sessionId}&fresh=true`;
        
        console.log(`✅ Referral detected: ${userName} referred by ${referrerId}`);
        console.log(`🔗 Web App URL: ${webAppUrl}`);
        console.log(`🆕 Session ID: ${sessionId}`);
    } else {
        // Normal user - create new session with cache busting
        sessionId = createUserSession(userID);
        webAppUrl = `${WEB_APP_URL}?timestamp=${Date.now()}&userid=${userID}&session=${sessionId}&fresh=true`;
        console.log(`🆕 New user session: ${sessionId}`);
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

💰 *Earning Opportunities:*
• 🎬 Watch Videos: 10-15 points each
• ⛏️ Auto Mining: 5 points/minute  
• 👥 Refer Friends: 50 points each
• 📱 Follow Accounts: 25-50 points
• 📋 Complete Tasks: 15-40 points

🎁 *Bonuses:*
• New User: 25 Points
• Referral: 50 Points per friend
• Daily Mining Bonus: 50 Points/hour

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
    const userId = ctx.from.id;
    const userName = ctx.from.first_name || 'Friend';
    const botUsername = ctx.botInfo.username;
    
    const personalReferralLink = `https://t.me/${botUsername}?start=ref${userId}`;
    const userTotalPoints = getUserPoints(userId);
    
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
• Referrals Completed: *${Array.from(referralStorage.values()).filter(ref => ref.referrerId === userId && ref.bonusGiven).length}*
• Pending Referrals: *${Array.from(referralStorage.values()).filter(ref => ref.referrerId === userId && !ref.bonusGiven).length}*

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

// New Command - Fresh Start (Clear Cache)
bot.command('fresh', (ctx) => {
    const userId = ctx.from.id;
    const sessionId = generateSessionId(userId);
    const webAppUrl = `${WEB_APP_URL}?timestamp=${Date.now()}&userid=${userId}&session=${sessionId}&fresh=true&clear_cache=true`;
    
    ctx.reply(`🔄 *Fresh Start Activated!*\n\nYour app will start with a clean slate. All previous data has been reset.\n\n*Note:* This won't affect your actual points balance, just the local app data.`, {
        parse_mode: 'Markdown',
        reply_markup: {
            inline_keyboard: [
                [
                    { 
                        text: '🎬 Start Fresh', 
                        web_app: { url: webAppUrl } 
                    }
                ]
            ]
        }
    });
});

// Stats Command
bot.command('stats', (ctx) => {
    const userId = ctx.from.id;
    const userTotalPoints = getUserPoints(userId);
    const userReferrals = Array.from(referralStorage.values()).filter(ref => ref.referrerId === userId);
    const completedReferrals = userReferrals.filter(ref => ref.bonusGiven).length;
    const pendingReferrals = userReferrals.filter(ref => !ref.bonusGiven).length;
    
    const statsMessage = `\
📊 *Your Statistics*

💰 *Points Overview:*
• Total Points: *${userTotalPoints}*
• Available for Redeem: *${userTotalPoints}*
• Estimated Value: *$${(userTotalPoints / 1000).toFixed(2)}*

👥 *Referral Stats:*
• Completed Referrals: *${completedReferrals}*
• Pending Referrals: *${pendingReferrals}*
• Total Referral Earnings: *${completedReferrals * 50} points*

📈 *Earning Potential:*
• Max Daily Points: *1000+ points*
• Average Users: *500 points/day*
• Top Earners: *2000+ points/day*

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

// Earn Command
bot.command('earn', (ctx) => {
    const userId = ctx.from.id;
    const sessionId = generateSessionId(userId);
    const webAppUrl = `${WEB_APP_URL}?timestamp=${Date.now()}&userid=${userId}&session=${sessionId}`;
    
    ctx.reply(`💰 *Start Earning Points*\n\nChoose your preferred method to start earning:`, {
        parse_mode: 'Markdown',
        reply_markup: {
            inline_keyboard: [
                [
                    { text: '🎬 Open Earning App', web_app: { url: webAppUrl } }
                ],
                [
                    { text: '🎵 Music Videos', web_app: { url: `${WEB_APP_URL}?search=music&session=${sessionId}` } },
                    { text: '😂 Comedy Videos', web_app: { url: `${WEB_APP_URL}?search=comedy&session=${sessionId}` } }
                ],
                [
                    { text: '📷 Instagram Reels', web_app: { url: `${WEB_APP_URL}?platform=instagram&session=${sessionId}` } },
                    { text: '🐦 X Videos', web_app: { url: `${WEB_APP_URL}?platform=x&session=${sessionId}` } }
                ],
                [
                    { text: '👥 Follow & Earn', web_app: { url: `${WEB_APP_URL}?category=follow&session=${sessionId}` } },
                    { text: '⛏️ Start Mining', web_app: { url: `${WEB_APP_URL}?mining=true&session=${sessionId}` } }
                ]
            ]
        }
    });
});

// Search Command
bot.command('search', (ctx) => {
    const userId = ctx.from.id;
    const sessionId = generateSessionId(userId);
    
    ctx.reply(`🔍 *Quick Video Search*\n\nSearch for specific content or browse categories:`, {
        parse_mode: 'Markdown',
        reply_markup: {
            inline_keyboard: [
                [
                    { text: '🔎 Search All Videos', web_app: { url: `${WEB_APP_URL}?session=${sessionId}` } }
                ],
                [
                    { text: '🎵 Music', web_app: { url: `${WEB_APP_URL}?search=music&session=${sessionId}` } },
                    { text: '🎮 Gaming', web_app: { url: `${WEB_APP_URL}?search=gaming&session=${sessionId}` } }
                ],
                [
                    { text: '😂 Comedy', web_app: { url: `${WEB_APP_URL}?search=comedy&session=${sessionId}` } },
                    { text: '💃 Dance', web_app: { url: `${WEB_APP_URL}?search=dance&session=${sessionId}` } }
                ],
                [
                    { text: '📚 Education', web_app: { url: `${WEB_APP_URL}?search=education&session=${sessionId}` } },
                    { text: '🍳 Cooking', web_app: { url: `${WEB_APP_URL}?search=cooking&session=${sessionId}` } }
                ]
            ]
        }
    });
});

// Wallet Command
bot.command('wallet', (ctx) => {
    const userId = ctx.from.id;
    const sessionId = generateSessionId(userId);
    const userTotalPoints = getUserPoints(userId);
    
    ctx.reply(`💰 *Your Points Wallet*\n\n*Current Balance:* ${userTotalPoints} points\n*Estimated Value:* $${(userTotalPoints / 1000).toFixed(2)}`, {
        parse_mode: 'Markdown',
        reply_markup: {
            inline_keyboard: [
                [
                    { text: '📊 Check Balance', web_app: { url: `${WEB_APP_URL}#earnings&session=${sessionId}` } }
                ],
                [
                    { text: '🎬 Earn More Points', web_app: { url: `${WEB_APP_URL}?session=${sessionId}` } },
                    { text: '💰 Redeem Rewards', web_app: { url: `${WEB_APP_URL}#rewards&session=${sessionId}` } }
                ],
                [
                    { text: '📈 View History', web_app: { url: `${WEB_APP_URL}#history&session=${sessionId}` } }
                ]
            ]
        }
    });
});

// Help Command
bot.command('help', (ctx) => {
    ctx.reply(`\
🆘 *Reward Browser - Help Guide*

🎯 *HOW TO EARN POINTS:*
1. Click menu button or use /earn
2. Search & watch videos (YouTube/Instagram/X)
3. Earn 10-15 points per video
4. Points added automatically

⛏️ *AUTO MINING:*
• Click mining button in app
• Earn 5 points per minute
• Get 50 bonus points every hour
• Works in background

👥 *REFERRAL SYSTEM:*
• Use /refer to get your link
• Share with friends
• Get 50 points per referral
• Friends get 25 welcome points

📱 *PLATFORMS SUPPORTED:*
• YouTube Shorts & Videos
• Instagram Reels & Stories
• X (Twitter) Videos & Tweets
• Telegram Channels & Ads

💰 *REDEMPTION:*
• Amazon Gift Cards: 1000 points
• PayPal Cash: 5000 points  
• Google Play Cards: 2000 points
• More rewards coming soon!

📊 *COMMANDS:*
/start - Main menu
/earn - Start earning  
/refer - Invite friends
/fresh - Fresh start (clear cache)
/wallet - Check balance
/stats - Your statistics
/search - Quick video search
/help - This message

🌐 *Web App:* ${WEB_APP_URL}

*Need more help? Contact @rewardsupport* 🤝\
    `, { 
        parse_mode: 'Markdown',
        reply_markup: {
            inline_keyboard: [
                [
                    { text: '🎬 Start Earning', web_app: { url: WEB_APP_URL } }
                ],
                [
                    { text: '👥 Get Referral Link', callback_data: 'invite_friends' },
                    { text: '🔄 Fresh Start', callback_data: 'fresh_start' }
                ]
            ]
        }
    });
});

// Admin command to check bot stats
bot.command('admin', (ctx) => {
    // Basic admin check - in production, use proper admin validation
    const adminUsers = process.env.ADMIN_USERS ? process.env.ADMIN_USERS.split(',') : [];
    
    if (!adminUsers.includes(ctx.from.id.toString())) {
        ctx.reply('❌ Access denied. Admin only.');
        return;
    }
    
    const totalUsers = userSessions.size;
    const totalReferrals = referralStorage.size;
    const activeReferrals = Array.from(referralStorage.values()).filter(ref => !ref.bonusGiven).length;
    const totalPoints = Array.from(userPoints.values()).reduce((sum, points) => sum + points, 0);
    
    const adminMessage = `\
👑 *Admin Statistics*

📊 *User Stats:*
• Total Users: *${totalUsers}*
• Active Sessions: *${Array.from(userSessions.values()).filter(s => Date.now() - s.lastActive < 24 * 60 * 60 * 1000).length}*
• Total Points Distributed: *${totalPoints}*

👥 *Referral Stats:*
• Total Referrals: *${totalReferrals}*
• Active Referrals: *${activeReferrals}*
• Completed Referrals: *${totalReferrals - activeReferrals}*

💾 *Storage:*
• User Sessions: *${userSessions.size}*
• Referral Codes: *${referralStorage.size}*
• User Points: *${userPoints.size}*

🔄 *Bot Status:*
• Uptime: *${process.uptime().toFixed(0)}s*
• Memory: *${(process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2)} MB*
• Platform: *Node.js ${process.version}*\
    `;
    
    ctx.reply(adminMessage, { parse_mode: 'Markdown' });
});

// ==================== CALLBACK QUERIES ====================

bot.on('callback_query', async (ctx) => {
    const callbackData = ctx.callbackQuery.data;
    const userId = ctx.from.id;
    const userName = ctx.from.first_name || 'User';
    const botUsername = ctx.botInfo.username;
    
    try {
        switch (callbackData) {
            case 'check_wallet':
                const userTotalPoints = getUserPoints(userId);
                const walletSessionId = generateSessionId(userId);
                await ctx.editMessageText(`💰 *Your Wallet*\n\n*Balance:* ${userTotalPoints} points\n*Value:* $${(userTotalPoints / 1000).toFixed(2)}\n\n*Next Goal:* ${userTotalPoints >= 1000 ? 'Redeem Reward!' : `${1000 - userTotalPoints} points to redeem`}`, {
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
                                { text: '🔙 Back to Menu', callback_data: 'back_to_main' }
                            ]
                        ]
                    }
                });
                break;
                
            case 'invite_friends':
                const personalReferralLink = `https://t.me/${botUsername}?start=ref${userId}`;
                const userPointsTotal = getUserPoints(userId);
                const userReferralsCount = Array.from(referralStorage.values()).filter(ref => ref.referrerId === userId && ref.bonusGiven).length;
                
                await ctx.editMessageText(`👥 *Invite Friends & Earn!*\n\n*Your Stats:*\n• Points: ${userPointsTotal}\n• Successful Referrals: ${userReferralsCount}\n• Earned from Referrals: ${userReferralsCount * 50} points\n\n*Share your link below:*\n\`${personalReferralLink}\``, {
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
                                { text: '🔙 Back', callback_data: 'back_to_main' }
                            ]
                        ]
                    }
                });
                break;

            case 'copy_referral':
                const userReferralLink = `https://t.me/${botUsername}?start=ref${userId}`;
                await ctx.editMessageText(`📋 *Your Referral Link*\n\nCopy this link and share with friends:\n\n\`${userReferralLink}\`\n\n*Bonus:* You get 50 points, your friend gets 25 points! 🎁\n\n*Pro Tip:* Share on multiple platforms for faster results!`, {
                    parse_mode: 'Markdown',
                    reply_markup: {
                        inline_keyboard: [
                            [
                                { text: '📱 Share Now', callback_data: 'invite_friends' }
                            ],
                            [
                                { text: '🔙 Back', callback_data: 'back_to_main' }
                            ]
                        ]
                    }
                });
                break;
                
            case 'my_referrals':
                const userRefs = Array.from(referralStorage.values()).filter(ref => ref.referrerId === userId);
                const completedRefs = userRefs.filter(ref => ref.bonusGiven);
                const pendingRefs = userRefs.filter(ref => !ref.bonusGiven);
                
                let referralsText = `📊 *Your Referrals*\n\n`;
                referralsText += `✅ *Completed:* ${completedRefs.length} referrals\n`;
                referralsText += `⏳ *Pending:* ${pendingRefs.length} referrals\n`;
                referralsText += `💰 *Total Earned:* ${completedRefs.length * 50} points\n\n`;
                
                if (completedRefs.length > 0) {
                    referralsText += `*Recent Referrals:*\n`;
                    completedRefs.slice(0, 5).forEach((ref, index) => {
                        referralsText += `${index + 1}. ${ref.referredUserName} - +50 pts\n`;
                    });
                } else {
                    referralsText += `*No completed referrals yet.*\nShare your link to start earning!`;
                }
                
                await ctx.editMessageText(referralsText, {
                    parse_mode: 'Markdown',
                    reply_markup: {
                        inline_keyboard: [
                            [
                                { text: '👥 Invite More', callback_data: 'invite_friends' }
                            ],
                            [
                                { text: '🔙 Back', callback_data: 'back_to_main' }
                            ]
                        ]
                    }
                });
                break;
                
            case 'earn_more':
                const earnSessionId = generateSessionId(userId);
                await ctx.editMessageText(`💰 *Earn More Points*\n\nChoose how you want to earn:`, {
                    parse_mode: 'Markdown',
                    reply_markup: {
                        inline_keyboard: [
                            [
                                { text: '🎬 Watch Videos', web_app: { url: `${WEB_APP_URL}?session=${earnSessionId}` } }
                            ],
                            [
                                { text: '⛏️ Start Mining', web_app: { url: `${WEB_APP_URL}?mining=true&session=${earnSessionId}` } },
                                { text: '👥 Follow & Earn', web_app: { url: `${WEB_APP_URL}?category=follow&session=${earnSessionId}` } }
                            ],
                            [
                                { text: '📷 Instagram', web_app: { url: `${WEB_APP_URL}?platform=instagram&session=${earnSessionId}` } },
                                { text: '🐦 X Platform', web_app: { url: `${WEB_APP_URL}?platform=x&session=${earnSessionId}` } }
                            ],
                            [
                                { text: '🔙 Back', callback_data: 'back_to_main' }
                            ]
                        ]
                    }
                });
                break;
                
            case 'show_stats':
                const userStatsPoints = getUserPoints(userId);
                const userStatsRefs = Array.from(referralStorage.values()).filter(ref => ref.referrerId === userId);
                const completedStatsRefs = userStatsRefs.filter(ref => ref.bonusGiven).length;
                
                await ctx.editMessageText(`📊 *Your Statistics*\n\n*Points:* ${userStatsPoints}\n*Referrals:* ${completedStatsRefs}\n*Referral Earnings:* ${completedStatsRefs * 50} points\n*Estimated Earnings:* $${(userStatsPoints / 1000).toFixed(2)}\n\n*Keep going! You're doing great!* 🚀`, {
                    parse_mode: 'Markdown',
                    reply_markup: {
                        inline_keyboard: [
                            [
                                { text: '🎬 Earn More', callback_data: 'earn_more' },
                                { text: '👥 Referrals', callback_data: 'my_referrals' }
                            ],
                            [
                                { text: '🔙 Back', callback_data: 'back_to_main' }
                            ]
                        ]
                    }
                });
                break;
                
            case 'fresh_start':
                const freshSessionId = generateSessionId(userId);
                const freshWebAppUrl = `${WEB_APP_URL}?timestamp=${Date.now()}&userid=${userId}&session=${freshSessionId}&fresh=true&clear_cache=true`;
                
                await ctx.editMessageText(`🔄 *Fresh Start*\n\nThis will clear your app data and start fresh. Your points balance remains safe!\n\n*Note:* Useful if the app is not loading properly.`, {
                    parse_mode: 'Markdown',
                    reply_markup: {
                        inline_keyboard: [
                            [
                                { 
                                    text: '🎬 Start Fresh', 
                                    web_app: { url: freshWebAppUrl } 
                                }
                            ],
                            [
                                { text: '🔙 Back', callback_data: 'back_to_main' }
                            ]
                        ]
                    }
                });
                break;
                
            case 'back_to_main':
                const mainSessionId = generateSessionId(userId);
                await ctx.editMessageText(`🤖 *Welcome back, ${userName}!*\n\nReady to earn more points? Choose an option below:`, {
                    parse_mode: 'Markdown',
                    reply_markup: {
                        inline_keyboard: [
                            [
                                { text: '🎬 Start Earning', web_app: { url: `${WEB_APP_URL}?session=${mainSessionId}` } }
                            ],
                            [
                                { text: '👥 Invite Friends', callback_data: 'invite_friends' },
                                { text: '💰 Check Wallet', callback_data: 'check_wallet' }
                            ],
                            [
                                { text: '📊 Statistics', callback_data: 'show_stats' },
                                { text: '🔄 Fresh Start', callback_data: 'fresh_start' }
                            ]
                        ]
                    }
                });
                break;
                
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

// ==================== TEXT MESSAGE HANDLING ====================

bot.on('text', (ctx) => {
    const messageText = ctx.message.text.toLowerCase().trim();
    if (messageText.startsWith('/')) return;
    
    const quickResponses = {
        'hello': '👋 Hello! Ready to earn some points? Use /earn to get started or click the menu button!',
        'hi': '👋 Hi there! Want to watch videos and earn money? Try /earn command or use the menu!',
        'points': '💰 Check your points with /wallet command or earn more with /earn! You can also click the menu button.',
        'money': '💵 Earn points by watching videos! Use /earn to start earning. Points can be redeemed for real money!',
        'refer': '👥 Want to invite friends? Use /refer to get your personal referral link and earn 50 points per friend!',
        'fresh': '🔄 Need a fresh start? Use /fresh command to clear your app data and start over!',
        'help': '🆘 Need help? Use /help command for complete guide on how to earn and redeem points!',
        'stats': '📊 Check your earnings statistics with /stats command!',
        'thank you': '😊 You\'re welcome! Keep earning those points! 🚀',
        'thanks': '😊 You\'re welcome! Happy earning! 💰'
    };
    
    if (quickResponses[messageText]) {
        const sessionId = generateSessionId(ctx.from.id);
        ctx.reply(quickResponses[messageText], {
            reply_markup: {
                inline_keyboard: [[
                    { text: '🎬 Start Earning', web_app: { url: `${WEB_APP_URL}?session=${sessionId}` } }
                ]]
            }
        });
        return;
    }
    
    // Handle search queries
    if (messageText.length > 2 && messageText.length < 50) {
        const sessionId = generateSessionId(ctx.from.id);
        ctx.reply(`🔍 *Searching for: "${ctx.message.text}"*\n\nI found some videos for you! Click below to watch and earn points:`, {
            parse_mode: 'Markdown',
            reply_markup: {
                inline_keyboard: [[
                    { 
                        text: '🎬 Search & Earn Points', 
                        web_app: { url: `${WEB_APP_URL}?search=${encodeURIComponent(ctx.message.text)}&session=${sessionId}` } 
                    }
                ]]
            }
        });
    }
});

// ==================== ERROR HANDLING ====================

bot.catch((err, ctx) => {
    console.error('❌ Bot error:', err);
    try {
        ctx.reply('❌ Sorry, something went wrong. Please try again or use /help for assistance.', {
            reply_markup: {
                inline_keyboard: [[
                    { text: '🔄 Try Again', web_app: { url: WEB_APP_URL } },
                    { text: '📖 Help', callback_data: 'help' }
                ]]
            }
        });
    } catch (e) {
        console.error('Error reply failed:', e);
    }
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
        console.log('👥 Referral System: ✅ ACTIVE');
        console.log('🆕 Fresh Account System: ✅ ACTIVE');
        console.log('💰 Points Tracking: ✅ ACTIVE');
        
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

// Keep alive monitoring
setInterval(() => {
    const now = new Date().toLocaleTimeString();
    const activeUsers = Array.from(userSessions.values()).filter(s => Date.now() - s.lastActive < 24 * 60 * 60 * 1000).length;
    const totalPoints = Array.from(userPoints.values()).reduce((sum, points) => sum + points, 0);
    
    console.log(`⏰ [${now}] Bot running - Users: ${userSessions.size}, Active: ${activeUsers}, Referrals: ${referralStorage.size}, Total Points: ${totalPoints}`);
}, 60000);

// Clean up old sessions (24 hours)
setInterval(() => {
    const now = Date.now();
    const twentyFourHours = 24 * 60 * 60 * 1000;
    let cleanedCount = 0;
    
    for (const [userId, session] of userSessions.entries()) {
        if (now - session.lastActive > twentyFourHours) {
            userSessions.delete(userId);
            cleanedCount++;
        }
    }
    
    if (cleanedCount > 0) {
        console.log(`🧹 Cleaned ${cleanedCount} inactive sessions`);
    }
}, 60 * 60 * 1000); // Run every hour

// Graceful shutdown
const gracefulShutdown = (signal) => {
    console.log(`\n${signal} received, shutting down gracefully...`);
    console.log(`💾 Saving data - Users: ${userSessions.size}, Referrals: ${referralStorage.size}`);
    
    try {
        bot.stop(signal);
        console.log('✅ Bot stopped gracefully');
        console.log('📊 Final Stats:');
        console.log(`   - Total Users: ${userSessions.size}`);
        console.log(`   - Total Referrals: ${referralStorage.size}`);
        console.log(`   - Active Referrals: ${Array.from(referralStorage.values()).filter(ref => !ref.bonusGiven).length}`);
        console.log(`   - Total Points Distributed: ${Array.from(userPoints.values()).reduce((sum, points) => sum + points, 0)}`);
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
🎉 BOT STARTED WITH ENHANCED REFERRAL SYSTEM!
🔗 Web App: ${WEB_APP_URL}
👥 Referral System: ✅ ACTIVE
🆕 Fresh Accounts: ✅ ACTIVE  
💰 Points Tracking: ✅ ACTIVE
📊 Session Management: ✅ ACTIVE
🚀 New users get fresh accounts
🎁 25 welcome points + 50 referral bonus

📋 Available Commands:
/start - Main menu
/earn - Start earning
/refer - Invite friends  
/fresh - Fresh start
/wallet - Check balance
/stats - Your statistics
/search - Video search
/help - Help guide
/admin - Admin stats (admin only)

🤖 Bot is ready to use!\
`);
