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

registerGatewayEvents(client, io);

io.on('connection', (socket) => {
    registerSocketEvents(socket, client, io);
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`[Server] Discord Engine Running on http://localhost:${PORT}`);
    console.log(`[Security] Token authentication is handled dynamically via Web UI.`);
});
