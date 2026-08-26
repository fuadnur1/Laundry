from pathlib import Path
import re

root = Path(__file__).resolve().parents[1] / "backend" / "database" / "migrations"
files = sorted(root.glob("*.sql"))
assert [p.name for p in files] == [
    "202608260001_identity_and_catalog.sql",
    "202608260002_orders_logistics_payments_reviews.sql",
    "202608260003_indexes_and_security.sql",
]

sql = "\n".join(p.read_text(encoding="utf-8") for p in files)
tables = re.findall(r"create table public\.(\w+)", sql, flags=re.I)
expected = {
    "roles", "users", "addresses", "rider_profiles", "partner_profiles",
    "laundry_services", "orders", "order_items", "order_status_history",
    "delivery_tasks", "payments", "reviews",
}

assert set(tables) == expected, (set(tables), expected)
assert len(tables) == len(set(tables)), "Duplicate CREATE TABLE statement"
assert sql.lower().count("begin;") == 3
assert sql.lower().count("commit;") == 3

references = re.findall(r"references\s+(?:public\.|auth\.)(\w+)", sql, flags=re.I)
assert all(target in expected or target == "users" for target in references)

rls_tables = set(re.findall(
    r"alter table public\.(\w+) enable row level security", sql, flags=re.I
))
assert rls_tables == expected, (rls_tables, expected)

assert "insert into public.roles" in sql.lower()
for role in ("CUSTOMER", "RIDER", "PARTNER", "ADMIN"):
    assert f"'{role}'" in sql

print(f"Validated {len(files)} migrations, {len(tables)} tables, and RLS coverage for all tables.")
