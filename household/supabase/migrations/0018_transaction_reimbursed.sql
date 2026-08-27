-- Joint-account transactions are fronted with one person's own money, then
-- reimbursed from the shared cash pool later. Track whether that reimbursement
-- has happened. Informational only — no settlement / budget / balance math uses it.
-- No backfill: every existing row takes the default (not reimbursed).

alter table transactions
  add column reimbursed boolean not null default false,
  add column reimbursed_date date;

-- A reimbursed_date may only be set on a reimbursed row (it may still be null
-- if the date is unknown).
alter table transactions
  add constraint tx_reimbursed_date_chk check (reimbursed or reimbursed_date is null);

-- Recreate the dashboard RPC (body copied from 0015_dashboard_rpc.sql) so the
-- transaction objects it returns carry the two new fields. The dashboard does
-- not render them yet, but this keeps the app-side Transaction shape uniform.
create or replace function public.get_dashboard_data(p_month date)
returns jsonb
language sql
security invoker
stable
set search_path = public
as $$
  select jsonb_build_object(
    'categories', coalesce((
      select jsonb_agg(jsonb_build_object(
        'id', c.id,
        'name', c.name,
        'icon', c.icon,
        'defaultSplitDaniel', c.default_split_daniel,
        'defaultSplitAdel', c.default_split_adel,
        'isPersonal', c.is_personal
      ) order by c.created_at)
      from categories c
    ), '[]'::jsonb),
    'transactions', coalesce((
      select jsonb_agg(jsonb_build_object(
        'id', t.id,
        'categoryId', t.category_id,
        'amount', t.amount::float8,
        'paidBy', t.paid_by,
        'splitDaniel', t.split_daniel,
        'splitAdel', t.split_adel,
        'note', t.note,
        'date', t.date,
        'reimbursed', t.reimbursed,
        'reimbursedDate', t.reimbursed_date
      ) order by t.date desc)
      from transactions t
      where t.date >= date_trunc('month', p_month)::date
        and t.date < (date_trunc('month', p_month) + interval '1 month')::date
    ), '[]'::jsonb),
    'budgets', coalesce((
      select jsonb_agg(jsonb_build_object(
        'categoryId', b.category_id,
        'monthLimit', b.amount_limit::float8
      ))
      from budgets b
      where b.month = date_trunc('month', p_month)::date
    ), '[]'::jsonb),
    'goals', coalesce((
      select jsonb_agg(jsonb_build_object(
        'id', g.id,
        'name', g.name,
        'targetAmount', g.target_amount::float8,
        'currentAmount', g.current_amount::float8,
        'targetDate', g.target_date
      ) order by g.created_at)
      from goals g
    ), '[]'::jsonb)
  );
$$;

grant execute on function public.get_dashboard_data(date) to authenticated;
