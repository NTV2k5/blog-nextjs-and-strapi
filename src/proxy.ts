import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Define route requirements
const ROLE_REQUIREMENTS: Record<string, string[]> = {
  '/dashboard': ['admin', 'manager'],
  '/report': ['admin', 'manager', 'director'],
};

const AUTH_REQUIRED_ROUTES = [
  '/change-password',
  '/saved',
  '/dashboard',
  '/report'
];

const AUTH_PAGES = [
  '/login',
  '/signup',
  '/forgot-password',
  '/reset-password'
];

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Read cookies
  const jwt = request.cookies.get('jwt')?.value;
  const userStr = request.cookies.get('user')?.value;

  let user = null;
  try {
    if (userStr) {
      user = JSON.parse(userStr);
    }
  } catch (e) {
    // Ignore parse error
  }

  const isAuthenticated = !!(jwt && user);
  const userRole = user?.role?.type;

  // 1. Redirect authenticated users away from auth pages (login, signup)
  if (isAuthenticated && AUTH_PAGES.some(route => pathname.startsWith(route))) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  // 2. Check auth requirements
  const requiresAuth = AUTH_REQUIRED_ROUTES.some(route => pathname.startsWith(route));
  if (requiresAuth && !isAuthenticated) {
    // Redirect to login
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // 3. Check role requirements
  // We find the most specific path match
  for (const [route, allowedRoles] of Object.entries(ROLE_REQUIREMENTS)) {
    if (pathname.startsWith(route)) {
      if (!userRole || !allowedRoles.includes(userRole)) {
        // User does not have permission, redirect to home
        return NextResponse.redirect(new URL('/', request.url));
      }
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    // Apply middleware to these specific paths
    '/dashboard/:path*',
    '/report/:path*',
    '/change-password',
    '/saved',
    '/login',
    '/signup',
    '/forgot-password',
    '/reset-password'
  ],
};
