'use client'

export const dynamic = 'force-dynamic'

import { useEffect, useState, useRef } from 'react'
import BottomNav from '@/components/BottomNav'
import styles from './page.module.css'
import type { StockData } from '@/lib/types'

type Sector = 'indices' | 'tech' | 'finance' | 'health' | 'energy' | 'consumer'

const SECTORS: { id: Sector; label: string }[] = [
  { id: 'indices',  label: 'Indices'  },
  { id: 'tech',     label: 'Tech'     },
  { id: 'finance',  label: 'Finance'  },
  { id: 'health',   label: 'Health'   },
  { id: 'energy',   label: 'Energy'   },
  { id: 'consumer', label: 'Consumer' },
]

const SECTOR_STOCKS: Record<Sector, { symbol: string; label?: string }[]> = {
  indices: [
    { symbol: 'SPY', label: 'S&P 500'      },
    { symbol: 'QQQ', label: 'NASDAQ 100'   },
    { symbol: 'DIA', label: 'Dow Jones'    },
    { symbol: 'IWM', label: 'Russell 2000' },
    { symbol: 'VTI', label: 'Total Market' },
    { symbol: 'GLD', label: 'Gold'         },
    { symbol: 'TLT', label: 'Bonds 20Y'    },
    { symbol: 'SLV', label: 'Silver'       },
    { symbol: 'USO', label: 'Crude Oil'    },
    { symbol: 'XLF', label: 'Financials'   },
    { symbol: 'XLK', label: 'Technology'   },
    { symbol: 'XLV', label: 'Healthcare'   },
  ],
  tech: [
    { symbol: 'AAPL' }, { symbol: 'MSFT' }, { symbol: 'NVDA' },
    { symbol: 'GOOGL' },{ symbol: 'META' }, { symbol: 'AMZN' },
    { symbol: 'TSLA' }, { symbol: 'AMD' },  { symbol: 'INTC' },
    { symbol: 'CRM' },  { symbol: 'ADBE' }, { symbol: 'ORCL' },
    { symbol: 'NFLX' }, { symbol: 'SHOP' }, { symbol: 'SNOW' },
    { symbol: 'PLTR' }, { symbol: 'UBER' }, { symbol: 'COIN' },
  ],
  finance: [
    { symbol: 'JPM' },  { symbol: 'BAC' },  { symbol: 'GS' },
    { symbol: 'MS' },   { symbol: 'WFC' },  { symbol: 'V' },
    { symbol: 'MA' },   { symbol: 'PYPL' }, { symbol: 'AXP' },
    { symbol: 'C' },    { symbol: 'USB' },  { symbol: 'SCHW' },
  ],
  health: [
    { symbol: 'JNJ' },  { symbol: 'PFE' },  { symbol: 'UNH' },
    { symbol: 'ABBV' }, { symbol: 'MRK' },  { symbol: 'LLY' },
    { symbol: 'TMO' },  { symbol: 'ABT' },  { symbol: 'AMGN' },
    { symbol: 'GILD' }, { symbol: 'MRNA' }, { symbol: 'CVS' },
  ],
  energy: [
    { symbol: 'XOM' }, { symbol: 'CVX' }, { symbol: 'COP' },
    { symbol: 'SLB' }, { symbol: 'EOG' }, { symbol: 'VLO' },
    { symbol: 'MPC' }, { symbol: 'OXY' }, { symbol: 'PSX' },
    { symbol: 'HES' },
  ],
  consumer: [
    { symbol: 'WMT' }, { symbol: 'TGT' },  { symbol: 'COST' },
    { symbol: 'HD' },  { symbol: 'MCD' },  { symbol: 'SBUX' },
    { symbol: 'NKE' }, { symbol: 'DIS' },  { symbol: 'PG' },
    { symbol: 'KO' },  { symbol: 'PEP' },  { symbol: 'LOW' },
    { symbol: 'VINE', label: 'Fresh Vine Wine' },
  ],
}

interface Ticker extends Partial<StockData> {
  symbol: string
  label?: string
  isLoading: boolean
}

function fmt(n: number | undefined) {
  if (n === undefined || n === 0) return '—'
  return n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

export default function MarketsPage() {
  const [sector, setSector]   = useState<Sector>('indices')
  const [tickers, setTickers] = useState<Ticker[]>([])
  const cacheRef = useRef<Partial<Record<Sector, Ticker[]>>>({})

  useEffect(() => {
    let cancelled = false
    async function load() {
      if (cacheRef.current[sector]) {
        if (!cancelled) setTickers(cacheRef.current[sector]!)
        return
      }
      const stocks = SECTOR_STOCKS[sector]
      if (!cancelled) setTickers(stocks.map(({ symbol, label }) => ({ symbol, label, isLoading: true })))

      const results = await Promise.allSettled(
        stocks.map(({ symbol }) => fetch(`/api/stocks/${symbol}`).then((r) => r.json()))
      )
      if (cancelled) return

      const loaded: Ticker[] = stocks.map(({ symbol, label }, i) => {
        const r = results[i]
        if (r.status === 'fulfilled' && !(r.value as { error?: string }).error) {
          return { ...(r.value as Partial<StockData>), symbol, label, isLoading: false }
        }
        return { symbol, label, isLoading: false }
      })
      cacheRef.current[sector] = loaded
      setTickers(loaded)
    }
    load()
    return () => { cancelled = true }
  }, [sector])

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <h1 className={styles.title}>Markets</h1>
        <span className={styles.stockCount}>{SECTOR_STOCKS[sector].length} stocks</span>
      </header>

      <div className={styles.sectorBar}>
        {SECTORS.map((s) => (
          <button
            key={s.id}
            className={`${styles.sectorPill}${sector === s.id ? ' ' + styles.activePill : ''}`}
            onClick={() => setSector(s.id)}
          >
            {s.label}
          </button>
        ))}
      </div>

      {sector === 'indices' ? (
        <section className={styles.section}>
          <div className={styles.indicesGrid}>
            {tickers.map((d) => {
              const pct = d.changePercent ?? 0
              const up  = pct >= 0
              return (
                <div key={d.symbol} className={styles.indexCard}>
                  <p className={styles.indexLabel}>{d.label ?? d.symbol}</p>
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
      ) : (
        <section className={styles.section}>
          <div className={styles.tickerList}>
            {tickers.map((d) => {
              const pct = d.changePercent ?? 0
              const up  = pct >= 0
              return (
                <div key={d.symbol} className={styles.tickerRow}>
                  <div className={styles.tickerLeft}>
                    <div className={styles.tickerIcon}>{d.symbol[0]}</div>
                    <div>
                      <p className={styles.tickerSymbol}>{d.symbol}</p>
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
      )}

      <div className={styles.spacer} />
      <BottomNav active="markets" />
    </div>
  )
}
