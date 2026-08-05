from dataclasses import dataclass, field
from datetime import datetime

@dataclass
class DirectMessageSession:
    user_id: int
    created_at: datetime = field(default_factory=datetime.utcnow)
    is_active: bool = True
    context_history: list = field(default_factory=list)
