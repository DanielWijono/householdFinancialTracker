-- Bundles the 4 dashboard queries (categories, transactions, budgets, goals)
-- into a single round trip. security invoker so existing RLS policies
-- (is_household_member()) still gate every row.
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
        'date', t.date
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
