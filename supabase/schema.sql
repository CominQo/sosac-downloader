-- Spusti celé v Supabase → SQL Editor

-- 1) Nákupy (zapisuje ich LEN webhook cez service role)
create table if not exists public.purchases (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete set null,
  email text not null,
  status text not null default 'paid',
  provider text not null default 'stripe',
  provider_ref text unique,
  created_at timestamptz not null default now()
);
alter table public.purchases enable row level security;
create policy "own purchases readable" on public.purchases
  for select to authenticated using (user_id = auth.uid());
-- žiadny insert/update/delete policy = klient nemôže nič zapisovať

-- 2) Verzie appky
create table if not exists public.releases (
  id uuid primary key default gen_random_uuid(),
  version text not null,
  file_path text not null,      -- cesta v buckete, napr. Sosac-3.0.1.zip
  file_name text,
  size_mb numeric,
  notes text,
  created_at timestamptz not null default now()
);
alter table public.releases enable row level security;
create policy "buyers read releases" on public.releases
  for select to authenticated
  using (exists (select 1 from public.purchases p where p.user_id = auth.uid() and p.status = 'paid'));

-- 3) Súkromný bucket so súbormi (stiahnuť môže len kupujúci)
insert into storage.buckets (id, name, public) values ('releases', 'releases', false)
on conflict (id) do nothing;
create policy "buyers download releases" on storage.objects
  for select to authenticated
  using (bucket_id = 'releases'
         and exists (select 1 from public.purchases p where p.user_id = auth.uid() and p.status = 'paid'));

-- 4) Ak niekto zaplatil skôr, než si vytvoril účet, priradí sa podľa e-mailu
create or replace function public.link_purchases() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  update public.purchases set user_id = new.id
   where user_id is null and lower(email) = lower(new.email);
  return new;
end $$;
drop trigger if exists on_signup_link_purchases on auth.users;
create trigger on_signup_link_purchases after insert on auth.users
  for each row execute function public.link_purchases();
