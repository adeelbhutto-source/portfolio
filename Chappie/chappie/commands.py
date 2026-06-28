from typing import Callable, Dict, Any, List


class CommandRegistry:
    """En lett register for tekstkommandoer (slash‑kommandoer).

    Kommandoer lagres som navn -> funksjon.
    """

    def __init__(self):
        self._commands: Dict[str, Dict[str, Any]] = {}

    def register(self, name: str, func: Callable[..., Any], help: str | None = None) -> None:
        self._commands[name] = {"fn": func, "help": help}

    def run(self, name: str, *args, **kwargs) -> Any:
        entry = self._commands.get(name)
        if not entry:
            raise KeyError(name)
        return entry["fn"](*args, **kwargs)

    def list(self) -> List[str]:
        return list(self._commands.keys())

    def register_decorator(self, name: str, help: str | None = None):
        def decorator(fn: Callable[..., Any]):
            self.register(name, fn, help)
            return fn

        return decorator
