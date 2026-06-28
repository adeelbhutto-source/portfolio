from typing import Optional
from .model_adapter import ModelAdapter
from .session import SessionStore
from .commands import CommandRegistry


class ChappieRuntime:
    """En lettvekts runtime som orkestrerer melding → modell → svar.

    Oppgaver:
    - Legge til brukerens melding i session
    - Oppdage og kjøre slash‑kommandoer
    - Videreføre prompt og historie til `ModelAdapter`
    - Lagre modellens svar i session
    """

    def __init__(self, model_adapter: ModelAdapter, session_store: Optional[SessionStore] = None, commands: Optional[CommandRegistry] = None):
        self.model = model_adapter
        self.sessions = session_store or SessionStore()
        self.commands = commands or CommandRegistry()

    def handle_message(self, session_id: str, message: str) -> str:
        message = message.strip()
        self.sessions.add_message(session_id, "user", message)

        # Enkel kommandohåndtering: meldinger som starter med `/`
        if message.startswith("/"):
            parts = message[1:].split()
            cmd = parts[0]
            args = parts[1:]
            try:
                result = self.commands.run(cmd, *args)
                self.sessions.add_message(session_id, "system", str(result))
                return str(result)
            except KeyError:
                reply = f"Ukjent kommando: {cmd}"
                self.sessions.add_message(session_id, "assistant", reply)
                return reply

        # Hent historie og la modellen generere svar
        history = self.sessions.get_history(session_id)
        reply = self.model.generate(message, history)
        self.sessions.add_message(session_id, "assistant", reply)
        return reply
