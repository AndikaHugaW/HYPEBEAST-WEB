-- Add product_name, product_image, and size columns to order_items table if they don't exist
DO $$ 
BEGIN
  -- Add product_name column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'order_items' AND column_name = 'product_name'
  ) THEN
    -- First add as nullable, then update existing rows, then make NOT NULL
    ALTER TABLE order_items ADD COLUMN product_name TEXT;
    
    -- Update existing rows with a default value
    UPDATE order_items 
    SET product_name = 'Product'
    WHERE product_name IS NULL;
    
    -- Now make it NOT NULL
    ALTER TABLE order_items ALTER COLUMN product_name SET NOT NULL;
  END IF;

  -- Add product_image column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'order_items' AND column_name = 'product_image'
  ) THEN
    -- First add as nullable, then update existing rows, then make NOT NULL
    ALTER TABLE order_items ADD COLUMN product_image TEXT;
    
    -- Update existing rows with a default value
    UPDATE order_items 
    SET product_image = ''
    WHERE product_image IS NULL;
    
    -- Now make it NOT NULL
    ALTER TABLE order_items ALTER COLUMN product_image SET NOT NULL;
  END IF;

  -- Add size column if it doesn't exist (nullable is fine)
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'order_items' AND column_name = 'size'
  ) THEN
    ALTER TABLE order_items ADD COLUMN size TEXT;
  END IF;
END $$;

