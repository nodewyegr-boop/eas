class ChatArea {
  constructor(container) {
    this.container = container;
  }

  renderMessages(messages) {
    this.container.innerHTML = `
      <div class="main-chat">
        <div class="chat-messages">
          ${messages.map(m => `
            <div class="message-item" style="display: flex; gap: 16px;">
              <img src="${m.author.avatar}" style="width: 40px; height: 40px; border-radius: 50%;" />
              <div>
                <div style="display: flex; gap: 8px; align-items: center;">
                  <span style="font-weight: 600;">${m.author.username}</span>
                  ${m.author.isBot ? `<span style="background-color: var(--brand-color); font-size: 10px; padding: 1px 4px; border-radius: 3px;">BOT</span>` : ''}
                  <span style="font-size: 12px; color: var(--text-muted);">${m.timestamp}</span>
                </div>
                <div>${m.content}</div>
                ${m.embed ? `
                  <div class="embed-box ${m.embed.isRainbow ? 'embed-rainbow' : ''}">
                    <div style="font-weight: 600; margin-bottom: 4px;">${m.embed.title}</div>
                    <div style="font-size: 14px; color: var(--text-muted);">${m.embed.description}</div>
                  </div>
                ` : ''}
              </div>
            </div>
          `).join('')}
        </div>
        <div class="chat-input-area">
          <input type="text" class="chat-input" placeholder="ส่งข้อความไปที่ #general" />
        </div>
      </div>
    `;
  }
}

module.exports = ChatArea;
