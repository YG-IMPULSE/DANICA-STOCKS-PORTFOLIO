'use client'

export const dynamic = 'force-dynamic'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import styles from './page.module.css'

export default function AddStockPage() {
  const [symbol, setSymbol] = useState('')
  const [shares, setShares] = useState('')
  const [avgPrice, setAvgPrice] = useState('')
  const [resolvedName, setResolvedName] = useState('')
  const [lookupLoading, setLookupLoading] = useState(false)
  const [lookupError, setLookupError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()
  const supabase = createClient()
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  function handleSymbolChange(value: string) {
    const upper = value.toUpperCase().replace(/[^A-Z.]/g, '')
    setSymbol(upper)
    setResolvedName('')
    setLookupError('')

    if (debounceRef.current) clearTimeout(debounceRef.current)
    if (upper.length >= 1) {
      debounceRef.current = setTimeout(() => lookupSymbol(upper), 700)
    }
  }

  async function lookupSymbol(sym: string) {
    setLookupLoading(true)
    setLookupError('')
    try {
      const res = await fetch(`/api/stocks/${sym}`)
      const data = await res.json()
      if (data.error) {
        setLookupError('Symbol not found')
      } else {
        setResolvedName(data.name || sym)
        if (data.currentPrice && !avgPrice) {
          setAvgPrice(data.currentPrice.toFixed(2))
        }
      }
    } catch {
      setLookupError('Could not look up symbol')
    }
    setLookupLoading(false)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setSubmitting(true)

    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) {
      router.push('/login')
      return
    }

    const { error: dbError } = await supabase.from('holdings').insert({
      user_id: user.id,
      symbol: symbol.toUpperCase(),
      name: resolvedName || symbol,
      shares: parseFloat(shares),
      avg_buy_price: parseFloat(avgPrice),
    })

    if (dbError) {
      setError(dbError.message)
      setSubmitting(false)
    } else {
      router.push('/dashboard')
    }
  }

  const totalCost =
    shares && avgPrice
      ? parseFloat(shares) * parseFloat(avgPrice)
      : null

  const canSubmit =
    !submitting && !lookupLoading && symbol.length > 0 && !!shares && !!avgPrice

  return (
    <div className={styles.page}>
      {/* Header */}
      <header className={styles.header}>
        <button className={styles.backBtn} onClick={() => router.back()}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
            <path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2Z"/>
          </svg>
        </button>
        <h1 className={styles.title}>Add Stock</h1>
        <div style={{ width: 40 }} />
      </header>

      <form className={styles.form} onSubmit={handleSubmit}>
        {error && <div className={styles.errorBox}>{error}</div>}

        {/* Symbol */}
        <div className={styles.field}>
          <label className={styles.label} htmlFor="symbol">
            Ticker Symbol
          </label>
          <input
            id="symbol"
            className={styles.input}
            type="text"
            placeholder="e.g. AAPL"
            value={symbol}
            onChange={(e) => handleSymbolChange(e.target.value)}
            required
            autoCapitalize="characters"
            autoComplete="off"
            spellCheck={false}
          />
          {lookupLoading && (
            <p className={styles.hint}>Looking up…</p>
          )}
          {!lookupLoading && resolvedName && (
            <p className={styles.hintSuccess}>{resolvedName}</p>
          )}
          {!lookupLoading && lookupError && (
            <p className={styles.hintError}>{lookupError}</p>
          )}
        </div>

        {/* Shares */}
        <div className={styles.field}>
          <label className={styles.label} htmlFor="shares">
            Number of Shares
          </label>
          <input
            id="shares"
            className={styles.input}
            type="number"
            placeholder="e.g. 10"
            value={shares}
            onChange={(e) => setShares(e.target.value)}
            min="0.0001"
            step="any"
            required
            inputMode="decimal"
          />
        </div>

        {/* Avg price */}
        <div className={styles.field}>
          <label className={styles.label} htmlFor="avgPrice">
            Average Buy Price ($)
          </label>
          <input
            id="avgPrice"
            className={styles.input}
            type="number"
            placeholder="e.g. 175.50"
            value={avgPrice}
            onChange={(e) => setAvgPrice(e.target.value)}
            min="0.01"
            step="any"
            required
            inputMode="decimal"
          />
        </div>

        {/* Preview */}
        {symbol && shares && avgPrice && totalCost !== null && (
          <div className={styles.preview}>
            <p className={styles.previewLabel}>You are adding</p>
            <p className={styles.previewValue}>
              {shares} × {symbol} @{' '}
              ${parseFloat(avgPrice).toFixed(2)}
            </p>
            <p className={styles.previewCost}>
              Total cost:{' '}
              $
              {totalCost.toLocaleString('en-US', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </p>
          </div>
        )}

        <button
          className={styles.button}
          type="submit"
          disabled={!canSubmit}
        >
          {submitting ? 'Adding…' : 'Add to Portfolio'}
        </button>
      </form>

      <div className={styles.spacer} />
    </div>
  )
}
