"use client";

import { useState, useEffect, useMemo } from "react";
import Image from "next/image";

interface MultipleImageUploadProps {
  onUploadComplete: (url: string, path: string, index: number) => void;
  onRemove: (index: number) => void;
  productId?: string;
  existingImages?: string[];
  maxImages?: number;
  label?: string;
}

export default function MultipleImageUpload({
  onUploadComplete,
  onRemove,
  productId,
  existingImages = [],
  maxImages = 4,
  label = "Upload Images",
}: MultipleImageUploadProps) {
  const [uploading, setUploading] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [localImages, setLocalImages] = useState<string[]>(existingImages);
  
  // Update localImages when existingImages prop changes
  useEffect(() => {
    // Ensure existingImages has maxImages length
    const padded = [...existingImages];
    while (padded.length < maxImages) {
      padded.push("");
    }
    setLocalImages(padded.slice(0, maxImages));
  }, [existingImages, maxImages]);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
    if (!allowedTypes.includes(file.type)) {
      setError("Only JPEG, PNG, and WebP images are allowed");
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError("File size must be less than 5MB");
      return;
    }

    // Upload file
    setUploading(index);
    setError(null);

    try {
      const formData = new FormData();
      formData.append("file", file);
      if (productId) {
        formData.append("productId", productId);
      }

      const response = await fetch("/api/products/upload-image", {
        method: "POST",
        body: formData,
      });

      const result = await response.json();

      if (result.error) {
        throw new Error(result.error.message);
      }

      // Add cache buster to force refresh
      const urlWithCacheBuster = `${result.url}?t=${Date.now()}`;
      
      // Show success alert
      alert(`Gambar berhasil di-upload!`);
      
      // Clear any previous errors
      setError(null);
      
      // Call callback to update parent state
      onUploadComplete(urlWithCacheBuster, result.path, index);
    } catch (err: any) {
      const errorMessage = err.message || "Gagal mengupload gambar";
      setError(errorMessage);
      // Show error alert
      alert(`Error: ${errorMessage}`);
    } finally {
      setUploading(null);
      // Reset input
      e.target.value = "";
    }
  };

  const handleRemoveImage = async (index: number, imageUrl: string) => {
    // Extract path from URL if it's a Supabase URL
    try {
      const url = new URL(imageUrl);
      const path = url.pathname.split("/storage/v1/object/public/product-images/")[1];

      if (path) {
        try {
          const response = await fetch(
            `/api/products/upload-image?path=${encodeURIComponent(`products/${path}`)}`,
            {
              method: "DELETE",
            }
          );

          if (!response.ok) {
            console.error("Failed to delete image from storage");
          }
        } catch (err) {
          console.error("Error deleting image:", err);
        }
      }
    } catch (err) {
      // If URL parsing fails, just continue with removal
      console.error("Error parsing image URL:", err);
    }

    onRemove(index);
  };

  // Create array of image slots (maxImages slots)
  const imageSlots = Array.from({ length: maxImages }, (_, i) => i);
  
  // Use localImages state instead of existingImages prop directly
  // This ensures component re-renders when images change
  const paddedImages = useMemo(() => {
    const padded = [...localImages];
    while (padded.length < maxImages) {
      padded.push("");
    }
    return padded.slice(0, maxImages);
  }, [localImages, maxImages]);

  return (
    <div className="space-y-4">
      <label className="block text-sm font-medium text-gray-700">{label}</label>
      {error && <p className="text-sm text-red-600">{error}</p>}
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {imageSlots.map((slotIndex) => {
          const imageUrl = paddedImages[slotIndex];
          const existingImage = imageUrl && imageUrl.trim() !== "" ? imageUrl : null;
          const isUploading = uploading === slotIndex;

          return (
            <div key={slotIndex} className="relative group">
              {existingImage ? (
                <div className="relative aspect-square bg-gray-100 rounded-lg overflow-hidden border-2 border-gray-200">
                  <Image
                    key={`${existingImage}-${slotIndex}`} // Force re-render when image changes
                    src={existingImage}
                    alt={`Product image ${slotIndex + 1}`}
                    fill
                    className="object-cover"
                    unoptimized
                  />
                  {slotIndex === 0 && (
                    <span className="absolute top-2 left-2 bg-black text-white text-xs px-2 py-1 rounded z-10">
                      Primary
                    </span>
                  )}
                  <button
                    onClick={() => handleRemoveImage(slotIndex, existingImage)}
                    className="absolute top-2 right-2 bg-red-500 text-white p-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity z-10"
                    type="button"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              ) : (
                <div className="relative aspect-square border-2 border-dashed border-gray-300 rounded-lg overflow-hidden hover:border-gray-400 transition-colors">
                  <input
                    type="file"
                    accept="image/jpeg,image/jpg,image/png,image/webp"
                    onChange={(e) => handleFileChange(e, slotIndex)}
                    disabled={isUploading}
                    className="hidden"
                    id={`image-upload-${slotIndex}`}
                  />
                  <label
                    htmlFor={`image-upload-${slotIndex}`}
                    className={`cursor-pointer flex flex-col items-center justify-center h-full ${
                      isUploading ? "opacity-50" : ""
                    }`}
                  >
                    {isUploading ? (
                      <>
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-900 mb-2"></div>
                        <span className="text-xs text-gray-600">Uploading...</span>
                      </>
                    ) : (
                      <>
                        <svg
                          className="w-8 h-8 text-gray-400 mb-2"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M12 4v16m8-8H4"
                          />
                        </svg>
                        <span className="text-xs text-gray-600 text-center px-2">
                          Image {slotIndex + 1}
                        </span>
                      </>
                    )}
                  </label>
                </div>
              )}
            </div>
          );
        })}
      </div>
      <p className="text-xs text-gray-500">You can upload up to {maxImages} images. The first image will be used as the primary image.</p>
    </div>
  );
}

