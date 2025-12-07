-- Insert default blog posts that are currently used in the aboutus page
-- This allows admin to edit existing blog cards

-- First, ensure all required columns exist
DO $$ 
BEGIN
  -- Add date column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 
    FROM information_schema.columns 
    WHERE table_name = 'blog_posts' 
    AND column_name = 'date'
  ) THEN
    ALTER TABLE blog_posts ADD COLUMN date TEXT;
  END IF;

  -- Add image_url column if it doesn't exist (check both image and image_url)
  IF NOT EXISTS (
    SELECT 1 
    FROM information_schema.columns 
    WHERE table_name = 'blog_posts' 
    AND column_name = 'image_url'
  ) THEN
    -- If image column exists, rename it to image_url
    IF EXISTS (
      SELECT 1 
      FROM information_schema.columns 
      WHERE table_name = 'blog_posts' 
      AND column_name = 'image'
    ) THEN
      ALTER TABLE blog_posts RENAME COLUMN image TO image_url;
    ELSE
      ALTER TABLE blog_posts ADD COLUMN image_url TEXT NOT NULL DEFAULT '';
    END IF;
  END IF;

  -- Add subheadline column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 
    FROM information_schema.columns 
    WHERE table_name = 'blog_posts' 
    AND column_name = 'subheadline'
  ) THEN
    ALTER TABLE blog_posts ADD COLUMN subheadline TEXT;
  END IF;

  -- Add author column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 
    FROM information_schema.columns 
    WHERE table_name = 'blog_posts' 
    AND column_name = 'author'
  ) THEN
    ALTER TABLE blog_posts ADD COLUMN author TEXT;
  END IF;

  -- Add content column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 
    FROM information_schema.columns 
    WHERE table_name = 'blog_posts' 
    AND column_name = 'content'
  ) THEN
    ALTER TABLE blog_posts ADD COLUMN content TEXT;
  END IF;

  -- Add slug column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 
    FROM information_schema.columns 
    WHERE table_name = 'blog_posts' 
    AND column_name = 'slug'
  ) THEN
    ALTER TABLE blog_posts ADD COLUMN slug TEXT UNIQUE NOT NULL;
  END IF;

  -- Add likes column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 
    FROM information_schema.columns 
    WHERE table_name = 'blog_posts' 
    AND column_name = 'likes'
  ) THEN
    ALTER TABLE blog_posts ADD COLUMN likes INTEGER DEFAULT 0;
  END IF;

  -- Add comments column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 
    FROM information_schema.columns 
    WHERE table_name = 'blog_posts' 
    AND column_name = 'comments'
  ) THEN
    ALTER TABLE blog_posts ADD COLUMN comments INTEGER DEFAULT 0;
  END IF;

  -- Add created_at column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 
    FROM information_schema.columns 
    WHERE table_name = 'blog_posts' 
    AND column_name = 'created_at'
  ) THEN
    ALTER TABLE blog_posts ADD COLUMN created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
  END IF;

  -- Add updated_at column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 
    FROM information_schema.columns 
    WHERE table_name = 'blog_posts' 
    AND column_name = 'updated_at'
  ) THEN
    ALTER TABLE blog_posts ADD COLUMN updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
  END IF;
END $$;

-- Main featured article
INSERT INTO blog_posts (id, headline, subheadline, category, author, date, image_url, content, slug, likes, comments, created_at, updated_at)
VALUES (
  '00000000-0000-0000-0000-000000000001',
  'The Future Is Now: Introducing CORTIS, K-Pop''s Next Big Disruptor',
  'BIGHIT MUSIC''s first new group in six years is all about breaking boundaries and following their artistic instincts.',
  'Music',
  'Admin',
  'Nov 12, 2025',
  '/images/hero/hero-3.png',
  'In a surprising turn of events, NewJeans has announced their return to ADOR (Attention Deficit of Rest) following a recent legal settlement. The popular K-pop girl group, known for hits like "Super Shy" and "Hype Boy," had been embroiled in a legal dispute that threatened to derail their career.',
  'cortis-kpop-next-big-disruptor',
  945,
  50,
  NOW(),
  NOW()
) ON CONFLICT (slug) DO NOTHING;

-- Featured posts
INSERT INTO blog_posts (id, headline, subheadline, category, author, date, image_url, content, slug, likes, comments, created_at, updated_at)
VALUES 
  (
    '00000000-0000-0000-0000-000000000002',
    'A$AP Rocky Officially Becomes Chanel''s Newest Ambassador',
    'The rapper and fashion icon joins the luxury brand',
    'Fashion',
    'Admin',
    'Nov 10, 2025',
    'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=400&q=80',
    'A$AP Rocky has been announced as Chanel''s newest brand ambassador, marking a significant moment in the intersection of hip-hop and luxury fashion.',
    'asap-rocky-chanel-ambassador',
    945,
    50,
    NOW(),
    NOW()
  ),
  (
    '00000000-0000-0000-0000-000000000003',
    'New Balance Expands 9060 Line with a "Silver Metallic" Reflective Pack',
    'The latest iteration of the popular sneaker line',
    'Footwear',
    'Admin',
    'Nov 8, 2025',
    'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&q=80',
    'New Balance continues to innovate with their 9060 line, introducing a new "Silver Metallic" reflective pack that combines style and functionality.',
    'new-balance-9060-silver-metallic',
    945,
    50,
    NOW(),
    NOW()
  ),
  (
    '00000000-0000-0000-0000-000000000004',
    'Goldwin Releases Oyabe FW25 Skiwear Collection',
    'Japanese brand introduces new winter collection',
    'Fashion',
    'Admin',
    'Nov 6, 2025',
    'https://images.unsplash.com/photo-1552374196-1ab2a1c593e8?w=400&q=80',
    'Goldwin has unveiled their latest Oyabe FW25 skiwear collection, featuring cutting-edge materials and designs for the upcoming winter season.',
    'goldwin-oyabe-fw25-skiwear',
    945,
    50,
    NOW(),
    NOW()
  ),
  (
    '00000000-0000-0000-0000-000000000005',
    'Eminem Performs with Jack White at Detroit Lions'' Surprise Thanksgiving Halftime Show',
    'Historic collaboration at Ford Field',
    'Music',
    'Admin',
    'Nov 4, 2025',
    'https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=400&q=80',
    'Eminem and Jack White delivered an unforgettable performance during the Detroit Lions'' Thanksgiving halftime show, creating a moment that will be remembered for years to come.',
    'eminem-jack-white-detroit-lions',
    945,
    50,
    NOW(),
    NOW()
  ),
  (
    '00000000-0000-0000-0000-000000000006',
    'Complete List of Shows Coming & Leaving on Netflix in December 2025',
    'Your guide to what''s new and what''s leaving',
    'Entertainment',
    'Admin',
    'Nov 2, 2025',
    'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=400&q=80',
    'Netflix has released its complete list of shows coming to and leaving the platform in December 2025, giving subscribers plenty to look forward to.',
    'netflix-december-2025-shows',
    945,
    50,
    NOW(),
    NOW()
  ),
  (
    '00000000-0000-0000-0000-000000000007',
    'Apple Unveils Revolutionary AI Features in Latest iOS Update',
    'New AI capabilities transform the mobile experience',
    'Tech',
    'Admin',
    'Nov 1, 2025',
    'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=400&q=80',
    'Apple has introduced groundbreaking AI features in its latest iOS update, revolutionizing how users interact with their devices.',
    'apple-ai-ios-update',
    945,
    50,
    NOW(),
    NOW()
  )
ON CONFLICT (slug) DO NOTHING;

-- Insert blog posts for Infinite Moving Cards
INSERT INTO blog_posts (id, headline, subheadline, category, author, date, image_url, content, slug, likes, comments, created_at, updated_at)
VALUES 
  (
    '00000000-0000-0000-0000-000000000008',
    'RHYTHM, BEATS, LEGACY.',
    'DISCOVERING THE NEXT BIG SOUND IN K-POP MUSIC SCENE',
    'K-Pop',
    'By Joyce Li / Nov 12, 2025',
    'Nov 12, 2025',
    'https://images.unsplash.com/photo-1516280440614-37939bbacd81?w=400&q=80',
    'Exploring the latest trends in K-Pop music and discovering the next big sound that will shape the industry.',
    'rhythm-beats-legacy',
    945,
    0,
    NOW(),
    NOW()
  ),
  (
    '00000000-0000-0000-0000-000000000009',
    'STYLE, TREND, ELEGANCE.',
    'EXPLORING THE LATEST FASHION TRENDS AND STREETWEAR CULTURE',
    'Fashion',
    'By Sarah Kim / Nov 10, 2025',
    'Nov 10, 2025',
    'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=400&q=80',
    'Dive into the world of fashion and streetwear culture, exploring the latest trends and styles.',
    'style-trend-elegance',
    1200,
    23,
    NOW(),
    NOW()
  ),
  (
    '00000000-0000-0000-0000-000000000010',
    'INNOVATE, CREATE, TRANSFORM.',
    'REVOLUTIONIZING CREATIVE INDUSTRIES WITH AI AND TECHNOLOGY',
    'Tech',
    'By Alex Chen / Nov 8, 2025',
    'Nov 8, 2025',
    'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=400&q=80',
    'How AI and technology are revolutionizing creative industries and transforming the way we work.',
    'innovate-create-transform',
    856,
    12,
    NOW(),
    NOW()
  ),
  (
    '00000000-0000-0000-0000-000000000011',
    'CULTURE, ARTS, EXPRESSION.',
    'CELEBRATING GLOBAL MUSIC FESTIVALS AND ENTERTAINMENT CULTURE',
    'Culture',
    'By Maria Garcia / Nov 5, 2025',
    'Nov 5, 2025',
    'https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=400&q=80',
    'Celebrating the vibrant world of global music festivals and entertainment culture.',
    'culture-arts-expression',
    2100,
    45,
    NOW(),
    NOW()
  ),
  (
    '00000000-0000-0000-0000-000000000012',
    'LIVE, THRIVE, INSPIRE.',
    'EMBRACING SUSTAINABLE FASHION AND CONSCIOUS LIFESTYLE CHOICES',
    'Lifestyle',
    'By Emma Wilson / Nov 3, 2025',
    'Nov 3, 2025',
    'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=400&q=80',
    'Exploring sustainable fashion and conscious lifestyle choices for a better future.',
    'live-thrive-inspire',
    1340,
    28,
    NOW(),
    NOW()
  ),
  (
    '00000000-0000-0000-0000-000000000013',
    'STRENGTH, ENDURANCE, VICTORY.',
    'EXPLORING THE WORLD OF SPORTS AND ATHLETIC EXCELLENCE',
    'Sports',
    'By Michael Johnson / Nov 1, 2025',
    'Nov 1, 2025',
    'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&q=80',
    'Discovering the world of sports and athletic excellence across different disciplines.',
    'strength-endurance-victory',
    1650,
    34,
    NOW(),
    NOW()
  ),
  (
    '00000000-0000-0000-0000-000000000014',
    'VISION, PASSION, MASTERY.',
    'DISCOVERING CONTEMPORARY ART AND CREATIVE EXPRESSIONS',
    'Art',
    'By Lisa Park / Oct 30, 2025',
    'Oct 30, 2025',
    'https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?w=400&q=80',
    'Exploring contemporary art and creative expressions from around the world.',
    'vision-passion-mastery',
    980,
    19,
    NOW(),
    NOW()
  ),
  (
    '00000000-0000-0000-0000-000000000015',
    'PLAY, COMPETE, CONQUER.',
    'LATEST GAMING TRENDS AND ESPORTS CULTURE',
    'Gaming',
    'By David Lee / Oct 28, 2025',
    'Oct 28, 2025',
    'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=400&q=80',
    'Diving into the latest gaming trends and esports culture that''s shaping the industry.',
    'play-compete-conquer',
    2200,
    67,
    NOW(),
    NOW()
  ),
  (
    '00000000-0000-0000-0000-000000000016',
    'TASTE, FLAVOR, EXPERIENCE.',
    'EXPLORING CULINARY TRENDS AND FOOD CULTURE',
    'Food',
    'By Chef Marco / Oct 26, 2025',
    'Oct 26, 2025',
    'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=400&q=80',
    'Exploring culinary trends and food culture from around the globe.',
    'taste-flavor-experience',
    1450,
    42,
    NOW(),
    NOW()
  ),
  (
    '00000000-0000-0000-0000-000000000017',
    'EXPLORE, DISCOVER, JOURNEY.',
    'UNCOVERING HIDDEN GEMS AND TRAVEL DESTINATIONS',
    'Travel',
    'By Sophie Chen / Oct 24, 2025',
    'Oct 24, 2025',
    'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=400&q=80',
    'Uncovering hidden gems and travel destinations that will inspire your next adventure.',
    'explore-discover-journey',
    1780,
    51,
    NOW(),
    NOW()
  ),
  (
    '00000000-0000-0000-0000-000000000018',
    'GLOW, SHINE, RADIANCE.',
    'LATEST BEAUTY TRENDS AND SKINCARE INNOVATIONS',
    'Beauty',
    'By Jessica Kim / Oct 22, 2025',
    'Oct 22, 2025',
    'https://images.unsplash.com/photo-1522338242992-e1a54906a8da?w=400&q=80',
    'Discovering the latest beauty trends and skincare innovations.',
    'glow-shine-radiance',
    1120,
    28,
    NOW(),
    NOW()
  ),
  (
    '00000000-0000-0000-0000-000000000019',
    'TRAIN, STRENGTHEN, ACHIEVE.',
    'FITNESS TRENDS AND WELLNESS LIFESTYLE',
    'Fitness',
    'By Coach Ryan / Oct 20, 2025',
    'Oct 20, 2025',
    'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=400&q=80',
    'Exploring fitness trends and wellness lifestyle for a healthier you.',
    'train-strengthen-achieve',
    1890,
    56,
    NOW(),
    NOW()
  ),
  (
    '00000000-0000-0000-0000-000000000020',
    'MELODY, HARMONY, RHYTHM.',
    'EXPLORING GLOBAL MUSIC SCENES AND ARTIST DISCOVERIES',
    'Music',
    'By DJ Marcus / Oct 18, 2025',
    'Oct 18, 2025',
    'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400&q=80',
    'Exploring global music scenes and discovering new artists from around the world.',
    'melody-harmony-rhythm',
    1340,
    39,
    NOW(),
    NOW()
  ),
  (
    '00000000-0000-0000-0000-000000000021',
    'STORY, VISUAL, EMOTION.',
    'LATEST FILM RELEASES AND CINEMATIC EXPERIENCES',
    'Film',
    'By Film Critic / Oct 16, 2025',
    'Oct 16, 2025',
    'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=400&q=80',
    'Reviewing the latest film releases and cinematic experiences.',
    'story-visual-emotion',
    2100,
    72,
    NOW(),
    NOW()
  ),
  (
    '00000000-0000-0000-0000-000000000022',
    'FORM, FUNCTION, BEAUTY.',
    'CONTEMPORARY DESIGN TRENDS AND ARCHITECTURAL INNOVATIONS',
    'Design',
    'By Architect Anna / Oct 14, 2025',
    'Oct 14, 2025',
    'https://images.unsplash.com/photo-1484154218962-a197022b5858?w=400&q=80',
    'Exploring contemporary design trends and architectural innovations.',
    'form-function-beauty',
    1560,
    44,
    NOW(),
    NOW()
  )
ON CONFLICT (slug) DO NOTHING;

