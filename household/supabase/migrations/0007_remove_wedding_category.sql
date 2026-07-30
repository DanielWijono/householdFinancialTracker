-- Remove Wedding category and its transactions/budgets entirely.

do $$
declare
  wedding_id uuid;
begin
  select id into wedding_id from categories where name = 'Wedding';

  if wedding_id is null then
    return;
  end if;

  delete from transactions where category_id = wedding_id;
  delete from budgets where category_id = wedding_id;
  delete from categories where id = wedding_id;
end $$;
