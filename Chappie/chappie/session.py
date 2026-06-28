from typing import Dict, List


class SessionStore:
    """En enkel in‑memory sessionstore.

    Hver session er en liste av meldinger: {"role": "user|assistant|system", "text": str}
    """

    def __init__(self):
        self._sessions: Dict[str, List[Dict[str, str]]] = {}

    def create_session(self, session_id: str) -> str:
        if session_id not in self._sessions:
            self._sessions[session_id] = []
        return session_id

    def add_message(self, session_id: str, role: str, text: str) -> None:
        self.create_session(session_id)
        self._sessions[session_id].append({"role": role, "text": text})

    def get_history(self, session_id: str) -> List[Dict[str, str]]:
        return list(self._sessions.get(session_id, []))

    def clear_session(self, session_id: str) -> None:
        self._sessions[session_id] = []
