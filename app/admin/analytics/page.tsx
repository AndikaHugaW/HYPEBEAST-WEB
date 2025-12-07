"use client";

import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Area, AreaChart, Bar, BarChart, CartesianGrid, XAxis, YAxis, PieChart, Pie, Cell, Legend, Sector, Line, LineChart, LabelList } from "recharts";
import { ChartContainer, ChartTooltip, ChartTooltipContent, ChartLegend, ChartLegendContent, ChartConfig } from "@/components/ui/chart";
import { TrendingUp } from "lucide-react";

export default function AdminAnalytics() {
  const { user, profile, loading } = useAuth();
  const [timeRange, setTimeRange] = useState("7d");
  const [activeIndex, setActiveIndex] = useState<number | undefined>(undefined);
  const [loadingData, setLoadingData] = useState(true);
  const [salesTrendData, setSalesTrendData] = useState<{ date: string; sales: number }[]>([]);
  const [ordersTrendData, setOrdersTrendData] = useState<{ day: string; orders: number }[]>([]);
  const [categoryData, setCategoryData] = useState<{ category: string; sales: number; percentage: number; fill: string }[]>([]);
  const [salesTrendPercentage, setSalesTrendPercentage] = useState(0);
  const [ordersTrendPercentage, setOrdersTrendPercentage] = useState(0);

  // Color mapping for categories
  const categoryColorMap: { [key: string]: string } = {
    'New Arrival': '#60a5fa', // Blue 400
    'Apparel': '#3b82f6', // Blue 500
    'Footwear': '#2563eb', // Blue 600
    'Accessories': '#1d4ed8', // Blue 700
    'Lifestyle': '#1e40af', // Blue 800
  };

  const salesTrendConfig = {
    sales: {
      label: "Sales",
      color: "#3b82f6", // Blue
    },
  } satisfies ChartConfig;

  // Fetch analytics data
  const fetchAnalytics = useCallback(async (isPolling = false) => {
    if (!isPolling) {
      setLoadingData(true);
    }

    try {
      const response = await fetch(`/api/admin/analytics?timeRange=${timeRange}&_t=${Date.now()}`, {
        cache: 'no-store',
        headers: { 'Cache-Control': 'no-cache' },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch analytics');
      }

      const result = await response.json();

      if (result.error) {
        throw new Error(result.error.message);
      }

      // Update sales trend data
      if (result.salesTrend) {
        setSalesTrendData(result.salesTrend);
      }

      // Update orders trend data with fill colors
      if (result.ordersTrend) {
        const ordersWithFill = result.ordersTrend.map((item: any) => ({
          ...item,
          fill: `var(--color-${item.day})`,
        }));
        setOrdersTrendData(ordersWithFill);
      }

      // Update category data with colors
      if (result.categorySales) {
        const categoriesWithFill = result.categorySales.map((item: any) => ({
          ...item,
          fill: categoryColorMap[item.category] || '#3b82f6',
        }));
        setCategoryData(categoriesWithFill);
      }

      if (result.salesTrendPercentage !== undefined) {
        setSalesTrendPercentage(result.salesTrendPercentage);
      }

      if (result.ordersTrendPercentage !== undefined) {
        setOrdersTrendPercentage(result.ordersTrendPercentage);
      }
    } catch (error) {
      console.error('Error fetching analytics:', error);
      if (!isPolling) {
        // Set default data on error
        setSalesTrendData([
          { date: "Mon", sales: 0 },
          { date: "Tue", sales: 0 },
          { date: "Wed", sales: 0 },
          { date: "Thu", sales: 0 },
          { date: "Fri", sales: 0 },
          { date: "Sat", sales: 0 },
          { date: "Sun", sales: 0 },
        ]);
        setOrdersTrendData([]);
        setCategoryData([]);
      }
    } finally {
      if (!isPolling) {
        setLoadingData(false);
      }
    }
  }, [timeRange]);

  useEffect(() => {
    if (!loading && user && profile?.role === 'admin') {
      fetchAnalytics(false);
    }
  }, [user, profile, loading, fetchAnalytics]);

  // Polling for real-time updates (every 5 seconds)
  useEffect(() => {
    if (!loading && user && profile?.role === 'admin' && !loadingData) {
      const interval = setInterval(() => {
        fetchAnalytics(true);
      }, 5000); // Poll every 5 seconds

      return () => clearInterval(interval);
    }
  }, [user, profile, loading, loadingData, fetchAnalytics]);

  const ordersTrendConfig = {
    orders: {
      label: "Orders",
    },
    mon: {
      label: "Monday",
      color: "#3b82f6", // Blue 500
    },
    tue: {
      label: "Tuesday",
      color: "#2563eb", // Blue 600
    },
    wed: {
      label: "Wednesday",
      color: "#1d4ed8", // Blue 700
    },
    thu: {
      label: "Thursday",
      color: "#1e40af", // Blue 800
    },
    fri: {
      label: "Friday",
      color: "#1e3a8a", // Blue 900
    },
    sat: {
      label: "Saturday",
      color: "#172554", // Blue 950
    },
    sun: {
      label: "Sunday",
      color: "#60a5fa", // Blue 400
    },
  } satisfies ChartConfig;

  // Transform data for pie chart (using state data)
  const pieChartData = categoryData.map((item) => ({
    name: item.category,
    value: item.sales,
    percentage: item.percentage,
  }));

  const pieChartConfig = {
    "New Arrival": {
      label: "New Arrival",
      color: "#60a5fa", // Blue 400 - paling terang
    },
    Apparel: {
      label: "Apparel",
      color: "#3b82f6", // Blue 500 - terang
    },
    Footwear: {
      label: "Footwear",
      color: "#2563eb", // Blue 600 - sedang-terang
    },
    Accessories: {
      label: "Accessories",
      color: "#1d4ed8", // Blue 700 - sedang
    },
    Lifestyle: {
      label: "Lifestyle",
      color: "#1e40af", // Blue 800 - gelap
    },
  };

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
                <CardDescription className="text-gray-700 font-medium">Last 7 days sales statistics</CardDescription>
              </CardHeader>
              <CardContent>
                {loadingData ? (
                  <div className="h-[300px] flex items-center justify-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
                  </div>
                ) : (
                  <ChartContainer config={salesTrendConfig}>
                    <LineChart
                      accessibilityLayer
                      data={salesTrendData}
                      margin={{
                        top: 20,
                        left: 12,
                        right: 12,
                        bottom: 20,
                      }}
                    >
                      <CartesianGrid vertical={false} />
                      <XAxis
                        dataKey="date"
                        tickLine={false}
                        axisLine={false}
                        tickMargin={10}
                        tick={{ fill: "#6b7280", fontSize: 12 }}
                        height={40}
                        interval={0}
                        ticks={salesTrendData.map((item) => item.date)}
                      />
                      <ChartTooltip
                        cursor={false}
                        content={<ChartTooltipContent indicator="line" />}
                      />
                      <Line
                        dataKey="sales"
                        type="natural"
                        stroke="var(--color-sales)"
                        strokeWidth={2}
                        dot={{
                          fill: "var(--color-sales)",
                        }}
                        activeDot={{
                          r: 6,
                        }}
                      >
                        <LabelList
                          position="top"
                          offset={12}
                          className="fill-blue-600"
                          fontSize={12}
                          fill="#3b82f6"
                        />
                      </Line>
                    </LineChart>
                  </ChartContainer>
                )}
              </CardContent>
              <CardFooter className="flex-col items-start gap-2 text-sm">
                <div className="flex gap-2 leading-none font-medium text-gray-900">
                  {salesTrendPercentage >= 0 ? (
                    <>
                      Trending up by {Math.abs(salesTrendPercentage).toFixed(1)}% this {timeRange === '7d' ? 'week' : timeRange === '30d' ? 'month' : timeRange === '90d' ? 'quarter' : 'year'}{' '}
                      <TrendingUp className="h-4 w-4" />
                    </>
                  ) : (
                    <>
                      Trending down by {Math.abs(salesTrendPercentage).toFixed(1)}% this {timeRange === '7d' ? 'week' : timeRange === '30d' ? 'month' : timeRange === '90d' ? 'quarter' : 'year'}{' '}
                      <TrendingUp className="h-4 w-4 rotate-180" />
                    </>
                  )}
                </div>
                <div className="text-gray-500 leading-none">
                  Showing total sales for the last {timeRange === '7d' ? '7 days' : timeRange === '30d' ? '30 days' : timeRange === '90d' ? '90 days' : 'year'}
                </div>
              </CardFooter>
            </Card>

            {/* Orders Trend */}
            <Card>
              <CardHeader>
                <CardTitle className="text-gray-900 font-normal">Orders Trend</CardTitle>
                <CardDescription className="text-gray-700 font-medium">Last 7 days order statistics</CardDescription>
              </CardHeader>
              <CardContent>
                {loadingData ? (
                  <div className="h-[300px] flex items-center justify-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
                  </div>
                ) : (
                  <ChartContainer config={ordersTrendConfig}>
                    <BarChart
                      accessibilityLayer
                      data={ordersTrendData}
                    layout="vertical"
                    margin={{
                      left: 0,
                    }}
                  >
                    <YAxis
                      dataKey="day"
                      type="category"
                      tickLine={false}
                      tickMargin={10}
                      axisLine={false}
                      tickFormatter={(value) => {
                        const config = ordersTrendConfig[value as keyof typeof ordersTrendConfig];
                        return config?.label || value;
                      }}
                    />
                    <XAxis dataKey="orders" type="number" hide />
                    <ChartTooltip
                      cursor={false}
                      content={<ChartTooltipContent hideLabel />}
                    />
                    <Bar dataKey="orders" layout="vertical" radius={5}>
                      {ordersTrendData.map((entry, index) => {
                        const dayKey = entry.day as keyof typeof ordersTrendConfig;
                        const color = ordersTrendConfig[dayKey]?.color || "hsl(221, 83%, 53%)";
                        return (
                          <Cell key={`cell-${index}`} fill={color} />
                        );
                      })}
                    </Bar>
                  </BarChart>
                </ChartContainer>
                )}
              </CardContent>
              <CardFooter className="flex-col items-start gap-2 text-sm">
                <div className="flex gap-2 leading-none font-medium text-gray-900">
                  {ordersTrendPercentage >= 0 ? (
                    <>
                      Trending up by {Math.abs(ordersTrendPercentage).toFixed(1)}% this {timeRange === '7d' ? 'week' : timeRange === '30d' ? 'month' : timeRange === '90d' ? 'quarter' : 'year'}{' '}
                      <TrendingUp className="h-4 w-4" />
                    </>
                  ) : (
                    <>
                      Trending down by {Math.abs(ordersTrendPercentage).toFixed(1)}% this {timeRange === '7d' ? 'week' : timeRange === '30d' ? 'month' : timeRange === '90d' ? 'quarter' : 'year'}{' '}
                      <TrendingUp className="h-4 w-4 rotate-180" />
                    </>
                  )}
                </div>
                <div className="text-gray-500 leading-none">
                  Showing total orders for the last {timeRange === '7d' ? '7 days' : timeRange === '30d' ? '30 days' : timeRange === '90d' ? '90 days' : 'year'}
                </div>
              </CardFooter>
            </Card>
          </div>

          {/* Category Sales - Pie Chart */}
          <Card>
            <CardHeader>
              <CardTitle className="text-gray-900 font-normal">Sales by Category</CardTitle>
            </CardHeader>
            <CardContent>
              {loadingData ? (
                <div className="h-[600px] flex items-center justify-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
                </div>
              ) : categoryData.length > 0 ? (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Interactive Pie Chart */}
                  <div className="flex items-center justify-center">
                    <ChartContainer config={pieChartConfig} className="h-[600px] w-full">
                    <PieChart>
                      <ChartTooltip
                        content={({ active, payload }) => {
                          if (active && payload && payload.length) {
                            const data = payload[0];
                            const categoryInfo = categoryData.find(
                              (cat) => cat.category === data.name
                            );
                            return (
                              <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-lg">
                                <div className="flex items-center gap-2 mb-2">
                                  <div
                                    className="h-4 w-4 rounded-full"
                                    style={{ backgroundColor: data.payload.fill }}
                                  />
                                  <span className="text-sm font-semibold text-gray-900">
                                    {data.name}
                                  </span>
                                </div>
                                <div className="space-y-1">
                                  <div>
                                    <p className="text-xs text-gray-500">Sales Amount</p>
                                    <p className="text-lg font-bold text-gray-900">
                                      ${(data.value as number).toLocaleString()}
                                    </p>
                                  </div>
                                  {categoryInfo && (
                                    <div>
                                      <p className="text-xs text-gray-500">Percentage</p>
                                      <p className="text-sm font-medium text-gray-700">
                                        {categoryInfo.percentage}% of total sales
                                      </p>
                                    </div>
                                  )}
                                </div>
                              </div>
                            );
                          }
                          return null;
                        }}
                      />
                      <Pie
                        data={pieChartData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={false}
                        outerRadius={activeIndex !== undefined ? 240 : 230}
                        innerRadius={110}
                        fill="#8884d8"
                        dataKey="value"
                        strokeWidth={4}
                        stroke="#fff"
                        activeIndex={activeIndex}
                        activeShape={(props: any) => {
                          const {
                            cx,
                            cy,
                            innerRadius,
                            outerRadius,
                            startAngle,
                            endAngle,
                            fill,
                          } = props;
                          return (
                            <Sector
                              cx={cx}
                              cy={cy}
                              innerRadius={innerRadius}
                              outerRadius={outerRadius + 25}
                              startAngle={startAngle}
                              endAngle={endAngle}
                              fill={fill}
                              stroke="#fff"
                              strokeWidth={4}
                              style={{
                                filter: "drop-shadow(0 4px 8px rgba(0,0,0,0.2))",
                                transition: "all 0.3s ease",
                              }}
                            />
                          );
                        }}
                        onMouseEnter={(_, index) => setActiveIndex(index)}
                        onMouseLeave={() => setActiveIndex(undefined)}
                      >
                        {pieChartData.map((entry, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={categoryData[index].fill}
                            style={{
                              filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.1))",
                              cursor: "pointer",
                              transition: "all 0.3s ease",
                            }}
                          />
                        ))}
                      </Pie>
                      <ChartLegend
                        content={(props) => {
                          const { payload } = props;
                          if (!payload || !payload.length) return null;
                          return (
                            <div className="flex items-center justify-center gap-4 -mt-4">
                              {payload.map((item: any, index: number) => {
                                const categoryInfo = categoryData.find(
                                  (cat) => cat.category === item.value
                                );
                                const color = categoryInfo?.fill || item.color || "#3b82f6";
                                return (
                                  <div
                                    key={item.value}
                                    className="flex items-center gap-1.5"
                                  >
                                    <div
                                      className="h-2 w-2 shrink-0 rounded-[2px]"
                                      style={{ backgroundColor: color }}
                                    />
                                    <span
                                      className="text-sm"
                                      style={{ color: color }}
                                    >
                                      {item.value}
                                    </span>
                                  </div>
                                );
                              })}
                            </div>
                          );
                        }}
                      />
                    </PieChart>
                  </ChartContainer>
                </div>

                {/* Category List with Details */}
                <div className="space-y-4">
                  {categoryData.map((item, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-4 p-3 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <div
                        className="w-4 h-4 rounded-full flex-shrink-0"
                        style={{ backgroundColor: item.fill }}
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <span 
                            className="text-sm font-medium"
                            style={{ color: item.fill }}
                          >
                            {item.category}
                          </span>
                          <span className="text-sm font-semibold text-gray-900">
                            ${item.sales.toLocaleString()}
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="h-2 rounded-full transition-all"
                            style={{
                              width: `${item.percentage}%`,
                              backgroundColor: item.fill,
                            }}
                          />
                        </div>
                        <div className="mt-1">
                          <span className="text-xs text-gray-500">{item.percentage}% of total sales</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              ) : (
                <div className="h-[600px] flex items-center justify-center">
                  <p className="text-gray-500">No category data available</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

