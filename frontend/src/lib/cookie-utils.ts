import { NextResponse } from 'next/server'

const SEVEN_DAYS = 7 * 24 * 60 * 60

interface SetCookieParams {
  accessToken: string
  refreshToken: string
  expiresIn: number
}

export function setAuthCookies(
  response: NextResponse,
  data: SetCookieParams,
): void {
  response.cookies.set('access_token', data.accessToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: data.expiresIn,
  })

  response.cookies.set('refresh_token', data.refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/api/auth',
    maxAge: SEVEN_DAYS,
  })
}

export function clearAuthCookies(response: NextResponse): void {
  response.cookies.set('access_token', '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 0,
  })

  response.cookies.set('refresh_token', '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/api/auth',
    maxAge: 0,
  })
}
