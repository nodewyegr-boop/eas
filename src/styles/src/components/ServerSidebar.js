class ServerSidebar {
  constructor(container, onSelectGuild) {
    this.container = container;
    this.onSelectGuild = onSelectGuild;
  }

  render(guilds) {
    this.container.innerHTML = `
      <div class="server-sidebar">
        <div class="server-icon active" id="btn-home">
          <svg width="28" height="20" viewBox="0 0 28 20" fill="white">
            <path d="M23.0212 1.67671C21.3107 0.87968 19.5079 0.318797 17.6584 0C17.4062 0.461719 17.1195 1.0504 16.9185 1.53982C14.9546 1.2454 13.0033 1.2454 11.0667 1.53982C10.8657 1.0504 10.5658 0.461719 10.3267 0C8.4743 0.318797 6.66858 0.882582 4.95806 1.68252C1.5173 6.8809 0.584703 11.9528 1.05263 16.9535..." />
          </svg>
        </div>
        <hr style="width: 32px; border: 1px solid var(--background-secondary-alt); margin: 4px 0;">
        ${guilds.map(g => `
          <div class="server-icon" data-id="${g.id}" title="${g.name}">
            ${g.icon ? `<img src="${g.icon}" style="width:100%; height:100%; border-radius:inherit;">` : g.name.substring(0, 2)}
          </div>
        `).join('')}
      </div>
    `;

    this.container.querySelectorAll('.server-icon[data-id]').forEach(icon => {
      icon.addEventListener('click', (e) => {
        const guildId = e.currentTarget.getAttribute('data-id');
        this.onSelectGuild(guildId);
      });
    });
  }
}

module.exports = ServerSidebar;
