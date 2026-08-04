document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('login-form');

    if (loginForm) {
        loginForm.addEventListener('submit', (e) => {
            e.preventDefault(); // ป้องกันการเกิด ? บน URL และสั่งไม่ให้ Refresh หน้าเว็บ
            
            const tokenInput = document.getElementById('token-input');
            const token = tokenInput ? tokenInput.value.trim() : '';

            if (!token) {
                UI.showLoginError('กรุณากรอก Token ก่อนเข้าสู่ระบบ');
                return;
            }

            UI.showLoginLoading();
            localStorage.setItem('discord_token', token);

            if (window.socket) {
                window.socket.emit('req_login', { token: token });
            } else {
                UI.showLoginError('ระบบ Socket ยังไม่พร้อม เชื่อมต่อใหม่อีกครั้ง');
            }
        });
    }
});

const UI = {
    showLoginLoading() {
        const errorDiv = document.getElementById('login-error');
        const loginBtn = document.getElementById('login-btn');
        if (errorDiv) errorDiv.style.display = 'none';
        if (loginBtn) loginBtn.innerText = 'กำลังเข้าสู่ระบบ...';
    },

    showLoginScreen() {
        const el = document.getElementById('login-screen');
        if (el) el.style.display = 'flex';
        const app = document.getElementById('app');
        if (app) app.style.display = 'none';
    },

    hideLoginScreen() {
        const el = document.getElementById('login-screen');
        if (el) el.style.display = 'none';
        const app = document.getElementById('app');
        if (app) app.style.display = 'block';
    },

    showLoginError(msg) {
        const errorDiv = document.getElementById('login-error');
        if (errorDiv) {
            errorDiv.innerText = msg;
            errorDiv.style.display = 'block';
        }
        const loginBtn = document.getElementById('login-btn');
        if (loginBtn) loginBtn.innerText = 'เข้าสู่ระบบ';
    }
};
