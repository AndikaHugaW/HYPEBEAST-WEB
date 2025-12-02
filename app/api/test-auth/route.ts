import { createServerClient } from '@/lib/supabase';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Check environment variables
    const hasUrl = !!process.env.NEXT_PUBLIC_SUPABASE_URL;
    const hasKey = !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!hasUrl || !hasKey) {
      return NextResponse.json({ 
        success: false, 
        error: 'Missing Supabase environment variables',
        details: {
          hasUrl,
          hasKey,
        },
        solution: 'Create .env.local file with NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY'
      }, { status: 500 });
    }

    const supabase = createServerClient();
    
    // Test connection by checking auth
    const { data: authData, error: authError } = await supabase.auth.getSession();
    
    // Test database connection
    const { data: dbData, error: dbError } = await supabase
      .from('profiles')
      .select('count')
      .limit(1);
    
    return NextResponse.json({ 
      success: true,
      message: 'Supabase connection successful',
      environment: {
        url: hasUrl ? 'Set' : 'Missing',
        key: hasKey ? 'Set' : 'Missing',
        urlValue: process.env.NEXT_PUBLIC_SUPABASE_URL?.substring(0, 20) + '...' || 'Not set'
      },
      auth: {
        connected: !authError,
        error: authError?.message || null
      },
      database: {
        connected: !dbError,
        error: dbError?.message || null,
        hint: dbError ? 'Check your RLS policies and table existence' : 'Database accessible'
      }
    });
  } catch (error: any) {
    return NextResponse.json({ 
      success: false, 
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    }, { status: 500 });
  }
}

