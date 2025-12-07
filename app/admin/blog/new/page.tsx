"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";

export default function NewBlogPost() {
  const router = useRouter();

  const [saving, setSaving] = useState(false);
  const [headline, setHeadline] = useState("");
  const [subheadline, setSubheadline] = useState("");
  const [category, setCategory] = useState("");
  const [author, setAuthor] = useState("");
  const [date, setDate] = useState("");
  const [image, setImage] = useState("");
  const [content, setContent] = useState("");
  const [uploading, setUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);

  const categories = [
    "Music",
    "Fashion",
    "Footwear",
    "Tech",
    "Culture",
    "Entertainment",
    "Lifestyle",
    "Sports",
    "Art",
    "Gaming",
    "Food",
    "Travel",
    "Beauty",
    "Fitness",
    "Design",
  ];

  const handleImageUpload = async (file: File) => {
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("/api/products/upload-image", {
        method: "POST",
        body: formData,
      });

      if (response.ok) {
        const data = await response.json();
        setImage(data.url);
        return data.url;
      } else {
        alert("Failed to upload image");
        return null;
      }
    } catch (error) {
      console.error("Error uploading image:", error);
      alert("Failed to upload image");
      return null;
    } finally {
      setUploading(false);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (file.type.startsWith("image/")) {
        handleImageUpload(file);
      } else {
        alert("Please upload an image file");
      }
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleImageUpload(e.target.files[0]);
    }
  };

  const handleSave = async () => {
    // Validation
    if (!headline.trim()) {
      alert("Headline is required");
      return;
    }
    if (!category.trim()) {
      alert("Category is required");
      return;
    }
    if (!image.trim()) {
      alert("Image is required");
      return;
    }

    setSaving(true);

    try {
      // Generate slug from headline
      const slug = headline
        .toLowerCase()
        .trim()
        .replace(/[^\w\s-]/g, "")
        .replace(/[\s_-]+/g, "-")
        .replace(/^-+|-+$/g, "");

      const response = await fetch("/api/blog", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          headline: headline.trim(),
          subheadline: subheadline.trim(),
          category: category.trim(),
          author: author.trim() || "Admin",
          date: date || new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
          image,
          content: content.trim(),
          slug,
          likes: 0,
          comments: 0,
        }),
      });

      if (response.ok) {
        // Redirect back to admin blog list page
        router.push("/admin/blog");
      } else {
        const errorData = await response.json();
        alert(errorData.error?.message || "Failed to create blog post");
      }
    } catch (error) {
      console.error("Error creating blog post:", error);
      alert("Failed to create blog post");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="p-8">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/admin/blog"
            className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Blog Posts
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">Add New Blog Post</h1>
        </div>

        {/* Form */}
        <div className="bg-white rounded-lg p-8 max-w-4xl">
          <div className="space-y-6">
            {/* Headline */}
            <div>
              <label className="block text-sm font-normal text-gray-900 mb-2">
                Headline *
              </label>
              <input
                type="text"
                value={headline}
                onChange={(e) => setHeadline(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent bg-white text-gray-900"
                placeholder="Enter headline"
              />
            </div>

            {/* Subheadline */}
            <div>
              <label className="block text-sm font-normal text-gray-900 mb-2">
                Subheadline
              </label>
              <textarea
                value={subheadline}
                onChange={(e) => setSubheadline(e.target.value)}
                rows={3}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent bg-white text-gray-900"
                placeholder="Enter subheadline"
              />
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
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            {/* Author */}
            <div>
              <label className="block text-sm font-normal text-gray-900 mb-2">
                Author
              </label>
              <input
                type="text"
                value={author}
                onChange={(e) => setAuthor(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent bg-white text-gray-900"
                placeholder="Enter author name"
              />
            </div>

            {/* Date */}
            <div>
              <label className="block text-sm font-normal text-gray-900 mb-2">
                Date
              </label>
              <input
                type="text"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent bg-white text-gray-900"
                placeholder="Nov 10, 2025"
              />
            </div>

            {/* Image Upload */}
            <div>
              <label className="block text-sm font-normal text-gray-900 mb-2">
                Image *
              </label>
              
              {!image ? (
                <div
                  onDragEnter={handleDrag}
                  onDragLeave={handleDrag}
                  onDragOver={handleDrag}
                  onDrop={handleDrop}
                  className={`relative border-2 border-dashed rounded-xl transition-all duration-200 ${
                    dragActive
                      ? "border-black bg-gray-50"
                      : "border-gray-300 hover:border-gray-400"
                  } ${uploading ? "opacity-50 pointer-events-none" : ""}`}
                >
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileInput}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    disabled={uploading}
                  />
                  <div className="p-12 text-center">
                    {uploading ? (
                      <div className="flex flex-col items-center gap-4">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black"></div>
                        <p className="text-sm text-gray-600">Uploading image...</p>
                      </div>
                    ) : (
                      <>
                        <div className="flex justify-center mb-4">
                          <svg
                            className="w-16 h-16 text-gray-400"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                            />
                          </svg>
                        </div>
                        <p className="text-base font-medium text-gray-900 mb-2">
                          Drag and drop an image here, or click to select
                        </p>
                        <p className="text-sm text-gray-500">
                          PNG, JPG, GIF up to 10MB
                        </p>
                      </>
                    )}
                  </div>
                </div>
              ) : (
                <div className="relative group">
                  <div className="relative w-full h-80 rounded-xl overflow-hidden border-2 border-gray-200 shadow-sm">
                    <Image
                      src={image}
                      alt="Preview"
                      fill
                      className="object-cover"
                      unoptimized
                    />
                    {/* Overlay on hover */}
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center">
                      <button
                        onClick={() => setImage("")}
                        className="bg-white text-black px-6 py-3 rounded-lg font-medium hover:bg-gray-100 transition-colors flex items-center gap-2"
                        type="button"
                      >
                        <svg
                          className="w-5 h-5"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"
                          />
                        </svg>
                        Change Image
                      </button>
                    </div>
                  </div>
                  {/* Remove button */}
                  <button
                    onClick={() => setImage("")}
                    className="absolute top-4 right-4 bg-red-500 text-white p-2 rounded-full hover:bg-red-600 transition-colors shadow-lg opacity-0 group-hover:opacity-100"
                    type="button"
                  >
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                </div>
              )}
            </div>

            {/* Content */}
            <div>
              <label className="block text-sm font-normal text-gray-900 mb-2">
                Content
              </label>
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                rows={10}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent bg-white text-gray-900"
                placeholder="Enter blog content"
              />
            </div>

            {/* Actions */}
            <div className="flex items-center gap-4 pt-4">
              <button
                onClick={handleSave}
                disabled={saving}
                className="bg-black text-white px-6 py-3 rounded-lg font-medium hover:bg-gray-800 transition-colors disabled:opacity-50"
              >
                {saving ? "Saving..." : "Save Post"}
              </button>
              <Link
                href="/admin/blog"
                className="border border-gray-300 text-gray-900 px-6 py-3 rounded-lg font-normal hover:bg-gray-50 transition-colors"
              >
                Cancel
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

