# LAUNDRRY Backend

Phase 1 backend foundation for the CSE327 Laundry Marketplace Management System.

## Requirements

- Node.js 20 or newer
- PostgreSQL 14 or newer

## Local setup

1. Create a PostgreSQL database named `laundrry`.
2. Copy `.env.example` to `.env` and update `DATABASE_URL` for your local PostgreSQL account.
3. Install dependencies with `pnpm install` (or `npm install`).
4. Apply migrations with `pnpm migrate:up` (or `npm run migrate:up`).
5. Start development mode with `pnpm dev` (or `npm run dev`).

The API base URL is `http://localhost:5000/api/v1` by default.

## Verification

- Automated tests: `pnpm test` or `npm test`
- Health endpoint: `GET http://localhost:5000/api/v1/health`
- Migration rollback: `pnpm migrate:down` or `npm run migrate:down`

The health endpoint returns HTTP 200 only when the API can query PostgreSQL. It returns HTTP 503 when the database is unavailable.
