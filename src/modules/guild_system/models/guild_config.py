from dataclasses import dataclass

@dataclass
class GuildConfiguration:
    guild_id: int
    log_channel_id: int
    admin_role_id: int
    is_security_enabled: bool = True
