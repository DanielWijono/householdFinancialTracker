-- Joint savings account: deposits in, balance = deposits minus joint-paid
-- transactions (transactions.paid_by = 'joint'). See lib/joint.ts.

create table joint_contributions (
  id uuid primary key default gen_random_uuid(),
  contributor text not null check (contributor in ('daniel', 'adel')),
  amount numeric(12, 2) not null check (amount > 0),
  note text,
  date date not null default current_date,
  created_at timestamptz not null default now()
);

create index joint_contributions_date_idx on joint_contributions (date desc);

alter table joint_contributions enable row level security;

create policy "household members only" on joint_contributions
  for all using (public.is_household_member())
  with check (public.is_household_member());
