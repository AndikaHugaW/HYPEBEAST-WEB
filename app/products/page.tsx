"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import Footer from "@/components/Footer";
import { useAuth } from "@/hooks/useAuth";
import { createUserClient } from "@/lib/supabase";

type Product = {
  id: number;
  name: string;
  brand: string;
  category: string;
  original_price: number;
  sale_price: number;
  discount_percentage?: number;
  image_url: string;
  is_new_arrival?: boolean;
  is_on_sale?: boolean;
};

const categories = [
  { id: "new-arrival", label: "New Arrival", value: null, isNewArrival: true },
  { id: "apparel", label: "Apparel", value: "apparel", isNewArrival: false },
  { id: "footwear", label: "Footwear", value: "footwear", isNewArrival: false },
  { id: "accessories", label: "Accessories", value: "accessories", isNewArrival: false },
  { id: "lifestyle", label: "Lifestyle", value: "lifestyle", isNewArrival: false },
];

export default function Products() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useAuth();
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [activeGender, setActiveGender] = useState<string>("men");
  const [activeCategory, setActiveCategory] = useState<string>("new-arrival");
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [addingItems, setAddingItems] = useState<Set<string>>(new Set());

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

  // Filter options from API
  const [filterOptions, setFilterOptions] = useState<{
    categories: string[];
    brands: string[];
    colors: string[];
    hasOnSale: boolean;
    hasNewArrival: boolean;
  }>({
    categories: [],
    brands: [],
    colors: [],
    hasOnSale: false,
    hasNewArrival: false,
  });

  // Selected filters
  const [selectedFilters, setSelectedFilters] = useState<{
    search: string;
    categories: string[];
    brands: string[];
    colors: string[];
    isOnSale: boolean;
    isNewArrival: boolean;
    minPrice: number;
    maxPrice: number;
  }>({
    search: "",
    categories: [],
    brands: [],
    colors: [],
    isOnSale: false,
    isNewArrival: false,
    minPrice: 0,
    maxPrice: 5000,
  });

  const filterCategories = [
    { id: "search", label: "CARI DI TOKO" },
    { id: "category", label: "KATEGORI" },
    { id: "brand", label: "BRANDS" },
    { id: "sales", label: "PENJUALAN" },
    { id: "price", label: "KISARAN HARGA" },
    { id: "color", label: "WARNA" },
    { id: "store", label: "TOKO" },
  ];

  const toggleDropdown = (id: string) => {
    setOpenDropdown(openDropdown === id ? null : id);
  };

  // Fetch filter options
  const fetchFilterOptions = async () => {
    try {
      const response = await fetch("/api/products/filters");
      const result = await response.json();
      if (!result.error) {
        setFilterOptions(result);
      }
    } catch (err) {
      console.error("Error fetching filter options:", err);
    }
  };

  // Fetch products based on active category and filters
  const fetchProducts = async (categoryId: string, filters = selectedFilters, isPolling = false, gender?: string) => {
    // Only show loading state on initial load, not during polling to avoid glitch
    if (!isPolling) {
    setLoading(true);
    }
    setError(null);
    
    try {
      const category = categories.find((cat) => cat.id === categoryId);
      if (!category) return;

      let url = "/api/products?";
      
      // Gender filter - use provided gender parameter or fallback to activeGender state
      const currentGender = gender !== undefined ? gender : activeGender;
      if (currentGender) {
        url += `gender=${currentGender}&`;
      }
      
      // Category filter
      if (category.isNewArrival) {
        url += "is_new_arrival=true&";
      } else if (category.value) {
        url += `category=${category.value}&`;
      }

      // Additional filters
      if (filters.search) {
        url += `search=${encodeURIComponent(filters.search)}&`;
      }
      
      // Don't apply category filter if "new-arrival" is selected (it uses is_new_arrival instead)
      if (filters.categories.length > 0 && !category.isNewArrival) {
        filters.categories.forEach((cat) => {
          url += `category=${cat}&`;
        });
      }

      if (filters.brands.length > 0) {
        filters.brands.forEach((brand) => {
          url += `brand=${encodeURIComponent(brand)}&`;
        });
      }

      if (filters.colors.length > 0) {
        filters.colors.forEach((color) => {
          url += `color=${encodeURIComponent(color)}&`;
        });
      }

      if (filters.isOnSale) {
        url += "is_on_sale=true&";
      }

      if (filters.isNewArrival && !category.isNewArrival) {
        url += "is_new_arrival=true&";
      }

      if (filters.minPrice > 0) {
        url += `min_price=${filters.minPrice}&`;
      }

      if (filters.maxPrice < 5000) {
        url += `max_price=${filters.maxPrice}&`;
      }
      
      url += "limit=20&sort=newest";

      // Add cache buster to ensure fresh data
      url += `&_t=${Date.now()}`;

      const response = await fetch(url, {
        cache: 'no-store',
        headers: {
          'Cache-Control': 'no-cache',
        },
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        let errorMessage = `HTTP error! status: ${response.status}`;
        try {
          const errorJson = JSON.parse(errorText);
          errorMessage = errorJson.error?.message || errorMessage;
        } catch (e) {
          errorMessage = errorText || errorMessage;
        }
        throw new Error(errorMessage);
      }

      const result = await response.json();

      if (result.error) {
        throw new Error(result.error.message);
      }

      // Transform API data to match component structure
      const transformedProducts = (result.data || []).map((product: any) => {
        // Add cache buster to image URL for real-time updates
        const imageUrl = (product.images && product.images.length > 0) 
          ? product.images[0] 
          : product.image_url || "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800&q=80";
        
        const imageWithCacheBuster = imageUrl ? `${imageUrl}${imageUrl.includes('?') ? '&' : '?'}t=${new Date(product.updated_at || product.created_at || Date.now()).getTime()}` : imageUrl;
        
        return {
        id: product.id,
        name: product.name,
        brand: product.brand,
        category: product.category,
        original_price: product.original_price,
        sale_price: product.sale_price,
        discount_percentage: product.discount_percentage,
          image_url: imageWithCacheBuster,
        is_new_arrival: product.is_new_arrival,
        is_on_sale: product.is_on_sale,
        };
      });

      // Only update state if data actually changed to prevent unnecessary re-renders and glitch
      if (isPolling) {
        // Compare products by creating a string representation to detect changes
        const normalizeProduct = (p: any) => ({
          id: String(p.id),
          name: p.name,
          image_url: p.image_url ? p.image_url.split('?')[0] : '', // Remove cache buster for comparison
          sale_price: p.sale_price,
          is_new_arrival: p.is_new_arrival,
          is_on_sale: p.is_on_sale,
        });
        
        const currentProductsStr = JSON.stringify(
          products.map(normalizeProduct).sort((a, b) => a.id.localeCompare(b.id))
        );
        
        const newProductsStr = JSON.stringify(
          transformedProducts.map(normalizeProduct).sort((a, b) => a.id.localeCompare(b.id))
        );
        
        // Only update if there are actual changes
        // Also verify that the gender used in fetch matches current activeGender to prevent glitch
        if (currentProductsStr !== newProductsStr) {
          const expectedGender = gender !== undefined ? gender : activeGender;
          // Only update if gender matches (prevents showing wrong gender data when switching)
          if (expectedGender === activeGender) {
            setProducts(transformedProducts);
          }
        }
      } else {
        // Always update on initial load - verify gender matches
        const expectedGender = gender !== undefined ? gender : activeGender;
        if (expectedGender === activeGender) {
          setProducts(transformedProducts);
        }
      }
    } catch (err: any) {
      console.error("Error fetching products:", err);
      setError(err.message || "Failed to load products");
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  // Handle filter changes
  const handleFilterChange = (filterType: string, value: string | boolean | number) => {
    setSelectedFilters((prev) => {
      const newFilters = { ...prev };
      
      if (filterType === "search") {
        newFilters.search = value as string;
      } else if (filterType === "category") {
        const categories = [...prev.categories];
        const index = categories.indexOf(value as string);
        if (index > -1) {
          categories.splice(index, 1);
        } else {
          categories.push(value as string);
        }
        newFilters.categories = categories;
      } else if (filterType === "brand") {
        const brands = [...prev.brands];
        const index = brands.indexOf(value as string);
        if (index > -1) {
          brands.splice(index, 1);
        } else {
          brands.push(value as string);
        }
        newFilters.brands = brands;
      } else if (filterType === "color") {
        const colors = [...prev.colors];
        const index = colors.indexOf(value as string);
        if (index > -1) {
          colors.splice(index, 1);
        } else {
          colors.push(value as string);
        }
        newFilters.colors = colors;
      } else if (filterType === "isOnSale") {
        newFilters.isOnSale = value as boolean;
      } else if (filterType === "isNewArrival") {
        newFilters.isNewArrival = value as boolean;
      } else if (filterType === "minPrice") {
        newFilters.minPrice = value as number;
      } else if (filterType === "maxPrice") {
        newFilters.maxPrice = value as number;
      }
      
      return newFilters;
    });
  };

  // Read URL query parameters and update state
  useEffect(() => {
    const genderParam = searchParams.get('gender');
    const categoryParam = searchParams.get('category');
    const isNewArrivalParam = searchParams.get('is_new_arrival');

    // Update activeGender if gender parameter exists
    if (genderParam && (genderParam === 'men' || genderParam === 'woman')) {
      setActiveGender(genderParam);
    }

    // Update activeCategory based on URL parameters
    if (isNewArrivalParam === 'true') {
      setActiveCategory('new-arrival');
    } else if (categoryParam) {
      // Map category parameter to category ID
      const categoryId = categories.find(cat => cat.value === categoryParam)?.id;
      if (categoryId) {
        setActiveCategory(categoryId);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  useEffect(() => {
    fetchFilterOptions();
  }, []);

  // Polling for filter options (every 3 seconds) to get new brands in realtime
  useEffect(() => {
    const filterInterval = setInterval(() => {
      fetchFilterOptions();
    }, 3000); // Poll every 3 seconds

    return () => clearInterval(filterInterval);
  }, []);

  // Initial fetch - reset when gender or category changes
  useEffect(() => {
    fetchProducts(activeCategory, selectedFilters, false, activeGender);
  }, [activeCategory, activeGender, selectedFilters]);

  // Polling for real-time updates (every 5 seconds)
  // Use ref to always get latest activeGender value in polling
  const activeGenderRef = useRef(activeGender);
  useEffect(() => {
    activeGenderRef.current = activeGender;
  }, [activeGender]);

  useEffect(() => {
    const interval = setInterval(() => {
      // Only poll if no active filters (to avoid interrupting user actions)
      const hasActiveFilters = selectedFilters.search || 
        selectedFilters.categories.length > 0 || 
        selectedFilters.brands.length > 0 || 
        selectedFilters.colors.length > 0 || 
        selectedFilters.isOnSale || 
        selectedFilters.isNewArrival || 
        selectedFilters.minPrice > 0 || 
        selectedFilters.maxPrice < 5000;
      
      if (!hasActiveFilters) {
        // Pass isPolling=true and current gender from ref to prevent loading state and glitch
        fetchProducts(activeCategory, selectedFilters, true, activeGenderRef.current);
      }
    }, 5000); // Poll every 5 seconds

    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeCategory, selectedFilters]);


  return (
    <main className="min-h-screen bg-white">
       {/* Navigation Header - Main Menu (Men/Woman) */}
       <section className="border-b border-gray-200">
         <div className="w-full px-6 sm:px-8 lg:px-12 xl:px-16 2xl:px-24">
           {/* Main Gender Menu */}
           <nav className="flex items-center justify-center gap-8 h-16 border-b border-gray-200">
             <button
               onClick={() => {
                 setActiveGender("men");
                 setActiveCategory("new-arrival");
               }}
               className={`text-sm transition-colors relative ${
                 activeGender === "men"
                   ? "font-bold text-gray-900"
                   : "font-light text-gray-600 hover:text-gray-900"
               }`}
             >
               Men
               {activeGender === "men" && (
                 <span className="absolute left-0 -bottom-4 h-0.5 bg-black w-full"></span>
               )}
             </button>
             <button
               onClick={() => {
                 setActiveGender("woman");
                 setActiveCategory("new-arrival");
               }}
               className={`text-sm transition-colors relative ${
                 activeGender === "woman"
                   ? "font-bold text-gray-900"
                   : "font-light text-gray-600 hover:text-gray-900"
               }`}
             >
               Woman
               {activeGender === "woman" && (
                 <span className="absolute left-0 -bottom-4 h-0.5 bg-black w-full"></span>
               )}
             </button>
           </nav>
           
           {/* Submenu Categories */}
           <nav className="flex items-center justify-center gap-8 h-14">
             {categories.map((category) => (
               <button
                 key={category.id}
                 onClick={() => setActiveCategory(category.id)}
                 className={`text-sm transition-colors ${
                   activeCategory === category.id
                     ? "font-bold text-gray-900"
                     : "font-light text-gray-600 hover:text-gray-900"
                 }`}
               >
                 {category.label}
               </button>
             ))}
           </nav>
        </div>
      </section>

      {/* Category Banner */}
      <section className="relative bg-black text-white overflow-hidden">
        <div className="absolute inset-0 z-0 opacity-20">
          <div className="absolute inset-0" style={{
            backgroundImage: `linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px),
                              linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px)`,
            backgroundSize: '40px 40px'
          }}></div>
        </div>
        <div className="relative z-10 w-full px-6 sm:px-8 lg:px-12 xl:px-16 2xl:px-24 py-16 md:py-24 text-center">
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-normal">
            {activeGender === "men" ? "Men" : "Woman"} - {categories.find((cat) => cat.id === activeCategory)?.label || "Products"}
          </h1>
        </div>
      </section>

      {/* Main Content Area */}
      <section className="bg-white min-h-screen">
        <div className="w-full px-6 sm:px-8 lg:px-12 xl:px-16 2xl:px-24 py-12 md:py-16">
          <div className="flex flex-col lg:flex-row gap-8 lg:gap-12">
            {/* Left Sidebar */}
            <aside className="lg:w-64 flex-shrink-0">
              <div className="space-y-6">
                <div>
                  <p className="text-sm text-gray-600 mb-2">
                    {activeGender === "men" ? "Men" : "Woman"} / {categories.find((cat) => cat.id === activeCategory)?.label || "Products"}
                  </p>
                  <h2 className="text-3xl font-normal text-gray-900">
                    {categories.find((cat) => cat.id === activeCategory)?.label || "Products"}
                  </h2>
                </div>
                
                {/* Filter Options */}
                <div className="space-y-1">
                  {filterCategories.map((category) => (
                    <div key={category.id} className="border-b border-gray-200">
                      <button
                        onClick={() => toggleDropdown(category.id)}
                        className="w-full flex items-center justify-between py-3 text-left group"
                      >
                        <span className="text-sm font-normal text-gray-900 uppercase tracking-wide">
                          {category.label}
                        </span>
                        <svg
                          className={`w-4 h-4 text-gray-600 transition-transform duration-200 ${
                            openDropdown === category.id ? "rotate-90" : ""
                          }`}
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9 5l7 7-7 7"
                          />
                        </svg>
                      </button>
                      <div
                        className={`overflow-hidden transition-all duration-300 ease-in-out ${
                          openDropdown === category.id
                            ? "max-h-96 opacity-100"
                            : "max-h-0 opacity-0"
                        }`}
                      >
                        <div className="py-2 space-y-2">
                          <div className="text-sm text-gray-600 px-2">
                            {category.id === "search" && (
                              <input
                                type="text"
                                placeholder="Cari produk..."
                                value={selectedFilters.search}
                                onChange={(e) => {
                                  handleFilterChange("search", e.target.value);
                                }}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black"
                              />
                            )}
                            {category.id === "category" && (
                              <div className="space-y-2 max-h-60 overflow-y-auto">
                                {filterOptions.categories.length > 0 ? (
                                  filterOptions.categories.map((cat) => (
                                    <label key={cat} className="flex items-center cursor-pointer hover:bg-gray-50 p-1 rounded">
                                      <input
                                        type="checkbox"
                                        checked={selectedFilters.categories.includes(cat)}
                                        onChange={() => handleFilterChange("category", cat)}
                                        className="mr-2"
                                      />
                                      <span className="capitalize">{cat}</span>
                                </label>
                                  ))
                                ) : (
                                  <p className="text-xs text-gray-400">No categories available</p>
                                )}
                              </div>
                            )}
                            {category.id === "brand" && (
                              <div className="space-y-2 max-h-60 overflow-y-auto">
                                {filterOptions.brands.length > 0 ? (
                                  filterOptions.brands.map((brand) => (
                                    <label key={brand} className="flex items-center cursor-pointer hover:bg-gray-50 p-1 rounded">
                                      <input
                                        type="checkbox"
                                        checked={selectedFilters.brands.includes(brand)}
                                        onChange={() => handleFilterChange("brand", brand)}
                                        className="mr-2"
                                      />
                                      <span>{brand}</span>
                                </label>
                                  ))
                                ) : (
                                  <p className="text-xs text-gray-400">No brands available</p>
                                )}
                              </div>
                            )}
                            {category.id === "sales" && (
                              <div className="space-y-2">
                                {filterOptions.hasOnSale && (
                                  <label className="flex items-center cursor-pointer hover:bg-gray-50 p-1 rounded">
                                    <input
                                      type="checkbox"
                                      checked={selectedFilters.isOnSale}
                                      onChange={(e) => handleFilterChange("isOnSale", e.target.checked)}
                                      className="mr-2"
                                    />
                                  <span>On Sale</span>
                                </label>
                                )}
                                {filterOptions.hasNewArrival && (
                                  <label className="flex items-center cursor-pointer hover:bg-gray-50 p-1 rounded">
                                    <input
                                      type="checkbox"
                                      checked={selectedFilters.isNewArrival}
                                      onChange={(e) => handleFilterChange("isNewArrival", e.target.checked)}
                                      className="mr-2"
                                    />
                                  <span>New Arrivals</span>
                                </label>
                                )}
                                {!filterOptions.hasOnSale && !filterOptions.hasNewArrival && (
                                  <p className="text-xs text-gray-400">No sales options available</p>
                                )}
                              </div>
                            )}
                            {category.id === "price" && (
                              <div className="space-y-2">
                                <div className="flex items-center gap-3">
                                <input
                                  type="range"
                                  min="0"
                                  max="5000"
                                  value={selectedFilters.maxPrice}
                                    className="h-3.5 w-full appearance-none rounded-full bg-gray-300 [&::-webkit-slider-thumb]:size-7 [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:border-[6px] [&::-webkit-slider-thumb]:border-gray-500 [&::-webkit-slider-thumb]:bg-gray-200 [&::-moz-range-thumb]:size-7 [&::-moz-range-thumb]:cursor-pointer [&::-moz-range-thumb]:appearance-none [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:border-[6px] [&::-moz-range-thumb]:border-gray-500 [&::-moz-range-thumb]:bg-gray-200"
                                  onChange={(e) => {
                                    const value = parseInt(e.target.value);
                                    handleFilterChange("maxPrice", value);
                                  }}
                                />
                                  <span className="text-sm/none font-medium text-gray-700">
                                    ${selectedFilters.maxPrice.toLocaleString()}
                                  </span>
                                </div>
                                <div className="flex justify-between text-xs text-gray-500">
                                  <span>${selectedFilters.minPrice.toLocaleString()}</span>
                                  <span>${selectedFilters.maxPrice.toLocaleString()}</span>
                                </div>
                              </div>
                            )}
                            {category.id === "color" && (
                              <div className="flex flex-wrap gap-2">
                                {filterOptions.colors.length > 0 ? (
                                  filterOptions.colors.map((color) => (
                                    <button
                                      key={color}
                                      onClick={() => handleFilterChange("color", color)}
                                      className={`px-3 py-1 border rounded text-xs transition-colors ${
                                        selectedFilters.colors.includes(color)
                                          ? "bg-black text-white border-black"
                                          : "border-gray-300 hover:bg-gray-100"
                                      }`}
                                    >
                                      {color}
                                    </button>
                                  ))
                                ) : (
                                  <p className="text-xs text-gray-400">No colors available</p>
                                )}
                              </div>
                            )}
                            {category.id === "store" && (
                              <div className="space-y-2">
                                <p className="text-xs text-gray-400">Store filter coming soon</p>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </aside>

            {/* Products Grid */}
            <div className="flex-1">
              {loading ? (
                <div className="flex items-center justify-center py-20">
                  <div className="text-center">
                    <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mb-4"></div>
                    <p className="text-gray-600">Loading products...</p>
                  </div>
                </div>
              ) : error ? (
                <div className="flex items-center justify-center py-20">
                  <div className="text-center">
                    <p className="text-red-600 mb-2">{error}</p>
                    <button
                      onClick={() => fetchProducts(activeCategory)}
                      className="text-sm text-gray-600 hover:text-gray-900 underline"
                    >
                      Try again
                    </button>
                  </div>
                </div>
              ) : products.length === 0 ? (
                <div className="flex items-center justify-center py-20">
                  <p className="text-gray-600">No products found in this category.</p>
                </div>
              ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {products.map((product) => {
                    const discount = product.discount_percentage || 
                      Math.round(((product.original_price - product.sale_price) / product.original_price) * 100);
                    
                    return (
                  <Link key={product.id} href={`/products/${product.id}`} className="group cursor-pointer bg-white rounded-lg overflow-hidden relative block">
                    {/* Product Image */}
                    <div className="relative aspect-square overflow-hidden bg-gray-100">
                      <Image
                            src={product.image_url}
                        alt={product.name}
                        fill
                        className="object-cover group-hover:scale-110 transition-transform duration-500"
                        unoptimized
                      />
                      
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
                          await handleAddToWishlist(product.id.toString());
                        }}
                        disabled={addingItems.has(`wishlist-${product.id}`)}
                        className="bg-white/90 backdrop-blur-sm p-2 rounded-full shadow-sm hover:bg-white text-gray-600 hover:text-red-500 transition-all duration-300 hover:scale-110 disabled:opacity-50"
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
                          await handleAddToCart(product.id.toString());
                        }}
                        disabled={addingItems.has(`cart-${product.id}`)}
                        className="mt-3 w-full group/btn relative inline-block text-base font-bold text-white opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all duration-300 disabled:opacity-50"
                      >
                        <span className="absolute inset-0 border border-black"></span>
                        <span className="w-full border border-black bg-black py-3 transition-transform group-hover/btn:-translate-x-1 group-hover/btn:-translate-y-1 flex items-center justify-center gap-2">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                          </svg>
                          {addingItems.has(`cart-${product.id}`) ? "Adding..." : "Add to Cart"}
                        </span>
                      </button>
                    </div>
                  </Link>
                    );
                  })}
              </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Footer Section */}
      <Footer />
    </main>
  );
}
