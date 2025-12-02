"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import Footer from "@/components/Footer";

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
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [activeCategory, setActiveCategory] = useState<string>("new-arrival");
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const priceSliderRef = useRef<HTMLInputElement>(null);

  // Filter options from API
  const [filterOptions, setFilterOptions] = useState<{
    categories: string[];
    designers: string[];
    colors: string[];
    brands: string[];
    hasOnSale: boolean;
    hasNewArrival: boolean;
  }>({
    categories: [],
    designers: [],
    colors: [],
    brands: [],
    hasOnSale: false,
    hasNewArrival: false,
  });

  // Selected filters
  const [selectedFilters, setSelectedFilters] = useState<{
    search: string;
    categories: string[];
    designers: string[];
    colors: string[];
    isOnSale: boolean;
    isNewArrival: boolean;
    minPrice: number;
    maxPrice: number;
  }>({
    search: "",
    categories: [],
    designers: [],
    colors: [],
    isOnSale: false,
    isNewArrival: false,
    minPrice: 0,
    maxPrice: 5000,
  });

  const filterCategories = [
    { id: "search", label: "CARI DI TOKO" },
    { id: "category", label: "KATEGORI" },
    { id: "designer", label: "DESAINER" },
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
  const fetchProducts = async (categoryId: string, filters = selectedFilters) => {
    setLoading(true);
    setError(null);
    
    try {
      const category = categories.find((cat) => cat.id === categoryId);
      if (!category) return;

      let url = "/api/products?";
      
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
      
      if (filters.categories.length > 0) {
        filters.categories.forEach((cat) => {
          url += `category=${cat}&`;
        });
      }

      if (filters.designers.length > 0) {
        filters.designers.forEach((designer) => {
          url += `designer=${encodeURIComponent(designer)}&`;
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

      const response = await fetch(url);
      const result = await response.json();

      if (result.error) {
        throw new Error(result.error.message);
      }

      // Transform API data to match component structure
      const transformedProducts = (result.data || []).map((product: any) => ({
        id: product.id,
        name: product.name,
        brand: product.brand,
        category: product.category,
        original_price: product.original_price,
        sale_price: product.sale_price,
        discount_percentage: product.discount_percentage,
        image_url: (product.images && product.images.length > 0) 
          ? product.images[0] 
          : product.image_url || "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800&q=80",
        is_new_arrival: product.is_new_arrival,
        is_on_sale: product.is_on_sale,
      }));

      setProducts(transformedProducts);
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
      } else if (filterType === "designer") {
        const designers = [...prev.designers];
        const index = designers.indexOf(value as string);
        if (index > -1) {
          designers.splice(index, 1);
        } else {
          designers.push(value as string);
        }
        newFilters.designers = designers;
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

  useEffect(() => {
    fetchFilterOptions();
  }, []);

  useEffect(() => {
    fetchProducts(activeCategory, selectedFilters);
  }, [activeCategory, selectedFilters]);

  useEffect(() => {
    if (priceSliderRef.current) {
      const slider = priceSliderRef.current;
      const value = slider.value;
      const percentage = (parseInt(value) / 5000) * 100;
      slider.style.background = `linear-gradient(to right, #000 0%, #000 ${percentage}%, #e5e7eb ${percentage}%, #e5e7eb 100%)`;
    }
  }, []);

  return (
    <main className="min-h-screen bg-white">
       {/* Navigation Header */}
       <section className="border-b border-gray-200 h-[100px] flex items-center">
         <div className="w-full px-6 sm:px-8 lg:px-12 xl:px-16 2xl:px-24">
           <nav className="flex items-center justify-center gap-8">
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
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold">
            {categories.find((cat) => cat.id === activeCategory)?.label || "Products"}
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
                    Product / {categories.find((cat) => cat.id === activeCategory)?.label || "Products"}
                  </p>
                  <h2 className="text-3xl font-bold text-gray-900">
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
                        <span className="text-sm font-bold text-gray-900 uppercase tracking-wide">
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
                            {category.id === "designer" && (
                              <div className="space-y-2 max-h-60 overflow-y-auto">
                                {filterOptions.designers.length > 0 ? (
                                  filterOptions.designers.map((designer) => (
                                    <label key={designer} className="flex items-center cursor-pointer hover:bg-gray-50 p-1 rounded">
                                      <input
                                        type="checkbox"
                                        checked={selectedFilters.designers.includes(designer)}
                                        onChange={() => handleFilterChange("designer", designer)}
                                        className="mr-2"
                                      />
                                      <span>{designer}</span>
                                </label>
                                  ))
                                ) : (
                                  <p className="text-xs text-gray-400">No designers available</p>
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
                                <input
                                  ref={priceSliderRef}
                                  type="range"
                                  min="0"
                                  max="5000"
                                  value={selectedFilters.maxPrice}
                                  className="w-full slider-black"
                                  onChange={(e) => {
                                    const value = parseInt(e.target.value);
                                    handleFilterChange("maxPrice", value);
                                    const percentage = (value / 5000) * 100;
                                    e.target.style.background = `linear-gradient(to right, #000 0%, #000 ${percentage}%, #e5e7eb ${percentage}%, #e5e7eb 100%)`;
                                  }}
                                />
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
                      
                      {/* New Badge - Top Right of Image */}
                          {product.is_new_arrival && (
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
                        onClick={(e) => {
                          e.preventDefault();
                          // Handle wishlist
                        }}
                        className="bg-white/90 backdrop-blur-sm p-2 rounded-full shadow-sm hover:bg-white text-gray-600 hover:text-red-500 transition-all duration-300 hover:scale-110"
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
                        <span className="text-sm text-gray-400 line-through">
                              ${product.original_price.toLocaleString()}
                        </span>
                            {discount > 0 && (
                        <span className="text-xs font-bold text-red-600 bg-red-50 px-2 py-0.5 rounded">
                                -{discount}%
                        </span>
                            )}
                        <span className="text-base font-bold text-gray-900 ml-auto">
                              ${product.sale_price.toLocaleString()}
                        </span>
                      </div>
                      
                      {/* Add to Cart Button - Hidden by default, shown on hover */}
                      <button 
                        onClick={(e) => {
                          e.preventDefault();
                          // Handle add to cart
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
