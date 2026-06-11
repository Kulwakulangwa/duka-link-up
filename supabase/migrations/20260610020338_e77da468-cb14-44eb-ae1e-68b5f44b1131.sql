
CREATE POLICY "Public read shop-images" ON storage.objects FOR SELECT USING (bucket_id = 'shop-images');
CREATE POLICY "Owner upload shop-images" ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'shop-images' AND (storage.foldername(name))[1] = auth.uid()::text);
CREATE POLICY "Owner update shop-images" ON storage.objects FOR UPDATE TO authenticated
  USING (bucket_id = 'shop-images' AND (storage.foldername(name))[1] = auth.uid()::text);
CREATE POLICY "Owner delete shop-images" ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'shop-images' AND (storage.foldername(name))[1] = auth.uid()::text);
