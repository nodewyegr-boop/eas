import discord
from src.ui.layouts.base_embed import OfficialEmbedBuilder

class WelcomeDMTemplate:
    """เทมเพลตต้อนรับทางการเมื่อผู้ใช้ทัก DM มาครั้งแรก"""

    @staticmethod
    def build(user: discord.User) -> discord.Embed:
        embed = OfficialEmbedBuilder.create_base_embed(
            title="Direct Messaging System",
            description=f"ยินดีต้อนรับคุณ **{user.name}** เข้าสู่ช่องทางการติดต่อสื่อสารส่วนบุคคล",
            color_key="blurple"
        )
        embed.add_field(
            name="Channel Status",
            value="`🔒 Secure DM Channel Encrypted`",
            inline=False
        )
        embed.add_field(
            name="Instructions",
            value="โปรดส่งข้อความหรือคำสั่งของคุณ ระบบจะทำการบันทึกและประมวลผลผ่านโมดูล DM System โดยอัตโนมัติ",
            inline=False
        )
        return embed