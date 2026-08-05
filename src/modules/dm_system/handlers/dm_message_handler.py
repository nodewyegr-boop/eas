import discord
from src.modules.dm_system.controllers.dm_controller import DirectMessageController

class DirectMessageHandler:
    """ตัวรับ Event ฝั่ง DM แล้วส่งต่อให้ Controller ประมวลผล"""

    def __init__(self, client: discord.Client):
        self.client = client
        self.controller = DirectMessageController()

    async def process_dm_event(self, message: discord.Message) -> None:
        # ส่งต่อการทำงานไปที่ Controller เพื่อแยก Logic ออกจาก Handler
        await self.controller.handle_incoming_dm(message)
