'use client'

export const dynamic = 'force-dynamic'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import styles from './page.module.css'

interface NotifPrefs {
  priceAlerts:      boolean
  portfolioSummary: boolean
  marketNews:       boolean
  ipoAlerts:        boolean
  earningsAlerts:   boolean
}

const DEFAULT_PREFS: NotifPrefs = {
  priceAlerts:      false,
  portfolioSummary: false,
  marketNews:       false,
  ipoAlerts:        false,
  earningsAlerts:   false,
}

const ITEMS: { key: keyof NotifPrefs; label: string; desc: string; icon: string }[] = [
  {
    key:   'priceAlerts',
    label: 'Price Alerts',
    desc:  'When a held stock moves ±5% in a day',
    icon:  'M3.5 18.49l6-6.01 4 4L22 6.92l-1.41-1.41-7.09 7.97-4-4L2 16.99z',
  },
  {
    key:   'portfolioSummary',
    label: 'Daily Summary',
    desc:  'End-of-day portfolio performance recap',
    icon:  'M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-5 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z',
  },
  {
    key:   'marketNews',
    label: 'Market News',
    desc:  'Breaking financial news and market updates',
    icon:  'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z',
  },
  {
    key:   'ipoAlerts',
    label: 'IPO Alerts',
    desc:  'New listings and upcoming IPO announcements',
    icon:  'M19 11h-6V5a1 1 0 0 0-2 0v6H5a1 1 0 0 0 0 2h6v6a1 1 0 0 0 2 0v-6h6a1 1 0 0 0 0-2Z',
  },
  {
    key:   'earningsAlerts',
    label: 'Earnings Alerts',
    desc:  'Earnings reports for stocks you hold',
    icon:  'M11.8 10.9c-2.27-.59-3-1.2-3-2.15 0-1.09 1.01-1.85 2.7-1.85 1.78 0 2.44.85 2.5 2.1h2.21c-.07-1.72-1.12-3.3-3.21-3.81V3h-3v2.16c-1.94.42-3.5 1.68-3.5 3.61 0 2.31 1.91 3.46 4.7 4.13 2.5.6 3 1.48 3 2.41 0 .69-.49 1.79-2.7 1.79-2.06 0-2.87-.92-2.98-2.1h-2.2c.12 2.19 1.76 3.42 3.68 3.83V21h3v-2.15c1.95-.37 3.5-1.5 3.5-3.55 0-2.84-2.43-3.81-4.7-4.4z',
  },
]

export default function NotificationsPage() {
  const router   = useRouter()
  const supabase = createClient()

  const [prefs,   setPrefs]   = useState<NotifPrefs>(DEFAULT_PREFS)
  const [loading, setLoading] = useState(true)
  const [saving,  setSaving]  = useState<string | null>(null)
  const [flash,   setFlash]   = useState(false)

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) { router.push('/login'); return }
      const stored = (user.user_metadata?.notifications ?? {}) as Partial<NotifPrefs>
      setPrefs({ ...DEFAULT_PREFS, ...stored })
      setLoading(false)
    })
  }, [router, supabase])

  async function toggle(key: keyof NotifPrefs) {
    const next = { ...prefs, [key]: !prefs[key] }
    setPrefs(next)
    setSaving(key)
    await supabase.auth.updateUser({ data: { notifications: next } })
    setSaving(null)
    setFlash(true)
    setTimeout(() => setFlash(false), 1500)
  }

  if (loading) return <div className={styles.page} />

  const anyEnabled = Object.values(prefs).some(Boolean)

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <button className={styles.backBtn} onClick={() => router.back()}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
            <path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2Z"/>
          </svg>
        </button>
        <h1 className={styles.title}>Notifications</h1>
        {flash && <span className={styles.savedBadge}>Saved ✓</span>}
      </header>

      <p className={styles.intro}>
        Toggle the notifications you want to receive. Delivery channels (push, email, SMS) will be configured once connected.
      </p>

      <div className={styles.list}>
        {ITEMS.map(({ key, label, desc, icon }) => (
          <div key={key} className={styles.row}>
            <div className={styles.rowLeft}>
              <div className={`${styles.rowIcon} ${prefs[key] ? styles.rowIconOn : ''}`}>
                <svg width="17" height="17" viewBox="0 0 24 24" fill="currentColor">
                  <path d={icon} />
                </svg>
              </div>
              <div className={styles.rowText}>
                <p className={styles.rowLabel}>{label}</p>
                <p className={styles.rowDesc}>{desc}</p>
              </div>
            </div>

            <button
              role="switch"
              aria-checked={prefs[key]}
              aria-label={`Toggle ${label}`}
              className={`${styles.toggle} ${prefs[key] ? styles.toggleOn : ''}`}
              onClick={() => toggle(key)}
              disabled={saving === key}
            >
              <span className={styles.thumb} />
            </button>
          </div>
        ))}
      </div>

      {anyEnabled && (
        <div className={styles.notice}>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"/>
          </svg>
          Your preferences are saved. Notification delivery will activate once channels are configured.
        </div>
      )}

      <div className={styles.spacer} />
    </div>
  )
}
