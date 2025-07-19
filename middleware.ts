import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { isExcludedIP } from './lib/analytics'

export function middleware(request: NextRequest) {
  const response = NextResponse.next()
  
  // IP除外判定の結果をヘッダーに追加
  const excluded = isExcludedIP(request)
  response.headers.set('x-analytics-excluded', excluded.toString())
  
  return response
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
}