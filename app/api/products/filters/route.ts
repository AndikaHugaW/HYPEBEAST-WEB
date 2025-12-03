import { NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase';

export async function GET() {
  try {
    const supabase = createServerClient();

    // Fetch all products to extract unique filter values
    const { data: products, error } = await supabase
      .from('products')
      .select('category, color, brand, is_on_sale, is_new_arrival');

    if (error) {
      throw error;
    }

    if (!products || products.length === 0) {
      return NextResponse.json({
        categories: [],
        colors: [],
        brands: [],
        hasOnSale: false,
        hasNewArrival: false,
      });
    }

    // Extract unique values
    const categories = [...new Set(products.map(p => p.category).filter(Boolean))].sort();
    const colors = [...new Set(products.map(p => p.color).filter(Boolean))].sort();
    const brands = [...new Set(products.map(p => p.brand).filter(Boolean))].sort();
    const hasOnSale = products.some(p => p.is_on_sale === true);
    const hasNewArrival = products.some(p => p.is_new_arrival === true);

    return NextResponse.json({
      categories,
      colors,
      brands,
      hasOnSale,
      hasNewArrival,
    });
  } catch (error: any) {
    console.error('Error fetching filter options:', error);
    return NextResponse.json(
      {
        error: {
          message: error.message || 'Failed to fetch filter options',
          code: 'FETCH_ERROR',
        },
      },
      { status: 500 }
    );
  }
}

