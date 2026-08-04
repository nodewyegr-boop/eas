window.socket = io();

document.addEventListener('DOMContentLoaded', () => {

    socket.on('connect', () => {
        console.log('[Socket] Connected to server');
        const savedToken = localStorage.getItem('discord_token');
        if (savedToken) {
            UI.showLoginLoading();
            socket.emit('req_login', { token: savedToken });
        } else {
            UI.showLoginScreen();
        }
    });

    socket.on('login_success', (data) => {
        console.log('[Socket] Login success!');
        UI.hideLoginScreen();
        socket.emit('req_initial_data');
    });

    socket.on('login_error', (errorMsg) => {
        console.error('[Socket] Login error:', errorMsg);
        UI.showLoginError(errorMsg);
        localStorage.removeItem('discord_token');
    });

    socket.on('logout_success', () => {
        localStorage.removeItem('discord_token');
        location.reload();
    });
});
