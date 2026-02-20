import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { verifyToken } from './src/lib/auth'

const publicRoutes = ['/', '/services', '/blog', '/contact', '/login', '/register', '/pricing', '/prendre-rdv']
const adminRoutes = ['/admin']
const consultantRoutes = ['/consultant']
const clientRoutes = ['/client']

export function middleware(request: NextRequest) {
  const token = request.cookies.get('auth_token')?.value
  const { pathname } = request.nextUrl

  // Check if route is public
  if (publicRoutes.includes(pathname) || publicRoutes.some(route => pathname.startsWith(route))) {
    return NextResponse.next()
  }

  // No token - redirect to login
  if (!token) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  // Verify token
  const payload = verifyToken(token)
  if (!payload) {
    const response = NextResponse.redirect(new URL('/login', request.url))
    response.cookies.delete('auth_token')
    return response
  }

  // Check admin routes - only ADMIN allowed
  if (adminRoutes.some(route => pathname.startsWith(route))) {
    if (payload.role !== 'ADMIN') {
      return NextResponse.redirect(new URL('/', request.url))
    }
  }

  // Check consultant routes - CONSULTANT or ADMIN allowed
  if (consultantRoutes.some(route => pathname.startsWith(route))) {
    if (payload.role !== 'CONSULTANT' && payload.role !== 'ADMIN') {
      return NextResponse.redirect(new URL('/', request.url))
    }
  }

  // Check client routes - CLIENT or ADMIN allowed
  if (clientRoutes.some(route => pathname.startsWith(route))) {
    if (payload.role !== 'CLIENT' && payload.role !== 'ADMIN') {
      return NextResponse.redirect(new URL('/', request.url))
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)']
}
