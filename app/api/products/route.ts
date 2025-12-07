import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase';

// Disable caching for real-time updates
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(request: NextRequest) {
  try {
    const supabase = createServerClient();
    const searchParams = request.nextUrl.searchParams;

    // Get query parameters
    const categories = searchParams.getAll('category'); // Get all category parameters
    const category = categories.length > 0 ? categories[0] : null; // Use first one for main category
    const brands = searchParams.getAll('brand'); // Get all brand parameters
    const gender = searchParams.get('gender');
    const isNewArrival = searchParams.get('is_new_arrival');
    const isOnSale = searchParams.get('is_on_sale');
    const minPrice = searchParams.get('min_price');
    const maxPrice = searchParams.get('max_price');
    const colors = searchParams.getAll('color'); // Get all color parameters
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
    // If multiple categories, use 'in' filter, otherwise use 'eq'
    // Note: If isNewArrival is true, we don't filter by category to avoid conflicts
    if (categories.length > 0 && isNewArrival !== 'true') {
      if (categories.length === 1) {
        query = query.eq('category', categories[0]);
      } else {
        query = query.in('category', categories);
      }
    }
    // If multiple brands, use 'in' filter, otherwise use 'eq'
    if (brands.length > 0) {
      if (brands.length === 1) {
        query = query.eq('brand', brands[0]);
      } else {
        query = query.in('brand', brands);
      }
    }
    // Gender filter - only show products with matching gender
    // Products without gender (null) will not be shown when gender filter is active
    if (gender) {
      query = query.eq('gender', gender);
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
    // If multiple colors, use 'in' filter, otherwise use 'eq'
    if (colors.length > 0) {
      if (colors.length === 1) {
        query = query.eq('color', colors[0]);
      } else {
        query = query.in('color', colors);
      }
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
      console.error('Supabase query error:', error);
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
    console.error('Error details:', {
      message: error.message,
      code: error.code,
      details: error.details,
      hint: error.hint,
    });
    return NextResponse.json(
      {
        error: {
          message: error.message || 'Failed to fetch products',
          code: error.code || 'FETCH_ERROR',
          details: error.details || null,
          hint: error.hint || null,
        },
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = createServerClient();
    const body = await request.json();

    const {
      name,
      brand,
      description,
      original_price,
      sale_price,
      discount_percentage,
      category,
      gender,
      designer,
      color,
      size,
      stock_status,
      is_new_arrival,
      is_featured,
      is_on_sale,
      images,
    } = body;

    // Validation
    if (!name || !brand) {
      return NextResponse.json(
        {
          error: {
            message: 'Name and brand are required',
            code: 'VALIDATION_ERROR',
          },
        },
        { status: 400 }
      );
    }

    // Generate slug from product name
    const generateSlug = (text: string): string => {
      return text
        .toLowerCase()
        .trim()
        .replace(/[^\w\s-]/g, '') // Remove special characters
        .replace(/[\s_-]+/g, '-') // Replace spaces, underscores, and multiple hyphens with single hyphen
        .replace(/^-+|-+$/g, ''); // Remove leading/trailing hyphens
    };

    // Generate base slug
    let baseSlug = generateSlug(name.trim());
    if (!baseSlug) {
      // Fallback if slug generation results in empty string
      baseSlug = `product-${Date.now()}`;
    }
    
    // Check if slug already exists and append number if needed
    let slug = baseSlug;
    let counter = 1;
    while (true) {
      const { data: existing } = await supabase
        .from('products')
        .select('id')
        .eq('slug', slug)
        .maybeSingle();
      
      if (!existing) {
        break; // Slug is unique
      }
      
      slug = `${baseSlug}-${counter}`;
      counter++;
      
      // Safety check to prevent infinite loop
      if (counter > 1000) {
        slug = `${baseSlug}-${Date.now()}`;
        break;
      }
    }

    // Prepare insert data
    // Ensure original_price is set - use sale_price if not provided
    const finalOriginalPrice = original_price !== undefined && original_price !== null 
      ? original_price 
      : (sale_price || 0);
    
    const insertData: any = {
      name: name.trim(),
      brand: brand.trim(),
      slug: slug,
      sale_price: sale_price || 0,
      original_price: finalOriginalPrice, // Always set original_price
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    if (description !== undefined) insertData.description = description;
    if (discount_percentage !== undefined) insertData.discount_percentage = discount_percentage;
    if (category !== undefined) {
      insertData.category = category;
      // If category is "new-arrival", automatically set is_new_arrival to true
      if (category === "new-arrival") {
        insertData.is_new_arrival = true;
      }
    }
    if (gender !== undefined) insertData.gender = gender;
    if (designer !== undefined) insertData.designer = designer;
    if (color !== undefined) insertData.color = color;
    if (size !== undefined) insertData.size = size;
    if (stock_status !== undefined) insertData.stock_status = stock_status;
    // Only set is_new_arrival if it's explicitly provided and category is not "new-arrival"
    if (is_new_arrival !== undefined && category !== "new-arrival") {
      insertData.is_new_arrival = is_new_arrival;
    }
    if (is_featured !== undefined) insertData.is_featured = is_featured;
    if (is_on_sale !== undefined) insertData.is_on_sale = is_on_sale;

    // Handle images - ensure it's an array
    if (images !== undefined) {
      if (Array.isArray(images)) {
        insertData.images = images;
      } else if (typeof images === 'string') {
        try {
          insertData.images = JSON.parse(images);
        } catch (e) {
          insertData.images = [images];
        }
      } else {
        insertData.images = images ? [images] : [];
      }
    }

    // Calculate discount percentage if original_price > sale_price
    if (finalOriginalPrice > sale_price && sale_price > 0) {
      insertData.discount_percentage = Math.round(
        ((finalOriginalPrice - sale_price) / finalOriginalPrice) * 100
      );
      insertData.is_on_sale = true;
    } else {
      // If no discount, set discount_percentage to 0 or null
      insertData.discount_percentage = 0;
      insertData.is_on_sale = false;
    }

    const { data, error } = await supabase
      .from('products')
      .insert(insertData)
      .select()
      .single();

    if (error) {
      console.error('Error creating product:', error);
      throw error;
    }

    return NextResponse.json(data, { status: 201 });
  } catch (error: any) {
    console.error('Error creating product:', error);
    return NextResponse.json(
      {
        error: {
          message: error.message || 'Failed to create product',
          code: 'CREATE_ERROR',
        },
      },
      { status: 500 }
    );
  }
}

