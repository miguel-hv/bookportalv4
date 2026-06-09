import { NextRequest, NextResponse } from 'next/server'

const SPRING_BOOT_URL = process.env.SPRING_BOOT_URL || 'http://localhost:8080'

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const springUrl = `${SPRING_BOOT_URL}/api/users?${searchParams}`

  const response = await fetch(springUrl)

  if (!response.ok) {
    const error = await response.json()
    return NextResponse.json(error, { status: response.status })
  }

  const data = await response.json()
  return NextResponse.json(data, { status: 200 })
}
