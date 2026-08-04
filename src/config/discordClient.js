const { Client, GatewayIntentBits, Partials } = require('discord.js');

function createBotClient() {
    return new Client({
        intents: [
            GatewayIntentBits.Guilds,
            GatewayIntentBits.GuildMessages,
            GatewayIntentBits.MessageContent,
            GatewayIntentBits.GuildMembers
        ],
        partials: [Partials.Channel, Partials.Message]
    });
}

module.exports = { createBotClient };
