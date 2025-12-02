import { NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase';

export async function GET() {
  try {
    const supabase = createServerClient();

    const { count, error } = await supabase
      .from('orders')
      .select('*', { count: 'exact', head: true });

    if (error) {
      throw error;
    }

    // Calculate total revenue
    const { data: orders, error: ordersError } = await supabase
      .from('orders')
      .select('total_amount')
      .eq('status', 'delivered');

    let revenue = 0;
    if (!ordersError && orders) {
      revenue = orders.reduce((sum, order) => sum + parseFloat(order.total_amount.toString()), 0);
    }

    return NextResponse.json({ 
      count: count || 0,
      revenue: revenue || 0,
    });
  } catch (error: any) {
    console.error('Error fetching orders count:', error);
    return NextResponse.json(
      {
        error: {
          message: error.message || 'Failed to fetch orders count',
          code: 'FETCH_ERROR',
        },
      },
      { status: 500 }
    );
  }
}

