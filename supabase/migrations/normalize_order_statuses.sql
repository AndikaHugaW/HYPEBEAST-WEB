-- Normalize all order statuses to lowercase
-- This ensures consistency across the application

DO $$
BEGIN
  -- Update all orders to have lowercase status
  UPDATE orders
  SET status = LOWER(TRIM(status))
  WHERE status != LOWER(TRIM(status));
  
  -- Log the update
  RAISE NOTICE 'Normalized order statuses to lowercase';
END $$;

