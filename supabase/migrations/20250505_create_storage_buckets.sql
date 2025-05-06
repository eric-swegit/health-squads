

-- Create a storage bucket for profile images
INSERT INTO storage.buckets (id, name, public)
VALUES ('profile-images', 'Profile Images', true);

-- Create a policy to allow public read access
CREATE POLICY "Public Access"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'profile-images');

-- Create a policy that allows users to insert their own profile images
CREATE POLICY "User Upload Policy"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'profile-images' AND
    auth.uid() = owner
  );

-- Create a policy that allows users to update their own profile images
CREATE POLICY "User Update Policy"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'profile-images' AND
    auth.uid() = owner
  );

-- Create a policy that allows users to delete their own profile images
CREATE POLICY "User Delete Policy"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'profile-images' AND
    auth.uid() = owner
  );

