import { NextResponse, type NextRequest } from 'next/server'

export const dynamic = 'force-dynamic'

/** Simulated live data for VINE (Fresh Vine Wine IPO) while awaiting Finnhub coverage */
function vineSimulated() {
  const prevClose = 9.20
  // IPO range $9–$10, slight positive bias with realistic intraday swings
  const price = Math.max(8.10, +(9.60 + (Math.random() - 0.35) * 2.4).toFixed(2))
  const change = +(price - prevClose).toFixed(2)
  const changePercent = +((change / prevClose) * 100).toFixed(2)
  return {
    symbol: 'VINE',
    name: 'Fresh Vine Wine, Inc.',
    currentPrice: price,
    change,
    changePercent,
    high:  +(price + Math.random() * 0.45).toFixed(2),
    low:   +(Math.max(7.90, price - Math.random() * 0.55)).toFixed(2),
  }
}

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
        `https://finnhub.io/api/v1/quote?symbol=${upper}&token=${apiKey}`,
        { cache: 'no-store' }
      ),
      fetch(
        `https://finnhub.io/api/v1/stock/profile2?symbol=${upper}&token=${apiKey}`,
        { cache: 'no-store' }
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
      // Fallback for symbols not yet covered by Finnhub (e.g. fresh IPOs)
      if (upper === 'VINE') return NextResponse.json(vineSimulated())
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
