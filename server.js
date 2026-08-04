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

function formatMsg(m) {
    return {
        id: m.id,
        channelId: m.channelId,
        guildId: m.guildId || null,
        author: {
            id: m.author.id,
            username: m.author.username,
            avatar: m.author.displayAvatarURL({ dynamic: true })
        },
        content: m.content,
        timestamp: m.createdAt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        attachments: m.attachments ? m.attachments.map(a => ({ url: a.url, name: a.name, contentType: a.contentType })) : [],
        reactions: m.reactions.cache.map(r => ({ emoji: r.emoji.name, count: r.count })),
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

    // ล็อกอินบอท
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
                    icon: g.iconURL({ dynamic: true }) || 'https://cdn.discordapp.com/embed/avatars/0.png'
                }));

                socket.emit('login_success', {
                    user: {
                        id: bot.user.id,
                        tag: bot.user.tag,
                        username: bot.user.username,
                        avatar: bot.user.displayAvatarURL({ dynamic: true })
                    },
                    guilds
                });
            });

            bot.on('messageCreate', (msg) => {
                socket.emit('new_message', formatMsg(msg));
            });

        } catch (err) {
            socket.emit('login_error', 'Token ไม่ถูกต้อง หรือบอทตั้งค่า Intents ไม่ครบ');
        }
    });

    // แก้ไขโปรไฟล์บอท (ชื่อ, รูป, สถานะ)
    socket.on('update_bot_profile', async ({ username, avatar, statusText, statusType }) => {
        if (!bot) return;
        try {
            if (username && username !== bot.user.username) {
                await bot.user.setUsername(username);
            }
            if (avatar) {
                await bot.user.setAvatar(avatar);
            }
            if (statusText) {
                bot.user.setPresence({
                    activities: [{ name: statusText, type: statusType || 0 }],
                    status: 'online'
                });
            }
            socket.emit('profile_updated', {
                username: bot.user.username,
                avatar: bot.user.displayAvatarURL({ dynamic: true })
            });
        } catch (e) {
            socket.emit('error', 'ไม่สามารถอัปเดตโปรไฟล์บอทได้ (ติด Rate Limit หรือผิดรูปแบบ)');
        }
    });

    // ดูโปรไฟล์ผู้ใช้คนอื่น
    socket.on('get_user_profile', async ({ userId, guildId }) => {
        if (!bot) return;
        try {
            const user = await bot.users.fetch(userId);
            let member = null;
            if (guildId) {
                try {
                    const guild = await bot.guilds.fetch(guildId);
                    member = await guild.members.fetch(userId);
                } catch (e) {}
            }

            socket.emit('user_profile_data', {
                id: user.id,
                username: user.username,
                tag: user.tag,
                avatar: user.displayAvatarURL({ dynamic: true, size: 256 }),
                banner: user.bannerURL({ dynamic: true, size: 512 }) || null,
                createdAt: user.createdAt.toLocaleDateString(),
                joinedAt: member ? member.joinedAt.toLocaleDateString() : null,
                roles: member ? member.roles.cache.filter(r => r.name !== '@everyone').map(r => r.name) : []
            });
        } catch (e) {
            socket.emit('error', 'ดึงข้อมูลโปรไฟล์ไม่สำเร็จ');
        }
    });

    // รีแอคข้อความ
    socket.on('add_reaction', async ({ channelId, messageId, emoji }) => {
        if (!bot) return;
        try {
            const channel = await bot.channels.fetch(channelId);
            const msg = await channel.messages.fetch(messageId);
            await msg.react(emoji);
        } catch (e) {
            socket.emit('error', 'ไม่สามารถกดรีแอคได้');
        }
    });

    // ดึงห้องแชตในเซิร์ฟเวอร์
    socket.on('get_channels', async (guildId) => {
        if (!bot) return;
        try {
            const guild = await bot.guilds.fetch(guildId);
            const channels = (await guild.channels.fetch())
                .filter(c => c && (c.type === ChannelType.GuildText || c.type === ChannelType.GuildAnnouncement))
                .map(c => ({ id: c.id, name: c.name }));

            socket.emit('channels_list', { guildId, guildName: guild.name, channels });
        } catch (e) {
            socket.emit('error', 'ไม่สามารถดึงห้องแชตได้');
        }
    });

    // ดึงรายชื่อ DMs (การคุยส่วนตัว)
    socket.on('get_dms', async () => {
        if (!bot) return;
        try {
            const dms = bot.channels.cache
                .filter(c => c.type === ChannelType.DM)
                .map(c => ({
                    id: c.id,
                    recipient: {
                        id: c.recipient ? c.recipient.id : 'Unknown',
                        username: c.recipient ? c.recipient.username : 'DM User',
                        avatar: c.recipient ? c.recipient.displayAvatarURL() : 'https://cdn.discordapp.com/embed/avatars/0.png'
                    }
                }));
            socket.emit('dms_list', dms);
        } catch (e) {
            socket.emit('error', 'ไม่สามารถดึงรายการ DM ได้');
        }
    });

    // เปิด DM ใหม่ด้วย User ID
    socket.on('open_dm', async (userId) => {
        if (!bot) return;
        try {
            const user = await bot.users.fetch(userId);
            const dmChannel = await user.createDM();
            socket.emit('dm_opened', {
                id: dmChannel.id,
                recipient: {
                    id: user.id,
                    username: user.username,
                    avatar: user.displayAvatarURL()
                }
            });
        } catch (e) {
            socket.emit('error', 'ไม่สามารถเปิด DM กับผู้ใช้นี้ได้');
        }
    });

    // ดึงประวัติข้อความ
    socket.on('get_messages', async (channelId) => {
        if (!bot) return;
        try {
            const channel = await bot.channels.fetch(channelId);
            if (!channel.isTextBased()) return;

            const messages = await channel.messages.fetch({ limit: 50 });
            const formatted = messages.reverse().map(formatMsg);
            socket.emit('messages_list', { channelId, messages: formatted });
        } catch (e) {
            socket.emit('error', 'ไม่สามารถดึงข้อความได้');
        }
    });

    // ส่งข้อความ (ข้อความ, ภาพ, วิดีโอ, GIF, Embed)
    socket.on('send_message', async ({ channelId, content, file }) => {
        if (!bot) return;
        try {
            const channel = await bot.channels.fetch(channelId);
            if (!channel.isTextBased()) return;

            const options = {};
            if (content) options.content = content;

            if (file && file.buffer) {
                options.files = [{
                    attachment: Buffer.from(file.buffer),
                    name: file.name
                }];
            }

            await channel.send(options);
        } catch (e) {
            socket.emit('error', 'ไม่สามารถส่งข้อความได้');
        }
    });

    // สร้างลิงก์เชิญเซิร์ฟเวอร์
    socket.on('create_invite', async (channelId) => {
        if (!bot) return;
        try {
            const channel = await bot.channels.fetch(channelId);
            const invite = await channel.createInvite({ maxAge: 0, maxUses: 0 });
            socket.emit('invite_created', invite.url);
        } catch (e) {
            socket.emit('error', 'ไม่มีสิทธิ์สร้างลิงก์เชิญ');
        }
    });

    // แก้ไขชื่อและไอคอนเซิร์ฟเวอร์
    socket.on('edit_guild', async ({ guildId, name, icon }) => {
        if (!bot) return;
        try {
            const guild = await bot.guilds.fetch(guildId);
            if (name) await guild.setName(name);
            if (icon) await guild.setIcon(icon);
            socket.emit('guild_updated', { id: guild.id, name: guild.name });
        } catch (e) {
            socket.emit('error', 'ไม่มีสิทธิ์แก้ไขข้อมูลเซิร์ฟเวอร์');
        }
    });

    socket.on('disconnect', () => {
        if (bot) { try { bot.destroy(); } catch (e) {} }
    });
});

server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
