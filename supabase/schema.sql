-- ============================================================
-- Run this entire file in your Supabase SQL Editor
-- Dashboard -> SQL Editor -> New Query -> paste -> Run
-- ============================================================

-- Holdings table
create table if not exists public.holdings (
  id            uuid        default gen_random_uuid() primary key,
  user_id       uuid        not null references auth.users(id) on delete cascade,
  symbol        text        not null,
  name          text        not null default '',
  shares        numeric(18,6) not null check (shares > 0),
  avg_buy_price numeric(18,6) not null check (avg_buy_price > 0),
  created_at    timestamptz not null default now()
);

-- Row Level Security — every user only sees their own rows
alter table public.holdings enable row level security;

create policy "select own holdings"
  on public.holdings for select
  using (auth.uid() = user_id);

create policy "insert own holdings"
  on public.holdings for insert
  with check (auth.uid() = user_id);

create policy "delete own holdings"
  on public.holdings for delete
  using (auth.uid() = user_id);
