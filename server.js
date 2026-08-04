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
        attachments: m.attachments ? m.attachments.map(a => ({ url: a.url, name: a.name, contentType: a.contentType })) : [],
        reactions: m.reactions.cache.map(r => ({ emoji: r.emoji.name, count: r.count, id: r.emoji.id })),
        embeds: m.embeds ? m.embeds.map(e => ({
            title: e.title,
            description: e.description,
            color: e.color ? '#' + e.color.toString(16).padStart(6, '0') : '#5865f2',
            image: e.image ? e.image.url : null
        })) : []
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
                GatewayIntentBits.DirectMessages,
                GatewayIntentBits.GuildMessageReactions
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
                        avatar: bot.user.displayAvatarURL({ dynamic: true, size: 128 })
                    },
                    guilds
                });
            });

            bot.on('messageCreate', (msg) => {
                socket.emit('new_message', formatMessage(msg));
            });

        } catch (err) {
            socket.emit('login_error', 'Invalid Bot Token');
        }
    });

    socket.on('get_channels', async (guildId) => {
        if (!bot) return;
        try {
            const guild = await bot.guilds.fetch(guildId);
            const rawChannels = await guild.channels.fetch();
            
            const categories = [];
            const textChannels = [];

            rawChannels.forEach(c => {
                if (!c) return;
                if (c.type === ChannelType.GuildCategory) {
                    categories.push({ id: c.id, name: c.name, position: c.position });
                } else if (c.type === ChannelType.GuildText || c.type === ChannelType.GuildAnnouncement) {
                    textChannels.push({ id: c.id, name: c.name, parentId: c.parentId, position: c.position });
                }
            });

            socket.emit('channels_list', {
                guildId,
                guildName: guild.name,
                categories: categories.sort((a,b) => a.position - b.position),
                channels: textChannels.sort((a,b) => a.position - b.position)
            });
        } catch (e) {
            socket.emit('error', 'Cannot load channels');
        }
    });

    socket.on('get_dms', async () => {
        if (!bot) return;
        try {
            const dms = bot.channels.cache
                .filter(c => c.type === ChannelType.DM)
                .map(c => ({
                    id: c.id,
                    recipient: {
                        id: c.recipient ? c.recipient.id : '0',
                        username: c.recipient ? c.recipient.username : 'Unknown',
                        avatar: c.recipient ? c.recipient.displayAvatarURL({ dynamic: true }) : 'https://cdn.discordapp.com/embed/avatars/0.png'
                    }
                }));
            socket.emit('dms_list', dms);
        } catch (e) {
            socket.emit('error', 'Cannot load DMs');
        }
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

    socket.on('send_message', async ({ channelId, content, file }) => {
        if (!bot) return;
        try {
            const channel = await bot.channels.fetch(channelId);
            if (!channel.isTextBased()) return;

            const options = {};
            if (content) options.content = content;
            if (file && file.buffer) {
                options.files = [{ attachment: Buffer.from(file.buffer), name: file.name }];
            }

            await channel.send(options);
        } catch (e) {
            socket.emit('error', 'Failed to send message');
        }
    });

    socket.on('add_reaction', async ({ channelId, messageId, emoji }) => {
        if (!bot) return;
        try {
            const channel = await bot.channels.fetch(channelId);
            const msg = await channel.messages.fetch(messageId);
            await msg.react(emoji);
        } catch (e) {}
    });

    socket.on('disconnect', () => {
        if (bot) { try { bot.destroy(); } catch (e) {} }
    });
});

server.listen(PORT, () => console.log(`Server listening on port ${PORT}`));
