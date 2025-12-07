import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase';

// Disable caching
export const dynamic = 'force-dynamic';
export const revalidate = 0;

// POST - Create a new order
export async function POST(request: NextRequest) {
  try {
    const supabase = createServerClient();
    const body = await request.json();
    
    const {
      shippingInfo,
      paymentMethod,
      cartItems,
      subtotal,
      shipping,
      tax,
      discount,
      discountCode,
      discountId,
      total,
    } = body;

    // Get user from auth header
    const authHeader = request.headers.get('authorization');
    let user = null;
    
    if (authHeader) {
      const token = authHeader.replace('Bearer ', '');
      const { data: { user: authUser }, error } = await supabase.auth.getUser(token);
      if (!error && authUser) {
        user = authUser;
      }
    }

    if (!user) {
      return NextResponse.json(
        { error: { message: 'Unauthorized', code: 'UNAUTHORIZED' } },
        { status: 401 }
      );
    }

    // Validate required fields
    if (!shippingInfo || !cartItems || cartItems.length === 0) {
      return NextResponse.json(
        { error: { message: 'Missing required fields', code: 'MISSING_FIELDS' } },
        { status: 400 }
      );
    }

    // Validate shipping information
    if (!shippingInfo.address || !shippingInfo.city || !shippingInfo.country || !shippingInfo.postalCode) {
      return NextResponse.json(
        { error: { message: 'Missing required shipping information (address, city, country, postal code)', code: 'MISSING_SHIPPING_INFO' } },
        { status: 400 }
      );
    }

    // Validate totals are numbers
    const validatedTotal = typeof total === 'number' ? total : parseFloat(total) || 0;
    if (validatedTotal <= 0) {
      return NextResponse.json(
        { error: { message: 'Invalid total amount', code: 'INVALID_TOTAL' } },
        { status: 400 }
      );
    }

    // Generate order number - use timestamp-based for faster response
    // Format: ORD-YYYYMMDD-HHMMSS-XXX (last 3 digits are milliseconds)
    const timestamp = Date.now();
    const date = new Date(timestamp);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');
    const milliseconds = String(timestamp % 1000).padStart(3, '0');
    const orderNumber = `ORD-${year}${month}${day}-${hours}${minutes}${seconds}-${milliseconds}`;

    // Prepare shipping address (both as string and separate fields)
    const shippingAddress = [
      shippingInfo.address,
      shippingInfo.city,
      shippingInfo.postalCode,
      shippingInfo.country,
    ]
      .filter(Boolean)
      .join(', ');

    // Create order
    const orderData: any = {
      user_id: user.id,
      order_number: orderNumber,
      status: 'pending',
      total_amount: validatedTotal.toFixed(2),
      customer_name: shippingInfo.fullName,
      customer_email: shippingInfo.email,
      shipping_address: shippingInfo.address,
      shipping_city: shippingInfo.city,
      shipping_country: shippingInfo.country,
      shipping_postal_code: shippingInfo.postalCode,
      billing_address: shippingAddress, // Same as shipping for now
      payment_method: paymentMethod,
      payment_status: 'pending',
    };

    // Add discount information if available
    if (discount !== undefined && discount !== null) {
      orderData.discount_amount = parseFloat(discount).toFixed(2);
    }
    if (discountCode) {
      orderData.discount_code = discountCode;
    }
    if (discountId) {
      orderData.discount_id = discountId;
    }

    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert(orderData)
      .select()
      .single();

    if (orderError) {
      console.error('Error creating order:', orderError);
      console.error('Order data attempted:', {
        user_id: user.id,
        order_number: orderNumber,
        total_amount: validatedTotal.toFixed(2),
      });
      throw orderError;
    }

    if (!order || !order.id) {
      console.error('Order created but no ID returned');
      throw new Error('Failed to create order - no ID returned');
    }

    // Create order items - validate and transform cart items
    const orderItemsData = cartItems
      .filter((item: any) => {
        // Validate that all required fields exist
        return item && item.productId && item.name && item.image && item.quantity && item.price;
      })
      .map((item: any) => {
        // Ensure product_id is properly formatted (handle both string and number)
        let productId = item.productId;
        // Convert to string if it's a number, or use as-is if already string
        if (typeof productId === 'number') {
          productId = productId.toString();
        }
        
        // Build product name (include brand if available)
        const productName = item.brand 
          ? `${item.brand} ${item.name}`.trim()
          : item.name;
        
        return {
          order_id: order.id,
          product_id: productId,
          product_name: productName,
          product_image: item.image,
          quantity: parseInt(item.quantity) || 1,
          size: item.size || null,
          price: parseFloat(item.price).toFixed(2),
        };
      });

    // Check if we have valid order items
    if (orderItemsData.length === 0) {
      // Rollback: delete the order if no valid items
      await supabase.from('orders').delete().eq('id', order.id);
      return NextResponse.json(
        {
          error: {
            message: 'No valid items in cart',
            code: 'INVALID_CART_ITEMS',
          },
        },
        { status: 400 }
      );
    }

    // Create order items and clear cart in parallel for faster response
    const [orderItemsResult, clearCartResult] = await Promise.allSettled([
      supabase
        .from('order_items')
        .insert(orderItemsData),
      supabase
        .from('cart_items')
        .delete()
        .eq('user_id', user.id)
    ]);

    // Check order items result
    if (orderItemsResult.status === 'rejected' || (orderItemsResult.status === 'fulfilled' && orderItemsResult.value.error)) {
      const orderItemsError = orderItemsResult.status === 'rejected' 
        ? orderItemsResult.reason 
        : orderItemsResult.value.error;
      console.error('Error creating order items:', orderItemsError);
      // Rollback: delete the order if items creation fails
      await supabase.from('orders').delete().eq('id', order.id);
      throw orderItemsError;
    }

    // Log cart clearing errors but don't fail the order
    if (clearCartResult.status === 'rejected' || (clearCartResult.status === 'fulfilled' && clearCartResult.value.error)) {
      console.error('Error clearing cart:', clearCartResult.status === 'rejected' ? clearCartResult.reason : clearCartResult.value.error);
    }

    // Return response immediately, create notification in background (non-blocking)
    const responseData = {
      data: {
        orderId: order.id,
        orderNumber: order.order_number,
        total: order.total_amount,
      },
    };

    // Create notification asynchronously (don't wait for it)
    supabase
      .from('notifications')
      .insert({
        user_id: user.id,
        title: 'Order Confirmed',
        message: `Your order ${order.order_number} has been confirmed and is being processed.`,
        type: 'success',
        is_read: false,
        link: `/order-confirmation?orderNumber=${order.order_number}&orderId=${order.id}`
      })
      .then(() => {
        // Notification created successfully
      })
      .catch((notifError) => {
        // Don't fail the order if notification fails
        console.error('Error creating notification:', notifError);
      });

    return NextResponse.json(responseData, { status: 201 });
  } catch (error: any) {
    console.error('Error creating order:', error);
    console.error('Error details:', {
      message: error.message,
      code: error.code,
      details: error.details,
      hint: error.hint,
    });
    
    // Return more descriptive error message
    const errorMessage = error.message || 'Failed to create order';
    const errorCode = error.code || error.hint || 'CREATE_ORDER_ERROR';
    
    return NextResponse.json(
      {
        error: {
          message: errorMessage,
          code: errorCode,
          details: process.env.NODE_ENV === 'development' ? error.details : undefined,
        },
      },
      { status: 500 }
    );
  }
}

// GET - Fetch user's orders
export async function GET(request: NextRequest) {
  try {
    const supabase = createServerClient();

    // Get user from auth header
    const authHeader = request.headers.get('authorization');
    let user = null;
    
    if (authHeader) {
      const token = authHeader.replace('Bearer ', '');
      const { data: { user: authUser }, error } = await supabase.auth.getUser(token);
      if (!error && authUser) {
        user = authUser;
      }
    }

    if (!user) {
      return NextResponse.json(
        { error: { message: 'Unauthorized', code: 'UNAUTHORIZED' } },
        { status: 401 }
      );
    }

    // Fetch user's orders
    const { data: orders, error } = await supabase
      .from('orders')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      throw error;
    }

    // Fetch order items for each order
    const orderIds = (orders || []).map((o: any) => o.id);
    let orderItemsMap: any = {};

    if (orderIds.length > 0) {
      const { data: orderItems } = await supabase
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

      orderItems?.forEach((item: any) => {
        if (!orderItemsMap[item.order_id]) {
          orderItemsMap[item.order_id] = [];
        }
        orderItemsMap[item.order_id].push(item);
      });
    }

    // Transform data
    const transformedOrders = (orders || []).map((order: any) => ({
      id: order.id,
      orderNumber: order.order_number,
      status: order.status,
      totalAmount: parseFloat(order.total_amount || 0),
      customerName: order.customer_name,
      customerEmail: order.customer_email,
      shippingAddress: order.shipping_address,
      paymentMethod: order.payment_method,
      paymentStatus: order.payment_status,
      createdAt: order.created_at,
      items: orderItemsMap[order.id] || [],
    }));

    return NextResponse.json({ data: transformedOrders });
  } catch (error: any) {
    console.error('Error fetching orders:', error);
    return NextResponse.json(
      {
        error: {
          message: error.message || 'Failed to fetch orders',
          code: 'FETCH_ERROR',
        },
      },
      { status: 500 }
    );
  }
}

