begin;

create index users_role_status_idx on public.users (role_id, account_status);
create index addresses_user_idx on public.addresses (user_id);
create index rider_profiles_availability_idx
  on public.rider_profiles (verification_status, availability_status);
create index partner_profiles_marketplace_idx
  on public.partner_profiles (verification_status, is_open);
create index laundry_services_partner_active_idx
  on public.laundry_services (partner_id, is_active);
create index laundry_services_category_active_idx
  on public.laundry_services (category, is_active);

create index orders_customer_created_idx on public.orders (customer_id, created_at desc);
create index orders_partner_status_idx on public.orders (partner_id, status, created_at desc);
create index order_items_order_idx on public.order_items (order_id);
create index order_status_history_order_created_idx
  on public.order_status_history (order_id, created_at);
create index delivery_tasks_available_idx
  on public.delivery_tasks (task_type, created_at)
  where status = 'AVAILABLE';
create index delivery_tasks_rider_status_idx
  on public.delivery_tasks (rider_id, status, created_at desc)
  where rider_id is not null;
create index payments_order_created_idx on public.payments (order_id, created_at desc);
create index payments_status_idx on public.payments (status, created_at desc);
create index reviews_partner_created_idx on public.reviews (partner_id, created_at desc);
create index reviews_rider_created_idx
  on public.reviews (rider_id, created_at desc)
  where rider_id is not null;

alter table public.roles enable row level security;
alter table public.users enable row level security;
alter table public.addresses enable row level security;
alter table public.rider_profiles enable row level security;
alter table public.partner_profiles enable row level security;
alter table public.laundry_services enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;
alter table public.order_status_history enable row level security;
alter table public.delivery_tasks enable row level security;
alter table public.payments enable row level security;
alter table public.reviews enable row level security;

comment on table public.roles is 'Fixed LAUNDRRY application roles.';
comment on table public.users is 'Application profile linked one-to-one with Supabase auth.users.';
comment on table public.laundry_services is 'Partner-owned service catalog with current prices.';
comment on table public.orders is 'Customer order header and authoritative current lifecycle status.';
comment on table public.order_items is 'Immutable service and price snapshots for an order.';
comment on table public.order_status_history is 'Append-only audit trail of accepted order transitions.';
comment on table public.delivery_tasks is 'One physical logistics leg; normally two rows per completed order.';
comment on table public.payments is 'Payment attempts and results associated with orders.';
comment on table public.reviews is 'At most one verified customer review per completed order.';

commit;
