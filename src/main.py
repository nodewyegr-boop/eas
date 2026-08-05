import asyncio
import os
from dotenv import load_dotenv
from src.core.client import OfficialDiscordClient
from src.utils.logger import AppLogger

load_dotenv("config/environment.env")

logger = AppLogger.get_logger("Main")

async def main():
    token = os.getenv("DISCORD_BOT_TOKEN")
    if not token:
        logger.error("ไม่พบ DISCORD_BOT_TOKEN ในไฟล์ environment.env")
        return

    client = OfficialDiscordClient()
    try:
        logger.info("กำลังเริ่มต้นระบบ Discord Enterprise Architecture...")
        await client.start(token)
    except Exception as e:
        logger.critical(f"เกิดข้อผิดพลาดในการเชื่อมต่อระบบหลัก: {e}")

if __name__ == "__main__":
    asyncio.run(main())
