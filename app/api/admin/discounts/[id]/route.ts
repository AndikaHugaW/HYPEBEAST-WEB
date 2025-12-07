import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase';

// Disable caching
export const dynamic = 'force-dynamic';
export const revalidate = 0;

// PUT - Update a discount (admin only)
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createServerClient();
    const body = await request.json();
    const { id } = params;
    
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
      status,
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

    // Build update object
    const updateData: any = {};
    if (code !== undefined) updateData.code = code.toUpperCase();
    if (name !== undefined) updateData.name = name;
    if (type !== undefined) updateData.type = type;
    if (value !== undefined) updateData.value = value.toFixed(2);
    if (minPurchase !== undefined) updateData.min_purchase = minPurchase ? minPurchase.toFixed(2) : null;
    if (maxDiscount !== undefined) updateData.max_discount = maxDiscount ? maxDiscount.toFixed(2) : null;
    if (startDate !== undefined) updateData.start_date = startDate;
    if (endDate !== undefined) updateData.end_date = endDate;
    if (usageLimit !== undefined) updateData.usage_limit = usageLimit || null;
    if (status !== undefined) updateData.status = status;

    // Update discount
    const { data: discount, error: discountError } = await supabase
      .from('discounts')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (discountError) {
      console.error('Error updating discount:', discountError);
      throw discountError;
    }

    if (!discount) {
      return NextResponse.json(
        { error: { message: 'Discount not found', code: 'NOT_FOUND' } },
        { status: 404 }
      );
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

    return NextResponse.json({ data: transformedDiscount });
  } catch (error: any) {
    console.error('Error updating discount:', error);
    return NextResponse.json(
      {
        error: {
          message: error.message || 'Failed to update discount',
          code: error.code || 'UPDATE_ERROR',
        },
      },
      { status: 500 }
    );
  }
}

// DELETE - Delete a discount (admin only)
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createServerClient();
    const { id } = params;

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

    // Delete discount
    const { error } = await supabase
      .from('discounts')
      .delete()
      .eq('id', id);

    if (error) {
      throw error;
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error deleting discount:', error);
    return NextResponse.json(
      {
        error: {
          message: error.message || 'Failed to delete discount',
          code: 'DELETE_ERROR',
        },
      },
      { status: 500 }
    );
  }
}

