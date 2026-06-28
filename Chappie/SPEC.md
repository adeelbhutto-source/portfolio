Chappie — Teknisk spesifikasjon

Mål
- Lage et assistent-runtime med tydelig skille mellom kjøretid og svar-motor.
- Implementasjonen skal ha REPL, sesjonshåndtering, pluggbar adapter og kommandoer — skrevet fra bunnen av.

Krav (høy nivå)
- Pluggbar `ModelAdapter`‑grensesnitt: bytte backend uten å endre runtime.
- Enkel `SessionStore` for konversasjonslogg per session id.
- `CommandRegistry` for å registrere og kjøre slash‑kommandoer (f.eks. `/ping`).
- `ChappieRuntime` som orkestrerer input → motor → output, inkl. kommando‑deteksjon.
- En lett CLI for manuell testing og demonstrasjon.

Designprinsipper
- Original kode, lesbare APIer, enkel å utvide.
- Minimale eksterne avhengigheter (standardbiblioteket der det er mulig).

Komponentoversikt
- `ModelAdapter` (abstrakt): `generate(prompt: str, history: list[dict]) -> str`
- `SessionStore`: `create_session(id)`, `add_message(id, role, text)`, `get_history(id)`
- `CommandRegistry`: `register(name, func)`, `run(name, *args)`
- `ChappieRuntime`: `handle_message(session_id, message)` — gjenkjenner kommandoer, bruker `ModelAdapter` ellers.
- `cli` modul: enkel REPL for interaksjon.

Dataplattform
- Demo-data holdes lokalt i minnet.
- Ingen ekstern logging uten eksplisitt valg.

Neste steg
1. Scaffold prosjekt (pakke + README + requirements).
2. Implementer `ModelAdapter`, `SessionStore`, `CommandRegistry`, `ChappieRuntime`.
3. Legg til flere eksempel-backends og utvid CLI.
4. Dokumenter hvordan å bytte motor og utvide med nye backends.