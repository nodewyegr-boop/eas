const client = require('../config/discordClient');

class DiscordService {
    static formatUser(user, member = null) {
        if (!user) return null;
        return {
            id: user.id,
            username: user.username,
            discriminator: user.discriminator,
            globalName: user.globalName || user.username,
            avatar: user.displayAvatarURL({ dynamic: true, size: 256 }),
            banner: user.bannerURL ? user.bannerURL({ size: 512 }) : null,
            bot: user.bot,
            badges: this.getUserBadges(user),
            status: member?.presence?.status || 'offline',
            activities: member?.presence?.activities || [],
            roles: member ? member.roles.cache.map(r => ({ id: r.id, name: r.name, color: r.hexColor })) : []
        };
    }

    static getUserBadges(user) {
        const badges = [];
        if (user.bot) badges.push('BOT');
        if (user.flags?.has('AutoModeratorExempted') || user.bot) badges.push('AUTOMOD');
        if (user.flags?.has('Partner')) badges.push('PARTNERED_BANK');
        return badges;
    }

    static formatMessage(msg) {
        return {
            id: msg.id,
            channelId: msg.channelId,
            guildId: msg.guildId,
            author: this.formatUser(msg.author, msg.member),
            content: msg.content,
            embeds: msg.embeds,
            components: msg.components,
            attachments: msg.attachments.map(a => ({ id: a.id, url: a.url, name: a.name, contentType: a.contentType })),
            mentions: msg.mentions.users.map(u => ({ id: u.id, username: u.username })),
            reactions: msg.reactions.cache.map(r => ({ emoji: r.emoji.name, count: r.count })),
            timestamp: msg.createdAt,
            editedTimestamp: msg.editedAt,
            pinned: msg.pinned
        };
    }
}

module.exports = DiscordService;
