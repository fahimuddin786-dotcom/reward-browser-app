const { Telegraf } = require('telegraf');
const https = require('https');
require('dotenv').config();

console.log('🚀 Starting Reward Browser Bot with Fixed Referral System...');

// IPv4 force karne ke liye custom agent
const agent = new https.Agent({
    family: 4,
    keepAlive: true
});

// Web App URL
const WEB_APP_URL = 'https://reward-browser-app.vercel.app/';

const bot = new Telegraf(process.env.BOT_TOKEN, {
    telegram: {
        apiRoot: 'https://api.telegram.org',
        agent: agent,
        retryAfter: 1
    }
});

// Referral storage (in production, use database)
const referralStorage = new Map();

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

// ==================== REFERRAL SYSTEM FUNCTIONS ====================

function generateReferralCode(userId) {
    return 'REF_' + userId + '_' + Math.random().toString(36).substr(2, 6).toUpperCase();
}

function storeReferral(referrerId, referredUserId, referredUserName) {
    const referralCode = generateReferralCode(referrerId);
    referralStorage.set(referralCode, {
        referrerId: referrerId,
        referredUserId: referredUserId,
        referredUserName: referredUserName,
        timestamp: Date.now(),
        status: 'pending',
        bonusGiven: false
    });
    return referralCode;
}

function getReferral(code) {
    return referralStorage.get(code);
}

// ==================== BOT COMMANDS WITH FIXED REFERRAL ====================

// Start Command - Fixed Referral Handling
bot.start((ctx) => {
    const userName = ctx.from.first_name;
    const userID = ctx.from.id;
    const startPayload = ctx.startPayload;
    
    console.log(`👤 User started bot: ${userName} (ID: ${userID})`);
    console.log(`📦 Start payload: ${startPayload}`);
    
    let referralMessage = '';
    let webAppUrl = WEB_APP_URL;
    
    // Handle referral if start payload exists
    if (startPayload && startPayload.startsWith('ref')) {
        const referrerId = startPayload.replace('ref', '');
        const referralCode = storeReferral(referrerId, userID, userName);
        
        referralMessage = `\n🎁 *REFERRAL BONUS!* You were invited by a friend!\nYou'll get 25 BONUS POINTS when you start!`;
        webAppUrl = `${WEB_APP_URL}?ref=${referralCode}&newuser=true&timestamp=${Date.now()}&userid=${userID}`;
        
        console.log(`✅ Referral detected: ${userName} referred by ${referrerId}`);
        console.log(`🔗 Web App URL: ${webAppUrl}`);
    } else {
        // Normal user - add cache busting
        webAppUrl = `${WEB_APP_URL}?timestamp=${Date.now()}&userid=${userID}`;
    }
    
    ctx.reply(`\
🤖 *Welcome ${userName}!* ${referralMessage}

🎯 *Reward Browser - Watch Videos & Earn Money!*

✨ *Get Started:*
1. Click "OPEN EARNING APP" below
2. Watch YouTube videos
3. Earn points automatically
4. Redeem rewards!

💰 *New User Bonus:* 25 Points
👥 *Referral Bonus:* 50 Points per friend

Click the button to start earning! 🚀\
    `, { 
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
                ]
            ]
        }
    });
});

// Refer Command - Personal Referral Links
bot.command('refer', (ctx) => {
    const userId = ctx.from.id;
    const userName = ctx.from.first_name;
    const botUsername = ctx.botInfo.username;
    
    const personalReferralLink = `https://t.me/${botUsername}?start=ref${userId}`;
    
    ctx.reply(`\
👥 *Invite Friends & Earn 50 Points!*

🎁 *HOW IT WORKS:*
• Share your personal referral link
• Friends join using YOUR link  
• You get *50 BONUS POINTS* 
• Your friend gets *25 WELCOME POINTS*

🔗 *YOUR REFERRAL LINK:*
\`${personalReferralLink}\`

📤 *QUICK SHARE OPTIONS:*\
    `, {
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
                ]
            ]
        }
    });
});

// Earn Command
bot.command('earn', (ctx) => {
    const userId = ctx.from.id;
    const webAppUrl = `${WEB_APP_URL}?timestamp=${Date.now()}&userid=${userId}`;
    
    ctx.reply(`💰 *Start Earning Points*`, {
        parse_mode: 'Markdown',
        reply_markup: {
            inline_keyboard: [
                [
                    { text: '🎬 Open Earning App', web_app: { url: webAppUrl } }
                ],
                [
                    { text: '🎵 Music Videos', web_app: { url: `${WEB_APP_URL}?search=music` } },
                    { text: '😂 Comedy Videos', web_app: { url: `${WEB_APP_URL}?search=comedy` } }
                ]
            ]
        }
    });
});

// Search Command
bot.command('search', (ctx) => {
    ctx.reply(`🔍 *Quick Video Search*`, {
        parse_mode: 'Markdown',
        reply_markup: {
            inline_keyboard: [
                [
                    { text: '🔎 Search All Videos', web_app: { url: WEB_APP_URL } }
                ],
                [
                    { text: '🎵 Music', web_app: { url: `${WEB_APP_URL}?search=music` } },
                    { text: '🎮 Gaming', web_app: { url: `${WEB_APP_URL}?search=gaming` } }
                ]
            ]
        }
    });
});

// Wallet Command
bot.command('wallet', (ctx) => {
    ctx.reply(`💰 *Your Points Wallet*`, {
        parse_mode: 'Markdown',
        reply_markup: {
            inline_keyboard: [
                [
                    { text: '📊 Check Balance', web_app: { url: `${WEB_APP_URL}#earnings` } }
                ],
                [
                    { text: '🎬 Earn More Points', web_app: { url: WEB_APP_URL } }
                ]
            ]
        }
    });
});

// Help Command
bot.command('help', (ctx) => {
    ctx.reply(`\
🆘 *Reward Browser - Help Guide*

🎯 *HOW TO EARN:*
1. Click menu button or use /earn
2. Search & watch videos
3. Earn points automatically

👥 *REFERRAL SYSTEM:*
• Use /refer to get your link
• Share with friends
• Get 50 points per referral
• Friends get 25 welcome points

📱 *COMMANDS:*
/start - Main menu
/earn - Start earning  
/refer - Invite friends
/wallet - Check balance
/help - This message

🌐 *Web App:* ${WEB_APP_URL}\
    `, { 
        parse_mode: 'Markdown',
        reply_markup: {
            inline_keyboard: [
                [
                    { text: '🎬 Start Earning', web_app: { url: WEB_APP_URL } }
                ]
            ]
        }
    });
});

// ==================== CALLBACK QUERIES ====================

bot.on('callback_query', async (ctx) => {
    const callbackData = ctx.callbackQuery.data;
    const userId = ctx.from.id;
    const botUsername = ctx.botInfo.username;
    
    try {
        switch (callbackData) {
            case 'check_wallet':
                await ctx.editMessageText(`💰 *Check Your Wallet*`, {
                    parse_mode: 'Markdown',
                    reply_markup: {
                        inline_keyboard: [
                            [
                                { text: '📊 View Balance', web_app: { url: `${WEB_APP_URL}#earnings` } }
                            ],
                            [
                                { text: '🎬 Earn More', web_app: { url: WEB_APP_URL } }
                            ]
                        ]
                    }
                });
                break;
                
            case 'invite_friends':
                const personalReferralLink = `https://t.me/${botUsername}?start=ref${userId}`;
                
                await ctx.editMessageText(`👥 *Invite Friends & Earn!*`, {
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
                                { text: '🔙 Back', callback_data: 'back_to_main' }
                            ]
                        ]
                    }
                });
                break;

            case 'copy_referral':
                const userReferralLink = `https://t.me/${botUsername}?start=ref${userId}`;
                await ctx.editMessageText(`📋 *Your Referral Link*\\n\\nCopy this link and share with friends:\\n\\n\`${userReferralLink}\`\\n\\n*Bonus:* You get 50 points, your friend gets 25 points! 🎁`, {
                    parse_mode: 'Markdown'
                });
                break;
                
            case 'back_to_main':
                await ctx.editMessageText(`🤖 *Welcome back!*\\n\\nReady to earn more points?`, {
                    parse_mode: 'Markdown',
                    reply_markup: {
                        inline_keyboard: [
                            [
                                { text: '🎬 Start Earning', web_app: { url: WEB_APP_URL } }
                            ],
                            [
                                { text: '👥 Invite Friends', callback_data: 'invite_friends' }
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
        'hello': '👋 Hello! Ready to earn some points? Use /earn to get started!',
        'hi': '👋 Hi there! Want to watch videos and earn money? Try /earn command!',
        'points': '💰 Check your points with /wallet command or earn more with /earn!',
        'money': '💵 Earn points by watching videos! Use /earn to start earning.',
        'refer': '👥 Want to invite friends? Use /refer to get your personal referral link and earn 50 points per friend!',
    };
    
    if (quickResponses[messageText]) {
        ctx.reply(quickResponses[messageText], {
            reply_markup: {
                inline_keyboard: [[
                    { text: '🎬 Start Earning', web_app: { url: WEB_APP_URL } }
                ]]
            }
        });
        return;
    }
    
    if (messageText.length > 2 && messageText.length < 50) {
        ctx.reply(`🔍 *Searching for: "${ctx.message.text}"*`, {
            parse_mode: 'Markdown',
            reply_markup: {
                inline_keyboard: [[
                    { 
                        text: '🎬 Search & Earn Points', 
                        web_app: { url: `${WEB_APP_URL}?search=${encodeURIComponent(ctx.message.text)}` } 
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
        ctx.reply('❌ Sorry, something went wrong. Please try again.', {
            reply_markup: {
                inline_keyboard: [[
                    { text: '🔄 Try Again', web_app: { url: WEB_APP_URL } }
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
        
        setupWebApp();
        
    }).catch((error) => {
        console.log(`❌ Connection attempt ${retryCount + 1}/${maxRetries} failed:`, error.message);
        if (retryCount < maxRetries - 1) {
            const delay = retryDelays[retryCount];
            console.log(`🔄 Retrying in ${delay/1000} seconds...`);
            setTimeout(() => connectBot(retryCount + 1), delay);
        } else {
            console.log('💡 MAXIMUM RETRIES REACHED');
            process.exit(1);
        }
    });
};

// Start the bot
connectBot();

// Keep alive monitoring
setInterval(() => {
    const now = new Date().toLocaleTimeString();
    console.log(`⏰ [${now}] Bot running - Referrals: ${referralStorage.size}`);
}, 60000);

// Graceful shutdown
const gracefulShutdown = (signal) => {
    console.log(`\n${signal} received, shutting down...`);
    try {
        bot.stop(signal);
        console.log('✅ Bot stopped gracefully');
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
🎉 BOT STARTED WITH FIXED REFERRAL SYSTEM!
🔗 Web App: ${WEB_APP_URL}
👥 Referral: ✅ ACTIVE
🚀 New users get fresh accounts
💰 25 welcome points + 50 referral bonus\
`);
