# Pokemon Game

**GET Academy pair-programming project · C# · OOP**

A text-based console game built around separate classes instead of putting all logic in `Program.cs`.

## Main classes

- `Battle` — battle loop and combat decisions
- `Trainer` — party, inventory and money
- `Pokemon` — Pokémon state/behaviour
- `Move` — attack data
- `Item` — consumable/catch items
- `Shop` — purchases
- `WildEncounter` — encounter flow

## Good code-review entry points

- [Battle.cs](./Battle.cs)
- [Trainer.cs](./Trainer.cs)

## What the battle flow demonstrates

`Battle.Start()`:
- finds the first usable Pokémon
- loops until the battle ends
- handles attack, healing, catching and escape
- updates HP/inventory/money
- uses separate helper methods for attacks

The catch probability changes based on the ball value and the wild Pokémon's remaining HP.

## What I can discuss from this project

- why the code is split into classes
- object state and mutations
- collections and `FirstOrDefault` / `Any`
- switch-based user input
- loops and battle termination conditions
- simple probability/randomness
- what pair programming changed about how we solved the task

## Running

The repository contains the source files from the course task. Create a C# console project and add the files to run it.
