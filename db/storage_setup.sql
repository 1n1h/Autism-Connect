-- Storage buckets + RLS policies for AutismConnect
-- Run once in Supabase SQL editor. Idempotent.

-- ============================================================
-- Buckets
-- ============================================================
insert into storage.buckets (id, name, public)
values
  ('avatars', 'avatars', true),
  ('blog-images', 'blog-images', true)
on conflict (id) do nothing;

-- ============================================================
-- Policies
-- Path convention enforced by the app:
--   avatars/<user_id>/<timestamp>.<ext>
--   blog-images/<user_id>/<post_id>/<filename>
-- RLS restricts writes so users can only write under their own user_id folder.
-- Reads are public (buckets are public).
-- ============================================================

-- ---- avatars ----
drop policy if exists "Avatars are publicly readable" on storage.objects;
create policy "Avatars are publicly readable"
  on storage.objects for select
  using (bucket_id = 'avatars');

drop policy if exists "Users upload own avatar" on storage.objects;
create policy "Users upload own avatar"
  on storage.objects for insert
  with check (
    bucket_id = 'avatars'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

drop policy if exists "Users update own avatar" on storage.objects;
create policy "Users update own avatar"
  on storage.objects for update
  using (
    bucket_id = 'avatars'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

drop policy if exists "Users delete own avatar" on storage.objects;
create policy "Users delete own avatar"
  on storage.objects for delete
  using (
    bucket_id = 'avatars'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

-- ---- blog-images ----
drop policy if exists "Blog images are publicly readable" on storage.objects;
create policy "Blog images are publicly readable"
  on storage.objects for select
  using (bucket_id = 'blog-images');

drop policy if exists "Users upload own blog images" on storage.objects;
create policy "Users upload own blog images"
  on storage.objects for insert
  with check (
    bucket_id = 'blog-images'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

drop policy if exists "Users update own blog images" on storage.objects;
create policy "Users update own blog images"
  on storage.objects for update
  using (
    bucket_id = 'blog-images'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

drop policy if exists "Users delete own blog images" on storage.objects;
create policy "Users delete own blog images"
  on storage.objects for delete
  using (
    bucket_id = 'blog-images'
    and auth.uid()::text = (storage.foldername(name))[1]
  );
