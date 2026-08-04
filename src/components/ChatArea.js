class ChatArea {
  constructor(container) {
    this.container = container;
  }

  renderMessages(messages) {
    this.container.innerHTML = messages.map(msg => `
      <div class="message-group">
        <img src="${msg.author.avatar}" class="message-avatar" />
        <div class="message-content-wrapper">
          <div class="message-header">
            <span class="message-author">${msg.author.username}</span>
            ${msg.author.isBot ? '<span class="bot-badge">BOT</span>' : ''}
            <span class="message-timestamp">${msg.timestamp}</span>
          </div>
          <div class="message-body">${msg.content}</div>
          
          ${msg.embed ? `
            <div class="discord-embed" style="border-left-color: ${msg.embed.color || '#5865f2'};">
              ${msg.embed.title ? `<div class="embed-title">${msg.embed.title}</div>` : ''}
              ${msg.embed.description ? `<div class="embed-description">${msg.embed.description}</div>` : ''}
            </div>
          ` : ''}
        </div>
      </div>
    `).join('');
  }
}

module.exports = ChatArea;
