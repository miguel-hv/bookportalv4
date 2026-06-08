import { NextRequest, NextResponse } from 'next/server'
import type { LoginInput, AuthError } from '@/lib/auth-types'
import { setAuthCookies } from '@/lib/cookie-utils'

const SPRING_BOOT_URL = process.env.SPRING_BOOT_URL || 'http://localhost:8080'

export async function POST(request: NextRequest) {
  const body: LoginInput = await request.json()

  const springResponse = await fetch(
    `${SPRING_BOOT_URL}/api/auth/login`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    },
  )

  if (!springResponse.ok) {
    const error: AuthError = await springResponse.json()
    return NextResponse.json(error, { status: springResponse.status })
  }

  const data = await springResponse.json()
  const response = NextResponse.json({ user: data.user })
  setAuthCookies(response, data)

  return response
}
