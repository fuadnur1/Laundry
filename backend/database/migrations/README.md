# Database migrations

Versioned PostgreSQL schema changes belong in this directory.

- Create a migration: `pnpm migrate:create <migration-name>`
- Apply pending migrations: `pnpm migrate:up`
- Revert the latest migration: `pnpm migrate:down`

The first domain-schema migration will be added in the database-schema implementation phase. Phase 1 intentionally configures the migration mechanism without creating application tables early.
