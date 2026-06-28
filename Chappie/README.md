# Chappie

Eget runtime for en enkel assistent. Poenget var å skille «hvordan appen kjører» fra «hvilken motor som svarer» — så jeg kan bytte backend uten å skrive om alt.

Skrevet som clean-room (ingen copy-paste fra andre prosjekter). [SPEC.md](SPEC.md) forklarer tanken.

## Innhold

- `runtime.py` — tar imot melding, sjekker om det er en `/kommando`, ellers spør motoren
- `model_adapter.py` — grensesnitt; medfølger en enkel regelbasert demo
- `session.py` — historikk per sesjon
- `model.py` — liten nevralnett-implementasjon hvis du vil eksperimentere

## Kjøre

```powershell
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
python -m chappie.cli
```