# Chappie — technical notes

## Goal

Explore a small assistant runtime with a clear separation between the runtime and the component that generates responses.

## High-level requirements

- pluggable `ModelAdapter` interface so a backend can be changed without rewriting the runtime
- simple `SessionStore` for conversation history per session ID
- `CommandRegistry` for slash commands such as `/ping`
- `ChappieRuntime` coordinating input → command/model → output
- lightweight CLI for manual testing

## Design ideas

- keep components small enough to understand individually
- minimise dependencies where practical
- make backend replacement explicit through an interface
- keep the first version local and easy to test

## Components

- `ModelAdapter`: `generate(prompt, history) -> str`
- `SessionStore`: creates sessions and stores message history
- `CommandRegistry`: registers and executes slash commands
- `ChappieRuntime`: orchestrates the message flow
- CLI: basic REPL for manual interaction

## Current limitations

- session data is only stored in memory
- message objects are simple dictionaries
- demo adapters are intentionally basic
- the PyTorch model experiment is separate from a complete training/inference pipeline
- more automated tests are needed

## Possible next steps

1. Add unit tests for runtime/session/command behaviour.
2. Add a persistent session implementation behind the same interface.
3. Add another adapter implementation.
4. Improve error handling and typing.
5. Document the PyTorch experiment separately from the runtime.
