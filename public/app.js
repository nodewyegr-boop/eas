const socket = io();

let currentGuildId = null;
let currentChannelId = null;
let activeContextMenuMsg = null;
let selectedFiles = [];

const hashSvg = `<svg class="channel-icon" viewBox="0 0 24 24"><path d="M5.88657 21C5.57547 21 5.3399 20.7189 5.39427 20.4126L6.00001 17H2.59511C2.28401 17 2.04844 16.7189 2.10281 16.4126L2.36948 14.9126C2.40933 14.6883 2.60423 14.5246 2.83151 14.5246H5.56001L6.4489 9.5H3.044L2.7329 2.49733 2.2212 2.60561L2.87228 0.414922H5.56001L6.4489 9.5H3.044Z"/></svg>`;

// Real-time Gateway Listener
socket.on('messageCreate', (msg) => {
  if (msg.channelId === currentChannelId) {
    appendSingleMessage(msg);
  }
});

socket.on('messageDelete', ({ id, channelId }) => {
  if (channelId === currentChannelId) {
    const el = document.getElementById(`msg-${id}`);
    if (el) el.remove();
  }
});

// LOGIN
document.getElementById('btn-login').addEventListener('click', async () => {
  const token = document.getElementById('bot-token').value.trim();
  if (!token) return;

  try {
    const res = await fetch('/api/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token })
    });
    const data = await res.json();

    if (data.success) {
      document.getElementById('login-overlay').style.display = 'none';
      document.getElementById('app').style.display = 'flex';

      document.getElementById('user-avatar-img').src = data.user.avatar;
      document.getElementById('user-display-name').innerText = data.user.username;
      document.getElementById('user-display-tag').innerText = `#${data.user.discriminator}`;

      loadGuilds();
      loadDMs();
    } else {
      document.getElementById('login-error').innerText = data.message;
    }
  } catch (err) {
    document.getElementById('login-error').innerText = 'ไม่สามารถเชื่อมต่อได้';
  }
});

// DM HOME BUTTON
document.getElementById('btn-dm-home').onclick = () => {
  currentGuildId = null;
  document.querySelectorAll('.server-icon-wrapper').forEach(e => e.classList.remove('active'));
  document.getElementById('btn-dm-home').classList.add('active');
  document.getElementById('guild-title-name').innerText = 'Direct Messages';
  loadDMs();
};

async function loadDMs() {
  const res = await fetch('/api/dms');
  const dms = await res.json();
  const container = document.getElementById('channel-list-container');
  container.innerHTML = '';

  dms.forEach(dm => {
    const item = document.createElement('div');
    item.className = 'channel-item';
    item.innerHTML = `<img src="${dm.recipient.avatar}" style="width:20px;height:20px;border-radius:50%;" /> <span>${dm.recipient.username}</span>`;
    item.onclick = () => selectChannel(dm.id, dm.recipient.username, item);
    container.appendChild(item);
  });
}

// LOAD GUILDS
async function loadGuilds() {
  const res = await fetch('/api/guilds');
  const guilds = await res.json();
  const container = document.getElementById('guild-list-container');
  container.innerHTML = '';

  guilds.forEach(guild => {
    const wrapper = document.createElement('div');
    wrapper.className = 'server-icon-wrapper';
    wrapper.onclick = () => selectGuild(guild.id, guild.name, wrapper);

    const iconContent = guild.icon ? `<img src="${guild.icon}" />` : guild.acronym;
    wrapper.innerHTML = `<div class="pill-indicator"></div><div class="server-icon" title="${guild.name}">${iconContent}</div>`;
    container.appendChild(wrapper);
  });
}

// SELECT GUILD & RENDER COLLAPSIBLE CATEGORIES
async function selectGuild(guildId, guildName, element) {
  currentGuildId = guildId;
  document.querySelectorAll('.server-icon-wrapper').forEach(e => e.classList.remove('active'));
  if (element) element.classList.add('active');

  document.getElementById('guild-title-name').innerText = guildName;

  const res = await fetch(`/api/guilds/${guildId}/channels`);
  const data = await res.json();

  const container = document.getElementById('channel-list-container');
  container.innerHTML = '';

  data.categories.forEach(cat => {
    if (cat.channels.length === 0) return;

    const catDiv = document.createElement('div');
    const header = document.createElement('div');
    header.className = 'category-header';
    header.innerHTML = `<span class="arrow">▼</span> ${cat.name}`;

    const channelGroup = document.createElement('div');
    channelGroup.className = 'category-channels';

    // Collapsible Logic
    header.onclick = () => {
      header.classList.toggle('collapsed');
      channelGroup.classList.toggle('hidden');
    };

    cat.channels.forEach(ch => {
      const item = document.createElement('div');
      item.className = 'channel-item';
      item.innerHTML = `${hashSvg} <span>${ch.name}</span>`;
      item.onclick = () => selectChannel(ch.id, ch.name, item);
      channelGroup.appendChild(item);
    });

    catDiv.appendChild(header);
    catDiv.appendChild(channelGroup);
    container.appendChild(catDiv);
  });

  loadMembers(guildId);
}

// SELECT CHANNEL
async function selectChannel(channelId, channelName, element) {
  currentChannelId = channelId;
  document.querySelectorAll('.channel-item').forEach(e => e.classList.remove('active'));
  if (element) element.classList.add('active');

  document.getElementById('current-channel-title').innerText = channelName;
  document.getElementById('chat-input').placeholder = `ส่งข้อความใน #${channelName}`;

  const res = await fetch(`/api/channels/${channelId}/messages`);
  const messages = await res.json();

  const chatContainer = document.getElementById('chat-messages');
  chatContainer.innerHTML = '';
  messages.forEach(appendSingleMessage);
}

// APPEND MESSAGE (IMAGE + CONTEXT MENU)
function appendSingleMessage(msg) {
  const chatContainer = document.getElementById('chat-messages');
  const div = document.createElement('div');
  div.className = 'message-group';
  div.id = `msg-${msg.id}`;

  const attachmentsHtml = msg.attachments.map(a => {
    if (a.contentType?.startsWith('image/') || a.url.match(/\.(png|jpg|jpeg|gif|webp)$/i)) {
      return `<br/><img src="${a.url}" class="attachment-img" onclick="window.open('${a.url}')" />`;
    }
    return `<br/><a href="${a.url}" target="_blank" style="color:var(--text-link);">${a.name}</a>`;
  }).join('');

  div.innerHTML = `
    <img src="${msg.author.avatar}" class="message-avatar" />
    <div>
      <div class="message-header">
        <span class="message-author">${msg.author.username}</span>
        ${msg.author.isBot ? '<span class="bot-badge">BOT</span>' : ''}
        <span class="message-timestamp">${msg.timestamp}</span>
      </div>
      <div class="message-body">${msg.content} ${attachmentsHtml}</div>
    </div>
  `;

  // Right-Click Context Menu
  div.oncontextmenu = (e) => {
    e.preventDefault();
    activeContextMenuMsg = msg;
    const cm = document.getElementById('context-menu');
    cm.style.top = `${e.clientY}px`;
    cm.style.left = `${e.clientX}px`;
    cm.style.display = 'block';
  };

  chatContainer.appendChild(div);
  chatContainer.scrollTop = chatContainer.scrollHeight;
}

// CONTEXT MENU ACTIONS
document.onclick = () => document.getElementById('context-menu').style.display = 'none';

document.getElementById('cm-copy').onclick = () => {
  if (activeContextMenuMsg) navigator.clipboard.writeText(activeContextMenuMsg.content);
};

document.getElementById('cm-delete').onclick = async () => {
  if (activeContextMenuMsg) {
    await fetch(`/api/channels/${activeContextMenuMsg.channelId}/messages/${activeContextMenuMsg.id}`, { method: 'DELETE' });
  }
};

// IMAGE UPLOADER HANDLER
document.getElementById('btn-upload').onclick = () => document.getElementById('file-input').click();

document.getElementById('file-input').onchange = (e) => {
  selectedFiles = Array.from(e.target.files);
  document.getElementById('chat-input').focus();
};

document.getElementById('chat-input').onkeydown = async (e) => {
  if (e.key === 'Enter' && !e.shiftKey) {
    const content = e.target.value.trim();
    if (!content && selectedFiles.length === 0) return;

    const formData = new FormData();
    formData.append('content', content);
    selectedFiles.forEach(f => formData.append('files', f));

    e.target.value = '';
    selectedFiles = [];
    document.getElementById('file-input').value = '';

    await fetch(`/api/channels/${currentChannelId}/messages`, {
      method: 'POST',
      body: formData
    });
  }
};

// MEMBER LIST TOGGLE & LOAD
document.getElementById('btn-toggle-members').onclick = () => {
  document.getElementById('member-sidebar').classList.toggle('hidden');
};

async function loadMembers(guildId) {
  const res = await fetch(`/api/guilds/${guildId}/members`);
  const members = await res.json();
  const container = document.getElementById('member-list-container');
  document.getElementById('member-count-title').innerText = `MEMBERS — ${members.length}`;
  container.innerHTML = '';

  members.forEach(m => {
    const item = document.createElement('div');
    item.className = 'member-item';
    item.innerHTML = `
      <img src="${m.avatar}" />
      <span style="color:#fff;font-size:14px;">${m.nickname}</span>
      ${m.isBot ? '<span class="bot-badge">BOT</span>' : ''}
    `;
    container.appendChild(item);
  });
}

// USER PROFILE MODAL & STATUS UPDATER
document.getElementById('btn-open-settings').onclick = () => {
  document.getElementById('profile-modal').style.display = 'flex';
};

document.getElementById('btn-save-profile').onclick = async () => {
  const status = document.getElementById('status-select').value;
  const customStatus = document.getElementById('custom-status-text').value;

  await fetch('/api/user/status', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status, customStatus })
  });

  const dot = document.getElementById('user-status-dot');
  dot.className = `status-indicator ${status}`;
  document.getElementById('profile-modal').style.display = 'none';
};
