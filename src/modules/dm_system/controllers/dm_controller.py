import discord
from src.modules.dm_system.services.dm_service import DirectMessageService
from src.ui.dm_templates.welcome_dm import WelcomeDMTemplate

class DirectMessageController:
    """ตัวควบคุมการไหลของข้อมูลในระบบ DM"""

    def __init__(self):
        self.service = DirectMessageService()

    async def handle_incoming_dm(self, message: discord.Message):
        parsed_data = self.service.parse_dm_payload(message)
        
        # ดึง UI Template สไตล์ทางการฝั่ง DM มาใช้งาน
        embed = WelcomeDMTemplate.build(message.author)
        embed.add_field(
            name="Message Received",
            value=f"`{parsed_data['content']}`",
            inline=False
        )

        await message.channel.send(embed=embed)
