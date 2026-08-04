const express = require('express');
const path = require('path');
const { Client, GatewayIntentBits } = require('discord.js');

const app = express();
app.use(express.json());
app.use(express.static(path.join(__dirname, 'src')));

let discordClient = null;

// API สำหรับรับ Token และล็อกอิน
app.post('/api/login', async (req, res) => {
  const { token } = req.body;

  if (!token) {
    return res.status(400).json({ success: false, message: 'กรุณากรอก Token' });
  }

  try {
    if (discordClient) {
      await discordClient.destroy();
    }

    discordClient = new Client({
      intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMembers
      ]
    });

    await discordClient.login(token);

    // ส่งข้อมูลผู้ใช้งานกลับไปที่หน้าเว็บ
    res.json({
      success: true,
      user: {
        id: discordClient.user.id,
        username: discordClient.user.username,
        discriminator: discordClient.user.discriminator,
        avatar: discordClient.user.displayAvatarURL(),
        tag: discordClient.user.tag
      }
    });
  } catch (err) {
    res.status(401).json({ success: false, message: 'Token ไม่ถูกต้อง หรือเกิดข้อผิดพลาด: ' + err.message });
  }
});

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'src', 'index.html'));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
