import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase';

// Disable caching
export const dynamic = 'force-dynamic';
export const revalidate = 0;

// GET - Fetch all discounts (admin only)
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

    // Check if user is admin
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (profileError || !profile || profile.role !== 'admin') {
      return NextResponse.json(
        { error: { message: 'Forbidden - Admin access required', code: 'FORBIDDEN' } },
        { status: 403 }
      );
    }

    // Fetch discounts
    const { data: discounts, error } = await supabase
      .from('discounts')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching discounts:', error);
      console.error('Error details:', {
        message: error.message,
        code: error.code,
        details: error.details,
        hint: error.hint,
      });
      
      // Provide more specific error messages
      if (error.code === '42P01') {
        return NextResponse.json(
          {
            error: {
              message: 'Discounts table does not exist. Please run the database migration.',
              code: 'TABLE_NOT_FOUND',
              details: error.details,
            },
          },
          { status: 500 }
        );
      }
      
      throw error;
    }

    // Transform data to match frontend format
    const transformedDiscounts = (discounts || []).map((discount: any) => ({
      id: discount.id,
      code: discount.code,
      name: discount.name,
      type: discount.type,
      value: parseFloat(discount.value || 0),
      minPurchase: discount.min_purchase ? parseFloat(discount.min_purchase) : undefined,
      maxDiscount: discount.max_discount ? parseFloat(discount.max_discount) : undefined,
      startDate: discount.start_date,
      endDate: discount.end_date,
      usageLimit: discount.usage_limit || undefined,
      usedCount: discount.used_count || 0,
      status: discount.status || 'active',
      createdAt: discount.created_at,
      updatedAt: discount.updated_at,
    }));

    return NextResponse.json({ data: transformedDiscounts });
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

// POST - Create a new discount (admin only)
export async function POST(request: NextRequest) {
  try {
    const supabase = createServerClient();
    const body = await request.json();
    
    const {
      code,
      name,
      type,
      value,
      minPurchase,
      maxDiscount,
      startDate,
      endDate,
      usageLimit,
      status = 'active',
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

    // Check if user is admin
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (profileError || !profile || profile.role !== 'admin') {
      return NextResponse.json(
        { error: { message: 'Forbidden - Admin access required', code: 'FORBIDDEN' } },
        { status: 403 }
      );
    }

    // Validate required fields
    if (!code || !name || !type || !value || !startDate || !endDate) {
      return NextResponse.json(
        { error: { message: 'Missing required fields', code: 'MISSING_FIELDS' } },
        { status: 400 }
      );
    }

    // Create discount
    const { data: discount, error: discountError } = await supabase
      .from('discounts')
      .insert({
        code: code.toUpperCase(),
        name,
        type,
        value: value.toFixed(2),
        min_purchase: minPurchase ? minPurchase.toFixed(2) : null,
        max_discount: maxDiscount ? maxDiscount.toFixed(2) : null,
        start_date: startDate,
        end_date: endDate,
        usage_limit: usageLimit || null,
        used_count: 0,
        status,
      })
      .select()
      .single();

    if (discountError) {
      console.error('Error creating discount:', discountError);
      console.error('Discount error details:', {
        message: discountError.message,
        code: discountError.code,
        details: discountError.details,
        hint: discountError.hint,
      });
      
      // Provide more specific error messages
      if (discountError.code === '42P01') {
        return NextResponse.json(
          {
            error: {
              message: 'Discounts table does not exist. Please run the database migration.',
              code: 'TABLE_NOT_FOUND',
              details: discountError.details,
            },
          },
          { status: 500 }
        );
      }
      
      if (discountError.code === '23505') {
        return NextResponse.json(
          {
            error: {
              message: `Discount code "${code.toUpperCase()}" already exists. Please use a different code.`,
              code: 'DUPLICATE_CODE',
            },
          },
          { status: 400 }
        );
      }
      
      throw discountError;
    }

    // Transform response
    const transformedDiscount = {
      id: discount.id,
      code: discount.code,
      name: discount.name,
      type: discount.type,
      value: parseFloat(discount.value || 0),
      minPurchase: discount.min_purchase ? parseFloat(discount.min_purchase) : undefined,
      maxDiscount: discount.max_discount ? parseFloat(discount.max_discount) : undefined,
      startDate: discount.start_date,
      endDate: discount.end_date,
      usageLimit: discount.usage_limit || undefined,
      usedCount: discount.used_count || 0,
      status: discount.status || 'active',
    };

    return NextResponse.json({ data: transformedDiscount }, { status: 201 });
  } catch (error: any) {
    console.error('Error creating discount:', error);
    return NextResponse.json(
      {
        error: {
          message: error.message || 'Failed to create discount',
          code: error.code || 'CREATE_ERROR',
          details: error.details,
        },
      },
      { status: 500 }
    );
  }
}

