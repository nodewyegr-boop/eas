class StateManager:
    """จัดการสถานะการทำงานส่วนกลาง (Global Runtime State)"""

    def __init__(self):
        self._active_dm_sessions = {}
        self._active_guild_tasks = {}

    def register_dm_session(self, user_id: int, data: dict):
        self._active_dm_sessions[user_id] = data

    def get_dm_session(self, user_id: int) -> dict:
        return self._active_dm_sessions.get(user_id, {})

    def clear_dm_session(self, user_id: int):
        self._active_dm_sessions.pop(user_id, None)
