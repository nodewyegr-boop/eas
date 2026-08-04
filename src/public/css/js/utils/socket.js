const socket = io();
window.socket = socket;

// ดักจับ Event นอก DOMContentLoaded ป้องกัน Event หลุด
socket.on('connect', () => {
    console.log('[Socket] Connected to server');
    const savedToken = localStorage.getItem('discord_token');
    if (savedToken && window.UI) {
        UI.showLoginLoading();
        socket.emit('req_login', { token: savedToken });
    } else if (window.UI) {
        UI.showLoginScreen();
    }
});

socket.on('login_success', (data) => {
    console.log('[Socket] Login Success');
    if (window.UI) UI.hideLoginScreen();
    socket.emit('req_initial_data');
});

socket.on('login_error', (errorMsg) => {
    console.error('[Socket] Login Error:', errorMsg);
    if (window.UI) UI.showLoginError(errorMsg);
    localStorage.removeItem('discord_token');
});

socket.on('logout_success', () => {
    localStorage.removeItem('discord_token');
    location.reload();
});
