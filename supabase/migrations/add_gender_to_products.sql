-- Add gender column to products table
-- This allows products to be categorized as "men" or "woman"

-- Check if column already exists before adding
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 
    FROM information_schema.columns 
    WHERE table_name = 'products' 
    AND column_name = 'gender'
  ) THEN
    ALTER TABLE products ADD COLUMN gender TEXT;
    
    -- Add comment to column
    COMMENT ON COLUMN products.gender IS 'Gender category: men or woman';
    
    -- Create index for faster filtering by gender
    CREATE INDEX IF NOT EXISTS idx_products_gender ON products(gender);
  END IF;
END $$;

