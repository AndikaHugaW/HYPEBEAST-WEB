import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase';

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createServerClient();
    const { id } = params;
    const body = await request.json();

    const { role } = body;

    if (!role || !['user', 'admin'].includes(role)) {
      return NextResponse.json(
        {
          error: {
            message: 'Invalid role. Must be "user" or "admin"',
            code: 'INVALID_ROLE',
          },
        },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from('profiles')
      .update({ role })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw error;
    }

    return NextResponse.json(data);
  } catch (error: any) {
    console.error('Error updating user role:', error);
    return NextResponse.json(
      {
        error: {
          message: error.message || 'Failed to update user role',
          code: 'UPDATE_ERROR',
        },
      },
      { status: 500 }
    );
  }
}

