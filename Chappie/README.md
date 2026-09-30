# Chappie

**Python learning experiment · runtime / adapters / session state**

A small experiment built to explore how an assistant runtime can be separated from the component that generates responses.

The useful part of this project is the architecture rather than the demo responses: the runtime depends on a `ModelAdapter` interface, so a different response backend can be plugged in without rewriting session or command handling.

## Main parts

- `runtime.py` — message flow, command detection and adapter calls
- `model_adapter.py` — adapter interface plus simple local demo implementations
- `session.py` — in-memory message history per session
- `commands.py` — slash-command registry
- `model.py` — small PyTorch transformer experiment
- [SPEC.md](./SPEC.md) — design notes

## What I can review from this project

- dependency inversion through an adapter interface
- separating runtime orchestration from response generation
- in-memory session state
- command routing
- limitations of storing all state in process memory
- basic transformer components in PyTorch

## Limitations / next steps

This is an experiment, not a production assistant.

Useful next steps would be:
- persistence for sessions
- typed message objects instead of loose dictionaries
- unit tests around command routing and session state
- structured error handling
- a real adapter behind the same interface
- clearer boundaries between the lightweight runtime and the PyTorch experiment

## Run locally

```powershell
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
python -m chappie.cli
```
