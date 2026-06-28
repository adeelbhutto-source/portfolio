from abc import ABC, abstractmethod
from typing import List, Dict


class ModelAdapter(ABC):
    """Abstrakt grensesnitt for modelladaptere.

    Implementasjoner må være originale og kan kalle eksterne backends eller
    gi lokal, regelbasert respons for testing.
    """

    @abstractmethod
    def generate(self, prompt: str, session_history: List[Dict[str, str]]) -> str:
        raise NotImplementedError()


class EchoModel(ModelAdapter):
    """En svært enkel modell som bare ekkoer prompten tilbake.

    Nyttig for testing uten eksterne avhengigheter.
    """

    def generate(self, prompt: str, session_history: List[Dict[str, str]]) -> str:
        return f"Echo: {prompt}"


class RuleBasedModel(ModelAdapter):
    """En enkel regelbasert ‘modell’ med deterministic svar for demo.
    """

    def generate(self, prompt: str, session_history: List[Dict[str, str]]) -> str:
        p = prompt.strip().lower()
        if any(greet in p for greet in ("hei", "hallo", "hi", "hello")):
            return "Hei! Hvordan kan jeg hjelpe deg i dag?"
        if p.endswith("?"):
            return "Det er et godt spørsmål — her er et generisk svar." 
        return "Jeg forstår. Fortell meg mer."
