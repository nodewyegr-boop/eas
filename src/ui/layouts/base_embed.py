import json
import discord

class OfficialEmbedBuilder:
    """ตัวสร้าง Embed มาตรฐานทางการของ Discord"""

    _theme_cache = None

    @classmethod
    def _load_theme(cls):
        if cls._theme_cache is None:
            with open("config/discord_theme.json", "r", encoding="utf-8") as f:
                cls._theme_cache = json.load(f)
        return cls._theme_cache

    @classmethod
    def create_base_embed(cls, title: str, description: str, color_key: str = "blurple") -> discord.Embed:
        theme = cls._load_theme()
        color_hex = int(theme["colors"].get(color_key, theme["colors"]["blurple"]), 16)

        embed = discord.Embed(
            title=title,
            description=description,
            color=color_hex
        )
        embed.set_footer(
            text=theme["branding"]["official_footer_text"],
            icon_url=theme["branding"]["default_avatar_url"]
        )
        return embed
