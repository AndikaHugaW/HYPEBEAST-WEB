import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createServerClient();
    
    const { data, error } = await supabase
      .from('blog_posts')
      .select('*')
      .eq('id', params.id)
      .single();

    if (error) {
      console.error('Supabase error fetching blog post:', error);
      throw error;
    }

    if (!data) {
      return NextResponse.json(
        {
          error: {
            message: 'Blog post not found',
            code: 'NOT_FOUND',
          },
        },
        { status: 404 }
      );
    }

    // Map image_url to image for frontend compatibility
    const mappedData = {
      ...data,
      image: data.image_url || data.image || '',
    };

    return NextResponse.json(mappedData);
  } catch (error: any) {
    console.error('Error fetching blog post:', error);
    return NextResponse.json(
      {
        error: {
          message: error.message || 'Failed to fetch blog post',
          code: error.code || 'FETCH_ERROR',
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

    const updateData: any = {
      headline: headline.trim(),
      subheadline: subheadline?.trim() || '',
      category: category.trim(),
      author: author?.trim() || 'Admin',
      date: date || new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      image_url: image.trim(), // Use image_url for database column
      content: content?.trim() || '',
      updated_at: new Date().toISOString(),
    };

    if (slug) updateData.slug = slug;
    if (likes !== undefined) updateData.likes = likes;
    if (comments !== undefined) updateData.comments = comments;

    const { data, error } = await supabase
      .from('blog_posts')
      .update(updateData)
      .eq('id', params.id)
      .select()
      .single();

    if (error) {
      console.error('Error updating blog post:', error);
      throw error;
    }

    // Map image_url to image for frontend compatibility
    const mappedData = {
      ...data,
      image: data.image_url || data.image || '',
    };

    return NextResponse.json(mappedData);
  } catch (error: any) {
    console.error('Error updating blog post:', error);
    return NextResponse.json(
      {
        error: {
          message: error.message || 'Failed to update blog post',
          code: error.code || 'UPDATE_ERROR',
        },
      },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createServerClient();

    const { error } = await supabase
      .from('blog_posts')
      .delete()
      .eq('id', params.id);

    if (error) {
      console.error('Error deleting blog post:', error);
      throw error;
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error deleting blog post:', error);
    return NextResponse.json(
      {
        error: {
          message: error.message || 'Failed to delete blog post',
          code: error.code || 'DELETE_ERROR',
        },
      },
      { status: 500 }
    );
  }
}

