from pathlib import Path

seed_path = Path(__file__).resolve().parents[1] / "backend" / "database" / "seed.sql"
sql = seed_path.read_text(encoding="utf-8")
lower = sql.lower()

assert lower.count("begin;") == 1
assert lower.count("commit;") == 1
assert "rollback" not in lower

for forbidden in (
    "create table", "alter table", "drop table", "create index",
    "drop index", "create type", "alter type",
):
    assert forbidden not in lower, f"Seed must not modify schema: {forbidden}"

for table in ("auth.users", "public.users", "public.partner_profiles", "public.laundry_services"):
    assert f"insert into {table}" in lower

for value in (
    "10000000-0000-4000-8000-000000000001",
    "20000000-0000-4000-8000-000000000001",
    "Campus Cleaners",
    "Wash and Iron",
    "APPROVED",
):
    assert value in sql

assert lower.count("on conflict") == 4
assert "is_open = true" in lower
assert "is_active = true" in lower

print("Validated idempotent development seed: one Partner identity/profile and one laundry service; no schema DDL.")
