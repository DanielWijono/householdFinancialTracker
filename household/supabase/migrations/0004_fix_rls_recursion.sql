-- Fixes infinite-recursion RLS bug from 0001 (policy on household_users
-- queried household_users in its own USING clause) and finishes the setup
-- that errored out before reaching 0003. Safe to run once against a DB
-- that already has 0001 + 0002 applied but hasn't successfully run 0003.

create or replace function public.is_household_member()
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (select 1 from household_users where id = auth.uid());
$$;

drop policy if exists "household members only" on household_users;
drop policy if exists "household members only" on categories;
drop policy if exists "household members only" on transactions;
drop policy if exists "household members only" on budgets;
drop policy if exists "household members only" on goals;
drop policy if exists "household members only" on goal_contributions;

create policy "household members only" on household_users
  for select using (public.is_household_member());

create policy "household members only" on categories
  for all using (public.is_household_member())
  with check (public.is_household_member());

create policy "household members only" on transactions
  for all using (public.is_household_member())
  with check (public.is_household_member());

create policy "household members only" on budgets
  for all using (public.is_household_member())
  with check (public.is_household_member());

create policy "household members only" on goals
  for all using (public.is_household_member())
  with check (public.is_household_member());

create policy "household members only" on goal_contributions
  for all using (public.is_household_member())
  with check (public.is_household_member());

-- transactions.paid_by may still be the old uuid FK to household_users
-- from the original 0001 run — switch it to the text tag the app uses
-- ('daniel' | 'adel' | 'joint'), no-op if it's already text.
alter table transactions drop constraint if exists transactions_paid_by_fkey;
alter table transactions alter column paid_by type text using paid_by::text;
alter table transactions drop constraint if exists transactions_paid_by_check;
alter table transactions add constraint transactions_paid_by_check
  check (paid_by in ('daniel', 'adel', 'joint'));

-- joint_contributions never got created because 0003 errored before reaching it.
create table if not exists joint_contributions (
  id uuid primary key default gen_random_uuid(),
  contributor text not null check (contributor in ('daniel', 'adel')),
  amount numeric(12, 2) not null check (amount > 0),
  note text,
  date date not null default current_date,
  created_at timestamptz not null default now()
);

create index if not exists joint_contributions_date_idx on joint_contributions (date desc);

alter table joint_contributions enable row level security;

drop policy if exists "household members only" on joint_contributions;
create policy "household members only" on joint_contributions
  for all using (public.is_household_member())
  with check (public.is_household_member());
1