# Movie Catalog

**GET Academy console assignment · C#**

A small console program for adding movies and displaying the catalogue.

## Structure

- `Movie.cs` — movie data
- `MovieCatalog.cs` — owns the movie list
- `Menu.cs` — input and menu flow
- `Program.cs` — entry point

## Good code-review entry points

- [Menu.cs](./Menu.cs)
- [MovieCatalog.cs](./MovieCatalog.cs)

## What it demonstrates

- classes and objects
- `List<T>`
- basic separation of responsibilities
- console input/output
- a simple menu loop
- basic exception handling for invalid numeric input

## What I would improve now

This is an early learning project, and I deliberately keep that visible.

If rebuilding it today, I would:

- use `int.TryParse` instead of catching `FormatException` and retrying only once
- make the movie list `private readonly`
- handle invalid menu choices explicitly instead of treating every unknown input as exit
- separate input parsing further from catalogue/business logic
- add search, edit and delete operations
- add tests around catalogue operations and validation
- remove unused `using` directives

The project is small, but it is useful for showing progression: I can explain both the original approach and the refactoring choices I would make now.
