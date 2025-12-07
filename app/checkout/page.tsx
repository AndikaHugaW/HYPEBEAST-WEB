"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import Footer from "@/components/Footer";
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

export default function Checkout() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [sessionToken, setSessionToken] = useState<string | null>(null);

  // Form state
  const [shippingInfo, setShippingInfo] = useState({
    fullName: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    postalCode: "",
    country: "",
  });

  const [paymentMethod, setPaymentMethod] = useState("credit-card");
  const [cardInfo, setCardInfo] = useState({
    cardNumber: "",
    cardName: "",
    expiryDate: "",
    cvv: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
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

  // Format price consistently
  const formatPrice = (price: number): string => {
    const formatted = price.toFixed(2);
    const parts = formatted.split('.');
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    return parts.join('.');
  };

  const [hasInitialCache, setHasInitialCache] = useState(false);

  // Load cart items and discount from localStorage first for instant display
  useEffect(() => {
    try {
      const cachedCartItems = localStorage.getItem('checkout_cart_items');
      const cachedTimestamp = localStorage.getItem('checkout_timestamp');
      const cachedDiscount = localStorage.getItem('checkout_discount');
      
      if (cachedCartItems && cachedTimestamp) {
        const timestamp = parseInt(cachedTimestamp, 10);
        const now = Date.now();
        // Use cached data if less than 5 minutes old
        if (now - timestamp < 5 * 60 * 1000) {
          const items = JSON.parse(cachedCartItems);
          if (Array.isArray(items) && items.length > 0) {
            setCartItems(items);
            setHasInitialCache(true);
            setLoading(false); // Stop loading immediately with cached data
            
            // Load discount if available
            if (cachedDiscount) {
              try {
                const discount = JSON.parse(cachedDiscount);
                setSelectedDiscount(discount);
              } catch (error) {
                console.error("Error parsing discount:", error);
              }
            }
            
            return; // Early return if we have cached data
          }
        }
      }
      // If no valid cache, keep loading state true to wait for API fetch
      setHasInitialCache(false);
    } catch (error) {
      console.error("Error loading cached cart:", error);
      setHasInitialCache(false);
    }
  }, []);

  // Fetch cart items from API (sync in background)
  const fetchCartItems = useCallback(async (skipLoading = false) => {
    if (!user) {
      if (!skipLoading) {
        setLoading(false);
      }
      return;
    }

    try {
      let token = sessionToken;
      if (!token) {
        const supabase = createUserClient();
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
          if (!skipLoading) {
            setLoading(false);
            router.push("/sign-in");
          }
          return;
        }
        token = session.access_token;
        setSessionToken(token);
      }

      const response = await fetch("/api/cart", {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        cache: 'no-store',
      });

      if (response.ok) {
        const result = await response.json();
        const apiCartItems = result.data || [];
        
        // Always update with API data for consistency
        setCartItems(apiCartItems);
        
        // Update localStorage with fresh data
        try {
          if (apiCartItems.length > 0) {
            localStorage.setItem('checkout_cart_items', JSON.stringify(apiCartItems));
            localStorage.setItem('checkout_timestamp', Date.now().toString());
          } else {
            // Clear cache if cart is empty
            localStorage.removeItem('checkout_cart_items');
            localStorage.removeItem('checkout_timestamp');
          }
        } catch (error) {
          console.error('Error updating localStorage:', error);
        }
        
        // Pre-fill email if available
        if (user.email) {
          setShippingInfo(prev => {
            if (!prev.email) {
              return { ...prev, email: user.email || "" };
            }
            return prev;
          });
        }
      } else if (response.status === 401) {
        if (!skipLoading) {
          setLoading(false);
          router.push("/sign-in");
        }
      }
    } catch (error) {
      console.error("Error fetching cart:", error);
      // Don't clear cart items on error, keep cached version
    } finally {
      if (!skipLoading) {
        setLoading(false);
      }
    }
  }, [user, sessionToken, router]);

  useEffect(() => {
    if (!authLoading) {
      if (user) {
        // Fetch from API in background to sync with server
        // Skip loading state update if we already have cached items
        fetchCartItems(hasInitialCache);
      } else {
        // Only redirect if we don't have cached cart items
        if (!hasInitialCache) {
          setLoading(false);
          router.push("/sign-in");
        }
      }
    }
  }, [user, authLoading, fetchCartItems, hasInitialCache, router]);

  const subtotal = cartItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );
  const shipping = subtotal > 0 ? 10 : 0;
  const tax = subtotal * 0.1; // 10% tax
  
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
  const total = subtotal + shipping + tax - discountAmount;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    
    // Validate form
    if (!shippingInfo.fullName || !shippingInfo.email || !shippingInfo.phone || 
        !shippingInfo.address || !shippingInfo.city || !shippingInfo.postalCode || 
        !shippingInfo.country) {
      setError("Please fill in all shipping information");
      return;
    }

    if (paymentMethod === "credit-card") {
      if (!cardInfo.cardNumber || !cardInfo.cardName || !cardInfo.expiryDate || !cardInfo.cvv) {
        setError("Please fill in all payment information");
        return;
      }
    }

    if (cartItems.length === 0) {
      setError("Your cart is empty");
      return;
    }

    setIsSubmitting(true);

    try {
      // Get session token
      let token = sessionToken;
      if (!token) {
        const supabase = createUserClient();
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
          router.push("/sign-in");
          return;
        }
        token = session.access_token;
        setSessionToken(token);
      }

      // Calculate totals
      const subtotal = cartItems.reduce(
        (sum, item) => sum + item.price * item.quantity,
        0
      );
      const shippingCost = subtotal > 0 ? 10 : 0;
      const taxAmount = subtotal * 0.1;
      
      // Calculate discount
      let discountAmount = 0;
      if (selectedDiscount) {
        if (!selectedDiscount.minPurchase || subtotal >= selectedDiscount.minPurchase) {
          if (selectedDiscount.type === "percentage") {
            discountAmount = (subtotal * selectedDiscount.value) / 100;
            if (selectedDiscount.maxDiscount && discountAmount > selectedDiscount.maxDiscount) {
              discountAmount = selectedDiscount.maxDiscount;
            }
          } else {
            discountAmount = selectedDiscount.value;
          }
        }
      }
      
      const totalAmount = subtotal + shippingCost + taxAmount - discountAmount;

      // Create order
      const response = await fetch("/api/orders", {
        method: "POST",
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          shippingInfo,
          paymentMethod,
          cartItems,
          subtotal,
          shipping: shippingCost,
          tax: taxAmount,
          discount: discountAmount,
          discountCode: selectedDiscount?.code || null,
          discountId: selectedDiscount?.id || null,
          total: totalAmount,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error?.message || 'Failed to create order');
      }

      // Clear localStorage after successful order
      try {
        localStorage.removeItem('checkout_cart_items');
        localStorage.removeItem('checkout_timestamp');
        localStorage.removeItem('checkout_discount');
      } catch (error) {
        console.error('Error clearing localStorage:', error);
      }

      // Redirect to order confirmation page with order details
      router.push(`/order-confirmation?orderNumber=${result.data.orderNumber}&orderId=${result.data.orderId}`);
    } catch (err: any) {
      console.error("Error placing order:", err);
      setError(err.message || "Failed to place order. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Show loading only if we don't have cached cart items
  if ((loading || authLoading) && cartItems.length === 0) {
    return (
      <main className="min-h-screen bg-white">
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
        </div>
      </main>
    );
  }

  if (cartItems.length === 0) {
    return (
      <main className="min-h-screen bg-white">
        <div className="w-full px-6 sm:px-8 lg:px-12 xl:px-16 2xl:px-24 py-8">
          <div className="max-w-7xl mx-auto text-center py-16">
            <p className="text-gray-600 font-normal mb-4">Your cart is empty</p>
            <Link
              href="/products"
              className="inline-block px-6 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors font-normal"
            >
              Continue Shopping
            </Link>
          </div>
        </div>
        <Footer />
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-white">
      {/* Header */}
      <div className="w-full px-6 sm:px-8 lg:px-12 xl:px-16 2xl:px-24 py-8 border-b border-gray-200">
        <div className="max-w-7xl mx-auto">
          <Link href="/cart" className="text-gray-600 hover:text-gray-900 mb-4 inline-block">
            ← Back to Cart
          </Link>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Checkout</h1>
          <p className="text-sm text-gray-600 font-normal">
            Complete your order
          </p>
        </div>
      </div>

      <div className="w-full px-6 sm:px-8 lg:px-12 xl:px-16 2xl:px-24 py-8">
        <div className="max-w-7xl mx-auto">
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Left Column - Shipping & Payment */}
              <div className="lg:col-span-2 space-y-8">
                {/* Shipping Information */}
                <div className="border border-gray-200 rounded-lg p-6">
                  <h2 className="text-lg font-bold text-gray-900 mb-4">Shipping Information</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-900 mb-2">
                        Full Name *
                      </label>
                      <input
                        type="text"
                        required
                        value={shippingInfo.fullName}
                        onChange={(e) => setShippingInfo({ ...shippingInfo, fullName: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-900 mb-2">
                        Email *
                      </label>
                      <input
                        type="email"
                        required
                        value={shippingInfo.email}
                        onChange={(e) => setShippingInfo({ ...shippingInfo, email: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-900 mb-2">
                        Phone *
                      </label>
                      <input
                        type="tel"
                        required
                        value={shippingInfo.phone}
                        onChange={(e) => setShippingInfo({ ...shippingInfo, phone: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-900 mb-2">
                        Address *
                      </label>
                      <input
                        type="text"
                        required
                        value={shippingInfo.address}
                        onChange={(e) => setShippingInfo({ ...shippingInfo, address: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-900 mb-2">
                        City *
                      </label>
                      <input
                        type="text"
                        required
                        value={shippingInfo.city}
                        onChange={(e) => setShippingInfo({ ...shippingInfo, city: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-900 mb-2">
                        Postal Code *
                      </label>
                      <input
                        type="text"
                        required
                        value={shippingInfo.postalCode}
                        onChange={(e) => setShippingInfo({ ...shippingInfo, postalCode: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-900 mb-2">
                        Country *
                      </label>
                      <select
                        required
                        value={shippingInfo.country}
                        onChange={(e) => setShippingInfo({ ...shippingInfo, country: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                      >
                        <option value="">Select a country</option>
                        <option value="US">United States</option>
                        <option value="ID">Indonesia</option>
                        <option value="SG">Singapore</option>
                        <option value="MY">Malaysia</option>
                        <option value="TH">Thailand</option>
                        <option value="PH">Philippines</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Payment Method */}
                <div className="border border-gray-200 rounded-lg p-6">
                  <h2 className="text-lg font-bold text-gray-900 mb-4">Payment Method</h2>
                  <div className="space-y-4">
                    <label className="flex items-center p-4 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50">
                      <input
                        type="radio"
                        name="payment"
                        value="credit-card"
                        checked={paymentMethod === "credit-card"}
                        onChange={(e) => setPaymentMethod(e.target.value)}
                        className="mr-3"
                      />
                      <span className="font-medium text-gray-900">Credit Card</span>
                    </label>
                    <label className="flex items-center p-4 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50">
                      <input
                        type="radio"
                        name="payment"
                        value="paypal"
                        checked={paymentMethod === "paypal"}
                        onChange={(e) => setPaymentMethod(e.target.value)}
                        className="mr-3"
                      />
                      <span className="font-medium text-gray-900">PayPal</span>
                    </label>
                    <label className="flex items-center p-4 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50">
                      <input
                        type="radio"
                        name="payment"
                        value="bank-transfer"
                        checked={paymentMethod === "bank-transfer"}
                        onChange={(e) => setPaymentMethod(e.target.value)}
                        className="mr-3"
                      />
                      <span className="font-medium text-gray-900">Bank Transfer</span>
                    </label>
                  </div>

                  {/* Credit Card Form */}
                  {paymentMethod === "credit-card" && (
                    <div className="mt-6 space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-900 mb-2">
                          Card Number *
                        </label>
                        <input
                          type="text"
                          required
                          placeholder="1234 5678 9012 3456"
                          maxLength={19}
                          value={cardInfo.cardNumber}
                          onChange={(e) => {
                            const value = e.target.value.replace(/\s/g, '').replace(/\D/g, '');
                            const formatted = value.match(/.{1,4}/g)?.join(' ') || value;
                            setCardInfo({ ...cardInfo, cardNumber: formatted });
                          }}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-900 mb-2">
                          Cardholder Name *
                        </label>
                        <input
                          type="text"
                          required
                          placeholder="John Doe"
                          value={cardInfo.cardName}
                          onChange={(e) => setCardInfo({ ...cardInfo, cardName: e.target.value })}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-900 mb-2">
                            Expiry Date *
                          </label>
                          <input
                            type="text"
                            required
                            placeholder="MM/YY"
                            maxLength={5}
                            value={cardInfo.expiryDate}
                            onChange={(e) => {
                              let value = e.target.value.replace(/\D/g, '');
                              if (value.length >= 2) {
                                value = value.slice(0, 2) + '/' + value.slice(2, 4);
                              }
                              setCardInfo({ ...cardInfo, expiryDate: value });
                            }}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-900 mb-2">
                            CVV *
                          </label>
                          <input
                            type="text"
                            required
                            placeholder="123"
                            maxLength={4}
                            value={cardInfo.cvv}
                            onChange={(e) => {
                              const value = e.target.value.replace(/\D/g, '');
                              setCardInfo({ ...cardInfo, cvv: value });
                            }}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Right Column - Order Summary */}
              <div className="lg:col-span-1">
                <div className="border border-gray-200 rounded-lg p-6 sticky top-4">
                  <h2 className="text-lg font-bold text-gray-900 mb-4">Order Summary</h2>
                  
                  {/* Cart Items */}
                  <div className="space-y-3 mb-6 max-h-64 overflow-y-auto">
                    {cartItems.map((item) => (
                      <div key={item.id} className="flex gap-3">
                        <div className="relative w-16 h-16 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                          <Image
                            src={item.image}
                            alt={item.name}
                            fill
                            className="object-cover"
                            unoptimized
                            loading="lazy"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-medium text-gray-900 line-clamp-1">
                            {item.brand}
                          </p>
                          <p className="text-xs text-gray-600 line-clamp-1">
                            {item.name}
                          </p>
                          <p className="text-xs text-gray-600">
                            Qty: {item.quantity}
                          </p>
                          <p className="text-xs font-bold text-gray-900">
                            ${formatPrice(item.price * item.quantity)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Summary */}
                  <div className="space-y-3 mb-6 border-t border-gray-200 pt-4">
                    <div className="flex justify-between text-sm font-normal text-gray-600">
                      <span>Subtotal</span>
                      <span>${formatPrice(subtotal)}</span>
                    </div>
                    <div className="flex justify-between text-sm font-normal text-gray-600">
                      <span>Shipping</span>
                      <span>{shipping > 0 ? `$${formatPrice(shipping)}` : "Free"}</span>
                    </div>
                    <div className="flex justify-between text-sm font-normal text-gray-600">
                      <span>Tax</span>
                      <span>${formatPrice(tax)}</span>
                    </div>
                    {selectedDiscount && discountAmount > 0 && (
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-gray-600">Discount ({selectedDiscount.code})</span>
                        <span className="text-green-600 font-medium">
                          -${formatPrice(discountAmount)}
                        </span>
                      </div>
                    )}
                    <div className="border-t border-gray-200 pt-3">
                      <div className="flex justify-between text-base font-bold text-gray-900">
                        <span>Total</span>
                        <span>${formatPrice(total)}</span>
                      </div>
                    </div>
                  </div>

                  {error && (
                    <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                      <p className="text-sm text-red-600">{error}</p>
                    </div>
                  )}
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full bg-black text-white py-3 px-6 rounded-lg font-medium hover:bg-gray-800 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? "Placing Order..." : "Place Order"}
                  </button>
                </div>
              </div>
            </div>
          </form>
        </div>
      </div>

      <Footer />
    </main>
  );
}

