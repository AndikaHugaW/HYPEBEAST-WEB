"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import MultipleImageUpload from "@/components/MultipleImageUpload";

export default function NewProduct() {
  const router = useRouter();

  const [saving, setSaving] = useState(false);
  const [brands, setBrands] = useState<string[]>([]);
  const [loadingBrands, setLoadingBrands] = useState(true);
  const [newBrand, setNewBrand] = useState("");
  const [showNewBrandInput, setShowNewBrandInput] = useState(false);
  
  // Form fields
  const [name, setName] = useState("");
  const [brand, setBrand] = useState("");
  const [price, setPrice] = useState("");
  const [category, setCategory] = useState("");
  const [gender, setGender] = useState("");
  const [description, setDescription] = useState("");
  const [imageUrls, setImageUrls] = useState<string[]>(Array(4).fill(""));

  // Available categories
  const categories = [
    { value: "new-arrival", label: "New Arrival" },
    { value: "apparel", label: "Apparel" },
    { value: "footwear", label: "Footwear" },
    { value: "accessories", label: "Accessories" },
    { value: "lifestyle", label: "Lifestyle" },
  ];

  // Fetch brands from API
  useEffect(() => {
    const fetchBrands = async () => {
      try {
        const response = await fetch("/api/products/filters");
        const result = await response.json();
        if (!result.error && result.brands) {
          setBrands(result.brands);
        }
      } catch (err) {
        console.error("Error fetching brands:", err);
      } finally {
        setLoadingBrands(false);
      }
    };
    fetchBrands();
  }, []);

  // Handle add new brand
  const handleAddNewBrand = () => {
    if (!newBrand.trim()) {
      alert("Brand name is required");
      return;
    }

    const trimmedBrand = newBrand.trim();
    
    // Check if brand already exists
    if (brands.includes(trimmedBrand)) {
      alert("Brand already exists");
      setNewBrand("");
      setShowNewBrandInput(false);
      return;
    }

    // Add to local state
    const updatedBrands = [...brands, trimmedBrand].sort();
    setBrands(updatedBrands);
    setBrand(trimmedBrand);
    setNewBrand("");
    setShowNewBrandInput(false);
  };

  const handleImageUpload = async (url: string, path: string, index: number) => {
    if (url) {
      setImageUrls((prevUrls) => {
        const newUrls = [...prevUrls];
        newUrls[index] = url;
        return newUrls;
      });
    }
  };

  const handleImageRemove = (index: number) => {
    setImageUrls((prevUrls) => {
      const newUrls = [...prevUrls];
      newUrls[index] = "";
      return newUrls;
    });
  };

  const handleSave = async () => {
    // Validation
    if (!name.trim()) {
      alert("Product name is required");
      return;
    }
    if (!brand.trim()) {
      alert("Brand is required");
      return;
    }
    if (!price || parseFloat(price) <= 0) {
      alert("Valid price is required");
      return;
    }
    if (parseFloat(price) > 100000) {
      alert("Price cannot exceed $100,000");
      return;
    }
    if (!category) {
      alert("Category is required");
      return;
    }

    // Clean image URLs - remove empty strings and cache busters
    const cleanImageUrls = imageUrls
      .filter((url) => url && url.trim() !== "")
      .map((url) => {
        // Remove cache buster and query parameters for storage
        return url.split('?')[0].split('&')[0];
      })
      .filter((url) => url !== "");

    if (cleanImageUrls.length === 0) {
      alert("At least one image is required");
      return;
    }

    setSaving(true);
    try {
      const response = await fetch("/api/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          brand: brand.trim(),
          sale_price: parseFloat(price),
          images: cleanImageUrls,
          category: category,
          gender: gender || null,
          description: description.trim() || null,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        // Redirect to product detail page (user view)
        router.push(`/products/${data.id}`);
      } else {
        const error = await response.json();
        alert(error.error?.message || "Failed to create product");
      }
    } catch (err: any) {
      console.error("Error creating product:", err);
      alert("Failed to create product: " + (err.message || "Unknown error"));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Add New Product</h1>
          <Link
            href="/admin/products"
            className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-gray-900 font-normal"
          >
            ← Back to Products
          </Link>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-6 space-y-6">
          {/* Product Name */}
          <div>
            <label className="block text-sm font-normal text-gray-900 mb-2">
              Product Name *
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent bg-white text-gray-900"
              placeholder="Enter product name"
            />
          </div>

          {/* Brand */}
          <div>
            <label className="block text-sm font-normal text-gray-900 mb-2">
              Brand *
            </label>
            <div className="space-y-2">
              <div className="flex gap-2">
                <select
                  value={brand}
                  onChange={(e) => {
                    if (e.target.value === "new") {
                      setShowNewBrandInput(true);
                      setBrand("");
                    } else {
                      setBrand(e.target.value);
                      setShowNewBrandInput(false);
                    }
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent bg-white text-gray-900"
                >
                  <option value="">Select a brand</option>
                  {brands.map((b) => (
                    <option key={b} value={b}>
                      {b}
                    </option>
                  ))}
                  <option value="new">+ Add New Brand</option>
                </select>
              </div>
              
              {showNewBrandInput && (
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newBrand}
                    onChange={(e) => setNewBrand(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        handleAddNewBrand();
                      }
                    }}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent bg-white text-gray-900"
                    placeholder="Enter new brand name"
                    autoFocus
                  />
                  <button
                    onClick={handleAddNewBrand}
                    className="px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors font-medium"
                  >
                    Add
                  </button>
                  <button
                    onClick={() => {
                      setShowNewBrandInput(false);
                      setNewBrand("");
                    }}
                    className="px-4 py-2 border border-gray-300 text-gray-900 rounded-lg hover:bg-gray-50 transition-colors font-normal"
                  >
                    Cancel
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Price */}
          <div>
            <label className="block text-sm font-normal text-gray-900 mb-2">
              Price *
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-900 font-normal">$</span>
              <input
                type="number"
                step="0.01"
                min="0"
                max="100000"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                className="w-full pl-8 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent bg-white text-gray-900"
                placeholder="0.00"
              />
            </div>
          </div>

          {/* Category */}
          <div>
            <label className="block text-sm font-normal text-gray-900 mb-2">
              Category *
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent bg-white text-gray-900"
            >
              <option value="">Select a category</option>
              {categories.map((cat) => (
                <option key={cat.value} value={cat.value}>
                  {cat.label}
                </option>
              ))}
            </select>
          </div>

          {/* Gender */}
          <div>
            <label className="block text-sm font-normal text-gray-900 mb-2">
              Gender
            </label>
            <select
              value={gender}
              onChange={(e) => setGender(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent bg-white text-gray-900"
            >
              <option value="">Select gender (optional)</option>
              <option value="men">Men</option>
              <option value="woman">Woman</option>
            </select>
          </div>

          {/* Description */}
          <div>
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

          {/* Image Upload */}
          <div>
            <MultipleImageUpload
              label="Product Images *"
              existingImages={imageUrls}
              onUploadComplete={handleImageUpload}
              onRemove={handleImageRemove}
              maxImages={4}
            />
          </div>

          {/* Save Button */}
          <div className="flex gap-4 pt-4">
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex-1 px-6 py-3 bg-black text-white rounded-lg font-medium hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? "Creating..." : "Create Product"}
            </button>
            <Link
              href="/admin/products"
              className="px-6 py-3 border border-gray-300 text-gray-900 rounded-lg font-normal hover:bg-gray-50 transition-colors"
            >
              Cancel
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

