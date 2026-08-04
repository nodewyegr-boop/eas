const { createBotClient } = require('../config/discordClient');

module.exports = function registerSocketEvents(socket, io) {

    socket.on('req_login', async ({ token }) => {
        if (!token) return socket.emit('login_error', 'กรุณากรอก Bot Token');

        const cleanToken = token.trim().replace(/^["']|["']$/g, '');

        if (socket.discordClient) {
            try { await socket.discordClient.destroy(); } catch (e) {}
        }

        const client = createBotClient();
        socket.discordClient = client;

        client.once('ready', () => {
            console.log(`[Bot Ready] Logged in as: ${client.user.tag}`);
            socket.emit('login_success', {
                user: {
                    id: client.user.id,
                    username: client.user.username,
                    tag: client.user.tag,
                    avatar: client.user.displayAvatarURL({ dynamic: true })
                }
            });
        });

        try {
            await client.login(cleanToken);
        } catch (err) {
            console.error('[Bot Login Error]', err.message);
            
            if (socket.discordClient) {
                try { await socket.discordClient.destroy(); } catch (e) {}
                delete socket.discordClient;
            }

            let msg = 'Bot Token ไม่ถูกต้อง';
            if (err.message.includes('USED_DISALLOWED_INTENTS')) {
                msg = 'กรุณาเปิด Privileged Gateway Intents (Message Content) ใน Discord Developer Portal';
            } else if (err.message.includes('TOKEN_INVALID')) {
                msg = 'รูปแบบ Bot Token ไม่ถูกต้อง';
            }

            socket.emit('login_error', msg);
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
                me: {
                    id: client.user.id,
                    username: client.user.username,
                    tag: client.user.tag,
                    avatar: client.user.displayAvatarURL({ dynamic: true })
                },
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
