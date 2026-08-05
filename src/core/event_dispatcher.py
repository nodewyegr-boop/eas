import discord
from src.modules.dm_system.dm_controller import DirectMessageController
from src.modules.guild_system.guild_controller import GuildController

class EventDispatcher:
    """แยกการทำงานระหว่าง DM และ Guild ตั้งแต่ระดับ Event"""

    def __init__(self, client: discord.Client):
        self.client = client
        self.dm_controller = DirectMessageController()
        self.guild_controller = GuildController()

    async def dispatch_message(self, message: discord.Message) -> None:
        if message.author.bot:
            return

        if isinstance(message.channel, discord.DMChannel):
            await self.dm_controller.handle_incoming_dm(message)
        elif message.guild is not None:
            await self.guild_controller.handle_guild_event(message)
