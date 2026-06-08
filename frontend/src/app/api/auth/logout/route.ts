import { NextRequest, NextResponse } from 'next/server'
import { clearAuthCookies } from '@/lib/cookie-utils'

const SPRING_BOOT_URL = process.env.SPRING_BOOT_URL || 'http://localhost:8080'

export async function POST(request: NextRequest) {
  const refreshToken = request.cookies.get('refresh_token')?.value

  if (refreshToken) {
    // Notify backend — best effort, don't block the response
    await fetch(`${SPRING_BOOT_URL}/api/auth/logout`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken }),
    }).catch(() => {
      // Ignore network errors — still clear local cookies
    })
  }

  const response = NextResponse.json({ ok: true })
  clearAuthCookies(response)

  return response
}
