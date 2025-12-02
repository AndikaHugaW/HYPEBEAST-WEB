import { NextResponse, type NextRequest } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Skip middleware for API routes, static files, and auth pages
  if (
    pathname.startsWith('/api') ||
    pathname.startsWith('/_next') ||
    pathname.startsWith('/static') ||
    pathname.includes('.') || // Skip files with extensions
    pathname.startsWith('/sign-in') ||
    pathname.startsWith('/sign-up') ||
    pathname.startsWith('/forgot-password') ||
    pathname.startsWith('/reset-password') ||
    pathname.startsWith('/admin/sign-in') ||
    pathname.startsWith('/admin/sign-up')
  ) {
    return NextResponse.next();
  }

  // Get Supabase environment variables
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    // If env vars not set, allow request to continue
    return NextResponse.next();
  }

  // Create Supabase client with service role key for admin operations
  // This bypasses RLS and allows us to check user role
  const supabase = supabaseServiceKey
    ? createClient(supabaseUrl, supabaseServiceKey, {
        auth: {
          persistSession: false,
          autoRefreshToken: false,
        },
      })
    : createClient(supabaseUrl, supabaseAnonKey, {
        auth: {
          persistSession: false,
          autoRefreshToken: false,
        },
      });

  // Get Authorization header
  const authHeader = request.headers.get('authorization');
  let accessToken = authHeader?.replace('Bearer ', '');

  // Try to get token from cookies (Supabase might store it)
  if (!accessToken) {
    // Check all cookies for potential auth tokens
    const allCookies = request.cookies.getAll();
    for (const cookie of allCookies) {
      if (cookie.name.includes('auth') || cookie.name.includes('token')) {
        try {
          const parsed = JSON.parse(cookie.value);
          accessToken = parsed.access_token || parsed.token || cookie.value;
          break;
        } catch {
          // If not JSON, use value directly
          if (cookie.value.length > 20) {
            accessToken = cookie.value;
            break;
          }
        }
      }
    }
  }

  // Try to get user from session
  let user = null;
  let profile = null;

  if (accessToken) {
    try {
      // Verify token and get user
      const { data: { user: authUser }, error: authError } = await supabase.auth.getUser(accessToken);
      
      if (!authError && authUser) {
        user = authUser;
        
        // Get user profile (using service role key bypasses RLS)
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', authUser.id)
          .single();
        
        if (!profileError && profileData) {
          profile = profileData;
        }
      }
    } catch (error) {
      // If error getting user, continue without auth
      // Don't log in production to avoid noise
      if (process.env.NODE_ENV === 'development') {
        console.error('Middleware auth error:', error);
      }
    }
  }

  const isAdmin = profile?.role === 'admin';
  const isAdminPage = pathname.startsWith('/admin');
  const isUserPage = !isAdminPage && 
    (pathname === '/' || 
     pathname.startsWith('/products') || 
     pathname.startsWith('/service') || 
     pathname.startsWith('/aboutus') ||
     (pathname.startsWith('/profile') && !pathname.startsWith('/admin')) ||
     (pathname.startsWith('/orders') && !pathname.startsWith('/admin')) ||
     (pathname.startsWith('/wishlist') && !pathname.startsWith('/admin')));

  // Case 1: Admin trying to access user pages -> redirect to admin dashboard
  // STRICT: Admin cannot access user pages - they must use admin pages only
  if (isAdmin && isUserPage) {
    return NextResponse.redirect(new URL('/admin/dashboard', request.url));
  }

  // Case 2: Non-admin trying to access admin pages -> redirect to home or sign-in
  // NOTE: Since Supabase stores session in localStorage (client-side), middleware might not detect session
  // So we're more lenient here - let client-side handle the auth check
  if (isAdminPage && !pathname.startsWith('/admin/sign-in') && !pathname.startsWith('/admin/sign-up')) {
    // If we have user info and they're NOT admin, redirect
    if (user && profile && !isAdmin) {
      // User is logged in but not admin -> redirect to home
      return NextResponse.redirect(new URL('/?error=unauthorized', request.url));
    }
    // If no user detected in middleware, let it pass - client-side will handle redirect
    // This is because Supabase session is in localStorage, not cookies
  }

  // Allow request to continue
  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (images, etc.)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|css|js)).*)',
  ],
};
