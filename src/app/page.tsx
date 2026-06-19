import { getSettings, fetchLibraries, fetchShows, getFavorites, fetchMovieLibraries } from './actions'
import Link from 'next/link'
import ShowCatalog from '@/components/ShowCatalog'
import MovieCatalog from '@/components/MovieCatalog'

export const dynamic = 'force-dynamic'

export default async function Home({ searchParams }: { searchParams: Promise<{ mode?: string }> }) {
  const params = await searchParams
  const settings = await getSettings()
  
  if (!settings || !settings.plexUrl || !settings.plexToken) {
    return (
      <div className="glass-panel" style={{ textAlign: 'center', padding: '4rem 2rem' }}>
        <h2>Bienvenido a RandomEpisode</h2>
        <p style={{ margin: '1rem 0 2rem', color: 'var(--text-muted)' }}>
          Para empezar, necesitas conectar tu servidor Plex.
        </p>
        <Link href="/settings" className="btn">Configurar Plex</Link>
      </div>
    )
  }

  // Ensure plex URL does not have trailing slash
  let plexUrl = settings.plexUrl.trim()
  if (plexUrl.endsWith('/')) {
    plexUrl = plexUrl.slice(0, -1)
  }

  const mode = params.mode || 'shows'

  if (mode === 'movies') {
    const movieLibsRes = await fetchMovieLibraries()
    if (!movieLibsRes.success || !movieLibsRes.libraries) {
      return (
        <div className="glass-panel" style={{ textAlign: 'center' }}>
          <h2>Error al conectar con Plex</h2>
          <p style={{ color: '#ff8888', margin: '1rem 0' }}>{movieLibsRes.error}</p>
        </div>
      )
    }

    // Get movie favorites
    const { getFavoriteMovies } = await import('./actions')
    const favsRes = await getFavoriteMovies()
    const initialFavorites = favsRes.success ? favsRes.favorites : []

    return (
      <div>
        <MovieCatalog 
          libraries={movieLibsRes.libraries}
          initialFavorites={initialFavorites}
          plexUrl={plexUrl} 
          plexToken={settings.plexToken} 
          plexMachineId={settings.plexMachineId}
        />
      </div>
    )
  }

  // Modo shows (por defecto)
  const libsRes = await fetchLibraries()
  if (!libsRes.success || !libsRes.libraries) {
    return (
      <div className="glass-panel" style={{ textAlign: 'center' }}>
        <h2>Error al conectar con Plex</h2>
        <p style={{ color: '#ff8888', margin: '1rem 0' }}>{libsRes.error}</p>
        <Link href="/settings" className="btn">Revisar Ajustes</Link>
      </div>
    )
  }

  // Fetch shows from all show libraries
  const allShows = []
  for (const lib of libsRes.libraries) {
    const showsRes = await fetchShows(lib.key)
    if (showsRes.success && showsRes.shows) {
      allShows.push(...showsRes.shows)
    }
  }

  const favsRes = await getFavorites()
  const initialFavorites = favsRes.success ? favsRes.favorites : []

  return (
    <div>
      <ShowCatalog 
        shows={allShows} 
        initialFavorites={initialFavorites} 
        plexUrl={plexUrl} 
        plexToken={settings.plexToken} 
        plexMachineId={settings.plexMachineId}
      />
    </div>
  )
}
