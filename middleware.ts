import {NextResponse} from 'next/server'
import type {NextRequest} from 'next/server'

export function middleware(request: NextRequest) {
  const token = request.cookies.get('linear_access_token')
  const isAuthPage = request.nextUrl.pathname === '/login'
  const isPublicPage = [
    '/',
    '/login',
    '/homepage',
    // Add other public routes here
  ].includes(request.nextUrl.pathname)

  // If user is not authenticated and trying to access protected route
  if (!token && !isPublicPage) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  // If user is authenticated and trying to access login page
  if (token && isAuthPage) {
    return NextResponse.redirect(new URL('/', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!api|_next/static|_next/image|favicon.ico|public).*)',
  ],
} 