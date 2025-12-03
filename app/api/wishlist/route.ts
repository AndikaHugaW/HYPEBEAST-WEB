import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase';

// GET - Fetch user's wishlist items
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

    // Fetch wishlist items with product details
    const { data: wishlistItems, error } = await supabase
      .from('wishlist_items')
      .select(`
        id,
        product_id,
        created_at,
        products:product_id (
          id,
          name,
          brand,
          sale_price,
          original_price,
          images,
          stock_status
        )
      `)
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      throw error;
    }

    // Transform data to match frontend format
    const formattedItems = wishlistItems?.map((item: any) => {
      const product = item.products;
      const images = Array.isArray(product?.images) 
        ? product.images 
        : product?.images 
          ? JSON.parse(product.images) 
          : [];
      
      return {
        id: item.id,
        productId: item.product_id,
        name: product?.name || '',
        brand: product?.brand || '',
        price: product?.sale_price || 0,
        originalPrice: product?.original_price || null,
        image: images[0] || '',
        inStock: product?.stock_status !== 'out_of_stock',
      };
    }) || [];

    return NextResponse.json({ data: formattedItems });
  } catch (error: any) {
    console.error('Error fetching wishlist:', error);
    return NextResponse.json(
      {
        error: {
          message: error.message || 'Failed to fetch wishlist items',
          code: 'FETCH_ERROR',
        },
      },
      { status: 500 }
    );
  }
}

// POST - Add item to wishlist
export async function POST(request: NextRequest) {
  try {
    const supabase = createServerClient();
    const body = await request.json();
    const { productId } = body;

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

    if (!productId) {
      return NextResponse.json(
        { error: { message: 'Product ID is required', code: 'MISSING_PRODUCT_ID' } },
        { status: 400 }
      );
    }

    // Check if item already exists in wishlist
    const { data: existingItem } = await supabase
      .from('wishlist_items')
      .select('id')
      .eq('user_id', user.id)
      .eq('product_id', productId)
      .single();

    if (existingItem) {
      return NextResponse.json(
        { error: { message: 'Item already in wishlist', code: 'ALREADY_EXISTS' } },
        { status: 400 }
      );
    }

    // Create new wishlist item
    const { data, error } = await supabase
      .from('wishlist_items')
      .insert({
        user_id: user.id,
        product_id: productId,
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ data }, { status: 201 });
  } catch (error: any) {
    console.error('Error adding to wishlist:', error);
    return NextResponse.json(
      {
        error: {
          message: error.message || 'Failed to add item to wishlist',
          code: 'ADD_ERROR',
        },
      },
      { status: 500 }
    );
  }
}

// DELETE - Remove item from wishlist
export async function DELETE(request: NextRequest) {
  try {
    const supabase = createServerClient();
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

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

    if (!id) {
      return NextResponse.json(
        { error: { message: 'Wishlist item ID is required', code: 'MISSING_ID' } },
        { status: 400 }
      );
    }

    const { error } = await supabase
      .from('wishlist_items')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id); // Ensure user owns this item

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error deleting wishlist item:', error);
    return NextResponse.json(
      {
        error: {
          message: error.message || 'Failed to delete wishlist item',
          code: 'DELETE_ERROR',
        },
      },
      { status: 500 }
    );
  }
}

