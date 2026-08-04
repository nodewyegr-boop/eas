const socket = io();

let currentGuildId = null;
let currentChannelId = null;

const loginOverlay = document.getElementById('login-overlay');
const app = document.getElementById('app');
const tokenInput = document.getElementById('token-input');
const btnLogin = document.getElementById('btn-login');
const loginStatus = document.getElementById('login-status');

const guildsList = document.getElementById('guilds-list');
const channelsList = document.getElementById('channels-list');
const messagesContainer = document.getElementById('messages-container');
const messageInput = document.getElementById('message-input');
const chatHeader = document.getElementById('chat-header');
const guildName = document.getElementById('guild-name');

btnLogin.addEventListener('click', () => {
    const token = tokenInput.value.trim();
    if (token) {
        loginStatus.innerText = 'กำลังเชื่อมต่อ...';
        socket.emit('login', token);
    }
});

socket.on('login_success', ({ user, guilds }) => {
    loginOverlay.classList.add('hidden');
    app.classList.remove('hidden');

    document.getElementById('bot-avatar').src = user.avatar;
    document.getElementById('bot-username').innerText = user.tag;

    guildsList.innerHTML = '';
    guilds.forEach(g => {
        const img = document.createElement('img');
        img.src = g.icon;
        img.className = 'guild-icon';
        img.title = g.name;
        img.onclick = () => {
            document.querySelectorAll('.guild-icon').forEach(el => el.classList.remove('active'));
            img.classList.add('active');
            currentGuildId = g.id;
            guildName.innerText = g.name;
            socket.emit('get_channels', g.id);
        };
        guildsList.appendChild(img);
    });
});

socket.on('login_error', (err) => {
    loginStatus.innerText = err;
});

socket.on('channels_list', ({ guildId, channels }) => {
    if (guildId !== currentGuildId) return;
    channelsList.innerHTML = '';
    channels.forEach(c => {
        const div = document.createElement('div');
        div.className = 'channel-item';
        div.innerText = `# ${c.name}`;
        div.onclick = () => {
            document.querySelectorAll('.channel-item').forEach(el => el.classList.remove('active'));
            div.classList.add('active');
            currentChannelId = c.id;
            chatHeader.innerText = `# ${c.name}`;
            messageInput.disabled = false;
            socket.emit('get_messages', c.id);
        };
        channelsList.appendChild(div);
    });
});

socket.on('messages_list', ({ channelId, messages }) => {
    if (channelId !== currentChannelId) return;
    messagesContainer.innerHTML = '';
    messages.forEach(renderMessage);
    scrollToBottom();
});

socket.on('new_message', (msg) => {
    if (msg.channelId === currentChannelId) {
        renderMessage(msg);
        scrollToBottom();
    }
});

messageInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter' && currentChannelId) {
        const content = messageInput.value;
        if (content.trim()) {
            socket.emit('send_message', { channelId: currentChannelId, content });
            messageInput.value = '';
        }
    }
});

function renderMessage(msg) {
    const div = document.createElement('div');
    div.className = 'msg-item';
    div.innerHTML = `
        <img class="msg-avatar" src="${msg.author.avatar}" alt="avatar">
        <div>
            <div class="msg-header">
                <span class="msg-author">${msg.author.username}</span>
                <span class="msg-time">${msg.timestamp}</span>
            </div>
            <div class="msg-text">${escapeHtml(msg.content)}</div>
        </div>
    `;
    messagesContainer.appendChild(div);
}

function scrollToBottom() {
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

function escapeHtml(text) {
    return text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}
