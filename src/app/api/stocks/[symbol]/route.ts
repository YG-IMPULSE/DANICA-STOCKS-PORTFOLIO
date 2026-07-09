import { NextResponse, type NextRequest } from 'next/server'

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ symbol: string }> }
) {
  const { symbol } = await params
  const apiKey = process.env.FINNHUB_API_KEY

  if (!apiKey) {
    return NextResponse.json(
      { error: 'Stock API key not configured' },
      { status: 500 }
    )
  }

  const upper = symbol.toUpperCase()

  try {
    const [quoteRes, profileRes] = await Promise.all([
      fetch(
        `https://finnhub.io/api/v1/quote?symbol=${upper}&token=${apiKey}`
      ),
      fetch(
        `https://finnhub.io/api/v1/stock/profile2?symbol=${upper}&token=${apiKey}`
      ),
    ])

    if (!quoteRes.ok || !profileRes.ok) {
      return NextResponse.json(
        { error: 'Failed to fetch from Finnhub' },
        { status: 502 }
      )
    }

    const quote = await quoteRes.json()
    const profile = await profileRes.json()

    if (!quote.c || quote.c === 0) {
      return NextResponse.json(
        { error: 'Symbol not found or market closed' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      symbol: upper,
      name: profile.name || upper,
      currentPrice: quote.c ?? 0,
      change: quote.d ?? 0,
      changePercent: quote.dp ?? 0,
      high: quote.h ?? 0,
      low: quote.l ?? 0,
    })
  } catch {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
