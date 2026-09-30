# Musikkbibliotek

**GET Academy team project · JavaScript · MVC**

A music-library assignment built in plain JavaScript without a framework.

## Structure

- `Model/model.js` — application state and sample data
- `Controller/` — user actions and state changes
- `View/` — rendering
- `index.html` — application entry point

## Features

- search
- wishlist
- add/edit/delete music entries
- login/register flow
- detail and profile views

## Good code-review entry points

- [Model/model.js](./Model/model.js) — central application state
- [Controller/Universal/save.js](./Controller/Universal/save.js) — wishlist state update using `find()`
- [Controller/Login/login.js](./Controller/Login/login.js) — simple login flow
- [View/](./View) — rendering code

## What I can explain

- why model, view and controller responsibilities are separated
- how the application stores state and updates it
- how `find()` is used to locate records
- how UI state is represented in the model
- trade-offs of keeping all state in memory instead of using a backend/database

## Limitations I would address today

This is course code, not production authentication.

- usernames/passwords are stored directly in the JavaScript model
- data disappears when the page reloads
- the model is global and becomes harder to manage as the application grows
- authentication and persistence should be handled by a backend
- validation and error handling could be stronger
- automated tests would make changes safer

Keeping these limitations visible is intentional. The project is useful because I can discuss both what works and what should be improved.

## Run locally

Open `index.html` directly, or serve the folder:

~~~bash
npx serve .
~~~

Demo users are included in the model for this school assignment.
