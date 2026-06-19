'use client'

import { useState } from 'react'
import { pickRandomEpisode } from '@/app/actions'

export default function RandomEpisodePlayer({ showId, plexUrl, plexToken, plexMachineId }: { showId: string, plexUrl: string, plexToken: string, plexMachineId: string }) {
  const [episode, setEpisode] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handlePickRandom = async () => {
    setLoading(true)
    setError('')
    setEpisode(null)
    const res = await pickRandomEpisode(showId)
    if (res.success && res.episode) {
      setEpisode(res.episode)
    } else {
      setError(res.error || 'Error al obtener episodio')
    }
    setLoading(false)
  }

  // Helper function to build Plex Web URL
  const getPlexWebUrl = (ratingKey: string) => {
    // Usamos app.plex.tv que es la forma más fiable de abrir Plex Web, y encodeamos el 'key'
    const encodedKey = encodeURIComponent(`/library/metadata/${ratingKey}`);
    return `https://app.plex.tv/desktop/#!/server/${plexMachineId}/details?key=${encodedKey}`
  }

  const getPlexAppUrl = (ratingKey: string) => {
    return `plex://play/?metadataKey=/library/metadata/${ratingKey}`
  }

  return (
    <div className="glass-panel" style={{ marginTop: '2rem' }}>
      <div style={{ textAlign: 'center' }}>
        <button className="btn" onClick={handlePickRandom} disabled={loading} style={{ fontSize: '1.2rem', padding: '1rem 2rem' }}>
          {loading ? 'Buscando episodio...' : 'Conseguir Capítulo Aleatorio'}
        </button>
        {error && <p style={{ color: '#ff8888', marginTop: '1rem' }}>{error}</p>}
      </div>

      {episode && (
        <div className="episode-detail">
          <div className="episode-poster">
            <img 
              src={`${plexUrl}${episode.thumb || episode.parentThumb || episode.grandparentThumb}?X-Plex-Token=${plexToken}`} 
              alt={episode.title} 
            />
          </div>
          <div className="episode-info">
            <h2>{episode.title}</h2>
            <div className="episode-meta">
              Temporada {episode.parentIndex} • Episodio {episode.index}
            </div>
            <p className="episode-summary">{episode.summary || 'Sin sinopsis disponible.'}</p>
            
            <div className="actions" style={{ marginTop: '2rem' }}>
              <a href={getPlexWebUrl(episode.ratingKey)} target="_blank" rel="noreferrer" className="btn">
                Abrir en Plex Web
              </a>
              <a href={getPlexAppUrl(episode.ratingKey)} className="btn btn-secondary">
                Abrir en la App
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
