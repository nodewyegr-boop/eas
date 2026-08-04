const socket = io();

let currentChannelId = null;

const loginModal = document.getElementById('login-modal');
const app = document.getElementById('app');
const tokenInput = document.getElementById('token-input');
const btnLogin = document.getElementById('btn-login');
const loginError = document.getElementById('login-error');

const guildList = document.getElementById('guild-list');
const channelsList = document.getElementById('channels-list');
const messagesList = document.getElementById('messages-list');
const membersList = document.getElementById('members-list');
const chatInput = document.getElementById('chat-input');

btnLogin.addEventListener('click', () => {
    const token = tokenInput.value.trim();
    if (token) {
        loginError.innerText = 'กำลังเชื่อมต่อ...';
        socket.emit('login', token);
    }
});

socket.on('login_success', ({ user, guilds }) => {
    loginModal.classList.add('hidden');
    app.classList.remove('hidden');

    document.getElementById('self-avatar').src = user.avatar;
    document.getElementById('self-name').innerText = user.globalName;
    document.getElementById('self-tag').innerText = `@${user.username}`;

    renderGuilds(guilds);
});

socket.on('login_error', (err) => { loginError.innerText = err; });

function renderGuilds(guilds) {
    guildList.innerHTML = '';
    guilds.forEach(g => {
        const item = document.createElement('div');
        item.className = 'guild-item';
        item.title = g.name;
        item.innerHTML = `
            <div class="pill"></div>
            <div class="guild-icon">
                ${g.icon ? `<img src="${g.icon}">` : g.acronym}
            </div>
        `;

        item.onclick = () => {
            document.querySelectorAll('.guild-item').forEach(el => el.classList.remove('active'));
            item.classList.add('active');
            socket.emit('get_channels', g.id);
            socket.emit('get_guild_members', g.id);
        };

        guildList.appendChild(item);
    });
}

socket.on('channels_list', ({ guildName, categories, channels }) => {
    document.getElementById('guild-title').innerText = guildName;
    channelsList.innerHTML = '';

    categories.forEach(cat => {
        const catHeader = document.createElement('div');
        catHeader.className = 'category-header';
        catHeader.innerText = `∨ ${cat.name}`;
        channelsList.appendChild(catHeader);

        const catChannels = channels.filter(c => c.parentId === cat.id);
        catChannels.forEach(c => {
            const row = document.createElement('div');
            row.className = 'channel-item';

            if (c.type === 'text') {
                row.innerHTML = `<span># ${c.name}</span>`;
                row.onclick = () => {
                    document.querySelectorAll('.channel-item').forEach(el => el.classList.remove('active'));
                    row.classList.add('active');
                    currentChannelId = c.id;
                    document.getElementById('channel-title').innerText = c.name;
                    chatInput.disabled = false;
                    chatInput.placeholder = `ส่งข้อความใน #${c.name}`;
                    socket.emit('get_messages', c.id);
                };
                channelsList.appendChild(row);
            } else if (c.type === 'voice') {
                row.innerHTML = `<span>🔊 ${c.name}</span>`;
                channelsList.appendChild(row);

                if (c.members && c.members.length > 0) {
                    const tree = document.createElement('div');
                    tree.className = 'vc-member-tree';
                    c.members.forEach(m => {
                        const mRow = document.createElement('div');
                        mRow.className = 'vc-member-item';
                        mRow.innerHTML = `<img src="${m.avatar}"><span>${m.globalName}</span>`;
                        tree.appendChild(mRow);
                    });
                    channelsList.appendChild(tree);
                }
            }
        });
    });
});

socket.on('guild_members_list', (members) => {
    membersList.innerHTML = '';
    const online = members.filter(m => m.status !== 'offline');
    const offline = members.filter(m => m.status === 'offline');

    renderGroup(`ออนไลน์ — ${online.length}`, online);
    renderGroup(`ออฟไลน์ — ${offline.length}`, offline);
});

function renderGroup(title, list) {
    if (list.length === 0) return;
    const header = document.createElement('div');
    header.className = 'role-title';
    header.innerText = title;
    membersList.appendChild(header);

    list.forEach(m => {
        const item = document.createElement('div');
        item.className = 'member-item';
        item.innerHTML = `
            <div class="avatar-wrap">
                <img src="${m.avatar}">
                <div class="status-dot ${m.status}"></div>
            </div>
            <div style="color:${m.roleColor}; font-weight:bold; font-size:14px;">${m.globalName}</div>
        `;
        membersList.appendChild(item);
    });
}

socket.on('messages_list', ({ messages }) => {
    messagesList.innerHTML = '';
    messages.forEach(renderMessage);
    messagesList.scrollTop = messagesList.scrollHeight;
});

socket.on('new_message', (msg) => {
    if (msg.channelId === currentChannelId) {
        renderMessage(msg);
        messagesList.scrollTop = messagesList.scrollHeight;
    }
});

chatInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter' && chatInput.value.trim() && currentChannelId) {
        socket.emit('send_message', { channelId: currentChannelId, content: chatInput.value.trim() });
        chatInput.value = '';
    }
});

function renderMessage(m) {
    const row = document.createElement('div');
    row.className = 'message-row';
    row.innerHTML = `
        <img src="${m.author.avatar}" class="msg-avatar">
        <div>
            <div class="msg-meta">
                <span class="msg-author">${m.author.globalName}</span>
                <span class="msg-time">${m.timestamp}</span>
            </div>
            <div class="msg-text">${m.content}</div>
        </div>
    `;
    messagesList.appendChild(row);
}
