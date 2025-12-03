-- Add color and size columns to cart_items if they don't exist
-- This migration is safe to run even if columns already exist

-- Add color column if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'cart_items' AND column_name = 'color'
  ) THEN
    ALTER TABLE cart_items ADD COLUMN color VARCHAR(50);
  END IF;
END $$;

-- Add size column if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'cart_items' AND column_name = 'size'
  ) THEN
    ALTER TABLE cart_items ADD COLUMN size VARCHAR(50);
  END IF;
END $$;

-- Update unique constraint to include size and color if it doesn't exist
-- First, drop existing unique constraint if it exists
DO $$ 
BEGIN
  -- Check if there's a unique constraint without size/color
  IF EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'cart_items_user_id_product_id_key'
  ) THEN
    ALTER TABLE cart_items DROP CONSTRAINT cart_items_user_id_product_id_key;
  END IF;
END $$;

-- Add new unique constraint with size and color
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'cart_items_user_id_product_id_size_color_key'
  ) THEN
    ALTER TABLE cart_items 
    ADD CONSTRAINT cart_items_user_id_product_id_size_color_key 
    UNIQUE(user_id, product_id, size, color);
  END IF;
END $$;

