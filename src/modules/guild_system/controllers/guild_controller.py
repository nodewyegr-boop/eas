import discord
from src.modules.guild_system.services.guild_service import GuildService
from src.ui.layouts.base_embed import OfficialEmbedBuilder

class GuildController:
    """ตัวควบคุมการไหลของข้อมูลในระบบ Server"""

    def __init__(self):
        self.service = GuildService()

    async def handle_guild_event(self, message: discord.Message):
        guild_info = self.service.get_guild_metadata(message.guild)
        
        embed = OfficialEmbedBuilder.create_base_embed(
            title=f"Guild Administration • {guild_info['name']}",
            description="ประมวลผลคำสั่งภายในเซิร์ฟเวอร์ตามมาตฐานความปลอดภัย",
            color_key="dark_neutral"
        )
        embed.add_field(name="Channel", value=f"#{message.channel.name}", inline=True)
        embed.add_field(name="Member Count", value=str(guild_info['member_count']), inline=True)

        await message.channel.send(embed=embed)
