const socket = io();

let currentGuildId = null;
let currentChannelId = null;
let activeUserId = null;
let selectedFile = null;

// UI Elements
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

const fileInput = document.getElementById('file-input');
const filePreview = document.getElementById('file-preview');

// Modals
const editBotModal = document.getElementById('edit-bot-modal');
const userProfileModal = document.getElementById('user-profile-modal');
const editGuildModal = document.getElementById('edit-guild-modal');

// Actions
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
    document.getElementById('bot-username').innerText = user.username;

    renderGuilds(guilds);
});

socket.on('login_error', (err) => { loginStatus.innerText = err; });

// Tab DM
document.getElementById('btn-dm-tab').addEventListener('click', () => {
    currentGuildId = null;
    guildName.innerText = 'Direct Messages';
    document.getElementById('btn-guild-settings').classList.add('hidden');
    document.getElementById('btn-create-invite').classList.add('hidden');
    socket.emit('get_dms');
});

function renderGuilds(guilds) {
    guildsList.innerHTML = '';
    guilds.forEach(g => {
        const div = document.createElement('div');
        div.className = 'guild-icon';
        if (g.icon.includes('http')) {
            div.innerHTML = `<img src="${g.icon}" style="width:100%;height:100%;border-radius:inherit;">`;
        } else {
            div.innerText = g.name.substring(0, 2);
        }
        div.onclick = () => {
            currentGuildId = g.id;
            document.getElementById('btn-guild-settings').classList.remove('hidden');
            document.getElementById('btn-create-invite').classList.remove('hidden');
            socket.emit('get_channels', g.id);
        };
        guildsList.appendChild(div);
    });
}

socket.on('channels_list', ({ guildName: name, channels }) => {
    guildName.innerText = name;
    channelsList.innerHTML = '';
    channels.forEach(c => {
        const div = document.createElement('div');
        div.className = 'channel-item';
        div.innerText = `# ${c.name}`;
        div.onclick = () => {
            currentChannelId = c.id;
            chatHeader.innerText = `# ${c.name}`;
            messageInput.disabled = false;
            socket.emit('get_messages', c.id);
        };
        channelsList.appendChild(div);
    });
});

socket.on('dms_list', (dms) => {
    channelsList.innerHTML = '';
    dms.forEach(d => {
        const div = document.createElement('div');
        div.className = 'channel-item';
        div.innerText = `@ ${d.recipient.username}`;
        div.onclick = () => {
            currentChannelId = d.id;
            chatHeader.innerText = `@ ${d.recipient.username}`;
            messageInput.disabled = false;
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

// ส่งข้อความ + ไฟล์/รูปภาพ/วิดีโอ/GIF
document.getElementById('btn-attach').addEventListener('click', () => fileInput.click());

fileInput.addEventListener('change', (e) => {
    if (e.target.files.length > 0) {
        selectedFile = e.target.files[0];
        filePreview.innerText = `📎 ${selectedFile.name}`;
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

// Render Message & Reactions & Profiles
function renderMessage(msg) {
    const div = document.createElement('div');
    div.className = 'msg-item';

    let mediaHtml = '';
    if (msg.attachments && msg.attachments.length > 0) {
        msg.attachments.forEach(a => {
            if (a.contentType && a.contentType.includes('video')) {
                mediaHtml += `<video src="${a.url}" controls class="msg-media"></video>`;
            } else {
                mediaHtml += `<img src="${a.url}" class="msg-media" alt="attachment">`;
            }
        });
    }

    let reactionsHtml = '<div class="reactions-list">';
    if (msg.reactions) {
        msg.reactions.forEach(r => {
            reactionsHtml += `<span class="reaction-badge">${r.emoji} ${r.count}</span>`;
        });
    }
    reactionsHtml += `<button class="btn-add-react" onclick="addReaction('${msg.channelId}', '${msg.id}')">➕</button></div>`;

    div.innerHTML = `
        <img class="msg-avatar" src="${msg.author.avatar}" onclick="openUserProfile('${msg.author.id}')">
        <div>
            <div class="msg-header">
                <span class="msg-author" onclick="openUserProfile('${msg.author.id}')">${msg.author.username}</span>
                <span class="msg-time">${msg.timestamp}</span>
            </div>
            ${msg.content ? `<div class="msg-text">${escapeHtml(msg.content)}</div>` : ''}
            ${mediaHtml}
            ${reactionsHtml}
        </div>
    `;
    messagesContainer.appendChild(div);
}

// กด Reaction
window.addReaction = (channelId, messageId) => {
    const emoji = prompt('พิมพ์ Emoji ที่ต้องการกดรีแอค (เช่น ❤️ หรือ 😂):', '❤️');
    if (emoji) {
        socket.emit('add_reaction', { channelId, messageId, emoji });
    }
};

// ดูโปรไฟล์คนอื่น
window.openUserProfile = (userId) => {
    activeUserId = userId;
    socket.emit('get_user_profile', { userId, guildId: currentGuildId });
};

socket.on('user_profile_data', (data) => {
    document.getElementById('p-avatar').src = data.avatar;
    document.getElementById('p-username').innerText = data.username;
    document.getElementById('p-tag').innerText = `@${data.username}`;
    document.getElementById('p-created').innerText = data.createdAt;
    document.getElementById('p-joined').innerText = data.joinedAt || 'ไม่ได้อยู่ในเซิร์ฟเวอร์นี้';
    document.getElementById('p-roles').innerText = data.roles.join(', ') || 'ไม่มี';

    userProfileModal.classList.remove('hidden');
});

document.getElementById('btn-start-dm').addEventListener('click', () => {
    if (activeUserId) {
        socket.emit('open_dm', activeUserId);
        userProfileModal.classList.add('hidden');
    }
});

socket.on('dm_opened', (dm) => {
    currentChannelId = dm.id;
    chatHeader.innerText = `@ ${dm.recipient.username}`;
    messageInput.disabled = false;
    socket.emit('get_messages', dm.id);
});

document.getElementById('btn-close-user-profile').addEventListener('click', () => {
    userProfileModal.classList.add('hidden');
});

// แก้ไขโปรไฟล์บอท
document.getElementById('btn-open-edit-profile').addEventListener('click', () => {
    editBotModal.classList.remove('hidden');
});
document.getElementById('btn-close-edit-profile').addEventListener('click', () => {
    editBotModal.classList.add('hidden');
});

document.getElementById('btn-save-profile').addEventListener('click', () => {
    const username = document.getElementById('edit-username').value.trim();
    const avatar = document.getElementById('edit-avatar').value.trim();
    const statusText = document.getElementById('edit-status').value.trim();

    socket.emit('update_bot_profile', { username, avatar, statusText });
    editBotModal.classList.add('hidden');
});

socket.on('profile_updated', (data) => {
    document.getElementById('bot-username').innerText = data.username;
    document.getElementById('bot-avatar').src = data.avatar;
    alert('อัปเดตโปรไฟล์บอทสำเร็จแล้ว!');
});

// สร้างลิงก์เชิญ & แก้ไขเซิร์ฟเวอร์
document.getElementById('btn-create-invite').addEventListener('click', () => {
    if (currentChannelId) socket.emit('create_invite', currentChannelId);
});

socket.on('invite_created', (url) => {
    prompt('คัดลอกลิงก์เชิญเซิร์ฟเวอร์นี้:', url);
});

document.getElementById('btn-guild-settings').addEventListener('click', () => {
    editGuildModal.classList.remove('hidden');
});
document.getElementById('btn-close-edit-guild').addEventListener('click', () => {
    editGuildModal.classList.add('hidden');
});

document.getElementById('btn-save-guild').addEventListener('click', () => {
    const name = document.getElementById('edit-guild-name').value.trim();
    const icon = document.getElementById('edit-guild-icon').value.trim();

    if (currentGuildId) {
        socket.emit('edit_guild', { guildId: currentGuildId, name, icon });
        editGuildModal.classList.add('hidden');
    }
});

socket.on('error', (err) => alert(`[Error]: ${err}`));

function scrollToBottom() { messagesContainer.scrollTop = messagesContainer.scrollHeight; }
function escapeHtml(text) { return text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;"); }
