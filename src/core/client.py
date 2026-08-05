import discord
from src.core.event_dispatcher import EventDispatcher
from src.utils.logger import AppLogger

logger = AppLogger.get_logger("CoreClient")

class OfficialDiscordClient(discord.Client):
    """ตัวเชื่อมต่อ Gateway หลักของ Discord"""

    def __init__(self):
        intents = discord.Intents.default()
        intents.message_content = True
        intents.dm_messages = True
        intents.guild_messages = True
        intents.members = True

        super().__init__(intents=intents)
        self.dispatcher = EventDispatcher(self)

    async def on_ready(self):
        logger.info(f"ระบบออนไลน์สมบูรณ์ บัญชี: {self.user} (ID: {self.user.id})")
        await self.change_presence(
            activity=discord.Activity(
                type=discord.ActivityType.watching,
                name="Direct Messages & Guild Protocols"
            )
        )

    async def on_message(self, message: discord.Message):
        # ส่งต่อไปยัง Event Dispatcher คัดแยกราก DM / Guild
        await self.dispatcher.dispatch_message(message)
