const SettingsModal = {
    openUserSettings() {
        const root = document.getElementById('modal-root');
        root.innerHTML = `
            <div class="modal-overlay" onclick="SettingsModal.close()">
                <div class="settings-modal" onclick="event.stopPropagation()">
                    <div class="settings-menu">
                        <div class="settings-item active">ข้อมูลบัญชี</div>
                        <div class="settings-item">โปรไฟล์ผู้ใช้</div>
                        <div class="settings-item">ความเป็นส่วนตัว</div>
                        <div class="settings-item">เสียงและวิดีโอ</div>
                    </div>
                    <div class="settings-view">
                        <h2>ข้อมูลบัญชี</h2>
                        <p style="margin-top:20px; color: var(--text-muted);">การตั้งค่าบัญชีและการยืนยันตัวตน</p>
                    </div>
                </div>
            </div>
        `;
    },
    close() { document.getElementById('modal-root').innerHTML = ''; }
};
