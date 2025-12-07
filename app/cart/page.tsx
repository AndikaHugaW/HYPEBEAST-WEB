"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import Footer from "@/components/Footer";
import DiscountModal from "@/components/DiscountModal";
import { useAuth } from "@/hooks/useAuth";
import { createUserClient } from "@/lib/supabase";

type CartItem = {
  id: string;
  productId: string;
  name: string;
  brand: string;
  price: number;
  originalPrice?: number;
  image: string;
  quantity: number;
  size?: string;
  color?: string;
};

export default function Cart() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [isFetching, setIsFetching] = useState(false);
  const [sessionToken, setSessionToken] = useState<string | null>(null);
  const [isClient, setIsClient] = useState(false);
  const [showDiscountModal, setShowDiscountModal] = useState(false);
  const [selectedDiscount, setSelectedDiscount] = useState<{
    id: string;
    code: string;
    name: string;
    type: "percentage" | "fixed";
    value: number;
    minPurchase?: number;
    maxDiscount?: number;
    startDate: string;
    endDate: string;
    usageLimit?: number;
    usedCount: number;
    status: "active" | "inactive" | "expired";
  } | null>(null);

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

  // Fetch cart items from API
  const fetchCartItems = useCallback(async (isInitialLoad: boolean = false) => {
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
      const response = await fetch("/api/cart", {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        cache: 'no-store',
      });

      if (response.ok) {
        const result = await response.json();
        setCartItems(result.data || []);
      } else if (response.status === 401) {
        // Token expired, clear cache and redirect
        setSessionToken(null);
        router.push("/sign-in");
      }
    } catch (error) {
      console.error("Error fetching cart:", error);
    } finally {
      setIsFetching(false);
      if (isInitialLoad) setLoading(false);
    }
  }, [user, sessionToken, isFetching, router]);

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (!authLoading && user) {
      // Initial fetch
      fetchCartItems(true);
      
      // Poll for updates every 10 seconds (reduced frequency)
      const interval = setInterval(() => {
        fetchCartItems(false);
      }, 10000);
      
      return () => clearInterval(interval);
    } else if (!authLoading && !user) {
      setLoading(false);
    }
  }, [user, authLoading, fetchCartItems]);

  const updateQuantity = async (id: string, newQuantity: number) => {
    if (newQuantity < 1) return;

    // Optimistically update UI first
    setCartItems((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, quantity: newQuantity } : item
      )
    );

    try {
      const token = sessionToken || (await createUserClient().auth.getSession()).data.session?.access_token;
      if (!token) {
        router.push("/sign-in");
        return;
      }

      const response = await fetch("/api/cart", {
        method: "PUT",
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ id, quantity: newQuantity }),
      });

      if (!response.ok) {
        // Revert on error
        fetchCartItems(false);
      }
    } catch (error) {
      console.error("Error updating quantity:", error);
      fetchCartItems(false);
    }
  };

  const removeFromCart = async (id: string) => {
    // Optimistically update UI first
    setCartItems((prev) => prev.filter((item) => item.id !== id));

    try {
      const token = sessionToken || (await createUserClient().auth.getSession()).data.session?.access_token;
      if (!token) {
        router.push("/sign-in");
        return;
      }

      const response = await fetch(`/api/cart?id=${id}`, {
        method: "DELETE",
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        // Revert on error
        fetchCartItems(false);
      }
    } catch (error) {
      console.error("Error removing item:", error);
      fetchCartItems(false);
    }
  };

  const subtotal = cartItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );
  const shipping = subtotal > 0 ? 10 : 0;
  
  // Calculate discount
  const calculateDiscountAmount = () => {
    if (!selectedDiscount) return 0;
    
    // Check minimum purchase requirement
    if (selectedDiscount.minPurchase && subtotal < selectedDiscount.minPurchase) {
      return 0;
    }
    
    let discountAmount = 0;
    if (selectedDiscount.type === "percentage") {
      discountAmount = (subtotal * selectedDiscount.value) / 100;
      if (selectedDiscount.maxDiscount && discountAmount > selectedDiscount.maxDiscount) {
        discountAmount = selectedDiscount.maxDiscount;
      }
    } else {
      discountAmount = selectedDiscount.value;
    }
    
    return discountAmount;
  };
  
  const discountAmount = calculateDiscountAmount();
  const total = subtotal + shipping - discountAmount;

  return (
    <main className="min-h-screen bg-white">
      {/* Header */}
      <div className="w-full px-6 sm:px-8 lg:px-12 xl:px-16 2xl:px-24 py-8 border-b border-gray-200">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl font-normal text-gray-900 mb-2">Shopping Cart</h1>
          <p className="text-sm text-gray-600 font-normal">
            {cartItems.length} item{cartItems.length !== 1 ? "s" : ""} in your cart
          </p>
        </div>
      </div>

      <div className="w-full px-6 sm:px-8 lg:px-12 xl:px-16 2xl:px-24 py-8">
        <div className="max-w-7xl mx-auto">
          {loading || authLoading ? (
            <div className="space-y-4">
              {/* Skeleton Loading */}
              {[1, 2].map((i) => (
                <div key={i} className="flex gap-4 border border-gray-200 rounded-lg p-4 animate-pulse">
                  <div className="w-24 h-24 sm:w-32 sm:h-32 bg-gray-200 rounded-lg flex-shrink-0"></div>
                  <div className="flex-1 space-y-3">
                    <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                    <div className="h-5 bg-gray-200 rounded w-3/4"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                    <div className="h-6 bg-gray-200 rounded w-1/6"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : !user ? (
            <div className="text-center py-16">
              <p className="text-gray-600 font-normal mb-4">Please sign in to view your cart</p>
              <Link
                href="/sign-in"
                className="inline-block px-6 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors font-normal"
              >
                Sign In
              </Link>
            </div>
          ) : cartItems.length === 0 ? (
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
                  d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
                />
              </svg>
              <p className="text-gray-600 font-normal mb-4">Your cart is empty</p>
              <Link
                href="/products"
                className="inline-block px-6 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors font-normal"
              >
                Start Shopping
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Cart Items */}
              <div className="lg:col-span-2 space-y-4">
                {cartItems.map((item) => (
                  <div
                    key={item.id}
                    className="flex gap-4 border border-gray-200 rounded-lg p-4"
                  >
                    <Link href={`/products/${item.productId}`}>
                      <div className="relative w-24 h-24 sm:w-32 sm:h-32 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
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
                      </div>
                    </Link>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start gap-4">
                        <div className="flex-1">
                          <p className="text-xs font-medium text-gray-600 uppercase mb-1">
                            {item.brand}
                          </p>
                          <Link href={`/products/${item.productId}`}>
                            <h3 className="text-sm font-medium text-gray-900 mb-2 hover:underline">
                              {item.name}
                            </h3>
                          </Link>
                          <div className="flex flex-wrap gap-4 text-xs text-gray-600 font-normal mb-2">
                            {item.size && <span>Size: {item.size}</span>}
                            {item.color && <span>Color: {item.color}</span>}
                          </div>
                          <div className="flex items-center gap-2">
                            {item.originalPrice && (
                              <span className="text-sm text-gray-400 line-through font-normal">
                                ${formatPrice(item.originalPrice)}
                              </span>
                            )}
                            <span className="text-base font-bold text-gray-900">
                              ${formatPrice(item.price)}
                            </span>
                          </div>
                        </div>
                        <button
                          onClick={() => removeFromCart(item.id)}
                          className="text-gray-400 hover:text-red-600 transition-colors flex-shrink-0"
                          title="Remove item"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                      
                      <div className="flex items-center gap-4 mt-4">
                        <div className="flex items-center border border-gray-300 rounded-lg">
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            className="px-3 py-1 hover:bg-gray-100 transition-colors"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                            </svg>
                          </button>
                          <span className="px-4 py-1 text-sm font-normal text-gray-900 min-w-[3rem] text-center">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            className="px-3 py-1 hover:bg-gray-100 transition-colors"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                            </svg>
                          </button>
                        </div>
                        <div className="text-sm font-bold text-gray-900">
                          ${formatPrice(item.price * item.quantity)}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Order Summary */}
              <div className="lg:col-span-1">
                <div className="border border-gray-200 rounded-lg p-6 sticky top-4">
                  <h2 className="text-lg font-bold text-gray-900 mb-4">Order Summary</h2>
                  <div className="space-y-3 mb-6">
                    <div className="flex justify-between text-sm font-normal text-gray-600">
                      <span>Subtotal</span>
                      <span>${formatPrice(subtotal)}</span>
                    </div>
                    <div className="flex justify-between text-sm font-normal text-gray-600">
                      <span>Shipping</span>
                      <span>{shipping > 0 ? `$${formatPrice(shipping)}` : "Free"}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setShowDiscountModal(true)}
                      className="w-full text-left border border-gray-300 text-gray-900 py-2 px-4 rounded-lg font-normal hover:bg-gray-50 transition-colors text-sm"
                    >
                      {selectedDiscount ? selectedDiscount.code : "Add Discount"}
                    </button>
                    {selectedDiscount && discountAmount > 0 && (
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-gray-600">Discount ({selectedDiscount.code})</span>
                        <div className="flex items-center gap-2">
                          <span className="text-green-600 font-medium">
                            -${formatPrice(discountAmount)}
                          </span>
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedDiscount(null);
                              // Update localStorage when discount is removed
                              try {
                                localStorage.setItem('checkout_cart_items', JSON.stringify(cartItems));
                                localStorage.setItem('checkout_timestamp', Date.now().toString());
                                localStorage.removeItem('checkout_discount');
                              } catch (error) {
                                console.error('Error updating localStorage:', error);
                              }
                            }}
                            className="text-gray-400 hover:text-red-600 transition-colors"
                            title="Remove discount"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        </div>
                      </div>
                    )}
                    <div className="border-t border-gray-200 pt-3">
                      <div className="flex justify-between text-base font-bold text-gray-900">
                        <span>Total</span>
                        <span>${formatPrice(total)}</span>
                      </div>
                    </div>
                  </div>
                  <Link
                    href="/checkout"
                    onClick={() => {
                      // Update localStorage with latest data (non-blocking)
                      try {
                        localStorage.setItem('checkout_cart_items', JSON.stringify(cartItems));
                        localStorage.setItem('checkout_timestamp', Date.now().toString());
                        if (selectedDiscount) {
                          localStorage.setItem('checkout_discount', JSON.stringify(selectedDiscount));
                        } else {
                          localStorage.removeItem('checkout_discount');
                        }
                      } catch (error) {
                        console.error('Error saving cart to localStorage:', error);
                      }
                    }}
                    prefetch={true}
                    className="w-full text-center bg-black text-white py-3 px-6 rounded-lg font-medium hover:bg-gray-800 transition-colors mb-4 cursor-pointer inline-block"
                  >
                    Proceed to Checkout
                  </Link>
                  <Link
                    href="/products"
                    prefetch={true}
                    className="w-full text-center border border-gray-300 text-gray-900 py-3 px-6 rounded-lg font-normal hover:bg-gray-50 transition-colors cursor-pointer inline-block"
                  >
                    Continue Shopping
                  </Link>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <DiscountModal
        isOpen={showDiscountModal}
        onClose={() => setShowDiscountModal(false)}
        onSelectDiscount={(discount) => {
          setSelectedDiscount(discount);
          setShowDiscountModal(false);
          // Save to localStorage immediately for faster checkout
          try {
            localStorage.setItem('checkout_cart_items', JSON.stringify(cartItems));
            localStorage.setItem('checkout_timestamp', Date.now().toString());
            localStorage.setItem('checkout_discount', JSON.stringify(discount));
          } catch (error) {
            console.error('Error saving to localStorage:', error);
          }
        }}
        selectedDiscount={selectedDiscount}
        subtotal={subtotal}
      />
      <Footer />
    </main>
  );
}

