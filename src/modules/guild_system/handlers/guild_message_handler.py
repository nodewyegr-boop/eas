import discord
from src.modules.guild_system.controllers.guild_controller import GuildController

class GuildMessageHandler:
    """ตัวรับ Event ฝั่ง Server แล้วส่งต่อให้ Controller ประมวลผล"""

    def __init__(self, client: discord.Client):
        self.client = client
        self.controller = GuildController()

    async def process_guild_event(self, message: discord.Message) -> None:
        # ส่งต่อการทำงานไปที่ Controller เพื่อแยก Logic ออกจาก Handler
        await self.controller.handle_guild_event(message)
