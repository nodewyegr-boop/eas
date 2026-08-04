require('dotenv').config();
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const path = require('path');

const client = require('./src/config/discordClient');
const registerGatewayEvents = require('./src/handlers/gatewayHandler');
const registerSocketEvents = require('./src/handlers/socketHandler');

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: '*' } });

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'src/public')));

// Initialize Gateway Events
registerGatewayEvents(client, io);

// Initialize Socket.IO Client Bridge
io.on('connection', (socket) => {
    registerSocketEvents(socket, client, io);
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`[Server] Discord Web Client Server running on port ${PORT}`);
    if (process.env.DISCORD_TOKEN) {
        client.login(process.env.DISCORD_TOKEN).catch(err => {
            console.error('[Discord API Error] Failed to login:', err.message);
        });
    }
});
