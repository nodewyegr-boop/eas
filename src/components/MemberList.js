class MemberList {
  constructor(container, onSelectMember) {
    this.container = container;
    this.onSelectMember = onSelectMember;
  }

  render(membersGrouped) {
    // membersGrouped structure:
    // { "ONLINE": [{ id, username, displayName, avatar, status, roleColor, isBot, activity }], ... }
    
    let html = '';

    Object.keys(membersGrouped).forEach(group => {
      const members = membersGrouped[group];
      if (!members || members.length === 0) return;

      html += `
        <div class="member-group">
          <span class="group-title">${group} — ${members.length}</span>
          ${members.map(member => `
            <div class="member-card" data-user-id="${member.id}">
              <div class="avatar-container">
                <img src="${member.avatar}" alt="${member.username}" />
                <div class="status-indicator ${member.status || 'offline'}"></div>
              </div>
              <div class="member-info">
                <div class="member-name" style="color: ${member.roleColor || 'var(--text-normal)'}">
                  ${member.displayName || member.username}
                  ${member.isBot ? '<span class="bot-badge">BOT</span>' : ''}
                </div>
                ${member.activity ? `<div class="member-activity">${member.activity}</div>` : ''}
              </div>
            </div>
          `).join('')}
        </div>
      `;
    });

    this.container.innerHTML = html;

    // Attach Click Event for Profile Popout
    this.container.querySelectorAll('.member-card').forEach(card => {
      card.addEventListener('click', (e) => {
        const userId = e.currentTarget.getAttribute('data-user-id');
        if (this.onSelectMember) {
          this.onSelectMember(userId, e);
        }
      });
    });
  }
}

module.exports = MemberList;
