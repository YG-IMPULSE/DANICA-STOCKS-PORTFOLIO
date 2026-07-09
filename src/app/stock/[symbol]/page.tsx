'use client'

export const dynamic = 'force-dynamic'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import styles from './page.module.css'

interface DetailData {
  symbol: string
  name: string
  exchange: string
  currency: string
  industry: string
  website: string
  marketCap: number | null
  currentPrice: number
  change: number
  changePercent: number
  open: number
  high: number
  low: number
  prevClose: number
  weekHigh52: number | null
  weekLow52: number | null
  peRatio: number | null
  eps: number | null
  recommendation: {
    buy: number
    hold: number
    sell: number
    period: string
  } | null
}

const ICON_COLORS = ['#f97316', '#8b5cf6', '#0ea5e9', '#10b981', '#ef4444', '#f59e0b']
function iconColor(s: string) {
  return ICON_COLORS[s.charCodeAt(0) % ICON_COLORS.length]
}

function fmt(n: number | null | undefined) {
  if (n === null || n === undefined) return '—'
  return n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

function fmtMktCap(mc: number | null) {
  if (!mc) return '—'
  if (mc >= 1_000_000) return `$${(mc / 1_000_000).toFixed(2)}T`
  if (mc >= 1_000) return `$${(mc / 1_000).toFixed(2)}B`
  return `$${mc.toFixed(0)}M`
}

const BackIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
    <path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2Z" />
  </svg>
)

export default function StockDetailPage() {
  const router = useRouter()
  const { symbol } = useParams<{ symbol: string }>()
  const [data, setData] = useState<DetailData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!symbol) return
    fetch(`/api/stock-detail/${symbol}`)
      .then((r) => r.json())
      .then((d) => {
        if (d.error) setError(d.error)
        else setData(d as DetailData)
      })
      .catch(() => setError('Failed to load data'))
      .finally(() => setLoading(false))
  }, [symbol])

  if (loading) {
    return (
      <div className={styles.page}>
        <header className={styles.header}>
          <button className={styles.backBtn} onClick={() => router.back()}>
            <BackIcon />
          </button>
        </header>
        <div className={styles.skeletonHero} />
        <div className={styles.skeletonPrice} />
        <div className={styles.skeletonGrid} />
      </div>
    )
  }

  if (error || !data) {
    return (
      <div className={styles.page}>
        <header className={styles.header}>
          <button className={styles.backBtn} onClick={() => router.back()}>
            <BackIcon />
          </button>
        </header>
        <div className={styles.errorState}>
          <p>Could not load {symbol?.toUpperCase()}</p>
          <button onClick={() => router.back()}>Go back</button>
        </div>
      </div>
    )
  }

  const up = data.changePercent >= 0
  const color = iconColor(data.symbol)

  const totalRec =
    (data.recommendation?.buy ?? 0) +
    (data.recommendation?.hold ?? 0) +
    (data.recommendation?.sell ?? 0)
  const buyPct  = totalRec > 0 ? (data.recommendation!.buy  / totalRec) * 100 : 0
  const holdPct = totalRec > 0 ? (data.recommendation!.hold / totalRec) * 100 : 0
  const sellPct = totalRec > 0 ? (data.recommendation!.sell / totalRec) * 100 : 0

  const stats = [
    { label: 'Open',       val: `$${fmt(data.open)}`      },
    { label: 'High',       val: `$${fmt(data.high)}`      },
    { label: 'Low',        val: `$${fmt(data.low)}`       },
    { label: 'Prev Close', val: `$${fmt(data.prevClose)}` },
    { label: '52W High',   val: data.weekHigh52 ? `$${fmt(data.weekHigh52)}` : '—' },
    { label: '52W Low',    val: data.weekLow52  ? `$${fmt(data.weekLow52)}`  : '—' },
    { label: 'Market Cap', val: fmtMktCap(data.marketCap)                         },
    { label: 'P/E Ratio',  val: data.peRatio ? data.peRatio.toFixed(2)   : '—'   },
    { label: 'EPS (TTM)',  val: data.eps      ? `$${data.eps.toFixed(2)}` : '—'   },
  ]

  return (
    <div className={styles.page}>
      {/* Header */}
      <header className={styles.header}>
        <button className={styles.backBtn} onClick={() => router.back()}>
          <BackIcon />
        </button>
        <span className={styles.headerSymbol}>{data.symbol}</span>
      </header>

      {/* Hero */}
      <div className={styles.hero}>
        <div className={styles.heroIcon} style={{ background: color + '20', color }}>
          {data.symbol[0]}
        </div>
        <div>
          <h1 className={styles.heroSymbol}>{data.symbol}</h1>
          <p className={styles.heroName}>{data.name}</p>
          {data.exchange && (
            <p className={styles.heroMeta}>
              {data.exchange}{data.currency ? ` · ${data.currency}` : ''}
            </p>
          )}
        </div>
      </div>

      {/* Price */}
      <div className={styles.priceBlock}>
        <p className={styles.price}>${fmt(data.currentPrice)}</p>
        <div className={styles.priceRow}>
          <span className={up ? styles.changeUp : styles.changeDown}>
            {up ? '▲' : '▼'}{' '}
            {up && data.change > 0 ? '+' : ''}
            {fmt(data.change)} ({up && data.changePercent > 0 ? '+' : ''}
            {data.changePercent.toFixed(2)}%)
          </span>
          <span className={styles.today}>today</span>
        </div>
      </div>

      {/* Key Stats */}
      <div className={styles.statsSection}>
        <h2 className={styles.sectionTitle}>Key Stats</h2>
        <div className={styles.statsGrid}>
          {stats.map(({ label, val }) => (
            <div key={label} className={styles.statBox}>
              <span className={styles.statLabel}>{label}</span>
              <span className={styles.statVal}>{val}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Analyst Ratings */}
      {data.recommendation && totalRec > 0 && (
        <div className={styles.section}>
          <h2 className={styles.sectionTitle}>Analyst Ratings</h2>
          {data.recommendation.period && (
            <p className={styles.recPeriod}>as of {data.recommendation.period}</p>
          )}
          <div className={styles.ratingBar}>
            <div className={styles.buyBar}  style={{ width: `${buyPct}%`  }} />
            <div className={styles.holdBar} style={{ width: `${holdPct}%` }} />
            <div className={styles.sellBar} style={{ width: `${sellPct}%` }} />
          </div>
          <div className={styles.ratingLabels}>
            <span className={styles.buyLbl}>▲ Buy {data.recommendation.buy}</span>
            <span className={styles.holdLbl}>◆ Hold {data.recommendation.hold}</span>
            <span className={styles.sellLbl}>▼ Sell {data.recommendation.sell}</span>
          </div>
        </div>
      )}

      {/* About */}
      {(data.industry || data.website || data.exchange) && (
        <div className={styles.section}>
          <h2 className={styles.sectionTitle}>About</h2>
          <div className={styles.aboutGrid}>
            {data.industry && (
              <div className={styles.aboutRow}>
                <span className={styles.aboutLabel}>Industry</span>
                <span className={styles.aboutVal}>{data.industry}</span>
              </div>
            )}
            {data.exchange && (
              <div className={styles.aboutRow}>
                <span className={styles.aboutLabel}>Exchange</span>
                <span className={styles.aboutVal}>{data.exchange}</span>
              </div>
            )}
            {data.website && (
              <div className={styles.aboutRow}>
                <span className={styles.aboutLabel}>Website</span>
                <a
                  href={data.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={styles.aboutLink}
                >
                  {data.website.replace(/^https?:\/\//, '').replace(/\/$/, '')}
                </a>
              </div>
            )}
          </div>
        </div>
      )}

      <div className={styles.spacer} />
    </div>
  )
}
