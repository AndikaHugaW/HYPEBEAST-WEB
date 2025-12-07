-- Add discount columns and ensure all required columns exist in orders table
DO $$ 
BEGIN
  -- Ensure customer_email exists (in case migration wasn't applied)
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'orders' AND column_name = 'customer_email'
  ) THEN
    ALTER TABLE orders ADD COLUMN customer_email TEXT;
  END IF;

  -- Ensure customer_name exists
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'orders' AND column_name = 'customer_name'
  ) THEN
    ALTER TABLE orders ADD COLUMN customer_name TEXT;
  END IF;

  -- Ensure shipping_address exists
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'orders' AND column_name = 'shipping_address'
  ) THEN
    ALTER TABLE orders ADD COLUMN shipping_address TEXT;
  END IF;

  -- Ensure billing_address exists (in case migration wasn't applied)
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'orders' AND column_name = 'billing_address'
  ) THEN
    ALTER TABLE orders ADD COLUMN billing_address TEXT;
  END IF;

  -- Ensure payment_method exists
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'orders' AND column_name = 'payment_method'
  ) THEN
    ALTER TABLE orders ADD COLUMN payment_method TEXT;
  END IF;

  -- Ensure payment_status exists
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'orders' AND column_name = 'payment_status'
  ) THEN
    ALTER TABLE orders ADD COLUMN payment_status TEXT DEFAULT 'pending';
  END IF;

  -- Add discount_amount column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'orders' AND column_name = 'discount_amount'
  ) THEN
    ALTER TABLE orders ADD COLUMN discount_amount DECIMAL(10, 2) DEFAULT 0;
  END IF;

  -- Add discount_code column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'orders' AND column_name = 'discount_code'
  ) THEN
    ALTER TABLE orders ADD COLUMN discount_code TEXT;
  END IF;

  -- Add discount_id column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'orders' AND column_name = 'discount_id'
  ) THEN
    -- Check if discounts table exists before adding foreign key
    IF EXISTS (
      SELECT 1 FROM information_schema.tables 
      WHERE table_name = 'discounts'
    ) THEN
      ALTER TABLE orders ADD COLUMN discount_id UUID REFERENCES discounts(id);
    ELSE
      ALTER TABLE orders ADD COLUMN discount_id UUID;
    END IF;
  END IF;
END $$;

