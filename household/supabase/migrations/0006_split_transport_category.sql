-- Split shared "Transport" (70/30) into two personal categories:
-- Transport Daniel (100/0) and Transport Adel (0/100).
-- Existing transport transactions are reassigned by paid_by; joint-paid
-- transport (if any) falls back to Transport Daniel.

do $$
declare
  old_transport_id uuid;
  transport_daniel_id uuid;
  transport_adel_id uuid;
begin
  select id into old_transport_id from categories where name = 'Transport';

  if old_transport_id is null then
    return;
  end if;

  insert into categories (name, icon, default_split_daniel, default_split_adel, is_personal)
  values ('Transport Daniel', '🚗', 100, 0, true)
  returning id into transport_daniel_id;

  insert into categories (name, icon, default_split_daniel, default_split_adel, is_personal)
  values ('Transport Adel', '🚗', 0, 100, true)
  returning id into transport_adel_id;

  update transactions
  set category_id = transport_daniel_id,
      split_daniel = 100,
      split_adel = 0
  where category_id = old_transport_id
    and paid_by in ('daniel', 'joint');

  update transactions
  set category_id = transport_adel_id,
      split_daniel = 0,
      split_adel = 100
  where category_id = old_transport_id
    and paid_by = 'adel';

  update budgets
  set category_id = transport_daniel_id
  where category_id = old_transport_id;

  delete from categories where id = old_transport_id;
end $$;
