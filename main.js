const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const { Client, GatewayIntentBits } = require('discord.js');

let mainWindow;
let discordClient;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 800,
    minWidth: 940,
    minHeight: 500,
    frame: true,
    backgroundColor: '#1e1f22',
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false
    }
  });

  mainWindow.loadFile(path.join(__dirname, 'src/index.html'));
}

app.whenReady().then(createWindow);

// ระบบเชื่อมต่อ Discord Bot Token
ipcMain.on('DISCORD_LOGIN', async (event, token) => {
  try {
    discordClient = new Client({
      intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildVoiceStates
      ]
    });

    discordClient.once('ready', () => {
      const guilds = discordClient.guilds.cache.map(g => ({
        id: g.id,
        name: g.name,
        icon: g.iconURL()
      }));

      event.reply('LOGIN_SUCCESS', {
        user: {
          username: discordClient.user.username,
          discriminator: discordClient.user.discriminator,
          avatar: discordClient.user.displayAvatarURL(),
          id: discordClient.user.id
        },
        guilds: guilds
      });
    });

    await discordClient.login(token);
  } catch (err) {
    event.reply('LOGIN_ERROR', err.message);
  }
});