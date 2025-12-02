"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type Discount = {
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
};

export default function AdminDiscount() {
  const { user, profile, loading } = useAuth();
  const [discounts, setDiscounts] = useState<Discount[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [editingDiscount, setEditingDiscount] = useState<Discount | null>(null);

  useEffect(() => {
    if (!loading && user && profile?.role === 'admin') {
      fetchDiscounts();
    }
  }, [user, profile, loading]);

  const fetchDiscounts = async () => {
    // TODO: Replace with actual API call
    const mockDiscounts: Discount[] = [
      {
        id: "1",
        code: "SUMMER20",
        name: "Summer Sale",
        type: "percentage",
        value: 20,
        minPurchase: 100,
        startDate: "2024-01-01",
        endDate: "2024-12-31",
        usageLimit: 1000,
        usedCount: 342,
        status: "active",
      },
      {
        id: "2",
        code: "WELCOME10",
        name: "Welcome Discount",
        type: "percentage",
        value: 10,
        startDate: "2024-01-01",
        endDate: "2024-12-31",
        usageLimit: 500,
        usedCount: 156,
        status: "active",
      },
      {
        id: "3",
        code: "FLAT50",
        name: "Flat $50 Off",
        type: "fixed",
        value: 50,
        minPurchase: 200,
        maxDiscount: 50,
        startDate: "2024-01-01",
        endDate: "2024-03-31",
        usageLimit: 200,
        usedCount: 89,
        status: "active",
      },
    ];
    setDiscounts(mockDiscounts);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800";
      case "inactive":
        return "bg-gray-100 text-gray-800";
      case "expired":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

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
        <div className="max-w-7xl mx-auto">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">Discount Management</h1>
              <p className="text-gray-600">Create and manage discount codes</p>
            </div>
            <button
              onClick={() => {
                setEditingDiscount(null);
                setShowModal(true);
              }}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              + Create Discount
            </button>
          </div>

          {/* Discount Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {discounts.map((discount) => (
              <Card key={discount.id}>
                <CardHeader>
                  <div className="flex items-center justify-between mb-2">
                    <CardTitle className="text-lg">{discount.name}</CardTitle>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(discount.status)}`}>
                      {discount.status}
                    </span>
                  </div>
                  <div className="bg-gray-100 p-3 rounded-lg">
                    <div className="text-sm text-gray-600 mb-1">Code</div>
                    <div className="text-xl font-bold text-gray-900">{discount.code}</div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div>
                      <div className="text-sm text-gray-600">Discount</div>
                      <div className="text-lg font-semibold text-gray-900">
                        {discount.type === "percentage" ? `${discount.value}%` : `$${discount.value}`}
                      </div>
                    </div>
                    {discount.minPurchase && (
                      <div>
                        <div className="text-sm text-gray-600">Min. Purchase</div>
                        <div className="font-medium text-gray-900">${discount.minPurchase}</div>
                      </div>
                    )}
                    <div>
                      <div className="text-sm text-gray-600">Valid Period</div>
                      <div className="text-sm text-gray-900">
                        {discount.startDate} to {discount.endDate}
                      </div>
                    </div>
                    {discount.usageLimit && (
                      <div>
                        <div className="text-sm text-gray-600">Usage</div>
                        <div className="text-sm text-gray-900">
                          {discount.usedCount} / {discount.usageLimit}
                        </div>
                        <div className="mt-1 h-2 bg-gray-200 rounded-full">
                          <div
                            className="h-2 bg-blue-600 rounded-full"
                            style={{ width: `${(discount.usedCount / discount.usageLimit) * 100}%` }}
                          />
                        </div>
                      </div>
                    )}
                    <div className="flex gap-2 pt-2">
                      <button
                        onClick={() => {
                          setEditingDiscount(discount);
                          setShowModal(true);
                        }}
                        className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50"
                      >
                        Edit
                      </button>
                      <button className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700">
                        Delete
                      </button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

