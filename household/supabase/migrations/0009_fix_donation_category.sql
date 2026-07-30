-- Donation is purely personal, not shared 50/50: it's paid by either Daniel
-- or Adel and attributed 100% to whoever paid, split follows paid_by (set in
-- app UI, not fixed). Default row split_daniel is a placeholder since the UI
-- always overrides it based on paid_by.

update categories
set is_personal = true,
    default_split_daniel = 100,
    default_split_adel = 0
where name = 'Donation';
