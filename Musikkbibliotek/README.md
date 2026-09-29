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
- [Controller/Universal/save.js](./Controller/Universal/save.js) — small state update using `find()`
- [Controller/Login/login.js](./Controller/Login/login.js) — login flow
- [View/](./View) — rendering code

## What I can discuss from this project

- the reason for separating model, view and controller responsibilities
- how state changes are reflected in the UI
- how array methods such as `find()` are used to locate records
- trade-offs of keeping all state in memory instead of using a backend/database
- what I learned from working in a team codebase

## Run locally

Open `index.html` directly, or serve the folder:

~~~bash
npx serve .
~~~

Demo users are included in the model for this school assignment.
