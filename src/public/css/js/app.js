// src/public/js/app.js
const UI = {
    handleLogin(e) {
        if (e) e.preventDefault(); // ป้องกันหน้าเว็บ Refresh

        const tokenInput = document.getElementById('token-input');
        const errorDiv = document.getElementById('login-error');
        const loginBtn = document.getElementById('login-btn');

        const token = tokenInput.value.trim();

        if (!token) {
            this.showLoginError('กรุณากรอก Token ก่อนเข้าสู่ระบบ');
            return;
        }

        // ซ่อนข้อความ Error เก่า และเปลี่ยนข้อความปุ่ม
        if (errorDiv) errorDiv.style.display = 'none';
        if (loginBtn) loginBtn.innerText = 'กำลังตรวจสอบ Token...';

        // บันทึกลง LocalStorage และส่งให้ Server
        localStorage.setItem('discord_token', token);
        socket.emit('req_login', { token: token });
    },

    showLoginScreen() {
        document.getElementById('login-screen').style.display = 'flex';
    },

    hideLoginScreen() {
        document.getElementById('login-screen').style.display = 'none';
        document.getElementById('login-btn').innerText = 'เข้าสู่ระบบ';
    },

    showLoginError(msg) {
        const errorDiv = document.getElementById('login-error');
        if (errorDiv) {
            errorDiv.innerText = msg;
            errorDiv.style.display = 'block';
        }
        document.getElementById('login-btn').innerText = 'เข้าสู่ระบบ';
    }
};
