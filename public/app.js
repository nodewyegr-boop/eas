let currentGuildId = null;
let currentChannelId = null;

// HASH ICON SVG
const hashSvg = `<svg class="channel-icon" viewBox="0 0 24 24"><path d="M5.88657 21C5.57547 21 5.3399 20.7189 5.39427 20.4126L6.00001 17H2.59511C2.28401 17 2.04844 16.7189 2.10281 16.4126L2.36948 14.9126C2.40933 14.6883 2.60423 14.5246 2.83151 14.5246H5.56001L6.4489 9.5H3.044L2.7329 2.49733 2.2212 2.60561L2.87228 0.414922H5.56001L6.4489 9.5H3.044Z"/></svg>`;

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
      document.getElementById('member-bot-img').src = data.user.avatar;
      document.getElementById('member-bot-username').innerText = data.user.username;

      loadGuilds();
    } else {
      document.getElementById('login-error').innerText = data.message;
    }
  } catch (err) {
    document.getElementById('login-error').innerText = 'ไม่สามารถเชื่อมต่อ Server ได้';
  }
});

async function loadGuilds() {
  const res = await fetch('/api/guilds');
  const guilds = await res.json();
  const container = document.getElementById('guild-list-container');
  container.innerHTML = '';

  guilds.forEach(guild => {
    const wrapper = document.createElement('div');
    wrapper.className = 'server-icon-wrapper';
    wrapper.onclick = () => selectGuild(guild.id, guild.name, wrapper);

    const iconContent = guild.icon 
      ? `<img src="${guild.icon}" alt="${guild.name}" />`
      : guild.acronym;

    wrapper.innerHTML = `
      <div class="pill-indicator"></div>
      <div class="server-icon" title="${guild.name}">${iconContent}</div>
    `;
    container.appendChild(wrapper);
  });

  if (guilds.length > 0) {
    selectGuild(guilds[0].id, guilds[0].name, container.firstChild);
  }
}

async function selectGuild(guildId, guildName, element) {
  currentGuildId = guildId;
  document.querySelectorAll('.server-icon-wrapper').forEach(e => e.classList.remove('active'));
  if (element) element.classList.add('active');
  
  document.getElementById('guild-title-name').innerText = guildName;

  const res = await fetch(`/api/guilds/${guildId}/channels`);
  const data = await res.json();
  
  const container = document.getElementById('channel-list-container');
  container.innerHTML = '';

  // Render Categorized Channels
  data.categories.forEach(cat => {
    if (cat.channels.length === 0) return;
    const catDiv = document.createElement('div');
    catDiv.className = 'channel-category';
    catDiv.innerHTML = `<div class="category-header"><span>▼</span> ${cat.name}</div>`;
    
    cat.channels.forEach(ch => {
      const item = document.createElement('div');
      item.className = 'channel-item';
      item.innerHTML = `${hashSvg} <span>${ch.name}</span>`;
      item.onclick = () => selectChannel(ch.id, ch.name, item);
      catDiv.appendChild(item);
    });
    container.appendChild(catDiv);
  });

  // Select First Channel automatically
  const firstChannel = container.querySelector('.channel-item');
  if (firstChannel) firstChannel.click();
}

async function selectChannel(channelId, channelName, element) {
  currentChannelId = channelId;
  document.querySelectorAll('.channel-item').forEach(e => e.classList.remove('active'));
  if (element) element.classList.add('active');

  document.getElementById('current-channel-title').innerText = channelName;
  document.getElementById('chat-input').placeholder = `ส่งข้อความใน #${channelName}`;

  const res = await fetch(`/api/channels/${channelId}/messages`);
  const messages = await res.json();
  
  const chatContainer = document.getElementById('chat-messages');
  chatContainer.innerHTML = messages.map(msg => `
    <div class="message-group">
      <img src="${msg.author.avatar}" class="message-avatar" />
      <div>
        <div class="message-header">
          <span class="message-author">${msg.author.username}</span>
          ${msg.author.isBot ? '<span class="bot-badge">BOT</span>' : ''}
          <span class="message-timestamp">${msg.timestamp}</span>
        </div>
        <div class="message-body">${msg.content}</div>
        ${msg.embeds.map(e => `
          <div class="discord-embed" style="border-left-color: ${e.color};">
            ${e.title ? `<div class="embed-title">${e.title}</div>` : ''}
            ${e.description ? `<div class="embed-description">${e.description}</div>` : ''}
          </div>
        `).join('')}
      </div>
    </div>
  `).join('');
}
