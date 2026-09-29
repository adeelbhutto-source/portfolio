# PeaceCoParent

**Live:** https://peacecoparent.com

PeaceCoParent is a full-stack co-parenting SaaS project with a **Next.js frontend**, **Express/TypeScript backend**, **PostgreSQL**, **Stripe subscriptions** and an **Expo mobile application**.

## Role and AI transparency

I am the founder and product builder behind PeaceCoParent. AI coding tools have been used extensively during implementation and code generation.

For that reason, I do **not** present the size of this repository as evidence that every line was written manually. The project is better used to discuss product decisions, architecture, integrations, debugging, deployment and how the different parts of a larger system work together.

Smaller GET Academy projects elsewhere in this portfolio are better examples of my programming fundamentals.

## Architecture visible in the repository

### Backend
The backend uses Express and TypeScript.

[backend/src/index.ts](./backend/src/index.ts) shows:
- CORS configuration
- Helmet security middleware
- API and authentication rate limiting
- raw-body handling before JSON parsing for Stripe webhooks
- route registration
- a database health endpoint
- central error handling

### Authentication
[backend/src/middleware/auth.ts](./backend/src/middleware/auth.ts) contains bearer-token authentication using JWT verification and attaches the authenticated user ID to the request.

### Messaging
[backend/src/routes/messages.ts](./backend/src/routes/messages.ts) includes:
- family-scoped message retrieval
- pagination by timestamp
- authenticated message creation
- validation
- optional coaching/review before sending
- graceful handling when the coaching service is unavailable
- push and email notifications

### Payments
[backend/src/routes/subscriptions.ts](./backend/src/routes/subscriptions.ts) includes:
- Stripe Checkout session creation
- customer reuse/creation
- billing portal sessions
- subscription tier lookup
- webhook signature verification
- idempotency tracking for processed webhook events
- subscription-state updates

### Database
[backend/src/db/index.ts](./backend/src/db/index.ts) configures a PostgreSQL connection pool using environment configuration.

### Frontend and mobile
- [frontend-next/](./frontend-next) — Next.js application
- [mobile/](./mobile) — Expo/React Native application
- [shared/](./shared) — shared TypeScript types/package

## Technical walkthrough

For a recruiter-friendly path through the code, see **[TECHNICAL_WALKTHROUGH.md](./TECHNICAL_WALKTHROUGH.md)**.

## Local setup

Backend:

~~~bash
cd backend
npm install
cp .env.example .env
npm run dev
~~~

Frontend:

~~~bash
cd frontend-next
npm install
cp .env.example .env.local
npm run dev
~~~

Environment values are required for services such as the database, authentication and external integrations.

## Current status

The web product is live. The Android/Expo application is prepared as part of the project but is not presented here as a published production app.
