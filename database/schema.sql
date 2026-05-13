-- ============================================================
-- Dink Gear Shop — Supabase Schema
-- Run this entire file in the Supabase SQL Editor
-- ============================================================

-- Email signups (homepage form)
create table if not exists email_signups (
  id         uuid        primary key default gen_random_uuid(),
  email      text        not null unique,
  created_at timestamptz default now()
);

-- Contact form messages
create table if not exists contact_messages (
  id         uuid        primary key default gen_random_uuid(),
  name       text        not null,
  email      text        not null,
  message    text        not null,
  created_at timestamptz default now()
);

-- Customers
create table if not exists customers (
  id         uuid        primary key default gen_random_uuid(),
  email      text        not null unique,
  name       text,
  created_at timestamptz default now()
);

-- Orders
create table if not exists orders (
  id               uuid         primary key default gen_random_uuid(),
  customer_email   text         not null,
  customer_name    text,
  total            numeric(10,2) not null,
  status           text         default 'pending',
  shipping_address jsonb,
  created_at       timestamptz  default now()
);

-- Order line items
create table if not exists order_items (
  id         uuid         primary key default gen_random_uuid(),
  order_id   uuid         references orders(id) on delete cascade,
  product_id text         not null,
  name       text         not null,
  size       text,
  price      numeric(10,2) not null,
  quantity   integer      not null default 1
);

-- Products / inventory
create table if not exists products (
  id     text         primary key,
  name   text         not null,
  price  numeric(10,2) not null,
  stock  integer      default 0,
  active boolean      default true
);

-- Seed initial products
insert into products (id, name, price, stock) values
  ('shirt', 'Dink Culture Tee',    34.99, 100),
  ('cap',   'Snapback Cap',        28.99, 100),
  ('shoe',  'Court Sneakers',      89.99, 50)
on conflict (id) do nothing;

-- Discount codes
create table if not exists discount_codes (
  id               uuid        primary key default gen_random_uuid(),
  code             text        not null unique,
  discount_percent integer     not null,
  max_uses         integer,
  used_count       integer     default 0,
  active           boolean     default true,
  expires_at       timestamptz
);

-- Seed a welcome code
insert into discount_codes (code, discount_percent, max_uses) values
  ('DINK10', 10, 500)
on conflict (code) do nothing;

-- ============================================================
-- Row Level Security
-- ============================================================

alter table email_signups    enable row level security;
alter table contact_messages enable row level security;
alter table customers        enable row level security;
alter table orders           enable row level security;
alter table order_items      enable row level security;
alter table products         enable row level security;
alter table discount_codes   enable row level security;

-- Public can sign up for emails
create policy "anon insert email_signups"
  on email_signups for insert to anon with check (true);

-- Public can send contact messages
create policy "anon insert contact_messages"
  on contact_messages for insert to anon with check (true);

-- Public can create customer records
create policy "anon insert customers"
  on customers for insert to anon with check (true);

-- Public can place orders (we'll validate the order details in the application code)
create policy "anon insert orders"
  on orders for insert to anon with check (true);

-- Public can add order items
create policy "anon insert order_items"
  on order_items for insert to anon with check (true);

-- Public can read active products
create policy "anon select products"
  on products for select to anon using (active = true);

-- Public can read active discount codes (to validate at checkout)
create policy "anon select discount_codes"
  on discount_codes for select to anon using (active = true);
