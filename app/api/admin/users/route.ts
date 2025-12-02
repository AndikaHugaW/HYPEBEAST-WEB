import { NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase';

export async function GET() {
  try {
    const supabase = createServerClient();

    const { data, error } = await supabase
      .from('profiles')
      .select('id, email, full_name, role, created_at')
      .order('created_at', { ascending: false });

    if (error) {
      throw error;
    }

    return NextResponse.json({ data: data || [] });
  } catch (error: any) {
    console.error('Error fetching users:', error);
    return NextResponse.json(
      {
        error: {
          message: error.message || 'Failed to fetch users',
          code: 'FETCH_ERROR',
        },
      },
      { status: 500 }
    );
  }
}

