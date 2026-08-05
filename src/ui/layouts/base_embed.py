import json
import discord
from pathlib import Path

class OfficialEmbedBuilder:
    _theme_cache = None
    # หาตำแหน่งไฟล์ config/discord_theme.json จากตำแหน่งจริงของไฟล์นี้
    _CONFIG_PATH = Path(__file__).resolve().parents[3] / "config" / "discord_theme.json"

    @classmethod
    def _load_theme(cls):
        if cls._theme_cache is None:
            with open(cls._CONFIG_PATH, "r", encoding="utf-8") as f:
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
