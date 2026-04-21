-- Phase 6: admin invite-by-email flow.
-- Existing admin creates a row, Resend sends an email with a token link,
-- recipient accepts at /admin/accept-invite/[token] and becomes admin.

create table if not exists public.admin_invites (
  id uuid primary key default uuid_generate_v4(),
  email varchar(255) not null,
  token varchar(128) unique not null,
  created_by uuid references public.admin_users(id) on delete set null,
  accepted_at timestamptz,
  expires_at timestamptz not null default (now() + interval '7 days'),
  created_at timestamptz default now()
);

create index if not exists admin_invites_token_idx on public.admin_invites (token);
create index if not exists admin_invites_email_idx on public.admin_invites (email);

alter table public.admin_invites enable row level security;

-- Service role bypasses RLS; normal clients can't read or write.
-- (No policies needed — default deny.)

-- Add suspended column to profiles for admin user-management
alter table public.profiles add column if not exists suspended boolean default false;
