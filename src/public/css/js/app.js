const UI = {
    handleLogin(e) {
        if (e) e.preventDefault();

        const tokenInput = document.getElementById('token-input');
        const errorDiv = document.getElementById('login-error');
        const loginBtn = document.getElementById('login-btn');

        const token = tokenInput ? tokenInput.value.trim() : '';

        if (!token) {
            this.showLoginError('กรุณากรอก Token ก่อนเข้าสู่ระบบ');
            return;
        }

        if (errorDiv) errorDiv.style.display = 'none';
        if (loginBtn) loginBtn.innerText = 'กำลังเข้าสู่ระบบ...';

        localStorage.setItem('discord_token', token);
        
        if (window.socket) {
            window.socket.emit('req_login', { token: token });
        } else {
            this.showLoginError('ระบบ Socket ยังไม่พร้อม เชื่อมต่ออีกครั้ง');
        }
    },

    showLoginScreen() {
        const el = document.getElementById('login-screen');
        if (el) el.style.display = 'flex';
    },

    hideLoginScreen() {
        const el = document.getElementById('login-screen');
        if (el) el.style.display = 'none';
        const loginBtn = document.getElementById('login-btn');
        if (loginBtn) loginBtn.innerText = 'เข้าสู่ระบบ';
    },

    showLoginError(msg) {
        const errorDiv = document.getElementById('login-error');
        if (errorDiv) {
            errorDiv.innerText = msg;
            errorDiv.style.display = 'block';
        }
        const loginBtn = document.getElementById('login-btn');
        if (loginBtn) loginBtn.innerText = 'เข้าสู่ระบบ';
    },

    logout() {
        if (window.socket) window.socket.emit('req_logout');
    }
};
