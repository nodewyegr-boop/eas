const Chat = {
    appendMessage(msg) {
        const container = document.getElementById('messages-container');
        const div = document.createElement('div');
        div.className = 'message-row';
        div.innerHTML = `
            <div class="msg-header">
                <span class="author-name">${msg.author.username}</span>
                ${msg.author.bot ? '<span class="badge bot-badge">BOT</span>' : ''}
            </div>
            <div class="msg-body">${Formatter.parseContent(msg.content)}</div>
        `;
        container.appendChild(div);
        container.scrollTop = container.scrollHeight;
    }
};
