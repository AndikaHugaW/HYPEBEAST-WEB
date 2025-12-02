-- RLS Policies for Products Table
-- Run this SQL in your Supabase SQL Editor to fix "row-level security policy" error

-- Enable RLS on products table (if not already enabled)
ALTER TABLE products ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist (optional, for clean setup)
DROP POLICY IF EXISTS "Products are viewable by everyone" ON products;
DROP POLICY IF EXISTS "Products can be updated by authenticated users" ON products;
DROP POLICY IF EXISTS "Products can be inserted by authenticated users" ON products;
DROP POLICY IF EXISTS "Products can be deleted by authenticated users" ON products;

-- Public read access (everyone can view products)
CREATE POLICY "Products are viewable by everyone" ON products
  FOR SELECT USING (TRUE);

-- Authenticated users can update products
-- For admin panel, you might want to restrict this to admin users only
-- For now, allowing all authenticated users to update
CREATE POLICY "Products can be updated by authenticated users" ON products
  FOR UPDATE USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

-- Authenticated users can insert products
CREATE POLICY "Products can be inserted by authenticated users" ON products
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Authenticated users can delete products
CREATE POLICY "Products can be deleted by authenticated users" ON products
  FOR DELETE USING (auth.role() = 'authenticated');

-- Alternative: If you want to allow updates without authentication (for development)
-- Uncomment the following and comment out the authenticated policies above:

-- CREATE POLICY "Products can be updated by anyone" ON products
--   FOR UPDATE USING (TRUE)
--   WITH CHECK (TRUE);

-- CREATE POLICY "Products can be inserted by anyone" ON products
--   FOR INSERT WITH CHECK (TRUE);

-- CREATE POLICY "Products can be deleted by anyone" ON products
--   FOR DELETE USING (TRUE);

