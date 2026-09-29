# PeaceCoParent — Technical Walkthrough

This document is a guided path through selected parts of the repository.

## Important context

PeaceCoParent is a large product project built with extensive use of AI coding tools. The goal of this walkthrough is therefore not to claim manual authorship of every line. Instead, it highlights concrete implementation areas that are useful for discussing architecture, integrations, failure handling and how the system fits together.

## 1. Server entry point

Start with [backend/src/index.ts](./backend/src/index.ts).

Things to look for:
- Express application setup
- Helmet middleware
- CORS allow-list logic
- separate rate limits for authentication and the broader API
- Stripe webhook routes registered with raw-body parsing before JSON parsing
- modular route registration
- database health check
- error handling
- different server behaviour when deployed to Vercel

### Why raw-body parsing matters for Stripe
Stripe webhook verification depends on the original request payload. If JSON parsing changes the body before signature verification, verification can fail. The server therefore registers the webhook routes with `express.raw()` before the global `express.json()` middleware.

## 2. Authentication boundary

See [backend/src/middleware/auth.ts](./backend/src/middleware/auth.ts).

The middleware:
1. checks for a Bearer token,
2. verifies the JWT,
3. extracts the user ID,
4. attaches it to the request,
5. returns HTTP 401 for missing or invalid credentials.

This keeps authentication logic out of individual route handlers.

## 3. Family-scoped messaging

See [backend/src/routes/messages.ts](./backend/src/routes/messages.ts).

The route module first resolves the authenticated user's family membership. Message queries are then scoped by that family ID rather than trusting a family ID supplied directly by the client.

The module also demonstrates:
- timestamp-based pagination
- message validation
- history retrieval for coaching context
- stripping attachment tags before text review
- graceful degradation when the coaching service is unavailable
- blocking a message when the review service returns a blocked state
- non-blocking push and email notifications after persistence

### Failure behaviour
If the coaching service fails, the message is still allowed through but the stored flag records that coaching was unavailable. This avoids falsely recording the message as approved.

## 4. Stripe subscription flow

See [backend/src/routes/subscriptions.ts](./backend/src/routes/subscriptions.ts).

The module covers:
- creating/reusing Stripe customers
- Checkout session creation
- billing portal sessions
- subscription-tier lookup
- webhook signature verification
- webhook idempotency
- updating local subscription state

### Idempotency
Webhook event IDs are stored in `processed_webhooks`. If Stripe retries the same event, the handler can recognise it and avoid processing it twice.

## 5. PostgreSQL connection

See [backend/src/db/index.ts](./backend/src/db/index.ts).

The application uses a shared `pg.Pool` configured from `DATABASE_URL`, with SSL enabled for production.

## 6. Suggested interview discussion

If reviewing this project with a technical interviewer, the strongest discussion areas are:

- Why route modules are split by domain
- Why authentication belongs in middleware
- Why family membership is resolved server-side
- Why Stripe needs raw request bodies
- What idempotency protects against
- Why external-service failures should not always block the core user action
- How frontend, backend, database and external services communicate

## 7. Smaller projects for programming fundamentals

For code that is easier to review as direct evidence of programming fundamentals, see:

- [Musikkbibliotek](../Musikkbibliotek) — JavaScript MVC team project
- [Pokemon Game](../Pokemon-Game) — C# pair-programming project
- [Movie Catalog](../Movie-Book-Catalog) — C# console assignment
