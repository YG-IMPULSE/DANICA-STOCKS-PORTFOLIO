import { NextResponse, type NextRequest } from 'next/server'

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ symbol: string }> }
) {
  const { symbol } = await params
  const apiKey = process.env.FINNHUB_API_KEY

  if (!apiKey) {
    return NextResponse.json({ error: 'API key not configured' }, { status: 500 })
  }

  const upper = symbol.toUpperCase()

  try {
    const [quoteRes, profileRes, metricsRes, recRes] = await Promise.all([
      fetch(`https://finnhub.io/api/v1/quote?symbol=${upper}&token=${apiKey}`),
      fetch(`https://finnhub.io/api/v1/stock/profile2?symbol=${upper}&token=${apiKey}`),
      fetch(`https://finnhub.io/api/v1/stock/metric?symbol=${upper}&metric=all&token=${apiKey}`),
      fetch(`https://finnhub.io/api/v1/stock/recommendation?symbol=${upper}&token=${apiKey}`),
    ])

    const [quote, profile, metricsData, recData] = await Promise.all([
      quoteRes.json(),
      profileRes.json(),
      metricsRes.json(),
      recRes.json(),
    ])

    if (!quote.c || quote.c === 0) {
      return NextResponse.json({ error: 'Symbol not found or market closed' }, { status: 404 })
    }

    const metrics = metricsData?.metric ?? {}
    const rec = Array.isArray(recData) && recData.length > 0 ? recData[0] : null

    return NextResponse.json({
      symbol: upper,
      name: profile.name || upper,
      exchange: profile.exchange || '',
      currency: profile.currency || 'USD',
      industry: profile.finnhubIndustry || '',
      website: profile.weburl || '',
      marketCap: profile.marketCapitalization ?? null, // in millions
      currentPrice: quote.c ?? 0,
      change: quote.d ?? 0,
      changePercent: quote.dp ?? 0,
      open: quote.o ?? 0,
      high: quote.h ?? 0,
      low: quote.l ?? 0,
      prevClose: quote.pc ?? 0,
      weekHigh52: metrics['52WeekHigh'] ?? null,
      weekLow52: metrics['52WeekLow'] ?? null,
      peRatio: metrics.peAnnual ?? metrics.peTTM ?? null,
      eps: metrics.epsAnnualTTM ?? null,
      recommendation: rec
        ? {
            buy: (rec.buy ?? 0) + (rec.strongBuy ?? 0),
            hold: rec.hold ?? 0,
            sell: (rec.sell ?? 0) + (rec.strongSell ?? 0),
            period: rec.period ?? '',
          }
        : null,
    })
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
