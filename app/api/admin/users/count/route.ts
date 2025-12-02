import { NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase';

export async function GET() {
  try {
    const supabase = createServerClient();

    const { count, error } = await supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true });

    if (error) {
      throw error;
    }

    return NextResponse.json({ count: count || 0 });
  } catch (error: any) {
    console.error('Error fetching users count:', error);
    return NextResponse.json(
      {
        error: {
          message: error.message || 'Failed to fetch users count',
          code: 'FETCH_ERROR',
        },
      },
      { status: 500 }
    );
  }
}

