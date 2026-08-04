
// src/public/js/socket.js
window.socket = io();

document.addEventListener('DOMContentLoaded', () => {
    // รอจนกว่าหน้าเว็บและไฟล์ JS ทุกไฟล์จะโหลดเสร็จสมบูรณ์
    
    socket.on('connect', () => {
        const savedToken = localStorage.getItem('discord_token');
        if (savedToken) {
            socket.emit('req_login', { token: savedToken });
        } else if (window.UI) {
            UI.showLoginScreen();
        }
    });

    socket.on('login_success', () => {
        if (window.UI) UI.hideLoginScreen();
        socket.emit('req_initial_data');
    });

    socket.on('login_error', (errorMsg) => {
        if (window.UI) UI.showLoginError(errorMsg);
        localStorage.removeItem('discord_token');
    });

    socket.on('logout_success', () => {
        localStorage.removeItem('discord_token');
        location.reload();
    });

    socket.on('res_initial_data', (data) => {
        if (data.me && window.Sidebar) Sidebar.renderUserPanel(data.me);
        if (data.guilds && window.Sidebar) Sidebar.renderGuilds(data.guilds);
    });

    socket.on('discord_message_create', (msg) => {
        if (window.Chat) Chat.appendMessage(msg);
    });
});
