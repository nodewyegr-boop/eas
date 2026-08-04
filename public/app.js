const socket = io();

let currentGuildId = null;
let currentChannelId = null;
let selectedFile = null;

const loginOverlay = document.getElementById('login-overlay');
const app = document.getElementById('app');
const tokenInput = document.getElementById('token-input');
const btnLogin = document.getElementById('btn-login');
const loginStatus = document.getElementById('login-status');

const guildsList = document.getElementById('guilds-list');
const channelsList = document.getElementById('channels-list');
const messagesContainer = document.getElementById('messages-container');
const messageInput = document.getElementById('message-input');
const chatHeaderTitle = document.getElementById('chat-header-title');
const sidebarTitle = document.getElementById('sidebar-title');

const fileInput = document.getElementById('file-input');
const filePreview = document.getElementById('file-preview');

btnLogin.addEventListener('click', () => {
    const token = tokenInput.value.trim();
    if (token) {
        loginStatus.innerText = 'Connecting...';
        socket.emit('login', token);
    }
});

socket.on('login_success', ({ user, guilds }) => {
    loginOverlay.classList.add('hidden');
    app.classList.remove('hidden');

    document.getElementById('bot-avatar').src = user.avatar;
    document.getElementById('bot-display-name').innerText = user.globalName;
    document.getElementById('bot-status-text').innerText = `@${user.username}`;

    renderGuilds(guilds);
});

socket.on('login_error', (err) => { loginStatus.innerText = err; });

document.getElementById('btn-dm-tab').addEventListener('click', () => {
    currentGuildId = null;
    sidebarTitle.innerText = 'Direct Messages';
    document.querySelectorAll('.server-item').forEach(el => el.classList.remove('active'));
    document.getElementById('btn-dm-tab').classList.add('active');
    socket.emit('get_dms');
});

function renderGuilds(guilds) {
    guildsList.innerHTML = '';
    guilds.forEach(g => {
        const div = document.createElement('div');
        div.className = 'server-item';
        
        let iconContent = g.icon 
            ? `<img src="${g.icon}" class="server-icon-wrapper">`
            : `<div class="server-icon-wrapper">${g.acronym}</div>`;

        div.innerHTML = `<div class="pill"></div>${iconContent}`;
        
        div.onclick = () => {
            document.querySelectorAll('.server-item').forEach(el => el.classList.remove('active'));
            document.getElementById('btn-dm-tab').classList.remove('active');
            div.classList.add('active');
            currentGuildId = g.id;
            socket.emit('get_channels', g.id);
        };
        guildsList.appendChild(div);
    });
}

socket.on('channels_list', ({ guildName, categories, channels }) => {
    sidebarTitle.innerText = guildName;
    channelsList.innerHTML = '';

    categories.forEach(cat => {
        const catDiv = document.createElement('div');
        catDiv.className = 'category-header';
        catDiv.innerText = `∨ ${cat.name}`;
        channelsList.appendChild(catDiv);

        const catChannels = channels.filter(c => c.parentId === cat.id);
        catChannels.forEach(renderChannelRow);
    });

    const orphanChannels = channels.filter(c => !c.parentId);
    if (orphanChannels.length > 0) {
        orphanChannels.forEach(renderChannelRow);
    }
});

function renderChannelRow(c) {
    const div = document.createElement('div');
    div.className = 'channel-row';
    div.innerHTML = `
        <svg width="18" height="18" viewBox="0 0 24 24"><path fill="currentColor" d="M5.88657 21C5.57547 21 5.3399 20.7189 5.39427 20.4126L6.00001 17H2.59511C2.28401 17 2.04844 16.7189 2.10281 16.4126L2.45747 14.4126C2.5008 14.1683 2.71212 13.9987 2.95988 13.9987H5.46706L6.52928 8H3.12438C2.81328 8 2.57771 7.71889 2.63208 7.41258L2.98674 5.41258C3.03007 5.16829 3.24139 4.99868 3.48915 4.99868H6.99633L7.60207 1.58742C7.65644 1.28111 7.89201 1 8.20311 1H10.2031C10.4509 1 10.6622 1.16961 10.7055 1.4139L11.2721 4.99868H16.2721L16.8778 1.58742C16.9322 1.28111 17.1678 1 17.4789 1H19.4789C19.7267 1 19.938 1.16961 19.9813 1.4139L20.5479 4.99868H23.9528C24.2639 4.99868 24.4995 5.27979 24.4451 5.5861L24.0905 7.5861C24.0471 7.83039 23.8358 8 23.588 8H21.0808L20.0186 14H23.4235C23.7346 14 23.9702 14.2811 23.9158 14.5874L23.5611 16.5874C23.5178 16.8317 23.3065 17 23.0587 17H19.5516L18.9458 20.4126C18.8915 20.7189 18.6559 21 18.3448 21H16.3448C16.097 21 15.8857 20.8304 15.8424 20.5861L15.2758 17H10.2758L9.67007 20.4126C9.6157 20.7189 9.38013 21 9.06903 21H7.06903C6.82127 21 6.60995 20.8304 6.56662 20.5861L5.88657 21ZM10.808 8L9.74578 14H14.7458L15.808 8H10.808Z"/></svg>
        <span>${c.name}</span>
    `;
    div.onclick = () => {
        document.querySelectorAll('.channel-row').forEach(el => el.classList.remove('active'));
        div.classList.add('active');
        currentChannelId = c.id;
        document.getElementById('header-icon').innerText = '#';
        chatHeaderTitle.innerText = c.name;
        messageInput.disabled = false;
        messageInput.placeholder = `Message #${c.name}`;
        socket.emit('get_messages', c.id);
    };
    channelsList.appendChild(div);
}

socket.on('dms_list', (dms) => {
    channelsList.innerHTML = '';
    dms.forEach(d => {
        const div = document.createElement('div');
        div.className = 'channel-row';
        div.innerHTML = `
            <img src="${d.recipient.avatar}" style="width:20px;height:20px;border-radius:50%;">
            <span>${d.recipient.username}</span>
        `;
        div.onclick = () => {
            document.querySelectorAll('.channel-row').forEach(el => el.classList.remove('active'));
            div.classList.add('active');
            currentChannelId = d.id;
            document.getElementById('header-icon').innerText = '@';
            chatHeaderTitle.innerText = d.recipient.username;
            messageInput.disabled = false;
            messageInput.placeholder = `Message @${d.recipient.username}`;
            socket.emit('get_messages', d.id);
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

document.getElementById('btn-attach').addEventListener('click', () => fileInput.click());

fileInput.addEventListener('change', (e) => {
    if (e.target.files.length > 0) {
        selectedFile = e.target.files[0];
        filePreview.innerText = selectedFile.name;
        filePreview.classList.remove('hidden');
    }
});

messageInput.addEventListener('keypress', async (e) => {
    if (e.key === 'Enter' && currentChannelId) {
        const content = messageInput.value.trim();
        let fileData = null;

        if (selectedFile) {
            const buffer = await selectedFile.arrayBuffer();
            fileData = { name: selectedFile.name, buffer };
        }

        if (content || fileData) {
            socket.emit('send_message', { channelId: currentChannelId, content, file: fileData });
            messageInput.value = '';
            selectedFile = null;
            fileInput.value = '';
            filePreview.classList.add('hidden');
        }
    }
});

function renderMessage(msg) {
    const div = document.createElement('div');
    div.className = 'message-wrapper';

    let mediaHtml = '';
    if (msg.attachments && msg.attachments.length > 0) {
        msg.attachments.forEach(a => {
            if (a.contentType && a.contentType.includes('video')) {
                mediaHtml += `<video src="${a.url}" controls class="msg-media-attachment"></video>`;
            } else {
                mediaHtml += `<img src="${a.url}" class="msg-media-attachment">`;
            }
        });
    }

    div.innerHTML = `
        <img class="msg-avatar" src="${msg.author.avatar}">
        <div class="msg-content-box">
            <div class="msg-title-bar">
                <span class="msg-author-name">${msg.author.globalName}</span>
                <span class="msg-timestamp">${msg.timestamp}</span>
            </div>
            ${msg.content ? `<div class="msg-text-body">${escapeHtml(msg.content)}</div>` : ''}
            ${mediaHtml}
        </div>
    `;
    messagesContainer.appendChild(div);
}

function scrollToBottom() { messagesContainer.scrollTop = messagesContainer.scrollHeight; }
function escapeHtml(text) { return text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;"); }
