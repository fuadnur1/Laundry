-- LAUNDRRY development seed data
-- Run only after all Phase 3 migrations have been applied.
-- This file is idempotent and is intended for local/development API testing.

begin;

-- The public.users table references auth.users, so a deterministic Auth identity
-- is created for the catalog-only seed Partner. No password is assigned because
-- this seed is for testing GET /api/v1/services, not authentication.
insert into auth.users (
  instance_id,
  id,
  aud,
  role,
  email,
  email_confirmed_at,
  raw_app_meta_data,
  raw_user_meta_data,
  created_at,
  updated_at
)
values (
  '00000000-0000-0000-0000-000000000000',
  '10000000-0000-4000-8000-000000000001',
  'authenticated',
  'authenticated',
  'partner.seed@laundrry.local',
  now(),
  '{"provider":"email","providers":["email"]}'::jsonb,
  '{"name":"Campus Cleaners Owner","seed":true}'::jsonb,
  now(),
  now()
)
on conflict (id) do update
set
  email = excluded.email,
  email_confirmed_at = excluded.email_confirmed_at,
  raw_app_meta_data = excluded.raw_app_meta_data,
  raw_user_meta_data = excluded.raw_user_meta_data,
  updated_at = now();

do $$
begin
  if not exists (select 1 from public.roles where code = 'PARTNER') then
    raise exception 'Required PARTNER role is missing. Apply Phase 3 migrations before seed.sql.';
  end if;
end;
$$;

insert into public.users (
  id,
  role_id,
  name,
  email,
  phone,
  account_status,
  email_verified_at
)
select
  '10000000-0000-4000-8000-000000000001',
  roles.id,
  'Campus Cleaners Owner',
  'partner.seed@laundrry.local',
  '+8801700000001',
  'ACTIVE',
  now()
from public.roles
where roles.code = 'PARTNER'
on conflict (id) do update
set
  role_id = excluded.role_id,
  name = excluded.name,
  email = excluded.email,
  phone = excluded.phone,
  account_status = 'ACTIVE',
  email_verified_at = excluded.email_verified_at,
  updated_at = now();

insert into public.partner_profiles (
  user_id,
  business_name,
  owner_name,
  trade_licence_number,
  description,
  business_address,
  latitude,
  longitude,
  service_radius_km,
  opening_time,
  closing_time,
  verification_status,
  average_rating,
  total_ratings,
  is_open
)
values (
  '10000000-0000-4000-8000-000000000001',
  'Campus Cleaners',
  'Campus Cleaners Owner',
  'DEV-TRADE-0001',
  'Development laundry partner for LAUNDRRY marketplace API testing.',
  'Bashundhara Residential Area, Dhaka',
  23.810300,
  90.412500,
  8.00,
  '08:00',
  '22:00',
  'APPROVED',
  0,
  0,
  true
)
on conflict (user_id) do update
set
  business_name = excluded.business_name,
  owner_name = excluded.owner_name,
  trade_licence_number = excluded.trade_licence_number,
  description = excluded.description,
  business_address = excluded.business_address,
  latitude = excluded.latitude,
  longitude = excluded.longitude,
  service_radius_km = excluded.service_radius_km,
  opening_time = excluded.opening_time,
  closing_time = excluded.closing_time,
  verification_status = 'APPROVED',
  average_rating = excluded.average_rating,
  total_ratings = excluded.total_ratings,
  is_open = true,
  updated_at = now();

insert into public.laundry_services (
  id,
  partner_id,
  name,
  category,
  description,
  unit_type,
  unit_price,
  estimated_hours,
  express_available,
  express_surcharge,
  is_active
)
values (
  '20000000-0000-4000-8000-000000000001',
  '10000000-0000-4000-8000-000000000001',
  'Wash and Iron',
  'Washing',
  'Professional washing and ironing per item for development API testing.',
  'ITEM',
  80.00,
  24,
  true,
  30.00,
  true
)
on conflict (id) do update
set
  partner_id = excluded.partner_id,
  name = excluded.name,
  category = excluded.category,
  description = excluded.description,
  unit_type = excluded.unit_type,
  unit_price = excluded.unit_price,
  estimated_hours = excluded.estimated_hours,
  express_available = excluded.express_available,
  express_surcharge = excluded.express_surcharge,
  is_active = true,
  updated_at = now();

do $$
begin
  if not exists (
    select 1
    from public.partner_profiles
    where user_id = '10000000-0000-4000-8000-000000000001'
      and verification_status = 'APPROVED'
      and is_open
  ) then
    raise exception 'Development Partner seed verification failed.';
  end if;

  if not exists (
    select 1
    from public.laundry_services
    where id = '20000000-0000-4000-8000-000000000001'
      and is_active
  ) then
    raise exception 'Development laundry service seed verification failed.';
  end if;
end;
$$;

commit;
