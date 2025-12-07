import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase';

// Disable caching for real-time updates
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function PUT(request: NextRequest) {
  try {
    const supabase = createServerClient();

    // Get user from session
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: { message: 'Unauthorized' } },
        { status: 401 }
      );
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user) {
      return NextResponse.json(
        { error: { message: 'Unauthorized' } },
        { status: 401 }
      );
    }

    // Mark all notifications as read
    const { data, error } = await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('user_id', user.id)
      .eq('is_read', false)
      .select();

    if (error) {
      console.error('Supabase error updating notifications:', error);
      throw error;
    }

    return NextResponse.json({ data, count: data?.length || 0 });
  } catch (error: any) {
    console.error('Error updating notifications:', error);
    return NextResponse.json(
      {
        error: {
          message: error.message || 'Failed to update notifications',
          code: error.code || 'UPDATE_ERROR',
        },
      },
      { status: 500 }
    );
  }
}

