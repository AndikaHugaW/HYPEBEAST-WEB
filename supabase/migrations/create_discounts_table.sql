-- Create discounts table
CREATE TABLE IF NOT EXISTS discounts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  code TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('percentage', 'fixed')),
  value DECIMAL(10, 2) NOT NULL,
  min_purchase DECIMAL(10, 2),
  max_discount DECIMAL(10, 2),
  start_date TIMESTAMP WITH TIME ZONE NOT NULL,
  end_date TIMESTAMP WITH TIME ZONE NOT NULL,
  usage_limit INTEGER,
  used_count INTEGER DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'expired')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index on code for faster lookups
CREATE INDEX IF NOT EXISTS idx_discounts_code ON discounts(code);

-- Create index on status for filtering
CREATE INDEX IF NOT EXISTS idx_discounts_status ON discounts(status);

-- Create index on dates for filtering active discounts
CREATE INDEX IF NOT EXISTS idx_discounts_dates ON discounts(start_date, end_date);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_discounts_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_discounts_updated_at
  BEFORE UPDATE ON discounts
  FOR EACH ROW
  EXECUTE FUNCTION update_discounts_updated_at();

-- Enable RLS (Row Level Security)
ALTER TABLE discounts ENABLE ROW LEVEL SECURITY;

-- Create policy to allow public read access for active discounts
CREATE POLICY "Public can read active discounts" ON discounts
  FOR SELECT
  USING (status = 'active' AND start_date <= NOW() AND end_date >= NOW());

-- Create policy to allow authenticated users (admin) to read all discounts
CREATE POLICY "Admins can read all discounts" ON discounts
  FOR SELECT
  USING (auth.role() = 'authenticated');

-- Create policy to allow authenticated users (admin) to insert discounts
CREATE POLICY "Admins can insert discounts" ON discounts
  FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

-- Create policy to allow authenticated users (admin) to update discounts
CREATE POLICY "Admins can update discounts" ON discounts
  FOR UPDATE
  USING (auth.role() = 'authenticated');

-- Create policy to allow authenticated users (admin) to delete discounts
CREATE POLICY "Admins can delete discounts" ON discounts
  FOR DELETE
  USING (auth.role() = 'authenticated');

