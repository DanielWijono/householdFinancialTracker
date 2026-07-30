-- Donation category: shared 50/50, but paid directly by Daniel or Adel only
-- (no joint-account payments) — enforced in the app UI, not the DB.

insert into categories (name, icon, default_split_daniel, default_split_adel, is_personal)
values ('Donation', '🎗️', 50, 50, false);
