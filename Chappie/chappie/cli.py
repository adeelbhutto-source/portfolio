def main():
    from .model_adapter import RuleBasedModel
    from .runtime import ChappieRuntime
    from .session import SessionStore
    from .commands import CommandRegistry

    model = RuleBasedModel()
    runtime = ChappieRuntime(model, SessionStore(), CommandRegistry())

    # Registrer noen enkle testkommandoer
    runtime.commands.register("ping", lambda: "pong", help="Returnerer pong")
    runtime.commands.register("whoami", lambda: "Chappie", help="Viser navn")

    session_id = "default"
    print("Chappie REPL — skriv /exit for å avslutte, /ping for kommando.")

    try:
        while True:
            txt = input("> ")
            if not txt:
                continue
            if txt.strip() == "/exit":
                break
            out = runtime.handle_message(session_id, txt)
            print(out)
    except (KeyboardInterrupt, EOFError):
        print("\nAvslutter...")


if __name__ == "__main__":
    main()
