"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import Footer from "@/components/Footer";
import { useAuth } from "@/hooks/useAuth";
import { createUserClient } from "@/lib/supabase";

type Product = {
  id: string;
  name: string;
  brand: string;
  category: string;
  original_price: number;
  sale_price: number;
  discount_percentage?: number;
  images: string[];
  image_url?: string;
  color?: string;
  size?: string[];
  description?: string;
  is_new_arrival?: boolean;
  is_on_sale?: boolean;
};

type Review = {
  id: string;
  user_name: string;
  user_avatar?: string;
  rating: number;
  comment: string;
  date: string;
  helpful_count: number;
  not_helpful_count: number;
  is_question?: boolean;
};

export default function ProductDetail() {
  const params = useParams();
  const router = useRouter();
  const productId = params.id as string;
  const { user } = useAuth();

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [selectedColor, setSelectedColor] = useState<string>("");
  const [selectedSize, setSelectedSize] = useState<string>("");
  const [activeTab, setActiveTab] = useState<"details" | "reviews" | "discussion">("reviews");
  const [sortReviews, setSortReviews] = useState<string>("newest");
  const [addingToCart, setAddingToCart] = useState(false);
  const [addingToWishlist, setAddingToWishlist] = useState(false);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [popularProducts, setPopularProducts] = useState<Product[]>([]);
  const [loadingRelated, setLoadingRelated] = useState(true);
  const [loadingPopular, setLoadingPopular] = useState(true);
  const relatedProductsScrollRef = useRef<HTMLDivElement>(null);
  const popularProductsScrollRef = useRef<HTMLDivElement>(null);
  
  // Track last images to detect changes
  const lastImagesRef = useRef<string[]>([]);
  const [imageVersion, setImageVersion] = useState<number>(0);
  
  // Helper function to add cache buster to image URLs for real-time updates
  // Only update cache buster when images actually change
  const addCacheBuster = (url: string) => {
    if (!url) return url;
    const separator = url.includes('?') ? '&' : '?';
    return `${url}${separator}v=${imageVersion}`;
  };

  // Mock reviews data - in production, this would come from API
  const [reviews] = useState<Review[]>([
    {
      id: "1",
      user_name: "Helen M.",
      rating: 5,
      comment: "Excellent running shoes. It turns very sharply on the foot.",
      date: "Yesterday",
      helpful_count: 42,
      not_helpful_count: 0,
    },
    {
      id: "2",
      user_name: "Ann D.",
      rating: 5,
      comment: "Good shoes",
      date: "2 days ago",
      helpful_count: 35,
      not_helpful_count: 2,
    },
    {
      id: "3",
      user_name: "Andrew G.",
      rating: 0,
      comment: "Is it suitable for running?",
      date: "2 days ago",
      helpful_count: 0,
      not_helpful_count: 0,
      is_question: true,
    },
  ]);

  // Mock rating summary
  const ratingSummary = {
    average: 4.5,
    total: 1230,
    distribution: {
      5: 800,
      4: 300,
      3: 80,
      2: 30,
      1: 20,
    },
  };

  useEffect(() => {
    const fetchProduct = async (isInitialLoad: boolean = false) => {
      try {
        // Add cache buster to force fresh data fetch for real-time updates
        const response = await fetch(`/api/products/${productId}?t=${Date.now()}`, {
          cache: 'no-store',
          headers: {
            'Cache-Control': 'no-cache',
          },
        });
        if (!response.ok) {
          throw new Error("Failed to fetch product");
        }
        
        const data = await response.json();

        if (data.error) {
          console.error("Error fetching product:", data.error);
          return;
        }

        // Ensure images is always an array
        let images = data.images || [];
        if (typeof images === 'string') {
          try {
            images = JSON.parse(images);
          } catch (e) {
            console.error('Error parsing images:', e);
            images = [];
          }
        }
        if (!Array.isArray(images)) {
          images = images ? [images] : [];
        }

        // Check if images actually changed to avoid unnecessary re-renders
        const imagesChanged = JSON.stringify(images) !== JSON.stringify(lastImagesRef.current);
        if (imagesChanged) {
          // Only update cache buster version when images actually change
          setImageVersion(Date.now());
          lastImagesRef.current = images;
        }

        // Only update product if data actually changed to prevent glitching
        setProduct((prevProduct) => {
          const imagesChanged = JSON.stringify(images) !== JSON.stringify(prevProduct?.images || []);
          if (imagesChanged || !prevProduct) {
            return {
              ...data,
              images: images,
            };
          }
          return prevProduct;
        });
        
        // Only reset selectedImageIndex on initial load, not during polling
        // This allows user to click thumbnails without them being reset
        if (isInitialLoad) {
          setSelectedImageIndex(0);
        } else {
          // During polling, ensure selectedImageIndex is still valid
          // If current selection is out of bounds, reset to 0
          setSelectedImageIndex((prevIndex) => {
            if (prevIndex >= images.length) {
              return 0;
            }
            return prevIndex;
          });
        }
        
        if (data.color) {
          setSelectedColor(data.color);
        }
        if (data.size && data.size.length > 0) {
          setSelectedSize(data.size[0]);
        }
        
        // Verify: The first image should match what card shows
        // Card uses: (product.images && product.images.length > 0) ? product.images[0] : product.image_url
        // So if images array exists, card shows images[0]
        // Detail page should show the same images[0] by default
      } catch (err) {
        console.error("Error fetching product:", err);
      } finally {
        if (isInitialLoad) {
          setLoading(false);
        }
      }
    };

    if (productId) {
      // Initial fetch - reset selectedImageIndex to 0
      fetchProduct(true);
      
      // Poll for updates every 3 seconds to show new images in real-time
      // This ensures when admin uploads new images, they appear quickly on detail page
      // Reduced frequency to prevent glitching - 3 seconds is still fast enough for real-time feel
      // But don't reset selectedImageIndex during polling
      const interval = setInterval(() => {
        fetchProduct(false);
      }, 3000);
      
      return () => clearInterval(interval);
    }
  }, [productId]);

  // Fetch related products
  useEffect(() => {
    const fetchRelatedProducts = async () => {
      if (!product) return;
      
      try {
        setLoadingRelated(true);
        let url = `/api/products?limit=20&_t=${Date.now()}`;
        
        // Filter by same category, exclude current product
        if (product.category) {
          url += `&category=${product.category}`;
        }
        
        const response = await fetch(url, {
          cache: 'no-store',
          headers: {
            'Cache-Control': 'no-cache',
          },
        });
        
        if (response.ok) {
          const result = await response.json();
          if (result.data && !result.error) {
            // Filter out current product and transform data
            const filtered = result.data
              .filter((p: any) => p.id !== product.id)
              .slice(0, 10)
              .map((p: any) => {
                const imageUrl = (p.images && p.images.length > 0) 
                  ? p.images[0] 
                  : p.image_url || "";
                return {
                  id: String(p.id),
                  name: p.name,
                  brand: p.brand,
                  category: p.category,
                  original_price: p.original_price,
                  sale_price: p.sale_price,
                  discount_percentage: p.discount_percentage,
                  images: p.images || [],
                  image_url: imageUrl,
                  is_new_arrival: p.is_new_arrival,
                  is_on_sale: p.is_on_sale,
                };
              });
            setRelatedProducts(filtered);
          }
        }
      } catch (error) {
        console.error("Error fetching related products:", error);
      } finally {
        setLoadingRelated(false);
      }
    };

    if (product) {
      fetchRelatedProducts();
    }
  }, [product]);

  // Fetch popular products
  useEffect(() => {
    const fetchPopularProducts = async () => {
      try {
        setLoadingPopular(true);
        const url = `/api/products?limit=10&_t=${Date.now()}`;
        
        const response = await fetch(url, {
          cache: 'no-store',
          headers: {
            'Cache-Control': 'no-cache',
          },
        });
        
        if (response.ok) {
          const result = await response.json();
          if (result.data && !result.error) {
            // Transform data
            const transformed = result.data.slice(0, 10).map((p: any) => {
              const imageUrl = (p.images && p.images.length > 0) 
                ? p.images[0] 
                : p.image_url || "";
              return {
                id: String(p.id),
                name: p.name,
                brand: p.brand,
                category: p.category,
                original_price: p.original_price,
                sale_price: p.sale_price,
                discount_percentage: p.discount_percentage,
                images: p.images || [],
                image_url: imageUrl,
                is_new_arrival: p.is_new_arrival,
                is_on_sale: p.is_on_sale,
              };
            });
            setPopularProducts(transformed);
          }
        }
      } catch (error) {
        console.error("Error fetching popular products:", error);
      } finally {
        setLoadingPopular(false);
      }
    };

    fetchPopularProducts();
  }, []);

  // Process images - must be done before early returns to maintain hook order
  // Use useMemo to ensure hooks are called in consistent order
  const displayImages = useMemo(() => {
    if (!product || !product.images) return [];
    
    let images: string[] = [];
    if (Array.isArray(product.images)) {
      images = product.images.filter((img: any) => img && img.trim && img.trim() !== "");
    } else if (typeof product.images === 'string') {
      try {
        const parsed = JSON.parse(product.images);
        images = Array.isArray(parsed) ? parsed.filter((img: any) => img && img.trim && img.trim() !== "") : [];
      } catch (e) {
        images = [product.images].filter((img: any) => img && img.trim && img.trim() !== "");
      }
    }
    return images;
  }, [product?.images]);
  
  // Main image: Use selected thumbnail, or default to images[0]
  // When user clicks a thumbnail, selectedImageIndex will change and main image will update
  // Use useMemo to prevent unnecessary recalculations
  const mainImage = useMemo(() => {
    if (displayImages.length === 0) return "";
    const index = selectedImageIndex >= 0 && selectedImageIndex < displayImages.length 
      ? selectedImageIndex 
      : 0;
    return displayImages[index] || "";
  }, [displayImages, selectedImageIndex]);
  
  // Memoize the cache-busted URL to prevent constant re-renders
  const mainImageUrl = useMemo(() => {
    if (!mainImage) return "";
    const separator = mainImage.includes('?') ? '&' : '?';
    return `${mainImage}${separator}v=${imageVersion}`;
  }, [mainImage, imageVersion]);

  // Handle Add to Cart
  const handleAddToCart = async () => {
    if (!user) {
      router.push("/sign-in");
      return;
    }

    if (!product) return;

    setAddingToCart(true);
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
          productId: product.id,
          quantity: 1,
          size: selectedSize || null,
          color: selectedColor || null,
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
      setAddingToCart(false);
    }
  };

  // Handle Add to Wishlist
  const handleAddToWishlist = async () => {
    if (!user) {
      router.push("/sign-in");
      return;
    }

    if (!product) return;

    setAddingToWishlist(true);
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
          productId: product.id,
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
      setAddingToWishlist(false);
    }
  };

  // Early returns after all hooks
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 mb-4">Product not found</p>
          <Link href="/products" className="text-gray-900 hover:underline">
            ← Back to Products
          </Link>
        </div>
      </div>
    );
  }

  const discount = product.discount_percentage || 
    Math.round(((product.original_price - product.sale_price) / product.original_price) * 100);
  
  const availableColors = ["Cream", "Royal Brown", "Blue", "Dark Blue"]; // Mock colors - should come from product data
  const availableSizes = product.size || ["XS", "S", "M", "L", "XL", "XXL"];

  // Verify: The first image in detail should match the image in card
  // Card shows: product.images[0]
  // Detail shows: displayImages[0] (which is product.images[0])

  // Ensure we're using the exact same image URL format as card
  // No cache busting or URL manipulation - use raw URL from database

  return (
    <main className="min-h-screen bg-white">
      {/* Breadcrumbs */}
      <div className="w-full px-6 sm:px-8 lg:px-12 xl:px-16 2xl:px-24 py-4 border-b border-gray-200">
        <div className="text-sm text-gray-600">
          <Link href="/" className="hover:text-gray-900">Home</Link>
          <span className="mx-2">/</span>
          <Link href="/products" className="hover:text-gray-900">Products</Link>
          <span className="mx-2">/</span>
          <span className="text-gray-900">{product.category}</span>
          <span className="mx-2">/</span>
          <span className="text-gray-900">{product.brand}</span>
        </div>
      </div>

      {/* Main Product Section */}
      <section className="w-full px-6 sm:px-8 lg:px-12 xl:px-16 2xl:px-24 py-8 md:py-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
          {/* Left Section - Product Images */}
          <div>
            {/* Main Image with Hover Effect */}
            <div className="relative aspect-square bg-gray-100 rounded-lg overflow-hidden mb-4 group cursor-zoom-in">
              {mainImageUrl ? (
                <Image
                  key={`main-${selectedImageIndex}-${mainImage}`}
                  src={mainImageUrl}
                  alt={product.name}
                  fill
                  className="object-cover transition-transform duration-300 ease-in-out group-hover:scale-110"
                  unoptimized
                  priority
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <div className="text-6xl">👕</div>
                </div>
              )}
              {/* Hover overlay indicator */}
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors duration-300 pointer-events-none" />
              
              {/* Share and Favorite Icons */}
              <div className="absolute top-4 right-4 flex flex-col gap-2 z-10">
                <button
                  onClick={() => {
                    if (navigator.share) {
                      navigator.share({
                        title: product.name,
                        text: product.description,
                        url: window.location.href,
                      });
                    } else {
                      navigator.clipboard.writeText(window.location.href);
                      alert("Link copied to clipboard!");
                    }
                  }}
                  className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-md hover:bg-gray-50 transition-colors"
                  title="Share"
                >
                  <svg className="w-5 h-5 text-gray-900" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                  </svg>
                </button>
                <button
                  onClick={handleAddToWishlist}
                  disabled={addingToWishlist}
                  className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-md hover:bg-gray-50 transition-colors disabled:opacity-50"
                  title="Add to wishlist"
                >
                  <svg className="w-5 h-5 text-gray-900" fill={addingToWishlist ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Thumbnail Images - Display up to 4 images from product.images array */}
            {displayImages.length > 0 ? (
              <div className="grid grid-cols-4 gap-2">
                {displayImages.slice(0, 4).map((image, index) => (
                  <button
                    key={`${image}-${index}`}
                    onClick={() => {
                      setSelectedImageIndex(index);
                    }}
                    className={`relative aspect-square rounded-lg overflow-hidden border-2 transition-all group/thumb ${
                      selectedImageIndex === index
                        ? "border-black ring-2 ring-black ring-offset-2"
                        : "border-gray-200 hover:border-gray-400 hover:ring-2 hover:ring-gray-300 hover:ring-offset-1"
                    }`}
                  >
                    <Image
                      key={`thumb-${index}-${image}`}
                      src={addCacheBuster(image)}
                      alt={`${product.name} view ${index + 1}`}
                      fill
                      className={`object-cover transition-transform duration-200 ${
                        selectedImageIndex === index 
                          ? "" 
                          : "group-hover/thumb:scale-105"
                      }`}
                      unoptimized
                    />
                    {/* Active indicator overlay */}
                    {selectedImageIndex === index && (
                      <div className="absolute inset-0 bg-black/5 pointer-events-none" />
                    )}
                  </button>
                ))}
                {/* Fill remaining slots if less than 4 images */}
                {displayImages.length < 4 && 
                  Array.from({ length: 4 - displayImages.length }).map((_, index) => (
                    <div
                      key={`empty-${index}`}
                      className="relative aspect-square rounded-lg border-2 border-gray-200 bg-gray-100 flex items-center justify-center"
                    >
                      <span className="text-xs text-gray-400">No image</span>
                    </div>
                  ))
                }
              </div>
            ) : (
              <div className="grid grid-cols-4 gap-2">
                {Array.from({ length: 4 }).map((_, index) => (
                  <div
                    key={`empty-${index}`}
                    className="relative aspect-square rounded-lg border-2 border-gray-200 bg-gray-100 flex items-center justify-center"
                  >
                    <span className="text-xs text-gray-400">No image</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Right Section - Product Details */}
          <div>
            {/* Brand and Product Name */}
            <div className="mb-4">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-sm font-normal text-gray-900">{product.brand}</span>
              </div>
              <h1 className="text-2xl md:text-3xl font-normal text-gray-900 mb-3">
                {product.name}
              </h1>
            </div>

            {/* Rating and Sold Count */}
            <div className="flex items-center gap-4 mb-4">
              <div className="flex items-center gap-2">
                <div className="flex items-center">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <svg
                      key={star}
                      className="w-5 h-5 text-yellow-400"
                      fill={star <= Math.round(ratingSummary.average) ? "currentColor" : "none"}
                      stroke="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
                <span className="text-sm font-medium text-gray-900">{ratingSummary.average}</span>
                <span className="text-sm text-gray-600">({ratingSummary.total.toLocaleString()} reviews)</span>
              </div>
              <span className="text-sm text-gray-600">1,238 Sold</span>
            </div>

            {/* Price */}
            <div className="mb-6">
              {product.original_price > product.sale_price && (
                <span className="text-lg text-gray-400 line-through mr-2">
                  ${product.original_price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
              )}
              <span className="text-3xl font-normal text-gray-900">
                ${product.sale_price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
            </div>

            {/* Product Description */}
            {product.description && (
              <div className="mb-6">
                <h3 className="text-base font-normal text-gray-900 mb-3">Description</h3>
                <p className="text-base font-light text-gray-700 leading-relaxed whitespace-pre-line">
                  {product.description}
                </p>
              </div>
            )}

            {/* Color Selection */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-900 mb-3">
                Color: <span className="font-normal text-gray-600">{selectedColor || "Royal Brown"}</span>
              </label>
              <div className="flex gap-3">
                {availableColors.map((color) => {
                  const colorMap: { [key: string]: string } = {
                    "White": "#ffffff",
                    "Grey": "#9ca3af",
                    "Black": "#000000",
                    "Royal Brown": "#8B4513",
                    "Cream": "#FFFDD0",
                    "Brown": "#A52A2A",
                    "Blue": "#4169E1",
                    "Dark Blue": "#00008B",
                  };
                  return (
                    <button
                      key={color}
                      onClick={() => setSelectedColor(color)}
                      className={`w-10 h-10 rounded-full border-2 transition-all ${
                        selectedColor === color
                          ? "border-black ring-2 ring-black ring-offset-2"
                          : "border-gray-300 hover:border-gray-400"
                      }`}
                      style={{
                        backgroundColor: colorMap[color] || "#ffffff",
                      }}
                      title={color}
                    />
                  );
                })}
              </div>
            </div>

            {/* Size Selection */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-3">
                <label className="block text-sm font-medium text-gray-900">
                  Size: <span className="font-normal text-gray-600">{selectedSize || "L"}</span>
                </label>
                <Link href="#" className="text-sm text-gray-600 hover:text-gray-900 underline">
                  View Size Chart
                </Link>
              </div>
              <div className="flex flex-wrap gap-2">
                {availableSizes.map((size) => (
                  <button
                    key={size}
                    onClick={() => setSelectedSize(size)}
                    className={`py-2.5 px-4 rounded border-2 text-sm font-medium transition-all ${
                      selectedSize === size
                        ? "border-black bg-black text-white"
                        : "border-gray-300 text-gray-900 hover:border-gray-400 bg-white"
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>

            {/* Add to Cart and Checkout Buttons */}
            <div className="flex flex-col gap-3 mb-6">
              <button 
                onClick={handleAddToCart}
                disabled={addingToCart}
                className="w-full bg-black text-white py-3 px-6 rounded-lg font-semibold hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {addingToCart ? "Adding..." : "Add To Cart"}
              </button>
              <button 
                onClick={() => {
                  handleAddToCart();
                  setTimeout(() => {
                    router.push("/checkout");
                  }, 500);
                }}
                disabled={addingToCart}
                className="w-full bg-white text-black border-2 border-black py-3 px-6 rounded-lg font-semibold hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Checkout Now
              </button>
            </div>

            {/* Delivery T&C */}
            <div className="mb-6">
              <p className="text-sm text-gray-600">Delivery T&C</p>
            </div>
          </div>
        </div>
      </section>

      {/* Tabs Section */}
      <section className="w-full px-6 sm:px-8 lg:px-12 xl:px-16 2xl:px-24 py-8 border-t border-gray-200">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Tabs Content */}
          <div className="lg:col-span-2">
            {/* Tabs */}
            <div className="flex gap-6 border-b border-gray-200 mb-6">
              <button
                onClick={() => setActiveTab("details")}
                className={`pb-3 px-2 text-sm font-medium transition-colors ${
                  activeTab === "details"
                    ? "text-gray-900 border-b-2 border-black"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                Details
              </button>
              <button
                onClick={() => setActiveTab("reviews")}
                className={`pb-3 px-2 text-sm font-medium transition-colors ${
                  activeTab === "reviews"
                    ? "text-gray-900 border-b-2 border-black"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                Reviews
              </button>
              <button
                onClick={() => setActiveTab("discussion")}
                className={`pb-3 px-2 text-sm font-medium transition-colors ${
                  activeTab === "discussion"
                    ? "text-gray-900 border-b-2 border-black"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                Discussion
              </button>
            </div>

            {/* Tab Content */}
            {activeTab === "reviews" && (
              <div>
                {/* Sort Dropdown */}
                <div className="mb-6">
                  <select
                    value={sortReviews}
                    onChange={(e) => setSortReviews(e.target.value)}
                    className="px-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-black"
                  >
                    <option value="newest">Newest</option>
                    <option value="oldest">Oldest</option>
                    <option value="highest">Highest Rating</option>
                    <option value="lowest">Lowest Rating</option>
                  </select>
                </div>

                {/* Reviews List */}
                <div className="space-y-6">
                  {reviews.map((review) => (
                    <div key={review.id} className="border-b border-gray-200 pb-6 last:border-0">
                      <div className="flex items-start gap-4">
                        {/* Avatar */}
                        <div className="w-10 h-10 rounded-full bg-gray-300 flex items-center justify-center flex-shrink-0">
                          <span className="text-sm font-medium text-gray-600">
                            {review.user_name.charAt(0)}
                          </span>
                        </div>

                        {/* Review Content */}
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="font-medium text-gray-900">{review.user_name}</span>
                            <span className="text-sm text-gray-500">{review.date}</span>
                          </div>

                          {/* Rating Stars */}
                          {review.rating > 0 && (
                            <div className="flex items-center mb-2">
                              {[1, 2, 3, 4, 5].map((star) => (
                                <svg
                                  key={star}
                                  className={`w-4 h-4 ${
                                    star <= review.rating ? "text-yellow-400" : "text-gray-300"
                                  }`}
                                  fill="currentColor"
                                  viewBox="0 0 20 20"
                                >
                                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                </svg>
                              ))}
                            </div>
                          )}

                          <p className="text-gray-700 mb-3">{review.comment}</p>

                          {/* Actions */}
                          <div className="flex items-center gap-4">
                            <button className="flex items-center gap-1 text-sm text-gray-600 hover:text-gray-900">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v5m7 10h-2M7 20H5a2 2 0 01-2-2v-5a2 2 0 012-2h2m7 10v-5a2 2 0 00-2-2H9a2 2 0 00-2 2v5" />
                              </svg>
                              {review.helpful_count}
                            </button>
                            <button className="flex items-center gap-1 text-sm text-gray-600 hover:text-gray-900">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14H5.236a2 2 0 01-1.789-2.894l3.5-7A2 2 0 018.736 3h4.018a2 2 0 01.485.06l3.76.94m-7 10v5a2 2 0 002 2h.096c.5 0 .905-.405.905-.904 0-.715.211-1.413.608-2.008L17.196 7.5a2 2 0 00-1.789-2.894l-3.5-7A2 2 0 0011.236 0H7a2 2 0 00-2 2v5m7 10h2M7 20H5a2 2 0 01-2-2v-5a2 2 0 012-2h2" />
                              </svg>
                              {review.not_helpful_count}
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Pagination */}
                <div className="flex items-center justify-center gap-2 mt-8">
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19].map((page) => (
                    <button
                      key={page}
                      className={`px-3 py-1 text-sm rounded ${
                        page === 1
                          ? "bg-black text-white"
                          : "bg-white text-gray-700 hover:bg-gray-100 border border-gray-300"
                      }`}
                    >
                      {page}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {activeTab === "details" && (
              <div>
                <p className="text-gray-700 leading-relaxed">
                  {product.description || "No product details available."}
                </p>
              </div>
            )}

            {activeTab === "discussion" && (
              <div>
                <p className="text-gray-700">Discussion section coming soon.</p>
              </div>
            )}
          </div>

          {/* Right Column - Review Summary and Filters */}
          {activeTab === "reviews" && (
            <div className="lg:col-span-1">
              <div className="space-y-6">
                {/* Overall Rating */}
                <div className="bg-gray-50 rounded-lg p-6">
                  <div className="text-center mb-6">
                    <div className="text-5xl font-bold text-gray-900 mb-2">
                      {ratingSummary.average}
                    </div>
                    <div className="flex items-center justify-center mb-2">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <svg
                          key={star}
                          className="w-6 h-6 text-yellow-400"
                          fill={star <= Math.round(ratingSummary.average) ? "currentColor" : "none"}
                          stroke="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                      ))}
                    </div>
                    <p className="text-sm text-gray-600">
                      from {(ratingSummary.total / 1000).toFixed(2)}k reviews
                    </p>
                  </div>

                  {/* Rating Distribution */}
                  <div className="space-y-3">
                    {[5, 4, 3, 2, 1].map((rating) => {
                      const count = ratingSummary.distribution[rating as keyof typeof ratingSummary.distribution] || 0;
                      const percentage = ratingSummary.total > 0 ? (count / ratingSummary.total) * 100 : 0;
                      
                      return (
                        <div key={rating} className="flex items-center gap-3">
                          <span className="text-sm text-gray-600 w-6">{rating}</span>
                          <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-yellow-400 rounded-full"
                              style={{ width: `${percentage}%` }}
                            />
                          </div>
                          <span className="text-sm text-gray-600 w-10 text-right">{count}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Filters */}
                <div className="bg-white border border-gray-200 rounded-lg p-6">
                  <h3 className="text-sm font-bold text-gray-900 mb-4">Rating</h3>
                  <div className="space-y-2 mb-6">
                    {[5, 4, 3, 2, 1].map((rating) => (
                      <label key={rating} className="flex items-center gap-2 cursor-pointer">
                        <input type="checkbox" className="w-4 h-4 text-black border-gray-300 rounded focus:ring-black" />
                        <span className="text-sm text-gray-700">{rating} Star</span>
                      </label>
                    ))}
                  </div>

                  <h3 className="text-sm font-bold text-gray-900 mb-4">Review Topics</h3>
                  <div className="space-y-2">
                    {["Product Quality", "Seller Services", "Product Price", "Shipment", "Match with Description"].map((topic) => (
                      <label key={topic} className="flex items-center gap-2 cursor-pointer">
                        <input type="checkbox" className="w-4 h-4 text-black border-gray-300 rounded focus:ring-black" />
                        <span className="text-sm text-gray-700">{topic}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Related Products Section */}
      <section className="w-full px-6 sm:px-8 lg:px-12 xl:px-16 2xl:px-24 py-12 border-t border-gray-200 relative">
        <h2 className="text-2xl font-bold text-gray-900 mb-8">Related Product</h2>
        {loadingRelated ? (
          <div className="flex gap-6 overflow-x-auto scrollbar-hide">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((item) => (
              <div key={item} className="animate-pulse flex-shrink-0 w-64">
                <div className="relative aspect-square bg-gray-200 rounded-lg mb-3"></div>
                <div className="space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/3"></div>
                </div>
              </div>
            ))}
          </div>
        ) : relatedProducts.length > 0 ? (
          <div className="relative">
            {/* Left Arrow Button */}
            <button
              onClick={() => {
                if (relatedProductsScrollRef.current) {
                  relatedProductsScrollRef.current.scrollBy({ left: -400, behavior: 'smooth' });
                }
              }}
              className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-white border border-gray-300 rounded-full p-2 shadow-lg hover:bg-gray-50 transition-colors"
            >
              <svg className="w-6 h-6 text-gray-900" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>

            {/* Right Arrow Button */}
            <button
              onClick={() => {
                if (relatedProductsScrollRef.current) {
                  relatedProductsScrollRef.current.scrollBy({ left: 400, behavior: 'smooth' });
                }
              }}
              className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-white border border-gray-300 rounded-full p-2 shadow-lg hover:bg-gray-50 transition-colors"
            >
              <svg className="w-6 h-6 text-gray-900" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>

            {/* Scrollable Products Container */}
            <div
              ref={relatedProductsScrollRef}
              className="flex gap-6 overflow-x-auto scrollbar-hide scroll-smooth"
              style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            >
              {relatedProducts.map((item) => {
                const discount = item.discount_percentage || 
                  Math.round(((item.original_price - item.sale_price) / item.original_price) * 100);
                const imageUrl = item.image_url || (item.images && item.images.length > 0 ? item.images[0] : "");
                
                return (
                  <Link key={item.id} href={`/products/${item.id}`} className="group cursor-pointer flex-shrink-0 w-64">
                    <div className="relative aspect-square bg-gray-100 rounded-lg overflow-hidden mb-3">
                      {imageUrl ? (
                        <Image
                          src={imageUrl}
                          alt={item.name}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform duration-500"
                          unoptimized
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <div className="text-4xl">👕</div>
                        </div>
                      )}
                      {discount > 0 && (
                        <div className="absolute top-2 left-2 z-10">
                          <span className="bg-red-500 text-white text-xs font-bold px-2 py-1 rounded">
                            -{discount}%
                          </span>
                        </div>
                      )}
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm font-medium text-gray-600">{item.brand}</p>
                      <p className="text-sm text-gray-900 line-clamp-2">{item.name}</p>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-gray-900">
                          ${item.sale_price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </span>
                        {item.original_price > item.sale_price && (
                          <span className="text-xs text-gray-400 line-through">
                            ${item.original_price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </span>
                        )}
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        ) : (
          <p className="text-gray-600 text-center py-8">No related products found.</p>
        )}
      </section>

      {/* Popular This Week Section */}
      <section className="w-full px-6 sm:px-8 lg:px-12 xl:px-16 2xl:px-24 py-12 border-t border-gray-200 relative">
        <h2 className="text-2xl font-bold text-gray-900 mb-8">Popular This Week</h2>
        {loadingPopular ? (
          <div className="flex gap-6 overflow-x-auto scrollbar-hide">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((item) => (
              <div key={item} className="animate-pulse flex-shrink-0 w-64">
                <div className="relative aspect-square bg-gray-200 rounded-lg mb-3"></div>
                <div className="space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/3"></div>
                </div>
              </div>
            ))}
          </div>
        ) : popularProducts.length > 0 ? (
          <div className="relative">
            {/* Left Arrow Button */}
            <button
              onClick={() => {
                if (popularProductsScrollRef.current) {
                  popularProductsScrollRef.current.scrollBy({ left: -400, behavior: 'smooth' });
                }
              }}
              className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-white border border-gray-300 rounded-full p-2 shadow-lg hover:bg-gray-50 transition-colors"
            >
              <svg className="w-6 h-6 text-gray-900" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>

            {/* Right Arrow Button */}
            <button
              onClick={() => {
                if (popularProductsScrollRef.current) {
                  popularProductsScrollRef.current.scrollBy({ left: 400, behavior: 'smooth' });
                }
              }}
              className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-white border border-gray-300 rounded-full p-2 shadow-lg hover:bg-gray-50 transition-colors"
            >
              <svg className="w-6 h-6 text-gray-900" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>

            {/* Scrollable Products Container */}
            <div
              ref={popularProductsScrollRef}
              className="flex gap-6 overflow-x-auto scrollbar-hide scroll-smooth"
              style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            >
              {popularProducts.map((item) => {
                const discount = item.discount_percentage || 
                  Math.round(((item.original_price - item.sale_price) / item.original_price) * 100);
                const imageUrl = item.image_url || (item.images && item.images.length > 0 ? item.images[0] : "");
                
                return (
                  <Link key={item.id} href={`/products/${item.id}`} className="group cursor-pointer flex-shrink-0 w-64">
                    <div className="relative aspect-square bg-gray-100 rounded-lg overflow-hidden mb-3">
                      {imageUrl ? (
                        <Image
                          src={imageUrl}
                          alt={item.name}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform duration-500"
                          unoptimized
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <div className="text-4xl">👕</div>
                        </div>
                      )}
                      {discount > 0 && (
                        <div className="absolute top-2 left-2 z-10">
                          <span className="bg-red-500 text-white text-xs font-bold px-2 py-1 rounded">
                            -{discount}%
                          </span>
                        </div>
                      )}
                      {item.is_new_arrival && !discount && (
                        <div className="absolute top-2 right-2 z-10">
                          <span className="bg-red-500 text-white text-xs font-bold px-2 py-1 rounded">
                            New
                          </span>
                        </div>
                      )}
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm font-medium text-gray-600">{item.brand}</p>
                      <p className="text-sm text-gray-900 line-clamp-2">{item.name}</p>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-gray-900">
                          ${item.sale_price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </span>
                        {item.original_price > item.sale_price && (
                          <span className="text-xs text-gray-400 line-through">
                            ${item.original_price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </span>
                        )}
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        ) : (
          <p className="text-gray-600 text-center py-8">No popular products found.</p>
        )}
      </section>

      {/* Footer */}
      <Footer />
    </main>
  );
}

