import discord

class DirectMessageService:
    """ประมวลผลตรรกะระดับธุรกิจสำหรับ Direct Message"""

    def parse_dm_payload(self, message: discord.Message) -> dict:
        return {
            "sender_id": message.author.id,
            "sender_name": message.author.name,
            "content": message.content,
            "timestamp": message.created_at.isoformat()
        }
