const UI = {
    switchTab(tab) {
        console.log('Switching to tab:', tab);
    },
    switchDMView(view) {
        console.log('DM View:', view);
    },
    openOfficialSystemDM() {
        Chat.appendMessage({
            author: { username: 'Discord System', bot: true },
            content: '⚡ แจ้งเตือนระบบ: เข้าร่วม Discord เซิร์ฟเวอร์สนับสนุน https://discord.gg/5QCPEp5qf'
        });
    },
    openUserSettings() {
        SettingsModal.openUserSettings();
    },
    handleInputKey(e) {
        if (e.key === 'Enter') {
            const input = document.getElementById('chat-input');
            if (input.value.trim() !== '') {
                socket.emit('req_send_message', { content: input.value });
                input.value = '';
            }
        }
    }
};
