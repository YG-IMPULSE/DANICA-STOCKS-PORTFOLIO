'use client'

export const dynamic = 'force-dynamic'

import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import type { Holding, StockData } from '@/lib/types'
import BottomNav from '@/components/BottomNav'
import StockCard from '@/components/StockCard'
import styles from './page.module.css'

interface HoldingWithPrice extends Holding {
  stockData: StockData | null
  isLoading: boolean
}

const PULSE = [
  { symbol: 'SPY',  label: 'S&P 500'         },
  { symbol: 'QQQ',  label: 'NASDAQ'           },
  { symbol: 'DIA',  label: 'DOW'              },
  { symbol: 'VINE', label: 'Fresh Vine Wine'  },
  { symbol: 'NVDA', label: 'NVDA'             },
  { symbol: 'AAPL', label: 'AAPL'             },
  { symbol: 'TSLA', label: 'TSLA'             },
  { symbol: 'GLD',  label: 'GOLD'             },
]

interface PulseItem extends Partial<StockData> {
  symbol: string
  label: string
  isLoading: boolean
}

export default function PortfolioPage() {
  const [holdings, setHoldings] = useState<HoldingWithPrice[]>([])
  const [pageLoading, setPageLoading] = useState(true)
  const [userEmail, setUserEmail] = useState('')
  const [displayName, setDisplayName] = useState('')
  const [pulse, setPulse] = useState<PulseItem[]>(
    PULSE.map((p) => ({ symbol: p.symbol, label: p.label, isLoading: true }))
  )
  const router = useRouter()
  const supabase = createClient()

  const fetchPrices = useCallback(async (base: Holding[]) => {
    const initial: HoldingWithPrice[] = base.map((h) => ({
      ...h,
      stockData: null,
      isLoading: true,
    }))
    setHoldings(initial)

    await Promise.all(
      base.map(async (holding, i) => {
        try {
          const res = await fetch(`/api/stocks/${holding.symbol}`)
          const data = await res.json()
          setHoldings((prev) => {
            const next = [...prev]
            next[i] = {
              ...next[i],
              stockData: data.error ? null : (data as StockData),
              isLoading: false,
            }
            return next
          })
        } catch {
          setHoldings((prev) => {
            const next = [...prev]
            next[i] = { ...next[i], isLoading: false }
            return next
          })
        }
      })
    )
  }, [])

  useEffect(() => {
    async function load() {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) {
        router.push('/login')
        return
      }
      setUserEmail(user.email ?? '')
      setDisplayName(
        user.user_metadata?.first_name ||
        (user.email ?? '').split('@')[0].split('.')[0]
      )

      const { data } = await supabase
        .from('holdings')
        .select('*')
        .order('created_at', { ascending: false })

      const rows: Holding[] = data ?? []
      setPageLoading(false)

      if (rows.length > 0) {
        await fetchPrices(rows)
      }
    }
    load()
  }, [router, supabase, fetchPrices])

  // Fetch market pulse independently
  useEffect(() => {
    PULSE.forEach(({ symbol, label }, i) => {
      fetch(`/api/stocks/${symbol}`)
        .then((r) => r.json())
        .then((data) =>
          setPulse((prev) => {
            const next = [...prev]
            next[i] = data.error
              ? { symbol, label, isLoading: false }
              : { ...data, symbol, label, isLoading: false }
            return next
          })
        )
        .catch(() =>
          setPulse((prev) => {
            const next = [...prev]
            next[i] = { symbol, label, isLoading: false }
            return next
          })
        )
    })
  }, [])

  async function handleDelete(id: string) {
    await supabase.from('holdings').delete().eq('id', id)
    setHoldings((prev) => prev.filter((h) => h.id !== id))
  }

  async function handleSignOut() {
    await supabase.auth.signOut()
    router.push('/login')
  }

  // Summary calculations
  const totalValue = holdings.reduce((sum, h) => {
    const price = h.stockData?.currentPrice ?? h.avg_buy_price
    return sum + h.shares * price
  }, 0)

  const totalCost = holdings.reduce(
    (sum, h) => sum + h.shares * h.avg_buy_price,
    0
  )
  const totalPnl = totalValue - totalCost
  const totalPnlPct = totalCost > 0 ? (totalPnl / totalCost) * 100 : 0
  const isPositive = totalPnl >= 0

  const firstName = displayName
  const hour = new Date().getHours()
  const greeting =
    hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening'

  const fmt = (n: number) =>
    n.toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })

  return (
    <div className={styles.page}>
      {/* Header */}
      <header className={styles.header}>
        <div>
          <p className={styles.greeting}>{greeting}</p>
          <h1 className={styles.name}>{firstName}</h1>
        </div>
        <button
          className={styles.logoutBtn}
          onClick={handleSignOut}
          title="Sign out"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
            <path d="M5 21q-.825 0-1.413-.587A1.926 1.926 0 0 1 3 19V5q0-.825.587-1.413A1.926 1.926 0 0 1 5 3h7v2H5v14h7v2H5Zm11-4-1.375-1.45 2.55-2.55H9v-2h8.175l-2.55-2.55L16 7l5 5-5 5Z"/>
          </svg>
        </button>
      </header>

      {/* Portfolio Summary Card */}
      <div className={styles.summaryCard}>
        <p className={styles.summaryLabel}>Portfolio Value</p>
        <p className={styles.summaryValue}>
          {pageLoading ? '—' : `$${fmt(totalValue)}`}
        </p>
        {!pageLoading && totalCost > 0 && (
          <div className={styles.summaryPnl}>
            <span className={styles.pnlBadge}>
              {isPositive ? '▲' : '▼'} {isPositive ? '+' : ''}{totalPnlPct.toFixed(2)}%
            </span>
            <span className={styles.pnlAmt}>
              {isPositive ? '+' : ''}${fmt(totalPnl)}
            </span>
          </div>
        )}
      </div>

      {/* Holdings List */}
      <section className={styles.holdings}>
        <div className={styles.holdingsHeader}>
          <h2 className={styles.holdingsTitle}>Holdings</h2>
          {!pageLoading && (
            <span className={styles.holdingsBadge}>{holdings.length}</span>
          )}
        </div>

        {pageLoading && (
          <div className={styles.skeletonList}>
            {[1, 2, 3].map((i) => (
              <div key={i} className={styles.skeleton} />
            ))}
          </div>
        )}

        {!pageLoading && holdings.length === 0 && (
          <div className={styles.empty}>
            <p>No holdings yet.</p>
            <p>
              Tap <strong>Add Stock</strong> to get started.
            </p>
          </div>
        )}

        {!pageLoading && holdings.length > 0 && (
          <div className={styles.holdingsList}>
            {holdings.map((h) => (
              <StockCard
                key={h.id}
                holding={h}
                stockData={h.stockData}
                isLoading={h.isLoading}
                onDelete={handleDelete}
              />
            ))}
          </div>
        )}

        {/* Market Watch — listed after user holdings */}
        {!pageLoading && (
          <div className={styles.watchSection}>
            <p className={styles.watchDivider}>Market Watch</p>
            <div className={styles.watchList}>
              {PULSE.map(({ symbol, label }, i) => {
                const d   = pulse[i]
                const pct = d?.changePercent ?? 0
                const up  = pct >= 0
                return (
                  <div key={symbol} className={styles.watchCard} onClick={() => router.push(`/stock/${symbol}`)} style={{ cursor: 'pointer' }}>
                    <div className={styles.watchLeft}>
                      <div className={styles.watchIcon}>{symbol[0]}</div>
                      <div>
                        <p className={styles.watchSymbol}>{symbol}</p>
                        <p className={styles.watchName}>{label}</p>
                      </div>
                    </div>
                    <div className={styles.watchRight}>
                      {d?.isLoading ? (
                        <div className={styles.watchSkeleton} />
                      ) : !d?.currentPrice ? (
                        <p className={styles.watchPrice} style={{ color: 'var(--text-muted)' }}>—</p>
                      ) : (
                        <>
                          <p className={styles.watchPrice}>
                            ${d.currentPrice.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </p>
                          <p className={`${styles.watchPct} ${up ? styles.watchUp : styles.watchDown}`}>
                            {up ? '+' : ''}{pct.toFixed(2)}%
                          </p>
                        </>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </section>

      <div className={styles.spacer} />

      {/* Floating action button — add stock */}
      <Link href="/add-stock" className={styles.fab} title="Add stock">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
          <path d="M19 11h-6V5a1 1 0 0 0-2 0v6H5a1 1 0 0 0 0 2h6v6a1 1 0 0 0 2 0v-6h6a1 1 0 0 0 0-2Z"/>
        </svg>
      </Link>

      <BottomNav active="portfolio" />
    </div>
  )
}
