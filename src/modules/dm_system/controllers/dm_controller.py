import discord
from src.modules.dm_system.services.dm_service import DirectMessageService
from src.ui.layouts.base_embed import OfficialEmbedBuilder

class DirectMessageController:
    """ตัวควบคุมการไหลของข้อมูลในระบบ DM"""

    def __init__(self):
        self.service = DirectMessageService()

    async def handle_incoming_dm(self, message: discord.Message):
        parsed_data = self.service.parse_dm_payload(message)
        
        embed = OfficialEmbedBuilder.create_base_embed(
            title="Direct Messaging System",
            description=f"ข้อความ: {parsed_data['content']}",
            color_key="blurple"
        )
        embed.add_field(name="Sender ID", value=f"`{parsed_data['sender_id']}`", inline=True)
        embed.add_field(name="Status", value="Processed via DM Root", inline=True)

        await message.channel.send(embed=embed)
