import discord
from src.ui.layouts.base_embed import OfficialEmbedBuilder

class OfficialGuildAnnouncement:
    """เทมเพลตการประกาศข่าวสารสไตล์ทางการภายใน Server"""

    @staticmethod
    def build(title: str, content: str, author: discord.Member) -> discord.Embed:
        embed = OfficialEmbedBuilder.create_base_embed(
            title=f"Official Notice | {title}",
            description=content,
            color_key="dark_neutral"
        )
        embed.set_author(
            name=f"Issued by {author.display_name}",
            icon_url=author.display_avatar.url
        )
        embed.add_field(
            name="Verification",
            value="`Verified Guild Official Announcement`",
            inline=False
        )
        return embed
