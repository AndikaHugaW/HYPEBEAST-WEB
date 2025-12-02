"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Area, AreaChart, Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";

export default function AdminAnalytics() {
  const { user, profile, loading } = useAuth();
  const [timeRange, setTimeRange] = useState("7d");

  const salesData = [
    { date: "Mon", sales: 1200, orders: 45 },
    { date: "Tue", sales: 1900, orders: 52 },
    { date: "Wed", sales: 1500, orders: 48 },
    { date: "Thu", sales: 2100, orders: 61 },
    { date: "Fri", sales: 1800, orders: 55 },
    { date: "Sat", sales: 2400, orders: 72 },
    { date: "Sun", sales: 2200, orders: 68 },
  ];

  const categoryData = [
    { category: "Shoes", sales: 4500, percentage: 35 },
    { category: "Clothing", sales: 3200, percentage: 25 },
    { category: "Accessories", sales: 2800, percentage: 22 },
    { category: "Electronics", sales: 2300, percentage: 18 },
  ];

  const chartConfig = {
    sales: {
      label: "Sales",
      color: "hsl(173, 80%, 40%)",
    },
    orders: {
      label: "Orders",
      color: "hsl(25, 95%, 53%)",
    },
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
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Analytics Dashboard</h1>
            <p className="text-gray-900">Comprehensive analytics and insights</p>
          </div>

          {/* Time Range Selector */}
          <Card className="mb-6">
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <span className="text-sm font-medium text-gray-900">Time Range:</span>
                <div className="flex gap-2">
                  {["7d", "30d", "90d", "1y"].map((range) => (
                    <button
                      key={range}
                      onClick={() => setTimeRange(range)}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                        timeRange === range
                          ? "bg-blue-600 text-white"
                          : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                      }`}
                    >
                      {range === "7d" ? "7 Days" : range === "30d" ? "30 Days" : range === "90d" ? "90 Days" : "1 Year"}
                    </button>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Charts Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            {/* Sales Trend */}
            <Card>
              <CardHeader>
                <CardTitle className="text-gray-900 font-normal">Sales Trend</CardTitle>
              </CardHeader>
              <CardContent>
                <ChartContainer config={chartConfig} className="h-[300px]">
                  <AreaChart data={salesData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Area
                      type="monotone"
                      dataKey="sales"
                      stroke="hsl(173, 80%, 40%)"
                      fill="hsl(173, 80%, 40%)"
                      fillOpacity={0.3}
                    />
                  </AreaChart>
                </ChartContainer>
              </CardContent>
            </Card>

            {/* Orders Trend */}
            <Card>
              <CardHeader>
                <CardTitle className="text-gray-900 font-normal">Orders Trend</CardTitle>
              </CardHeader>
              <CardContent>
                <ChartContainer config={chartConfig} className="h-[300px]">
                  <BarChart data={salesData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Bar dataKey="orders" fill="hsl(25, 95%, 53%)" />
                  </BarChart>
                </ChartContainer>
              </CardContent>
            </Card>
          </div>

          {/* Category Sales */}
          <Card>
            <CardHeader>
              <CardTitle className="text-gray-900 font-normal">Sales by Category</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {categoryData.map((item, index) => (
                  <div key={index} className="flex items-center gap-4">
                    <div className="w-32 text-sm font-medium text-gray-900">{item.category}</div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <div className="h-2 bg-gray-200 rounded-full flex-1">
                          <div
                            className="h-2 bg-blue-600 rounded-full"
                            style={{ width: `${item.percentage}%` }}
                          />
                        </div>
                        <span className="text-sm font-medium text-gray-900 w-20 text-right">
                          ${item.sales.toLocaleString()}
                        </span>
                      </div>
                    </div>
                    <div className="w-16 text-sm text-gray-900 text-right font-medium">{item.percentage}%</div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

