# Database migrations

Apply these files to the Supabase PostgreSQL database in filename order:

1. `202608260001_identity_and_catalog.sql`
2. `202608260002_orders_logistics_payments_reviews.sql`
3. `202608260003_indexes_and_security.sql`

The migrations create the approved CSE327 relational schema and the four fixed roles. They do not insert demo users, services, orders, payments, deliveries, or reviews.

The third migration enables Row Level Security without public policies. Until role-aware policies are implemented, access is intentionally limited to the trusted Express backend using `SUPABASE_SECRET_KEY` and Supabase administrative tools.
