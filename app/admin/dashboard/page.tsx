"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";
import { Area, AreaChart, CartesianGrid, XAxis, YAxis, Line, LineChart } from "recharts";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import AdminHeader from "@/components/admin/AdminHeader";

type Stats = {
  totalTransaction: number;
  totalProduct: number;
  completeOrder: number;
  cancelOrder: number;
  transactionChange: number;
  productChange: number;
  completeOrderChange: number;
  cancelOrderChange: number;
};

type Transaction = {
  id: string;
  productName: string;
  category: string;
  price: number;
  date: string;
};

type RecentOrder = {
  id: string;
  productName: string;
  price: number;
  image: string;
};

type CountrySale = {
  country: string;
  percentage: number;
  flag: string;
};

export default function AdminDashboard() {
  const { user, profile, loading } = useAuth();
  const router = useRouter();
  const [stats, setStats] = useState<Stats>({
    totalTransaction: 345539,
    totalProduct: 420,
    completeOrder: 345,
    cancelOrder: 34,
    transactionChange: 34,
    productChange: 8,
    completeOrderChange: 25,
    cancelOrderChange: -3,
  });
  const [loadingStats, setLoadingStats] = useState(false); // Start as false, fetch stats in background
  const [timeRange, setTimeRange] = useState("Last Week");

  // Sample data for transactions
  const [transactions] = useState<Transaction[]>([
    { id: "#CDHT478", productName: "Polo T-Shirt", category: "Man", price: 120.20, date: "27 Jun, 2024" },
    { id: "#DKH4398", productName: "Jeans- Full Top", category: "Women", price: 90.95, date: "25 Jun, 2024" },
    { id: "#FEDJT478", productName: "Air-Jordan 4 Shoes", category: "Kids", price: 125.89, date: "24 Jun, 2024" },
    { id: "#CDHT478", productName: "Nike Shoes", category: "Women", price: 125.89, date: "24 Jun, 2024" },
  ]);

  // Sample data for recent orders
  const [recentOrders] = useState<RecentOrder[]>([
    { id: "1", productName: "Air Jordan 4 Shoes", price: 102.90, image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=100&q=80" },
    { id: "2", productName: "Jeans Shirt & Pent Easy", price: 257.00, image: "https://images.unsplash.com/photo-1542272604-787c3835535d?w=100&q=80" },
    { id: "3", productName: "Denim Jeans Pent Jack & Jones", price: 57.00, image: "https://images.unsplash.com/photo-1541099649105-f69ad21f3246?w=100&q=80" },
    { id: "4", productName: "Man's Polo T-Shirt", price: 57.00, image: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=100&q=80" },
  ]);

  // Sample data for countries
  const [countries] = useState<CountrySale[]>([
    { country: "United State", percentage: 34, flag: "🇺🇸" },
    { country: "France", percentage: 25, flag: "🇫🇷" },
    { country: "Australia", percentage: 15, flag: "🇦🇺" },
    { country: "Germany", percentage: 12, flag: "🇩🇪" },
  ]);

  useEffect(() => {
    if (!loading) {
      if (!user) {
        // Redirect to ADMIN sign-in page
        window.location.href = "/admin/sign-in";
        return;
      } else if (profile && profile.role !== 'admin') {
        // Non-admin users should not access admin area
        window.location.href = "/?error=unauthorized";
        return;
      } else if (user && profile && profile.role === 'admin') {
        // Admin is logged in, fetch stats (don't wait for this to render)
        fetchStats();
      }
      // If user exists but profile not loaded yet, wait (don't redirect)
      // But still allow rendering with default stats
    }
  }, [user, profile, loading]);

  const fetchStats = async () => {
    setLoadingStats(true); // Set loading when starting to fetch
    try {
      // Fetch all stats in parallel for faster loading
      const [productsRes, usersRes, ordersRes] = await Promise.all([
        fetch('/api/products?limit=1'),
        fetch('/api/admin/users/count'),
        fetch('/api/admin/orders/count'),
      ]);

      const [productsData, usersData, ordersData] = await Promise.all([
        productsRes.json(),
        usersRes.json(),
        ordersRes.json(),
      ]);

      setStats({
        totalTransaction: ordersData.revenue || 345539,
        totalProduct: productsData.total || 420,
        completeOrder: ordersData.completeCount || 345,
        cancelOrder: ordersData.cancelCount || 34,
        transactionChange: 34,
        productChange: 8,
        completeOrderChange: 25,
        cancelOrderChange: -3,
      });
    } catch (err) {
      console.error("Error fetching stats:", err);
    } finally {
      setLoadingStats(false);
    }
  };

  // Sales chart data
  const salesData = [
    { date: "1 Aug", current: 50, previous: 30 },
    { date: "2 Aug", current: 75, previous: 45 },
    { date: "3 Aug", current: 60, previous: 50 },
    { date: "4 Aug", current: 90, previous: 55 },
    { date: "5 Aug", current: 85, previous: 60 },
    { date: "6 Aug", current: 100, previous: 65 },
    { date: "7 Aug", current: 95, previous: 70 },
    { date: "8 Aug", current: 110, previous: 75 },
    { date: "9 Aug", current: 105, previous: 80 },
    { date: "10 Aug", current: 120, previous: 85 },
    { date: "11 Aug", current: 115, previous: 90 },
    { date: "12 Aug", current: 130, previous: 95 },
    { date: "13 Aug", current: 125, previous: 100 },
    { date: "14 Aug", current: 140, previous: 105 },
  ];

  // Chart configuration for shadcn chart
  const chartConfig = {
    current: {
      label: "Current Sales",
      color: "hsl(173, 80%, 40%)", // teal-500
    },
    previous: {
      label: "Previous Sales",
      color: "hsl(25, 95%, 53%)", // orange-500
    },
  };

  // Mini chart data for metric cards (sparkline data)
  const generateSparklineData = (trend: 'up' | 'down') => {
    const baseData = Array.from({ length: 7 }, (_, i) => i);
    if (trend === 'up') {
      return baseData.map((_, i) => ({ value: 20 + i * 5 + Math.random() * 3 }));
    } else {
      return baseData.map((_, i) => ({ value: 50 - i * 3 - Math.random() * 2 }));
    }
  };

  const transactionSparkline = generateSparklineData(stats.transactionChange > 0 ? 'up' : 'down');
  const productSparkline = generateSparklineData(stats.productChange > 0 ? 'up' : 'down');
  const completeOrderSparkline = generateSparklineData(stats.completeOrderChange > 0 ? 'up' : 'down');
  const cancelOrderSparkline = generateSparklineData(stats.cancelOrderChange > 0 ? 'up' : 'down');

  // Mini chart config for sparklines
  const sparklineConfig = {
    value: {
      label: "Value",
      color: "hsl(173, 80%, 40%)",
    },
  };

  // Only show loading if auth is still loading, not for stats
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  // If no user, show loading (redirect will happen in useEffect)
  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  // If profile loaded and user is not admin, show loading (redirect will happen)
  if (profile && profile.role !== 'admin') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  // Render dashboard immediately if user exists (even if profile not loaded yet)
  // Profile will load soon, and redirect will happen if not admin
  // Stats will load in background - don't wait for them

  // Render dashboard immediately, stats will load in background
  // Don't wait for loadingStats - show dashboard with default/current stats

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Header */}
      <AdminHeader timeRange={timeRange} setTimeRange={setTimeRange} />

      {/* Main Content */}
      <main className="p-6">
        <div className="max-w-7xl mx-auto">
          {/* Dashboard Overview */}
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-900 mb-6">Dashboard Overview</h1>
            
            {/* Metric Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {/* Total Transaction */}
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600">Total Transaction</CardTitle>
                  <div className={`p-2 rounded-full ${stats.transactionChange > 0 ? 'bg-green-100' : 'bg-red-100'}`}>
                    {stats.transactionChange > 0 ? (
                      <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                      </svg>
                    ) : (
                      <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 17l5-5m0 0l-5-5m5 5H6" />
                      </svg>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-gray-900">${stats.totalTransaction.toLocaleString()}</div>
                  <div className="flex items-center gap-2 text-sm mt-4">
                    <span className={`font-medium ${stats.transactionChange > 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {stats.transactionChange > 0 ? '+' : ''}{stats.transactionChange}%
                    </span>
                    <span className="text-gray-500">vs last 7 days</span>
                  </div>
                  <div className="mt-4 h-12">
                    <ChartContainer
                      config={{
                        value: {
                          label: "Transaction",
                          color: stats.transactionChange > 0 ? "hsl(142, 76%, 36%)" : "hsl(0, 84%, 60%)",
                        },
                      }}
                      className="h-full w-full"
                    >
                      <AreaChart
                        data={transactionSparkline}
                        margin={{ top: 0, right: 0, left: 0, bottom: 0 }}
                      >
                        <defs>
                          <linearGradient id="transactionGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop
                              offset="5%"
                              stopColor={stats.transactionChange > 0 ? "hsl(142, 76%, 36%)" : "hsl(0, 84%, 60%)"}
                              stopOpacity={0.3}
                            />
                            <stop
                              offset="95%"
                              stopColor={stats.transactionChange > 0 ? "hsl(142, 76%, 36%)" : "hsl(0, 84%, 60%)"}
                              stopOpacity={0}
                            />
                          </linearGradient>
                        </defs>
                        <Area
                          type="monotone"
                          dataKey="value"
                          stroke={stats.transactionChange > 0 ? "hsl(142, 76%, 36%)" : "hsl(0, 84%, 60%)"}
                          strokeWidth={2}
                          fill="url(#transactionGradient)"
                        />
                      </AreaChart>
                    </ChartContainer>
                  </div>
                </CardContent>
              </Card>

              {/* Total Product */}
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600">Total Product</CardTitle>
                  <div className={`p-2 rounded-full ${stats.productChange > 0 ? 'bg-green-100' : 'bg-red-100'}`}>
                    {stats.productChange > 0 ? (
                      <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                      </svg>
                    ) : (
                      <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 17l5-5m0 0l-5-5m5 5H6" />
                      </svg>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-gray-900">{stats.totalProduct}</div>
                  <div className="flex items-center gap-2 text-sm mt-4">
                    <span className={`font-medium ${stats.productChange > 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {stats.productChange > 0 ? '+' : ''}{stats.productChange}%
                    </span>
                    <span className="text-gray-500">vs last 7 days</span>
                  </div>
                  <div className="mt-4 h-12">
                    <ChartContainer
                      config={{
                        value: {
                          label: "Product",
                          color: stats.productChange > 0 ? "hsl(142, 76%, 36%)" : "hsl(0, 84%, 60%)",
                        },
                      }}
                      className="h-full w-full"
                    >
                      <AreaChart
                        data={productSparkline}
                        margin={{ top: 0, right: 0, left: 0, bottom: 0 }}
                      >
                        <defs>
                          <linearGradient id="productGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop
                              offset="5%"
                              stopColor={stats.productChange > 0 ? "hsl(142, 76%, 36%)" : "hsl(0, 84%, 60%)"}
                              stopOpacity={0.3}
                            />
                            <stop
                              offset="95%"
                              stopColor={stats.productChange > 0 ? "hsl(142, 76%, 36%)" : "hsl(0, 84%, 60%)"}
                              stopOpacity={0}
                            />
                          </linearGradient>
                        </defs>
                        <Area
                          type="monotone"
                          dataKey="value"
                          stroke={stats.productChange > 0 ? "hsl(142, 76%, 36%)" : "hsl(0, 84%, 60%)"}
                          strokeWidth={2}
                          fill="url(#productGradient)"
                        />
                      </AreaChart>
                    </ChartContainer>
                  </div>
                </CardContent>
              </Card>

              {/* Complete Order */}
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600">Complete Order</CardTitle>
                  <div className={`p-2 rounded-full ${stats.completeOrderChange > 0 ? 'bg-green-100' : 'bg-red-100'}`}>
                    {stats.completeOrderChange > 0 ? (
                      <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                      </svg>
                    ) : (
                      <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 17l5-5m0 0l-5-5m5 5H6" />
                      </svg>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-gray-900">{stats.completeOrder}</div>
                  <div className="flex items-center gap-2 text-sm mt-4">
                    <span className={`font-medium ${stats.completeOrderChange > 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {stats.completeOrderChange > 0 ? '+' : ''}{stats.completeOrderChange}%
                    </span>
                    <span className="text-gray-500">vs last 7 days</span>
                  </div>
                  <div className="mt-4 h-12">
                    <ChartContainer
                      config={{
                        value: {
                          label: "Complete Order",
                          color: stats.completeOrderChange > 0 ? "hsl(142, 76%, 36%)" : "hsl(0, 84%, 60%)",
                        },
                      }}
                      className="h-full w-full"
                    >
                      <AreaChart
                        data={completeOrderSparkline}
                        margin={{ top: 0, right: 0, left: 0, bottom: 0 }}
                      >
                        <defs>
                          <linearGradient id="completeOrderGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop
                              offset="5%"
                              stopColor={stats.completeOrderChange > 0 ? "hsl(142, 76%, 36%)" : "hsl(0, 84%, 60%)"}
                              stopOpacity={0.3}
                            />
                            <stop
                              offset="95%"
                              stopColor={stats.completeOrderChange > 0 ? "hsl(142, 76%, 36%)" : "hsl(0, 84%, 60%)"}
                              stopOpacity={0}
                            />
                          </linearGradient>
                        </defs>
                        <Area
                          type="monotone"
                          dataKey="value"
                          stroke={stats.completeOrderChange > 0 ? "hsl(142, 76%, 36%)" : "hsl(0, 84%, 60%)"}
                          strokeWidth={2}
                          fill="url(#completeOrderGradient)"
                        />
                      </AreaChart>
                    </ChartContainer>
                  </div>
                </CardContent>
              </Card>

              {/* Cancel Order */}
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600">Cancel Order</CardTitle>
                  <div className={`p-2 rounded-full ${stats.cancelOrderChange > 0 ? 'bg-green-100' : 'bg-red-100'}`}>
                    {stats.cancelOrderChange > 0 ? (
                      <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                      </svg>
                    ) : (
                      <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 17l5-5m0 0l-5-5m5 5H6" />
                      </svg>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-gray-900">{stats.cancelOrder}</div>
                  <div className="flex items-center gap-2 text-sm mt-4">
                    <span className={`font-medium ${stats.cancelOrderChange > 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {stats.cancelOrderChange > 0 ? '+' : ''}{stats.cancelOrderChange}%
                    </span>
                    <span className="text-gray-500">vs last 7 days</span>
                  </div>
                  <div className="mt-4 h-12">
                    <ChartContainer
                      config={{
                        value: {
                          label: "Cancel Order",
                          color: stats.cancelOrderChange > 0 ? "hsl(142, 76%, 36%)" : "hsl(0, 84%, 60%)",
                        },
                      }}
                      className="h-full w-full"
                    >
                      <AreaChart
                        data={cancelOrderSparkline}
                        margin={{ top: 0, right: 0, left: 0, bottom: 0 }}
                      >
                        <defs>
                          <linearGradient id="cancelOrderGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop
                              offset="5%"
                              stopColor={stats.cancelOrderChange > 0 ? "hsl(142, 76%, 36%)" : "hsl(0, 84%, 60%)"}
                              stopOpacity={0.3}
                            />
                            <stop
                              offset="95%"
                              stopColor={stats.cancelOrderChange > 0 ? "hsl(142, 76%, 36%)" : "hsl(0, 84%, 60%)"}
                              stopOpacity={0}
                            />
                          </linearGradient>
                        </defs>
                        <Area
                          type="monotone"
                          dataKey="value"
                          stroke={stats.cancelOrderChange > 0 ? "hsl(142, 76%, 36%)" : "hsl(0, 84%, 60%)"}
                          strokeWidth={2}
                          fill="url(#cancelOrderGradient)"
                        />
                      </AreaChart>
                    </ChartContainer>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Sales Report and Top Countries */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            {/* Sales Report */}
            <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-lg font-semibold text-gray-900 mb-1">This month sales report</h2>
                  <div className="flex items-center gap-2">
                    <span className="text-2xl font-bold text-gray-900">${stats.totalTransaction.toLocaleString()}</span>
                    <span className="text-sm text-green-600 font-medium flex items-center gap-1">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                      </svg>
                      {stats.transactionChange}%
                    </span>
                  </div>
                </div>
                <select className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                  <option>Monthly</option>
                  <option>Weekly</option>
                  <option>Daily</option>
                </select>
              </div>
              <div className="h-64">
                <ChartContainer config={chartConfig} className="h-full w-full">
                  <AreaChart
                    data={salesData}
                    margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
                  >
                    <defs>
                      <linearGradient id="colorCurrent" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="hsl(173, 80%, 40%)" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="hsl(173, 80%, 40%)" stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="colorPrevious" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="hsl(25, 95%, 53%)" stopOpacity={0.2} />
                        <stop offset="95%" stopColor="hsl(25, 95%, 53%)" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis
                      dataKey="date"
                      tick={{ fill: "#6b7280", fontSize: 12 }}
                      axisLine={{ stroke: "#e5e7eb" }}
                      tickLine={{ stroke: "#e5e7eb" }}
                    />
                    <YAxis
                      tick={{ fill: "#6b7280", fontSize: 12 }}
                      axisLine={{ stroke: "#e5e7eb" }}
                      tickLine={{ stroke: "#e5e7eb" }}
                    />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Area
                      type="monotone"
                      dataKey="current"
                      stroke="hsl(173, 80%, 40%)"
                      strokeWidth={3}
                      fill="url(#colorCurrent)"
                    />
                    <Area
                      type="monotone"
                      dataKey="previous"
                      stroke="hsl(25, 95%, 53%)"
                      strokeWidth={2}
                      strokeDasharray="5 5"
                      fill="url(#colorPrevious)"
                    />
                  </AreaChart>
                </ChartContainer>
              </div>
            </div>

            {/* Top Countries */}
            <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">Top Countries by Sell</h2>
                  <p className="text-sm text-gray-500">of the week based on country</p>
                </div>
                <select className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                  <option>Country</option>
                  <option>Region</option>
                </select>
              </div>
              
              {/* Simple World Map Visualization */}
              <div className="mb-6 h-48 bg-gray-50 rounded-lg flex items-center justify-center relative overflow-hidden">
                <div className="text-6xl">🌍</div>
                {/* Dots representing sales locations */}
                <div className="absolute top-1/4 left-1/4 w-3 h-3 bg-blue-500 rounded-full"></div>
                <div className="absolute top-1/3 right-1/3 w-3 h-3 bg-blue-500 rounded-full"></div>
                <div className="absolute bottom-1/4 left-1/3 w-3 h-3 bg-blue-500 rounded-full"></div>
                <div className="absolute top-1/2 right-1/4 w-3 h-3 bg-blue-500 rounded-full"></div>
                <div className="absolute bottom-1/3 left-1/2 w-3 h-3 bg-blue-500 rounded-full"></div>
              </div>

              {/* Country List */}
              <div className="space-y-4">
                {countries.map((country, idx) => (
                  <div key={idx} className="flex items-center gap-3">
                    <span className="text-2xl">{country.flag}</span>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium text-gray-900">{country.country}</span>
                        <span className="text-sm font-medium text-gray-900">{country.percentage}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-blue-500 h-2 rounded-full transition-all"
                          style={{ width: `${country.percentage}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Last Transaction and Recent Order */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Last Transaction */}
            <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900">Last Transaction</h2>
                <button className="p-2 text-gray-600 hover:text-gray-900">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                  </svg>
                </button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-3 px-2">
                        <input type="checkbox" className="rounded" />
                      </th>
                      <th className="text-left py-3 px-2 text-xs font-semibold text-gray-600 uppercase">Order ID</th>
                      <th className="text-left py-3 px-2 text-xs font-semibold text-gray-600 uppercase">Product Name</th>
                      <th className="text-left py-3 px-2 text-xs font-semibold text-gray-600 uppercase">Category</th>
                      <th className="text-left py-3 px-2 text-xs font-semibold text-gray-600 uppercase">Price</th>
                      <th className="text-left py-3 px-2 text-xs font-semibold text-gray-600 uppercase">Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {transactions.map((transaction, idx) => (
                      <tr key={idx} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="py-3 px-2">
                          <input type="checkbox" className="rounded" />
                        </td>
                        <td className="py-3 px-2 text-sm text-gray-900">{transaction.id}</td>
                        <td className="py-3 px-2 text-sm text-gray-700">{transaction.productName}</td>
                        <td className="py-3 px-2 text-sm text-gray-700">{transaction.category}</td>
                        <td className="py-3 px-2 text-sm font-medium text-gray-900">${transaction.price.toFixed(2)}</td>
                        <td className="py-3 px-2 text-sm text-gray-600">{transaction.date}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Recent Order */}
            <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900">Recent Order</h2>
                <Link href="/admin/orders" className="text-sm text-blue-600 hover:text-blue-700 font-medium">
                  See All
                </Link>
              </div>
              <div className="space-y-4">
                {recentOrders.map((order) => (
                  <div key={order.id} className="flex items-center gap-4 p-3 hover:bg-gray-50 rounded-lg transition-colors">
                    <div className="relative w-16 h-16 bg-gray-200 rounded-lg overflow-hidden flex-shrink-0">
                      <Image
                        src={order.image}
                        alt={order.productName}
                        fill
                        className="object-cover"
                        unoptimized
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm font-medium text-gray-900 truncate">{order.productName}</h3>
                      <p className="text-sm font-semibold text-gray-900 mt-1">${order.price.toFixed(2)}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
