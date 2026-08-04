const socket = io();

socket.on('connect', () => {
    console.log('[Client Socket] Connected to bridge');
    socket.emit('req_initial_data');
});

socket.on('res_initial_data', (data) => {
    Sidebar.renderUserPanel(data.me);
    Sidebar.renderGuilds(data.guilds);
});

socket.on('discord_message_create', (msg) => {
    Chat.appendMessage(msg);
});

socket.on('discord_voice_update', (data) => {
    Voice.handleVoiceUpdate(data);
});
