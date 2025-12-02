import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  try {
    const supabase = createServerClient();
    const searchParams = request.nextUrl.searchParams;

    // Get query parameters
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');

    // Build query for new arrivals
    let query = supabase
      .from('products')
      .select('*', { count: 'exact' })
      .eq('is_new_arrival', true)
      .order('created_at', { ascending: false });

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
    console.error('Error fetching new arrivals:', error);
    return NextResponse.json(
      {
        error: {
          message: error.message || 'Failed to fetch new arrivals',
          code: 'FETCH_ERROR',
        },
      },
      { status: 500 }
    );
  }
}

