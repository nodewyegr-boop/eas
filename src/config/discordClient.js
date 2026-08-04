// src/config/discordClient.js
const { Client } = require('discord.js-selfbot-v13');

// สร้าง Instance ของ Discord Selfbot Client
const client = new Client({
    checkUpdate: false, // ปิดการเช็คอัปเดตอัตโนมัติเพื่อความเร็วในการ Deploy
    patchVoice: false   // ปิด Voice Patch กรณีไม่ได้ใช้งานระบบเสียง
});

// ดักจับ Error ป้องกันไม่ให้ Node.js Process แครช (Crash)
client.on('error', (error) => {
    console.error('[Discord Client Error]', error.message);
});

client.on('warn', (info) => {
    console.warn('[Discord Client Warning]', info);
});

module.exports = client;
