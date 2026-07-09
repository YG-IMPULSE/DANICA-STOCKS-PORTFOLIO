'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import BottomNav from '@/components/BottomNav'
import styles from './page.module.css'
import type { Holding } from '@/lib/types'

interface Rec {
  symbol: string
  buy: number
  hold: number
  sell: number
  strongBuy: number
  strongSell: number
  period: string
}

const INSIGHTS = [
  {
    icon: '📈',
    title: 'Diversify Your Holdings',
    body: 'Spreading investments across sectors reduces single-stock risk without sacrificing long-term performance.',
  },
  {
    icon: '🔄',
    title: 'Dollar-Cost Averaging',
    body: 'Investing a fixed amount at regular intervals smooths out volatility and lowers your average cost over time.',
  },
  {
    icon: '📊',
    title: 'Watch Earnings Season',
    body: 'Quarterly earnings reports drive major price moves. Beats and misses can shift sentiment overnight.',
  },
  {
    icon: '🏦',
    title: 'Interest Rate Impact',
    body: 'Rising rates pressure high-growth stocks more than value stocks. Adjust sector allocation accordingly.',
  },
]

function sentimentOf(r: Rec) {
  const t = r.buy + r.hold + r.sell + r.strongBuy + r.strongSell || 1
  const buyPct = ((r.buy + r.strongBuy) / t) * 100
  if (buyPct >= 70) return { label: 'Strong Buy', color: '#16a34a' }
  if (buyPct >= 50) return { label: 'Buy',         color: '#22c55e' }
  if (buyPct >= 40) return { label: 'Hold',        color: '#f59e0b' }
  return              { label: 'Sell',         color: '#dc2626' }
}

export default function ExpertsPage() {
  const [holdings, setHoldings] = useState<Holding[]>([])
  const [recs,     setRecs]     = useState<Record<string, Rec>>({})
  const [loading,  setLoading]  = useState(true)
  const supabase = createClient()

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { setLoading(false); return }

      const { data } = await supabase.from('holdings').select('*')
      const rows: Holding[] = data ?? []
      setHoldings(rows)
      setLoading(false)

      rows.forEach(async (h) => {
        try {
          const res  = await fetch(`/api/experts/${h.symbol}`)
          const data = await res.json()
          if (!data.error) {
            setRecs((prev) => ({ ...prev, [h.symbol]: data as Rec }))
          }
        } catch { /* silent */ }
      })
    }
    load()
  }, [supabase])

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <h1 className={styles.title}>Expert Picks</h1>
      </header>

      {/* Analyst Ratings for portfolio holdings */}
      {!loading && holdings.length > 0 && (
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Analyst Ratings</h2>
          <p className={styles.sectionSub}>Based on your current holdings</p>

          {holdings.map((h) => {
            const rec       = recs[h.symbol]
            const t         = rec ? (rec.buy + rec.hold + rec.sell + rec.strongBuy + rec.strongSell || 1) : 1
            const sentiment = rec ? sentimentOf(rec) : null

            return (
              <div key={h.symbol} className={styles.recCard}>
                <div className={styles.recHeader}>
                  <span className={styles.recSymbol}>{h.symbol}</span>
                  <span className={styles.recName}>{h.name}</span>
                  {sentiment && (
                    <span
                      className={styles.recBadge}
                      style={{ background: sentiment.color + '18', color: sentiment.color }}
                    >
                      {sentiment.label}
                    </span>
                  )}
                </div>

                {rec ? (
                  <div className={styles.bars}>
                    {[
                      { label: 'Strong Buy',  value: rec.strongBuy,  color: '#16a34a' },
                      { label: 'Buy',          value: rec.buy,         color: '#4ade80' },
                      { label: 'Hold',         value: rec.hold,        color: '#f59e0b' },
                      { label: 'Sell',         value: rec.sell,        color: '#f97316' },
                      { label: 'Strong Sell',  value: rec.strongSell,  color: '#dc2626' },
                    ].map((b) => (
                      <div key={b.label} className={styles.barRow}>
                        <span className={styles.barLabel}>{b.label}</span>
                        <div className={styles.barTrack}>
                          <div
                            className={styles.barFill}
                            style={{ width: `${(b.value / t) * 100}%`, background: b.color }}
                          />
                        </div>
                        <span className={styles.barCount}>{b.value}</span>
                      </div>
                    ))}
                    <p className={styles.recPeriod}>Data as of {rec.period}</p>
                  </div>
                ) : (
                  <p className={styles.recLoading}>Fetching analyst data…</p>
                )}
              </div>
            )
          })}
        </section>
      )}

      {!loading && holdings.length === 0 && (
        <div className={styles.noHoldings}>
          <p>Add stocks to your portfolio to see analyst ratings here.</p>
        </div>
      )}

      {/* Static insights */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Market Insights</h2>
        {INSIGHTS.map((ins) => (
          <div key={ins.title} className={styles.insightCard}>
            <span className={styles.insightIcon}>{ins.icon}</span>
            <div>
              <p className={styles.insightTitle}>{ins.title}</p>
              <p className={styles.insightBody}>{ins.body}</p>
            </div>
          </div>
        ))}
      </section>

      <div className={styles.spacer} />
      <BottomNav active="experts" />
    </div>
  )
}
