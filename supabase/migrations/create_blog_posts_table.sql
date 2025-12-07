-- Create blog_posts table
CREATE TABLE IF NOT EXISTS blog_posts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  headline TEXT NOT NULL,
  subheadline TEXT,
  category TEXT NOT NULL,
  author TEXT,
  date TEXT,
  image TEXT NOT NULL,
  content TEXT,
  slug TEXT UNIQUE NOT NULL,
  likes INTEGER DEFAULT 0,
  comments INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index on slug for faster lookups
CREATE INDEX IF NOT EXISTS idx_blog_posts_slug ON blog_posts(slug);

-- Create index on category for filtering
CREATE INDEX IF NOT EXISTS idx_blog_posts_category ON blog_posts(category);

-- Enable RLS (Row Level Security)
ALTER TABLE blog_posts ENABLE ROW LEVEL SECURITY;

-- Create policy to allow all reads (public access)
CREATE POLICY "Allow public read access" ON blog_posts
  FOR SELECT
  USING (true);

-- Create policy to allow authenticated users to insert (for admin)
CREATE POLICY "Allow authenticated insert" ON blog_posts
  FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

-- Create policy to allow authenticated users to update (for admin)
CREATE POLICY "Allow authenticated update" ON blog_posts
  FOR UPDATE
  USING (auth.role() = 'authenticated');

-- Create policy to allow authenticated users to delete (for admin)
CREATE POLICY "Allow authenticated delete" ON blog_posts
  FOR DELETE
  USING (auth.role() = 'authenticated');

