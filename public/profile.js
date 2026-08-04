// จำลองการรับข้อมูล JSON จาก Discord Profile API
const mockDiscordProfileResponse = {
  user: {
    id: "249827823901409280",
    username: "peach_dev",
    global_name: "Peach",
    avatar: "https://cdn.discordapp.com/embed/avatars/0.png",
    banner: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=600&auto=format&fit=crop",
    accent_color: "#5865f2"
  },
  user_profile: {
    bio: "⚡ Discord Bot & Web Tool Developer\n🛠️ Building custom scripts and tools.",
    pronouns: "he/him"
  },
  badges: [
    { id: "hypesquad", description: "HypeSquad House of Brilliance", icon: "https://raw.githubusercontent.com/merlinkony/discord-badges/main/svg/hypesquad_brilliance.svg" },
    { id: "activedev", description: "Active Developer", icon: "https://raw.githubusercontent.com/merlinkony/discord-badges/main/svg/active_developer.svg" }
  ],
  connected_accounts: [
    { type: "GitHub", name: "PeachDev" }
  ]
};

function renderProfileCard(data) {
    const { user, user_profile, badges, connected_accounts } = data;

    // 1. Banner
    const bannerBg = document.getElementById('banner-bg');
    if (user.banner) {
        bannerBg.style.backgroundImage = `url('${user.banner}')`;
    } else {
        bannerBg.style.backgroundColor = user.accent_color || '#5865f2';
    }

    // 2. Avatar & Names
    document.getElementById('user-avatar').src = user.avatar;
    document.getElementById('display-name').innerText = user.global_name;
    document.getElementById('username').innerText = `@${user.username}`;
    document.getElementById('pronouns').innerText = user_profile.pronouns || '';
    document.getElementById('bio-content').innerText = user_profile.bio || 'No bio provided.';

    // 3. Badges
    const badgeContainer = document.getElementById('badge-container');
    badgeContainer.innerHTML = '';
    badges.forEach(b => {
        const img = document.createElement('img');
        img.className = 'badge-icon';
        img.src = b.icon;
        img.title = b.description;
        badgeContainer.appendChild(img);
    });

    // 4. Connected Accounts
    const connContainer = document.getElementById('connections-container');
    connContainer.innerHTML = '';
    connected_accounts.forEach(c => {
        const div = document.createElement('div');
        div.className = 'connection-item';
        div.innerText = `${c.type}: ${c.name}`;
        connContainer.appendChild(div);
    });
}

// Execute Render
renderProfileCard(mockDiscordProfileResponse);
