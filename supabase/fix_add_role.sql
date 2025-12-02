-- Fix: Add role column to profiles table
-- Run this SQL FIRST before creating demo admin
-- Run in Supabase SQL Editor

-- Step 1: Add role column if it doesn't exist
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'user';

-- Step 2: Add constraint to ensure role is either 'user' or 'admin'
ALTER TABLE profiles 
DROP CONSTRAINT IF EXISTS profiles_role_check;

ALTER TABLE profiles 
ADD CONSTRAINT profiles_role_check CHECK (role IN ('user', 'admin'));

-- Step 3: Update existing profiles to have 'user' role (if role is NULL)
UPDATE profiles 
SET role = 'user' 
WHERE role IS NULL;

-- Step 4: Create index for role (for better query performance)
CREATE INDEX IF NOT EXISTS idx_profiles_role ON profiles(role);

-- Step 5: Verify the column was added
SELECT column_name, data_type, column_default 
FROM information_schema.columns 
WHERE table_name = 'profiles' AND column_name = 'role';

-- Expected result should show:
-- column_name: role
-- data_type: text
-- column_default: 'user'

