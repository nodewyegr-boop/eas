<!DOCTYPE html>
<html lang="th">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Discord Bot Client UI</title>
  <link rel="stylesheet" href="styles/discord-darkness.css">
</head>
<body>

  <!-- ==================== 1. LOGIN OVERLAY ==================== -->
  <div id="login-overlay" class="login-container">
    <div class="login-card">
      <div class="login-header">
        <div class="discord-logo-icon"></div>
        <h2>ยินดีต้อนรับกลับมา!</h2>
        <p class="subtitle">เข้าสู่ระบบ Discord Client ด้วย Bot Token</p>
      </div>

      <div class="form-group">
        <label for="bot-token">BOT TOKEN <span class="required">*</span></label>
        <input type="password" id="bot-token" class="input-field" placeholder="Paste your bot token here..." autocomplete="off" />
      </div>

      <div class="form-group">
        <label>CLIENT INTENTS STATUS</label>
        <div class="intents-badge">
          <span class="status-dot online"></span>
          <span>Gateway Intents: 53608447 (Full Access)</span>
        </div>
      </div>

      <button id="btn-login" class="btn-primary">เข้าสู่ระบบ</button>
      <div id="login-error" class="error-message"></div>
    </div>
  </div>

  <!-- ==================== 2. MAIN CLIENT APP ==================== -->
  <div id="app" class="app-container" style="display: none;">

    <!-- Leftmost: Servers Sidebar -->
    <nav class="server-sidebar" id="server-sidebar-root">
      <div class="server-icon home-icon active" id="btn-home-tab" title="Direct Messages">
        <svg width="28" height="20" viewBox="0 0 28 20" fill="currentColor">
          <path d="M23.0212 1.67671C21.3107 0.87968 19.5079 0.318797 17.6584 0C17.4062 0.461719 17.1195 1.0504 16.9185 1.53982C14.9546 1.2454 13.0033 1.2454 11.0667 1.53982C10.8657 1.0504 10.5658 0.461719 10.3267 0C8.4743 0.318797 6.66858 0.882582 4.95806 1.68252C1.5173 6.8809 0.584703 11.9528 1.05263 16.9535..."/>
        </svg>
      </div>
      <div class="sidebar-divider"></div>
      <div id="guild-list-container" class="guild-scroll-list">
        <!-- Servers rendered dynamically via ServerSidebar.js -->
      </div>
    </nav>

    <!-- Channels & User Bar Sidebar -->
    <aside class="channel-sidebar">
      <header class="guild-header" id="guild-header-title">
        <span class="guild-name">Discord Server</span>
        <span class="header-icon">▼</span>
      </header>

      <div class="channel-list-wrapper">
        <div class="channel-category">
          <span class="category-title">▼ CHANNELS</span>
          <div class="channel-item active" data-channel-type="text">
            <span class="channel-hashtag">#</span>
            <span class="channel-name">general</span>
          </div>
          <div class="channel-item" data-channel-type="text">
            <span class="channel-hashtag">#</span>
            <span class="channel-name">announcements</span>
          </div>
        </div>

        <div class="channel-category">
          <span class="category-title">▼ VOICE CHANNELS</span>
          <div class="channel-item" id="btn-join-voice" data-channel-type="voice">
            <span class="channel-hashtag">🔊</span>
            <span class="channel-name">General Voice</span>
          </div>
        </div>
      </div>

      <!-- User Controls Panel (Bottom Left) -->
      <footer class="user-panel">
        <div class="user-info" id="btn-self-profile">
          <div class="avatar-container">
            <img id="current-user-avatar" src="https://cdn.discordapp.com/embed/avatars/0.png" alt="Avatar" />
            <div class="status-indicator online"></div>
          </div>
          <div class="user-details">
            <div id="current-user-name" class="username">Bot Name</div>
            <div id="current-user-tag" class="user-tag">#0000</div>
          </div>
        </div>
        <div class="user-controls">
          <button class="btn-icon" id="btn-mute" title="Mute Microphone">🎤</button>
          <button class="btn-icon" id="btn-deafen" title="Deafen Sound">🎧</button>
          <button class="btn-icon" id="btn-open-settings" title="User Settings">⚙️</button>
        </div>
      </footer>
    </aside>

    <!-- Main Chat / Voice View Area -->
    <main class="main-content">
      
      <!-- Top Header Bar -->
      <header class="chat-header">
        <div class="header-channel-info">
          <span class="hashtag">#</span>
          <h3 id="current-channel-title">general</h3>
          <span class="header-divider">|</span>
          <span class="channel-description" id="current-channel-topic">Welcome to general chat!</span>
        </div>
        <div class="header-actions">
          <button class="btn-icon" id="btn-toggle-members" title="Member List">👥</button>
        </div>
      </header>

      <!-- View 1: Text Chat Stream -->
      <div id="chat-stream-container" class="chat-stream">
        <div id="chat-messages" class="messages-list">
          <!-- Messages & Rich Embeds rendered via ChatArea.js -->
        </div>

        <!-- Chat Input Bar -->
        <div class="chat-input-wrapper">
          <div class="input-box-container">
            <button class="attach-btn" title="Upload File">+</button>
            <input type="text" id="chat-input" placeholder="ส่งข้อความใน #general" autocomplete="off" />
            <div class="input-actions">
              <button class="action-btn" title="Send GIF">GIF</button>
              <button class="action-btn" title="Select Emoji">😀</button>
            </div>
          </div>
        </div>
      </div>

      <!-- View 2: Voice Grid Call Area (Hidden by default) -->
      <div id="voice-grid-root" class="voice-grid-wrapper" style="display: none;">
        <!-- Voice Grid rendered via VoiceGrid.js -->
      </div>

    </main>

    <!-- Rightmost: Guild Member List -->
    <aside class="member-list-sidebar" id="member-list-root">
      <div class="member-group">
        <span class="group-title">ONLINE — 2</span>
        
        <div class="member-card" data-user-id="1">
          <div class="avatar-container">
            <img src="https://cdn.discordapp.com/embed/avatars/1.png" alt="User">
            <div class="status-indicator online"></div>
          </div>
          <div class="member-info">
            <div class="member-name admin-role">Peach <span class="bot-badge">BOT</span></div>
            <div class="member-activity">Playing Visual Studio Code</div>
          </div>
        </div>

        <div class="member-card" data-user-id="2">
          <div class="avatar-container">
            <img src="https://cdn.discordapp.com/embed/avatars/2.png" alt="User">
            <div class="status-indicator idle"></div>
          </div>
          <div class="member-info">
            <div class="member-name">Developer</div>
            <div class="member-activity">AFK</div>
          </div>
        </div>
      </div>
    </aside>

  </div>

  <!-- ==================== 3. FLOATING POPUPS & MODALS ==================== -->

  <!-- User Profile Popout Modal -->
  <div id="profile-popout" class="popout-modal" style="display: none;">
    <div class="user-profile-popout">
      <div class="profile-banner" id="popout-banner"></div>
      <div class="popout-header">
        <div class="avatar-wrapper">
          <img id="popout-avatar" class="avatar-img" src="" alt="Avatar">
          <div id="popout-status" class="status-dot online"></div>
        </div>
        <div class="badge-list" id="popout-badges"></div>
      </div>
      <div class="popout-body">
        <div class="user-text">
          <div class="global-name" id="popout-display-name">Name</div>
          <div class="username-tag" id="popout-username">@username</div>
          <div class="pronouns" id="popout-pronouns">they/them</div>
        </div>
        <div class="divider"></div>
        <div class="section-title">ABOUT ME</div>
        <div class="bio-text" id="popout-bio">No bio provided.</div>
        <div class="section-title" style="margin-top: 12px;">PLAYING A GAME</div>
        <div class="activity-box">
          <div class="activity-details">
            <div class="activity-name" id="popout-act-name">Visual Studio Code</div>
            <div class="activity-state" id="popout-act-state">Developing Discord Client</div>
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- Settings Modal Overlay -->
  <div id="settings-modal" class="modal-overlay" style="display: none;">
    <div class="settings-container">
      <aside class="settings-sidebar">
        <div class="settings-menu-title">USER SETTINGS</div>
        <div class="settings-item active">My Account</div>
        <div class="settings-item">Profiles</div>
        <div class="settings-menu-title" style="margin-top: 16px;">APP SETTINGS</div>
        <div class="settings-item">Appearance (Theme Darkness+)</div>
        <div class="settings-item">Voice & Video</div>
        <div class="settings-item">Language (ภาษาไทย)</div>
        <div class="divider"></div>
        <div class="settings-item logout" id="btn-logout">Log Out</div>
      </aside>
      <main class="settings-content">
        <h2>My Account</h2>
        <div class="account-card">
          <div class="account-header">
            <img id="settings-avatar" src="https://cdn.discordapp.com/embed/avatars/0.png" class="avatar-img" />
            <div class="account-titles">
              <h3 id="settings-display-name">Bot User</h3>
              <p id="settings-username">@bot_user</p>
            </div>
          </div>
        </div>
        <button class="close-settings-btn" id="btn-close-settings">✕</button>
      </main>
    </div>
  </div>

  <!-- ==================== 4. SCRIPTS LOADING ==================== -->
  <script>
    const { ipcRenderer } = require('electron');
    const ServerSidebar = require('./components/ServerSidebar');
    const ChatArea = require('./components/ChatArea');
    const VoiceGrid = require('./components/VoiceGrid');

    // UI Element References
    const loginOverlay = document.getElementById('login-overlay');
    const appContainer = document.getElementById('app');
    const btnLogin = document.getElementById('btn-login');
    const botTokenInput = document.getElementById('bot-token');
    const loginError = document.getElementById('login-error');

    // App Navigation Elements
    const chatStream = document.getElementById('chat-stream-container');
    const voiceGrid = document.getElementById('voice-grid-root');
    const btnJoinVoice = document.getElementById('btn-join-voice');
    const settingsModal = document.getElementById('settings-modal');
    const btnOpenSettings = document.getElementById('btn-open-settings');
    const btnCloseSettings = document.getElementById('btn-close-settings');

    // Login Action
    btnLogin.addEventListener('click', () => {
      const token = botTokenInput.value.trim();
      if (!token) {
        loginError.innerText = 'กรุณากรอก Bot Token';
        return;
      }
      loginError.innerText = 'กำลังเชื่อมต่อเกตเวย์...';
      ipcRenderer.send('DISCORD_LOGIN', token);
    });

    // Login Success Handler
    ipcRenderer.on('LOGIN_SUCCESS', (event, data) => {
      loginOverlay.style.display = 'none';
      appContainer.style.display = 'flex';

      // Update User Bar
      document.getElementById('current-user-avatar').src = data.user.avatar;
      document.getElementById('current-user-name').innerText = data.user.username;
      document.getElementById('current-user-tag').innerText = `#${data.user.discriminator || '0000'}`;

      // Initialize Server Sidebar Component
      const sidebar = new ServerSidebar(document.getElementById('guild-list-container'), (guildId) => {
        console.log('Selected Guild ID:', guildId);
      });
      sidebar.render(data.guilds);

      // Initialize Main Chat Component
      const chat = new ChatArea(document.getElementById('chat-messages'));
      chat.renderMessages([
        {
          author: { username: data.user.username, avatar: data.user.avatar, isBot: true },
          timestamp: 'วันนี้ เวลา 12:00',
          content: 'เชื่อมต่อ Discord Gateway และ Login สำเร็จ!',
          embed: {
            title: 'DISCORD CLIENT UI READY',
            description: 'ระบบพร้อมทำงาน รองรับ Text Chat, Voice Call Grid, และ Profile Card',
            isRainbow: true
          }
        }
      ]);
    });

    ipcRenderer.on('LOGIN_ERROR', (event, errorMsg) => {
      loginError.innerText = `เข้าสู่ระบบไม่สำเร็จ: ${errorMsg}`;
    });

    // Voice Channel Toggle
    btnJoinVoice.addEventListener('click', () => {
      chatStream.style.display = 'none';
      voiceGrid.style.display = 'flex';
      
      const voiceComponent = new VoiceGrid(voiceGrid);
      voiceComponent.render([
        { name: 'Peach', avatar: 'https://cdn.discordapp.com/embed/avatars/0.png' },
        { name: 'Developer', avatar: 'https://cdn.discordapp.com/embed/avatars/1.png' }
      ]);
    });

    // Settings Modal Toggles
    btnOpenSettings.addEventListener('click', () => settingsModal.style.display = 'flex');
    btnCloseSettings.addEventListener('click', () => settingsModal.style.display = 'none');
  </script>
</body>
</html>
