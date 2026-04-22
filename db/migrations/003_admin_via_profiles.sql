-- Phase 8: unify admin access under profiles.is_admin.
-- The separate admin_users table + custom JWT login is deprecated.
-- Admins are now regular Supabase-auth users with profiles.is_admin = true.
--
-- Self-contained — safe to run even if migration 002 was skipped.

-- ============================================================
-- Prerequisites: admin_invites table + profiles.suspended column.
-- (Originally in db/migrations/002_admin_invites.sql; included here
--  for idempotency.)
-- ============================================================
create table if not exists public.admin_invites (
  id uuid primary key default uuid_generate_v4(),
  email varchar(255) not null,
  token varchar(128) unique not null,
  created_by uuid,
  accepted_at timestamptz,
  expires_at timestamptz not null default (now() + interval '7 days'),
  created_at timestamptz default now()
);

create index if not exists admin_invites_token_idx on public.admin_invites (token);
create index if not exists admin_invites_email_idx on public.admin_invites (email);

alter table public.admin_invites enable row level security;

alter table public.profiles add column if not exists suspended boolean default false;

-- ============================================================
-- Update handle_new_user trigger to consume a pending admin_invite
-- on signup. If the new user's email has a valid pending invite,
-- their profile is created with is_admin=true and the invite is
-- marked accepted.
-- ============================================================
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  has_invite boolean;
begin
  select exists(
    select 1 from public.admin_invites
    where email = new.email
      and accepted_at is null
      and expires_at > now()
  ) into has_invite;

  insert into public.profiles (id, email, is_admin)
  values (new.id, new.email, has_invite)
  on conflict (id) do update
    set is_admin = public.profiles.is_admin or has_invite;

  if has_invite then
    update public.admin_invites
    set accepted_at = now()
    where email = new.email
      and accepted_at is null;
  end if;

  return new;
end;
$$;

-- ============================================================
-- Bootstrap: make your existing regular Supabase user an admin.
-- Replace the email below with yours, then run just this line.
-- ============================================================
-- update public.profiles set is_admin = true where email = 'bmgaccident@gmail.com';

-- ============================================================
-- admin_invites.created_by used to reference admin_users(id). It now
-- references the inviting Supabase user (profiles.id).
-- ============================================================
alter table public.admin_invites drop constraint if exists admin_invites_created_by_fkey;
alter table public.admin_invites
  add constraint admin_invites_created_by_fkey
  foreign key (created_by) references public.profiles(id) on delete set null;

-- ============================================================
-- admin_users table is no longer used by the app.
-- Safe to drop once you've confirmed the new flow works:
--   drop table if exists public.admin_users cascade;
-- (Leaving it in place for now so the migration is reversible.)
-- ============================================================
