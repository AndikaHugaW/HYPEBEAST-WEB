import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createServerClient();
    const { id } = params;

    // Check if id is a UUID (36 chars with hyphens) or slug
    const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);

    let query = supabase.from('products').select('*');

    if (isUUID) {
      // Search by ID (UUID)
      query = query.eq('id', id);
    } else {
      // Search by slug
      query = query.eq('slug', id);
    }

    const { data, error } = await query.single();

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json(
          {
            error: {
              message: 'Product not found',
              code: 'NOT_FOUND',
            },
          },
          { status: 404 }
        );
      }
      throw error;
    }

    if (!data) {
      return NextResponse.json(
        {
          error: {
            message: 'Product not found',
            code: 'NOT_FOUND',
          },
        },
        { status: 404 }
      );
    }

    // Ensure images is always an array
    // If images is a string (JSON), parse it
    // If images is null/undefined, set to empty array
    let images = data.images;
    if (typeof images === 'string') {
      try {
        images = JSON.parse(images);
      } catch (e) {
        console.error('Error parsing images JSON:', e);
        images = [];
      }
    }
    if (!Array.isArray(images)) {
      images = images ? [images] : [];
    }

    // Return data with normalized images array
    return NextResponse.json({
      ...data,
      images: images,
    });
  } catch (error: any) {
    console.error('Error fetching product:', error);
    return NextResponse.json(
      {
        error: {
          message: error.message || 'Failed to fetch product',
          code: 'FETCH_ERROR',
        },
      },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createServerClient();
    const { id } = params;
    const body = await request.json();

    // Extract allowed fields to update
    const {
      images,
      name,
      brand,
      description,
      original_price,
      sale_price,
      discount_percentage,
      category,
      designer,
      color,
      size,
      stock_status,
      is_new_arrival,
      is_featured,
      is_on_sale,
    } = body;

    // Build update object
    const updateData: any = {
      updated_at: new Date().toISOString(),
    };

    // Ensure images is always an array when saving
    if (images !== undefined) {
      // If images is already an array, use it directly
      // If it's a string, try to parse it
      if (Array.isArray(images)) {
        updateData.images = images;
      } else if (typeof images === 'string') {
        try {
          updateData.images = JSON.parse(images);
        } catch (e) {
          updateData.images = [images];
        }
      } else {
        updateData.images = images ? [images] : [];
      }
    }
    if (name !== undefined) updateData.name = name;
    if (brand !== undefined) updateData.brand = brand;
    if (description !== undefined) updateData.description = description;
    if (original_price !== undefined) updateData.original_price = original_price;
    if (sale_price !== undefined) updateData.sale_price = sale_price;
    if (discount_percentage !== undefined) updateData.discount_percentage = discount_percentage;
    if (category !== undefined) updateData.category = category;
    if (designer !== undefined) updateData.designer = designer;
    if (color !== undefined) updateData.color = color;
    if (size !== undefined) updateData.size = size;
    if (stock_status !== undefined) updateData.stock_status = stock_status;
    if (is_new_arrival !== undefined) updateData.is_new_arrival = is_new_arrival;
    if (is_featured !== undefined) updateData.is_featured = is_featured;
    if (is_on_sale !== undefined) updateData.is_on_sale = is_on_sale;

    const { data, error } = await supabase
      .from('products')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating product:', error);
      throw error;
    }

    return NextResponse.json(data);
  } catch (error: any) {
    console.error('Error updating product:', error);
    return NextResponse.json(
      {
        error: {
          message: error.message || 'Failed to update product',
          code: 'UPDATE_ERROR',
        },
      },
      { status: 500 }
    );
  }
}

