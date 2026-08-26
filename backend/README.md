# LAUNDRRY Backend

Express backend foundation connected to Supabase for the CSE327 Laundry Marketplace Management System.

## Requirements

- Node.js 20 or newer
- A Supabase project
- A server-side Supabase secret key

## Local setup

1. Create or select a Supabase project.
2. Open Supabase Dashboard > Project Settings > API Keys.
3. Copy `.env.example` to `.env`.
4. Set `SUPABASE_URL` and the server-only `SUPABASE_SECRET_KEY` in `.env`.
5. Install dependencies with `pnpm install` (or `npm install`).
6. Start development mode with `pnpm dev` (or `npm run dev`).

The API base URL is `http://localhost:5000/api/v1` by default.

## API endpoints

### List available laundry services

```http
GET /api/v1/services
```

Returns active laundry services belonging to approved, currently open laundry partners. Each result contains the service name, category, description, price, unit type, estimated processing time, express-service information, and provider details.

Example response:

```json
{
  "success": true,
  "message": "Available laundry services retrieved successfully.",
  "data": [
    {
      "id": "service-uuid",
      "name": "Wash and Iron",
      "category": "Washing",
      "description": "Professional washing and ironing per item.",
      "price": 80,
      "unitType": "ITEM",
      "estimatedHours": 24,
      "expressAvailable": true,
      "expressSurcharge": 30,
      "provider": {
        "id": "partner-user-uuid",
        "businessName": "Campus Cleaners",
        "address": "Bashundhara, Dhaka",
        "averageRating": 4.5
      }
    }
  ],
  "meta": {
    "count": 1
  }
}
```

An empty marketplace returns HTTP `200` with an empty `data` array. A Supabase query failure is passed to the centralized Express error handler.

## Verification

- Automated tests: `pnpm test` or `npm test`
- Health endpoint: `GET http://localhost:5000/api/v1/health`

The health endpoint returns HTTP 200 only when the backend can authenticate with the Supabase project. It returns HTTP 503 when Supabase is unavailable or the credentials are invalid.

## Security

`SUPABASE_SECRET_KEY` is a privileged server credential. Keep it only in the backend `.env` file. Never commit it, return it through an API, or include it in frontend code.

## Database schema

Phase 3 implements the approved relational schema as ordered SQL migrations in [`database/migrations`](database/migrations):

1. `202608260001_identity_and_catalog.sql` creates roles, application users, addresses, Rider and Partner profiles, laundry services, constraints, and update triggers.
2. `202608260002_orders_logistics_payments_reviews.sql` creates orders, immutable order items, status history, delivery tasks, payments, reviews, and their constraints.
3. `202608260003_indexes_and_security.sql` creates query indexes, documents core tables, and enables Row Level Security.

### Apply migrations in Supabase

1. Open the Supabase Dashboard for the configured project.
2. Open **SQL Editor** and create a new query.
3. Execute each migration file in the order listed above.
4. Stop if any migration reports an error; do not execute later files until the error is resolved.
5. Open **Table Editor** and verify that the tables were created under the `public` schema.
6. Run the verification queries below in SQL Editor.

```sql
select code, name from public.roles order by id;

select table_name
from information_schema.tables
where table_schema = 'public'
  and table_name in (
    'roles', 'users', 'addresses', 'rider_profiles', 'partner_profiles',
    'laundry_services', 'orders', 'order_items', 'order_status_history',
    'delivery_tasks', 'payments', 'reviews'
  )
order by table_name;
```

Expected roles are `CUSTOMER`, `RIDER`, `PARTNER`, and `ADMIN`. The table query should return 12 rows.

### Supabase access model

All application tables have Row Level Security enabled. Phase 3 does not create browser-access policies. The Express backend uses `SUPABASE_SECRET_KEY`, while direct anonymous/authenticated client access remains denied until the approved authentication and authorization phase defines policies.

### Important migration rules

- Apply migrations exactly once and in filename order.
- Do not place credentials inside migration files.
- Do not edit an already-applied migration; add a newer migration for later changes.
- Database constraints complement, but do not replace, backend validation and role authorization.

## Development seed data

[`database/seed.sql`](database/seed.sql) creates one deterministic, approved/open laundry Partner and one active laundry service for testing `GET /api/v1/services`.

Seeded records:

- Partner: `Campus Cleaners`
- Partner ID: `10000000-0000-4000-8000-000000000001`
- Service: `Wash and Iron`
- Service ID: `20000000-0000-4000-8000-000000000001`
- Price: BDT 80 per item
- Express surcharge: BDT 30

### Run the seed

1. Apply all three Phase 3 migrations first.
2. Open Supabase Dashboard > **SQL Editor**.
3. Open [`database/seed.sql`](database/seed.sql), copy its complete contents into a new query, and select **Run**.
4. The seed is idempotent, so it can be rerun to restore the development Partner and service to their expected active state.
5. Start the backend and request the service endpoint:

```powershell
pnpm dev
Invoke-RestMethod http://localhost:5000/api/v1/services
```

The response should contain `Wash and Iron` with `Campus Cleaners` as its provider.

This seed creates a passwordless Supabase Auth identity only to satisfy the existing `public.users → auth.users` foreign key. It is catalog test data and cannot be used to log in. Do not run development seeds in production.

### Verify the seed in SQL Editor

```sql
select
  services.name,
  services.unit_price,
  services.is_active,
  partners.business_name,
  partners.verification_status,
  partners.is_open
from public.laundry_services as services
join public.partner_profiles as partners
  on partners.user_id = services.partner_id
where services.id = '20000000-0000-4000-8000-000000000001';
```

Expected values are `Wash and Iron`, `80.00`, `true`, `Campus Cleaners`, `APPROVED`, and `true`.
