# Enterprise Architecture System (EAS) for Discord

สถาปัตยกรรมระบบ Discord Bot ระดับองค์กร แยกส่วนการทำงานระหว่างระบบ **Direct Messages (DM)** และ **Guild (Server)** ออกจากกันอย่างสมบูรณ์ที่ระดับรากฐาน (Root Level) ตามหลัก Separation of Concerns (SoC)

## 📁 Core Architecture Highlights
- `src/modules/dm_system/`: โมดูลประมวลผลข้อความและการทำงานส่วนบุคคล (DM)
- `src/modules/guild_system/`: โมดูลประมวลผลระบบบริหารจัดการภายในเซิร์ฟเวอร์
- `src/ui/`: ระบบ UI มาตรฐาน Discord Official Design System (ไม่มีอีโมจิแฟนซี)

## 🚀 Installation & Setup

1. **Clone Repository:**
   ```bash
   git clone [https://github.com/nodewyegr-boop/eas.git](https://github.com/nodewyegr-boop/eas.git)
   cd eas
