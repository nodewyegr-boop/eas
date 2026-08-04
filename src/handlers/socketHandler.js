// src/handlers/socketHandler.js
const DiscordService = require('../services/discordService');

module.exports = function registerSocketEvents(socket, client, io) {

    socket.on('req_login', async ({ token }) => {
        try {
            if (!token || typeof token !== 'string') {
                return socket.emit('login_error', 'กรุณากรอก Token');
            }

            // ทำความสะอาด Token (ตัดช่องว่าง และฟันหนูออก)
            const cleanToken = token.trim().replace(/^["']|["']$/g, '');

            // ตัดการเชื่อมต่อเดิมอย่างปลอดภัยก่อนต่อใหม่
            try {
                if (client.readyAt) {
                    await client.destroy();
                }
            } catch (destroyErr) {
                console.log('[Warn] Cleanup old connection:', destroyErr.message);
            }

            // สั่ง Login เข้า Discord
            await client.login(cleanToken);

            socket.emit('login_success', {
                user: client.user ? DiscordService.formatUser(client.user) : null
            });

        } catch (err) {
            console.error('[Login Error]', err.message);
            
            // ส่ง Error แปลไทยกลับไปหน้าเว็บ
            let errMsg = 'Token ไม่ถูกต้อง หรือถูกระงับการใช้งาน';
            if (err.message.includes('TOKEN_INVALID')) errMsg = 'รูปแบบ Token ไม่ถูกต้อง';
            if (err.message.includes('DISALLOWED_INTENTS')) errMsg = 'บอทขาดการเปิด Intents ใน Discord Developer Portal';

            socket.emit('login_error', errMsg);
        }
    });

    // ... Event อื่นๆ
};
