const { Client } = require('discord.js-selfbot-v13');
const DiscordService = require('../services/discordService');

module.exports = function registerSocketEvents(socket, io) {

    socket.on('req_login', async ({ token }) => {
        if (!token) return socket.emit('login_error', 'กรุณากรอก Token');

        const cleanToken = token.trim().replace(/^["']|["']$/g, '');

        if (socket.discordClient) {
            try { await socket.discordClient.destroy(); } catch (e) {}
        }

        const client = new Client({ checkUpdate: false });
        socket.discordClient = client;

        let isResponded = false;

        // ตั้ง Timeout 10 วินาที ตัดปัญหา Server ค้างเมื่อ Discord บล็อก IP ของ Render
        const timeout = setTimeout(() => {
            if (!isResponded) {
                isResponded = true;
                try { client.destroy(); } catch (e) {}
                socket.emit('login_error', 'Discord บล็อกการเชื่อมต่อจาก Render (Data Center IP Block)');
            }
        }, 10000);

        client.once('ready', () => {
            if (isResponded) return;
            isResponded = true;
            clearTimeout(timeout);
            socket.emit('login_success', {
                user: client.user ? DiscordService.formatUser(client.user) : null
            });
        });

        try {
            await client.login(cleanToken);
        } catch (err) {
            if (isResponded) return;
            isResponded = true;
            clearTimeout(timeout);
            console.error('[Login Error]', err.message);
            
            let msg = 'Token ไม่ถูกต้อง หรือบัญชีติดด่านยืนยันตัวตน (Captcha)';
            if (err.message.includes('TOKEN_INVALID')) msg = 'รูปแบบ Token ไม่ถูกต้อง';
            socket.emit('login_error', msg);
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
