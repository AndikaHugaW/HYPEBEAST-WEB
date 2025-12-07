import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  try {
    const supabase = createServerClient();
    
    const { data, error } = await supabase
      .from('blog_posts')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Supabase error fetching blog posts:', error);
      throw error;
    }

    // Map image_url to image for frontend compatibility
    const mappedData = (data || []).map((post: any) => ({
      ...post,
      image: post.image_url || post.image || '',
    }));

    return NextResponse.json({
      data: mappedData,
    });
  } catch (error: any) {
    console.error('Error fetching blog posts:', error);
    return NextResponse.json(
      {
        error: {
          message: error.message || 'Failed to fetch blog posts',
          code: error.code || 'FETCH_ERROR',
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
      headline,
      subheadline,
      category,
      author,
      date,
      image,
      content,
      slug,
      likes,
      comments,
    } = body;

    // Validation
    if (!headline || !category || !image) {
      return NextResponse.json(
        {
          error: {
            message: 'Headline, category, and image are required',
            code: 'VALIDATION_ERROR',
          },
        },
        { status: 400 }
      );
    }

    // Generate slug if not provided
    let finalSlug = slug;
    if (!finalSlug) {
      finalSlug = headline
        .toLowerCase()
        .trim()
        .replace(/[^\w\s-]/g, '')
        .replace(/[\s_-]+/g, '-')
        .replace(/^-+|-+$/g, '');
    }

    // Check if slug already exists
    let uniqueSlug = finalSlug;
    let counter = 1;
    while (true) {
      const { data: existing } = await supabase
        .from('blog_posts')
        .select('id')
        .eq('slug', uniqueSlug)
        .single();
      
      if (!existing) {
        break;
      }
      uniqueSlug = `${finalSlug}-${counter}`;
      counter++;
      if (counter > 1000) {
        uniqueSlug = `${finalSlug}-${Date.now()}`;
        break;
      }
    }

    const insertData: any = {
      headline: headline.trim(),
      subheadline: subheadline?.trim() || '',
      category: category.trim(),
      author: author?.trim() || 'Admin',
      date: date || new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      image_url: image.trim(), // Use image_url for database column
      content: content?.trim() || '',
      slug: uniqueSlug,
      likes: likes || 0,
      comments: comments || 0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const { data, error } = await supabase
      .from('blog_posts')
      .insert(insertData)
      .select()
      .single();

    if (error) {
      console.error('Error creating blog post:', error);
      throw error;
    }

    // Map image_url to image for frontend compatibility
    const mappedData = {
      ...data,
      image: data.image_url || data.image || '',
    };

    return NextResponse.json(mappedData, { status: 201 });
  } catch (error: any) {
    console.error('Error creating blog post:', error);
    return NextResponse.json(
      {
        error: {
          message: error.message || 'Failed to create blog post',
          code: error.code || 'CREATE_ERROR',
        },
      },
      { status: 500 }
    );
  }
}

