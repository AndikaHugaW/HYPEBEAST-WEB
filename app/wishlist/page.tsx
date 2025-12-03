"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import Footer from "@/components/Footer";
import { useAuth } from "@/hooks/useAuth";
import { createUserClient } from "@/lib/supabase";

type WishlistItem = {
  id: string;
  productId: string;
  name: string;
  brand: string;
  price: number;
  originalPrice?: number;
  image: string;
  inStock: boolean;
};

export default function Wishlist() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [wishlistItems, setWishlistItems] = useState<WishlistItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [isFetching, setIsFetching] = useState(false);
  const [sessionToken, setSessionToken] = useState<string | null>(null);

  // Format price consistently to avoid hydration mismatch
  // Use simple format without locale-specific formatting
  const formatPrice = (price: number): string => {
    // Always use dot as decimal separator and comma as thousand separator
    // This ensures consistency between server and client
    const formatted = price.toFixed(2);
    const parts = formatted.split('.');
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    return parts.join('.');
  };

  // Cache session token to avoid repeated calls
  useEffect(() => {
    if (user && !sessionToken) {
      const getSession = async () => {
        try {
          const supabase = createUserClient();
          const { data: { session } } = await supabase.auth.getSession();
          if (session) {
            setSessionToken(session.access_token);
          }
        } catch (error) {
          console.error("Error getting session:", error);
        }
      };
      getSession();
    }
  }, [user, sessionToken]);

  // Fetch wishlist items from API
  const fetchWishlistItems = useCallback(async (isInitialLoad: boolean = false) => {
    if (!user) {
      if (isInitialLoad) setLoading(false);
      return;
    }

    // Prevent duplicate requests
    if (isFetching && !isInitialLoad) {
      return;
    }

    // Use cached token or get new one
    let token = sessionToken;
    if (!token) {
      try {
        const supabase = createUserClient();
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
          if (isInitialLoad) setLoading(false);
          router.push("/sign-in");
          return;
        }
        token = session.access_token;
        setSessionToken(token);
      } catch (error) {
        if (isInitialLoad) setLoading(false);
        return;
      }
    }

    setIsFetching(true);
    try {
      const response = await fetch("/api/wishlist", {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        cache: 'no-store',
      });

      if (response.ok) {
        const result = await response.json();
        setWishlistItems(result.data || []);
      } else if (response.status === 401) {
        // Token expired, clear cache and redirect
        setSessionToken(null);
        router.push("/sign-in");
      }
    } catch (error) {
      console.error("Error fetching wishlist:", error);
    } finally {
      setIsFetching(false);
      if (isInitialLoad) setLoading(false);
    }
  }, [user, sessionToken, router]);

  useEffect(() => {
    if (authLoading) return; // Wait for auth to finish loading
    
    if (user) {
      // Initial fetch
      fetchWishlistItems(true);
      
      // Poll for updates every 10 seconds (reduced frequency)
      const interval = setInterval(() => {
        fetchWishlistItems(false);
      }, 10000);
      
      return () => clearInterval(interval);
    } else {
      // User not logged in
      setLoading(false);
      setWishlistItems([]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, authLoading]);

  const removeFromWishlist = async (id: string) => {
    // Optimistically update UI first
    setWishlistItems((prev) => prev.filter((item) => item.id !== id));

    try {
      const token = sessionToken || (await createUserClient().auth.getSession()).data.session?.access_token;
      if (!token) {
        router.push("/sign-in");
        return;
      }

      const response = await fetch(`/api/wishlist?id=${id}`, {
        method: "DELETE",
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        // Revert on error
        fetchWishlistItems(false);
      }
    } catch (error) {
      console.error("Error removing item:", error);
      fetchWishlistItems(false);
    }
  };

  const moveToCart = async (item: WishlistItem) => {
    try {
      const supabase = createUserClient();
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError || !session) {
        router.push("/sign-in");
        return;
      }

      // Add to cart
      const response = await fetch("/api/cart", {
        method: "POST",
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          productId: item.productId,
          quantity: 1,
        }),
      });

      if (response.ok) {
        alert(`${item.name} added to cart!`);
      } else {
        const errorData = await response.json();
        alert(errorData.error?.message || "Failed to add to cart");
      }
    } catch (error) {
      console.error("Error adding to cart:", error);
      alert("Failed to add to cart");
    }
  };

  return (
    <main className="min-h-screen bg-white">
      {/* Header */}
      <div className="w-full px-6 sm:px-8 lg:px-12 xl:px-16 2xl:px-24 py-8 border-b border-gray-200">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">My Wishlist</h1>
          <p className="text-sm text-gray-600 font-normal">
            {wishlistItems.length} item{wishlistItems.length !== 1 ? "s" : ""} saved
          </p>
        </div>
      </div>

      {/* Wishlist Items */}
      <div className="w-full px-6 sm:px-8 lg:px-12 xl:px-16 2xl:px-24 py-8">
        <div className="max-w-7xl mx-auto">
          {loading || authLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {/* Skeleton Loading */}
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="border border-gray-200 rounded-lg overflow-hidden animate-pulse">
                  <div className="aspect-square bg-gray-200"></div>
                  <div className="p-4 space-y-3">
                    <div className="h-3 bg-gray-200 rounded w-1/4"></div>
                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                    <div className="h-5 bg-gray-200 rounded w-1/2"></div>
                    <div className="h-9 bg-gray-200 rounded"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : !user ? (
            <div className="text-center py-16">
              <p className="text-gray-600 font-normal mb-4">Please sign in to view your wishlist</p>
              <Link
                href="/sign-in"
                className="inline-block px-6 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors font-normal"
              >
                Sign In
              </Link>
            </div>
          ) : wishlistItems.length === 0 ? (
            <div className="text-center py-16">
              <svg
                className="w-16 h-16 text-gray-400 mx-auto mb-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                />
              </svg>
              <p className="text-gray-600 font-normal mb-4">Your wishlist is empty</p>
              <Link
                href="/products"
                className="inline-block px-6 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors font-normal"
              >
                Start Shopping
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {wishlistItems.map((item) => (
                <div
                  key={item.id}
                  className="group relative border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition-shadow"
                >
                  <Link href={`/products/${item.productId}`}>
                    <div className="relative aspect-square bg-gray-100">
                      <Image
                        src={item.image}
                        alt={item.name}
                        fill
                        className="object-cover"
                        unoptimized
                        loading="lazy"
                        placeholder="blur"
                        blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAAIAAoDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWEREiMxUf/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R//2Q=="
                      />
                      {!item.inStock && (
                        <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                          <span className="bg-white text-black px-4 py-2 rounded text-sm font-medium">
                            Out of Stock
                          </span>
                        </div>
                      )}
                    </div>
                  </Link>
                  
                  <div className="p-4">
                    <p className="text-xs font-medium text-gray-600 uppercase mb-1">
                      {item.brand}
                    </p>
                    <Link href={`/products/${item.productId}`}>
                      <h3 className="text-sm font-medium text-gray-900 mb-2 line-clamp-2 hover:underline">
                        {item.name}
                      </h3>
                    </Link>
                    <div className="flex items-center gap-2 mb-4">
                      {item.originalPrice && (
                        <span className="text-sm text-gray-400 line-through font-normal">
                          ${formatPrice(item.originalPrice)}
                        </span>
                      )}
                      <span className="text-base font-bold text-gray-900">
                        ${formatPrice(item.price)}
                      </span>
                    </div>
                    
                    <div className="flex gap-2">
                      <button
                        onClick={() => moveToCart(item)}
                        disabled={!item.inStock}
                        className={`flex-1 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                          item.inStock
                            ? "bg-black text-white hover:bg-gray-800"
                            : "bg-gray-200 text-gray-400 cursor-not-allowed"
                        }`}
                      >
                        Add to Cart
                      </button>
                      <button
                        onClick={() => removeFromWishlist(item.id)}
                        className="p-2 border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors"
                        title="Remove from wishlist"
                      >
                        <svg
                          className="w-5 h-5 text-gray-600"
                          fill="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <Footer />
    </main>
  );
}

