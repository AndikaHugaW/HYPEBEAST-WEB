"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";

type Product = {
  id: string;
  name: string;
  brand: string;
  category: string;
  images: string[];
  sale_price: number;
};

export default function AdminProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProducts();
  }, []);

  // Helper to add cache buster to image URL
  const getImageUrl = (url: string) => {
    if (!url) return url;
    const separator = url.includes('?') ? '&' : '?';
    return `${url}${separator}t=${Date.now()}`;
  };

  const fetchProducts = async () => {
    try {
      const response = await fetch("/api/products?limit=100");
      const result = await response.json();
      if (result.data) {
        setProducts(result.data);
      }
    } catch (err) {
      console.error("Error fetching products:", err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Manage Products</h1>
          <Link
            href="/admin/products/new"
            className="px-6 py-2 bg-black text-white rounded hover:bg-gray-800"
          >
            Add New Product
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map((product) => (
            <div
              key={product.id}
              className="border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition-shadow"
            >
              <div className="relative aspect-square bg-gray-100">
                {product.images && product.images.length > 0 ? (
                  <Image
                    src={getImageUrl(product.images[0])}
                    alt={product.name}
                    fill
                    className="object-cover"
                    unoptimized
                    key={`${product.id}-${product.images[0]}-${Date.now()}`}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400">
                    <svg
                      className="w-12 h-12"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                      />
                    </svg>
                  </div>
                )}
              </div>
              <div className="p-4">
                <p className="text-xs text-gray-900 uppercase mb-1 font-medium">{product.brand}</p>
                <h3 className="font-semibold mb-2 line-clamp-2 text-gray-900">{product.name}</h3>
                <p className="text-sm text-gray-900 mb-4 font-medium">${product.sale_price.toLocaleString()}</p>
                <Link
                  href={`/admin/products/${product.id}/edit`}
                  className="block w-full text-center px-4 py-2 bg-black text-white rounded hover:bg-gray-800 transition-colors"
                >
                  Edit Product
                </Link>
              </div>
            </div>
          ))}
        </div>

        {products.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-900">No products found.</p>
            <Link
              href="/admin/products/new"
              className="mt-4 inline-block px-6 py-2 bg-black text-white rounded hover:bg-gray-800"
            >
              Add Your First Product
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}

