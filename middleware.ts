import { NextResponse } from 'next/server'

// Authentication middleware disabled - app works in local mode without login
export function middleware() {
  return NextResponse.next()
}

export const config = {
  matcher: [],
}
