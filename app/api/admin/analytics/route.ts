import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase';

// Disable caching for real-time updates
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(request: NextRequest) {
  try {
    const supabase = createServerClient();
    const searchParams = request.nextUrl.searchParams;
    const timeRange = searchParams.get('timeRange') || '7d';

    // Calculate date range
    const now = new Date();
    const days = timeRange === '7d' ? 7 : timeRange === '30d' ? 30 : timeRange === '90d' ? 90 : 365;
    const startDate = new Date(now);
    startDate.setDate(startDate.getDate() - days);

    // Fetch orders within date range
    const { data: orders, error: ordersError } = await supabase
      .from('orders')
      .select(`
        *,
        order_items (
          *,
          products (
            id,
            name,
            category,
            brand
          )
        )
      `)
      .gte('created_at', startDate.toISOString())
      .order('created_at', { ascending: true });

    if (ordersError) {
      console.error('Supabase error fetching orders:', ordersError);
      throw ordersError;
    }

    // Process sales trend data (group by day)
    const salesByDay: { [key: string]: number } = {};
    const ordersByDay: { [key: string]: number } = {};

    orders?.forEach((order: any) => {
      const date = new Date(order.created_at);
      const dayKey = date.toLocaleDateString('en-US', { weekday: 'short' });
      
      if (!salesByDay[dayKey]) {
        salesByDay[dayKey] = 0;
        ordersByDay[dayKey] = 0;
      }
      
      salesByDay[dayKey] += parseFloat(order.total_amount || 0);
      ordersByDay[dayKey] += 1;
    });

    // Convert to array format for chart
    const daysOfWeek = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const salesTrendData = daysOfWeek.map((day) => ({
      date: day,
      sales: Math.round(salesByDay[day] || 0),
    }));

    const ordersTrendData = daysOfWeek.map((day) => ({
      day: day.toLowerCase(),
      orders: ordersByDay[day] || 0,
    }));

    // Process category sales
    const categorySales: { [key: string]: { sales: number; count: number } } = {};

    orders?.forEach((order: any) => {
      order.order_items?.forEach((item: any) => {
        const category = item.products?.category || 'Other';
        if (!categorySales[category]) {
          categorySales[category] = { sales: 0, count: 0 };
        }
        categorySales[category].sales += parseFloat(item.price || 0) * (item.quantity || 1);
        categorySales[category].count += item.quantity || 1;
      });
    });

    // Calculate total sales for percentage
    const totalSales = Object.values(categorySales).reduce((sum, cat) => sum + cat.sales, 0);

    // Convert to array and calculate percentages
    const categoryData = Object.entries(categorySales)
      .map(([category, data]) => ({
        category,
        sales: Math.round(data.sales),
        percentage: totalSales > 0 ? Math.round((data.sales / totalSales) * 100) : 0,
      }))
      .sort((a, b) => b.sales - a.sales)
      .slice(0, 5); // Top 5 categories

    // Map categories to standard names
    const categoryMap: { [key: string]: string } = {
      'new-arrival': 'New Arrival',
      'apparel': 'Apparel',
      'footwear': 'Footwear',
      'accessories': 'Accessories',
      'lifestyle': 'Lifestyle',
    };

    const mappedCategoryData = categoryData.map((item) => {
      const mappedName = categoryMap[item.category.toLowerCase()] || item.category;
      return {
        ...item,
        category: mappedName,
      };
    });

    // Calculate trend percentage (compare with previous period)
    const previousStartDate = new Date(startDate);
    previousStartDate.setDate(previousStartDate.getDate() - days);
    
    const { data: previousOrders } = await supabase
      .from('orders')
      .select('total_amount, status')
      .gte('created_at', previousStartDate.toISOString())
      .lt('created_at', startDate.toISOString());

    const currentTotal = orders?.reduce((sum: number, order: any) => 
      sum + parseFloat(order.total_amount || 0), 0) || 0;
    const previousTotal = previousOrders?.reduce((sum: number, order: any) => 
      sum + parseFloat(order.total_amount || 0), 0) || 0;

    const salesTrendPercentage = previousTotal > 0 
      ? ((currentTotal - previousTotal) / previousTotal) * 100 
      : 0;

    const currentOrdersCount = orders?.length || 0;
    const previousOrdersCount = previousOrders?.length || 0;
    const ordersTrendPercentage = previousOrdersCount > 0
      ? ((currentOrdersCount - previousOrdersCount) / previousOrdersCount) * 100
      : 0;

    return NextResponse.json({
      salesTrend: salesTrendData,
      ordersTrend: ordersTrendData,
      categorySales: mappedCategoryData,
      salesTrendPercentage: Math.round(salesTrendPercentage * 10) / 10,
      ordersTrendPercentage: Math.round(ordersTrendPercentage * 10) / 10,
      totalSales: Math.round(currentTotal),
      totalOrders: currentOrdersCount,
    });
  } catch (error: any) {
    console.error('Error fetching analytics:', error);
    return NextResponse.json(
      {
        error: {
          message: error.message || 'Failed to fetch analytics',
          code: error.code || 'FETCH_ERROR',
        },
      },
      { status: 500 }
    );
  }
}

