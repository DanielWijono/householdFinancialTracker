-- Split "Donation" (100/0 Daniel-only) into two personal categories so each
-- person can track/budget their own donations: Donation Daniel (100/0) and
-- Donation Adel (0/100). Existing donation transactions reassigned by paid_by;
-- joint-paid donations (if any) fall back to Donation Daniel.

do $$
declare
  old_donation_id uuid;
  donation_daniel_id uuid;
  donation_adel_id uuid;
begin
  select id into old_donation_id from categories where name = 'Donation';

  if old_donation_id is null then
    return;
  end if;

  insert into categories (name, icon, default_split_daniel, default_split_adel, is_personal)
  values ('Donation Daniel', '🎗️', 100, 0, true)
  returning id into donation_daniel_id;

  insert into categories (name, icon, default_split_daniel, default_split_adel, is_personal)
  values ('Donation Adel', '🎗️', 0, 100, true)
  returning id into donation_adel_id;

  update transactions
  set category_id = donation_daniel_id,
      split_daniel = 100,
      split_adel = 0
  where category_id = old_donation_id
    and paid_by in ('daniel', 'joint');

  update transactions
  set category_id = donation_adel_id,
      split_daniel = 0,
      split_adel = 100
  where category_id = old_donation_id
    and paid_by = 'adel';

  update budgets
  set category_id = donation_daniel_id
  where category_id = old_donation_id;

  delete from categories where id = old_donation_id;
end $$;
