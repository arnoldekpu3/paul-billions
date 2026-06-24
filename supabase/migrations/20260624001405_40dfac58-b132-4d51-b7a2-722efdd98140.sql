
-- Storage policies for image buckets
create policy "public read product-images" on storage.objects for select
  using (bucket_id = 'product-images');
create policy "admin write product-images" on storage.objects for insert to authenticated
  with check (bucket_id = 'product-images' and public.is_admin(auth.uid()));
create policy "admin update product-images" on storage.objects for update to authenticated
  using (bucket_id = 'product-images' and public.is_admin(auth.uid()));
create policy "admin delete product-images" on storage.objects for delete to authenticated
  using (bucket_id = 'product-images' and public.is_admin(auth.uid()));

create policy "public read banners" on storage.objects for select
  using (bucket_id = 'banners');
create policy "admin write banners" on storage.objects for insert to authenticated
  with check (bucket_id = 'banners' and public.is_admin(auth.uid()));
create policy "admin update banners" on storage.objects for update to authenticated
  using (bucket_id = 'banners' and public.is_admin(auth.uid()));
create policy "admin delete banners" on storage.objects for delete to authenticated
  using (bucket_id = 'banners' and public.is_admin(auth.uid()));

create policy "public read avatars" on storage.objects for select
  using (bucket_id = 'avatars');
create policy "owner write avatars" on storage.objects for insert to authenticated
  with check (bucket_id = 'avatars' and (auth.uid()::text = (storage.foldername(name))[1] or public.is_admin(auth.uid())));
create policy "owner update avatars" on storage.objects for update to authenticated
  using (bucket_id = 'avatars' and (auth.uid()::text = (storage.foldername(name))[1] or public.is_admin(auth.uid())));
create policy "owner delete avatars" on storage.objects for delete to authenticated
  using (bucket_id = 'avatars' and (auth.uid()::text = (storage.foldername(name))[1] or public.is_admin(auth.uid())));
