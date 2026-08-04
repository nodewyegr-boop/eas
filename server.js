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

// แปลงเวลาให้เป็นรูปแบบเหมือนภาพ (เช่น 2วัน, 5วัน)
function formatRelativeTime(date) {
    if (!date) return '';
    const now = new Date();
    const diffDays = Math.floor((now - new Date(date)) / (1000 * 60 * 60 * 24));
    if (diffDays === 0) return 'วันนี้';
    if (diffDays === 1) return '1วัน';
    return `${diffDays}วัน`;
}

// Format ข้อความสำหรับ Chat
function formatMessage(m) {
    return {
        id: m.id,
        channelId: m.channelId,
        guildId: m.guildId || null,
        author: {
            id: m.author.id,
            username: m.author.username,
            globalName: m.author.globalName || m.author.username,
            avatar: m.author.displayAvatarURL({ dynamic: true, size: 128 }),
            bot: m.author.bot
        },
        content: m.content,
        timestamp: m.createdAt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        attachments: m.attachments ? m.attachments.map(a => ({ url: a.url, name: a.name, contentType: a.contentType })) : []
    };
}

io.on('connection', (socket) => {
    let bot = null;

    socket.on('login', async (token) => {
        if (bot) { try { bot.destroy(); } catch (e) {} }

        bot = new Client({
            intents: [
                GatewayIntentBits.Guilds,
                GatewayIntentBits.GuildMessages,
                GatewayIntentBits.MessageContent,
                GatewayIntentBits.GuildMembers,
                GatewayIntentBits.GuildVoiceStates,
                GatewayIntentBits.GuildPresences,
                GatewayIntentBits.DirectMessages
            ],
            partials: [Partials.Channel, Partials.Message, Partials.Reaction, Partials.User]
        });

        try {
            await bot.login(token);

            bot.on('ready', async () => {
                const guilds = bot.guilds.cache.map(g => ({
                    id: g.id,
                    name: g.name,
                    icon: g.iconURL({ dynamic: true, size: 128 }) || null,
                    acronym: g.nameAcronym
                }));

                socket.emit('login_success', {
                    user: {
                        id: bot.user.id,
                        username: bot.user.username,
                        globalName: bot.user.globalName || bot.user.username,
                        avatar: bot.user.displayAvatarURL({ dynamic: true, size: 256 }),
                        tag: bot.user.tag,
                        createdTimestamp: bot.user.createdTimestamp
                    },
                    guilds
                });
            });

            // ตรวจจับ Voice State เพื่ออัปเดตสมาชิกใน VC แบบ Realtime
            bot.on('voiceStateUpdate', () => {
                socket.emit('refresh_voice_states');
            });

            bot.on('messageCreate', (msg) => {
                socket.emit('new_message', formatMessage(msg));
            });

        } catch (err) {
            socket.emit('login_error', 'Invalid Bot Token');
        }
    });

    // ดึงโครงสร้าง Channels และ Voice Channel Tree (เหมือนภาพ 1)
    socket.on('get_channels', async (guildId) => {
        if (!bot) return;
        try {
            const guild = await bot.guilds.fetch(guildId);
            await guild.members.fetch(); // ดึงสมาชิกทั้งหมดเข้ามาทำ Cache
            const rawChannels = await guild.channels.fetch();

            const categories = [];
            const textChannels = [];
            const voiceChannels = [];

            rawChannels.forEach(c => {
                if (!c) return;
                if (c.type === ChannelType.GuildCategory) {
                    categories.push({ id: c.id, name: c.name, position: c.position });
                } else if (c.type === ChannelType.GuildText || c.type === ChannelType.GuildAnnouncement) {
                    textChannels.push({ id: c.id, name: c.name, parentId: c.parentId, position: c.position, type: 'text' });
                } else if (c.type === ChannelType.GuildVoice) {
                    // รายชื่อสมาชิกที่สิง/คุยอยู่ใน VC นี้
                    const membersInVc = c.members.map(m => ({
                        id: m.id,
                        username: m.user.username,
                        globalName: m.displayName,
                        avatar: m.user.displayAvatarURL({ dynamic: true, size: 64 }),
                        selfMute: m.voice.selfMute || m.voice.serverMute,
                        selfDeaf: m.voice.selfDeaf || m.voice.serverDeaf,
                        streaming: m.voice.streaming
                    }));

                    voiceChannels.push({
                        id: c.id,
                        name: c.name,
                        parentId: c.parentId,
                        position: c.position,
                        userLimit: c.userLimit,
                        memberCount: membersInVc.length,
                        members: membersInVc,
                        type: 'voice'
                    });
                }
            });

            socket.emit('channels_list', {
                guildId,
                guildName: guild.name,
                guildIcon: guild.iconURL({ dynamic: true, size: 256 }),
                categories: categories.sort((a,b) => a.position - b.position),
                channels: [...textChannels, ...voiceChannels].sort((a,b) => a.position - b.position)
            });
        } catch (e) {
            socket.emit('error', 'Cannot load channels');
        }
    });

    // ดึง DM List (เหมือนภาพ 2)
    socket.on('get_dms', async () => {
        if (!bot) return;
        try {
            const dmChannels = bot.channels.cache.filter(c => c.type === ChannelType.DM);
            const dms = [];

            for (const [id, channel] of dmChannels) {
                const recipient = channel.recipient;
                if (!recipient) continue;

                let lastMsgText = '';
                let lastMsgTime = '';

                try {
                    const lastMsg = (await channel.messages.fetch({ limit: 1 })).first();
                    if (lastMsg) {
                        const isSelf = lastMsg.author.id === bot.user.id;
                        lastMsgText = isSelf ? `คุณ: ${lastMsg.content}` : `${lastMsg.author.username}: ${lastMsg.content}`;
                        lastMsgTime = formatRelativeTime(lastMsg.createdAt);
                    }
                } catch (e) {}

                dms.push({
                    id: channel.id,
                    recipient: {
                        id: recipient.id,
                        username: recipient.username,
                        globalName: recipient.globalName || recipient.username,
                        avatar: recipient.displayAvatarURL({ dynamic: true, size: 128 }),
                        bot: recipient.bot,
                        status: 'online' // Discord Bot API มองเป็น Online ลิสต์
                    },
                    lastMessage: lastMsgText,
                    timestamp: lastMsgTime
                });
            }

            socket.emit('dms_list', dms);
        } catch (e) {
            socket.emit('error', 'Cannot load DMs');
        }
    });

    // ดึงรายชื่อสมาชิกในเซิร์ฟเวอร์ (Right Sidebar)
    socket.on('get_guild_members', async (guildId) => {
        if (!bot) return;
        try {
            const guild = await bot.guilds.fetch(guildId);
            const members = await guild.members.fetch();

            const memberData = members.map(m => ({
                id: m.id,
                username: m.user.username,
                globalName: m.displayName,
                avatar: m.user.displayAvatarURL({ dynamic: true, size: 128 }),
                bot: m.user.bot,
                roles: m.roles.cache.filter(r => r.name !== '@everyone').map(r => ({ id: r.id, name: r.name, color: r.hexColor })),
                status: m.presence ? m.presence.status : 'offline',
                customStatus: m.presence?.activities[0]?.state || ''
            }));

            socket.emit('guild_members_list', memberData);
        } catch (e) {}
    });

    socket.on('get_messages', async (channelId) => {
        if (!bot) return;
        try {
            const channel = await bot.channels.fetch(channelId);
            if (!channel.isTextBased()) return;

            const messages = await channel.messages.fetch({ limit: 50 });
            socket.emit('messages_list', { channelId, messages: messages.reverse().map(formatMessage) });
        } catch (e) {
            socket.emit('error', 'Cannot load messages');
        }
    });

    socket.on('send_message', async ({ channelId, content }) => {
        if (!bot) return;
        try {
            const channel = await bot.channels.fetch(channelId);
            if (!channel.isTextBased()) return;
            await channel.send({ content });
        } catch (e) {}
    });

    socket.on('disconnect', () => {
        if (bot) { try { bot.destroy(); } catch (e) {} }
    });
});

server.listen(PORT, () => console.log(`Discord Client running on port ${PORT}`));
