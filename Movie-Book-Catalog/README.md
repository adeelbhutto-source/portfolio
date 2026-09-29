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

This is an early learning project. If rebuilding it today, I would:
- use `int.TryParse` instead of retrying inside a `catch`
- make the movie list private readonly
- add search/edit/delete
- add tests around catalogue operations
- separate input parsing further from business logic

Keeping those limitations visible is intentional because the project shows where I started and what I would change with what I know now.
