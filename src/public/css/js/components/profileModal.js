const ProfileModal = {
    render(user) {
        const root = document.getElementById('modal-root');
        root.innerHTML = `
            <div class="modal-overlay" onclick="ProfileModal.close()">
                <div class="profile-card" onclick="event.stopPropagation()">
                    <div class="profile-banner"></div>
                    <div class="profile-body">
                        <h3>${user.username}</h3>
                        <p>${user.bot ? 'Discord Application Bot' : 'Discord Member'}</p>
                        <button onclick="socket.emit('req_moderate', {targetId: '${user.id}', action: 'kick'})">เตะสมาชิก</button>
                        <button onclick="socket.emit('req_moderate', {targetId: '${user.id}', action: 'ban'})">แบนสมาชิก</button>
                    </div>
                </div>
            </div>
        `;
    },
    close() { document.getElementById('modal-root').innerHTML = ''; }
};
