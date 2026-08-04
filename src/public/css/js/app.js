const UI = {
    handleLogin(e) {
        e.preventDefault();
        const tokenInput = document.getElementById('token-input');
        const token = tokenInput.value.trim();

        if (token) {
            document.getElementById('login-btn').innerText = 'กำลังเข้าสู่ระบบ...';
            localStorage.setItem('discord_token', token); // บันทึกลง Browser Storage
            socket.emit('req_login', { token: token });
        }
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
        errorDiv.innerText = msg;
        errorDiv.style.display = 'block';
        document.getElementById('login-btn').innerText = 'เข้าสู่ระบบ';
    },

    logout() {
        socket.emit('req_logout');
    }
};
