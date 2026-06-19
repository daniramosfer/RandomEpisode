import { getSettings, getHistory, getHistoryStats, clearWatchedHistory, getMovieHistory } from '@/app/actions'
import Link from 'next/link'
import { redirect } from 'next/navigation'

export const dynamic = 'force-dynamic'

export default async function HistoryPage() {
  const settings = await getSettings()
  if (!settings || !settings.plexUrl || !settings.plexToken) {
    redirect('/settings')
  }

  const historyRes = await getHistory()
  const statsRes = await getHistoryStats()
  const movieHistoryRes = await getMovieHistory()

  const history = historyRes.success ? historyRes.history : []
  const stats = statsRes.success ? statsRes.stats : []
  const totalCount = statsRes.success ? statsRes.totalCount : 0
  const movieHistory = movieHistoryRes.success ? movieHistoryRes.history : []

  let plexUrl = settings.plexUrl.trim()
  if (plexUrl.endsWith('/')) {
    plexUrl = plexUrl.slice(0, -1)
  }

  const plexMachineId = settings.plexMachineId

  const getPlexWebUrl = (ratingKey: string) => {
    const encodedKey = encodeURIComponent(`/library/metadata/${ratingKey}`);
    return `https://app.plex.tv/desktop/#!/server/${plexMachineId}/details?key=${encodedKey}`
  }

  const getPlexAppUrl = (ratingKey: string) => {
    return `plex://play/?metadataKey=/library/metadata/${ratingKey}`
  }

  // Calculate max count for the bar chart scaling
  const maxCount = stats.length > 0 ? Math.max(...stats.map((s: any) => s.count)) : 1

  return (
    <div>
      <h1 style={{ marginBottom: '2rem' }}>Tu Historial</h1>

      <div className="glass-panel" style={{ marginBottom: '3rem' }}>
        <h2 style={{ marginBottom: '1rem' }}>Estadísticas</h2>
        <p style={{ color: 'var(--text-muted)', marginBottom: '2rem', fontSize: '1.2rem' }}>
          Total de capítulos aleatorios vistos: <strong style={{ color: 'var(--primary-color)' }}>{totalCount}</strong>
        </p>

        {stats.length > 0 ? (
          <div>
            <h3 style={{ marginBottom: '1rem', fontSize: '1.1rem' }}>Capítulos vistos por Serie</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {stats.map((stat: any, idx: number) => (
                <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <div style={{ width: '150px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', fontSize: '0.9rem' }}>
                    {stat.showTitle}
                  </div>
                  <div style={{ flexGrow: 1, background: 'rgba(0,0,0,0.3)', height: '24px', borderRadius: '4px', overflow: 'hidden' }}>
                    <div style={{ 
                      width: `${(stat.count / maxCount) * 100}%`, 
                      background: 'var(--primary-color)', 
                      height: '100%',
                      transition: 'width 1s ease-out'
                    }}></div>
                  </div>
                  <div style={{ width: '30px', textAlign: 'right', fontWeight: 'bold' }}>
                    {stat.count}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <p>No hay estadísticas disponibles aún.</p>
        )}
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h2>Últimos Capítulos</h2>
        <form action={clearWatchedHistory}>
          <button type="submit" className="btn btn-secondary" style={{ padding: '0.5rem 1rem', fontSize: '0.9rem' }}>
            Borrar Todo el Historial
          </button>
        </form>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '3rem' }}>
        {history.length > 0 ? history.map((ep: any) => (
          <div key={ep.id + ep.watchedAt.toString()} className="glass-panel" style={{ padding: '1rem', display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
            {ep.thumb ? (
              <img 
                src={`${plexUrl}${ep.thumb}?X-Plex-Token=${settings.plexToken}`} 
                alt={ep.title}
                style={{ width: '120px', height: '80px', objectFit: 'cover', borderRadius: '8px', flexShrink: 0 }}
              />
            ) : (
              <div style={{ width: '120px', height: '80px', background: 'rgba(255,255,255,0.05)', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <span style={{ fontSize: '2rem' }}>📺</span>
              </div>
            )}
            
            <div style={{ flexGrow: 1 }}>
              <div style={{ fontSize: '1.2rem', fontWeight: 'bold', marginBottom: '0.2rem' }}>{ep.title}</div>
              <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                {ep.showTitle ? `${ep.showTitle} - ` : ''}
                {ep.season && ep.episode ? `T${ep.season} E${ep.episode}` : 'Sin datos de temporada'}
              </div>
              <div style={{ color: 'rgba(255,255,255,0.3)', fontSize: '0.8rem', marginTop: '0.5rem' }}>
                Visto el {new Date(ep.watchedAt).toLocaleString()}
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', flexShrink: 0 }}>
              <a href={getPlexWebUrl(ep.id)} target="_blank" rel="noreferrer" className="btn" style={{ padding: '0.5rem 1rem', fontSize: '0.9rem' }}>
                Plex Web
              </a>
              <a href={getPlexAppUrl(ep.id)} className="btn btn-secondary" style={{ padding: '0.5rem 1rem', fontSize: '0.9rem' }}>
                Plex App
              </a>
            </div>
          </div>
        )) : (
          <p style={{ color: 'var(--text-muted)' }}>Aún no has reproducido ningún capítulo.</p>
        )}
      </div>

      <h2 style={{ marginBottom: '1.5rem' }}>Últimas Películas</h2>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '2rem' }}>
        {movieHistory.length > 0 ? movieHistory.map((m: any) => (
          <div key={m.id + m.watchedAt.toString()} className="glass-panel" style={{ padding: '1rem', display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
            {m.thumb ? (
              <img 
                src={`${plexUrl}${m.thumb}?X-Plex-Token=${settings.plexToken}`} 
                alt={m.title}
                style={{ width: '80px', height: '120px', objectFit: 'cover', borderRadius: '8px', flexShrink: 0 }}
              />
            ) : (
              <div style={{ width: '80px', height: '120px', background: 'rgba(255,255,255,0.05)', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <span style={{ fontSize: '2rem' }}>🎬</span>
              </div>
            )}
            
            <div style={{ flexGrow: 1 }}>
              <div style={{ fontSize: '1.2rem', fontWeight: 'bold', marginBottom: '0.2rem' }}>{m.title}</div>
              <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                {m.year ? `Año ${m.year}` : 'Sin año'}
              </div>
              <div style={{ color: 'rgba(255,255,255,0.3)', fontSize: '0.8rem', marginTop: '0.5rem' }}>
                Vista el {new Date(m.watchedAt).toLocaleString()}
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', flexShrink: 0 }}>
              <a href={getPlexWebUrl(m.id)} target="_blank" rel="noreferrer" className="btn" style={{ padding: '0.5rem 1rem', fontSize: '0.9rem' }}>
                Plex Web
              </a>
              <a href={getPlexAppUrl(m.id)} className="btn btn-secondary" style={{ padding: '0.5rem 1rem', fontSize: '0.9rem' }}>
                Plex App
              </a>
            </div>
          </div>
        )) : (
          <p style={{ color: 'var(--text-muted)' }}>Aún no has reproducido ninguna película aleatoria.</p>
        )}
      </div>
    </div>
  )
}
