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
    average: 4.8,
    total: 42,
    distribution: {
      5: 28,
      4: 9,
      3: 4,
      2: 1,
      1: 1,
    },
  };

  useEffect(() => {
    const fetchProduct = async (isInitialLoad: boolean = false) => {
      try {
        // Add cache buster to force fresh data fetch for real-time updates
        const response = await fetch(`/api/products/${productId}?t=${Date.now()}`);
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
  
  const availableColors = ["White", "Grey", "Black"]; // Mock colors - should come from product data
  const availableSizes = product.size || ["40.5", "41", "42", "43", "43.5", "44", "44.5", "45", "46"];
  
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
                <span className="text-sm font-bold text-gray-900">{product.brand}</span>
              </div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-3">
                {product.name}
              </h1>
            </div>

            {/* Rating */}
            <div className="flex items-center gap-2 mb-4">
              <div className="flex items-center">
                {[1, 2, 3, 4, 5].map((star) => (
                  <svg
                    key={star}
                    className="w-5 h-5 text-yellow-400"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>
              <span className="text-sm text-gray-600">{ratingSummary.total} reviews</span>
            </div>

            {/* Price */}
            <div className="mb-6">
              <span className="text-3xl font-bold text-gray-900">
                ${product.sale_price.toLocaleString()}
              </span>
              {product.original_price > product.sale_price && (
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-lg text-gray-400 line-through">
                    ${product.original_price.toLocaleString()}
                  </span>
                  {discount > 0 && (
                    <span className="text-sm font-bold text-red-600 bg-red-50 px-2 py-1 rounded">
                      -{discount}%
                    </span>
                  )}
                </div>
              )}
            </div>

            {/* Color Selection */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-900 mb-2">
                Color: <span className="font-normal text-gray-600">{selectedColor || "White"}</span>
              </label>
              <div className="flex gap-2">
                {availableColors.map((color) => (
                  <button
                    key={color}
                    onClick={() => setSelectedColor(color)}
                    className={`w-12 h-12 rounded-lg border-2 transition-all ${
                      selectedColor === color
                        ? "border-black ring-2 ring-black ring-offset-2"
                        : "border-gray-300 hover:border-gray-400"
                    }`}
                    style={{
                      backgroundColor: color === "White" ? "#ffffff" : color === "Grey" ? "#9ca3af" : "#000000",
                    }}
                    title={color}
                  />
                ))}
              </div>
            </div>

            {/* Size Selection */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-medium text-gray-900">
                  Size: <span className="font-normal text-gray-600">EU Men</span>
                </label>
                <Link href="#" className="text-sm text-gray-600 hover:text-gray-900 underline">
                  Size guide
                </Link>
              </div>
              <div className="grid grid-cols-5 gap-2">
                {availableSizes.map((size) => (
                  <button
                    key={size}
                    onClick={() => setSelectedSize(size)}
                    className={`py-2 px-3 rounded-lg border-2 text-sm font-medium transition-all ${
                      selectedSize === size
                        ? "border-black bg-black text-white"
                        : "border-gray-300 text-gray-900 hover:border-gray-400"
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>

            {/* Add to Cart Button */}
            <div className="flex items-center gap-3 mb-4">
              <button 
                onClick={handleAddToCart}
                disabled={addingToCart}
                className="flex-1 bg-black text-white py-3 px-6 rounded-lg font-semibold hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {addingToCart ? "Adding..." : "Add to cart"}
              </button>
              <button 
                onClick={handleAddToWishlist}
                disabled={addingToWishlist}
                className="p-3 border-2 border-gray-300 rounded-lg hover:border-gray-400 transition-colors disabled:opacity-50"
                title="Add to wishlist"
              >
                <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
              </button>
            </div>

            {/* Delivery Information */}
            <p className="text-sm text-gray-600">
              Free delivery on orders over $30.0
            </p>
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
                            <button className="text-sm text-gray-600 hover:text-gray-900">
                              Reply
                            </button>
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

          {/* Right Column - Review Summary */}
          {activeTab === "reviews" && (
            <div className="lg:col-span-1">
              <div className="bg-gray-50 rounded-lg p-6">
                {/* Overall Rating */}
                <div className="text-center mb-6">
                  <div className="text-5xl font-bold text-gray-900 mb-2">
                    {ratingSummary.average}
                  </div>
                  <div className="flex items-center justify-center mb-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <svg
                        key={star}
                        className="w-6 h-6 text-yellow-400"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    ))}
                  </div>
                  <p className="text-sm text-gray-600">{ratingSummary.total} reviews</p>
                </div>

                {/* Rating Distribution */}
                <div className="space-y-2">
                  {[5, 4, 3, 2, 1].map((rating) => {
                    const count = ratingSummary.distribution[rating as keyof typeof ratingSummary.distribution] || 0;
                    const percentage = ratingSummary.total > 0 ? (count / ratingSummary.total) * 100 : 0;
                    
                    return (
                      <div key={rating} className="flex items-center gap-2">
                        <span className="text-sm text-gray-600 w-8">{rating}</span>
                        <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-yellow-400 rounded-full"
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                        <span className="text-sm text-gray-600 w-8 text-right">{count}</span>
                      </div>
                    );
                  })}
                </div>

                {/* Advertisement */}
                <div className="mt-6 p-4 bg-white rounded-lg border border-gray-200">
                  <p className="text-sm font-medium text-gray-900">
                    Popular brands with discounts over 25%
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Footer */}
      <Footer />
    </main>
  );
}

