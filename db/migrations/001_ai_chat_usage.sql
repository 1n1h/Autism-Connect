-- Phase 5: AI chat rate-limit tracking.
-- One row per AI request, keyed by user. Queried as
--   count(*) where user_id = ? and created_at > now() - interval '1 hour'
-- to enforce the 50/hour per-user quota.

create table if not exists public.ai_chat_usage (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  created_at timestamptz default now()
);

create index if not exists ai_chat_usage_user_time_idx
  on public.ai_chat_usage (user_id, created_at desc);

alter table public.ai_chat_usage enable row level security;

drop policy if exists "Users see own AI usage" on public.ai_chat_usage;
create policy "Users see own AI usage"
  on public.ai_chat_usage for select
  using (auth.uid() = user_id or public.is_admin());

-- Writes are done via service role from /api/ai-chat, which bypasses RLS.

-- Optional: cron to prune old usage rows (>7d). Run manually or with pg_cron.
-- delete from public.ai_chat_usage where created_at < now() - interval '7 days';
