const socket = io();

let currentUser = null;
let currentGuildId = null;
let currentChannelId = null;

// Element Selectors
const loginOverlay = document.getElementById('login-overlay');
const app = document.getElementById('app');
const tokenInput = document.getElementById('token-input');
const btnLogin = document.getElementById('btn-login');
const loginStatus = document.getElementById('login-status');

const guildsContainer = document.getElementById('guilds-container');
const sidebarHeaderTitle = document.getElementById('sidebar-header-title');
const dmSearchBar = document.getElementById('dm-search-bar');
const sidebarContent = document.getElementById('sidebar-content');

const messagesContainer = document.getElementById('messages-container');
const chatInput = document.getElementById('chat-input');
const chatIcon = document.getElementById('chat-icon');
const chatTitle = document.getElementById('chat-title');
const memberListContainer = document.getElementById('member-list-container');

// Login Event
btnLogin.addEventListener('click', () => {
    const token = tokenInput.value.trim();
    if (token) {
        loginStatus.innerText = 'กำลังเชื่อมต่อ...';
        socket.emit('login', token);
    }
});

socket.on('login_success', ({ user, guilds }) => {
    currentUser = user;
    loginOverlay.classList.add('hidden');
    app.classList.remove('hidden');

    // อัปเดตข้อมูลผู้ใช้มุมซ้ายล่าง
    document.getElementById('self-avatar').src = user.avatar;
    document.getElementById('self-name').innerText = user.globalName;
    document.getElementById('setting-username-input').value = `@${user.username}`;

    renderGuilds(guilds);
    openDMTab(); // เริ่มต้นด้วยหน้า DM
});

socket.on('login_error', (err) => { loginStatus.innerText = err; });

// สลับไปหน้า DM
document.getElementById('btn-dm-tab').addEventListener('click', openDMTab);

function openDMTab() {
    currentGuildId = null;
    sidebarHeaderTitle.innerText = 'ข้อความส่วนตัว';
    dmSearchBar.classList.remove('hidden');
    document.getElementById('member-sidebar').classList.add('hidden');
    document.querySelectorAll('.guild-icon').forEach(el => el.classList.remove('active'));
    document.getElementById('btn-dm-tab').classList.add('active');
    socket.emit('get_dms');
}

// วาดรายการ เซิร์ฟเวอร์
function renderGuilds(guilds) {
    guildsContainer.innerHTML = '';
    guilds.forEach(g => {
        const div = document.createElement('div');
        div.className = 'guild-icon';
        div.title = g.name;
        div.innerHTML = g.icon ? `<img src="${g.icon}">` : g.acronym;
        
        div.onclick = () => {
            document.querySelectorAll('.guild-icon').forEach(el => el.classList.remove('active'));
            div.classList.add('active');
            currentGuildId = g.id;
            dmSearchBar.classList.add('hidden');
            document.getElementById('member-sidebar').classList.remove('hidden');
            socket.emit('get_channels', g.id);
            socket.emit('get_guild_members', g.id);
        };
        guildsContainer.appendChild(div);
    });
}

// วาดรายการ Channels & Voice Channel Tree (ตรงตามภาพ 1)
socket.on('channels_list', ({ guildName, categories, channels }) => {
    sidebarHeaderTitle.innerText = guildName;
    sidebarContent.innerHTML = '';

    categories.forEach(cat => {
        const catDiv = document.createElement('div');
        catDiv.className = 'category-header';
        catDiv.innerText = `∨ ${cat.name}`;
        sidebarContent.appendChild(catDiv);

        const catChannels = channels.filter(c => c.parentId === cat.id);
        catChannels.forEach(c => renderChannelRow(c));
    });
});

function renderChannelRow(c) {
    const div = document.createElement('div');
    div.className = 'channel-item';

    if (c.type === 'text') {
        div.innerHTML = `<span># ${c.name}</span>`;
        div.onclick = () => selectChannel(c);
        sidebarContent.appendChild(div);
    } else if (c.type === 'voice') {
        // Voice Channel Header (ภาพ 1)
        const limitText = c.userLimit > 0 ? `${String(c.memberCount).padStart(2,'0')} / ${c.userLimit}` : `${String(c.memberCount).padStart(2,'0')} / 99`;
        div.innerHTML = `
            <span>🔊 ${c.name}</span>
            <span class="vc-limit">${limitText}</span>
        `;
        sidebarContent.appendChild(div);

        // Voice Members Nested Tree (ภาพ 1)
        if (c.members && c.members.length > 0) {
            const treeDiv = document.createElement('div');
            treeDiv.className = 'vc-members-tree';
            
            c.members.forEach(m => {
                const userRow = document.createElement('div');
                userRow.className = 'vc-user-row';
                userRow.innerHTML = `
                    <div class="vc-user-info">
                        <img src="${m.avatar}" class="vc-user-avatar">
                        <span>${m.globalName}</span>
                    </div>
                    <div class="vc-status-icons">
                        ${m.selfMute ? '🎙️' : ''}
                        ${m.selfDeaf ? '🎧' : ''}
                    </div>
                `;
                userRow.onclick = () => openUserProfile(m);
                treeDiv.appendChild(userRow);
            });
            sidebarContent.appendChild(treeDiv);
        }
    }
}

// วาดรายการ DM List (ตรงตามภาพ 2)
socket.on('dms_list', (dms) => {
    sidebarContent.innerHTML = '';
    dms.forEach(d => {
        const div = document.createElement('div');
        div.className = 'dm-item';
        div.innerHTML = `
            <div class="dm-avatar-box">
                <img src="${d.recipient.avatar}">
                <div class="status-dot ${d.recipient.status}"></div>
            </div>
            <div class="dm-details">
                <div class="dm-name">${d.recipient.globalName}</div>
                <div class="dm-last-msg">${d.lastMessage || 'ไม่มีข้อความล่าสุด'}</div>
            </div>
            <div class="dm-time">${d.timestamp}</div>
        `;
        div.onclick = () => {
            currentChannelId = d.id;
            chatIcon.innerText = '@';
            chatTitle.innerText = d.recipient.globalName;
            chatInput.disabled = false;
            socket.emit('get_messages', d.id);
        };
        sidebarContent.appendChild(div);
    });
});

// วาดรายชื่อสมาชิกฝั่งขวา (Member Sidebar)
socket.on('guild_members_list', (members) => {
    memberListContainer.innerHTML = '';
    members.forEach(m => {
        const div = document.createElement('div');
        div.className = 'member-row';
        div.innerHTML = `
            <div class="dm-avatar-box">
                <img src="${m.avatar}">
                <div class="status-dot ${m.status}"></div>
            </div>
            <div>
                <div style="color:${m.roles[0]?.color || '#fff'}; font-weight:bold; font-size:14px;">${m.globalName}</div>
                <div style="color:var(--text-muted); font-size:12px;">${m.customStatus}</div>
            </div>
        `;
        div.onclick = () => openUserProfile(m);
        memberListContainer.appendChild(div);
    });
});

function selectChannel(c) {
    currentChannelId = c.id;
    chatIcon.innerText = '#';
    chatTitle.innerText = c.name;
    chatInput.disabled = false;
    socket.emit('get_messages', c.id);
}

// ระบบ Chat
socket.on('messages_list', ({ messages }) => {
    messagesContainer.innerHTML = '';
    messages.forEach(renderMessage);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
});

socket.on('new_message', (msg) => {
    if (msg.channelId === currentChannelId) {
        renderMessage(msg);
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }
});

chatInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter' && chatInput.value.trim() && currentChannelId) {
        socket.emit('send_message', { channelId: currentChannelId, content: chatInput.value.trim() });
        chatInput.value = '';
    }
});

function renderMessage(m) {
    const div = document.createElement('div');
    div.className = 'msg-row';
    div.innerHTML = `
        <img src="${m.author.avatar}" class="msg-avatar">
        <div>
            <div>
                <span class="msg-author">${m.author.globalName}</span>
                <span class="msg-time">${m.timestamp}</span>
            </div>
            <div class="msg-body">${m.content}</div>
        </div>
    `;
    messagesContainer.appendChild(div);
}

// ระบบ Modal & Profile Viewer
document.getElementById('btn-self-profile').onclick = () => openUserProfile(currentUser);
document.getElementById('btn-open-settings').onclick = () => document.getElementById('settings-modal').classList.remove('hidden');

function openUserProfile(user) {
    document.getElementById('p-avatar').src = user.avatar;
    document.getElementById('p-global-name').innerText = user.globalName || user.username;
    document.getElementById('p-username').innerText = `@${user.username}`;
    
    const rolesContainer = document.getElementById('p-roles');
    rolesContainer.innerHTML = '';
    if (user.roles) {
        user.roles.forEach(r => {
            const span = document.createElement('span');
            span.style.cssText = `background:${r.color}22; color:${r.color}; padding:2px 8px; border-radius:4px; font-size:12px; font-weight:bold; margin-right:4px;`;
            span.innerText = r.name;
            rolesContainer.appendChild(span);
        });
    }

    document.getElementById('profile-modal').classList.remove('hidden');
}

function closeModal(id) { document.getElementById(id).classList.add('hidden'); }
document.getElementById('btn-logout').onclick = () => location.reload();
