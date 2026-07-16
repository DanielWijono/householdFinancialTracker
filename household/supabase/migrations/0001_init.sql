-- Rumah — initial schema
-- Two-user household ledger. Every table is scoped to exactly Daniel & Adel via RLS.

create extension if not exists "pgcrypto";

-- Maps auth.users -> the two household members. Seed this manually after
-- each person signs up once (see bottom of file).
create table household_users (
  id uuid primary key references auth.users (id) on delete cascade,
  name text not null unique check (name in ('daniel', 'adel'))
);

create table categories (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  icon text not null,
  default_split_daniel smallint not null check (default_split_daniel between 0 and 100),
  default_split_adel smallint not null check (default_split_adel between 0 and 100),
  is_personal boolean not null default false,
  created_at timestamptz not null default now(),
  constraint split_sums_100 check (default_split_daniel + default_split_adel = 100)
);

create table transactions (
  id uuid primary key default gen_random_uuid(),
  category_id uuid not null references categories (id) on delete restrict,
  amount numeric(12, 2) not null check (amount > 0),
  currency text not null default 'IDR',
  paid_by uuid not null references household_users (id),
  split_daniel smallint not null check (split_daniel between 0 and 100),
  split_adel smallint not null check (split_adel between 0 and 100),
  note text,
  date date not null default current_date,
  is_recurring boolean not null default false,
  recurring_rule text,
  created_at timestamptz not null default now(),
  constraint tx_split_sums_100 check (split_daniel + split_adel = 100)
);

create table budgets (
  id uuid primary key default gen_random_uuid(),
  category_id uuid not null references categories (id) on delete cascade,
  month date not null, -- always the 1st of the month
  amount_limit numeric(12, 2) not null check (amount_limit >= 0),
  created_at timestamptz not null default now(),
  unique (category_id, month)
);

create table goals (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  target_amount numeric(12, 2) not null check (target_amount > 0),
  target_date date,
  current_amount numeric(12, 2) not null default 0,
  contribution_daniel smallint not null default 50 check (contribution_daniel between 0 and 100),
  contribution_adel smallint not null default 50 check (contribution_adel between 0 and 100),
  created_at timestamptz not null default now(),
  constraint goal_contribution_sums_100 check (contribution_daniel + contribution_adel = 100)
);

create table goal_contributions (
  id uuid primary key default gen_random_uuid(),
  goal_id uuid not null references goals (id) on delete cascade,
  contributor uuid not null references household_users (id),
  amount numeric(12, 2) not null check (amount > 0),
  date date not null default current_date,
  created_at timestamptz not null default now()
);

create index transactions_category_id_idx on transactions (category_id);
create index transactions_date_idx on transactions (date desc);
create index budgets_category_id_idx on budgets (category_id);
create index goal_contributions_goal_id_idx on goal_contributions (goal_id);

-- RLS: only Daniel & Adel, ever. Every table checks the caller is a known
-- household member — no per-row ownership columns needed since there's
-- nothing to partition between them (both see everything, always).
alter table household_users enable row level security;
alter table categories enable row level security;
alter table transactions enable row level security;
alter table budgets enable row level security;
alter table goals enable row level security;
alter table goal_contributions enable row level security;

create policy "household members only" on household_users
  for select using (auth.uid() in (select id from household_users));

create policy "household members only" on categories
  for all using (auth.uid() in (select id from household_users))
  with check (auth.uid() in (select id from household_users));

create policy "household members only" on transactions
  for all using (auth.uid() in (select id from household_users))
  with check (auth.uid() in (select id from household_users));

create policy "household members only" on budgets
  for all using (auth.uid() in (select id from household_users))
  with check (auth.uid() in (select id from household_users));

create policy "household members only" on goals
  for all using (auth.uid() in (select id from household_users))
  with check (auth.uid() in (select id from household_users));

create policy "household members only" on goal_contributions
  for all using (auth.uid() in (select id from household_users))
  with check (auth.uid() in (select id from household_users));

-- After Daniel & Adel each sign up once via Supabase Auth, run:
--   insert into household_users (id, name) values ('<daniel-auth-uid>', 'daniel');
--   insert into household_users (id, name) values ('<adel-auth-uid>', 'adel');
