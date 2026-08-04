class VoiceGrid {
  constructor(container) {
    this.container = container;
  }

  render(participants) {
    this.container.innerHTML = `
      <div style="display: flex; flex-direction: column; height: 100%;">
        <div class="voice-grid">
          ${participants.map(p => `
            <div class="voice-card">
              <img class="voice-avatar" src="${p.avatar}" />
              <span style="margin-top: 12px; font-weight: 500;">${p.name}</span>
            </div>
          `).join('')}
        </div>
        <div class="voice-controls">
          <button class="btn-control" title="Mute Microphone">🎤</button>
          <button class="btn-control" title="Deafen Sound">🎧</button>
          <button class="btn-control" title="Turn on Camera">📹</button>
          <button class="btn-control btn-disconnect" title="Disconnect">📞</button>
        </div>
      </div>
    `;
  }
}

module.exports = VoiceGrid;
