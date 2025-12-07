"use client";

import { useState, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { useAuth } from "@/hooks/useAuth";
import { createUserClient } from "@/lib/supabase";

export default function Navigation() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, profile, signOut, isAdmin } = useAuth();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showNotificationMenu, setShowNotificationMenu] = useState(false);
  const [hoveredProductsMenu, setHoveredProductsMenu] = useState(false);
  const [selectedGender, setSelectedGender] = useState<"men" | "woman">("men");
  const [cartCount, setCartCount] = useState(0);
  const [dropdownCloseTimer, setDropdownCloseTimer] = useState<NodeJS.Timeout | null>(null);
  const [wishlistCount, setWishlistCount] = useState(0);
  const [notificationCount, setNotificationCount] = useState(0);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loadingNotifications, setLoadingNotifications] = useState(false);

  // Fetch notifications
  const fetchNotifications = async (isPolling = false) => {
    if (!user) {
      setNotifications([]);
      setNotificationCount(0);
      return;
    }

    if (!isPolling) {
      setLoadingNotifications(true);
    }

    try {
      const supabase = createUserClient();
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError || !session) {
        setNotifications([]);
        setNotificationCount(0);
        return;
      }

      const response = await fetch("/api/notifications?limit=10", {
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
        },
        cache: 'no-store',
      });

      if (response.ok) {
        const result = await response.json();
        setNotifications(result.data || []);
        setNotificationCount(result.unread_count || 0);
      }
    } catch (error) {
      console.error("Error fetching notifications:", error);
    } finally {
      if (!isPolling) {
        setLoadingNotifications(false);
      }
    }
  };

  // Mark notification as read
  const markAsRead = async (notificationId: string) => {
    try {
      const supabase = createUserClient();
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError || !session) {
        return;
      }

      await fetch(`/api/notifications/${notificationId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ is_read: true }),
      });

      // Update local state
      setNotifications(prev => 
        prev.map(notif => 
          notif.id === notificationId ? { ...notif, is_read: true } : notif
        )
      );
      setNotificationCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error("Error marking notification as read:", error);
    }
  };

  // Mark all as read
  const markAllAsRead = async () => {
    try {
      const supabase = createUserClient();
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError || !session) {
        return;
      }

      await fetch("/api/notifications/mark-all-read", {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
        },
      });

      // Update local state
      setNotifications(prev => prev.map(notif => ({ ...notif, is_read: true })));
      setNotificationCount(0);
    } catch (error) {
      console.error("Error marking all notifications as read:", error);
    }
  };

  // Fetch cart and wishlist counts
  const fetchCounts = async () => {
    if (!user) {
      setCartCount(0);
      setWishlistCount(0);
      return;
    }

    // Skip fetching if user is on cart or wishlist page (those pages handle their own data)
    if (pathname === '/cart' || pathname === '/wishlist') {
      return;
    }

    try {
      const supabase = createUserClient();
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError || !session) {
        setCartCount(0);
        setWishlistCount(0);
        return;
      }

      // Fetch cart count
      const cartResponse = await fetch("/api/cart", {
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
        },
      });

      if (cartResponse.ok) {
        const cartResult = await cartResponse.json();
        setCartCount(cartResult.data?.length || 0);
      }

      // Fetch wishlist count
      const wishlistResponse = await fetch("/api/wishlist", {
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
        },
      });

      if (wishlistResponse.ok) {
        const wishlistResult = await wishlistResponse.json();
        setWishlistCount(wishlistResult.data?.length || 0);
      }
    } catch (error) {
      console.error("Error fetching counts:", error);
    }
  };

  useEffect(() => {
    fetchCounts();
    fetchNotifications(false);
    
    // Poll for updates every 5 seconds for real-time sync (reduced frequency)
    // Skip polling if on cart/wishlist page
    if (pathname !== '/cart' && pathname !== '/wishlist') {
      const interval = setInterval(() => {
        fetchCounts();
        fetchNotifications(true);
      }, 5000);
      
      return () => clearInterval(interval);
    }
  }, [user, pathname]);

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (dropdownCloseTimer) {
        clearTimeout(dropdownCloseTimer);
      }
    };
  }, [dropdownCloseTimer]);

  const getProductCategories = (gender: "men" | "woman") => {
    const baseUrl = `/products?gender=${gender}`;
    return {
      apparel: {
        title: "APPAREL",
        items: [
          { label: "JACKETS & VESTS", href: `${baseUrl}&category=apparel&subcategory=jackets` },
          { label: "TOPS", href: `${baseUrl}&category=apparel&subcategory=tops` },
          { label: "BOTTOMS", href: `${baseUrl}&category=apparel&subcategory=bottoms` },
        ],
        allHref: `${baseUrl}&category=apparel`,
      },
      footwear: {
        title: "FOOTWEAR",
        items: [
          { label: "SNEAKERS", href: `${baseUrl}&category=footwear&subcategory=sneakers` },
          { label: "BOOTS", href: `${baseUrl}&category=footwear&subcategory=boots` },
        ],
        allHref: `${baseUrl}&category=footwear`,
      },
      accessories: {
        title: "ACCESSORIES",
        items: [
          { label: "BAGS", href: `${baseUrl}&category=accessories&subcategory=bags` },
          { label: "HATS", href: `${baseUrl}&category=accessories&subcategory=hats` },
        ],
        allHref: `${baseUrl}&category=accessories`,
      },
      lifestyle: {
        title: "LIFESTYLE",
        items: [
          { label: "COLLECTIBLES", href: `${baseUrl}&category=lifestyle&subcategory=collectibles` },
        ],
        allHref: `${baseUrl}&category=lifestyle`,
      },
    };
  };

  const navItems = [
    { href: "/", label: "Home" },
    { href: "/products", label: "Products", hasDropdown: true },
    { href: "/service", label: "Service" },
    { href: "/aboutus", label: "Blog" },
  ];

  return (
    <nav className="bg-white shadow-md sticky top-0 z-50">
      <div className="w-full px-6 sm:px-8 lg:px-12 xl:px-16 2xl:px-24">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center gap-12">
            <div className="flex-shrink-0">
              <Link href="/" className="flex items-center">
                <Image
                  src="/logo/logo.svg"
                  alt="HYPEBEAST Logo"
                  width={200}
                  height={48}
                  className="h-10 w-auto"
                  priority
                />
              </Link>
            </div>
            <div className="hidden md:block">
              <div className="flex items-baseline space-x-8">
                {navItems.map((item) => {
                  const isActive = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href));
                  
                  // Products menu with dropdown
                  if (item.hasDropdown) {
                    const handleMouseEnter = () => {
                      // Clear any existing timer
                      if (dropdownCloseTimer) {
                        clearTimeout(dropdownCloseTimer);
                        setDropdownCloseTimer(null);
                      }
                      setHoveredProductsMenu(true);
                    };

                    const handleMouseLeave = () => {
                      // Set timer to close after 3 seconds
                      const timer = setTimeout(() => {
                        setHoveredProductsMenu(false);
                        setDropdownCloseTimer(null);
                      }, 3000);
                      setDropdownCloseTimer(timer);
                    };

                    return (
                      <div
                        key={item.href}
                        className="relative"
                        onMouseEnter={handleMouseEnter}
                        onMouseLeave={handleMouseLeave}
                      >
                        <Link
                          href={item.href}
                          className={`group relative text-gray-900 text-sm transition-colors ${
                            isActive ? "font-bold" : "font-light"
                          }`}
                        >
                          {item.label}
                          <span
                            className={`absolute left-0 -bottom-1 h-0.5 bg-black transition-all duration-300 ${
                              isActive || hoveredProductsMenu ? "w-full" : "w-0 group-hover:w-full"
                            }`}
                          ></span>
                        </Link>
                        {hoveredProductsMenu && (
                          <div 
                            className="fixed left-0 top-16 w-screen bg-white shadow-xl border-t border-gray-200 z-50"
                            onMouseEnter={() => {
                              // Clear any existing timer when mouse enters dropdown
                              if (dropdownCloseTimer) {
                                clearTimeout(dropdownCloseTimer);
                                setDropdownCloseTimer(null);
                              }
                              setHoveredProductsMenu(true);
                            }}
                            onMouseLeave={() => {
                              // Set timer to close after 3 seconds
                              const timer = setTimeout(() => {
                                setHoveredProductsMenu(false);
                                setDropdownCloseTimer(null);
                              }, 3000);
                              setDropdownCloseTimer(timer);
                            }}
                          >
                            <div className="w-full px-6 sm:px-8 lg:px-12 xl:px-16 2xl:px-24">
                              <div className="flex">
                                {/* Left Sidebar - Categories */}
                                <div className="w-80 border-r border-gray-200 py-10 px-8">
                                {/* Gender Selector */}
                                <div className="flex gap-6 mb-8 pb-6 border-b border-gray-200">
                                  <button
                                    onClick={() => setSelectedGender("men")}
                                    className={`text-sm font-light tracking-wide uppercase transition-all duration-200 cursor-pointer ${
                                      selectedGender === "men" 
                                        ? "text-black font-bold border-b border-black pb-1" 
                                        : "text-gray-600 hover:text-black"
                                    }`}
                                  >
                                    MEN
                                  </button>
                                  <button
                                    onClick={() => setSelectedGender("woman")}
                                    className={`text-sm font-light tracking-wide uppercase transition-all duration-200 cursor-pointer ${
                                      selectedGender === "woman" 
                                        ? "text-black font-bold border-b border-black pb-1" 
                                        : "text-gray-600 hover:text-black"
                                    }`}
                                  >
                                    WOMAN
                                  </button>
                                </div>
                                
                                <h2 className="text-sm font-bold tracking-wider uppercase text-black mb-6">
                                  HYPEBEAST
                                </h2>
                                <div className="flex flex-col space-y-4">
                                  {Object.entries(getProductCategories(selectedGender)).map(([key, category]) => (
                                    <div key={key} className="flex flex-col group">
                                      <Link
                                        href={category.allHref}
                                        className="text-sm font-light tracking-wide uppercase text-black hover:text-gray-600 transition-colors duration-200 mb-2 cursor-pointer py-1"
                                        onClick={(e) => {
                                          e.preventDefault();
                                          setHoveredProductsMenu(false);
                                          router.push(category.allHref);
                                        }}
                                      >
                                        {category.title}
                                      </Link>
                                      <div className="flex flex-col space-y-2">
                                        {category.items.map((item, index) => (
                                          <Link
                                            key={index}
                                            href={item.href}
                                            className="text-sm font-light tracking-wide uppercase text-gray-700 hover:text-black hover:pl-6 transition-all duration-200 pl-4 cursor-pointer py-1"
                                            onClick={(e) => {
                                              e.preventDefault();
                                              setHoveredProductsMenu(false);
                                              router.push(item.href);
                                            }}
                                          >
                                            {item.label}
                                          </Link>
                                        ))}
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>
                              
                              {/* Right Content - Product Images */}
                              <div className="flex-1 py-10 px-12">
                                <div className="grid grid-cols-2 gap-8">
                                  {/* Product Showcase 1 */}
                                  <Link
                                    href={`/products?gender=${selectedGender}&is_new_arrival=true`}
                                    className="group cursor-pointer"
                                    onClick={(e) => {
                                      e.preventDefault();
                                      setHoveredProductsMenu(false);
                                      router.push(`/products?gender=${selectedGender}&is_new_arrival=true`);
                                    }}
                                  >
                                    <div className="relative aspect-[4/5] overflow-hidden bg-gray-100 mb-4">
                                      <Image
                                        src={selectedGender === "men" ? "/images/fashion/man1.jpeg" : "/images/fashion/woman1.jpeg"}
                                        alt="New Arrivals"
                                        fill
                                        className="object-cover group-hover:scale-105 transition-transform duration-500"
                                        unoptimized
                                      />
                                    </div>
                                    <p className="text-sm font-light tracking-wide uppercase text-black group-hover:text-gray-600 transition-colors duration-200">
                                      NEW ARRIVALS
                                    </p>
                                  </Link>
                                  
                                  {/* Product Showcase 2 */}
                                  <Link
                                    href={`/products?gender=${selectedGender}&category=apparel`}
                                    className="group cursor-pointer"
                                    onClick={(e) => {
                                      e.preventDefault();
                                      setHoveredProductsMenu(false);
                                      router.push(`/products?gender=${selectedGender}&category=apparel`);
                                    }}
                                  >
                                    <div className="relative aspect-[4/5] overflow-hidden bg-gray-100 mb-4 border-0">
                                      <Image
                                        src={selectedGender === "men" ? "/images/fashion/man2.webp" : "/images/fashion/woman2.jpeg"}
                                        alt="Apparel Collection"
                                        fill
                                        className="object-cover group-hover:scale-105 transition-transform duration-500 border-0 outline-none"
                                        unoptimized
                                        style={{ border: 'none', outline: 'none' }}
                                      />
                                    </div>
                                    <p className="text-sm font-light tracking-wide uppercase text-black group-hover:text-gray-600 transition-colors duration-200">
                                      APPAREL COLLECTION
                                    </p>
                                  </Link>
                                </div>
                              </div>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  }
                  
                  // Regular menu items
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={`group relative text-gray-900 text-sm transition-colors ${
                        isActive ? "font-bold" : "font-light"
                      }`}
                    >
                      {item.label}
                      <span
                        className={`absolute left-0 -bottom-1 h-0.5 bg-black transition-all duration-300 ${
                          isActive ? "w-full" : "w-0 group-hover:w-full"
                        }`}
                      ></span>
                    </Link>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="hidden md:block">
            <div className="flex items-center gap-4">
              {/* Search Bar */}
              <div className="hidden lg:block w-64">
                <div className="flex items-center bg-gray-100 rounded-full p-1 pl-4">
                  <input 
                    type="text" 
                    placeholder="What are you looking for?" 
                    className="bg-transparent border-none outline-none text-sm w-full text-gray-600 placeholder-gray-400"
                  />
                  <div className="flex items-center gap-3 pr-1">
                    <button className="bg-black hover:bg-gray-800 text-white p-2 rounded-full transition-colors">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>

              {/* User Menu (if logged in) */}
              {user ? (
                <div className="flex items-center gap-3">
                  {/* Cart Button */}
                  <Link
                    href="/cart"
                    className="relative p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    title="Shopping Cart"
                  >
                    <svg className="w-5 h-5 text-gray-900" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                    </svg>
                    {/* Cart Badge - Show item count */}
                    {cartCount > 0 && (
                      <span className="absolute -top-1 -right-1 min-w-[1rem] h-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-medium px-1">
                        {cartCount > 99 ? '99+' : cartCount}
                      </span>
                    )}
                  </Link>

                  {/* Wishlist Button */}
                  <Link
                    href="/wishlist"
                    className="relative p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    title="Wishlist"
                  >
                    <svg className="w-5 h-5 text-gray-900" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                    </svg>
                    {/* Wishlist Badge - Show item count */}
                    {wishlistCount > 0 && (
                      <span className="absolute -top-1 -right-1 min-w-[1rem] h-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-medium px-1">
                        {wishlistCount > 99 ? '99+' : wishlistCount}
                      </span>
                    )}
                  </Link>

                  {/* Notification Button with Dropdown */}
                  <div className="relative">
                    <button
                      onClick={() => setShowNotificationMenu(!showNotificationMenu)}
                      className="relative p-2 hover:bg-gray-100 rounded-lg transition-colors"
                      title="Notifications"
                    >
                      <svg className="w-5 h-5 text-gray-900" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                      </svg>
                      {/* Notification Badge - Show unread count */}
                      {notificationCount > 0 && (
                        <span className="absolute -top-1 -right-1 min-w-[1rem] h-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-medium px-1">
                          {notificationCount > 99 ? '99+' : notificationCount}
                        </span>
                      )}
                    </button>

                    {/* Notification Dropdown */}
                    {showNotificationMenu && (
                      <>
                        <div
                          className="fixed inset-0 z-40"
                          onClick={() => setShowNotificationMenu(false)}
                        />
                        <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-200 z-50 max-h-[500px] flex flex-col">
                          {/* Header */}
                          <div className="flex items-center justify-between p-4 border-b border-gray-200">
                            <h3 className="text-sm font-semibold text-gray-900">Notifications</h3>
                            {notificationCount > 0 && (
                              <button
                                onClick={markAllAsRead}
                                className="text-xs text-gray-600 hover:text-gray-900 font-medium"
                              >
                                Mark all as read
                              </button>
                            )}
                          </div>

                          {/* Notifications List */}
                          <div className="overflow-y-auto flex-1">
                            {loadingNotifications ? (
                              <div className="p-4 text-center text-sm text-gray-500">
                                Loading...
                              </div>
                            ) : notifications.length === 0 ? (
                              <div className="p-4 text-center text-sm text-gray-500">
                                No notifications
                              </div>
                            ) : (
                              <div className="divide-y divide-gray-100">
                                {notifications.map((notification) => (
                                  <div
                                    key={notification.id}
                                    className={`p-4 hover:bg-gray-50 cursor-pointer transition-colors ${
                                      !notification.is_read ? 'bg-blue-50/50' : ''
                                    }`}
                                    onClick={() => {
                                      if (!notification.is_read) {
                                        markAsRead(notification.id);
                                      }
                                    }}
                                  >
                                    <div className="flex items-start gap-3">
                                      <div className={`flex-shrink-0 w-2 h-2 rounded-full mt-2 ${
                                        !notification.is_read ? 'bg-blue-500' : 'bg-transparent'
                                      }`} />
                                      <div className="flex-1 min-w-0">
                                        <p className={`text-sm font-medium text-gray-900 ${
                                          !notification.is_read ? 'font-semibold' : ''
                                        }`}>
                                          {notification.title}
                                        </p>
                                        <p className="text-xs text-gray-600 mt-1 line-clamp-2">
                                          {notification.message}
                                        </p>
                                        <p className="text-xs text-gray-400 mt-2">
                                          {new Date(notification.created_at).toLocaleDateString('en-US', {
                                            month: 'short',
                                            day: 'numeric',
                                            hour: '2-digit',
                                            minute: '2-digit'
                                          })}
                                        </p>
                                      </div>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>

                          {/* Footer */}
                          {notifications.length > 0 && (
                            <div className="p-3 border-t border-gray-200">
                              <Link
                                href="/notifications"
                                onClick={() => setShowNotificationMenu(false)}
                                className="block text-center text-sm text-gray-600 hover:text-gray-900 font-medium"
                              >
                                View all notifications
                              </Link>
                            </div>
                          )}
                        </div>
                      </>
                    )}
                  </div>

                  {/* Profile Button */}
                  <div className="relative">
                    <button
                      onClick={() => setShowUserMenu(!showUserMenu)}
                      className={`flex items-center gap-2 px-4 py-2 hover:bg-gray-100 rounded-lg transition-colors ${
                        isAdmin ? 'bg-purple-50 hover:bg-purple-100' : ''
                      }`}
                    >
                      {profile?.avatar_url ? (
                        <div className="relative w-8 h-8 rounded-full overflow-hidden">
                          <Image
                            src={profile.avatar_url}
                            alt={profile?.full_name || "Profile"}
                            fill
                            className="object-cover"
                            unoptimized
                            key={profile.avatar_url || profile.updated_at} // Force re-render when avatar changes
                          />
                        </div>
                      ) : (
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                          isAdmin 
                            ? 'bg-purple-600 text-white' 
                            : 'bg-black text-white'
                        }`}>
                          {profile?.full_name
                            ? profile.full_name.charAt(0).toUpperCase()
                            : user.email?.charAt(0).toUpperCase() || "U"}
                        </div>
                      )}
                      <span className="text-sm font-medium text-gray-900 hidden lg:block">
                        {profile?.full_name || user.email?.split("@")[0] || "User"}
                      </span>
                      <svg
                        className={`w-4 h-4 text-gray-600 transition-transform ${showUserMenu ? "rotate-180" : ""}`}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>

                    {/* Dropdown Menu */}
                    {showUserMenu && (
                      <>
                        <div
                          className="fixed inset-0 z-40"
                          onClick={() => setShowUserMenu(false)}
                        />
                        <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-50 py-1">
                          {isAdmin ? (
                            <>
                              <Link
                                href="/admin/dashboard"
                                className="block px-4 py-2 text-sm text-purple-700 hover:bg-purple-50 font-medium"
                                onClick={() => setShowUserMenu(false)}
                              >
                                Admin Dashboard
                              </Link>
                              <Link
                                href="/admin/products"
                                className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                onClick={() => setShowUserMenu(false)}
                              >
                                Manage Products
                              </Link>
                              <Link
                                href="/admin/users"
                                className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                onClick={() => setShowUserMenu(false)}
                              >
                                Manage Users
                              </Link>
                              <div className="border-t border-gray-200 my-1" />
                              <Link
                                href="/profile"
                                className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                onClick={() => setShowUserMenu(false)}
                              >
                                My Profile
                              </Link>
                            </>
                          ) : (
                            <>
                              <Link
                                href="/profile"
                                className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                onClick={() => setShowUserMenu(false)}
                              >
                                My Profile
                              </Link>
                              <Link
                                href="/orders"
                                className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                onClick={() => setShowUserMenu(false)}
                              >
                                My Orders
                              </Link>
                              <Link
                                href="/wishlist"
                                className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                onClick={() => setShowUserMenu(false)}
                              >
                                Wishlist
                              </Link>
                            </>
                          )}
                          <div className="border-t border-gray-200 my-1" />
                          <button
                            onClick={async () => {
                              await signOut();
                              setShowUserMenu(false);
                              router.push("/");
                              router.refresh();
                            }}
                            className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
                          >
                            Sign Out
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              ) : (
                <>
                  {/* Sign In & Sign Up Buttons (if not logged in) */}
                  <Link href="/sign-in" className="group relative inline-block text-sm font-medium text-black">
                    <span className="absolute inset-0 border border-black"></span>
                    <span className="block border border-black bg-white px-6 py-2 transition-transform group-hover:-translate-x-1 group-hover:-translate-y-1">
                      Sign In
                    </span>
                  </Link>

                  <Link href="/sign-up" className="group relative inline-block text-sm font-medium text-white">
                    <span className="absolute inset-0 border border-black"></span>
                    <span className="block border border-black bg-black px-6 py-2 transition-transform group-hover:-translate-x-1 group-hover:-translate-y-1">
                      Sign Up
                    </span>
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}

