const { Client, GatewayIntentBits, Partials } = require('discord.js');

const createBotClient = () => {
    return new Client({
        intents: [
            GatewayIntentBits.Guilds,
            GatewayIntentBits.GuildMessages,
            GatewayIntentBits.MessageContent,
            GatewayIntentBits.GuildMembers,
            GatewayIntentBits.DirectMessages
        ],
        partials: [Partials.Channel, Partials.Message]
    });
};

module.exports = { createBotClient };
