"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Image from "next/image";

type Order = {
  id: string;
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  productName: string;
  productImage: string;
  quantity: number;
  price: number;
  status: "pending" | "processing" | "completed" | "cancelled";
  date: string;
};

export default function AdminOrders() {
  const { user, profile, loading } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [loadingOrders, setLoadingOrders] = useState(true);

  useEffect(() => {
    if (!loading && user && profile?.role === 'admin') {
      fetchOrders();
    }
  }, [user, profile, loading]);

  const fetchOrders = async () => {
    try {
      setLoadingOrders(true);
      // TODO: Replace with actual API call
      // Simulated data
      const mockOrders: Order[] = [
        {
          id: "1",
          orderNumber: "ORD-001",
          customerName: "John Doe",
          customerEmail: "john@example.com",
          productName: "Nike Air Max",
          productImage: "/placeholder-product.jpg",
          quantity: 2,
          price: 299.99,
          status: "pending",
          date: "2024-01-15",
        },
        {
          id: "2",
          orderNumber: "ORD-002",
          customerName: "Jane Smith",
          customerEmail: "jane@example.com",
          productName: "Adidas Ultraboost",
          productImage: "/placeholder-product.jpg",
          quantity: 1,
          price: 199.99,
          status: "processing",
          date: "2024-01-14",
        },
        {
          id: "3",
          orderNumber: "ORD-003",
          customerName: "Bob Johnson",
          customerEmail: "bob@example.com",
          productName: "Puma RS-X",
          productImage: "/placeholder-product.jpg",
          quantity: 3,
          price: 149.99,
          status: "completed",
          date: "2024-01-13",
        },
      ];
      setOrders(mockOrders);
    } catch (error) {
      console.error("Error fetching orders:", error);
    } finally {
      setLoadingOrders(false);
    }
  };

  const filteredOrders = filterStatus === "all" 
    ? orders 
    : orders.filter(order => order.status === filterStatus);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "processing":
        return "bg-blue-100 text-blue-800";
      case "completed":
        return "bg-green-100 text-green-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  if (loading || loadingOrders) {
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
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Orders Management</h1>
            <p className="text-gray-600">Manage and track all customer orders</p>
          </div>

          {/* Filters */}
          <Card className="mb-6">
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <span className="text-sm font-medium text-gray-700">Filter by Status:</span>
                <div className="flex gap-2">
                  {["all", "pending", "processing", "completed", "cancelled"].map((status) => (
                    <button
                      key={status}
                      onClick={() => setFilterStatus(status)}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                        filterStatus === status
                          ? "bg-blue-600 text-white"
                          : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                      }`}
                    >
                      {status.charAt(0).toUpperCase() + status.slice(1)}
                    </button>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Orders Table */}
          <Card>
            <CardHeader>
              <CardTitle>All Orders ({filteredOrders.length})</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">Order #</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">Customer</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">Product</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">Quantity</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">Price</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">Status</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">Date</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredOrders.length === 0 ? (
                      <tr>
                        <td colSpan={8} className="text-center py-8 text-gray-500">
                          No orders found
                        </td>
                      </tr>
                    ) : (
                      filteredOrders.map((order) => (
                        <tr key={order.id} className="border-b hover:bg-gray-50">
                          <td className="py-4 px-4">
                            <span className="font-medium text-gray-900">{order.orderNumber}</span>
                          </td>
                          <td className="py-4 px-4">
                            <div>
                              <div className="font-medium text-gray-900">{order.customerName}</div>
                              <div className="text-sm text-gray-500">{order.customerEmail}</div>
                            </div>
                          </td>
                          <td className="py-4 px-4">
                            <div className="flex items-center gap-3">
                              <div className="w-12 h-12 bg-gray-200 rounded-lg flex items-center justify-center">
                                <Image
                                  src={order.productImage}
                                  alt={order.productName}
                                  width={48}
                                  height={48}
                                  className="rounded-lg"
                                />
                              </div>
                              <span className="font-medium text-gray-900">{order.productName}</span>
                            </div>
                          </td>
                          <td className="py-4 px-4">
                            <span className="text-gray-900">{order.quantity}</span>
                          </td>
                          <td className="py-4 px-4">
                            <span className="font-medium text-gray-900">${order.price.toFixed(2)}</span>
                          </td>
                          <td className="py-4 px-4">
                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                              {order.status}
                            </span>
                          </td>
                          <td className="py-4 px-4">
                            <span className="text-gray-600">{order.date}</span>
                          </td>
                          <td className="py-4 px-4">
                            <div className="flex items-center gap-2">
                              <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                                View
                              </button>
                              <button className="text-gray-600 hover:text-gray-800 text-sm font-medium">
                                Edit
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

