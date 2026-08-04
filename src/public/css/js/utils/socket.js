const socket = io();

// ตรวจสอบ Token เมื่อเชื่อมต่อ Socket
socket.on('connect', () => {
    const savedToken = localStorage.getItem('discord_token');
    if (savedToken) {
        socket.emit('req_login', { token: savedToken });
    } else {
        UI.showLoginScreen();
    }
});

socket.on('login_success', (data) => {
    UI.hideLoginScreen();
    socket.emit('req_initial_data');
});

socket.on('login_error', (errorMsg) => {
    UI.showLoginError(errorMsg);
    localStorage.removeItem('discord_token'); // ลบ Token ที่เสียออก
});

socket.on('logout_success', () => {
    localStorage.removeItem('discord_token');
    location.reload();
});
