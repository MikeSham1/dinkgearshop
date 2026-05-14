-- ============================================================
-- Dink Gear Shop — Admin RLS Policies
-- Run this in Supabase SQL Editor AFTER schema.sql
-- ============================================================

-- Authenticated admin can read everything
create policy "auth select email_signups"
  on email_signups for select to authenticated using (true);

create policy "auth select contact_messages"
  on contact_messages for select to authenticated using (true);

create policy "auth select customers"
  on customers for select to authenticated using (true);

create policy "auth select orders"
  on orders for select to authenticated using (true);

create policy "auth select order_items"
  on order_items for select to authenticated using (true);

create policy "auth select discount_codes"
  on discount_codes for select to authenticated using (true);

-- Authenticated admin can update order status
create policy "auth update orders"
  on orders for update to authenticated using (true);

-- Authenticated admin can update product stock
create policy "auth update products"
  on products for update to authenticated using (true);

-- Authenticated admin can manage discount codes
create policy "auth update discount_codes"
  on discount_codes for update to authenticated using (true);

create policy "auth insert discount_codes"
  on discount_codes for insert to authenticated with check (true);

create policy "auth delete discount_codes"
  on discount_codes for delete to authenticated using (true);
