'use client'

export const dynamic = 'force-dynamic'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import BottomNav from '@/components/BottomNav'
import styles from './page.module.css'

export default function MenuPage() {
  const [email,   setEmail]   = useState('')
  const [loading, setLoading] = useState(true)
  const router   = useRouter()
  const supabase = createClient()

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) { router.push('/login'); return }
      setEmail(user.email ?? '')
      setLoading(false)
    })
  }, [router, supabase])

  async function handleSignOut() {
    await supabase.auth.signOut()
    router.push('/login')
  }

  const initial  = email ? email[0].toUpperCase() : '?'
  const username = email.split('@')[0]

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <h1 className={styles.title}>Account</h1>
      </header>

      {!loading && (
        <>
          {/* Profile card */}
          <div className={styles.profileCard}>
            <div className={styles.avatar}>{initial}</div>
            <div>
              <p className={styles.username}>{username}</p>
              <p className={styles.email}>{email}</p>
            </div>
          </div>

          {/* Menu sections */}
          <div className={styles.sections}>
            {/* Portfolio */}
            <div className={styles.group}>
              <p className={styles.groupLabel}>Portfolio</p>
              <Link href="/portfolio" className={styles.menuItem}>
                <span className={styles.menuIcon}>
                  <svg width="17" height="17" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M20 6h-4V4c0-1.11-.89-2-2-2h-4c-1.11 0-2 .89-2 2v2H4c-1.11 0-1.99.89-1.99 2L2 19c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V8c0-1.11-.89-2-2-2zm-6 0h-4V4h4v2z"/>
                  </svg>
                </span>
                <span className={styles.menuLabel}>My Holdings</span>
                <span className={styles.chevron}>›</span>
              </Link>
              <Link href="/add-stock" className={styles.menuItem}>
                <span className={styles.menuIcon}>
                  <svg width="17" height="17" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M19 11h-6V5a1 1 0 0 0-2 0v6H5a1 1 0 0 0 0 2h6v6a1 1 0 0 0 2 0v-6h6a1 1 0 0 0 0-2Z"/>
                  </svg>
                </span>
                <span className={styles.menuLabel}>Add Stock</span>
                <span className={styles.chevron}>›</span>
              </Link>
            </div>

            {/* Preferences */}
            <div className={styles.group}>
              <p className={styles.groupLabel}>Preferences</p>
              <div className={`${styles.menuItem} ${styles.disabled}`}>
                <span className={styles.menuIcon}>
                  <svg width="17" height="17" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 22c1.1 0 2-.9 2-2h-4c0 1.1.9 2 2 2zm6-6v-5c0-3.07-1.64-5.64-4.5-6.32V4c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5v.68C7.63 5.36 6 7.92 6 11v5l-2 2v1h16v-1l-2-2z"/>
                  </svg>
                </span>
                <span className={styles.menuLabel}>Notifications</span>
                <span className={styles.soon}>Soon</span>
              </div>
              <div className={`${styles.menuItem} ${styles.disabled}`}>
                <span className={styles.menuIcon}>
                  <svg width="17" height="17" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm0 10.99h7c-.53 4.12-3.28 7.79-7 8.94V12H5V6.3l7-3.11v8.8z"/>
                  </svg>
                </span>
                <span className={styles.menuLabel}>Security</span>
                <span className={styles.soon}>Soon</span>
              </div>
            </div>

            {/* Account */}
            <div className={styles.group}>
              <p className={styles.groupLabel}>Account</p>
              <button className={`${styles.menuItem} ${styles.danger}`} onClick={handleSignOut}>
                <span className={`${styles.menuIcon} ${styles.dangerIcon}`}>
                  <svg width="17" height="17" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M5 21q-.825 0-1.413-.587A1.926 1.926 0 0 1 3 19V5q0-.825.587-1.413A1.926 1.926 0 0 1 5 3h7v2H5v14h7v2H5Zm11-4-1.375-1.45 2.55-2.55H9v-2h8.175l-2.55-2.55L16 7l5 5-5 5Z"/>
                  </svg>
                </span>
                <span className={styles.menuLabel}>Sign Out</span>
                <span className={styles.chevron}>›</span>
              </button>
            </div>
          </div>

          <div className={styles.appInfo}>
            <p>Danica Portfolio · v1.0.0</p>
            <p>Private use only</p>
          </div>
        </>
      )}

      <div className={styles.spacer} />
      <BottomNav active="menu" />
    </div>
  )
}
