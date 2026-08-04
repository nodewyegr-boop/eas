const DiscordService = require('../services/discordService');

module.exports = function registerGatewayEvents(client, io) {
    client.on('ready', () => {
        console.log(`[Discord Gateway] Logged in as ${client.user.tag}`);
        io.emit('gateway_ready', {
            botUser: DiscordService.formatUser(client.user)
        });
    });

    client.on('messageCreate', (message) => {
        io.emit('discord_message_create', DiscordService.formatMessage(message));
    });

    client.on('messageUpdate', (oldMsg, newMsg) => {
        if (!newMsg.partial) {
            io.emit('discord_message_update', DiscordService.formatMessage(newMsg));
        }
    });

    client.on('messageDelete', (message) => {
        io.emit('discord_message_delete', { id: message.id, channelId: message.channelId });
    });

    client.on('voiceStateUpdate', (oldState, newState) => {
        io.emit('discord_voice_update', {
            userId: newState.member.id,
            guildId: newState.guild.id,
            channelId: newState.channelId,
            selfMute: newState.selfMute || false,
            selfDeaf: newState.selfDeaf || false,
            streaming: newState.streaming || false,
            user: DiscordService.formatUser(newState.member.user, newState.member)
        });
    });

    client.on('guildMemberAdd', (member) => {
        io.emit('discord_member_join', DiscordService.formatUser(member.user, member));
    });

    client.on('guildMemberRemove', (member) => {
        io.emit('discord_member_leave', { id: member.id, guildId: member.guild.id });
    });
};
