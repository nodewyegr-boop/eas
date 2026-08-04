const { Client } = require('discord.js-selfbot-v13');
const DiscordService = require('../services/discordService');

module.exports = function registerSocketEvents(socket, io) {

    socket.on('req_login', async ({ token }) => {
        try {
            if (!token) {
                return socket.emit('login_error', 'กรุณากรอก Token');
            }

            const cleanToken = token.trim().replace(/^["']|["']$/g, '');

            // ล้าง Client เก่าถ้ามี
            if (socket.discordClient) {
                try { await socket.discordClient.destroy(); } catch (e) {}
            }

            console.log('[Server] Attempting login with token...');

            const client = new Client({ 
                checkUpdate: false,
                captchaSolver: null 
            });
            socket.discordClient = client;

            // ตั้ง Timeout ป้องกันค้าง
            const loginTimeout = setTimeout(() => {
                if (!client.readyAt) {
                    try { client.destroy(); } catch(e){}
                    socket.emit('login_error', 'การเชื่อมต่อหมดเวลา (Discord บล็อก IP จาก Render)');
                }
            }, 15000);

            client.once('ready', () => {
                clearTimeout(loginTimeout);
                console.log(`[Server] Logged in as: ${client.user.tag}`);
                socket.emit('login_success', {
                    user: DiscordService.formatUser(client.user)
                });
            });

            client.on('messageCreate', (message) => {
                socket.emit('discord_message_create', DiscordService.formatMessage(message));
            });

            await client.login(cleanToken);

        } catch (err) {
            console.error('[Login Error Detail]:', err);

            if (socket.discordClient) {
                try { await socket.discordClient.destroy(); } catch (e) {}
                delete socket.discordClient;
            }

            let message = err.message || 'เกิดข้อผิดพลาดในการเชื่อมต่อ';
            if (message.includes('TOKEN_INVALID')) message = 'Token ไม่ถูกต้อง หรือถูกยกเลิกไปแล้ว';
            if (message.includes('CAPTCHA')) message = 'บัญชีติดด่าน Captcha (Discord บล็อก IP Render)';
            if (message.includes('401')) message = 'Unauthorized: Token ไม่สามารถใช้งานได้';

            socket.emit('login_error', message);
        }
    });

    socket.on('req_initial_data', async () => {
        const client = socket.discordClient;
        if (!client || !client.user) return;

        try {
            const guilds = client.guilds.cache.map(g => ({
                id: g.id,
                name: g.name,
                icon: g.iconURL({ dynamic: true }) || 'https://assets-global.website-files.com/6257adef93867e50d84d30e2/636e0a6a49cf127bf92de1e2_icon_clyde_blurple_RGB.png'
            }));

            socket.emit('res_initial_data', {
                me: DiscordService.formatUser(client.user),
                guilds: guilds
            });
        } catch (err) {
            socket.emit('error_notification', err.message);
        }
    });

    socket.on('req_logout', async () => {
        if (socket.discordClient) {
            try { await socket.discordClient.destroy(); } catch (e) {}
            delete socket.discordClient;
        }
        socket.emit('logout_success');
    });

    socket.on('disconnect', async () => {
        if (socket.discordClient) {
            try { await socket.discordClient.destroy(); } catch (e) {}
        }
    });
};
