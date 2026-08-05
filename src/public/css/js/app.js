window.UI = {
    showLoginLoading() {
        const errorDiv = document.getElementById('login-error');
        const loginBtn = document.getElementById('login-btn');
        if (errorDiv) errorDiv.style.display = 'none';
        if (loginBtn) {
            loginBtn.innerText = 'กำลังเข้าสู่ระบบ...';
            loginBtn.disabled = true;
        }
    },

    showLoginScreen() {
        const el = document.getElementById('login-screen');
        if (el) el.style.display = 'flex';
        const app = document.getElementById('app');
        if (app) app.style.display = 'none';
        const loginBtn = document.getElementById('login-btn');
        if (loginBtn) {
            loginBtn.innerText = 'เข้าสู่ระบบ';
            loginBtn.disabled = false;
        }
    },

    hideLoginScreen() {
        const el = document.getElementById('login-screen');
        if (el) el.style.display = 'none';
        const app = document.getElementById('app');
        if (app) app.style.display = 'flex';
    },

    showLoginError(msg) {
        const errorDiv = document.getElementById('login-error');
        if (errorDiv) {
            errorDiv.innerText = msg;
            errorDiv.style.display = 'block';
        }
        const loginBtn = document.getElementById('login-btn');
        if (loginBtn) {
            loginBtn.innerText = 'เข้าสู่ระบบ';
            loginBtn.disabled = false;
        }
    },

    renderUser(user) {
        const userTag = document.getElementById('user-tag');
        const userAvatar = document.getElementById('user-avatar');
        if (userTag) userTag.innerText = user.tag || user.username;
        if (userAvatar && user.avatar) userAvatar.src = user.avatar;
    },

    renderGuilds(guilds) {
        const guildList = document.getElementById('guild-list');
        if (!guildList) return;
        guildList.innerHTML = '';
        guilds.forEach(g => {
            const img = document.createElement('img');
            img.src = g.icon;
            img.title = g.name;
            img.className = 'guild-icon';
            guildList.appendChild(img);
        });
    }
};

document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('login-form');
    if (loginForm) {
        loginForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const tokenInput = document.getElementById('token-input');
            const token = tokenInput ? tokenInput.value.trim() : '';

            if (!token) {
                window.UI.showLoginError('กรุณากรอก Bot Token ก่อนเข้าสู่ระบบ');
                return;
            }

            window.UI.showLoginLoading();
            localStorage.setItem('discord_token', token);

            if (window.socket) {
                window.socket.emit('req_login', { token: token });
            } else {
                window.UI.showLoginError('ระบบ Socket ยังไม่พร้อม ลองรีเฟรชหน้าเว็บ');
            }
        });
    }
});
