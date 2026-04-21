-- AutismConnect — full schema + RLS policies
-- Run this in the Supabase SQL editor (one-shot, idempotent).
-- Phase 2 covers: users, waitlist. Resources/blog/messaging come online in later phases;
-- defining them all now keeps one source of truth.

-- ============================================================
-- Extensions
-- ============================================================
create extension if not exists "uuid-ossp";

-- ============================================================
-- profiles (application-level user table; links to auth.users)
-- Supabase Auth owns auth.users; we keep public.profiles for app data.
-- ============================================================
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email varchar(255) unique not null,
  first_name varchar(255),
  last_name varchar(255),
  bio text,
  location varchar(255),
  state varchar(2),
  profile_photo_url varchar(500),
  child_age integer,
  child_autism_level varchar(50),
  is_admin boolean default false,
  onboarded boolean default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Auto-insert a profile row whenever a new auth user is created.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email)
  values (new.id, new.email)
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Keep updated_at fresh
create or replace function public.touch_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists profiles_touch on public.profiles;
create trigger profiles_touch
  before update on public.profiles
  for each row execute function public.touch_updated_at();

-- ============================================================
-- waitlist
-- ============================================================
create table if not exists public.waitlist (
  id uuid primary key default uuid_generate_v4(),
  email varchar(255) unique not null,
  state_interested varchar(50) default 'GA',
  email_sent boolean default false,
  converted boolean default false,
  converted_user_id uuid references public.profiles(id) on delete set null,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

drop trigger if exists waitlist_touch on public.waitlist;
create trigger waitlist_touch
  before update on public.waitlist
  for each row execute function public.touch_updated_at();

-- ============================================================
-- resources (Phase 3)
-- ============================================================
create table if not exists public.resources (
  id uuid primary key default uuid_generate_v4(),
  name varchar(255) not null,
  description text,
  resource_type varchar(100),
  address varchar(500),
  city varchar(100),
  state varchar(2),
  zip_code varchar(10),
  phone varchar(20),
  website varchar(500),
  email varchar(255),
  accepts_insurance boolean,
  specializations text[],
  latitude float,
  longitude float,
  created_at timestamptz default now()
);

create index if not exists resources_state_idx on public.resources (state);
create index if not exists resources_type_idx on public.resources (resource_type);
create index if not exists resources_city_idx on public.resources (city);

-- ============================================================
-- blog_posts (Phase 4)
-- ============================================================
create table if not exists public.blog_posts (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  title varchar(500) not null,
  content text not null,
  excerpt varchar(500),
  featured_image_url varchar(500),
  category varchar(100),
  views integer default 0,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

drop trigger if exists blog_posts_touch on public.blog_posts;
create trigger blog_posts_touch
  before update on public.blog_posts
  for each row execute function public.touch_updated_at();

create index if not exists blog_posts_user_idx on public.blog_posts (user_id);
create index if not exists blog_posts_created_idx on public.blog_posts (created_at desc);

-- ============================================================
-- blog_comments (Phase 4)
-- ============================================================
create table if not exists public.blog_comments (
  id uuid primary key default uuid_generate_v4(),
  blog_post_id uuid not null references public.blog_posts(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  content text not null,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

drop trigger if exists blog_comments_touch on public.blog_comments;
create trigger blog_comments_touch
  before update on public.blog_comments
  for each row execute function public.touch_updated_at();

-- ============================================================
-- messages (Phase 4) — direct 1:1 between users
-- ============================================================
create table if not exists public.messages (
  id uuid primary key default uuid_generate_v4(),
  sender_id uuid not null references public.profiles(id) on delete cascade,
  recipient_id uuid not null references public.profiles(id) on delete cascade,
  content text not null,
  read_at timestamptz,
  created_at timestamptz default now()
);

create index if not exists messages_sender_idx on public.messages (sender_id);
create index if not exists messages_recipient_idx on public.messages (recipient_id);
create index if not exists messages_thread_idx on public.messages (
  least(sender_id, recipient_id), greatest(sender_id, recipient_id), created_at desc
);

-- ============================================================
-- subscriptions (Phase 7)
-- ============================================================
create table if not exists public.subscriptions (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  plan_type varchar(50) not null,
  stripe_subscription_id varchar(255),
  status varchar(50) default 'active',
  current_period_start timestamptz,
  current_period_end timestamptz,
  canceled_at timestamptz,
  cancellation_reason text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

drop trigger if exists subscriptions_touch on public.subscriptions;
create trigger subscriptions_touch
  before update on public.subscriptions
  for each row execute function public.touch_updated_at();

-- ============================================================
-- admin_users (Phase 6)
-- Separate auth from Supabase Auth; matched by email.
-- ============================================================
create table if not exists public.admin_users (
  id uuid primary key default uuid_generate_v4(),
  email varchar(255) unique not null,
  password_hash varchar(255),
  name varchar(255),
  role varchar(50) default 'admin',
  last_login timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- ============================================================
-- AI chat cache (Phase 5) — 24h response caching per spec
-- ============================================================
create table if not exists public.ai_chat_cache (
  id uuid primary key default uuid_generate_v4(),
  question_hash varchar(64) unique not null,
  question text not null,
  response text not null,
  created_at timestamptz default now(),
  expires_at timestamptz not null
);

create index if not exists ai_cache_expires_idx on public.ai_chat_cache (expires_at);

-- ============================================================
-- Row-Level Security
-- ============================================================
alter table public.profiles       enable row level security;
alter table public.waitlist       enable row level security;
alter table public.resources      enable row level security;
alter table public.blog_posts     enable row level security;
alter table public.blog_comments  enable row level security;
alter table public.messages       enable row level security;
alter table public.subscriptions  enable row level security;
alter table public.admin_users    enable row level security;

-- Helper: is the current session an admin?
create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.admin_users
    where email = (select email from public.profiles where id = auth.uid())
  )
  or exists (
    select 1 from public.profiles
    where id = auth.uid() and is_admin = true
  );
$$;

-- ---------- profiles ----------
drop policy if exists "Profiles are viewable by everyone" on public.profiles;
create policy "Profiles are viewable by everyone"
  on public.profiles for select
  using (true);

drop policy if exists "Users can insert own profile" on public.profiles;
create policy "Users can insert own profile"
  on public.profiles for insert
  with check (auth.uid() = id);

drop policy if exists "Users can update own profile" on public.profiles;
create policy "Users can update own profile"
  on public.profiles for update
  using (auth.uid() = id);

drop policy if exists "Admins can update any profile" on public.profiles;
create policy "Admins can update any profile"
  on public.profiles for update
  using (public.is_admin());

-- ---------- waitlist ----------
-- Public can insert (landing page form). Only admins can read.
drop policy if exists "Anyone can join waitlist" on public.waitlist;
create policy "Anyone can join waitlist"
  on public.waitlist for insert
  with check (true);

drop policy if exists "Admins can read waitlist" on public.waitlist;
create policy "Admins can read waitlist"
  on public.waitlist for select
  using (public.is_admin());

drop policy if exists "Admins can update waitlist" on public.waitlist;
create policy "Admins can update waitlist"
  on public.waitlist for update
  using (public.is_admin());

drop policy if exists "Admins can delete waitlist" on public.waitlist;
create policy "Admins can delete waitlist"
  on public.waitlist for delete
  using (public.is_admin());

-- ---------- resources ----------
drop policy if exists "Resources are viewable by everyone" on public.resources;
create policy "Resources are viewable by everyone"
  on public.resources for select
  using (true);

drop policy if exists "Admins manage resources" on public.resources;
create policy "Admins manage resources"
  on public.resources for all
  using (public.is_admin())
  with check (public.is_admin());

-- ---------- blog_posts ----------
drop policy if exists "Blog posts are viewable by everyone" on public.blog_posts;
create policy "Blog posts are viewable by everyone"
  on public.blog_posts for select
  using (true);

drop policy if exists "Users create own posts" on public.blog_posts;
create policy "Users create own posts"
  on public.blog_posts for insert
  with check (auth.uid() = user_id);

drop policy if exists "Users update own posts" on public.blog_posts;
create policy "Users update own posts"
  on public.blog_posts for update
  using (auth.uid() = user_id);

drop policy if exists "Users delete own posts" on public.blog_posts;
create policy "Users delete own posts"
  on public.blog_posts for delete
  using (auth.uid() = user_id or public.is_admin());

-- ---------- blog_comments ----------
drop policy if exists "Comments viewable by everyone" on public.blog_comments;
create policy "Comments viewable by everyone"
  on public.blog_comments for select
  using (true);

drop policy if exists "Users create own comments" on public.blog_comments;
create policy "Users create own comments"
  on public.blog_comments for insert
  with check (auth.uid() = user_id);

drop policy if exists "Users update own comments" on public.blog_comments;
create policy "Users update own comments"
  on public.blog_comments for update
  using (auth.uid() = user_id);

drop policy if exists "Users delete own comments" on public.blog_comments;
create policy "Users delete own comments"
  on public.blog_comments for delete
  using (auth.uid() = user_id or public.is_admin());

-- ---------- messages ----------
drop policy if exists "Users see their messages" on public.messages;
create policy "Users see their messages"
  on public.messages for select
  using (auth.uid() = sender_id or auth.uid() = recipient_id);

drop policy if exists "Users send messages" on public.messages;
create policy "Users send messages"
  on public.messages for insert
  with check (auth.uid() = sender_id);

drop policy if exists "Recipients mark read" on public.messages;
create policy "Recipients mark read"
  on public.messages for update
  using (auth.uid() = recipient_id);

-- ---------- subscriptions ----------
drop policy if exists "Users see own subscription" on public.subscriptions;
create policy "Users see own subscription"
  on public.subscriptions for select
  using (auth.uid() = user_id or public.is_admin());

drop policy if exists "Admins manage subscriptions" on public.subscriptions;
create policy "Admins manage subscriptions"
  on public.subscriptions for all
  using (public.is_admin())
  with check (public.is_admin());

-- ---------- admin_users ----------
drop policy if exists "Admins read admin list" on public.admin_users;
create policy "Admins read admin list"
  on public.admin_users for select
  using (public.is_admin());

-- ============================================================
-- Storage buckets + policies
-- Run db/storage_setup.sql after this file. It creates the
-- `avatars` and `blog-images` public buckets and RLS policies
-- restricting writes so users can only write under their own
-- user_id folder.
-- ============================================================
