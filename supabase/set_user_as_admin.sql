-- Set User as Admin
-- Run this SQL in your Supabase SQL Editor
-- Replace 'your-email@example.com' with the actual email

-- Method 1: If user already exists, just update role
UPDATE profiles 
SET 
  role = 'admin',
  full_name = COALESCE(full_name, 'Admin User')
WHERE email = 'minji@hypebeast.com';

-- Method 2: If profile doesn't exist, create it
-- First, get the user ID from auth.users
INSERT INTO profiles (id, email, full_name, role)
SELECT 
  id,
  email,
  'Admin User',
  'admin'
FROM auth.users
WHERE email = 'minji@hypebeast.com'
ON CONFLICT (id) DO UPDATE
SET 
  role = 'admin',
  full_name = COALESCE(profiles.full_name, 'Admin User'),
  email = EXCLUDED.email;

-- Verify the update
SELECT 
  p.id,
  p.email,
  p.full_name,
  p.role,
  p.created_at,
  au.email_confirmed_at
FROM profiles p
LEFT JOIN auth.users au ON p.id = au.id
WHERE p.email = 'minji@hypebeast.com';

-- Expected result:
-- role should be 'admin'
-- email_confirmed_at should NOT be NULL (if auto-confirmed)

