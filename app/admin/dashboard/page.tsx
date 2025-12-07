"use client";

import { useState, useEffect, useCallback } from "react";
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

type PopularBrand = {
  id: string;
  name: string;
  sales: number;
  color: string;
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
  const [loadingStats, setLoadingStats] = useState(false);
  const [timeRange, setTimeRange] = useState("7d");
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [recentOrders, setRecentOrders] = useState<RecentOrder[]>([]);
  const [countries, setCountries] = useState<CountrySale[]>([]);
  const [popularBrands, setPopularBrands] = useState<PopularBrand[]>([]);
  const [salesData, setSalesData] = useState<{ date: string; current: number; previous: number }[]>([]);

  // Fetch dashboard data
  const fetchDashboardData = useCallback(async (isPolling: boolean = false) => {
    if (!isPolling) {
      setLoadingStats(true);
    }

    try {
      const response = await fetch(`/api/admin/dashboard?timeRange=${timeRange}&t=${Date.now()}`, {
        cache: 'no-store',
        headers: { 'Cache-Control': 'no-cache' },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch dashboard data');
      }

      const result = await response.json();

      if (result.error) {
        throw new Error(result.error.message);
      }

      // Update stats
      if (result.stats) {
        setStats(result.stats);
      }

      // Update transactions
      if (result.transactions) {
        setTransactions(result.transactions);
      }

      // Update recent orders
      if (result.recentOrders) {
        setRecentOrders(result.recentOrders);
      }

      // Update countries
      if (result.countries) {
        setCountries(result.countries);
      }

      // Update popular brands with neon colors
      if (result.popularBrands) {
        const neonColors = ['#ff00ff', '#00ffff', '#39ff14', '#ff1493'];
        const brandsWithColors = result.popularBrands.map((brand: PopularBrand, idx: number) => ({
          ...brand,
          color: brand.color || neonColors[idx] || neonColors[0]
        }));
        setPopularBrands(brandsWithColors);
      }

      // Update sales data
      if (result.salesData) {
        setSalesData(result.salesData);
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      if (!isPolling) {
        // Keep default values on error
      }
    } finally {
      if (!isPolling) {
        setLoadingStats(false);
      }
    }
  }, [timeRange]);

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
        // Admin is logged in, fetch dashboard data
        fetchDashboardData(false);
      }
    }
  }, [user, profile, loading, fetchDashboardData]);

  // Polling for real-time updates (every 5 seconds)
  useEffect(() => {
    if (!loading && user && profile?.role === 'admin' && !loadingStats) {
      const interval = setInterval(() => {
        fetchDashboardData(true);
      }, 5000); // Poll every 5 seconds

      return () => clearInterval(interval);
    }
  }, [user, profile, loading, loadingStats, fetchDashboardData]);

  // Sales chart data is now fetched from API

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
            <h1 className="text-2xl font-normal text-gray-900 mb-6 flex items-center gap-3">
              <svg className="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              Dashboard Overview
            </h1>
            
            {/* Metric Cards */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-8">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 divide-y md:divide-y-0 md:divide-x divide-gray-200">
                {/* Total Transaction */}
                <div className="p-6">
                  <div className="flex items-center gap-2 mb-3">
                    <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                    </svg>
                    <h3 className="text-sm font-normal text-gray-600">Total Transaction</h3>
                  </div>
                  <div className="text-3xl font-normal text-gray-900 mb-2">${stats.totalTransaction.toLocaleString()}</div>
                  <div className="flex items-center gap-1 text-sm">
                    <span className={`font-medium ${stats.transactionChange > 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {stats.transactionChange > 0 ? (
                        <span className="flex items-center gap-1">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
                          </svg>
                          {stats.transactionChange}%
                        </span>
                      ) : (
                        <span className="flex items-center gap-1">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                          </svg>
                          {stats.transactionChange}%
                        </span>
                      )}
                    </span>
                    <span className="text-gray-500">vs last month</span>
                  </div>
                </div>

                {/* Total Product */}
                <div className="p-6">
                  <div className="flex items-center gap-2 mb-3">
                    <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                    </svg>
                    <h3 className="text-sm font-normal text-gray-600">Total Product</h3>
                  </div>
                  <div className="text-3xl font-normal text-gray-900 mb-2">{stats.totalProduct}</div>
                  <div className="flex items-center gap-1 text-sm">
                    <span className={`font-medium ${stats.productChange > 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {stats.productChange > 0 ? (
                        <span className="flex items-center gap-1">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
                          </svg>
                          {stats.productChange}%
                        </span>
                      ) : (
                        <span className="flex items-center gap-1">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                          </svg>
                          {stats.productChange}%
                        </span>
                      )}
                    </span>
                    <span className="text-gray-500">vs last month</span>
                  </div>
                </div>

                {/* Complete Order */}
                <div className="p-6">
                  <div className="flex items-center gap-2 mb-3">
                    <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <h3 className="text-sm font-normal text-gray-600">Complete Order</h3>
                  </div>
                  <div className="text-3xl font-normal text-gray-900 mb-2">{stats.completeOrder}</div>
                  <div className="flex items-center gap-1 text-sm">
                    <span className={`font-medium ${stats.completeOrderChange > 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {stats.completeOrderChange > 0 ? (
                        <span className="flex items-center gap-1">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
                          </svg>
                          {stats.completeOrderChange}%
                        </span>
                      ) : (
                        <span className="flex items-center gap-1">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                          </svg>
                          {stats.completeOrderChange}%
                        </span>
                      )}
                    </span>
                    <span className="text-gray-500">vs last month</span>
                  </div>
                </div>

                {/* Cancel Order */}
                <div className="p-6">
                  <div className="flex items-center gap-2 mb-3">
                    <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <h3 className="text-sm font-normal text-gray-600">Cancel Order</h3>
                  </div>
                  <div className="text-3xl font-normal text-gray-900 mb-2">{stats.cancelOrder}</div>
                  <div className="flex items-center gap-1 text-sm">
                    <span className={`font-medium ${stats.cancelOrderChange > 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {stats.cancelOrderChange > 0 ? (
                        <span className="flex items-center gap-1">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
                          </svg>
                          {stats.cancelOrderChange}%
                        </span>
                      ) : (
                        <span className="flex items-center gap-1">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                          </svg>
                          {stats.cancelOrderChange}%
                        </span>
                      )}
                    </span>
                    <span className="text-gray-500">vs last month</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Sales Report and Top Countries */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            {/* Sales Report */}
            <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                  <h2 className="text-lg font-normal text-gray-900 flex items-center gap-2">
                    This month sales report
                  </h2>
                  <div className="w-5 h-5 rounded-full bg-gray-100 flex items-center justify-center cursor-pointer hover:bg-gray-200 transition-colors">
                    <svg className="w-3 h-3 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Link href="/admin/analytics" className="text-sm text-gray-600 hover:text-gray-900 font-medium flex items-center gap-1">
                    View More
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </Link>
                  <button className="p-1.5 text-gray-400 hover:text-gray-600 transition-colors">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
                    </svg>
                  </button>
                </div>
              </div>
              
              {/* Key Metrics */}
              <div className="mb-6">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-3xl font-normal text-gray-900">${stats.totalTransaction.toLocaleString()}</span>
                  <span className={`text-sm font-normal flex items-center gap-1 ${stats.transactionChange > 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {stats.transactionChange > 0 ? (
                      <>
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
                        </svg>
                        {stats.transactionChange}%
                      </>
                    ) : (
                      <>
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                        </svg>
                        {Math.abs(stats.transactionChange)}%
                      </>
                    )}
                  </span>
                </div>
                <span className="text-sm text-gray-500">vs last month</span>
              </div>

              {/* Legend */}
              <div className="flex items-center gap-4 mb-4">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-gray-800"></div>
                  <span className="text-xs text-gray-600">This month</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-gray-300"></div>
                  <span className="text-xs text-gray-600">Last month</span>
                </div>
              </div>

              {/* Chart */}
              <div className="h-64">
                {loadingStats && salesData.length === 0 ? (
                  <div className="h-full flex items-center justify-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
                  </div>
                ) : (
                  <ChartContainer config={chartConfig} className="h-full w-full">
                    <LineChart
                      data={salesData.length > 0 ? salesData : []}
                      margin={{ top: 10, right: 10, left: 0, bottom: 20 }}
                    >
                    <defs>
                      <linearGradient id="colorCurrent" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="rgb(31, 41, 55)" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="rgb(31, 41, 55)" stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="colorPrevious" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="rgb(209, 213, 219)" stopOpacity={0.2} />
                        <stop offset="95%" stopColor="rgb(209, 213, 219)" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
                    <XAxis
                      dataKey="date"
                      tick={{ fill: "#6b7280", fontSize: 11 }}
                      axisLine={{ stroke: "#e5e7eb" }}
                      tickLine={{ stroke: "#e5e7eb" }}
                      interval="preserveStartEnd"
                    />
                    <YAxis
                      tick={{ fill: "#6b7280", fontSize: 11 }}
                      axisLine={{ stroke: "#e5e7eb" }}
                      tickLine={{ stroke: "#e5e7eb" }}
                      tickFormatter={(value) => {
                        if (value >= 1000) return `$${(value / 1000).toFixed(1)}K`;
                        return `$${value}`;
                      }}
                    />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Line
                      type="monotone"
                      dataKey="current"
                      stroke="rgb(31, 41, 55)"
                      strokeWidth={2.5}
                      dot={false}
                      activeDot={{ r: 4 }}
                    />
                    <Line
                      type="monotone"
                      dataKey="previous"
                      stroke="rgb(209, 213, 219)"
                      strokeWidth={2}
                      dot={false}
                      activeDot={{ r: 4 }}
                    />
                    </LineChart>
                  </ChartContainer>
                )}
              </div>
            </div>

            {/* Popular Brand */}
            <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                  <svg className="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                  </svg>
                  <h2 className="text-lg font-normal text-gray-900">Popular Brand</h2>
                  <div className="w-5 h-5 rounded-full bg-gray-100 flex items-center justify-center cursor-pointer hover:bg-gray-200 transition-colors">
                    <svg className="w-3 h-3 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Link href="/admin/products" className="text-sm text-gray-600 hover:text-gray-900 font-medium flex items-center gap-1">
                    View More
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </Link>
                  <button className="p-1.5 text-gray-400 hover:text-gray-600 transition-colors">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
                    </svg>
                  </button>
                  <button className="p-1.5 text-gray-400 hover:text-gray-600 transition-colors">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                    </svg>
                  </button>
                </div>
              </div>
              
              {/* X-axis Labels (at top) */}
              <div className="mb-6 flex items-center justify-between text-xs font-medium text-gray-500 px-1">
                <span>0</span>
                <span>2K</span>
                <span>4K</span>
                <span>6K</span>
                <span>8K</span>
              </div>
              
              {/* Horizontal Bar Chart */}
              <div className="space-y-6">
                {(() => {
                  // Function to get brand color based on name
                  const getBrandColor = (brandName: string, idx: number) => {
                    const name = brandName.toLowerCase();
                    if (name.includes('jordan')) return '#ff6600'; // Orange
                    if (name.includes('chrome') || name.includes('hearts')) return '#000000'; // Hitam
                    if (name.includes('stussy')) return '#808080'; // Abu-abu
                    // Default neon colors for other brands
                    const neonColors = ['#ff00ff', '#00ffff', '#39ff14', '#ff1493'];
                    return neonColors[idx] || '#ff00ff';
                  };
                  
                  const brandsToDisplay = popularBrands.length > 0 
                    ? popularBrands.map((b, idx) => ({ ...b, color: b.color || getBrandColor(b.name, idx) }))
                    : [
                        { id: '1', name: 'Jordan', sales: 8172, color: '#ff6600' }, // Orange
                        { id: '2', name: 'Chrome Hearts', sales: 6345, color: '#000000' }, // Hitam
                        { id: '3', name: 'Stussy', sales: 3287, color: '#808080' }, // Abu-abu
                        { id: '4', name: 'Red Bull', sales: 2456, color: '#ff1493' }, // Neon Deep Pink
                      ];
                  
                  const maxSales = Math.max(...brandsToDisplay.map(b => b.sales));
                  const totalSales = brandsToDisplay.reduce((sum, b) => sum + b.sales, 0);
                  
                  return brandsToDisplay.map((brand, idx) => {
                    const percentage = maxSales > 0 ? (brand.sales / maxSales) * 100 : 0;
                    const salesPercentage = totalSales > 0 ? (brand.sales / totalSales) * 100 : 0;
                    const brandColor = brand.color || neonColors[idx] || neonColors[0];
                    
                    // Convert hex to rgb for gradient transparency
                    const hexToRgb = (hex: string) => {
                      const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
                      return result ? {
                        r: parseInt(result[1], 16),
                        g: parseInt(result[2], 16),
                        b: parseInt(result[3], 16)
                      } : { r: 255, g: 0, b: 255 };
                    };
                    const rgb = hexToRgb(brandColor);
                    const gradientColor = `linear-gradient(to right, 
                      rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 1), 
                      rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.9), 
                      rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.7), 
                      rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.5)
                    )`;
                  
                  return (
                    <div key={brand.id || idx} className="space-y-3">
                      {/* Brand Name and Sales */}
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-normal text-gray-900">{brand.name}</span>
                        <span className="text-sm font-normal text-gray-900">{salesPercentage.toFixed(1)}%</span>
                      </div>
                      
                      {/* Bar Chart Container */}
                      <div className="relative w-full h-5">
                        {/* Pattern Bar (lighter gray dashed bar underneath) */}
                        <div className="absolute inset-0 h-5 rounded-full overflow-hidden" style={{ zIndex: 1 }}>
                          <div
                            className="bg-gray-100 h-full rounded-full"
                            style={{ 
                              width: `${percentage}%`,
                              backgroundImage: `repeating-linear-gradient(
                                45deg,
                                transparent,
                                transparent 3px,
                                rgba(156, 163, 175, 0.2) 3px,
                                rgba(156, 163, 175, 0.2) 6px
                              )`
                            }}
                          ></div>
                        </div>
                        
                        {/* Main Bar (on top with solid neon color, pattern, and gradient) */}
                        <div className="absolute inset-0 h-5 rounded-full overflow-hidden" style={{ zIndex: 2 }}>
                          <div
                            className="h-full rounded-full transition-all"
                            style={{ 
                              width: `${percentage}%`,
                              background: `
                                repeating-linear-gradient(
                                  45deg,
                                  transparent,
                                  transparent 3px,
                                  rgba(255, 255, 255, 0.15) 3px,
                                  rgba(255, 255, 255, 0.15) 6px
                                ),
                                ${gradientColor}
                              `
                            }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  );
                  });
                })()}
              </div>
            </div>
          </div>

          {/* Last Transaction and Recent Order */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Last Transaction */}
            <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-normal text-gray-900 flex items-center gap-2">
                  <svg className="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  Last Transaction
                </h2>
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
                      <th className="text-left py-3 px-2 text-xs font-normal text-gray-600 uppercase">Order ID</th>
                      <th className="text-left py-3 px-2 text-xs font-normal text-gray-600 uppercase">Product Name</th>
                      <th className="text-left py-3 px-2 text-xs font-normal text-gray-600 uppercase">Category</th>
                      <th className="text-left py-3 px-2 text-xs font-normal text-gray-600 uppercase">Price</th>
                      <th className="text-left py-3 px-2 text-xs font-normal text-gray-600 uppercase">Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {transactions.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="text-center py-8 text-gray-500">
                          No transactions found
                        </td>
                      </tr>
                    ) : (
                      transactions.map((transaction, idx) => (
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
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Recent Order */}
            <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-normal text-gray-900 flex items-center gap-2">
                  <svg className="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                  </svg>
                  Recent Order
                </h2>
                <Link href="/admin/orders" className="text-sm text-blue-600 hover:text-blue-700 font-medium">
                  See All
                </Link>
              </div>
              <div className="space-y-4">
                {recentOrders.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">No recent orders found</div>
                ) : (
                  recentOrders.map((order) => (
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
                        <p className="text-sm font-normal text-gray-900 mt-1">${order.price.toFixed(2)}</p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
