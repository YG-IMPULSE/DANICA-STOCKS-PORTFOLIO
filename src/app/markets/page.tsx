'use client'

import { useEffect, useState } from 'react'
import BottomNav from '@/components/BottomNav'
import styles from './page.module.css'
import type { StockData } from '@/lib/types'

const INDICES = [
  { symbol: 'SPY', label: 'S&P 500'   },
  { symbol: 'QQQ', label: 'NASDAQ'    },
  { symbol: 'DIA', label: 'DOW JONES' },
  { symbol: 'IWM', label: 'RUSSELL'   },
  { symbol: 'GLD', label: 'GOLD'      },
  { symbol: 'TLT', label: 'BONDS'     },
]

const TRENDING_SYMBOLS = ['AAPL', 'MSFT', 'NVDA', 'TSLA', 'GOOGL', 'AMZN', 'META', 'NFLX']

interface Ticker extends Partial<StockData> {
  symbol: string
  isLoading: boolean
}

function fmt(n: number | undefined) {
  if (n === undefined || n === 0) return '—'
  return n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

export default function MarketsPage() {
  const [indices,  setIndices]  = useState<Ticker[]>(INDICES.map((i) => ({ symbol: i.symbol, isLoading: true })))
  const [trending, setTrending] = useState<Ticker[]>(TRENDING_SYMBOLS.map((s) => ({ symbol: s, isLoading: true })))

  useEffect(() => {
    INDICES.forEach(({ symbol }, i) => {
      fetch(`/api/stocks/${symbol}`)
        .then((r) => r.json())
        .then((data) => setIndices((p) => { const n = [...p]; n[i] = { ...data, symbol, isLoading: false }; return n }))
        .catch(() => setIndices((p) => { const n = [...p]; n[i] = { symbol, isLoading: false }; return n }))
    })

    TRENDING_SYMBOLS.forEach((symbol, i) => {
      fetch(`/api/stocks/${symbol}`)
        .then((r) => r.json())
        .then((data) => setTrending((p) => { const n = [...p]; n[i] = { ...data, symbol, isLoading: false }; return n }))
        .catch(() => setTrending((p) => { const n = [...p]; n[i] = { symbol, isLoading: false }; return n }))
    })
  }, [])

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <h1 className={styles.title}>Markets</h1>
      </header>

      {/* Indices */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Indices</h2>
        <div className={styles.indicesGrid}>
          {INDICES.map(({ symbol, label }, i) => {
            const d   = indices[i]
            const pct = d.changePercent ?? 0
            const up  = pct >= 0
            return (
              <div key={symbol} className={styles.indexCard}>
                <p className={styles.indexLabel}>{label}</p>
                {d.isLoading ? (
                  <div className={styles.miniSkeleton} />
                ) : (
                  <>
                    <p className={styles.indexPrice}>${fmt(d.currentPrice)}</p>
                    <p className={`${styles.indexChange} ${up ? styles.green : styles.red}`}>
                      {up ? '▲' : '▼'} {Math.abs(pct).toFixed(2)}%
                    </p>
                  </>
                )}
              </div>
            )
          })}
        </div>
      </section>

      {/* Trending */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Trending</h2>
        <div className={styles.tickerList}>
          {TRENDING_SYMBOLS.map((symbol, i) => {
            const d   = trending[i]
            const pct = d.changePercent ?? 0
            const up  = pct >= 0
            return (
              <div key={symbol} className={styles.tickerRow}>
                <div className={styles.tickerLeft}>
                  <div className={styles.tickerIcon}>{symbol[0]}</div>
                  <div>
                    <p className={styles.tickerSymbol}>{symbol}</p>
                    {!d.isLoading && d.name && (
                      <p className={styles.tickerName}>{d.name}</p>
                    )}
                  </div>
                </div>
                <div className={styles.tickerRight}>
                  {d.isLoading ? (
                    <div className={styles.rowSkeleton} />
                  ) : (
                    <>
                      <p className={styles.tickerPrice}>${fmt(d.currentPrice)}</p>
                      <p className={`${styles.tickerChange} ${up ? styles.green : styles.red}`}>
                        {up ? '+' : ''}{pct.toFixed(2)}%
                      </p>
                    </>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </section>

      <div className={styles.spacer} />
      <BottomNav active="markets" />
    </div>
  )
}
