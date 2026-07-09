'use client'

export const dynamic = 'force-dynamic'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import styles from './page.module.css'

export default function LoginPage() {
  const [isSignUp, setIsSignUp] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const router = useRouter()
  const supabase = createClient()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setMessage('')
    setLoading(true)

    if (isSignUp) {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/api/auth/callback`,
        },
      })
      if (error) {
        setError(error.message)
      } else {
        setMessage('Check your email to confirm your account.')
      }
    } else {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })
      if (error) {
        setError(error.message)
      } else {
        router.push('/portfolio')
        router.refresh()
      }
    }

    setLoading(false)
  }

  function toggle() {
    setIsSignUp(!isSignUp)
    setError('')
    setMessage('')
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.logoWrap}>
          {/* Drop your logo at public/logo.png to use it here */}
          <img
            src="/logo.png"
            alt="Logo"
            className={styles.logoImg}
            onError={(e) => {
              e.currentTarget.style.display = 'none'
              const fb = e.currentTarget.nextElementSibling as HTMLElement | null
              if (fb) fb.style.display = 'flex'
            }}
          />
          <div className={styles.logoIcon} style={{ display: 'none' }}>
            <svg width="34" height="34" viewBox="0 0 24 24" fill="currentColor">
              <path d="M3.5 18.49l6-6.01 4 4L22 6.92l-1.41-1.41-7.09 7.97-4-4L2 16.99z"/>
            </svg>
          </div>
        </div>
        <h1 className={styles.title}>PrivateOptions</h1>
        <p className={styles.subtitle}>Your private stock tracker</p>
      </div>

      <div className={styles.formSection}>
      <form className={styles.form} onSubmit={handleSubmit}>
        <h2 className={styles.formTitle}>
          {isSignUp ? 'Create account' : 'Welcome back'}
        </h2>

        {error && <div className={styles.errorBox}>{error}</div>}
        {message && <div className={styles.successBox}>{message}</div>}

        <div className={styles.field}>
          <label className={styles.label} htmlFor="email">
            Email
          </label>
          <input
            id="email"
            className={styles.input}
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete="email"
          />
        </div>

        <div className={styles.field}>
          <label className={styles.label} htmlFor="password">
            Password
          </label>
          <input
            id="password"
            className={styles.input}
            type="password"
            placeholder={isSignUp ? 'Min. 6 characters' : '••••••••'}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={6}
            autoComplete={isSignUp ? 'new-password' : 'current-password'}
          />
        </div>

        <button
          className={styles.button}
          type="submit"
          disabled={loading}
        >
          {loading
            ? 'Please wait…'
            : isSignUp
            ? 'Create Account'
            : 'Sign In'}
        </button>
      </form>

      <p className={styles.toggle}>
        {isSignUp ? 'Already have an account?' : "Don't have an account?"}{' '}
        <button className={styles.toggleBtn} type="button" onClick={toggle}>
          {isSignUp ? 'Sign in' : 'Sign up'}
        </button>
      </p>
      </div>
    </div>
  )
}
