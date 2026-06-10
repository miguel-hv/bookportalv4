import { NextRequest, NextResponse } from 'next/server'

const SPRING_BOOT_URL = process.env.SPRING_BOOT_URL || 'http://localhost:8080'

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const springUrl = `${SPRING_BOOT_URL}/api/reviews?${searchParams}`

  const response = await fetch(springUrl)

  if (!response.ok) {
    const error = await response.json()
    return NextResponse.json(error, { status: response.status })
  }

  const data = await response.json()
  return NextResponse.json(data, { status: 200 })
}

export async function POST(request: NextRequest) {
  const body = await request.json()
  const accessToken = request.cookies.get('access_token')?.value

  const springResponse = await fetch(`${SPRING_BOOT_URL}/api/reviews`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
    },
    body: JSON.stringify(body),
  })

  const data = await springResponse.json()
  return NextResponse.json(data, { status: springResponse.status })
}
