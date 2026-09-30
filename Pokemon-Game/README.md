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
- keeps battle state inside a loop
- handles attack, healing, catching and escape
- updates HP, inventory and money
- delegates attack behaviour to helper methods
- changes catch probability based on the ball and remaining HP

## What I can explain

- why the code is split into classes
- object state and mutations
- collections and `FirstOrDefault` / `Any`
- switch-based user input
- loops and battle termination conditions
- simple probability/randomness
- the trade-offs we made in a small pair-programming exercise

## Things I would improve today

Reviewing the code now, I would change several things:

- reuse the existing `_rng` instance everywhere instead of creating a new `Random` inside `EnemyAttacks`
- apply move accuracy consistently to enemy attacks as well as player attacks
- separate console input/output from battle rules so the logic is easier to test
- avoid allowing money to become negative in `SpendMoney`
- add unit tests for catch probability, inventory use and battle termination
- split the larger `Start()` method into smaller actions

Those are useful examples of how my code-review habits have improved since the course project.

## Running

The repository contains the source files from the course task. Create a C# console project and add the files to run it.
