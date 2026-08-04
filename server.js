const express = require('express');
const { Client, GatewayIntentBits, ChannelType } = require('discord.js');
const path = require('path');

const app = express();
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

let discordClient = null;

// 1. LOGIN GATEWAY
app.post('/api/login', async (req, res) => {
  const { token } = req.body;
  if (!token) return res.status(400).json({ success: false, message: 'กรุณากรอก Token' });

  try {
    if (discordClient) discordClient.destroy();
    discordClient = new Client({
      intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMembers
      ]
    });

    await discordClient.login(token);

    res.json({
      success: true,
      user: {
        id: discordClient.user.id,
        username: discordClient.user.username,
        discriminator: discordClient.user.discriminator || '0',
        avatar: discordClient.user.displayAvatarURL({ extension: 'png' })
      }
    });
  } catch (err) {
    res.status(401).json({ success: false, message: 'Bot Token ไม่ถูกต้อง หรือขาด Intents' });
  }
});

// 2. FETCH ALL GUILDS (เซิร์ฟเวอร์ทั้งหมดที่ Bot อยู่)
app.get('/api/guilds', async (req, res) => {
  if (!discordClient || !discordClient.isReady()) return res.status(401).json([]);
  
  try {
    const guilds = discordClient.guilds.cache.map(g => ({
      id: g.id,
      name: g.name,
      icon: g.iconURL({ extension: 'png' }),
      acronym: g.nameAcronym
    }));
    res.json(guilds);
  } catch (err) {
    res.status(500).json([]);
  }
});

// 3. FETCH CHANNELS OF A GUILD
app.get('/api/guilds/:guildId/channels', async (req, res) => {
  if (!discordClient || !discordClient.isReady()) return res.status(401).json([]);

  try {
    const guild = await discordClient.guilds.fetch(req.params.guildId);
    const channels = await guild.channels.fetch();
    
    const categories = [];
    const uncategorized = [];

    channels.forEach(ch => {
      if (!ch) return;
      if (ch.type === ChannelType.GuildCategory) {
        categories.push({
          id: ch.id,
          name: ch.name.toUpperCase(),
          position: ch.position,
          channels: []
        });
      }
    });

    channels.forEach(ch => {
      if (!ch || ch.type === ChannelType.GuildCategory) return;
      const channelData = {
        id: ch.id,
        name: ch.name,
        type: ch.type === ChannelType.GuildVoice ? 'voice' : 'text',
        position: ch.position
      };

      if (ch.parentId) {
        const cat = categories.find(c => c.id === ch.parentId);
        if (cat) cat.channels.push(channelData);
        else uncategorized.push(channelData);
      } else {
        uncategorized.push(channelData);
      }
    });

    res.json({ categories, uncategorized });
  } catch (err) {
    res.status(500).json({ categories: [], uncategorized: [] });
  }
});

// 4. FETCH MESSAGES
app.get('/api/channels/:channelId/messages', async (req, res) => {
  if (!discordClient || !discordClient.isReady()) return res.status(401).json([]);

  try {
    const channel = await discordClient.channels.fetch(req.params.channelId);
    if (!channel.isTextBased()) return res.json([]);

    const fetched = await channel.messages.fetch({ limit: 50 });
    const messages = fetched.reverse().map(m => ({
      id: m.id,
      author: {
        username: m.author.username,
        avatar: m.author.displayAvatarURL({ extension: 'png' }),
        isBot: m.author.bot
      },
      content: m.content,
      timestamp: new Date(m.createdTimestamp).toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' }),
      embeds: m.embeds.map(e => ({
        title: e.title,
        description: e.description,
        color: e.hexColor || '#5865f2'
      }))
    }));

    res.json(messages);
  } catch (err) {
    res.status(500).json([]);
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
