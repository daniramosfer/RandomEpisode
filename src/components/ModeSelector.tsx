'use client'

import Link from 'next/link'
import { useSearchParams } from 'next/navigation'

export default function ModeSelector() {
  const searchParams = useSearchParams()
  const mode = searchParams.get('mode') || 'shows' // 'shows' or 'movies'

  return (
    <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
      <Link 
        href="/?mode=shows" 
        className="nav-brand"
        style={{ 
          opacity: mode === 'shows' ? 1 : 0.4, 
          transition: 'opacity 0.3s',
          textDecoration: 'none'
        }}
      >
        RandomEpisode
      </Link>
      <Link 
        href="/?mode=movies" 
        className="nav-brand"
        style={{ 
          opacity: mode === 'movies' ? 1 : 0.4, 
          transition: 'opacity 0.3s',
          textDecoration: 'none'
        }}
      >
        Randomovie
      </Link>
    </div>
  )
}
