const DiscordService = require('../services/discordService');

module.exports = function registerSocketEvents(socket, client, io) {
    // 1. Fetch Initial Direct Messages & Guilds
    socket.on('req_initial_data', async () => {
        try {
            const guilds = client.guilds.cache.map(g => ({
                id: g.id,
                name: g.name,
                icon: g.iconURL({ dynamic: true }) || 'https://assets-global.website-files.com/6257adef93867e50d84d30e2/636e0a6a49cf127bf92de1e2_icon_clyde_blurple_RGB.png',
                channels: g.channels.cache.map(c => ({
                    id: c.id,
                    name: c.name,
                    type: c.type,
                    parentId: c.parentId,
                    position: c.position
                }))
            }));

            // Official System DM Injector (ภาพ 1 & 2)
            const systemDM = {
                id: 'system-official-dm',
                isSystem: true,
                user: {
                    id: client.user.id,
                    username: 'Discord System',
                    avatar: 'https://assets-global.website-files.com/6257adef93867e50d84d30e2/636e0a6a49cf127bf92de1e2_icon_clyde_blurple_RGB.png',
                    badges: ['AUTOMOD', 'PARTNERED_BANK']
                },
                lastMessage: 'การสิงบอทแบบการโคลนมาจาก Discord...'
            };

            socket.emit('res_initial_data', {
                me: DiscordService.formatUser(client.user),
                guilds: guilds,
                systemDM: systemDM
            });
        } catch (err) {
            socket.emit('error_notification', err.message);
        }
    });

    // 2. Fetch Channel / DM Messages
    socket.on('req_messages', async ({ channelId }) => {
        try {
            const channel = await client.channels.fetch(channelId);
            if (channel && channel.isTextBased()) {
                const fetched = await channel.messages.fetch({ limit: 50 });
                const formatted = fetched.map(m => DiscordService.formatMessage(m)).reverse();
                socket.emit('res_messages', { channelId, messages: formatted });
            }
        } catch (err) {
            socket.emit('error_notification', 'ไม่สามารถดึงข้อความได้');
        }
    });

    // 3. Send Message
    socket.on('req_send_message', async ({ channelId, content, embeds }) => {
        try {
            const channel = await client.channels.fetch(channelId);
            if (channel && channel.isTextBased()) {
                await channel.send({ content, embeds });
            }
        } catch (err) {
            socket.emit('error_notification', 'ไม่สามารถส่งข้อความได้');
        }
    });

    // 4. Moderation Kick / Ban (ภาพ 5)
    socket.on('req_moderate', async ({ guildId, targetId, action, reason }) => {
        try {
            const guild = await client.guilds.fetch(guildId);
            const member = await guild.members.fetch(targetId);
            if (action === 'kick') await member.kick(reason);
            if (action === 'ban') await member.ban({ reason });
            socket.emit('action_success', `ดำเนินการ ${action.toUpperCase()} สำเร็จ`);
        } catch (err) {
            socket.emit('error_notification', `ล้มเหลวในการ ${action}`);
        }
    });

    // 5. Fetch Audit Logs (ภาพ 8)
    socket.on('req_audit_logs', async ({ guildId }) => {
        try {
            const guild = await client.guilds.fetch(guildId);
            const logs = await guild.fetchAuditLogs({ limit: 20 });
            const entries = logs.entries.map(e => ({
                id: e.id,
                action: e.action,
                executor: e.executor ? e.executor.tag : 'System',
                target: e.target ? (e.target.tag || e.target.id) : 'N/A',
                reason: e.reason || 'ไม่มีการระบุเหตุผล',
                timestamp: e.createdAt
            }));
            socket.emit('res_audit_logs', entries);
        } catch (err) {
            socket.emit('error_notification', 'ไม่สามารถเข้าถึง Audit Logs ได้');
        }
    });
};
