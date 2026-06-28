Chappie — Clean‑room spesifikasjon

Mål
- Lage en ny, original implementasjon av et assistent‑runtime inspirert av et eksisterende prosjekt uten å kopiere kildekode.
- Implementasjonen skal være funksjonelt lik (REPL, sesjonshåndtering, pluggbar modelladapter, kommandoer/handler), men skrevet fra bunnen av.

Krav (høy nivå)
- Pluggbar `ModelAdapter`‑grensesnitt: lar oss bytte underliggende modell uten å endre runtime.
- Enkel `SessionStore` for konversasjonslogg per session id.
- `CommandRegistry` for å registrere og kjøre slash‑kommandoer (f.eks. `/ping`).
- `ChappieRuntime` som orkestrerer input → modell → output, inkl. kommando‑deteksjon.
- En lett CLI for manuell testing og demonstrasjon.
- Enhetstester som verifiserer grunnleggende flyt.

Designprinsipper
- Ingen linje‑for‑linje‑kopiering: alle filer må være original kode.
- Velg enkle, lesbare APIer som er lett å utvide.
- Minimale eksterne avhengigheter (standardbiblioteket hvis mulig).

Komponentoversikt
- `ModelAdapter` (abstrakt): `generate(prompt: str, history: list[dict]) -> str`
- `SessionStore`: `create_session(id)`, `add_message(id, role, text)`, `get_history(id)`
- `CommandRegistry`: `register(name, func)`, `run(name, *args)`
- `ChappieRuntime`: `handle_message(session_id, message)` — gjenkjenner kommandoer, bruker `ModelAdapter` ellers.
- `cli` modul: enkel REPL for interaksjon.

Dataplattform og sikkerhet
- All data holdes lokalt i minnet (ingen ekstern tjeneste bruk til demo).
- Ingen sensititiv dataeksport eller logging uten brukerens eksplisitte valg.

Neste steg
1. Scaffold prosjekt (pakke + README + requirements).
2. Implementer og test `ModelAdapter`, `SessionStore`, `CommandRegistry`, `ChappieRuntime`.
3. Legg til flere eksempelsmodeller og utvid CLI.
4. Dokumenter hvordan å bytte motor og utvide med nye backends.
