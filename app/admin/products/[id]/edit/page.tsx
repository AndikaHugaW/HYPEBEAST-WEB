"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import MultipleImageUpload from "@/components/MultipleImageUpload";

export default function EditProduct() {
  const params = useParams();
  const router = useRouter();
  const productId = params.id as string;

  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  // Form fields
  const [name, setName] = useState("");
  const [brand, setBrand] = useState("");
  const [price, setPrice] = useState("");
  const [category, setCategory] = useState("");
  const [gender, setGender] = useState("");
  const [description, setDescription] = useState("");
  const [imageUrls, setImageUrls] = useState<string[]>([]);

  // Available categories
  const categories = [
    { value: "new-arrival", label: "New Arrival" },
    { value: "apparel", label: "Apparel" },
    { value: "footwear", label: "Footwear" },
    { value: "accessories", label: "Accessories" },
    { value: "lifestyle", label: "Lifestyle" },
  ];

  // Helper function to add cache busting parameter to image URL
  const addCacheBuster = (url: string) => {
    if (!url) return url;
    const separator = url.includes('?') ? '&' : '?';
    return `${url}${separator}t=${Date.now()}`;
  };

  useEffect(() => {
    // Fetch product data
    fetch(`/api/products/${productId}`)
      .then((res) => res.json())
      .then((data) => {
        setProduct(data);
        setName(data.name || "");
        setBrand(data.brand || "");
        setPrice(data.sale_price?.toString() || "");
        setCategory(data.category || "");
        setGender(data.gender || "");
        setDescription(data.description || "");
        
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
        
        // Ensure images array has exactly 4 slots
        const paddedImages = [...images];
        while (paddedImages.length < 4) {
          paddedImages.push("");
        }
        // Add cache buster to all image URLs
        const imagesWithCacheBuster = paddedImages.slice(0, 4).map((img: string) => 
          img && img.trim() !== "" ? addCacheBuster(img) : ""
        );
        setImageUrls(imagesWithCacheBuster);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching product:", err);
        setLoading(false);
      });
  }, [productId]);

  const handleImageUpload = async (url: string, path: string, index: number) => {
    if (url) {
      // URL already has cache buster from MultipleImageUpload component
      // Create new array with exactly 4 slots, preserving existing images
      // Use functional update to ensure we have the latest state
      setImageUrls((prevUrls) => {
        // Ensure prevUrls has at least 4 slots
        const paddedPrevUrls = [...prevUrls];
        while (paddedPrevUrls.length < 4) {
          paddedPrevUrls.push("");
        }
        
        // Create completely new array with new reference
        const newUrls = [...Array(4)].map((_, i) => {
          // If this is the index we're updating, use the new URL
          if (i === index) {
            return url;
          }
          // Otherwise, keep existing image at this position (if it exists)
          if (i < paddedPrevUrls.length && paddedPrevUrls[i] && paddedPrevUrls[i].trim() !== "") {
            return paddedPrevUrls[i];
          }
          // Fill empty slots with empty string
          return "";
        });
        
        // Save to database immediately for real-time update
        const cleanUrls = newUrls
          .filter(u => u && u.trim() !== "")
          .map(u => {
            // Remove cache buster for storage
            return u.split('?')[0].split('&')[0];
          });
        
        // Save to database immediately (don't block UI)
        // This ensures images are saved immediately so they appear in detail page in real-time
        fetch(`/api/products/${productId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            images: cleanUrls,
          }),
        })
        .then((res) => {
          if (!res.ok) {
            throw new Error("Failed to save images");
          }
          return res.json();
        })
        .then((data) => {
          // Update product state with saved images
          setProduct((prevProduct) => ({
            ...prevProduct,
            images: cleanUrls,
          }));
          console.log("Images saved to database successfully - will appear in detail page within 1 second");
        })
        .catch((err) => {
          console.error("Error saving images to database:", err);
          alert(`Error: ${err.message || "Failed to save images to database"}`);
        });
        
        // Return new array with new reference - CRITICAL for React to detect change
        return newUrls;
      });
    }
  };

  const handleImageRemove = (index: number) => {
    // Create new array with the image at index removed
    const newUrls = [...imageUrls];
    newUrls[index] = "";
    
    // Ensure array has exactly 4 slots
    while (newUrls.length < 4) {
      newUrls.push("");
    }
    
    setImageUrls(newUrls.slice(0, 4));
    
    // Also update product state
    setProduct({
      ...product,
      images: newUrls.filter(u => u && u.trim() !== "").map(u => {
        // Remove cache buster for storage
        return u.split('?')[0].split('&')[0];
      }),
    });
  };

  const handleSave = async () => {
    // Validation
    if (!name.trim()) {
      alert("Product name is required");
      return;
    }
    if (!brand.trim()) {
      alert("Brand name is required");
      return;
    }
    if (!price.trim() || isNaN(parseFloat(price)) || parseFloat(price) <= 0) {
      alert("Please enter a valid price");
      return;
    }

    setSaving(true);
    try {
      // Get current imageUrls state - ensure we have exactly 4 slots
      const currentUrls = [...imageUrls];
      while (currentUrls.length < 4) {
        currentUrls.push("");
      }
      
      // Clean URLs (remove cache busters) before saving to database
      // Filter out empty strings and clean URLs
      const cleanImageUrls = currentUrls
        .slice(0, 4) // Ensure max 4 images
        .filter(url => url && url.trim() !== "") // Remove empty strings
        .map(url => {
          // Remove cache buster and any query parameters
          const cleanUrl = url.split('?')[0].split('&')[0];
          return cleanUrl.trim();
        })
        .filter(url => url !== ""); // Remove any empty strings after cleaning
      
      const response = await fetch(`/api/products/${productId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          brand: brand.trim(),
          sale_price: parseFloat(price),
          category: category || null,
          gender: gender || null,
          images: cleanImageUrls,
          description: description.trim() || null,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || "Failed to update product");
      }

      const updatedProduct = await response.json();
      
      // Refresh product data from server to ensure we have the latest state
      // This prevents stuck images issue
      const refreshResponse = await fetch(`/api/products/${productId}?t=${Date.now()}`);
      const refreshedProduct = await refreshResponse.json();
      
      // Update local state with refreshed data
      if (refreshedProduct.images && Array.isArray(refreshedProduct.images)) {
        const refreshedImages = [...refreshedProduct.images];
        while (refreshedImages.length < 4) {
          refreshedImages.push("");
        }
        setImageUrls(refreshedImages.slice(0, 4).map((img: string) => 
          img && img.trim() !== "" ? addCacheBuster(img) : ""
        ));
      }
      
      setProduct(refreshedProduct);

      alert("Product updated successfully!");
      
      // Small delay before redirect to ensure state is updated
      setTimeout(() => {
        router.push("/admin/products");
      }, 100);
    } catch (err: any) {
      console.error("Error updating product:", err);
      alert(err.message || "Failed to update product");
    } finally {
      setSaving(false);
    }
  };

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
          <p className="text-gray-900 mb-4 font-normal">Product not found</p>
          <Link
            href="/admin/products"
            className="text-gray-900 hover:underline"
          >
            ← Back to Products
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="p-6">
        <div className="max-w-4xl mx-auto">
          <div className="mb-6">
            <Link
              href="/admin/products"
              className="text-gray-900 hover:text-gray-700 mb-4 inline-block font-normal"
            >
              ← Back to Products
            </Link>
          </div>

          <h1 className="text-3xl font-bold text-gray-900 mb-8">Edit Product</h1>

          <div className="bg-white border border-gray-200 rounded-lg p-6 space-y-6">
            {/* Product Info Section */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-normal text-gray-900 mb-2">
                  Product Name *
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                  placeholder="Enter product name"
                />
              </div>

              <div>
                <label className="block text-sm font-normal text-gray-900 mb-2">
                  Brand *
                </label>
                <input
                  type="text"
                  value={brand}
                  onChange={(e) => setBrand(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                  placeholder="Enter brand name"
                />
              </div>

              <div>
                <label className="block text-sm font-normal text-gray-900 mb-2">
                  Price *
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-900 font-normal">$</span>
                  <input
                    type="number"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    className="w-full pl-8 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                    placeholder="0.00"
                    min="0"
                    step="0.01"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-normal text-gray-900 mb-2">
                  Category
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent bg-white"
                >
                  <option value="">Select a category</option>
                  {categories.map((cat) => (
                    <option key={cat.value} value={cat.value}>
                      {cat.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-normal text-gray-900 mb-2">
                  Gender
                </label>
                <select
                  value={gender}
                  onChange={(e) => setGender(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent bg-white"
                >
                  <option value="">Select gender (optional)</option>
                  <option value="men">Men</option>
                  <option value="woman">Woman</option>
                </select>
              </div>
            </div>

            {/* Description */}
            <div className="border-t border-gray-200 pt-6">
              <label className="block text-sm font-normal text-gray-900 mb-2">
                Description
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={6}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent bg-white text-gray-900 resize-y"
                placeholder="Enter product description..."
              />
            </div>

            {/* Images Section */}
            <div className="border-t border-gray-200 pt-6">
              <MultipleImageUpload
                key={`upload-${imageUrls.filter(u => u && u.trim() !== "").join('-')}-${imageUrls.length}`}
                onUploadComplete={handleImageUpload}
                onRemove={handleImageRemove}
                productId={productId}
                existingImages={imageUrls}
                maxImages={4}
                label="Product Images (up to 4 images)"
              />
            </div>

            {/* Action Buttons */}
            <div className="border-t border-gray-200 pt-6">
              <div className="flex gap-4">
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="px-6 py-2 bg-black text-white rounded-lg hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {saving ? "Saving..." : "Save Changes"}
                </button>
                <button
                  onClick={() => router.push("/admin/products")}
                  className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
