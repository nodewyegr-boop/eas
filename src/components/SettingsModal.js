class SettingsModal {
  constructor(modalElement, onLogout) {
    this.modal = modalElement;
    this.onLogout = onLogout;
    this.activeTab = 'account';
    
    this.initEvents();
  }

  initEvents() {
    // Close Settings Button
    const btnClose = this.modal.querySelector('#btn-close-settings');
    if (btnClose) {
      btnClose.addEventListener('click', () => this.close());
    }

    // ESC Key to close
    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.modal.style.display === 'flex') {
        this.close();
      }
    });

    // Sidebar Tab Switching
    const items = this.modal.querySelectorAll('.settings-item:not(.logout)');
    items.forEach(item => {
      item.addEventListener('click', (e) => {
        items.forEach(i => i.classList.remove('active'));
        e.currentTarget.classList.add('active');
        this.switchTab(e.currentTarget.innerText.trim());
      });
    });

    // Logout Button
    const btnLogout = this.modal.querySelector('#btn-logout');
    if (btnLogout) {
      btnLogout.addEventListener('click', () => {
        this.close();
        if (this.onLogout) this.onLogout();
      });
    }
  }

  open(userData) {
    if (userData) {
      const avatarImg = this.modal.querySelector('#settings-avatar');
      const displayName = this.modal.querySelector('#settings-display-name');
      const username = this.modal.querySelector('#settings-username');

      if (avatarImg) avatarImg.src = userData.avatar;
      if (displayName) displayName.innerText = userData.globalName || userData.username;
      if (username) username.innerText = `@${userData.username}`;
    }
    this.modal.style.display = 'flex';
  }

  close() {
    this.modal.style.display = 'none';
  }

  switchTab(tabName) {
    const contentArea = this.modal.querySelector('.settings-content');
    if (!contentArea) return;

    if (tabName.includes('Appearance')) {
      contentArea.querySelector('h2').innerText = 'Appearance Settings';
      // Switch Theme options (Darkness+, Compact, Light)
    } else if (tabName.includes('Language')) {
      contentArea.querySelector('h2').innerText = 'Language (ภาษาไทย)';
    } else {
      contentArea.querySelector('h2').innerText = 'My Account';
    }
  }
}

module.exports = SettingsModal;
