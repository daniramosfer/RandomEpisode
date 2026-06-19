'use client'

import { useState } from 'react'
import { toggleFavorite } from '@/app/actions'
import RandomEpisodePlayer from './RandomEpisodePlayer'

interface Show {
  ratingKey: string
  title: string
  thumb: string
  year: number
  childCount: number
}

interface ShowCatalogProps {
  shows: Show[]
  initialFavorites: string[]
  plexUrl: string
  plexToken: string
  plexMachineId: string
}

export default function ShowCatalog({ shows, initialFavorites, plexUrl, plexToken, plexMachineId }: ShowCatalogProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [favorites, setFavorites] = useState<Set<string>>(new Set(initialFavorites))
  const [expandedShow, setExpandedShow] = useState<Show | null>(null)
  
  const handleToggleFavorite = async (e: React.MouseEvent, show: Show) => {
    e.stopPropagation() // prevent opening show overlay
    e.preventDefault() 
    const isFav = favorites.has(show.ratingKey)
    
    // Optimistic UI update
    const newFavs = new Set(favorites)
    if (isFav) {
      newFavs.delete(show.ratingKey)
    } else {
      newFavs.add(show.ratingKey)
    }
    setFavorites(newFavs)

    // Backend update
    await toggleFavorite(show.ratingKey, show.title, isFav)
  }

  const filteredShows = shows.filter(show => 
    show.title.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const favoriteShows = filteredShows.filter(show => favorites.has(show.ratingKey))
  const otherShows = filteredShows.filter(show => !favorites.has(show.ratingKey))

  const ShowCard = ({ show }: { show: Show }) => (
    <div 
      className="card" 
      style={{ position: 'relative', cursor: 'pointer' }}
      onClick={() => setExpandedShow(show)}
    >
      <button 
        onClick={(e) => handleToggleFavorite(e, show)}
        style={{
          position: 'absolute',
          top: '10px',
          right: '10px',
          background: 'rgba(0,0,0,0.5)',
          border: 'none',
          borderRadius: '50%',
          width: '36px',
          height: '36px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          zIndex: 10,
          color: favorites.has(show.ratingKey) ? '#ff4b4b' : '#ffffff',
          fontSize: '1.2rem',
          transition: 'transform 0.2s'
        }}
        title={favorites.has(show.ratingKey) ? "Quitar de favoritos" : "Añadir a favoritos"}
      >
        {favorites.has(show.ratingKey) ? '❤️' : '🤍'}
      </button>
      <div className="card-img-wrapper">
        <img 
          src={`${plexUrl}${show.thumb}?X-Plex-Token=${plexToken}`} 
          alt={show.title}
          className="card-img"
        />
      </div>
      <div className="card-content">
        <div className="card-title">{show.title}</div>
        <div className="card-subtitle">{show.year} • {show.childCount} Temporadas</div>
      </div>
    </div>
  )

  return (
    <>
      <div>
        <div style={{ marginBottom: '2rem', position: 'relative', maxWidth: '500px', margin: '0 auto 2rem auto' }}>
          <svg style={{ position: 'absolute', left: '1.2rem', top: '50%', transform: 'translateY(-50%)', color: 'rgba(255,255,255,0.5)' }} width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8"></circle>
            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
          </svg>
          <input 
            type="text" 
            placeholder="Buscar serie..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="input"
            style={{ width: '100%', fontSize: '1.1rem', paddingLeft: '3rem', borderRadius: '50px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}
          />
        </div>

        {favoriteShows.length > 0 && (
          <div style={{ marginBottom: '3rem' }}>
            <h2 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              ❤️ Favoritas
            </h2>
            <div className="grid">
              {favoriteShows.map(show => <ShowCard key={show.ratingKey} show={show} />)}
            </div>
            <hr style={{ marginTop: '3rem', borderColor: 'rgba(255,255,255,0.1)' }} />
          </div>
        )}

        <div>
          <h2 style={{ marginBottom: '1.5rem' }}>{favoriteShows.length > 0 ? 'Otras Series' : 'Tus Series'}</h2>
          <div className="grid">
            {otherShows.map(show => <ShowCard key={show.ratingKey} show={show} />)}
            {otherShows.length === 0 && favoriteShows.length === 0 && (
              <p>No se encontraron series con ese nombre.</p>
            )}
          </div>
        </div>
      </div>

      {expandedShow && (
        <div 
          className="overlay-backdrop"
          onClick={() => setExpandedShow(null)}
        >
          <div 
            className="overlay-content"
            onClick={(e) => e.stopPropagation()} // prevent closing when clicking inside
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', marginBottom: '1.5rem' }}>
              <img 
                src={`${plexUrl}${expandedShow.thumb}?X-Plex-Token=${plexToken}`} 
                alt={expandedShow.title}
                style={{ width: '120px', height: '180px', objectFit: 'cover', borderRadius: '8px', boxShadow: '0 4px 12px rgba(0,0,0,0.5)' }}
              />
              <div>
                <h1 style={{ marginBottom: '0.5rem', fontSize: '2rem' }}>{expandedShow.title}</h1>
                <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem' }}>{expandedShow.year} • {expandedShow.childCount} Temporadas</p>
              </div>
            </div>

            <RandomEpisodePlayer 
              showId={expandedShow.ratingKey} 
              plexUrl={plexUrl} 
              plexToken={plexToken} 
              plexMachineId={plexMachineId}
            />
          </div>
        </div>
      )}
    </>
  )
}
