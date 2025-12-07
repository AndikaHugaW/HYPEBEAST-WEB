-- Ensure all order statuses are lowercase
-- This migration normalizes existing data and adds a trigger to enforce lowercase

-- First, normalize all existing statuses to lowercase
UPDATE orders
SET status = LOWER(TRIM(status))
WHERE status != LOWER(TRIM(status));

-- Create or replace function to ensure status is always lowercase
CREATE OR REPLACE FUNCTION ensure_lowercase_status()
RETURNS TRIGGER AS $$
BEGIN
  -- Normalize status to lowercase before insert/update
  NEW.status = LOWER(TRIM(NEW.status));
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop trigger if exists
DROP TRIGGER IF EXISTS trigger_ensure_lowercase_status ON orders;

-- Create trigger to enforce lowercase status
CREATE TRIGGER trigger_ensure_lowercase_status
  BEFORE INSERT OR UPDATE ON orders
  FOR EACH ROW
  EXECUTE FUNCTION ensure_lowercase_status();

