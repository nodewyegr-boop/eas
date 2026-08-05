const socket = io();
window.socket = socket;

socket.on('connect', () => {
    console.log('[Socket] Connected to server');
    const savedToken = localStorage.getItem('discord_token');
    if (savedToken && window.UI) {
        window.UI.showLoginLoading();
        socket.emit('req_login', { token: savedToken });
    } else if (window.UI) {
        window.UI.showLoginScreen();
    }
});

socket.on('login_success', (data) => {
    console.log('[Socket] Login Success:', data);
    if (window.UI) {
        window.UI.hideLoginScreen();
        if (data && data.user) window.UI.renderUser(data.user);
    }
    socket.emit('req_initial_data');
});

socket.on('login_error', (errorMsg) => {
    console.error('[Socket] Login Error:', errorMsg);
    if (window.UI) window.UI.showLoginError(errorMsg);
    localStorage.removeItem('discord_token');
});

socket.on('res_initial_data', (data) => {
    console.log('[Socket] Initial Data:', data);
    if (data.me && window.UI) window.UI.renderUser(data.me);
    if (data.guilds && window.UI) window.UI.renderGuilds(data.guilds);
});

socket.on('logout_success', () => {
    localStorage.removeItem('discord_token');
    location.reload();
});
