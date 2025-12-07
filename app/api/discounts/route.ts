import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase';

// Disable caching
export const dynamic = 'force-dynamic';
export const revalidate = 0;

// GET - Fetch active discounts (public endpoint)
export async function GET(request: NextRequest) {
  try {
    const supabase = createServerClient();
    const now = new Date().toISOString();

    // Try to fetch from database first
    let discounts: any[] = [];
    
    try {
      const { data, error } = await supabase
        .from('discounts')
        .select('*')
        .eq('status', 'active')
        .lte('start_date', now)
        .gte('end_date', now)
        .order('created_at', { ascending: false });

      if (!error && data) {
        discounts = data.map((discount: any) => ({
          id: discount.id,
          code: discount.code,
          name: discount.name || discount.code,
          type: discount.type || 'percentage',
          value: discount.value || discount.discount_percentage || 0,
          minPurchase: discount.min_purchase || discount.minimum_purchase,
          maxDiscount: discount.max_discount || discount.maximum_discount,
          startDate: discount.start_date || discount.startDate,
          endDate: discount.end_date || discount.endDate,
          usageLimit: discount.usage_limit || discount.usageLimit,
          usedCount: discount.used_count || discount.usedCount || 0,
          status: discount.status || 'active',
        }));
      }
    } catch (dbError) {
      console.warn('Discount table may not exist, using fallback data:', dbError);
    }

    // Fallback to mock data if database doesn't exist or empty
    if (discounts.length === 0) {
      discounts = [
        {
          id: "1",
          code: "SUMMER20",
          name: "Summer Sale",
          type: "percentage",
          value: 20,
          minPurchase: 100,
          startDate: "2024-01-01",
          endDate: "2024-12-31",
          usageLimit: 1000,
          usedCount: 342,
          status: "active",
        },
        {
          id: "2",
          code: "WELCOME10",
          name: "Welcome Discount",
          type: "percentage",
          value: 10,
          startDate: "2024-01-01",
          endDate: "2024-12-31",
          usageLimit: 500,
          usedCount: 156,
          status: "active",
        },
        {
          id: "3",
          code: "FLAT50",
          name: "Flat $50 Off",
          type: "fixed",
          value: 50,
          minPurchase: 200,
          maxDiscount: 50,
          startDate: "2024-01-01",
          endDate: "2024-12-31",
          usageLimit: 200,
          usedCount: 89,
          status: "active",
        },
      ];
    }

    // Filter out expired discounts and check usage limits
    const activeDiscounts = discounts.filter((discount) => {
      const startDate = new Date(discount.startDate);
      const endDate = new Date(discount.endDate);
      const nowDate = new Date();

      // Check if discount is within valid date range
      if (nowDate < startDate || nowDate > endDate) {
        return false;
      }

      // Check if discount has reached usage limit
      if (discount.usageLimit && discount.usedCount >= discount.usageLimit) {
        return false;
      }

      return discount.status === 'active';
    });

    return NextResponse.json({ data: activeDiscounts });
  } catch (error: any) {
    console.error('Error fetching discounts:', error);
    return NextResponse.json(
      {
        error: {
          message: error.message || 'Failed to fetch discounts',
          code: 'FETCH_ERROR',
        },
      },
      { status: 500 }
    );
  }
}

