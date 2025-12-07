import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase';

// Disable caching
export const dynamic = 'force-dynamic';
export const revalidate = 0;

// GET - Get order details with all items
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createServerClient();
    const orderId = params.id;

    // Get order details
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .select('*')
      .eq('id', orderId)
      .single();

    if (orderError || !order) {
      return NextResponse.json(
        { error: { message: 'Order not found', code: 'ORDER_NOT_FOUND' } },
        { status: 404 }
      );
    }

    // Get all order items
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
      .eq('order_id', orderId);

    if (itemsError) {
      console.error('Error fetching order items:', itemsError);
    }

    // Transform order items
    const transformedItems = (orderItems || []).map((item: any) => {
      const product = item.products;
      return {
        id: item.id,
        productId: item.product_id,
        productName: item.product_name || product?.name || 'Unknown Product',
        productImage: item.product_image || (Array.isArray(product?.images) ? product.images[0] : (typeof product?.images === 'string' ? product.images : '/placeholder-product.jpg')),
        brand: product?.brand || '',
        quantity: item.quantity,
        price: parseFloat(item.price || 0),
        size: item.size || null,
      };
    });

    // Calculate totals
    const subtotal = transformedItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const shipping = subtotal > 0 ? 10 : 0;
    const tax = subtotal * 0.1;
    const discount = parseFloat(order.discount_amount || 0);
    const total = subtotal + shipping + tax - discount;

    return NextResponse.json({
      data: {
        id: order.id,
        orderNumber: order.order_number,
        status: order.status,
        customerName: order.customer_name,
        customerEmail: order.customer_email,
        shippingAddress: order.shipping_address,
        shippingCity: order.shipping_city,
        shippingCountry: order.shipping_country,
        shippingPostalCode: order.shipping_postal_code,
        paymentMethod: order.payment_method,
        paymentStatus: order.payment_status,
        discountAmount: discount,
        discountCode: order.discount_code,
        createdAt: order.created_at,
        updatedAt: order.updated_at,
        items: transformedItems,
        totals: {
          subtotal,
          shipping,
          tax,
          discount,
          total,
        },
      },
    });
  } catch (error: any) {
    console.error('Error fetching order details:', error);
    return NextResponse.json(
      {
        error: {
          message: error.message || 'Failed to fetch order details',
          code: error.code || 'FETCH_ERROR',
        },
      },
      { status: 500 }
    );
  }
}

// PUT - Update order status
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createServerClient();
    const orderId = params.id;
    const body = await request.json();
    const { status } = body;

    // Validate and normalize status to lowercase
    const normalizedStatus = status?.toLowerCase().trim();
    const validStatuses = ['pending', 'processing', 'completed', 'cancelled'];
    if (!normalizedStatus || !validStatuses.includes(normalizedStatus)) {
      return NextResponse.json(
        { error: { message: 'Invalid status. Must be one of: pending, processing, completed, cancelled', code: 'INVALID_STATUS' } },
        { status: 400 }
      );
    }

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

    // Get current order to find user_id for notification
    const { data: currentOrder, error: fetchError } = await supabase
      .from('orders')
      .select('user_id, order_number, status')
      .eq('id', orderId)
      .single();

    if (fetchError || !currentOrder) {
      return NextResponse.json(
        { error: { message: 'Order not found', code: 'ORDER_NOT_FOUND' } },
        { status: 404 }
      );
    }

    // Update order status (always use lowercase)
    const { data: updatedOrder, error: updateError } = await supabase
      .from('orders')
      .update({ 
        status: normalizedStatus,
        updated_at: new Date().toISOString()
      })
      .eq('id', orderId)
      .select()
      .single();

    if (updateError) {
      console.error('Error updating order:', updateError);
      throw updateError;
    }

    // Create notification for the user who placed the order
    if (currentOrder.user_id && status !== currentOrder.status) {
      const statusMessages: { [key: string]: { title: string; message: string } } = {
        processing: {
          title: 'Order Processing',
          message: `Your order ${currentOrder.order_number} is now being processed.`
        },
        completed: {
          title: 'Order Completed',
          message: `Your order ${currentOrder.order_number} has been completed!`
        },
        cancelled: {
          title: 'Order Cancelled',
          message: `Your order ${currentOrder.order_number} has been cancelled.`
        },
        pending: {
          title: 'Order Status Updated',
          message: `Your order ${currentOrder.order_number} status has been updated to pending.`
        }
      };

      const notification = statusMessages[normalizedStatus];
      if (notification) {
        try {
          await supabase
            .from('notifications')
            .insert({
              user_id: currentOrder.user_id,
              title: notification.title,
              message: notification.message,
              type: normalizedStatus === 'completed' ? 'success' : normalizedStatus === 'cancelled' ? 'error' : 'info',
              is_read: false,
              link: `/orders?orderNumber=${currentOrder.order_number}`
            });
        } catch (notifError) {
          // Don't fail the order update if notification fails
          console.error('Error creating notification:', notifError);
        }
      }
    }

    return NextResponse.json({
      data: updatedOrder,
    });
  } catch (error: any) {
    console.error('Error updating order:', error);
    return NextResponse.json(
      {
        error: {
          message: error.message || 'Failed to update order',
          code: error.code || 'UPDATE_ERROR',
        },
      },
      { status: 500 }
    );
  }
}
