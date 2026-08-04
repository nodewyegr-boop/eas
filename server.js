const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const { Client, GatewayIntentBits, ChannelType, Partials } = require('discord.js');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: "*" } });

const upload = multer({ dest: 'uploads/' });

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

let discordClient = null;

// Real-time Gateway Relay
function initDiscordClient(token, res) {
  if (discordClient) discordClient.destroy();

  discordClient = new Client({
    intents: [
      GatewayIntentBits.Guilds,
      GatewayIntentBits.GuildMessages,
      GatewayIntentBits.MessageContent,
      GatewayIntentBits.GuildMembers,
      GatewayIntentBits.GuildPresences,
      GatewayIntentBits.DirectMessages
    ],
    partials: [Partials.Channel, Partials.Message]
  });

  discordClient.on('ready', () => {
    res.json({
      success: true,
      user: {
        id: discordClient.user.id,
        username: discordClient.user.username,
        discriminator: discordClient.user.discriminator || '0',
        avatar: discordClient.user.displayAvatarURL({ extension: 'png', forceStatic: false }),
        status: discordClient.user.presence?.status || 'online'
      }
    });
  });

  discordClient.on('messageCreate', (message) => {
    io.emit('messageCreate', formatMessage(message));
  });

  discordClient.on('messageDelete', (message) => {
    io.emit('messageDelete', { id: message.id, channelId: message.channelId });
  });

  discordClient.login(token).catch(err => {
    res.status(401).json({ success: false, message: 'Bot Token หรือ User Token ไม่ถูกต้อง' });
  });
}

function formatMessage(m) {
  return {
    id: m.id,
    channelId: m.channelId,
    author: {
      id: m.author.id,
      username: m.author.username,
      avatar: m.author.displayAvatarURL({ extension: 'png', forceStatic: false }) || 'https://cdn.discordapp.com/embed/avatars/0.png',
      isBot: m.author.bot
    },
    content: m.content,
    timestamp: new Date(m.createdTimestamp).toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' }),
    attachments: m.attachments.map(a => ({ url: a.url, name: a.name, contentType: a.contentType })),
    embeds: m.embeds.map(e => ({
      title: e.title,
      description: e.description,
      color: e.hexColor || '#5865f2',
      image: e.image ? e.image.url : null
    }))
  };
}

// REST ENDPOINTS
app.post('/api/login', (req, res) => {
  const { token } = req.body;
  if (!token) return res.status(400).json({ success: false, message: 'กรุณากรอก Token' });
  initDiscordClient(token, res);
});

// Fetch Guilds
app.get('/api/guilds', async (req, res) => {
  if (!discordClient?.isReady()) return res.status(401).json([]);
  const guilds = discordClient.guilds.cache.map(g => ({
    id: g.id,
    name: g.name,
    icon: g.iconURL({ extension: 'png' }) || null,
    acronym: g.nameAcronym
  }));
  res.json(guilds);
});

// Fetch Direct Messages (DMs)
app.get('/api/dms', async (req, res) => {
  if (!discordClient?.isReady()) return res.status(401).json([]);
  try {
    const dms = discordClient.channels.cache
      .filter(c => c.type === ChannelType.DM)
      .map(c => ({
        id: c.id,
        recipient: {
          username: c.recipient?.username || 'Direct Message',
          avatar: c.recipient?.displayAvatarURL({ extension: 'png' }) || 'https://cdn.discordapp.com/embed/avatars/0.png'
        }
      }));
    res.json(dms);
  } catch (err) {
    res.json([]);
  }
});

// Fetch Channels of Guild
app.get('/api/guilds/:guildId/channels', async (req, res) => {
  if (!discordClient?.isReady()) return res.status(401).json([]);
  try {
    const guild = await discordClient.guilds.fetch(req.params.guildId);
    const channels = await guild.channels.fetch();
    const categories = [];
    const uncategorized = [];

    channels.forEach(ch => {
      if (ch?.type === ChannelType.GuildCategory) {
        categories.push({ id: ch.id, name: ch.name.toUpperCase(), position: ch.position, channels: [] });
      }
    });

    channels.forEach(ch => {
      if (!ch || ch.type === ChannelType.GuildCategory) return;
      const channelData = { id: ch.id, name: ch.name, type: ch.type === ChannelType.GuildVoice ? 'voice' : 'text', position: ch.position };
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

// Fetch Messages
app.get('/api/channels/:channelId/messages', async (req, res) => {
  if (!discordClient?.isReady()) return res.status(401).json([]);
  try {
    const channel = await discordClient.channels.fetch(req.params.channelId);
    if (!channel.isTextBased()) return res.json([]);
    const fetched = await channel.messages.fetch({ limit: 50 });
    res.json(fetched.reverse().map(formatMessage));
  } catch (err) {
    res.status(500).json([]);
  }
});

// Send Message with File Attachment (Image/Files)
app.post('/api/channels/:channelId/messages', upload.array('files'), async (req, res) => {
  if (!discordClient?.isReady()) return res.status(401).json({ success: false });
  try {
    const channel = await discordClient.channels.fetch(req.params.channelId);
    const content = req.body.content || '';
    const files = req.files ? req.files.map(f => ({ attachment: f.path, name: f.originalname })) : [];

    const sent = await channel.send({ content: content || undefined, files });
    
    // Clean up temporary files
    req.files?.forEach(f => fs.unlinkSync(f.path));

    res.json({ success: true, message: formatMessage(sent) });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Delete Message
app.delete('/api/channels/:channelId/messages/:messageId', async (req, res) => {
  if (!discordClient?.isReady()) return res.status(401).json({ success: false });
  try {
    const channel = await discordClient.channels.fetch(req.params.channelId);
    const msg = await channel.messages.fetch(req.params.messageId);
    await msg.delete();
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false });
  }
});

// Fetch Members
app.get('/api/guilds/:guildId/members', async (req, res) => {
  if (!discordClient?.isReady()) return res.status(401).json([]);
  try {
    const guild = await discordClient.guilds.fetch(req.params.guildId);
    const members = await guild.members.fetch();
    res.json(members.map(m => ({
      id: m.id,
      username: m.user.username,
      nickname: m.nickname || m.user.username,
      avatar: m.user.displayAvatarURL({ extension: 'png' }),
      isBot: m.user.bot,
      roles: m.roles.cache.map(r => ({ id: r.id, name: r.name, color: r.hexColor }))
    })));
  } catch (err) {
    res.status(500).json([]);
  }
});

// Update Presence/Status
app.post('/api/user/status', (req, res) => {
  const { status, customStatus } = req.body;
  if (!discordClient?.isReady()) return res.status(401).json({ success: false });

  discordClient.user.setPresence({
    status: status || 'online',
    activities: customStatus ? [{ name: customStatus }] : []
  });
  res.json({ success: true });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`Discord Web Client backend operational on port ${PORT}`));
