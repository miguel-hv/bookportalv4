import { NextRequest, NextResponse } from 'next/server'
import { setAuthCookies, clearAuthCookies } from '@/lib/cookie-utils'

const SPRING_BOOT_URL = process.env.SPRING_BOOT_URL || 'http://localhost:8080'

async function fetchUser(accessToken: string): Promise<{ id: number; name: string } | null> {
  const res = await fetch(`${SPRING_BOOT_URL}/api/auth/me`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  })

  if (!res.ok) return null

  const data = await res.json()
  return { id: data.id, name: data.name }
}

async function tryRefresh(
  refreshToken: string,
): Promise<{ accessToken: string; refreshToken: string; expiresIn: number } | null> {
  const res = await fetch(`${SPRING_BOOT_URL}/api/auth/refresh`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ refreshToken }),
  })

  if (!res.ok) return null

  return res.json()
}

export async function GET(request: NextRequest) {
  const accessToken = request.cookies.get('access_token')?.value

  if (!accessToken) {
    return NextResponse.json({ user: null })
  }

  // Try current access token
  const user = await fetchUser(accessToken)
  if (user) {
    return NextResponse.json({ user })
  }

  // Token expired — try refresh
  const refreshToken = request.cookies.get('refresh_token')?.value
  if (!refreshToken) {
    return NextResponse.json({ user: null })
  }

  const tokens = await tryRefresh(refreshToken)
  if (!tokens) {
    // Refresh failed — clear cookies, user is logged out
    const response = NextResponse.json({ user: null })
    clearAuthCookies(response)
    return response
  }

  // Refresh succeeded — retry with new access token
  const retriedUser = await fetchUser(tokens.accessToken)
  const response = NextResponse.json({ user: retriedUser })
  setAuthCookies(response, tokens)

  return response
}
