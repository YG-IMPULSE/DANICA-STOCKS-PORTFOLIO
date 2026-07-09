'use client'

export const dynamic = 'force-dynamic'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import styles from './page.module.css'

export default function LoginPage() {
  const [isSignUp, setIsSignUp] = useState(false)
  const [firstName, setFirstName] = useState('')
  const [lastName,  setLastName]  = useState('')
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
          data: {
            first_name: firstName.trim(),
            last_name:  lastName.trim(),
          },
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
    setFirstName('')
    setLastName('')
    setError('')
    setMessage('')
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.logoWrap}>
          <div className={styles.logoIcon}>
            <svg width="38" height="38" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
              <polyline points="4,38 14,28 24,32 34,14 44,8" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round"/>
              <circle cx="44" cy="8" r="3.5" fill="currentColor"/>
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

        {isSignUp && (
          <div className={styles.nameRow}>
            <div className={styles.field}>
              <label className={styles.label} htmlFor="firstName">First Name</label>
              <input
                id="firstName"
                className={styles.input}
                type="text"
                placeholder="Jane"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                required={isSignUp}
                autoComplete="given-name"
              />
            </div>
            <div className={styles.field}>
              <label className={styles.label} htmlFor="lastName">Last Name</label>
              <input
                id="lastName"
                className={styles.input}
                type="text"
                placeholder="Doe"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                autoComplete="family-name"
              />
            </div>
          </div>
        )}

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
