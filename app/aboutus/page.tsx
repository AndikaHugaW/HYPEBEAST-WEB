import Image from "next/image";
import Link from "next/link";
import Footer from "@/components/Footer";
import { InfiniteMovingCards } from "@/components/InfiniteMovingCards";
import { createServerClient } from "@/lib/supabase";

// Disable caching for this page to ensure fresh data
export const revalidate = 0;
export const dynamic = 'force-dynamic';

export default async function AboutUs() {
  // Fetch blog posts from database
  let mainArticle: any = {
    id: 1,
    category: "Music",
    headline: "The Future Is Now: Introducing CORTIS, K-Pop's Next Big Disruptor",
    description: "BIGHIT MUSIC's first new group in six years is all about breaking boundaries and following their artistic instincts.",
    likes: 945,
    comments: 50,
    image: "/images/hero/hero-3.png",
    slug: "cortis-kpop-next-big-disruptor"
  };

  let featuredPosts: any[] = [
    {
      id: 2,
      category: "Fashion",
      headline: "A$AP Rocky Officially Becomes Chanel's Newest Ambassador",
      likes: 945,
      comments: 50,
      image: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=400&q=80",
      slug: "asap-rocky-chanel-ambassador"
    },
    {
      id: 3,
      category: "Footwear",
      headline: "New Balance Expands 9060 Line with a \"Silver Metallic\" Reflective Pack",
      likes: 945,
      comments: 50,
      image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&q=80",
      slug: "new-balance-9060-silver-metallic"
    },
    {
      id: 4,
      category: "Fashion",
      headline: "Goldwin Releases Oyabe FW25 Skiwear Collection",
      likes: 945,
      comments: 50,
      image: "https://images.unsplash.com/photo-1552374196-1ab2a1c593e8?w=400&q=80",
      slug: "goldwin-oyabe-fw25-skiwear"
    },
    {
      id: 5,
      category: "Music",
      headline: "Eminem Performs with Jack White at Detroit Lions' Surprise Thanksgiving Halftime Show",
      likes: 945,
      comments: 50,
      image: "https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=400&q=80",
      slug: "eminem-jack-white-detroit-lions"
    },
    {
      id: 6,
      category: "Entertainment",
      headline: "Complete List of Shows Coming & Leaving on Netflix in December 2025",
      likes: 945,
      comments: 50,
      image: "https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=400&q=80",
      slug: "netflix-december-2025-shows"
    },
    {
      id: 7,
      category: "Tech",
      headline: "Apple Unveils Revolutionary AI Features in Latest iOS Update",
      likes: 945,
      comments: 50,
      image: "https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=400&q=80",
      slug: "apple-ai-ios-update"
    },
  ];

  // Category cards data for InfiniteMovingCards
  const fallbackInfiniteCards = [
    {
      id: 1,
      category: "Apparel",
      subCategory: "Fashion.",
      headline: "APPAREL",
      description: "DISCOVER THE LATEST TRENDS IN FASHION AND STYLE",
      author: "",
      date: "",
      likes: 0,
      comments: 0,
      image: "/images/fashion/apparel.png",
      slug: "/products?category=apparel"
    },
    {
      id: 2,
      category: "Footwear",
      subCategory: "Shoes.",
      headline: "FOOTWEAR",
      description: "STEP INTO STYLE WITH PREMIUM FOOTWEAR COLLECTIONS",
      author: "",
      date: "",
      likes: 0,
      comments: 0,
      image: "/images/fashion/footwear.png",
      slug: "/products?category=footwear"
    },
    {
      id: 3,
      category: "Accessories",
      subCategory: "Essentials.",
      headline: "ACCESSORIES",
      description: "COMPLETE YOUR LOOK WITH CURATED ACCESSORIES",
      author: "",
      date: "",
      likes: 0,
      comments: 0,
      image: "/images/fashion/accessories.png",
      slug: "/products?category=accessories"
    },
    {
      id: 4,
      category: "Lifestyle",
      subCategory: "Collectibles.",
      headline: "LIFESTYLE & COLLECTIBLES",
      description: "DISCOVER UNIQUE LIFESTYLE PRODUCTS AND COLLECTIBLES",
      author: "",
      date: "",
      likes: 0,
      comments: 0,
      image: "/images/fashion/lifestyle.png",
      slug: "/products?category=lifestyle"
    },
    {
      id: 5,
      category: "New Arrival",
      subCategory: "Latest.",
      headline: "NEW ARRIVAL",
      description: "EXPLORE THE LATEST ADDITIONS TO OUR COLLECTION",
      author: "",
      date: "",
      likes: 0,
      comments: 0,
      image: "/images/fashion/apparel.png",
      slug: "/products?category=new-arrival"
    },
  ];

  let infiniteCards = fallbackInfiniteCards;
  
  // Fallback data for Article Detail Section
  const fallbackArticleDetails = [
    {
      id: 1,
      slug: "newjeans-returns-to-ador",
      category: "Music.",
      headline: "NewJeans Returns to ADOR After Legal Loss",
      subheadline: "The \"Super Shy\" K-pop girl group is coming back",
      author: "By Joyce Li / Nov 12, 2025",
      likes: 945,
      comments: 0,
      image: "https://images.unsplash.com/photo-1516280440614-37939bbacd81?w=1200&q=80",
      alt: "NewJeans K-pop Group"
    },
    {
      id: 2,
      slug: "streetwear-trends-dominate-2025",
      category: "Fashion.",
      headline: "Streetwear Trends Dominate 2025 Fashion Week",
      subheadline: "Urban fashion takes center stage in major runways",
      author: "By Sarah Kim / Nov 10, 2025",
      likes: 1200,
      comments: 23,
      image: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1200&q=80",
      alt: "Fashion Week"
    },
    {
      id: 3,
      slug: "ai-revolutionizes-creative-industries",
      category: "Tech.",
      headline: "AI Revolutionizes Creative Industries",
      subheadline: "New tools transform how artists and designers work",
      author: "By Alex Chen / Nov 8, 2025",
      likes: 856,
      comments: 12,
      image: "https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=1200&q=80",
      alt: "AI Technology"
    },
    {
      id: 4,
      slug: "global-music-festivals-return",
      category: "Culture.",
      headline: "Global Music Festivals Return Stronger Than Ever",
      subheadline: "Post-pandemic music scene shows unprecedented growth",
      author: "By Maria Garcia / Nov 5, 2025",
      likes: 2100,
      comments: 45,
      image: "https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=1200&q=80",
      alt: "Music Festival"
    }
  ];

  let articleDetails = fallbackArticleDetails;

  // Try to fetch from database
  try {
    const supabase = createServerClient();
    
    // Fetch main article (by slug or first featured post)
    // Use cache: 'no-store' equivalent by adding timestamp to force fresh data
    const { data: mainPost } = await supabase
      .from('blog_posts')
      .select('*')
      .eq('slug', 'cortis-kpop-next-big-disruptor')
      .single();

    if (mainPost) {
      // Add cache buster to image URL
      const imageUrl = mainPost.image_url || mainPost.image || mainArticle.image;
      const imageWithCacheBuster = imageUrl ? `${imageUrl}${imageUrl.includes('?') ? '&' : '?'}t=${new Date(mainPost.updated_at || mainPost.created_at).getTime()}` : mainArticle.image;
      
      mainArticle = {
        id: mainPost.id,
        category: mainPost.category,
        headline: mainPost.headline,
        description: mainPost.subheadline || mainPost.content || mainArticle.description,
        likes: mainPost.likes || 0,
        comments: mainPost.comments || 0,
        image: imageWithCacheBuster,
        slug: mainPost.slug
      };
    }

    // Fetch featured posts (first 6 posts excluding main article)
    // Order by updated_at to get most recently updated posts first
    const { data: posts } = await supabase
      .from('blog_posts')
      .select('*')
      .neq('slug', 'cortis-kpop-next-big-disruptor')
      .limit(6)
      .order('updated_at', { ascending: false })
      .order('created_at', { ascending: false });

    if (posts && posts.length > 0) {
      featuredPosts = posts.map((post: any) => {
        // Add cache buster to image URL
        const imageUrl = post.image_url || post.image || '';
        const imageWithCacheBuster = imageUrl ? `${imageUrl}${imageUrl.includes('?') ? '&' : '?'}t=${new Date(post.updated_at || post.created_at).getTime()}` : '';
        
        return {
          id: post.id,
          category: post.category,
          headline: post.headline,
          likes: post.likes || 0,
          comments: post.comments || 0,
          image: imageWithCacheBuster,
          slug: post.slug
        };
      });
    }

    // Fetch blog posts for Article Detail Section (exclude main article and featured posts)
    const { data: detailPosts } = await supabase
      .from('blog_posts')
      .select('*')
      .neq('slug', 'cortis-kpop-next-big-disruptor')
      .order('updated_at', { ascending: false })
      .order('created_at', { ascending: false })
      .limit(10); // Get more posts, then we'll exclude featured ones

    if (detailPosts && detailPosts.length > 0) {
      // Exclude featured posts slugs
      const featuredSlugs = featuredPosts.map((p: any) => p.slug);
      
      articleDetails = detailPosts
        .filter((post: any) => !featuredSlugs.includes(post.slug))
        .slice(0, 4) // Take first 4 posts for article detail section
        .map((post: any) => {
          // Add cache buster to image URL
          const imageUrl = post.image_url || post.image || '';
          const imageWithCacheBuster = imageUrl ? `${imageUrl}${imageUrl.includes('?') ? '&' : '?'}t=${new Date(post.updated_at || post.created_at).getTime()}` : '';
          
          return {
            id: post.id,
            slug: post.slug,
            category: post.category + ".",
            headline: post.headline,
            subheadline: post.subheadline || post.content || '',
            author: post.author ? `By ${post.author} / ${post.date || new Date(post.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}` : `By Admin / ${post.date || new Date(post.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}`,
            likes: post.likes || 0,
            comments: post.comments || 0,
            image: imageWithCacheBuster,
            alt: post.headline
          };
        });
    }

    // Use category cards instead of blog posts for InfiniteMovingCards
    // Categories are defined in fallbackInfiniteCards
  } catch (error) {
    console.error("Error fetching blog posts:", error);
    // Use fallback data if database fetch fails
  }

  return (
    <main className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="w-full px-6 sm:px-8 lg:px-12 xl:px-16 2xl:px-24 py-8 md:py-12">
        <div className="grid lg:grid-cols-3 gap-[31px] items-stretch">
          {/* Main Featured Article - Left Side (2/3 width) */}
          <div className="lg:col-span-2">
            <Link href={`/blog/${mainArticle.slug}`} className="block group">
              {/* Main Image with Content Overlay */}
              <div className="relative w-full aspect-[4/3] rounded-lg overflow-hidden bg-black">
                <Image
                  src={mainArticle.image}
                  alt={mainArticle.headline}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-300"
                  unoptimized
                />
                {/* Dark Overlay for better text readability */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/60 to-black/30"></div>
                
                {/* Content Overlay - Bottom */}
                <div className="absolute bottom-0 left-0 right-0 p-6 md:p-8 z-10">
                  {/* Category Badge - Bottom Left */}
                  <div className="mb-4">
                    <span className="inline-block bg-red-500/20 text-red-500 px-3 py-1.5 rounded-full text-xs font-bold border border-red-500/30">
                      {mainArticle.category}
                    </span>
                  </div>

                  {/* Headline - White text */}
                  <h1 className="text-3xl md:text-4xl lg:text-5xl font-normal text-white mb-4 leading-tight">
                    {mainArticle.headline}
                  </h1>

                  {/* Description - White text */}
                  <p className="text-lg md:text-xl font-light text-white mb-4 leading-relaxed">
                    {mainArticle.description}
                  </p>

                  {/* Engagement Metrics */}
                  <div className="flex items-center gap-6">
                    <div className="flex items-center gap-2">
                      <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M2 10.5a1.5 1.5 0 113 0v6a1.5 1.5 0 01-3 0v-6zM6 10.333v5.834a2 2 0 001.106 1.79l.05.025A4 4 0 008.943 18h5.416a2 2 0 001.962-1.608l1.2-6A2 2 0 0015.56 8H12V4a2 2 0 00-2-2 1 1 0 00-1 1v.667a4 4 0 01-.8 2.4L6.8 7.933a4 4 0 00-.8 2.4z" />
                      </svg>
                      <span className="text-white text-sm font-medium">{mainArticle.likes}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                      </svg>
                      <span className="text-white text-sm font-medium">{mainArticle.comments}</span>
                    </div>
                  </div>
                </div>
              </div>
            </Link>
          </div>

          {/* Sidebar - Right Side (1/3 width) */}
          <div className="lg:col-span-1">
            <h2 className="text-2xl md:text-3xl font-bold text-black mb-6">Other featured posts</h2>
            <div className="space-y-6">
              {featuredPosts.map((post) => (
                <Link
                  key={post.id}
                  href={`/blog/${post.slug}`}
                  className="block group"
                >
                  <div className="flex gap-4">
                    {/* Thumbnail */}
                    <div className="relative w-24 h-24 flex-shrink-0 rounded-lg overflow-hidden">
                      <Image
                        src={post.image}
                        alt={post.headline}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                        unoptimized
                      />
                    </div>

                    {/* Text Content */}
                    <div className="flex-1 min-w-0">
                      {/* Category Badge - Red Transparent */}
                      <div className="mb-2">
                        <span className="inline-block bg-red-500/20 text-red-500 px-2 py-0.5 rounded-full text-xs font-medium border border-red-500/30">
                          {post.category}
                        </span>
                      </div>
                      
                      {/* Headline */}
                      <h3 className="text-sm font-medium text-black leading-snug group-hover:text-gray-600 transition-colors mb-2 line-clamp-2">
                        {post.headline}
                      </h3>

                      {/* Engagement Metrics */}
                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-1">
                          <svg className="w-3.5 h-3.5 text-gray-600" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M2 10.5a1.5 1.5 0 113 0v6a1.5 1.5 0 01-3 0v-6zM6 10.333v5.834a2 2 0 001.106 1.79l.05.025A4 4 0 008.943 18h5.416a2 2 0 001.962-1.608l1.2-6A2 2 0 0015.56 8H12V4a2 2 0 00-2-2 1 1 0 00-1 1v.667a4 4 0 01-.8 2.4L6.8 7.933a4 4 0 00-.8 2.4z" />
                          </svg>
                          <span className="text-xs text-gray-600">{post.likes}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <svg className="w-3.5 h-3.5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                          </svg>
                          <span className="text-xs text-gray-600">{post.comments}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Article Section with Infinite Moving Cards */}
      <section className="w-full py-12">
        <div className="w-full overflow-x-hidden">
          <InfiniteMovingCards
            items={infiniteCards}
            direction="left"
            speed="normal"
            pauseOnHover={true}
            className="[--animation-duration:40s]"
          />
        </div>
      </section>

      {/* Article Detail Section */}
      <section className="w-full px-6 sm:px-8 lg:px-12 xl:px-16 2xl:px-24 py-12">
        <div className="space-y-12">
          {articleDetails.map((article, index, array) => (
            <Link key={article.id} href={`/blog/${article.slug}`} className={`block grid lg:grid-cols-12 gap-8 lg:gap-12 items-stretch ${index !== array.length - 1 ? 'pb-12 border-b border-gray-300' : ''}`}>
              {/* Text Content - Left Side */}
              <div className="lg:col-span-5 space-y-4 flex flex-col justify-between">
                <div className="space-y-4">
                  {/* Sub-category aligned with top of image */}
                  <div>
                    <span className="inline-block bg-red-500/20 text-red-500 px-3 py-1 rounded-full text-sm font-medium border border-red-500/30">
                      {article.category}
                    </span>
                  </div>

                  {/* Headline */}
                  <h1 className="text-lg md:text-xl lg:text-2xl font-normal text-black leading-tight">
                    {article.headline}
                  </h1>

                  {/* Sub-headline */}
                  <p className="text-base text-gray-600">
                    {article.subheadline}
                  </p>

                  {/* Author and Date */}
                  <p className="text-sm text-gray-500">
                    {article.author}
                  </p>
                </div>

                {/* Engagement Metrics - Aligned with image height */}
                <div className="flex items-center gap-6 pt-4">
                  <div className="flex items-center gap-2">
                    <svg className="w-5 h-5 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M2 10.5a1.5 1.5 0 113 0v6a1.5 1.5 0 01-3 0v-6zM6 10.333v5.834a2 2 0 001.106 1.79l.05.025A4 4 0 008.943 18h5.416a2 2 0 001.962-1.608l1.2-6A2 2 0 0015.56 8H12V4a2 2 0 00-2-2 1 1 0 00-1 1v.667a4 4 0 01-.8 2.4L6.8 7.933a4 4 0 00-.8 2.4z" />
                    </svg>
                    <span className="text-sm text-gray-600">{article.likes}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                    <span className="text-sm text-gray-600">{article.comments}</span>
                  </div>
                </div>
              </div>

              {/* Image Content - Right Side */}
              <div className="lg:col-span-7 relative w-full h-full min-h-[500px] lg:min-h-[600px] overflow-hidden">
                <Image
                  src={article.image}
                  alt={article.alt}
                  fill
                  className="object-cover"
                  unoptimized
                />
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Footer Section */}
      <Footer />
    </main>
  );
}

