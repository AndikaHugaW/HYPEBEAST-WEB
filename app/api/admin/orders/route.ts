import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase';

// Disable caching for real-time updates
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(request: NextRequest) {
  try {
    const supabase = createServerClient();
    const searchParams = request.nextUrl.searchParams;
    const status = searchParams.get('status');

    // Build query - fetch all first, then filter in JavaScript for case-insensitive matching
    let query = supabase
      .from('orders')
      .select('*')
      .order('created_at', { ascending: false });

    // Fetch all orders first
    const { data: allData, error } = await query;
    
    // Filter by status if provided (case-insensitive)
    let data = allData;
    if (status && status !== 'all') {
      const normalizedStatus = status.toLowerCase().trim();
      console.log(`[API] ========== FILTERING ==========`);
      console.log(`[API] Requested status: "${status}"`);
      console.log(`[API] Normalized status: "${normalizedStatus}"`);
      console.log(`[API] Total orders before filter: ${allData?.length || 0}`);
      
      // Log all statuses in database for debugging
      if (allData && allData.length > 0) {
        const statuses = allData.map((o: any) => ({
          id: o.id,
          status: o.status,
          statusLower: (o.status || '').toLowerCase().trim(),
          order_number: o.order_number
        }));
        console.log(`[API] All order statuses in DB:`, statuses);
      }
      
      data = (allData || []).filter((order: any) => {
        const orderStatus = (order.status || '').toLowerCase().trim();
        const matches = orderStatus === normalizedStatus;
        if (matches) {
          console.log(`[API] ✅ Match found: Order ${order.order_number} with status "${order.status}" matches "${normalizedStatus}"`);
        }
        return matches;
      });
      
      console.log(`[API] Orders after filter: ${data.length}`);
      if (data.length === 0 && allData && allData.length > 0) {
        console.warn(`[API] ⚠️ No orders match filter "${normalizedStatus}"!`);
        console.warn(`[API] Available statuses:`, [...new Set(allData.map((o: any) => (o.status || '').toLowerCase().trim()))]);
      }
      console.log(`[API] =============================`);
    }

    if (error) {
      console.error('Supabase error fetching orders:', error);
      throw error;
    }

    console.log(`[API] Found ${data?.length || 0} orders from database`);
    if (data && data.length > 0) {
      console.log(`[API] Sample order statuses:`, data.slice(0, 3).map((o: any) => ({ id: o.id, status: o.status, order_number: o.order_number })));
    }

    // Fetch order items separately for better compatibility
    const orderIds = (data || []).map((o: any) => o.id);
    let orderItemsMap: any = {};

    if (orderIds.length > 0) {
      try {
        // Fetch order items with products
        const { data: orderItems, error: itemsError } = await supabase
          .from('order_items')
          .select(`
            *,
            products (
              id,
              name,
              brand,
              images
            )
          `)
          .in('order_id', orderIds);

        if (itemsError) {
          console.error('[API] Error fetching order items:', itemsError);
          // Continue without order items - we'll use fallbacks
        }

        // Group order items by order_id
        if (orderItems) {
          orderItems.forEach((item: any) => {
            if (!orderItemsMap[item.order_id]) {
              orderItemsMap[item.order_id] = [];
            }
            orderItemsMap[item.order_id].push(item);
          });
        }
      } catch (err) {
        console.error('[API] Exception fetching order items:', err);
        // Continue without order items
      }
    }

    // Transform data to match frontend structure
    console.log(`[API] ========== TRANSFORMING DATA ==========`);
    console.log(`[API] Input data count: ${data?.length || 0}`);
    console.log(`[API] Order items map keys:`, Object.keys(orderItemsMap));
    
    const transformedOrders = (data || []).map((order: any, index: number) => {
      try {
        // Get first order item for display
        const items = orderItemsMap[order.id] || [];
        const firstItem = items[0];
        const product = firstItem?.products;
        
        // Use product_name from order_items if available, otherwise from products table
        const productName = firstItem?.product_name || product?.name || 'Order Items';
        const productImage = firstItem?.product_image || (Array.isArray(product?.images) ? product.images[0] : (typeof product?.images === 'string' ? product.images : '/placeholder-product.jpg'));
        
        // Normalize status to lowercase for consistency
        const normalizedOrderStatus = (order.status || 'pending').toLowerCase().trim();
        
        const transformed = {
          id: order.id,
          orderNumber: order.order_number || `ORD-${order.id.substring(0, 8).toUpperCase()}`,
          customerName: order.customer_name || order.customer_email?.split('@')[0] || 'Unknown',
          customerEmail: order.customer_email || `user-${order.user_id?.substring(0, 8) || 'unknown'}@example.com`,
          productName: productName,
          productImage: productImage,
          quantity: firstItem?.quantity || 1,
          price: parseFloat(order.total_amount || 0),
          status: normalizedOrderStatus,
          date: new Date(order.created_at).toLocaleDateString('en-US', { year: 'numeric', month: '2-digit', day: '2-digit' }),
          created_at: order.created_at,
        };
        
        if (index === 0) {
          console.log(`[API] First transformed order:`, transformed);
        }
        
        return transformed;
      } catch (err) {
        console.error(`[API] Error transforming order ${order.id}:`, err);
        // Return minimal order data even if transformation fails
        const fallback = {
          id: order.id,
          orderNumber: order.order_number || `ORD-${order.id.substring(0, 8).toUpperCase()}`,
          customerName: order.customer_name || order.customer_email?.split('@')[0] || 'Unknown',
          customerEmail: order.customer_email || 'unknown@example.com',
          productName: 'Order',
          productImage: '/placeholder-product.jpg',
          quantity: 1,
          price: parseFloat(order.total_amount || 0),
          status: (order.status || 'pending').toLowerCase().trim(),
          date: new Date(order.created_at).toLocaleDateString('en-US', { year: 'numeric', month: '2-digit', day: '2-digit' }),
          created_at: order.created_at,
        };
        console.log(`[API] Using fallback for order ${order.id}:`, fallback);
        return fallback;
      }
    });
    
    console.log(`[API] Transformed ${transformedOrders.length} orders`);
    console.log(`[API] =======================================`);

    console.log(`[API] Transformed ${transformedOrders.length} orders`);
    if (transformedOrders.length > 0) {
      console.log(`[API] Sample transformed order:`, {
        id: transformedOrders[0].id,
        status: transformedOrders[0].status,
        orderNumber: transformedOrders[0].orderNumber,
        productName: transformedOrders[0].productName
      });
    }

    // Ensure we always return an array, even if empty
    const responseData = {
      data: Array.isArray(transformedOrders) ? transformedOrders : [],
      count: Array.isArray(transformedOrders) ? transformedOrders.length : 0,
    };
    
    // Comprehensive logging
    console.log(`[API] ========== API Response ==========`);
    console.log(`[API] Status filter: "${status}"`);
    console.log(`[API] Total orders from DB: ${data?.length || 0}`);
    console.log(`[API] Transformed orders: ${transformedOrders.length}`);
    console.log(`[API] Response data count: ${responseData.count}`);
    
    if (responseData.count > 0) {
      console.log(`[API] First order in response:`, JSON.stringify({
        id: responseData.data[0].id,
        status: responseData.data[0].status,
        orderNumber: responseData.data[0].orderNumber,
        customerName: responseData.data[0].customerName,
        productName: responseData.data[0].productName
      }, null, 2));
    } else {
      console.warn(`[API] ⚠️ No orders in response! Check filter: "${status}"`);
      if (data && data.length > 0) {
        console.warn(`[API] ⚠️ But we have ${data.length} orders from DB. Status values:`, 
          data.map((o: any) => o.status));
      }
    }
    console.log(`[API] ==================================`);
    
    return NextResponse.json(responseData, {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  } catch (error: any) {
    console.error('Error fetching orders:', error);
    return NextResponse.json(
      {
        error: {
          message: error.message || 'Failed to fetch orders',
          code: error.code || 'FETCH_ERROR',
        },
      },
      { status: 500 }
    );
  }
}

