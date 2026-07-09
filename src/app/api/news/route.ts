import { NextResponse } from 'next/server'

const CATEGORIES = ['general', 'forex', 'crypto', 'merger'] as const

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

    return NextResponse.json(unique.slice(0, 50))
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
