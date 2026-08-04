
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

            bot.on('ready', () => {
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
                        tag: bot.user.tag
                    },
                    guilds
                });
            });

            // Real-time Event Broadcasters
            bot.on('messageCreate', (msg) => socket.emit('new_message', formatMessage(msg)));
            bot.on('presenceUpdate', () => socket.emit('refresh_members'));
            bot.on('voiceStateUpdate', () => socket.emit('refresh_channels'));

        } catch (err) {
            socket.emit('login_error', 'Invalid Bot Token');
        }
    });

    // ดึงโครงสร้าง Channels และ Voice Users
    socket.on('get_channels', async (guildId) => {
        if (!bot) return;
        try {
            const guild = await bot.guilds.fetch(guildId);
            const rawChannels = await guild.channels.fetch();

            const categories = [];
            const channels = [];

            rawChannels.forEach(c => {
                if (!c) return;
                if (c.type === ChannelType.GuildCategory) {
                    categories.push({ id: c.id, name: c.name, position: c.position });
                } else if (c.type === ChannelType.GuildText || c.type === ChannelType.GuildAnnouncement) {
                    channels.push({ id: c.id, name: c.name, parentId: c.parentId, position: c.position, type: 'text' });
                } else if (c.type === ChannelType.GuildVoice) {
                    const membersInVc = c.members.map(m => ({
                        id: m.id,
                        username: m.user.username,
                        globalName: m.displayName,
                        avatar: m.user.displayAvatarURL({ dynamic: true, size: 64 }),
                        selfMute: m.voice.selfMute || m.voice.serverMute,
                        selfDeaf: m.voice.selfDeaf || m.voice.serverDeaf
                    }));

                    channels.push({
                        id: c.id,
                        name: c.name,
                        parentId: c.parentId,
                        position: c.position,
                        userLimit: c.userLimit,
                        members: membersInVc,
                        type: 'voice'
                    });
                }
            });

            socket.emit('channels_list', {
                guildId,
                guildName: guild.name,
                categories: categories.sort((a,b) => a.position - b.position),
                channels: channels.sort((a,b) => a.position - b.position)
            });
        } catch (e) {
            socket.emit('error', 'Cannot fetch channels');
        }
    });

    // ดึงรายชื่อสมาชิกแยกตาม Role/Status (แก้ปัญหากล่องขวาลอยว่าง)
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
                highestRole: m.roles.hoist ? { name: m.roles.hoist.name, color: m.roles.hoist.hexColor } : { name: 'สมาชิก', color: '#949ba4' },
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
            socket.emit('messages_list', { channelId, channelName: channel.name, messages: messages.reverse().map(formatMessage) });
        } catch (e) {}
    });

    socket.on('send_message', async ({ channelId, content }) => {
        if (!bot) return;
        try {
            const channel = await bot.channels.fetch(channelId);
            if (channel.isTextBased()) await channel.send({ content });
        } catch (e) {}
    });

    socket.on('disconnect', () => { if (bot) try { bot.destroy(); } catch (e) {} });
});

server.listen(PORT, () => console.log(`Discord Client running on port ${PORT}`));
