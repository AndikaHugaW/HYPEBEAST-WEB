-- Create Demo Admin Account for HYPEBEAST
-- Run this SQL in your Supabase SQL Editor
-- 
-- ⚠️ IMPORTANT: Run supabase/fix_add_role.sql FIRST to add role column!
-- 
-- IMPORTANT: This creates a demo admin user directly in auth.users
-- You'll need to set the password manually via Supabase Dashboard or use Supabase Auth API

-- Step 1: Make sure role column exists (run fix_add_role.sql first if you get error)
-- If you get error "column role does not exist", run this first:
-- ALTER TABLE profiles ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'user';
-- ALTER TABLE profiles ADD CONSTRAINT profiles_role_check CHECK (role IN ('user', 'admin'));

-- Step 2: If user already exists in auth.users, update profile to admin
-- Replace 'demo-admin@hypebeast.com' with your desired email
UPDATE profiles 
SET 
  role = 'admin',
  full_name = 'Demo Admin',
  email = 'demo-admin@hypebeast.com'
WHERE email = 'demo-admin@hypebeast.com';

-- If profile doesn't exist, you need to:
-- 1. Create user via Supabase Dashboard > Authentication > Users > Add User
--    OR
-- 2. Sign up via /admin/sign-up page with email: demo-admin@hypebeast.com
--    Then run the UPDATE query above

-- Option 2: Create demo admin via Supabase Management API (recommended)
-- Use this in your application code or via Supabase Dashboard

-- ============================================
-- RECOMMENDED METHOD: Create via Sign-Up Page
-- ============================================
-- 1. Go to: http://localhost:3000/admin/sign-up
-- 2. Fill in:
--    - Full Name: Demo Admin
--    - Email: demo-admin@hypebeast.com
--    - Password: DemoAdmin123!
--    - Confirm Password: DemoAdmin123!
--    - Admin Code: ADMIN2024
-- 3. Click "Create Admin Account"
-- 4. Verify in database:
SELECT * FROM profiles WHERE email = 'demo-admin@hypebeast.com';

-- ============================================
-- ALTERNATIVE: Create via Supabase Dashboard
-- ============================================
-- 1. Go to Supabase Dashboard > Authentication > Users
-- 2. Click "Add User" > "Create new user"
-- 3. Fill in:
--    - Email: demo-admin@hypebeast.com
--    - Password: DemoAdmin123!
--    - Auto Confirm User: ✅ (checked)
-- 4. Click "Create User"
-- 5. Then run this SQL to set role as admin:
UPDATE profiles 
SET 
  role = 'admin',
  full_name = 'Demo Admin'
WHERE email = 'demo-admin@hypebeast.com';

-- ============================================
-- VERIFY DEMO ADMIN
-- ============================================
-- Check if demo admin exists and has correct role
SELECT 
  p.id,
  p.email,
  p.full_name,
  p.role,
  p.created_at,
  au.email_confirmed_at,
  au.last_sign_in_at
FROM profiles p
LEFT JOIN auth.users au ON p.id = au.id
WHERE p.email = 'demo-admin@hypebeast.com';

-- ============================================
-- DEMO ADMIN CREDENTIALS
-- ============================================
-- Email: demo-admin@hypebeast.com
-- Password: DemoAdmin123!
-- Admin Code: ADMIN2024
-- 
-- Login URL: http://localhost:3000/admin/sign-in

