import discord

class GuildService:
    """ประมวลผลตรรกะระดับธุรกิจสำหรับระบบ Server"""

    def get_guild_metadata(self, guild: discord.Guild) -> dict:
        return {
            "id": guild.id,
            "name": guild.name,
            "member_count": guild.member_count,
            "owner_id": guild.owner_id
        }
