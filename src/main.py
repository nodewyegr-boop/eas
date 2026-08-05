
import asyncio
import os
import threading
from src.core.client import OfficialDiscordClient
from src.web.app import run_flask_server
from src.utils.logger import AppLogger

logger = AppLogger.get_logger("Main")

async def main():
    # 1. รัน Web UI Server ใน Thread แยก เพื่อให้ Render ตรวจพบ HTTP Port
    web_thread = threading.Thread(target=run_flask_server, daemon=True)
    web_thread.start()
    logger.info("เริ่มต้น Web UI Server สำหรับ Render เรียบร้อยแล้ว")

    # 2. ตรวจสอบ Token สำหรับเชื่อมต่อ Discord Gateway
    token = os.getenv("DISCORD_BOT_TOKEN")
    if not token:
        logger.warning("ยังไม่ได้ตั้งค่า DISCORD_BOT_TOKEN ใน Environment แต่หน้าเว็บ UI พร้อมใช้งานแล้ว")
        # เลี้ยง Loop ไว้ให้ Web UI บน Render ทำงานได้ต่อเนื่อง
        while True:
            await asyncio.sleep(3600)
        return

    client = OfficialDiscordClient()
    try:
        logger.info("กำลังเชื่อมต่อ Discord Gateway...")
        await client.start(token)
    except Exception as e:
        logger.critical(f"เกิดข้อผิดพลาดในการเชื่อมต่อ: {e}")

if __name__ == "__main__":
    asyncio.run(main())
