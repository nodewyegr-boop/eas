const Sidebar = {
    renderUserPanel(user) {
        document.getElementById('self-username').innerText = user.username;
        if (user.avatar) {
            document.getElementById('self-avatar').src = user.avatar;
        }
    },

    renderGuilds(guilds) {
        const container = document.getElementById('guild-icon-list');
        container.innerHTML = '';
        guilds.forEach(guild => {
            const icon = document.createElement('div');
            icon.className = 'server-icon';
            icon.title = guild.name;
            icon.innerHTML = `<img src="${guild.icon}" style="width:100%;height:100%;border-radius:50%;">`;
            container.appendChild(icon);
        });
    }
};
