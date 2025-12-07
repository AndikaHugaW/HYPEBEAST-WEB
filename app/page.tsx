"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import HeroSection from "@/components/HeroSection";
import Footer from "@/components/Footer";
import ScrollReveal from "@/components/ScrollReveal";
import ParallaxSection from "@/components/ParallaxSection";
import { useAuth } from "@/hooks/useAuth";
import { createUserClient } from "@/lib/supabase";

type Product = {
  id: string;
  name: string;
  brand: string;
  original_price: number;
  sale_price: number;
  discount_percentage?: number;
  images: string[];
  is_new_arrival?: boolean;
  is_on_sale?: boolean;
  updated_at?: string;
  created_at?: string;
};

type BlogPost = {
  id: string;
  headline: string;
  subheadline?: string;
  category: string;
  author?: string;
  date?: string;
  image: string;
  image_url?: string;
  slug: string;
  updated_at?: string;
  created_at?: string;
};

export default function Home() {
  const router = useRouter();
  const { user, profile, loading, isAdmin } = useAuth();
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [addingItems, setAddingItems] = useState<Set<string>>(new Set());
  const [relatedArticles, setRelatedArticles] = useState<BlogPost[]>([]);
  const [loadingArticles, setLoadingArticles] = useState(true);

  // Handle Add to Cart
  const handleAddToCart = async (productId: string) => {
    if (!user) {
      router.push("/sign-in");
      return;
    }

    setAddingItems((prev) => new Set(prev).add(`cart-${productId}`));
    try {
      const supabase = createUserClient();
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError || !session) {
        router.push("/sign-in");
        return;
      }

      const response = await fetch("/api/cart", {
        method: "POST",
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          productId: productId,
          quantity: 1,
        }),
      });

      if (response.ok) {
        // Redirect to cart page
        router.push("/cart");
      } else {
        const errorData = await response.json();
        alert(errorData.error?.message || "Failed to add to cart");
      }
    } catch (error) {
      console.error("Error adding to cart:", error);
      alert("Failed to add to cart");
    } finally {
      setAddingItems((prev) => {
        const newSet = new Set(prev);
        newSet.delete(`cart-${productId}`);
        return newSet;
      });
    }
  };

  // Handle Add to Wishlist
  const handleAddToWishlist = async (productId: string) => {
    if (!user) {
      router.push("/sign-in");
      return;
    }

    setAddingItems((prev) => new Set(prev).add(`wishlist-${productId}`));
    try {
      const supabase = createUserClient();
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError || !session) {
        router.push("/sign-in");
        return;
      }

      const response = await fetch("/api/wishlist", {
        method: "POST",
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          productId: productId,
        }),
      });

      if (response.ok) {
        // Redirect to wishlist page
        router.push("/wishlist");
      } else {
        const errorData = await response.json();
        if (errorData.error?.code === 'ALREADY_EXISTS') {
          alert("Item already in wishlist");
        } else {
          alert(errorData.error?.message || "Failed to add to wishlist");
        }
      }
    } catch (error) {
      console.error("Error adding to wishlist:", error);
      alert("Failed to add to wishlist");
    } finally {
      setAddingItems((prev) => {
        const newSet = new Set(prev);
        newSet.delete(`wishlist-${productId}`);
        return newSet;
      });
    }
  };

  useEffect(() => {
    // STRICT: Admin should NEVER access user pages - redirect immediately
    if (!loading && user && isAdmin) {
      // Use window.location for hard redirect (prevents any user page rendering)
      window.location.href = "/admin/dashboard";
      return;
    }
  }, [user, isAdmin, loading]);

  // Fetch featured products
  const fetchFeaturedProducts = async () => {
    try {
      setLoadingProducts(true);
      const productNames = [
        "Supreme X Fox Racing® Sweatshirt - White",
        "Loose-fit Mock-Neck Jumper",
        "Vertical-Logo Zip-Up Hoodie - White"
      ];

      const products: Product[] = [];
      
      for (const productName of productNames) {
        try {
          const response = await fetch(`/api/products?search=${encodeURIComponent(productName)}&limit=1&_t=${Date.now()}`, {
            cache: 'no-store',
            headers: {
              'Cache-Control': 'no-cache',
            },
          });
          const result = await response.json();
          
          if (result.data && result.data.length > 0) {
            const product = result.data[0];
            products.push({
              id: product.id,
              name: product.name,
              brand: product.brand,
              original_price: product.original_price,
              sale_price: product.sale_price,
              discount_percentage: product.discount_percentage,
              images: product.images || [],
              is_new_arrival: product.is_new_arrival,
              is_on_sale: product.is_on_sale,
              updated_at: product.updated_at,
              created_at: product.created_at,
            });
          }
        } catch (err) {
          console.error(`Error fetching product ${productName}:`, err);
        }
      }

      setFeaturedProducts(products);
    } catch (err) {
      console.error("Error fetching featured products:", err);
    } finally {
      setLoadingProducts(false);
    }
  };

  useEffect(() => {
    fetchFeaturedProducts();
  }, []);

  // Fetch related articles from blog
  const fetchRelatedArticles = async (isPolling = false) => {
    // Only show loading state on initial load, not during polling to avoid glitch
    if (!isPolling) {
      setLoadingArticles(true);
    }
    
    try {
      const response = await fetch(`/api/blog?_t=${Date.now()}`, {
        cache: 'no-store',
        headers: {
          'Cache-Control': 'no-cache',
        },
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch articles');
      }
      
      const result = await response.json();
      
      if (result.error) {
        throw new Error(result.error.message);
      }
      
      // Take first 3 articles and add cache buster to image URLs
      const articles = (result.data || []).slice(0, 3).map((post: any) => {
        const imageUrl = post.image_url || post.image || '';
        const timestamp = post.updated_at || post.created_at || Date.now();
        const timestampValue = typeof timestamp === 'string' ? new Date(timestamp).getTime() : timestamp;
        const imageWithCacheBuster = imageUrl ? `${imageUrl}${imageUrl.includes('?') ? '&' : '?'}t=${timestampValue}` : imageUrl;
        
        return {
          ...post,
          image: imageWithCacheBuster,
          date: post.date || (post.created_at ? new Date(post.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : ''),
        };
      });
      
      // Only update state if data actually changed to prevent unnecessary re-renders and glitch
      if (isPolling) {
        // Compare articles by creating a string representation to detect changes
        const normalizeArticle = (a: any) => ({
          id: String(a.id),
          headline: a.headline,
          slug: a.slug,
          image: a.image ? a.image.split('?')[0] : '', // Remove cache buster for comparison
          date: a.date,
        });
        
        const currentArticlesStr = JSON.stringify(
          relatedArticles.map(normalizeArticle).sort((a, b) => a.id.localeCompare(b.id))
        );
        
        const newArticlesStr = JSON.stringify(
          articles.map(normalizeArticle).sort((a, b) => a.id.localeCompare(b.id))
        );
        
        // Only update if there are actual changes
        if (currentArticlesStr !== newArticlesStr) {
          setRelatedArticles(articles);
        }
      } else {
        // Always update on initial load
        setRelatedArticles(articles);
      }
    } catch (err) {
      console.error("Error fetching related articles:", err);
      if (!isPolling) {
        setRelatedArticles([]);
      }
    } finally {
      if (!isPolling) {
        setLoadingArticles(false);
      }
    }
  };

  useEffect(() => {
    fetchRelatedArticles(false);
  }, []);

  // Polling for real-time updates (every 5 seconds)
  useEffect(() => {
    const interval = setInterval(() => {
      if (!loadingProducts) {
        fetchFeaturedProducts();
      }
      if (!loadingArticles) {
        // Pass isPolling=true to prevent loading state and glitch
        fetchRelatedArticles(true);
      }
    }, 5000); // Poll every 5 seconds

    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loadingProducts, loadingArticles]);

  // Show loading while checking auth or redirecting admin
  if (loading || (user && isAdmin)) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  // Only render user content if NOT admin
  if (user && isAdmin) {
    return null; // Should not reach here due to redirect above
  }

  return (
    <main className="min-h-screen">
      {/* Hero Section */}
      <HeroSection />

      {/* Promotional Banner */}
      <section className="bg-black text-white py-4 w-full">
        <div className="flex items-center justify-center">
          <span className="text-lg md:text-xl font-bold uppercase tracking-wider">
            PUBLIC <span className="text-red-500">*</span> 20% OFF LIMITED TIME SALE <span className="text-red-500">*</span>
          </span>
        </div>
      </section>

      {/* Products Showcase Section */}
      <ScrollReveal direction="up" delay={0.1}>
        <section className="py-24 md:py-32 lg:py-40 bg-white">
          <div className="w-full px-6 sm:px-8 lg:px-12 xl:px-16 2xl:px-24">
          {loadingProducts ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
              {[1, 2, 3].map((i) => (
                <div key={i} className="bg-white rounded-lg overflow-hidden relative animate-pulse">
                  <div className="aspect-square bg-gray-200"></div>
                  <div className="p-4 space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                    <div className="h-5 bg-gray-200 rounded w-3/4"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/3"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
              {featuredProducts.map((product, index) => {
                const discount = product.discount_percentage || 
                  Math.round(((product.original_price - product.sale_price) / product.original_price) * 100);
                const baseImageUrl = product.images && product.images.length > 0 ? product.images[0] : null;
                // Add cache buster to image URL for real-time updates using product timestamp
                const timestamp = product.updated_at || product.created_at || Date.now();
                const timestampValue = typeof timestamp === 'string' ? new Date(timestamp).getTime() : timestamp;
                const imageUrl = baseImageUrl ? `${baseImageUrl}${baseImageUrl.includes('?') ? '&' : '?'}t=${timestampValue}` : null;
                
                return (
                  <ScrollReveal 
                    key={product.id} 
                    direction="up" 
                    delay={index * 0.1}
                    duration={0.5}
                  >
                    <Link href={`/products/${product.id}`} className="group cursor-pointer bg-white rounded-lg overflow-hidden relative">
                    {/* Product Image */}
                    <div className="relative aspect-square overflow-hidden bg-gray-100">
                      {imageUrl ? (
                        <Image
                          src={imageUrl}
                          alt={product.name}
                          fill
                          className="object-cover group-hover:scale-110 transition-transform duration-500"
                          unoptimized
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                          <div className="text-6xl sm:text-7xl drop-shadow-xl">👕</div>
                        </div>
                      )}
                      
                      {/* Discount Badge - Top Left of Image */}
                      {discount > 0 && (
                        <div className="absolute top-3 left-3 z-10">
                          <span className="bg-red-500 text-white text-xs font-bold px-2 py-1 rounded">
                            -{discount}%
                          </span>
                        </div>
                      )}
                      
                      {/* New Badge - Top Right of Image (only if no discount) */}
                      {product.is_new_arrival && !discount && (
                        <div className="absolute top-3 right-3 z-10">
                          <span className="bg-red-500 text-white text-xs font-bold px-2 py-1 rounded">
                            New
                          </span>
                        </div>
                      )}
                    </div>
                    
                    {/* Heart Icon - Top Right of Card (outside image) */}
                    <div className="absolute top-3 right-3 z-20">
                      <button 
                        onClick={async (e) => {
                          e.preventDefault();
                          await handleAddToWishlist(product.id);
                        }}
                        className="bg-white/90 backdrop-blur-sm p-2 rounded-full shadow-sm hover:bg-white text-gray-600 hover:text-red-500 transition-all duration-300 hover:scale-110"
                        title="Add to wishlist"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                        </svg>
                      </button>
                    </div>
                    
                    {/* Product Info */}
                    <div className="p-4 space-y-2">
                      <p className="text-xs font-bold text-gray-600 uppercase tracking-wider">
                        {product.brand}
                      </p>
                      <h3 className="text-base font-medium text-gray-900 line-clamp-2">
                        {product.name}
                      </h3>
                      <div className="flex items-center gap-2">
                        {product.original_price > product.sale_price && (
                          <span className="text-sm text-gray-400 line-through">
                            ${product.original_price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </span>
                        )}
                        <span className="text-base font-bold text-gray-900 ml-auto">
                          ${product.sale_price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </span>
                      </div>
                      
                      {/* Add to Cart Button - Hidden by default, shown on hover */}
                      <button 
                        onClick={async (e) => {
                          e.preventDefault();
                          await handleAddToCart(product.id);
                        }}
                        className="mt-3 w-full group/btn relative inline-block text-base font-bold text-white opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all duration-300"
                      >
                        <span className="absolute inset-0 border border-black"></span>
                        <span className="w-full border border-black bg-black py-3 transition-transform group-hover/btn:-translate-x-1 group-hover/btn:-translate-y-1 flex items-center justify-center gap-2">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                          </svg>
                          Add to Cart
                        </span>
                      </button>
                    </div>
                    </Link>
                  </ScrollReveal>
                );
              })}
            </div>
          )}

          {/* Promotional Section */}
          <ScrollReveal direction="up" delay={0.3}>
            <div className="mt-12">
              <h3 className="text-base sm:text-lg md:text-xl font-bold text-black mb-6 uppercase tracking-tight leading-tight">
                LIMITED-EDITION COLLABS WITH THE<br />
                ICONS OF THE UNDERGROUND.
              </h3>
              <Link
                href="/products"
                className="inline-flex items-center gap-2 bg-black text-white px-6 sm:px-8 py-3 rounded-lg font-semibold hover:bg-gray-900 transition-colors text-sm sm:text-base uppercase"
              >
                SEE MORE
                <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </div>
          </ScrollReveal>
        </div>
        </section>
      </ScrollReveal>

      {/* About/Testimonial Section */}
      <section className="relative py-24 md:py-32 lg:py-40 overflow-hidden">
        {/* Background Image */}
        <div className="absolute inset-0 z-0">
          <Image
            src="https://pbs.twimg.com/media/Gx20G3wagAA2TSH.jpg"
            alt="Fashion Background"
            fill
            className="object-cover"
            unoptimized
          />
        </div>

        {/* Dark Overlay */}
        <div className="absolute inset-0 bg-black/50 z-0"></div>

        {/* Centered Text Content */}
        <div className="relative z-10 max-w-4xl mx-auto px-6 sm:px-8 lg:px-12 xl:px-16 2xl:px-24 text-center">
          <p className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-normal text-white leading-relaxed italic">
            "Clothingan is a fashion shop with above average quality and with a wide variety of clothing styles from well-known designers."
          </p>
        </div>
      </section>

      {/* Fashion Category Section */}
      <ScrollReveal direction="up" delay={0.1}>
        <section className="py-16 md:py-24 bg-white">
        <div className="w-full px-6 sm:px-8 lg:px-12 xl:px-16 2xl:px-24">
          {/* Header */}
          <ScrollReveal direction="down" delay={0.05}>
            <div className="flex items-center justify-between mb-8 md:mb-12">
              <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-black uppercase tracking-tight">
                Fashion Category
              </h2>
              <div className="flex items-center gap-2 text-gray-600 cursor-pointer hover:text-black transition-colors">
                <span className="text-sm md:text-base">Men&apos;s fashion</span>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
          </ScrollReveal>

          {/* Horizontal Line */}
          <ScrollReveal direction="left" delay={0.1} duration={0.8}>
            <div className="w-full h-px bg-gray-300 mb-8 md:mb-12"></div>
          </ScrollReveal>

          {/* Category Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 md:gap-8">
            {/* Category 1 - Apparel */}
            <ScrollReveal direction="up" delay={0.1} duration={0.5}>
              <div className="group">
              <div className="relative aspect-[4/3] rounded-lg overflow-hidden">
                <Image
                  src="/images/fashion/apparel.png"
                  alt="Apparel"
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-300"
                  unoptimized
                />
              </div>
              <div className="mt-4">
                <p className="text-xs text-gray-400 mb-2">01</p>
                <div className="w-full h-px bg-gray-200 mb-3"></div>
                <div className="flex items-center justify-between">
                  <h3 className="text-base md:text-lg font-normal text-black">Apparel</h3>
                  <Link href="/products?category=apparel" className="flex items-center gap-1 text-sm text-gray-500 hover:text-black transition-colors">
                    Explore
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 17L17 7M17 7H7M17 7V17" />
                    </svg>
                  </Link>
                </div>
              </div>
              </div>
            </ScrollReveal>

            {/* Category 2 - Footwear */}
            <ScrollReveal direction="up" delay={0.2} duration={0.5}>
              <div className="group">
              <div className="relative aspect-[4/3] rounded-lg overflow-hidden">
                <Image
                  src="/images/fashion/footwear.png"
                  alt="Footwear"
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-300"
                  unoptimized
                />
              </div>
              <div className="mt-4">
                <p className="text-xs text-gray-400 mb-2">02</p>
                <div className="w-full h-px bg-gray-200 mb-3"></div>
                <div className="flex items-center justify-between">
                  <h3 className="text-base md:text-lg font-normal text-black">Footwear</h3>
                  <Link href="/products?category=footwear" className="flex items-center gap-1 text-sm text-gray-500 hover:text-black transition-colors">
                    Explore
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 17L17 7M17 7H7M17 7V17" />
                    </svg>
                  </Link>
                </div>
              </div>
              </div>
            </ScrollReveal>

            {/* Category 3 - Accessories */}
            <ScrollReveal direction="up" delay={0.3} duration={0.5}>
              <div className="group">
              <div className="relative aspect-[4/3] rounded-lg overflow-hidden">
                <Image
                  src="/images/fashion/accessories.png"
                  alt="Accessories"
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-300"
                  unoptimized
                />
              </div>
              <div className="mt-4">
                <p className="text-xs text-gray-400 mb-2">03</p>
                <div className="w-full h-px bg-gray-200 mb-3"></div>
                <div className="flex items-center justify-between">
                  <h3 className="text-base md:text-lg font-normal text-black">Accessories</h3>
                  <Link href="/products?category=accessories" className="flex items-center gap-1 text-sm text-gray-500 hover:text-black transition-colors">
                    Explore
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 17L17 7M17 7H7M17 7V17" />
                    </svg>
                  </Link>
                </div>
              </div>
              </div>
            </ScrollReveal>

            {/* Category 4 - Lifestyle & Collectibles */}
            <ScrollReveal direction="up" delay={0.4} duration={0.5}>
              <div className="group">
              <div className="relative aspect-[4/3] rounded-lg overflow-hidden">
                <Image
                  src="/images/fashion/lifestyle.png"
                  alt="Lifestyle & Collectibles"
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-300"
                  unoptimized
                />
              </div>
              <div className="mt-4">
                <p className="text-xs text-gray-400 mb-2">04</p>
                <div className="w-full h-px bg-gray-200 mb-3"></div>
                <div className="flex items-center justify-between">
                  <h3 className="text-base md:text-lg font-normal text-black">Lifestyle & Collectibles</h3>
                  <Link href="/products?category=lifestyle" className="flex items-center gap-1 text-sm text-gray-500 hover:text-black transition-colors">
                    Explore
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 17L17 7M17 7H7M17 7V17" />
                    </svg>
                  </Link>
                </div>
              </div>
              </div>
            </ScrollReveal>

          </div>
        </div>
        </section>
      </ScrollReveal>

      {/* Related Articles Section */}
      <ScrollReveal direction="up" delay={0.1}>
        <section className="py-16 bg-white">
        <div className="w-full px-6 sm:px-8 lg:px-12 xl:px-16 2xl:px-24">
          {/* Header */}
          <ScrollReveal direction="down" delay={0.05}>
            <div className="flex items-center justify-between mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-black">
                Related Article
              </h2>
              <Link
                href="/aboutus"
                className="text-black hover:text-gray-600 transition-colors font-medium"
              >
                View all Articles
              </Link>
            </div>
          </ScrollReveal>

          {/* Articles Grid */}
          {loadingArticles ? (
            <div className="grid md:grid-cols-3 gap-8">
              {[1, 2, 3].map((i) => (
                <div key={i} className="space-y-4 animate-pulse">
                  <div className="relative w-full aspect-[4/3] bg-gray-200 rounded-lg"></div>
                  <div className="space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-1/3"></div>
                    <div className="h-6 bg-gray-200 rounded w-full"></div>
                    <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : relatedArticles.length > 0 ? (
            <div className="grid md:grid-cols-3 gap-8">
              {relatedArticles.map((article, index) => (
                <ScrollReveal 
                  key={article.id} 
                  direction="up" 
                  delay={index * 0.15}
                  duration={0.5}
                >
                  <Link href={`/blog/${article.slug}`} className="group">
                  <div className="space-y-4">
                    {/* Image */}
                    <div className="relative w-full aspect-[4/3] overflow-hidden">
                      <Image
                        src={article.image || "https://images.unsplash.com/photo-1516280440614-37939bbacd81?w=800&q=80"}
                        alt={article.headline}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                        unoptimized
                      />
                    </div>
                    {/* Content */}
                    <div className="space-y-2">
                      <p className="text-sm text-gray-500">{article.date || 'No date'}</p>
                      <h3 className="text-xl font-normal text-black group-hover:text-gray-600 transition-colors">
                        {article.headline}
                      </h3>
                      <p className="text-gray-600 text-sm leading-relaxed">
                        {article.subheadline || article.headline.substring(0, 100) + '...'}
                      </p>
                    </div>
                  </div>
                  </Link>
                </ScrollReveal>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-500">No articles available at the moment.</p>
            </div>
          )}
        </div>
        </section>
      </ScrollReveal>

      {/* Email Banner Section */}
      <section className="relative py-24 md:py-32 overflow-hidden">
        {/* Background Image */}
        <div className="absolute inset-0 z-0">
          <Image
            src="https://plus.unsplash.com/premium_photo-1684141286619-1346f32fa7b3?q=80&w=1632&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
            alt="Agricultural Field"
            fill
            className="object-cover"
            unoptimized
          />
          {/* Overlay */}
          <div className="absolute inset-0 bg-black/40"></div>
        </div>

        {/* Content */}
        <div className="relative z-10 max-w-4xl mx-auto px-6 sm:px-8 lg:px-12 xl:px-16 2xl:px-24 text-center">
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-normal text-white mb-8">
            Get involved in the agricultural uprising
          </h2>
          
          {/* Email Form */}
          <div className="flex flex-col sm:flex-row gap-4 max-w-2xl mx-auto">
            <input
              type="email"
              placeholder="Type your email address"
              className="flex-1 px-6 py-4 rounded-lg text-gray-900 outline-none focus:ring-2 focus:ring-lime-400"
            />
            <button className="bg-lime-400 hover:bg-lime-500 text-black px-8 py-4 rounded-lg font-normal transition-colors flex items-center justify-center gap-2">
              Join Now
              <span className="bg-black text-white p-1.5 rounded-full">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </span>
            </button>
          </div>
        </div>
      </section>

      {/* Footer Section */}
      <ScrollReveal direction="up" delay={0.1}>
        <Footer />
      </ScrollReveal>
    </main>
  );
}

