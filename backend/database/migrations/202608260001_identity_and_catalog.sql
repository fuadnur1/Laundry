begin;

create table public.roles (
  id smallint generated always as identity primary key,
  code text not null unique,
  name text not null unique,
  description text,
  created_at timestamptz not null default now(),
  constraint roles_code_format_check check (code ~ '^[A-Z_]+$')
);

insert into public.roles (code, name, description)
values
  ('CUSTOMER', 'Customer', 'Places and tracks laundry orders.'),
  ('RIDER', 'Rider', 'Performs customer-to-partner and partner-to-customer deliveries.'),
  ('PARTNER', 'Laundry Partner', 'Provides and processes laundry services.'),
  ('ADMIN', 'Administrator', 'Approves participants and manages the platform.');

create table public.users (
  id uuid primary key references auth.users (id) on delete cascade,
  role_id smallint not null references public.roles (id) on delete restrict,
  name varchar(120) not null,
  email varchar(254) not null,
  phone varchar(30) not null,
  account_status text not null default 'PENDING',
  email_verified_at timestamptz,
  phone_verified_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint users_name_not_blank_check check (btrim(name) <> ''),
  constraint users_email_not_blank_check check (btrim(email) <> ''),
  constraint users_phone_not_blank_check check (btrim(phone) <> ''),
  constraint users_account_status_check check (
    account_status in ('PENDING', 'ACTIVE', 'SUSPENDED', 'REJECTED')
  )
);

create unique index users_email_lower_uq on public.users (lower(email));
create unique index users_phone_uq on public.users (phone);

create table public.addresses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users (id) on delete cascade,
  label varchar(50) not null,
  address_line text not null,
  area varchar(100) not null,
  city varchar(100) not null default 'Dhaka',
  postal_code varchar(20),
  latitude numeric(9, 6),
  longitude numeric(9, 6),
  is_default boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint addresses_label_not_blank_check check (btrim(label) <> ''),
  constraint addresses_line_not_blank_check check (btrim(address_line) <> ''),
  constraint addresses_area_not_blank_check check (btrim(area) <> ''),
  constraint addresses_latitude_check check (latitude is null or latitude between -90 and 90),
  constraint addresses_longitude_check check (longitude is null or longitude between -180 and 180)
);

create unique index addresses_one_default_per_user_uq
  on public.addresses (user_id)
  where is_default;

create table public.rider_profiles (
  user_id uuid primary key references public.users (id) on delete cascade,
  national_id varchar(50) unique,
  vehicle_type varchar(50) not null,
  vehicle_registration varchar(80),
  licence_number varchar(80),
  availability_status text not null default 'OFFLINE',
  verification_status text not null default 'PENDING',
  average_rating numeric(3, 2) not null default 0,
  total_ratings integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint rider_vehicle_type_not_blank_check check (btrim(vehicle_type) <> ''),
  constraint rider_availability_status_check check (
    availability_status in ('OFFLINE', 'AVAILABLE', 'BUSY')
  ),
  constraint rider_verification_status_check check (
    verification_status in ('PENDING', 'APPROVED', 'REJECTED')
  ),
  constraint rider_average_rating_check check (average_rating between 0 and 5),
  constraint rider_total_ratings_check check (total_ratings >= 0)
);

create table public.partner_profiles (
  user_id uuid primary key references public.users (id) on delete cascade,
  business_name varchar(160) not null,
  owner_name varchar(120) not null,
  trade_licence_number varchar(100) unique,
  description text,
  business_address text not null,
  latitude numeric(9, 6),
  longitude numeric(9, 6),
  service_radius_km numeric(6, 2) not null default 5,
  opening_time time,
  closing_time time,
  verification_status text not null default 'PENDING',
  average_rating numeric(3, 2) not null default 0,
  total_ratings integer not null default 0,
  is_open boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint partner_business_name_not_blank_check check (btrim(business_name) <> ''),
  constraint partner_owner_name_not_blank_check check (btrim(owner_name) <> ''),
  constraint partner_address_not_blank_check check (btrim(business_address) <> ''),
  constraint partner_latitude_check check (latitude is null or latitude between -90 and 90),
  constraint partner_longitude_check check (longitude is null or longitude between -180 and 180),
  constraint partner_service_radius_check check (service_radius_km > 0),
  constraint partner_verification_status_check check (
    verification_status in ('PENDING', 'APPROVED', 'REJECTED')
  ),
  constraint partner_average_rating_check check (average_rating between 0 and 5),
  constraint partner_total_ratings_check check (total_ratings >= 0),
  constraint partner_operating_hours_check check (
    opening_time is null or closing_time is null or opening_time <> closing_time
  )
);

create table public.laundry_services (
  id uuid primary key default gen_random_uuid(),
  partner_id uuid not null references public.partner_profiles (user_id) on delete cascade,
  name varchar(120) not null,
  category varchar(80) not null,
  description text,
  unit_type text not null,
  unit_price numeric(12, 2) not null,
  estimated_hours integer not null,
  express_available boolean not null default false,
  express_surcharge numeric(12, 2) not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint laundry_services_name_not_blank_check check (btrim(name) <> ''),
  constraint laundry_services_category_not_blank_check check (btrim(category) <> ''),
  constraint laundry_services_unit_type_check check (unit_type in ('ITEM', 'KG')),
  constraint laundry_services_unit_price_check check (unit_price > 0),
  constraint laundry_services_estimated_hours_check check (estimated_hours > 0),
  constraint laundry_services_express_surcharge_check check (express_surcharge >= 0),
  constraint laundry_services_express_consistency_check check (
    express_available or express_surcharge = 0
  ),
  constraint laundry_services_partner_name_uq unique (partner_id, name)
);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger users_set_updated_at
before update on public.users
for each row execute function public.set_updated_at();

create trigger addresses_set_updated_at
before update on public.addresses
for each row execute function public.set_updated_at();

create trigger rider_profiles_set_updated_at
before update on public.rider_profiles
for each row execute function public.set_updated_at();

create trigger partner_profiles_set_updated_at
before update on public.partner_profiles
for each row execute function public.set_updated_at();

create trigger laundry_services_set_updated_at
before update on public.laundry_services
for each row execute function public.set_updated_at();

commit;
