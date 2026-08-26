begin;

create table public.orders (
  id uuid primary key default gen_random_uuid(),
  order_number varchar(40) not null unique,
  customer_id uuid not null references public.users (id) on delete restrict,
  partner_id uuid not null references public.partner_profiles (user_id) on delete restrict,
  pickup_address_id uuid not null references public.addresses (id) on delete restrict,
  return_address_id uuid not null references public.addresses (id) on delete restrict,
  status text not null default 'PLACED',
  pickup_slot_start timestamptz not null,
  pickup_slot_end timestamptz not null,
  subtotal numeric(12, 2) not null,
  pickup_fee numeric(12, 2) not null default 0,
  return_fee numeric(12, 2) not null default 0,
  platform_fee numeric(12, 2) not null default 0,
  discount_amount numeric(12, 2) not null default 0,
  total_amount numeric(12, 2) not null,
  currency char(3) not null default 'BDT',
  customer_note text,
  cancellation_reason text,
  placed_at timestamptz not null default now(),
  completed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint orders_number_not_blank_check check (btrim(order_number) <> ''),
  constraint orders_status_check check (status in (
    'PLACED', 'PICKUP_REQUESTED', 'PICKUP_ASSIGNED', 'PICKED_UP',
    'AT_PARTNER', 'PARTNER_CONFIRMED', 'PROCESSING', 'READY_FOR_RETURN',
    'RETURN_ASSIGNED', 'OUT_FOR_DELIVERY', 'DELIVERED', 'COMPLETED', 'CANCELLED'
  )),
  constraint orders_pickup_slot_check check (pickup_slot_end > pickup_slot_start),
  constraint orders_subtotal_check check (subtotal >= 0),
  constraint orders_pickup_fee_check check (pickup_fee >= 0),
  constraint orders_return_fee_check check (return_fee >= 0),
  constraint orders_platform_fee_check check (platform_fee >= 0),
  constraint orders_discount_check check (discount_amount >= 0),
  constraint orders_total_check check (
    total_amount = subtotal + pickup_fee + return_fee + platform_fee - discount_amount
    and total_amount >= 0
  ),
  constraint orders_currency_format_check check (currency ~ '^[A-Z]{3}$'),
  constraint orders_completion_check check (
    (status = 'COMPLETED' and completed_at is not null)
    or (status <> 'COMPLETED' and completed_at is null)
  ),
  constraint orders_cancellation_reason_check check (
    status <> 'CANCELLED' or btrim(coalesce(cancellation_reason, '')) <> ''
  )
);

create table public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders (id) on delete cascade,
  service_id uuid not null references public.laundry_services (id) on delete restrict,
  service_name_snapshot varchar(120) not null,
  unit_type text not null,
  quantity numeric(10, 2) not null,
  unit_price_snapshot numeric(12, 2) not null,
  line_total numeric(12, 2) not null,
  special_instruction text,
  created_at timestamptz not null default now(),
  constraint order_items_service_name_not_blank_check check (btrim(service_name_snapshot) <> ''),
  constraint order_items_unit_type_check check (unit_type in ('ITEM', 'KG')),
  constraint order_items_quantity_check check (quantity > 0),
  constraint order_items_unit_price_check check (unit_price_snapshot > 0),
  constraint order_items_line_total_check check (
    line_total = quantity * unit_price_snapshot and line_total > 0
  )
);

create table public.order_status_history (
  id bigint generated always as identity primary key,
  order_id uuid not null references public.orders (id) on delete cascade,
  old_status text,
  new_status text not null,
  changed_by uuid not null references public.users (id) on delete restrict,
  note text,
  created_at timestamptz not null default now(),
  constraint order_status_history_old_status_check check (
    old_status is null or old_status in (
      'PLACED', 'PICKUP_REQUESTED', 'PICKUP_ASSIGNED', 'PICKED_UP',
      'AT_PARTNER', 'PARTNER_CONFIRMED', 'PROCESSING', 'READY_FOR_RETURN',
      'RETURN_ASSIGNED', 'OUT_FOR_DELIVERY', 'DELIVERED', 'COMPLETED', 'CANCELLED'
    )
  ),
  constraint order_status_history_new_status_check check (new_status in (
    'PLACED', 'PICKUP_REQUESTED', 'PICKUP_ASSIGNED', 'PICKED_UP',
    'AT_PARTNER', 'PARTNER_CONFIRMED', 'PROCESSING', 'READY_FOR_RETURN',
    'RETURN_ASSIGNED', 'OUT_FOR_DELIVERY', 'DELIVERED', 'COMPLETED', 'CANCELLED'
  )),
  constraint order_status_history_change_check check (old_status is null or old_status <> new_status)
);

create table public.delivery_tasks (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders (id) on delete cascade,
  rider_id uuid references public.rider_profiles (user_id) on delete restrict,
  task_type text not null,
  status text not null default 'AVAILABLE',
  pickup_address_snapshot jsonb not null,
  dropoff_address_snapshot jsonb not null,
  verification_code_hash text,
  proof_url text,
  accepted_at timestamptz,
  arrived_at timestamptz,
  collected_at timestamptz,
  delivered_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint delivery_tasks_task_type_check check (
    task_type in ('CUSTOMER_TO_PARTNER', 'PARTNER_TO_CUSTOMER')
  ),
  constraint delivery_tasks_status_check check (
    status in ('AVAILABLE', 'ACCEPTED', 'ARRIVED', 'COLLECTED', 'DELIVERED', 'FAILED')
  ),
  constraint delivery_tasks_assignment_check check (
    (status = 'AVAILABLE' and rider_id is null and accepted_at is null)
    or (status <> 'AVAILABLE' and rider_id is not null and accepted_at is not null)
  ),
  constraint delivery_tasks_arrival_check check (arrived_at is null or accepted_at is not null),
  constraint delivery_tasks_collection_check check (collected_at is null or arrived_at is not null),
  constraint delivery_tasks_delivery_check check (delivered_at is null or collected_at is not null),
  constraint delivery_tasks_order_type_uq unique (order_id, task_type)
);

create table public.payments (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders (id) on delete restrict,
  transaction_reference varchar(160),
  method text not null,
  amount numeric(12, 2) not null,
  currency char(3) not null default 'BDT',
  status text not null default 'PENDING',
  gateway_response jsonb,
  paid_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint payments_method_check check (method in ('CASH', 'CARD', 'BKASH', 'NAGAD')),
  constraint payments_amount_check check (amount > 0),
  constraint payments_currency_format_check check (currency ~ '^[A-Z]{3}$'),
  constraint payments_status_check check (status in ('PENDING', 'PAID', 'FAILED', 'REFUNDED')),
  constraint payments_paid_at_check check (
    (status in ('PAID', 'REFUNDED') and paid_at is not null)
    or (status in ('PENDING', 'FAILED') and paid_at is null)
  )
);

create unique index payments_transaction_reference_uq
  on public.payments (transaction_reference)
  where transaction_reference is not null;

create table public.reviews (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null unique references public.orders (id) on delete restrict,
  customer_id uuid not null references public.users (id) on delete restrict,
  partner_id uuid not null references public.partner_profiles (user_id) on delete restrict,
  rider_id uuid references public.rider_profiles (user_id) on delete restrict,
  partner_rating smallint not null,
  rider_rating smallint,
  comment text,
  created_at timestamptz not null default now(),
  constraint reviews_partner_rating_check check (partner_rating between 1 and 5),
  constraint reviews_rider_rating_check check (rider_rating is null or rider_rating between 1 and 5),
  constraint reviews_rider_consistency_check check (
    (rider_id is null and rider_rating is null) or rider_id is not null
  )
);

create trigger orders_set_updated_at
before update on public.orders
for each row execute function public.set_updated_at();

create trigger delivery_tasks_set_updated_at
before update on public.delivery_tasks
for each row execute function public.set_updated_at();

create trigger payments_set_updated_at
before update on public.payments
for each row execute function public.set_updated_at();

commit;
