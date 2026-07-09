'use client'

import Link from 'next/link'
import styles from './BottomNav.module.css'

export type NavTab = 'portfolio' | 'news' | 'markets' | 'experts' | 'menu'

interface Props { active: NavTab }

const NAV: { id: NavTab; href: string; label: string; path: string }[] = [
  {
    id: 'portfolio', href: '/portfolio', label: 'Portfolio',
    path: 'M20 6h-4V4c0-1.11-.89-2-2-2h-4c-1.11 0-2 .89-2 2v2H4c-1.11 0-1.99.89-1.99 2L2 19c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V8c0-1.11-.89-2-2-2zm-6 0h-4V4h4v2z',
  },
  {
    id: 'news', href: '/news', label: 'News',
    path: 'M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-5 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z',
  },
  {
    id: 'markets', href: '/markets', label: 'Markets',
    path: 'M5 9.2h3V19H5V9.2zM10.6 5h2.8v14h-2.8V5zm5.6 8H19v6h-2.8v-6z',
  },
  {
    id: 'experts', href: '/experts', label: 'Experts',
    path: 'M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z',
  },
  {
    id: 'menu', href: '/menu', label: 'Menu',
    path: 'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 14.5v-9l6 4.5-6 4.5z',
  },
]

export default function BottomNav({ active }: Props) {
  return (
    <nav className={styles.nav}>
      <div className={styles.sidebarHeader}>
        <div className={styles.sidebarIcon}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
            <path d="M5 9.2h3V19H5V9.2zM10.6 5h2.8v14h-2.8V5zm5.6 8H19v6h-2.8v-6z"/>
          </svg>
        </div>
        <span className={styles.sidebarName}>Danica Portfolio</span>
      </div>
      {NAV.map((item) => (
        <Link
          key={item.id}
          href={item.href}
          className={`${styles.item} ${active === item.id ? styles.activeItem : ''}`}
        >
          <svg width="21" height="21" viewBox="0 0 24 24" fill="currentColor">
            <path d={item.path} />
          </svg>
          <span>{item.label}</span>
        </Link>
      ))}
    </nav>
  )
}
