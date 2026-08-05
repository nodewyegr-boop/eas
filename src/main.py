import asyncio
import os
from src.core.client import OfficialDiscordClient
from src.utils.logger import AppLogger

logger = AppLogger.get_logger("Main")

async def main():
    # ดึงค่า DISCORD_BOT_TOKEN จาก GitHub Secrets หรือ Environment Variable ของเครื่องโดยตรง
    token = os.getenv("DISCORD_BOT_TOKEN")
    
    if not token:
        logger.critical("ไม่พบ DISCORD_BOT_TOKEN ใน Environment Variables! โปรดตั้งค่าใน GitHub Secrets หรือในระบบก่อนรัน")
        return

    client = OfficialDiscordClient()
    try:
        logger.info("กำลังเริ่มต้นระบบ Discord Enterprise Architecture...")
        await client.start(token)
    except Exception as e:
        logger.critical(f"เกิดข้อผิดพลาดในการเชื่อมต่อระบบหลัก: {e}")

if __name__ == "__main__":
    asyncio.run(main())
