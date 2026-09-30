# Adil Bhutto — Technical Portfolio

I completed **Start IT at GET Academy**, a 20-week full-time programme in programming fundamentals. This repository contains course work, team/pair-programming projects, technical experiments and an ongoing Windows support lab.

I use this portfolio to separate three things clearly:

1. **course projects** that show programming fundamentals,
2. **hands-on labs / experiments** that show breadth and technical curiosity,
3. **larger AI-assisted product work** where the value is architecture, integrations and product delivery rather than claiming manual authorship of every line.

## Currently building — Windows Support Lab

**[Windows-Support-Lab](./Windows-Support-Lab)** · PowerShell · Windows · networking · troubleshooting

A practical support lab built around real troubleshooting sequences rather than a frontend.

Topics include:
- IP configuration and layered network triage
- DNS troubleshooting
- Windows services
- support-data collection
- structured troubleshooting notes

The starter scripts contain TODOs intentionally. The goal is to complete them through hands-on testing and record what each result means.

## Recommended code walkthroughs

### Musikkbibliotek — JavaScript / MVC
**Type:** GET Academy team project  
**Code:** [Musikkbibliotek](./Musikkbibliotek)

A plain-JavaScript music library organised around a simple MVC structure.

Good starting points:
- [Model/model.js](./Musikkbibliotek/Model/model.js) — application state and data
- [Controller/Universal/save.js](./Musikkbibliotek/Controller/Universal/save.js) — wishlist state update
- [Controller/Login/login.js](./Musikkbibliotek/Controller/Login/login.js) — login flow
- [View/](./Musikkbibliotek/View) — UI rendering

What it demonstrates: separating state, controller logic and views; working in a team codebase; basic CRUD-style interactions.

### Pokemon Game — C# / OOP
**Type:** GET Academy pair-programming project  
**Code:** [Pokemon-Game](./Pokemon-Game)

A console game split into classes such as Battle, Trainer, Pokemon, Item, Shop and WildEncounter.

Good starting points:
- [Battle.cs](./Pokemon-Game/Battle.cs) — battle loop, attacks, healing, catching and escape logic
- [Trainer.cs](./Pokemon-Game/Trainer.cs) — party, inventory and money state

What it demonstrates: classes and objects, collections, control flow, method decomposition and state changes.

### Movie Catalog — C# fundamentals
**Type:** GET Academy console assignment  
**Code:** [Movie-Book-Catalog](./Movie-Book-Catalog)

A small catalogue application with menu/input handling separated from the catalogue object.

Good starting points:
- [Menu.cs](./Movie-Book-Catalog/Menu.cs)
- [MovieCatalog.cs](./Movie-Book-Catalog/MovieCatalog.cs)
- [Movie.cs](./Movie-Book-Catalog/Movie.cs)

What it demonstrates: basic OOP, lists, console input, validation and separation of responsibilities.

## Technical experiments

### Chappie — Python
**Code:** [Chappie](./Chappie)

A small learning experiment around:
- runtime orchestration
- adapter interfaces
- in-memory session state
- slash-command routing
- a small PyTorch transformer experiment

It is presented as an experiment, with limitations and next steps documented in the project README.

## Larger product project

### PeaceCoParent — full-stack SaaS
**Code:** [PeaceCoParent](./PeaceCoParent)  
**Live product:** https://peacecoparent.com

PeaceCoParent is a larger co-parenting platform with a Next.js frontend, Express/TypeScript backend, PostgreSQL, Stripe subscriptions and an Expo mobile app.

**AI transparency:** AI coding tools have been used extensively during implementation. I do not present the size of this codebase as proof of manual coding volume. It is more useful as a case study in product scope, system integration, deployment and understanding how a larger application fits together.

Concrete code entry points:
- [backend/src/index.ts](./PeaceCoParent/backend/src/index.ts) — Express setup, security middleware, rate limiting and route registration
- [backend/src/middleware/auth.ts](./PeaceCoParent/backend/src/middleware/auth.ts) — JWT bearer authentication
- [backend/src/routes/messages.ts](./PeaceCoParent/backend/src/routes/messages.ts) — family-scoped messages, pagination, coaching review and notifications
- [backend/src/routes/subscriptions.ts](./PeaceCoParent/backend/src/routes/subscriptions.ts) — Stripe checkout, billing portal and webhook handling
- [TECHNICAL_WALKTHROUGH.md](./PeaceCoParent/TECHNICAL_WALKTHROUGH.md) — guided technical overview

## Breadth across the portfolio

| Area | Examples |
| --- | --- |
| Windows / support | Windows Support Lab, PowerShell, network/DNS/service troubleshooting |
| C# | Pokemon Game, Movie Catalog, GET Academy exercises |
| JavaScript | Musikkbibliotek MVC |
| TypeScript / Node | PeaceCoParent backend |
| Python | Chappie |
| Data / backend | PostgreSQL, API integrations |
| Workflow | Git, GitHub, testing/refactoring notes |

## Career direction

I am looking for a full-time opportunity in **IT support, technical/application support, QA/testing or junior development**. I am especially interested in roles where troubleshooting, structured problem-solving and learning new systems matter.
