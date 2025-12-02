"use client";

import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type FAQ = {
  id: string;
  question: string;
  answer: string;
  category: string;
};

export default function AdminHelp() {
  const { user, profile, loading } = useAuth();
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [expandedFAQ, setExpandedFAQ] = useState<string | null>(null);

  const faqs: FAQ[] = [
    {
      id: "1",
      question: "How do I manage orders?",
      answer: "Go to the Orders page to view all customer orders. You can filter by status, view order details, and update order status.",
      category: "orders",
    },
    {
      id: "2",
      question: "How do I add a new product?",
      answer: "Navigate to the Products page and click 'Add New Product'. Fill in the product details, upload images, and set pricing.",
      category: "products",
    },
    {
      id: "3",
      question: "How do I create discount codes?",
      answer: "Go to the Discount page and click 'Create Discount'. Set the discount type (percentage or fixed), value, and validity period.",
      category: "discounts",
    },
    {
      id: "4",
      question: "How do I view analytics?",
      answer: "The Analytics page provides comprehensive insights including sales trends, order statistics, and category performance.",
      category: "analytics",
    },
    {
      id: "5",
      question: "How do I manage users?",
      answer: "Go to Manage User in the Tools section to view all users, edit user details, and manage user roles.",
      category: "users",
    },
  ];

  const categories = ["all", "orders", "products", "discounts", "analytics", "users"];

  const filteredFAQs = selectedCategory === "all"
    ? faqs
    : faqs.filter(faq => faq.category === selectedCategory);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (!user || (profile && profile.role !== 'admin')) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="p-6">
        <div className="max-w-4xl mx-auto">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Help & Support</h1>
            <p className="text-gray-600">Find answers to common questions and get support</p>
          </div>

          {/* Categories */}
          <Card className="mb-6">
            <CardContent className="pt-6">
              <div className="flex flex-wrap gap-2">
                {categories.map((category) => (
                  <button
                    key={category}
                    onClick={() => setSelectedCategory(category)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      selectedCategory === category
                        ? "bg-blue-600 text-white"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                  >
                    {category.charAt(0).toUpperCase() + category.slice(1)}
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* FAQs */}
          <div className="space-y-4">
            {filteredFAQs.map((faq) => (
              <Card key={faq.id}>
                <CardHeader>
                  <button
                    onClick={() => setExpandedFAQ(expandedFAQ === faq.id ? null : faq.id)}
                    className="w-full text-left"
                  >
                    <CardTitle className="flex items-center justify-between">
                      <span>{faq.question}</span>
                      <svg
                        className={`w-5 h-5 transition-transform ${
                          expandedFAQ === faq.id ? "transform rotate-180" : ""
                        }`}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </CardTitle>
                  </button>
                </CardHeader>
                {expandedFAQ === faq.id && (
                  <CardContent>
                    <p className="text-gray-600">{faq.answer}</p>
                  </CardContent>
                )}
              </Card>
            ))}
          </div>

          {/* Contact Support */}
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Still need help?</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4">
                If you can't find the answer you're looking for, please contact our support team.
              </p>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  <span className="text-gray-900">support@hypebeast.com</span>
                </div>
                <div className="flex items-center gap-2">
                  <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                  <span className="text-gray-900">+1 (555) 123-4567</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

