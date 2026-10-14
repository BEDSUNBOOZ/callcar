-- CARCALL — schéma initial, contraintes, index et politiques RLS
-- Principe : les visiteurs anonymes n'ont AUCUN accès direct aux tables.
-- Toute écriture publique passe par une route serveur (service_role).

create extension if not exists pgcrypto;

-- ───────────── Types ─────────────
create type plan_tier      as enum ('free', 'premium', 'enterprise');
create type sub_status     as enum ('active', 'trialing', 'past_due', 'canceled', 'test');
create type message_reason as enum ('blocking', 'lights_on', 'door_open', 'urgent', 'other');
create type org_role       as enum ('owner', 'admin', 'member');

-- ───────────── Tables ─────────────
create table public.profiles (
  id             uuid primary key references auth.users(id) on delete cascade,
  full_name      text check (char_length(full_name) <= 100),
  role           text not null default 'user'   check (role in ('user', 'admin')),
  status         text not null default 'active' check (status in ('active', 'suspended')),
  notify_email   boolean not null default true,
  retention_days integer not null default 90 check (retention_days between 7 and 365),
  created_at     timestamptz not null default now()
);

create table public.organizations (
  id         uuid primary key default gen_random_uuid(),
  name       text not null check (char_length(name) between 2 and 120),
  owner_id   uuid not null references public.profiles(id) on delete cascade,
  created_at timestamptz not null default now()
);

create table public.organization_members (
  organization_id uuid not null references public.organizations(id) on delete cascade,
  user_id         uuid not null references public.profiles(id) on delete cascade,
  role            org_role not null default 'member',
  created_at      timestamptz not null default now(),
  primary key (organization_id, user_id)
);
create index on public.organization_members (user_id);

create table public.vehicles (
  id              uuid primary key default gen_random_uuid(),
  owner_id        uuid not null references public.profiles(id) on delete cascade,
  organization_id uuid references public.organizations(id) on delete set null,
  label           text not null check (char_length(label) between 1 and 60),
  plate           text check (char_length(plate) <= 20), -- privée : jamais exposée publiquement
  active          boolean not null default true,
  created_at      timestamptz not null default now()
);
create index on public.vehicles (owner_id);
create index on public.vehicles (organization_id);

create table public.qr_tokens (
  id         uuid primary key default gen_random_uuid(),
  vehicle_id uuid not null references public.vehicles(id) on delete cascade,
  token      text not null unique check (char_length(token) >= 20), -- aléatoire 128 bits, généré côté serveur
  status     text not null default 'active' check (status in ('active', 'revoked')),
  created_at timestamptz not null default now(),
  revoked_at timestamptz
);
create index on public.qr_tokens (vehicle_id);
-- un seul jeton actif par véhicule
create unique index qr_tokens_one_active on public.qr_tokens (vehicle_id) where status = 'active';

create table public.messages (
  id           uuid primary key default gen_random_uuid(),
  vehicle_id   uuid not null references public.vehicles(id) on delete cascade,
  qr_token_id  uuid references public.qr_tokens(id) on delete set null,
  reason       message_reason not null,
  body         text not null check (char_length(body) between 1 and 500),
  thread_code  text not null unique, -- code secret remis au visiteur pour lire la réponse
  ip_hash      text,                 -- haché + salé, jamais l'IP en clair
  read_at      timestamptz,
  owner_reply  text check (char_length(owner_reply) <= 500),
  replied_at   timestamptz,
  flagged      boolean not null default false,
  created_at   timestamptz not null default now()
);
create index on public.messages (vehicle_id, created_at desc);
create index on public.messages (created_at);

create table public.subscriptions (
  id                 uuid primary key default gen_random_uuid(),
  user_id            uuid references public.profiles(id) on delete cascade,
  organization_id    uuid references public.organizations(id) on delete cascade,
  plan               plan_tier not null default 'free',
  status             sub_status not null default 'active',
  provider           text not null default 'mock', -- 'mock' = MODE TEST
  current_period_end timestamptz,
  created_at         timestamptz not null default now(),
  check ((user_id is not null) <> (organization_id is not null))
);
create unique index subs_one_per_user on public.subscriptions (user_id) where user_id is not null;
create unique index subs_one_per_org  on public.subscriptions (organization_id) where organization_id is not null;

create table public.abuse_reports (
  id          uuid primary key default gen_random_uuid(),
  message_id  uuid references public.messages(id) on delete set null,
  vehicle_id  uuid references public.vehicles(id) on delete set null,
  reporter_id uuid references public.profiles(id) on delete set null,
  reason      text not null check (char_length(reason) between 3 and 500),
  status      text not null default 'open' check (status in ('open', 'resolved')),
  created_at  timestamptz not null default now()
);
create index on public.abuse_reports (status, created_at desc);

create table public.audit_logs (
  id          bigint generated always as identity primary key,
  actor_id    uuid,
  action      text not null,
  target_type text,
  target_id   text,
  meta        jsonb not null default '{}'::jsonb,
  created_at  timestamptz not null default now()
);
create index on public.audit_logs (created_at desc);

create table public.rate_limits (
  key          text not null,
  window_start timestamptz not null,
  hits         integer not null default 0,
  primary key (key, window_start)
);

-- ───────────── Fonctions ─────────────
create or replace function public.is_admin() returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.profiles where id = auth.uid() and role = 'admin' and status = 'active');
$$;

create or replace function public.is_org_member(org uuid) returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.organization_members where organization_id = org and user_id = auth.uid());
$$;

create or replace function public.owns_vehicle(v uuid) returns boolean
language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from public.vehicles
    where id = v and (owner_id = auth.uid() or (organization_id is not null and public.is_org_member(organization_id)))
  );
$$;

-- Création automatique du profil + abonnement gratuit
create or replace function public.handle_new_user() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, full_name) values (new.id, left(new.raw_user_meta_data ->> 'full_name', 100));
  insert into public.subscriptions (user_id, plan, status, provider) values (new.id, 'free', 'active', 'none');
  return new;
end $$;
create trigger on_auth_user_created after insert on auth.users
  for each row execute function public.handle_new_user();

-- Empêche un utilisateur de se promouvoir admin ou de se réactiver
create or replace function public.protect_profile_columns() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  if auth.uid() is not null and not public.is_admin() then
    new.role := old.role;
    new.status := old.status;
  end if;
  return new;
end $$;
create trigger protect_profile before update on public.profiles
  for each row execute function public.protect_profile_columns();

-- Limitation de fréquence atomique : true = autorisé, false = bloqué
create or replace function public.rate_limit_hit(p_key text, p_max integer, p_window_seconds integer)
returns boolean language plpgsql security definer set search_path = public as $$
declare
  bucket timestamptz := to_timestamp(floor(extract(epoch from now()) / p_window_seconds) * p_window_seconds);
  current_hits integer;
begin
  insert into public.rate_limits (key, window_start, hits) values (p_key, bucket, 1)
  on conflict (key, window_start) do update set hits = public.rate_limits.hits + 1
  returning hits into current_hits;
  delete from public.rate_limits where window_start < now() - interval '2 days';
  return current_hits <= p_max;
end $$;
revoke all on function public.rate_limit_hit(text, integer, integer) from public, anon, authenticated;

-- Politique de conservation : supprime les messages au-delà de la durée choisie par chaque propriétaire
create or replace function public.purge_old_messages() returns integer
language plpgsql security definer set search_path = public as $$
declare n integer;
begin
  with doomed as (
    select m.id from public.messages m
    join public.vehicles v on v.id = m.vehicle_id
    join public.profiles p on p.id = v.owner_id
    where m.created_at < now() - make_interval(days => p.retention_days)
  )
  delete from public.messages where id in (select id from doomed);
  get diagnostics n = row_count;
  return n;
end $$;
revoke all on function public.purge_old_messages() from public, anon, authenticated;

-- ───────────── RLS ─────────────
alter table public.profiles             enable row level security;
alter table public.organizations        enable row level security;
alter table public.organization_members enable row level security;
alter table public.vehicles             enable row level security;
alter table public.qr_tokens            enable row level security;
alter table public.messages             enable row level security;
alter table public.subscriptions        enable row level security;
alter table public.abuse_reports        enable row level security;
alter table public.audit_logs           enable row level security;
alter table public.rate_limits          enable row level security;

-- profiles
create policy profiles_select on public.profiles for select to authenticated using (id = auth.uid() or public.is_admin());
create policy profiles_update on public.profiles for update to authenticated using (id = auth.uid() or public.is_admin()) with check (id = auth.uid() or public.is_admin());

-- organizations
create policy orgs_select on public.organizations for select to authenticated using (owner_id = auth.uid() or public.is_org_member(id) or public.is_admin());
create policy orgs_insert on public.organizations for insert to authenticated with check (owner_id = auth.uid());
create policy orgs_update on public.organizations for update to authenticated using (owner_id = auth.uid());
create policy members_select on public.organization_members for select to authenticated using (user_id = auth.uid() or public.is_org_member(organization_id) or public.is_admin());

-- vehicles
create policy vehicles_select on public.vehicles for select to authenticated using (owner_id = auth.uid() or (organization_id is not null and public.is_org_member(organization_id)) or public.is_admin());
create policy vehicles_insert on public.vehicles for insert to authenticated with check (owner_id = auth.uid());
create policy vehicles_update on public.vehicles for update to authenticated using (owner_id = auth.uid() or (organization_id is not null and public.is_org_member(organization_id))) with check (owner_id = auth.uid() or (organization_id is not null and public.is_org_member(organization_id)));
create policy vehicles_delete on public.vehicles for delete to authenticated using (owner_id = auth.uid());

-- qr_tokens
create policy qr_select on public.qr_tokens for select to authenticated using (public.owns_vehicle(vehicle_id));
create policy qr_insert on public.qr_tokens for insert to authenticated with check (public.owns_vehicle(vehicle_id));
create policy qr_update on public.qr_tokens for update to authenticated using (public.owns_vehicle(vehicle_id)) with check (public.owns_vehicle(vehicle_id));

-- messages : lecture + marquage lu/réponse par le propriétaire ; AUCUNE insertion cliente
create policy messages_select on public.messages for select to authenticated using (public.owns_vehicle(vehicle_id) or public.is_admin());
create policy messages_update on public.messages for update to authenticated using (public.owns_vehicle(vehicle_id)) with check (public.owns_vehicle(vehicle_id));
create policy messages_delete on public.messages for delete to authenticated using (public.owns_vehicle(vehicle_id));
revoke update on public.messages from authenticated;
grant update (read_at, owner_reply, replied_at) on public.messages to authenticated;

-- subscriptions : lecture seule côté client
create policy subs_select on public.subscriptions for select to authenticated using (user_id = auth.uid() or (organization_id is not null and public.is_org_member(organization_id)) or public.is_admin());

-- abuse_reports
create policy reports_insert on public.abuse_reports for insert to authenticated with check (reporter_id = auth.uid());
create policy reports_select on public.abuse_reports for select to authenticated using (reporter_id = auth.uid() or public.is_admin());
create policy reports_update on public.abuse_reports for update to authenticated using (public.is_admin());

-- audit_logs : lecture admin uniquement ; écriture via service_role
create policy audit_select on public.audit_logs for select to authenticated using (public.is_admin());

-- Aucun droit pour le rôle anonyme
revoke all on all tables in schema public from anon;
revoke all on all functions in schema public from anon;

grant execute on function public.rate_limit_hit(text, integer, integer) to service_role;
grant execute on function public.purge_old_messages() to service_role;
