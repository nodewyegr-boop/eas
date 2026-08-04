const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const { Client, GatewayIntentBits, Partials, ChannelType } = require('discord.js');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: '*' } });

app.use(express.static(path.join(__dirname, 'public')));

function formatMessage(m) {
    return {
        id: m.id,
        channelId: m.channelId,
        author: {
            id: m.author.id,
            username: m.author.username,
            globalName: m.author.globalName || m.author.username,
            avatar: m.author.displayAvatarURL({ dynamic: true, size: 128 }),
            bot: m.author.bot
        },
        content: m.content,
        timestamp: m.createdAt.toLocaleDateString('th-TH', { hour: '2-digit', minute: '2-digit' })
    };
}

io.on('connection', (socket) => {
    let bot = null;

    socket.on('login', async (token) => {
        if (bot) try { bot.destroy(); } catch (e) {}

        bot = new Client({
            intents: [
                GatewayIntentBits.Guilds,
                GatewayIntentBits.GuildMessages,
                GatewayIntentBits.MessageContent,
                GatewayIntentBits.GuildMembers,
                GatewayIntentBits.GuildVoiceStates,
                GatewayIntentBits.GuildPresences
            ],
            partials: [Partials.Channel, Partials.Message, Partials.User]
        });

        try {
            await bot.login(token);

            bot.on('ready', () => {
                const guilds = bot.guilds.cache.map(g => ({
                    id: g.id,
                    name: g.name,
                    icon: g.iconURL({ dynamic: true, size: 128 }),
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

            bot.on('messageCreate', (msg) => socket.emit('new_message', formatMessage(msg)));

        } catch (err) {
            socket.emit('login_error', 'Bot Token ไม่ถูกต้อง');
        }
    });

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
                    channels.push({
                        id: c.id,
                        name: c.name,
                        parentId: c.parentId,
                        position: c.position,
                        type: 'voice',
                        members: c.members.map(m => ({
                            id: m.id,
                            globalName: m.displayName,
                            avatar: m.user.displayAvatarURL({ dynamic: true, size: 64 })
                        }))
                    });
                }
            });

            socket.emit('channels_list', {
                guildName: guild.name,
                categories: categories.sort((a,b) => a.position - b.position),
                channels: channels.sort((a,b) => a.position - b.position)
            });
        } catch (e) {}
    });

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
                roleColor: m.roles.hoist ? m.roles.hoist.hexColor : '#949ba4',
                status: m.presence ? m.presence.status : 'offline'
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
            socket.emit('messages_list', { messages: messages.reverse().map(formatMessage) });
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

server.listen(3000, () => console.log('Server running on port 3000'));
