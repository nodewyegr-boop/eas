class ChannelSidebar {
  constructor(container, options = {}) {
    this.container = container;
    this.onSelectChannel = options.onSelectChannel;
    this.onOpenSettings = options.onOpenSettings;
    this.onToggleMute = options.onToggleMute;
    this.onToggleDeafen = options.onToggleDeafen;
    
    this.activeChannelId = null;
    this.isMuted = false;
    this.isDeafened = false;
  }

  render(guildData, userData) {
    // guildData structure:
    // { name: "Server Name", categories: [ { id: "1", name: "TEXT CHANNELS", channels: [ { id: "101", name: "general", type: "text" } ] } ] }
    
    // userData structure:
    // { username: "Bot Name", discriminator: "0001", avatar: "URL", status: "online" }

    const categoriesHtml = (guildData?.categories || []).map(cat => `
      <div class="channel-category">
        <div class="category-header">
          <span class="category-arrow">▼</span>
          <span class="category-title">${cat.name.toUpperCase()}</span>
        </div>
        <div class="category-channels">
          ${cat.channels.map(ch => {
            const isActive = this.activeChannelId === ch.id ? 'active' : '';
            const icon = ch.type === 'voice' ? '🔊' : '#';
            return `
              <div class="channel-item ${isActive}" data-channel-id="${ch.id}" data-channel-type="${ch.type}">
                <span class="channel-hashtag">${icon}</span>
                <span class="channel-name">${ch.name}</span>
              </div>
            `;
          }).join('')}
        </div>
      </div>
    `).join('');

    this.container.innerHTML = `
      <header class="guild-header">
        <span class="guild-name">${guildData?.name || 'Discord Server'}</span>
        <span class="header-icon">▼</span>
      </header>

      <div class="channel-list-wrapper">
        ${categoriesHtml}
      </div>

      <footer class="user-panel">
        <div class="user-info" id="btn-user-profile">
          <div class="avatar-container">
            <img src="${userData?.avatar || 'https://cdn.discordapp.com/embed/avatars/0.png'}" alt="Avatar" />
            <div class="status-indicator ${userData?.status || 'online'}"></div>
          </div>
          <div class="user-details">
            <div class="username">${userData?.username || 'Bot User'}</div>
            <div class="user-tag">#${userData?.discriminator || '0000'}</div>
          </div>
        </div>
        <div class="user-controls">
          <button class="btn-icon ${this.isMuted ? 'muted' : ''}" id="btn-mute" title="Mute Microphone">
            ${this.isMuted ? '🔇' : '🎤'}
          </button>
          <button class="btn-icon ${this.isDeafened ? 'deafened' : ''}" id="btn-deafen" title="Deafen Sound">
            ${this.isDeafened ? '🔇' : '🎧'}
          </button>
          <button class="btn-icon" id="btn-open-settings" title="User Settings">⚙️</button>
        </div>
      </footer>
    `;

    this.attachEvents();
  }

  attachEvents() {
    // Channel selection click
    this.container.querySelectorAll('.channel-item').forEach(item => {
      item.addEventListener('click', (e) => {
        const channelId = e.currentTarget.getAttribute('data-channel-id');
        const channelType = e.currentTarget.getAttribute('data-channel-type');
        this.setActiveChannel(channelId);
        
        if (this.onSelectChannel) {
          this.onSelectChannel(channelId, channelType);
        }
      });
    });

    // Mute toggle button
    const btnMute = this.container.querySelector('#btn-mute');
    if (btnMute) {
      btnMute.addEventListener('click', () => {
        this.isMuted = !this.isMuted;
        btnMute.innerText = this.isMuted ? '🔇' : '🎤';
        btnMute.classList.toggle('muted', this.isMuted);
        
        if (this.onToggleMute) {
          this.onToggleMute(this.isMuted);
        }
      });
    }

    // Deafen toggle button
    const btnDeafen = this.container.querySelector('#btn-deafen');
    if (btnDeafen) {
      btnDeafen.addEventListener('click', () => {
        this.isDeafened = !this.isDeafened;
        btnDeafen.innerText = this.isDeafened ? '🔇' : '🎧';
        btnDeafen.classList.toggle('deafened', this.isDeafened);
        
        if (this.onToggleDeafen) {
          this.onToggleDeafen(this.isDeafened);
        }
      });
    }

    // User Settings button
    const btnSettings = this.container.querySelector('#btn-open-settings');
    if (btnSettings) {
      btnSettings.addEventListener('click', () => {
        if (this.onOpenSettings) {
          this.onOpenSettings();
        }
      });
    }
  }

  setActiveChannel(channelId) {
    this.activeChannelId = channelId;
    this.container.querySelectorAll('.channel-item').forEach(item => {
      if (item.getAttribute('data-channel-id') === channelId) {
        item.classList.add('active');
      } else {
        item.classList.remove('active');
      }
    });
  }
}

module.exports = ChannelSidebar;
