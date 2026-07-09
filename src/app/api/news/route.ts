import { NextResponse } from 'next/server'

const CATEGORIES = ['general', 'forex', 'crypto', 'merger'] as const

// Pinned announcement — Fresh Vine Wine / VINE IPO
const PINNED_NEWS = [
  {
    id: 9000001,
    headline: 'Fresh Vine Wine (VINE) Prices IPO at $9–$10 Per Share on NYSE American',
    summary:
      'Somnium Wine, operating as Fresh Vine Wine, Inc., has launched its initial public offering of 2,200,000 shares of common stock priced between $9.00 and $10.00 per share. The company is selling all shares offered under this prospectus and has applied to list its common stock on the NYSE American under the ticker symbol "VINE". Prior to this offering, there has been no public market for the company\'s common stock. Fresh Vine Wine is a lifestyle wine brand targeting health-conscious consumers with low-calorie, low-carbohydrate premium wines.',
    source: 'PrivateOptions Research',
    url: 'https://www.nyse.com/quote/XASE:VINE',
    image: '',
    datetime: 1752019200,
    category: 'general',
  },
]

export async function GET() {
  const apiKey = process.env.FINNHUB_API_KEY
  if (!apiKey) {
    return NextResponse.json({ error: 'API key not configured' }, { status: 500 })
  }

  try {
    const results = await Promise.allSettled(
      CATEGORIES.map((cat) =>
        fetch(
          `https://finnhub.io/api/v1/news?category=${cat}&token=${apiKey}`,
          { next: { revalidate: 180 } }
        )
          .then((r) => (r.ok ? r.json() : []))
          .then((items: Record<string, unknown>[]) =>
            items.map((item) => ({ ...item, category: cat }))
          )
      )
    )

    const allNews: Record<string, unknown>[] = results
      .filter((r) => r.status === 'fulfilled')
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .flatMap((r) => (r as any).value as Record<string, unknown>[])

    // Deduplicate by url
    const seen = new Set<string>()
    const unique = allNews.filter((item) => {
      const url = item.url as string
      if (!url || seen.has(url)) return false
      seen.add(url)
      return true
    })

    // Sort newest first
    unique.sort((a, b) => ((b.datetime as number) ?? 0) - ((a.datetime as number) ?? 0))

    return NextResponse.json([...PINNED_NEWS, ...unique.slice(0, 50)])
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
