'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import type { Holding, StockData } from '@/lib/types'
import styles from './StockCard.module.css'

interface Props {
  holding: Holding
  stockData: StockData | null
  isLoading: boolean
  onDelete: (id: string) => void
}

const ICON_COLORS = [
  '#f97316', '#8b5cf6', '#0ea5e9',
  '#10b981', '#ef4444', '#f59e0b',
]

function iconColor(symbol: string) {
  return ICON_COLORS[symbol.charCodeAt(0) % ICON_COLORS.length]
}

function fmt(n: number) {
  return n.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })
}

export default function StockCard({
  holding,
  stockData,
  isLoading,
  onDelete,
}: Props) {
  const [confirmDelete, setConfirmDelete] = useState(false)
  const router = useRouter()

  const currentPrice = stockData?.currentPrice ?? holding.avg_buy_price
  const totalValue = holding.shares * currentPrice
  const costBasis = holding.shares * holding.avg_buy_price
  const pnl = totalValue - costBasis
  const pnlPct = costBasis > 0 ? (pnl / costBasis) * 100 : 0
  const isUp = pnl >= 0
  const color = iconColor(holding.symbol)

  return (
    <div className={styles.card} onClick={() => router.push(`/stock/${holding.symbol}`)}>
      {/* Top row */}
      <div className={styles.top}>
        <div className={styles.left}>
          <div
            className={styles.icon}
            style={{ background: color + '20', color }}
          >
            {holding.symbol[0]}
          </div>
          <div>
            <p className={styles.symbol}>{holding.symbol}</p>
            <p className={styles.companyName}>
              {isLoading ? '…' : stockData?.name || holding.name}
            </p>
          </div>
        </div>

        <div className={styles.right}>
          {isLoading ? (
            <div className={styles.priceSkeleton} />
          ) : (
            <>
              <p className={styles.price}>${fmt(currentPrice)}</p>
              {stockData && (
                <p
                  className={`${styles.dayChange} ${
                    stockData.changePercent >= 0 ? styles.green : styles.red
                  }`}
                >
                  {stockData.changePercent >= 0 ? '▲' : '▼'}{' '}
                  {Math.abs(stockData.changePercent).toFixed(2)}%
                </p>
              )}
            </>
          )}
        </div>
      </div>

      {/* Stats row */}
      <div className={styles.stats}>
        <div className={styles.stat}>
          <span className={styles.statLabel}>Shares</span>
          <span className={styles.statValue}>{holding.shares}</span>
        </div>
        <div className={styles.stat}>
          <span className={styles.statLabel}>Avg price</span>
          <span className={styles.statValue}>${fmt(holding.avg_buy_price)}</span>
        </div>
        <div className={styles.stat}>
          <span className={styles.statLabel}>Value</span>
          <span className={styles.statValue}>${fmt(totalValue)}</span>
        </div>
        <div className={styles.stat}>
          <span className={styles.statLabel}>P&L</span>
          <span
            className={`${styles.statValue} ${isUp ? styles.green : styles.red}`}
          >
            {isUp ? '+' : ''}${fmt(pnl)}
          </span>
        </div>
      </div>

      {/* Delete control */}
      <div onClick={(e) => e.stopPropagation()}>
      {!confirmDelete ? (
        <button
          className={styles.deleteBtn}
          onClick={() => setConfirmDelete(true)}
          aria-label="Remove holding"
        >
          <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
            <path d="M7 21c-.55 0-1.021-.196-1.413-.588A1.922 1.922 0 0 1 5 19V6H4V4h5V3h6v1h5v2h-1v13c0 .55-.196 1.021-.588 1.413A1.922 1.922 0 0 1 17 21H7Zm2-4h2V8H9v9Zm4 0h2V8h-2v9Z"/>
          </svg>
        </button>
      ) : (
        <div className={styles.confirm}>
          <span className={styles.confirmText}>Remove?</span>
          <button
            className={styles.confirmYes}
            onClick={() => onDelete(holding.id)}
          >
            Yes
          </button>
          <button
            className={styles.confirmNo}
            onClick={() => setConfirmDelete(false)}
          >
            No
          </button>
        </div>
      )}
      </div>
    </div>
  )
}
