const Voice = {
    isMuted: false,
    isDeaf: false,

    toggleMic() {
        this.isMuted = !this.isMuted;
        const btn = document.getElementById('mic-btn');
        btn.classList.toggle('active-red', this.isMuted);
        btn.innerHTML = this.isMuted ? '<i class="fa-solid fa-microphone-slash"></i>' : '<i class="fa-solid fa-microphone"></i>';
    },

    toggleDeaf() {
        this.isDeaf = !this.isDeaf;
        const btn = document.getElementById('deaf-btn');
        btn.classList.toggle('active-red', this.isDeaf);
        btn.innerHTML = this.isDeaf ? '<i class="fa-solid fa-headphones-simple"></i>' : '<i class="fa-solid fa-headphones"></i>';
    },

    handleVoiceUpdate(data) {
        console.log('[Voice State Changed]', data);
    }
};
