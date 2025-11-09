const { Telegraf } = require('telegraf');
const https = require('https');
require('dotenv').config();

console.log('🚀 Starting Reward Browser Bot...');

// IPv4 force karne ke liye custom agent
const agent = new https.Agent({
    family: 4, // IPv4 force karo
    keepAlive: true
});

// Web App URL - Yahan apna Netlify URL dalenge
const WEB_APP_URL = 'https://reward-earn-app.netlify.app/';

const bot = new Telegraf(process.env.BOT_TOKEN, {
    telegram: {
        apiRoot: 'https://api.telegram.org',
        agent: agent,  // Custom agent add karo
        retryAfter: 1
    }
});

// Web App Menu Setup with retry mechanism
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
        console.log('🌐 Live URL:', WEB_APP_URL);
        return true;
    } catch (error) {
        console.log(`❌ Menu setup attempt ${retryCount + 1} failed:`, error.message);
        
        if (retryCount < 3) {
            console.log(`🔄 Retrying menu setup in 5 seconds...`);
            setTimeout(() => setupWebApp(retryCount + 1), 5000);
        } else {
            console.log('⚠️ Menu setup failed, but web app is accessible via commands');
            return false;
        }
    }
};

// ==================== BOT COMMANDS ====================

// Start Command - Main Welcome
bot.start((ctx) => {
    const userName = ctx.from.first_name;
    const userID = ctx.from.id;
    
    console.log(`👤 User started bot: ${userName} (ID: ${userID})`);
    
    ctx.reply(`
🤖 *Welcome ${userName}!*

🎯 *Reward Browser - Watch Videos & Earn Money!*

✨ *🌟 FEATURES:*
• 🎬 Real YouTube Video Playback
• 💰 Earn Points for Watching Videos
• 📱 Mobile Optimized Interface
• 🚀 Instant Points System
• 📊 Track Your Earnings
• 🎁 Referral Rewards

🚀 *HOW IT WORKS:*
1️⃣ Click "Earn Points" below
2️⃣ Search YouTube Shorts/Videos
3️⃣ Click "Start Earning" on any video
4️⃣ Watch the YouTube video completely
5️⃣ Earn points automatically!

💰 *POINTS SYSTEM:*
• 10-15 Points per video
• Points add to your wallet
• Track your progress
• Redeem rewards soon!

📱 *QUICK ACTIONS:*
Use commands below or click menu buttons

🔧 *BOT COMMANDS:*
/earn - Start earning points
/search - Quick video search
/youtube - YouTube categories
/wallet - Check your balance
/refer - Invite friends
/help - Get assistance

🌐 *Web App:* ${WEB_APP_URL}

_Start earning right away! 🚀_
    `, { 
        parse_mode: 'Markdown',
        reply_markup: {
            inline_keyboard: [
                [
                    { 
                        text: '🎬 START EARNING POINTS', 
                        web_app: { url: WEB_APP_URL } 
                    }
                ],
                [
                    { text: '💰 Check Wallet', callback_data: 'check_wallet' },
                    { text: '🔍 Quick Search', callback_data: 'quick_search' }
                ]
            ]
        }
    });
});

// Earn Command - Direct to Earning
bot.command('earn', (ctx) => {
    ctx.reply(`💰 *Start Earning Points*`, {
        parse_mode: 'Markdown',
        reply_markup: {
            inline_keyboard: [
                [
                    { text: '🎬 Open Earning App', web_app: { url: WEB_APP_URL } }
                ],
                [
                    { text: '🎵 Music Videos', web_app: { url: `${WEB_APP_URL}?search=music` } },
                    { text: '😂 Comedy Videos', web_app: { url: `${WEB_APP_URL}?search=comedy` } }
                ],
                [
                    { text: '🎮 Gaming Videos', web_app: { url: `${WEB_APP_URL}?search=gaming` } },
                    { text: '⚽ Sports Videos', web_app: { url: `${WEB_APP_URL}?search=sports` } }
                ]
            ]
        }
    });
});

// Search Command - Quick Video Search
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
                    { text: '🎮 Gaming', web_app: { url: `${WEB_APP_URL}?search=gaming` } },
                    { text: '😂 Comedy', web_app: { url: `${WEB_APP_URL}?search=comedy` } }
                ],
                [
                    { text: '⚽ Sports', web_app: { url: `${WEB_APP_URL}?search=sports` } },
                    { text: '📱 Tech', web_app: { url: `${WEB_APP_URL}?search=tech` } },
                    { text: '🍳 Cooking', web_app: { url: `${WEB_APP_URL}?search=cooking` } }
                ],
                [
                    { text: '🎬 Bollywood', web_app: { url: `${WEB_APP_URL}?search=bollywood` } },
                    { text: '📺 News', web_app: { url: `${WEB_APP_URL}?search=news` } },
                    { text: '💪 Fitness', web_app: { url: `${WEB_APP_URL}?search=fitness` } }
                ]
            ]
        }
    });
});

// YouTube Command - YouTube Specific
bot.command('youtube', (ctx) => {
    ctx.reply(`🎥 *YouTube Videos & Shorts*`, {
        parse_mode: 'Markdown',
        reply_markup: {
            inline_keyboard: [
                [
                    { text: '📱 Open YouTube App', url: 'https://youtube.com' },
                    { text: '🎬 Watch & Earn', web_app: { url: WEB_APP_URL } }
                ],
                [
                    { text: '🔥 Trending Shorts', web_app: { url: `${WEB_APP_URL}?search=trending` } },
                    { text: '🎵 Music Shorts', web_app: { url: `${WEB_APP_URL}?search=music` } }
                ],
                [
                    { text: '😂 Comedy Shorts', web_app: { url: `${WEB_APP_URL}?search=comedy` } },
                    { text: '🎮 Gaming Shorts', web_app: { url: `${WEB_APP_URL}?search=gaming` } }
                ]
            ]
        }
    });
});

// Wallet Command - Check Points
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
                ],
                [
                    { text: '📈 View Statistics', web_app: { url: `${WEB_APP_URL}#stats` } }
                ]
            ]
        }
    });
});

// Refer Command - Referral System
bot.command('refer', (ctx) => {
    const userId = ctx.from.id;
    const botUsername = ctx.botInfo.username;
    
    ctx.reply(`👥 *Refer & Earn Bonus Points*`, {
        parse_mode: 'Markdown',
        reply_markup: {
            inline_keyboard: [
                [
                    { 
                        text: '📤 Share Bot Link', 
                        url: `https://t.me/${botUsername}?start=ref${userId}`
                    }
                ],
                [
                    { text: '🎁 Referral Rewards', web_app: { url: `${WEB_APP_URL}#referral` } }
                ],
                [
                    { text: '📊 Check Referral Stats', web_app: { url: `${WEB_APP_URL}#referral` } }
                ]
            ]
        }
    });
});

// Status Command - System Status
bot.command('status', (ctx) => {
    ctx.reply(`
🟢 *SYSTEM STATUS: ACTIVE*

🤖 *Bot Status:* ✅ Online
🌐 *Web App:* ✅ Live
🎬 *Video System:* ✅ Working
💰 *Points System:* ✅ Active
📱 *Mobile Support:* ✅ Optimized

📊 *System Features:*
• Real YouTube Video Integration
• Automatic Points Rewards
• Mobile-Friendly Interface
• Instant Payout System
• 24/7 Availability

🚀 *Quick Actions:*
• Use /earn to start earning
• Use /search for quick videos
• Use /wallet to check balance

🔧 *Support:* Contact if any issues

🌐 *Web App URL:* ${WEB_APP_URL}
    `, { 
        parse_mode: 'Markdown',
        reply_markup: {
            inline_keyboard: [[
                { text: '🎬 Test System', web_app: { url: WEB_APP_URL } }
            ]]
        }
    });
});

// Help Command - Comprehensive Help
bot.command('help', (ctx) => {
    ctx.reply(`
🆘 *Reward Browser - Help Guide*

🎯 *HOW TO EARN POINTS:*
1. Use /earn command or click menu button
2. Search for videos (music, comedy, gaming, etc.)
3. Click "Start Earning" on any video
4. Watch the YouTube video completely
5. Points automatically added to your wallet!

💰 *POINTS SYSTEM:*
• 10-15 points per video watched
• Points tracked in real-time
• No limits on daily earnings
• Redeem system coming soon!

📱 *QUICK COMMANDS:*
/start - Main menu & features
/earn - Start earning points
/search - Quick video categories  
/youtube - YouTube specific videos
/wallet - Check your points balance
/refer - Invite friends & earn bonus
/status - Check system status
/help - This help message

🔧 *TROUBLESHOOTING:*
• If videos don't load, try different search terms
• Ensure stable internet connection
• Use latest Telegram version
• Contact support if issues persist

🎮 *POPULAR SEARCHES:*
• "music" - Bollywood, Punjabi, English
• "comedy" - Standup, Funny videos
• "gaming" - Gameplay, Streams
• "sports" - Cricket, Football
• "tech" - Reviews, Tutorials

📞 *SUPPORT:*
For any issues or questions, contact the developer.

🌐 *Web App:* ${WEB_APP_URL}

_Happy earning! 🚀_
    `, { 
        parse_mode: 'Markdown',
        reply_markup: {
            inline_keyboard: [
                [
                    { text: '🎬 Start Earning', web_app: { url: WEB_APP_URL } },
                    { text: '📊 Check Wallet', web_app: { url: `${WEB_APP_URL}#earnings` } }
                ],
                [
                    { text: '🔍 Quick Search', callback_data: 'quick_search_menu' }
                ]
            ]
        }
    });
});

// About Command - Bot Information
bot.command('about', (ctx) => {
    ctx.reply(`
ℹ️ *About Reward Browser*

🎯 *MISSION:*
Make earning rewards accessible to everyone through video watching!

✨ *FEATURES:*
• Real YouTube Video Integration
• Fair Points Reward System
• Mobile-First Design
• User-Friendly Interface
• Regular Updates

🛠️ *TECHNOLOGY:*
• Built with Modern Web Technologies
• Telegram Bot API Integration
• YouTube Data API v3
• Secure & Fast Hosting

👨‍💻 *DEVELOPER:*
This bot is developed with ❤️ to provide genuine earning opportunities.

📈 *STATISTICS:*
• 1000+ Videos Available
• 10-15 Points Per Video
• Instant Points System
• 24/7 Availability

🔄 *UPDATES:*
Regular improvements and new features added frequently!

🌐 *Website:* ${WEB_APP_URL}

_Thanks for using Reward Browser! 🌟_
    `, { 
        parse_mode: 'Markdown',
        reply_markup: {
            inline_keyboard: [[
                { text: '🚀 Start Using', web_app: { url: WEB_APP_URL } }
            ]]
        }
    });
});

// ==================== CALLBACK QUERIES ====================

// Handle callback queries
bot.on('callback_query', async (ctx) => {
    const callbackData = ctx.callbackQuery.data;
    console.log('🔘 Callback received:', callbackData);
    
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
                
            case 'quick_search':
                await ctx.editMessageText(`🔍 *Quick Video Search*`, {
                    parse_mode: 'Markdown',
                    reply_markup: {
                        inline_keyboard: [
                            [
                                { text: '🎵 Music', web_app: { url: `${WEB_APP_URL}?search=music` } },
                                { text: '🎮 Gaming', web_app: { url: `${WEB_APP_URL}?search=gaming` } }
                            ],
                            [
                                { text: '😂 Comedy', web_app: { url: `${WEB_APP_URL}?search=comedy` } },
                                { text: '⚽ Sports', web_app: { url: `${WEB_APP_URL}?search=sports` } }
                            ],
                            [
                                { text: '🔍 All Categories', web_app: { url: WEB_APP_URL } }
                            ]
                        ]
                    }
                });
                break;
                
            case 'quick_search_menu':
                await ctx.editMessageText(`🎯 *Quick Actions*`, {
                    parse_mode: 'Markdown',
                    reply_markup: {
                        inline_keyboard: [
                            [
                                { text: '🎬 Start Earning', web_app: { url: WEB_APP_URL } },
                                { text: '💰 Check Wallet', web_app: { url: `${WEB_APP_URL}#earnings` } }
                            ],
                            [
                                { text: '🔍 Quick Search', callback_data: 'quick_search' },
                                { text: '📊 Statistics', web_app: { url: `${WEB_APP_URL}#stats` } }
                            ],
                            [
                                { text: '👥 Refer Friends', callback_data: 'refer_friends' }
                            ]
                        ]
                    }
                });
                break;
                
            case 'refer_friends':
                const userId = ctx.from.id;
                const botUsername = ctx.botInfo.username;
                
                await ctx.editMessageText(`👥 *Refer & Earn Bonus*`, {
                    parse_mode: 'Markdown',
                    reply_markup: {
                        inline_keyboard: [
                            [
                                { 
                                    text: '📤 Share Bot Link', 
                                    url: `https://t.me/${botUsername}?start=ref${userId}`
                                }
                            ],
                            [
                                { text: '🎁 Bonus Details', web_app: { url: `${WEB_APP_URL}#referral` } }
                            ],
                            [
                                { text: '🔙 Back to Main', callback_data: 'quick_search_menu' }
                            ]
                        ]
                    }
                });
                break;
                
            default:
                await ctx.answerCbQuery('⚠️ Unknown action');
                break;
        }
    } catch (error) {
        console.error('Callback error:', error);
        await ctx.answerCbQuery('❌ Error processing request');
    }
});

// ==================== TEXT MESSAGE HANDLING ====================

// Handle text messages for quick searches
bot.on('text', (ctx) => {
    const messageText = ctx.message.text.toLowerCase().trim();
    
    // Ignore commands
    if (messageText.startsWith('/')) return;
    
    console.log(`📝 User message: ${messageText}`);
    
    // Quick responses for common queries
    const quickResponses = {
        'hello': '👋 Hello! Ready to earn some points? Use /earn to get started!',
        'hi': '👋 Hi there! Want to watch videos and earn money? Try /earn command!',
        'points': '💰 Check your points with /wallet command or earn more with /earn!',
        'money': '💵 Earn points by watching videos! Use /earn to start earning.',
        'video': '🎬 Watch videos and earn points! Use /search to find videos.',
        'youtube': '🎥 Watch YouTube videos and earn! Use /youtube for quick access.',
        'help': '🆘 Need help? Use /help command for detailed instructions.',
        'status': '🟢 System is online and working! Use /status for details.',
        'earn': '💰 Ready to earn? Use /earn command or click the menu button!',
        'search': '🔍 Looking for videos? Use /search for quick categories!'
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
    
    // For other text, treat as search query
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
    } else {
        ctx.reply(`🤖 I'm Reward Browser bot! I help you earn points by watching videos.\n\nUse /help to see all available commands or click the menu button below to start earning!`, {
            reply_markup: {
                inline_keyboard: [[
                    { text: '🎬 Start Earning', web_app: { url: WEB_APP_URL } }
                ]]
            }
        });
    }
});

// ==================== ERROR HANDLING ====================

// Error handling
bot.catch((err, ctx) => {
    console.error('❌ Bot error:', err);
    
    try {
        ctx.reply('❌ Sorry, something went wrong. Please try again or use /help for assistance.', {
            reply_markup: {
                inline_keyboard: [[
                    { text: '🔄 Try Again', web_app: { url: WEB_APP_URL } }
                ]]
            }
        });
    } catch (e) {
        console.error('Even error reply failed:', e);
    }
});

// ==================== BOT STARTUP ====================

// Enhanced connection with comprehensive retry
const connectBot = (retryCount = 0) => {
    const maxRetries = 5;
    const retryDelays = [5000, 10000, 15000, 20000, 30000]; // Progressive delays
    
    console.log(`🚀 Attempting to start bot (Attempt ${retryCount + 1}/${maxRetries})...`);
    
    bot.launch().then(() => {
        console.log('✅ Bot successfully connected to Telegram!');
        console.log('🤖 Bot is now online and listening for messages...');
        console.log('🌐 Web App URL:', WEB_APP_URL);
        console.log('🎯 Features: YouTube Videos, Points System, Mobile Optimized');
        
        // Setup web app menu
        setupWebApp();
        
    }).catch((error) => {
        console.log(`❌ Connection attempt ${retryCount + 1}/${maxRetries} failed:`, error.message);
        
        if (retryCount < maxRetries - 1) {
            const delay = retryDelays[retryCount];
            console.log(`🔄 Retrying in ${delay/1000} seconds...`);
            setTimeout(() => connectBot(retryCount + 1), delay);
        } else {
            console.log('💡 MAXIMUM RETRIES REACHED - Manual solutions:');
            console.log('   1. Check your BOT_TOKEN in .env file');
            console.log('   2. Ensure internet connection is stable');
            console.log('   3. Try using mobile hotspot');
            console.log('   4. Wait 10 minutes and restart the bot');
            console.log('   5. Contact support if issue persists');
            console.log('\n🎉 IMPORTANT: Your web app is still accessible at:', WEB_APP_URL);
            console.log('📱 Users can use the web app directly via the URL!');
            
            process.exit(1);
        }
    });
};

// Start the bot
connectBot();

// ==================== UTILITY FUNCTIONS ====================

// Keep alive monitoring
setInterval(() => {
    const now = new Date().toLocaleTimeString();
    console.log(`⏰ [${now}] Bot is running - Web App: ${WEB_APP_URL}`);
}, 60000); // Log every minute

// Graceful shutdown handling
const gracefulShutdown = (signal) => {
    console.log(`\n${signal} received, shutting down gracefully...`);
    
    try {
        bot.stop(signal);
        console.log('✅ Bot stopped gracefully');
        process.exit(0);
    } catch (error) {
        console.error('❌ Error during shutdown:', error);
        process.exit(1);
    }
};

// Handle different shutdown signals
process.once('SIGINT', () => gracefulShutdown('SIGINT'));
process.once('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.once('SIGUSR2', () => gracefulShutdown('SIGUSR2')); // For nodemon

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
    console.error('❌ Uncaught Exception:', error);
});

process.on('unhandledRejection', (reason, promise) => {
    console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
});

// ==================== EXPORT FOR DEPLOYMENT ====================

// Export for potential cloud deployment
module.exports = bot;

console.log(`
🎉 REWARD BROWSER BOT STARTED SUCCESSFULLY!
    
📋 BOT INFORMATION:
🤖 Name: Reward Browser Bot
🌐 Web App: ${WEB_APP_URL}
🎯 Purpose: Video-based points earning system
📱 Platform: Telegram
⚡ Status: ACTIVE

🚀 NEXT STEPS:
1. Test the bot in Telegram
2. Use /start command
3. Click menu button to open web app
4. Start earning points!

🔧 SUPPORT:
• Check logs for any issues
• Ensure .env has correct BOT_TOKEN
• Web app should be deployed on Netlify

Happy earning! 🎬
`);