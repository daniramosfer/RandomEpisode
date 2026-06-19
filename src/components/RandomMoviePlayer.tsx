'use client'

import { PlexMovie } from '@/lib/plex'

export default function RandomMoviePlayer({ 
  movie, 
  plexUrl, 
  plexToken, 
  plexMachineId, 
  onRetry,
  isFavorite,
  onToggleFavorite
}: { 
  movie: PlexMovie, 
  plexUrl: string, 
  plexToken: string, 
  plexMachineId: string, 
  onRetry: () => void,
  isFavorite: boolean,
  onToggleFavorite: () => void
}) {
  
  const getPlexWebUrl = (ratingKey: string) => {
    const encodedKey = encodeURIComponent(`/library/metadata/${ratingKey}`);
    return `https://app.plex.tv/desktop/#!/server/${plexMachineId}/details?key=${encodedKey}`
  }

  const getPlexAppUrl = (ratingKey: string) => {
    return `plex://play/?metadataKey=/library/metadata/${ratingKey}`
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
      {/* Poster */}
      <div style={{ width: '100%', maxWidth: '250px', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 8px 24px rgba(0,0,0,0.5)' }}>
        <img 
          src={`${plexUrl}${movie.thumb}?X-Plex-Token=${plexToken}`} 
          alt={movie.title} 
          style={{ width: '100%', height: 'auto', display: 'block' }}
        />
      </div>

      {/* Título y Favorito */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', width: '100%' }}>
        <h2 style={{ margin: 0, fontSize: '1.4rem', textAlign: 'center', wordBreak: 'break-word' }}>{movie.title}</h2>
        <button 
          onClick={onToggleFavorite}
          style={{
            background: 'transparent',
            border: 'none',
            cursor: 'pointer',
            fontSize: '1.8rem',
            color: isFavorite ? 'var(--primary-color)' : 'rgba(255,255,255,0.5)',
            transition: 'transform 0.2s',
            padding: '0 0.5rem'
          }}
          onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.1)'}
          onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
        >
          {isFavorite ? '♥' : '♡'}
        </button>
      </div>

      {/* Botones Plex */}
      <div style={{ display: 'flex', gap: '1rem', width: '100%', justifyContent: 'center', flexWrap: 'wrap' }}>
        <a href={getPlexWebUrl(movie.ratingKey)} target="_blank" rel="noreferrer" className="btn" style={{ flexGrow: 1, textAlign: 'center' }}>
          Plex Web
        </a>
        <a href={getPlexAppUrl(movie.ratingKey)} className="btn btn-secondary" style={{ flexGrow: 1, textAlign: 'center' }}>
          Plex App
        </a>
      </div>

      {/* Botón Reintentar */}
      <div style={{ width: '100%', marginTop: '0.5rem' }}>
        <button className="btn" onClick={onRetry} style={{ width: '100%', background: 'rgba(255,255,255,0.1)', color: 'white' }}>
          Elegir Otra
        </button>
      </div>
    </div>
  )
}
