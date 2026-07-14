create extension if not exists "pgcrypto";

create table if not exists public.classes (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  subtitle text not null,
  description text not null,
  event_date timestamptz not null,
  event_time text not null,
  venue text not null,
  address text not null,
  fee integer not null check (fee >= 0),
  total_seats integer not null check (total_seats > 0),
  available_seats integer not null check (available_seats >= 0 and available_seats <= total_seats),
  registration_open boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.customers (
  id uuid primary key default gen_random_uuid(),
  booking_id text not null unique,
  class_id uuid not null references public.classes(id) on delete restrict,
  name text not null,
  phone text not null,
  email text,
  place text not null,
  interested_class text not null,
  occupation text,
  payment_status text not null default 'pending' check (payment_status in ('pending', 'paid', 'failed')),
  booking_status text not null default 'pending' check (booking_status in ('pending', 'confirmed', 'cancelled')),
  payment_id text,
  order_id text,
  amount_paid integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index if not exists customers_unique_paid_phone_per_class
  on public.customers (class_id, phone)
  where payment_status = 'paid';

create table if not exists public.gallery_images (
  id uuid primary key default gen_random_uuid(),
  image_path text not null unique,
  alt_text text not null,
  sort_order integer not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists public.payment_logs (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid not null references public.customers(id) on delete cascade,
  class_id uuid not null references public.classes(id) on delete restrict,
  order_id text not null,
  payment_id text,
  amount integer not null default 0,
  status text not null,
  gateway_payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists customers_class_idx on public.customers (class_id);
create index if not exists customers_booking_id_idx on public.customers (booking_id);
create index if not exists payment_logs_customer_idx on public.payment_logs (customer_id);
create index if not exists classes_registration_date_idx on public.classes (registration_open, event_date);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists classes_set_updated_at on public.classes;
create trigger classes_set_updated_at
before update on public.classes
for each row execute function public.set_updated_at();

drop trigger if exists customers_set_updated_at on public.customers;
create trigger customers_set_updated_at
before update on public.customers
for each row execute function public.set_updated_at();

create or replace function public.confirm_booking_payment(
  p_customer_id uuid,
  p_class_id uuid,
  p_order_id text,
  p_payment_id text,
  p_amount_paid integer
)
returns void
language plpgsql
as $$
declare
  v_available integer;
begin
  select available_seats
  into v_available
  from public.classes
  where id = p_class_id
  for update;

  if v_available is null then
    raise exception 'Class not found';
  end if;

  if v_available < 1 then
    raise exception 'No seats available';
  end if;

  update public.customers
  set
    payment_status = 'paid',
    booking_status = 'confirmed',
    payment_id = p_payment_id,
    order_id = p_order_id,
    amount_paid = p_amount_paid
  where id = p_customer_id
    and class_id = p_class_id
    and payment_status <> 'paid';

  if found then
    update public.classes
    set available_seats = available_seats - 1
    where id = p_class_id;
  end if;
end;
$$;

insert into public.classes (
  id,
  title,
  subtitle,
  description,
  event_date,
  event_time,
  venue,
  address,
  fee,
  total_seats,
  available_seats,
  registration_open
)
values (
  '2cb7ed8d-95e4-4e7e-8462-87d72a7f5b5d',
  'Vastu Awareness Program',
  'Align your home with balance, prosperity, and calm.',
  'A premium in-person session on practical Vastu principles for modern homes and workspaces.',
  '2026-08-09T00:00:00Z',
  '10:00 AM - 1:00 PM',
  'HariOm Convention Hall, Coimbatore',
  '12 Temple Road, RS Puram, Coimbatore, Tamil Nadu',
  999,
  80,
  23,
  true
)
on conflict (id) do nothing;
