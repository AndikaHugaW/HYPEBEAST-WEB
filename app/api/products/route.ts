import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  try {
    const supabase = createServerClient();
    const searchParams = request.nextUrl.searchParams;

    // Get query parameters
    const category = searchParams.get('category');
    const designer = searchParams.get('designer');
    const isNewArrival = searchParams.get('is_new_arrival');
    const isOnSale = searchParams.get('is_on_sale');
    const minPrice = searchParams.get('min_price');
    const maxPrice = searchParams.get('max_price');
    const color = searchParams.get('color');
    const storeId = searchParams.get('store_id');
    const search = searchParams.get('search');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const sort = searchParams.get('sort') || 'newest';

    // Build query
    let query = supabase
      .from('products')
      .select('*', { count: 'exact' });

    // Apply filters
    if (category) {
      query = query.eq('category', category);
    }
    if (designer) {
      query = query.eq('designer', designer);
    }
    if (isNewArrival === 'true') {
      query = query.eq('is_new_arrival', true);
    }
    if (isOnSale === 'true') {
      query = query.eq('is_on_sale', true);
    }
    if (minPrice) {
      query = query.gte('sale_price', parseFloat(minPrice));
    }
    if (maxPrice) {
      query = query.lte('sale_price', parseFloat(maxPrice));
    }
    if (color) {
      query = query.eq('color', color);
    }
    if (storeId) {
      query = query.eq('store_id', storeId);
    }
    if (search) {
      query = query.or(`name.ilike.%${search}%,brand.ilike.%${search}%`);
    }

    // Apply sorting
    switch (sort) {
      case 'price_asc':
        query = query.order('sale_price', { ascending: true });
        break;
      case 'price_desc':
        query = query.order('sale_price', { ascending: false });
        break;
      case 'oldest':
        query = query.order('created_at', { ascending: true });
        break;
      case 'newest':
      default:
        query = query.order('created_at', { ascending: false });
        break;
    }

    // Apply pagination
    const from = (page - 1) * limit;
    const to = from + limit - 1;
    query = query.range(from, to);

    const { data, error, count } = await query;

    if (error) {
      throw error;
    }

    return NextResponse.json({
      data: data || [],
      total: count || 0,
      page,
      limit,
    });
  } catch (error: any) {
    console.error('Error fetching products:', error);
    return NextResponse.json(
      {
        error: {
          message: error.message || 'Failed to fetch products',
          code: 'FETCH_ERROR',
        },
      },
      { status: 500 }
    );
  }
}

