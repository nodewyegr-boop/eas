const socket = io();

let currentGuildId = null;
let currentChannelId = null;

const loginOverlay = document.getElementById('login-overlay');
const app = document.getElementById('app');
const tokenInput = document.getElementById('token-input');
const btnLogin = document.getElementById('btn-login');
const loginStatus = document.getElementById('login-status');

const guildsScroll = document.getElementById('guilds-scroll');
const channelsScroller = document.getElementById('channels-scroller');
const messagesScroller = document.getElementById('messages-scroller');
const memberListScroller = document.getElementById('member-list-scroller');
const chatInput = document.getElementById('chat-input');

btnLogin.addEventListener('click', () => {
    const token = tokenInput.value.trim();
    if (token) {
        loginStatus.innerText = 'กำลังตรวจสอบ Token...';
        socket.emit('login', token);
    }
});

socket.on('login_success', ({ user, guilds }) => {
    loginOverlay.classList.add('hidden');
    app.classList.remove('hidden');

    document.getElementById('self-avatar').src = user.avatar;
    document.getElementById('self-display-name').innerText = user.globalName;
    document.getElementById('self-tag').innerText = `@${user.username}`;

    renderGuilds(guilds);
});

socket.on('login_error', (err) => { loginStatus.innerText = err; });

function renderGuilds(guilds) {
    guildsScroll.innerHTML = '';
    guilds.forEach(g => {
        const item = document.createElement('div');
        item.className = 'guild-item';
        item.title = g.name;
        item.innerHTML = `
            <div class="pill-indicator"></div>
            <div class="guild-icon-wrapper">
                ${g.icon ? `<img src="${g.icon}">` : g.acronym}
            </div>
        `;

        item.onclick = () => {
            document.querySelectorAll('.guild-item').forEach(el => el.classList.remove('active'));
            item.classList.add('active');
            currentGuildId = g.id;
            socket.emit('get_channels', g.id);
            socket.emit('get_guild_members', g.id);
        };

        guildsScroll.appendChild(item);
    });
}

socket.on('channels_list', ({ guildName, categories, channels }) => {
    document.getElementById('guild-name-title').innerText = guildName;
    channelsScroller.innerHTML = '';

    categories.forEach(cat => {
        const catHeader = document.createElement('div');
        catHeader.className = 'category-title';
        catHeader.innerText = `∨ ${cat.name}`;
        channelsScroller.appendChild(catHeader);

        const catChannels = channels.filter(c => c.parentId === cat.id);
        catChannels.forEach(c => {
            const row = document.createElement('div');
            row.className = 'channel-row';

            if (c.type === 'text') {
                row.innerHTML = `<span># ${c.name}</span>`;
                row.onclick = () => {
                    document.querySelectorAll('.channel-row').forEach(el => el.classList.remove('active'));
                    row.classList.add('active');
                    currentChannelId = c.id;
                    document.getElementById('chat-title').innerText = c.name;
                    chatInput.disabled = false;
                    chatInput.placeholder = `ส่งข้อความใน #${c.name}`;
                    socket.emit('get_messages', c.id);
                };
                channelsScroller.appendChild(row);
            } else if (c.type === 'voice') {
                row.innerHTML = `<span>🔊 ${c.name}</span>`;
                channelsScroller.appendChild(row);

                if (c.members && c.members.length > 0) {
                    const vcTree = document.createElement('div');
                    vcTree.className = 'vc-user-list';
                    c.members.forEach(m => {
                        const uRow = document.createElement('div');
                        uRow.className = 'vc-user-item';
                        uRow.innerHTML = `
                            <img src="${m.avatar}" class="vc-user-avatar">
                            <span>${m.globalName}</span>
                        `;
                        vcTree.appendChild(uRow);
                    });
                    channelsScroller.appendChild(vcTree);
                }
            }
        });
    });
});

// Render Member List
socket.on('guild_members_list', (members) => {
    memberListScroller.innerHTML = '';
    
    // Group members by role
    const onlineMembers = members.filter(m => m.status !== 'offline');
    const offlineMembers = members.filter(m => m.status === 'offline');

    renderMemberGroup(`ออนไลน์ — ${onlineMembers.length}`, onlineMembers);
    renderMemberGroup(`ออฟไลน์ — ${offlineMembers.length}`, offlineMembers);
});

function renderMemberGroup(title, list) {
    if (list.length === 0) return;
    const header = document.createElement('div');
    header.className = 'role-header';
    header.innerText = title;
    memberListScroller.appendChild(header);

    list.forEach(m => {
        const row = document.createElement('div');
        row.className = 'member-row';
        row.innerHTML = `
            <div class="avatar-container">
                <img src="${m.avatar}">
                <div class="status-dot ${m.status}"></div>
            </div>
            <div>
                <div style="color:${m.highestRole.color}; font-weight:bold; font-size:14px;">${m.globalName}</div>
                <div style="color:var(--text-muted); font-size:12px;">${m.customStatus}</div>
            </div>
        `;
        memberListScroller.appendChild(row);
    });
}

socket.on('messages_list', ({ messages }) => {
    messagesScroller.innerHTML = '';
    messages.forEach(renderMessage);
    messagesScroller.scrollTop = messagesScroller.scrollHeight;
});

socket.on('new_message', (msg) => {
    if (msg.channelId === currentChannelId) {
        renderMessage(msg);
        messagesScroller.scrollTop = messagesScroller.scrollHeight;
    }
});

chatInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter' && chatInput.value.trim() && currentChannelId) {
        socket.emit('send_message', { channelId: currentChannelId, content: chatInput.value.trim() });
        chatInput.value = '';
    }
});

function renderMessage(m) {
    const card = document.createElement('div');
    card.className = 'msg-card';
    card.innerHTML = `
        <img src="${m.author.avatar}" class="msg-avatar">
        <div>
            <div class="msg-header">
                <span class="msg-author">${m.author.globalName}</span>
                <span class="msg-time">${m.timestamp}</span>
            </div>
            <div class="msg-content">${m.content}</div>
        </div>
    `;
    messagesScroller.appendChild(card);
}
