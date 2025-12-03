import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase';

// GET - Fetch user's cart items
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

    // Fetch cart items with product details
    const { data: cartItems, error } = await supabase
      .from('cart_items')
      .select(`
        id,
        product_id,
        quantity,
        size,
        color,
        created_at,
        products:product_id (
          id,
          name,
          brand,
          sale_price,
          original_price,
          images
        )
      `)
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      throw error;
    }

    // Transform data to match frontend format
    const formattedItems = cartItems?.map((item: any) => {
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
        quantity: item.quantity,
        size: item.size || null,
        color: item.color || null,
      };
    }) || [];

    return NextResponse.json({ data: formattedItems });
  } catch (error: any) {
    console.error('Error fetching cart:', error);
    return NextResponse.json(
      {
        error: {
          message: error.message || 'Failed to fetch cart items',
          code: 'FETCH_ERROR',
        },
      },
      { status: 500 }
    );
  }
}

// POST - Add item to cart
export async function POST(request: NextRequest) {
  try {
    const supabase = createServerClient();
    const body = await request.json();
    const { productId, quantity = 1, size, color } = body;

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

    // Check if item already exists in cart
    // Handle case where size/color columns might not exist yet
    let existingItem = null;
    try {
      const query = supabase
        .from('cart_items')
        .select('id, quantity')
        .eq('user_id', user.id)
        .eq('product_id', productId);
      
      // Only add size/color filters if they are provided
      if (size !== undefined && size !== null) {
        query.eq('size', size);
      } else {
        query.is('size', null);
      }
      
      if (color !== undefined && color !== null) {
        query.eq('color', color);
      } else {
        query.is('color', null);
      }
      
      const { data } = await query.single();
      existingItem = data;
    } catch (error: any) {
      // If columns don't exist, ignore and continue
      if (error?.code === 'PGRST116' || error?.message?.includes('column')) {
        existingItem = null;
      } else {
        throw error;
      }
    }

    if (existingItem) {
      // Update quantity
      const { data, error } = await supabase
        .from('cart_items')
        .update({ quantity: existingItem.quantity + quantity })
        .eq('id', existingItem.id)
        .select()
        .single();

      if (error) throw error;
      return NextResponse.json({ data });
    }

    // Create new cart item
    // Build insert object conditionally to handle missing columns
    const insertData: any = {
      user_id: user.id,
      product_id: productId,
      quantity,
    };
    
    // Only include size/color if they exist in schema
    // This will be handled gracefully by Supabase
    if (size !== undefined) insertData.size = size || null;
    if (color !== undefined) insertData.color = color || null;
    
    const { data, error } = await supabase
      .from('cart_items')
      .insert(insertData)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ data }, { status: 201 });
  } catch (error: any) {
    console.error('Error adding to cart:', error);
    return NextResponse.json(
      {
        error: {
          message: error.message || 'Failed to add item to cart',
          code: 'ADD_ERROR',
        },
      },
      { status: 500 }
    );
  }
}

// PUT - Update cart item
export async function PUT(request: NextRequest) {
  try {
    const supabase = createServerClient();
    const body = await request.json();
    const { id, quantity, size, color } = body;

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
        { error: { message: 'Cart item ID is required', code: 'MISSING_ID' } },
        { status: 400 }
      );
    }

    const updateData: any = {};
    if (quantity !== undefined) updateData.quantity = quantity;
    if (size !== undefined) updateData.size = size;
    if (color !== undefined) updateData.color = color;

    const { data, error } = await supabase
      .from('cart_items')
      .update(updateData)
      .eq('id', id)
      .eq('user_id', user.id) // Ensure user owns this item
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ data });
  } catch (error: any) {
    console.error('Error updating cart:', error);
    return NextResponse.json(
      {
        error: {
          message: error.message || 'Failed to update cart item',
          code: 'UPDATE_ERROR',
        },
      },
      { status: 500 }
    );
  }
}

// DELETE - Remove item from cart
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
        { error: { message: 'Cart item ID is required', code: 'MISSING_ID' } },
        { status: 400 }
      );
    }

    const { error } = await supabase
      .from('cart_items')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id); // Ensure user owns this item

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error deleting cart item:', error);
    return NextResponse.json(
      {
        error: {
          message: error.message || 'Failed to delete cart item',
          code: 'DELETE_ERROR',
        },
      },
      { status: 500 }
    );
  }
}

