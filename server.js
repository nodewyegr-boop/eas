require('dotenv').config();
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const path = require('path');
const { Client, GatewayIntentBits, Partials } = require('discord.js');

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: '*' } });

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'src/public')));

io.on('connection', (socket) => {
    console.log('[Socket] Client connected:', socket.id);

    // 1. Bot Login Handler
    socket.on('req_login', async ({ token }) => {
        if (!token) return socket.emit('login_error', 'กรุณากรอก Bot Token');

        const cleanToken = token.trim().replace(/^["']|["']$/g, '');

        if (socket.discordClient) {
            try { await socket.discordClient.destroy(); } catch (e) {}
        }

        const client = new Client({
            intents: [
                GatewayIntentBits.Guilds,
                GatewayIntentBits.GuildMessages,
                GatewayIntentBits.MessageContent,
                GatewayIntentBits.GuildMembers
            ],
            partials: [Partials.Channel, Partials.Message]
        });

        socket.discordClient = client;

        client.once('ready', () => {
            console.log(`[Bot Ready] Logged in as: ${client.user.tag}`);
            socket.emit('login_success', {
                user: {
                    id: client.user.id,
                    username: client.user.username,
                    tag: client.user.tag,
                    avatar: client.user.displayAvatarURL()
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
                msg = 'กรุณาเปิด MESSAGE CONTENT INTENT ใน Discord Developer Portal';
            } else if (err.message.includes('TOKEN_INVALID')) {
                msg = 'รูปแบบ Bot Token ไม่ถูกต้อง';
            }

            socket.emit('login_error', msg);
        }
    });

    // 2. Fetch Initial Data
    socket.on('req_initial_data', async () => {
        const client = socket.discordClient;
        if (!client || !client.user) return;

        try {
            const guilds = client.guilds.cache.map(g => ({
                id: g.id,
                name: g.name,
                icon: g.iconURL() || 'https://assets-global.website-files.com/6257adef93867e50d84d30e2/636e0a6a49cf127bf92de1e2_icon_clyde_blurple_RGB.png'
            }));

            socket.emit('res_initial_data', {
                me: {
                    id: client.user.id,
                    username: client.user.username,
                    tag: client.user.tag,
                    avatar: client.user.displayAvatarURL()
                },
                guilds: guilds
            });
        } catch (err) {
            socket.emit('error_notification', err.message);
        }
    });

    // 3. Logout & Disconnect
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
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`[Server] Running on port ${PORT}`);
});
