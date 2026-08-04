const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const { Client, GatewayIntentBits, Partials, ChannelType } = require('discord.js');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: '*' } });

const PORT = process.env.PORT || 3000;

app.use(express.static(path.join(__dirname, 'public')));

io.on('connection', (socket) => {
    let bot = null;

    // ล็อกอินด้วย Bot Token
    socket.on('login', async (token) => {
        if (bot) {
            try { bot.destroy(); } catch (e) {}
        }

        bot = new Client({
            intents: [
                GatewayIntentBits.Guilds,
                GatewayIntentBits.GuildMessages,
                GatewayIntentBits.MessageContent,
                GatewayIntentBits.GuildMembers
            ],
            partials: [Partials.Channel, Partials.Message]
        });

        try {
            await bot.login(token);

            bot.on('ready', () => {
                const guilds = bot.guilds.cache.map(g => ({
                    id: g.id,
                    name: g.name,
                    icon: g.iconURL({ dynamic: true }) || 'https://cdn.discordapp.com/embed/avatars/0.png'
                }));

                socket.emit('login_success', {
                    user: {
                        tag: bot.user.tag,
                        avatar: bot.user.displayAvatarURL({ dynamic: true })
                    },
                    guilds
                });
            });

            // ตรวจจับข้อความใหม่แบบ Real-time
            bot.on('messageCreate', (msg) => {
                socket.emit('new_message', {
                    id: msg.id,
                    channelId: msg.channelId,
                    guildId: msg.guildId,
                    author: {
                        username: msg.author.username,
                        avatar: msg.author.displayAvatarURL()
                    },
                    content: msg.content,
                    timestamp: msg.createdAt.toLocaleTimeString()
                });
            });

        } catch (err) {
            socket.emit('login_error', 'Token ไม่ถูกต้อง หรือบอทไม่มีสิทธิ์!');
        }
    });

    // ดึงรายชื่อห้องแชตในเซิร์ฟเวอร์
    socket.on('get_channels', async (guildId) => {
        if (!bot) return;
        try {
            const guild = await bot.guilds.fetch(guildId);
            const channels = (await guild.channels.fetch())
                .filter(c => c && c.type === ChannelType.GuildText)
                .map(c => ({ id: c.id, name: c.name }));

            socket.emit('channels_list', { guildId, channels });
        } catch (e) {
            socket.emit('error', 'ไม่สามารถโหลดห้องแชตได้');
        }
    });

    // ดึงประวัติข้อความเก่าในห้อง
    socket.on('get_messages', async (channelId) => {
        if (!bot) return;
        try {
            const channel = await bot.channels.fetch(channelId);
            if (!channel.isTextBased()) return;

            const messages = await channel.messages.fetch({ limit: 50 });
            const formatted = messages.reverse().map(m => ({
                id: m.id,
                channelId: m.channelId,
                author: {
                    username: m.author.username,
                    avatar: m.author.displayAvatarURL()
                },
                content: m.content,
                timestamp: m.createdAt.toLocaleTimeString()
            }));

            socket.emit('messages_list', { channelId, messages: formatted });
        } catch (e) {
            socket.emit('error', 'ไม่สามารถดึงข้อความได้');
        }
    });

    // ส่งข้อความในนามบอท
    socket.on('send_message', async ({ channelId, content }) => {
        if (!bot || !content.trim()) return;
        try {
            const channel = await bot.channels.fetch(channelId);
            if (channel.isTextBased()) {
                await channel.send(content);
            }
        } catch (e) {
            socket.emit('error', 'ส่งข้อความไม่สำเร็จ');
        }
    });

    socket.on('disconnect', () => {
        if (bot) {
            try { bot.destroy(); } catch (e) {}
        }
    });
});

server.listen(PORT, () => {
    console.log(`Server started on port ${PORT}`);
});
