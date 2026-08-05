import discord

class OfficialActionButton(discord.ui.Button):
    """ปุ่มกดสไตล์ทางการของ Discord"""

    def __init__(self, label: str, custom_id: str, style: discord.ButtonStyle = discord.ButtonStyle.primary):
        super().__init__(label=label, custom_id=custom_id, style=style)

    async def callback(self, interaction: discord.Interaction):
        # ตอบกลับด้วยสถานะทางการ
        await interaction.response.send_message(
            f"ประมวลผลคำสั่ง `{self.custom_id}` เรียบร้อยแล้ว", 
            ephemeral=True
        )
