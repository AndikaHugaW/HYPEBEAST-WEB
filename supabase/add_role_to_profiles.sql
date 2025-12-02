-- Add role column to profiles table
-- Run this SQL in your Supabase SQL Editor

-- Add role column if it doesn't exist
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'user' CHECK (role IN ('user', 'admin'));

-- Update existing profiles to have 'user' role
UPDATE profiles SET role = 'user' WHERE role IS NULL;

-- Create index for role
CREATE INDEX IF NOT EXISTS idx_profiles_role ON profiles(role);

-- Update trigger function to set role default
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, role)
  VALUES (
    NEW.id, 
    NEW.email, 
    NEW.raw_user_meta_data->>'full_name',
    'user' -- Default role for new users
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Optional: Set yourself as admin (replace 'your-email@example.com' with your email)
-- UPDATE profiles SET role = 'admin' WHERE email = 'your-email@example.com';

