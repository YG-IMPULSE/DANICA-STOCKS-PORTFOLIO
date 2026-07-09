'use client'

export const dynamic = 'force-dynamic'

import { useEffect, useState } from 'react'
import BottomNav from '@/components/BottomNav'
import styles from './page.module.css'

interface NewsItem {
  id: number
  headline: string
  source: string
  url: string
  image: string
  datetime: number
  category?: string
}

type NewsFilter = 'all' | 'general' | 'forex' | 'crypto' | 'merger'

const FILTERS: { id: NewsFilter; label: string }[] = [
  { id: 'all',     label: 'All'    },
  { id: 'general', label: 'Markets'},
  { id: 'forex',   label: 'Forex'  },
  { id: 'crypto',  label: 'Crypto' },
  { id: 'merger',  label: 'M&A'   },
]

function timeAgo(ts: number): string {
  const s = Math.floor(Date.now() / 1000 - ts)
  if (s < 60)    return 'Just now'
  if (s < 3600)  return `${Math.floor(s / 60)}m ago`
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`
  return `${Math.floor(s / 86400)}d ago`
}

export default function NewsPage() {
  const [news, setNews]       = useState<NewsItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError]     = useState(false)
  const [filter, setFilter]   = useState<NewsFilter>('all')

  useEffect(() => {
    fetch('/api/news')
      .then((r) => r.json())
        .then((data) => {
          setNews(Array.isArray(data) ? data : [])
          setLoading(false)
        })
      .catch(() => { setError(true); setLoading(false) })
  }, [])

  const displayed = filter === 'all' ? news : news.filter((n) => n.category === filter)

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <h1 className={styles.title}>Market News</h1>
        <div className={styles.liveDot} title="Live" />
      </header>

      {/* Category filter pills */}
      <div className={styles.filterBar}>
        {FILTERS.map((f) => (
          <button
            key={f.id}
            className={`${styles.filterPill} ${filter === f.id ? styles.activeFilterPill : ''}`}
            onClick={() => setFilter(f.id)}
          >
            {f.label}
          </button>
        ))}
      </div>

      <div className={styles.feed}>
        {loading &&
          [...Array(6)].map((_, i) => (
            <div key={i} className={styles.skeletonCard}>
              <div className={styles.skeletonImg} />
              <div className={styles.skeletonBody}>
                <div className={styles.skeletonLine} />
                <div className={styles.skeletonLine} style={{ width: '75%' }} />
                <div className={styles.skeletonMeta} />
              </div>
            </div>
          ))}

        {!loading && (error || displayed.length === 0) && (
          <div className={styles.empty}>
            <p>No news available right now.</p>
            <p>Check back in a few minutes.</p>
          </div>
        )}

        {!loading &&
          displayed.slice(0, 30).map((item) => (
            <a
              key={item.id}
              href={item.url}
              target="_blank"
              rel="noopener noreferrer"
              className={styles.card}
            >
              {item.image ? (
                <img
                  src={item.image}
                  alt=""
                  className={styles.cardImg}
                  onError={(e) => (e.currentTarget.style.display = 'none')}
                />
              ) : (
                <div className={styles.cardImgPlaceholder}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-5 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z"/>
                  </svg>
                </div>
              )}
              <div className={styles.cardBody}>
                <div className={styles.cardMeta}>
                  <span className={styles.cardSource}>{item.source}</span>
                  <span className={styles.cardDot}>·</span>
                  <span className={styles.cardTime}>{timeAgo(item.datetime)}</span>
                </div>
                <p className={styles.cardHeadline}>{item.headline}</p>
              </div>
            </a>
          ))}
      </div>

      <div className={styles.spacer} />
      <BottomNav active="news" />
    </div>
  )
}
