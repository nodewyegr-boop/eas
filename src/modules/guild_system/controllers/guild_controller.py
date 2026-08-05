
import discord
from src.modules.guild_system.services.guild_service import GuildService
from src.ui.guild_templates.announcement_embed import OfficialGuildAnnouncement

class GuildController:
    """ตัวควบคุมการไหลของข้อมูลในระบบ Server"""

    def __init__(self):
        self.service = GuildService()

    async def handle_guild_event(self, message: discord.Message):
        guild_info = self.service.get_guild_metadata(message.guild)
        
        # ดึง UI Template สไตล์ทางการฝั่ง Guild มาใช้งาน
        embed = OfficialGuildAnnouncement.build(
            title=f"Server Protocol Processed ({guild_info['name']})",
            content=f"ข้อความสแกนสำเร็จจากช่อง #{message.channel.name}",
            author=message.author
        )

        await message.channel.send(embed=embed)
