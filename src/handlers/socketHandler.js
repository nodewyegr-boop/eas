const DiscordService = require('../services/discordService');

module.exports = function registerSocketEvents(socket, client, io) {

    // 1. รับ Event Login จากหน้าเว็บ
    socket.on('req_login', async ({ token }) => {
        try {
            if (!token) {
                return socket.emit('login_error', 'กรุณากรอก Token');
            }

            // สั่ง Destroy Client เก่า (ถ้ามี) แล้ว Login ใหม่ด้วย Token ที่ส่งมา
            if (client.readyAt) {
                await client.destroy();
            }

            await client.login(token.trim());

            socket.emit('login_success', {
                user: DiscordService.formatUser(client.user)
            });

        } catch (err) {
            console.error('[Login Error]', err.message);
            socket.emit('login_error', 'Token ไม่ถูกต้อง หรือถูกระงับการใช้งาน');
        }
    });

    // 2. ออกจากระบบ (Logout)
    socket.on('req_logout', async () => {
        try {
            await client.destroy();
            socket.emit('logout_success');
        } catch (err) {
            socket.emit('error_notification', 'ไม่สามารถออกจากระบบได้');
        }
    });

    // Event อื่นๆ คงเดิม...
};
