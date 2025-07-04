import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const token = request.cookies.get('firebaseIdToken')?.value
  const { pathname } = request.nextUrl

  // take to welcome page if user not found
  if (!token && pathname.startsWith('/dashboard')) {
    // If no token, redirect to the homepage
    return NextResponse.redirect(new URL('/', request.url))
  }

  // take to dashboard if user found
  // if (token && request.nextUrl.pathname === '/') {
  //     return NextResponse.redirect(new URL('/home', request.url))
  // }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
}

// HELLO FROM macOS