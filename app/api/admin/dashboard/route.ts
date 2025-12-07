import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase';
import { subDays, format } from 'date-fns';

// Disable caching for real-time updates
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(request: NextRequest) {
  try {
    const supabase = createServerClient();
    const searchParams = request.nextUrl.searchParams;
    const timeRange = searchParams.get('timeRange') || '7d'; // Default to 7 days

    let startDate: Date;
    let endDate: Date = new Date();
    let previousStartDate: Date;
    let previousEndDate: Date;

    switch (timeRange) {
      case '7d':
        startDate = subDays(endDate, 6);
        previousEndDate = subDays(startDate, 1);
        previousStartDate = subDays(previousEndDate, 6);
        break;
      case '30d':
        startDate = subDays(endDate, 29);
        previousEndDate = subDays(startDate, 1);
        previousStartDate = subDays(previousEndDate, 29);
        break;
      case '90d':
        startDate = subDays(endDate, 89);
        previousEndDate = subDays(startDate, 1);
        previousStartDate = subDays(previousEndDate, 89);
        break;
      default:
        startDate = subDays(endDate, 6);
        previousEndDate = subDays(startDate, 1);
        previousStartDate = subDays(previousEndDate, 6);
        break;
    }

    // Fetch products count
    const { count: productCount, error: productError } = await supabase
      .from('products')
      .select('*', { count: 'exact', head: true });

    if (productError) {
      console.error('Error fetching products count:', productError);
    }

    // Fetch orders within time range
    const { data: orders, error: ordersError } = await supabase
      .from('orders')
      .select('id, total_amount, status, created_at')
      .gte('created_at', previousStartDate.toISOString())
      .lte('created_at', endDate.toISOString())
      .order('created_at', { ascending: false });

    if (ordersError) {
      console.error('Error fetching orders:', ordersError);
    }

    const allOrders = orders || [];

    // Calculate current period stats
    const currentOrders = allOrders.filter(
      (order) => new Date(order.created_at) >= startDate && new Date(order.created_at) <= endDate
    );
    const previousOrders = allOrders.filter(
      (order) => new Date(order.created_at) >= previousStartDate && new Date(order.created_at) <= previousEndDate
    );

    const totalTransaction = currentOrders.reduce((sum, order) => sum + parseFloat(order.total_amount.toString()), 0);
    const previousTotalTransaction = previousOrders.reduce(
      (sum, order) => sum + parseFloat(order.total_amount.toString()),
      0
    );

    const completeOrder = currentOrders.filter((order) => order.status === 'completed').length;
    const previousCompleteOrder = previousOrders.filter((order) => order.status === 'completed').length;

    const cancelOrder = currentOrders.filter((order) => order.status === 'cancelled').length;
    const previousCancelOrder = previousOrders.filter((order) => order.status === 'cancelled').length;

    // Calculate percentage changes
    const transactionChange =
      previousTotalTransaction === 0
        ? (totalTransaction > 0 ? 100 : 0)
        : ((totalTransaction - previousTotalTransaction) / previousTotalTransaction) * 100;

    const productChange = 0; // Product count change would need previous period data

    const completeOrderChange =
      previousCompleteOrder === 0
        ? (completeOrder > 0 ? 100 : 0)
        : ((completeOrder - previousCompleteOrder) / previousCompleteOrder) * 100;

    const cancelOrderChange =
      previousCancelOrder === 0
        ? (cancelOrder > 0 ? 100 : 0)
        : ((cancelOrder - previousCancelOrder) / previousCancelOrder) * 100;

    // Fetch recent transactions (last 4 orders with product details)
    const recentOrderIds = currentOrders.slice(0, 4).map((order) => order.id);
    let recentTransactions: any[] = [];
    let recentOrders: any[] = [];

    if (recentOrderIds.length > 0) {
      const { data: orderItems } = await supabase
        .from('order_items')
        .select(
          `
          *,
          products (
            id,
            name,
            brand,
            images,
            category
          )
        `
        )
        .in('order_id', recentOrderIds);

      const orderItemsMap: { [key: string]: any[] } = {};
      orderItems?.forEach((item: any) => {
        if (!orderItemsMap[item.order_id]) {
          orderItemsMap[item.order_id] = [];
        }
        orderItemsMap[item.order_id].push(item);
      });

      recentTransactions = recentOrderIds
        .map((orderId) => {
          const order = currentOrders.find((o) => o.id === orderId);
          const items = orderItemsMap[orderId] || [];
          const firstItem = items[0];
          const product = firstItem?.products;

          if (!order || !product) return null;

          return {
            id: order.id.substring(0, 8).toUpperCase(),
            productName: product.name || 'N/A',
            category: product.category || 'Other',
            price: parseFloat(firstItem.price.toString()),
            date: format(new Date(order.created_at), 'dd MMM, yyyy'),
          };
        })
        .filter(Boolean);

      recentOrders = recentOrderIds
        .map((orderId) => {
          const order = currentOrders.find((o) => o.id === orderId);
          const items = orderItemsMap[orderId] || [];
          const firstItem = items[0];
          const product = firstItem?.products;

          if (!order || !product) return null;

          const imageUrl = Array.isArray(product.images)
            ? product.images[0]
            : typeof product.images === 'string'
            ? product.images
            : '/placeholder-product.jpg';

          return {
            id: order.id,
            productName: product.name || 'N/A',
            price: parseFloat(firstItem.price.toString()),
            image: imageUrl,
          };
        })
        .filter(Boolean);
    }

    // Generate sales chart data (daily sales for the current period)
    const salesDataMap = new Map<string, { current: number; previous: number }>();

    // Initialize all days in current period
    for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
      const dateKey = format(d, 'd MMM');
      salesDataMap.set(dateKey, { current: 0, previous: 0 });
    }

    // Initialize all days in previous period
    for (let d = new Date(previousStartDate); d <= previousEndDate; d.setDate(d.getDate() + 1)) {
      const dateKey = format(d, 'd MMM');
      if (!salesDataMap.has(dateKey)) {
        salesDataMap.set(dateKey, { current: 0, previous: 0 });
      }
    }

    // Calculate sales for each day
    currentOrders.forEach((order) => {
      const dateKey = format(new Date(order.created_at), 'd MMM');
      const existing = salesDataMap.get(dateKey) || { current: 0, previous: 0 };
      salesDataMap.set(dateKey, {
        ...existing,
        current: existing.current + parseFloat(order.total_amount.toString()),
      });
    });

    previousOrders.forEach((order) => {
      const dateKey = format(new Date(order.created_at), 'd MMM');
      const existing = salesDataMap.get(dateKey) || { current: 0, previous: 0 };
      salesDataMap.set(dateKey, {
        ...existing,
        previous: existing.previous + parseFloat(order.total_amount.toString()),
      });
    });

    const salesData = Array.from(salesDataMap.entries())
      .map(([date, values]) => ({ date, ...values }))
      .sort((a, b) => {
        const dateA = new Date(a.date + ', ' + new Date().getFullYear());
        const dateB = new Date(b.date + ', ' + new Date().getFullYear());
        return dateA.getTime() - dateB.getTime();
      });

    // Fetch popular brands (top brands by sales quantity)
    let popularBrands: any[] = [];
    try {
      const { data: allOrderItems } = await supabase
        .from('order_items')
        .select(`
          product_id,
          quantity,
          products (
            id,
            brand
          )
        `)
        .in('order_id', currentOrders.map(o => o.id));

      // Calculate total sales per brand
      const brandSalesMap = new Map<string, { name: string; sales: number }>();
      
      allOrderItems?.forEach((item: any) => {
        const product = item.products;
        const brand = product?.brand;
        if (brand) {
          const current = brandSalesMap.get(brand) || { name: brand, sales: 0 };
          brandSalesMap.set(brand, {
            name: current.name,
            sales: current.sales + (item.quantity || 1),
          });
        }
      });

      // Convert to array and sort by sales
      popularBrands = Array.from(brandSalesMap.entries())
        .map(([brand, data]) => ({
          id: brand.toLowerCase().replace(/\s+/g, '-'),
          name: data.name,
          sales: data.sales,
          color: '', // Will be assigned based on position
        }))
        .sort((a, b) => b.sales - a.sales)
        .slice(0, 4)
        .map((brand, idx) => {
          // Assign colors based on brand name
          const getBrandColor = (brandName: string) => {
            const name = brandName.toLowerCase();
            if (name.includes('jordan')) return '#ff6600'; // Orange
            if (name.includes('chrome') || name.includes('hearts')) return '#000000'; // Hitam
            if (name.includes('stussy')) return '#808080'; // Abu-abu
            // Default neon colors for other brands
            const neonColors = ['#ff00ff', '#00ffff', '#39ff14', '#ff1493'];
            return neonColors[idx] || '#ff00ff';
          };
          return {
            ...brand,
            color: getBrandColor(brand.name),
          };
        });
    } catch (error) {
      console.error('Error fetching popular brands:', error);
      // Use fallback data if fetch fails
      popularBrands = [
        { id: '1', name: 'Jordan', sales: 8172, color: '#ff6600' }, // Orange
        { id: '2', name: 'Chrome Hearts', sales: 6345, color: '#000000' }, // Hitam
        { id: '3', name: 'Stussy', sales: 3287, color: '#808080' }, // Abu-abu
        { id: '4', name: 'Red Bull', sales: 2456, color: '#ff1493' }, // Neon Deep Pink
      ];
    }

    // For now, use static country data (can be enhanced later with real data)
    const countries = [
      { country: 'United State', percentage: 34, flag: '🇺🇸' },
      { country: 'France', percentage: 25, flag: '🇫🇷' },
      { country: 'Australia', percentage: 15, flag: '🇦🇺' },
      { country: 'Germany', percentage: 12, flag: '🇩🇪' },
    ];

    return NextResponse.json({
      stats: {
        totalTransaction,
        totalProduct: productCount || 0,
        completeOrder,
        cancelOrder,
        transactionChange: parseFloat(transactionChange.toFixed(1)),
        productChange: 0, // Can be calculated if needed
        completeOrderChange: parseFloat(completeOrderChange.toFixed(1)),
        cancelOrderChange: parseFloat(cancelOrderChange.toFixed(1)),
      },
      transactions: recentTransactions,
      recentOrders,
      salesData,
      countries,
      popularBrands,
    });
  } catch (error: any) {
    console.error('Error fetching dashboard data:', error);
    return NextResponse.json(
      {
        error: {
          message: error.message || 'Failed to fetch dashboard data',
          code: error.code || 'FETCH_ERROR',
        },
      },
      { status: 500 }
    );
  }
}

