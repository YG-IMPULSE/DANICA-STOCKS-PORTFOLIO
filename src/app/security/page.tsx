'use client'

export const dynamic = 'force-dynamic'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import styles from './page.module.css'

export default function SecurityPage() {
  const router   = useRouter()
  const supabase = createClient()

  const [newPw,     setNewPw]     = useState('')
  const [confirmPw, setConfirmPw] = useState('')
  const [loading,   setLoading]   = useState(false)
  const [message,   setMessage]   = useState('')
  const [error,     setError]     = useState('')
  const [showNew,   setShowNew]   = useState(false)
  const [showConf,  setShowConf]  = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setMessage('')

    if (newPw.length < 8) {
      setError('Password must be at least 8 characters.')
      return
    }
    if (newPw !== confirmPw) {
      setError('Passwords do not match.')
      return
    }

    setLoading(true)
    const { error: err } = await supabase.auth.updateUser({ password: newPw })
    setLoading(false)

    if (err) {
      setError(err.message)
    } else {
      setMessage('Password updated successfully.')
      setNewPw('')
      setConfirmPw('')
    }
  }

  const EyeIcon = ({ open }: { open: boolean }) => open ? (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"/>
    </svg>
  ) : (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 7c2.76 0 5 2.24 5 5 0 .65-.13 1.26-.36 1.83l2.92 2.92c1.51-1.26 2.7-2.89 3.43-4.75-1.73-4.39-6-7.5-11-7.5-1.4 0-2.74.25-3.98.7l2.16 2.16C10.74 7.13 11.35 7 12 7zM2 4.27l2.28 2.28.46.46A11.804 11.804 0 0 0 1 12c1.73 4.39 6 7.5 11 7.5 1.55 0 3.03-.3 4.38-.84l.42.42L19.73 22 21 20.73 3.27 3 2 4.27zM7.53 9.8l1.55 1.55c-.05.21-.08.43-.08.65 0 1.66 1.34 3 3 3 .22 0 .44-.03.65-.08l1.55 1.55c-.67.33-1.41.53-2.2.53-2.76 0-5-2.24-5-5 0-.79.2-1.53.53-2.2zm4.31-.78 3.15 3.15.02-.16c0-1.66-1.34-3-3-3l-.17.01z"/>
    </svg>
  )

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <button className={styles.backBtn} onClick={() => router.back()}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
            <path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2Z"/>
          </svg>
        </button>
        <h1 className={styles.title}>Security</h1>
      </header>

      <div className={styles.card}>
        <div className={styles.cardHeader}>
          <div className={styles.cardIcon}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2z"/>
            </svg>
          </div>
          <div>
            <p className={styles.cardTitle}>Change Password</p>
            <p className={styles.cardSub}>Min. 8 characters</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.field}>
            <label className={styles.label}>New Password</label>
            <div className={styles.inputWrap}>
              <input
                type={showNew ? 'text' : 'password'}
                className={styles.input}
                value={newPw}
                onChange={(e) => setNewPw(e.target.value)}
                placeholder="Enter new password"
                required
              />
              <button type="button" className={styles.eyeBtn} onClick={() => setShowNew(!showNew)}>
                <EyeIcon open={showNew} />
              </button>
            </div>
          </div>

          <div className={styles.field}>
            <label className={styles.label}>Confirm Password</label>
            <div className={styles.inputWrap}>
              <input
                type={showConf ? 'text' : 'password'}
                className={styles.input}
                value={confirmPw}
                onChange={(e) => setConfirmPw(e.target.value)}
                placeholder="Repeat new password"
                required
              />
              <button type="button" className={styles.eyeBtn} onClick={() => setShowConf(!showConf)}>
                <EyeIcon open={showConf} />
              </button>
            </div>
          </div>

          {/* Password strength hints */}
          <div className={styles.hints}>
            <span className={newPw.length >= 8 ? styles.hintOk : styles.hintOff}>✓ At least 8 characters</span>
            <span className={newPw.length > 0 && newPw === confirmPw ? styles.hintOk : styles.hintOff}>✓ Passwords match</span>
          </div>

          {error   && <div className={styles.errorBox}>{error}</div>}
          {message && <div className={styles.successBox}>{message}</div>}

          <button type="submit" className={styles.submitBtn} disabled={loading}>
            {loading ? 'Updating…' : 'Update Password'}
          </button>
        </form>
      </div>

      <div className={styles.spacer} />
    </div>
  )
}
