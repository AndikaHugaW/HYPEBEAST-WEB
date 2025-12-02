"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import Footer from "@/components/Footer";

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

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [selectedColor, setSelectedColor] = useState<string>("");
  const [selectedSize, setSelectedSize] = useState<string>("");
  const [activeTab, setActiveTab] = useState<"details" | "reviews" | "discussion">("reviews");
  const [sortReviews, setSortReviews] = useState<string>("newest");
  
  // Helper function to add cache buster to image URLs for real-time updates
  const addCacheBuster = (url: string) => {
    if (!url) return url;
    const separator = url.includes('?') ? '&' : '?';
    return `${url}${separator}t=${Date.now()}`;
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
    const fetchProduct = async () => {
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

        setProduct({
          ...data,
          images: images,
        });
        
        // Ensure selectedImageIndex starts at 0 (same as card which uses images[0])
        setSelectedImageIndex(0);
        
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
        setLoading(false);
      }
    };

    if (productId) {
      // Initial fetch
      fetchProduct();
      
      // Poll for updates every 2 seconds to show new images in real-time
      // This ensures when admin uploads new images, they appear immediately on detail page
      const interval = setInterval(() => {
        fetchProduct();
      }, 2000);
      
      return () => clearInterval(interval);
    }
  }, [productId]);

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
  
  // Use images array from product, EXACTLY same as card products
  // Card products transform: image_url = (product.images && product.images.length > 0) ? product.images[0] : product.image_url
  // So card always uses product.images[0] if available
  // Ensure images is always an array
  let displayImages: string[] = [];
  if (product.images) {
    if (Array.isArray(product.images)) {
      displayImages = product.images.filter((img: any) => img && img.trim && img.trim() !== "");
    } else if (typeof product.images === 'string') {
      try {
        const parsed = JSON.parse(product.images);
        displayImages = Array.isArray(parsed) ? parsed.filter((img: any) => img && img.trim && img.trim() !== "") : [];
      } catch (e) {
        displayImages = [product.images].filter((img: any) => img && img.trim && img.trim() !== "");
      }
    }
  }
  
  // Main image: Use images[0] as default (same as card), or selected thumbnail
  // CRITICAL: Card uses product.images[0] as the main image
  // Detail page MUST use the same images[0] as default to match card
  // Only change when user clicks a different thumbnail
  // Add cache buster to ensure real-time updates
  const mainImage = displayImages.length > 0
    ? (selectedImageIndex > 0 && selectedImageIndex < displayImages.length 
        ? addCacheBuster(displayImages[selectedImageIndex])
        : addCacheBuster(displayImages[0])) // Always default to images[0] - this is what card shows
    : "";
  
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
            {/* Main Image */}
            <div className="relative aspect-square bg-gray-100 rounded-lg overflow-hidden mb-4">
              {mainImage ? (
                <Image
                  src={mainImage}
                  alt={product.name}
                  fill
                  className="object-cover"
                  unoptimized
                  priority
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <div className="text-6xl">👕</div>
                </div>
              )}
            </div>

            {/* Thumbnail Images - Display up to 4 images from product.images array */}
            {displayImages.length > 0 ? (
              <div className="grid grid-cols-4 gap-2">
                {displayImages.slice(0, 4).map((image, index) => (
                  <button
                    key={`${image}-${index}`}
                    onClick={() => setSelectedImageIndex(index)}
                    className={`relative aspect-square rounded-lg overflow-hidden border-2 transition-all ${
                      selectedImageIndex === index
                        ? "border-black ring-2 ring-black ring-offset-2"
                        : "border-gray-200 hover:border-gray-400"
                    }`}
                  >
                    <Image
                      key={`thumb-${image}-${index}`}
                      src={addCacheBuster(image)}
                      alt={`${product.name} view ${index + 1}`}
                      fill
                      className="object-cover"
                      unoptimized
                    />
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
              <button className="flex-1 bg-black text-white py-3 px-6 rounded-lg font-semibold hover:bg-gray-800 transition-colors">
                Add to cart
              </button>
              <button className="p-3 border-2 border-gray-300 rounded-lg hover:border-gray-400 transition-colors">
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

