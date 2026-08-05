class TextFormatter:
    """เครื่องมือจัดการข้อความตามมาตรฐาน Discord Markdown"""

    @staticmethod
    def code_block(text: str, language: str = "") -> str:
        return f"```{language}\n{text}\n```"

    @staticmethod
    def inline_code(text: str) -> str:
        return f"`{text}`"

    @staticmethod
    def timestamp(epoch_seconds: int, style: str = "f") -> str:
        return f"<t:{epoch_seconds}:{style}>"
