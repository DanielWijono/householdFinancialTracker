-- 0002 seeded 7 categories but lib/categories.ts (and mock transaction t8 /
-- the Skincare budget) reference an 8th: Skincare, 0/100 split, personal.
insert into categories (name, icon, default_split_daniel, default_split_adel, is_personal) values
  ('Skincare', '💄', 0, 100, true);
