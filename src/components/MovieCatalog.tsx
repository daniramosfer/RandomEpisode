'use client'

import { useState, useEffect, useMemo } from 'react'
import { PlexLibrary, PlexMovie } from '@/lib/plex'
import { fetchMovies, pickRandomMovie, toggleFavoriteMovie } from '@/app/actions'
import RandomMoviePlayer from './RandomMoviePlayer'
import CustomSelect from './CustomSelect'

interface MovieCatalogProps {
  libraries: PlexLibrary[]
  initialFavorites: any[]
  plexUrl: string
  plexToken: string
  plexMachineId: string
}

export default function MovieCatalog({ libraries, initialFavorites, plexUrl, plexToken, plexMachineId }: MovieCatalogProps) {
  const [selectedLibrary, setSelectedLibrary] = useState<string>(libraries.length > 0 ? libraries[0].key : '')
  const [movies, setMovies] = useState<PlexMovie[]>([])
  const [favorites, setFavorites] = useState(initialFavorites.map(f => f.id))
  const [loading, setLoading] = useState(false)

  // Filtros
  const [selectedGenre, setSelectedGenre] = useState<string>('')
  const [selectedDecade, setSelectedDecade] = useState<string>('')

  // Estado del player
  const [selectedRandomMovie, setSelectedRandomMovie] = useState<PlexMovie | null>(null)

  useEffect(() => {
    if (!selectedLibrary) return
    let isMounted = true

    const loadMovies = async () => {
      setLoading(true)
      setSelectedRandomMovie(null)
      const res = await fetchMovies(selectedLibrary)
      if (isMounted) {
        if (res.success && res.movies) {
          setMovies(res.movies)
        } else {
          setMovies([])
        }
        setLoading(false)
      }
    }
    loadMovies()

    return () => { isMounted = false }
  }, [selectedLibrary])

  // Obtener géneros y décadas únicas
  const genres = useMemo(() => {
    const allGenres = new Set<string>()
    movies.forEach(m => {
      if (m.Genre) m.Genre.forEach(g => allGenres.add(g.tag))
    })
    return Array.from(allGenres).sort()
  }, [movies])

  const decades = useMemo(() => {
    const allDecades = new Set<string>()
    movies.forEach(m => {
      if (m.year) {
        const decade = Math.floor(m.year / 10) * 10
        allDecades.add(`${decade}s`)
      }
    })
    return Array.from(allDecades).sort().reverse()
  }, [movies])

  // Filtrar películas
  const filteredMovies = useMemo(() => {
    return movies.filter(m => {
      if (selectedGenre) {
        const hasGenre = m.Genre && m.Genre.some(g => g.tag === selectedGenre)
        if (!hasGenre) return false
      }
      if (selectedDecade) {
        if (!m.year) return false
        const decadeStr = `${Math.floor(m.year / 10) * 10}s`
        if (decadeStr !== selectedDecade) return false
      }
      return true
    })
  }, [movies, selectedGenre, selectedDecade])

  const favoriteMoviesObjects = useMemo(() => {
    return movies.filter(m => favorites.includes(m.ratingKey))
  }, [movies, favorites])

  // Preparar columnas para el collage decorativo
  const collageColumns = useMemo(() => {
    if (movies.length === 0) return []
    const numCols = 10
    const cols: PlexMovie[][] = Array.from({ length: numCols }, () => [])
    
    // Mezclamos un poco y tomamos un grupo para que no sea super pesado
    const shuffled = [...movies].sort(() => 0.5 - Math.random()).slice(0, 150)
    shuffled.forEach((m, i) => {
      cols[i % numCols].push(m)
    })
    
    return cols
  }, [movies])

  const handlePickRandomMovie = async () => {
    if (filteredMovies.length === 0) return
    const randomIndex = Math.floor(Math.random() * filteredMovies.length)
    const chosenMovie = filteredMovies[randomIndex]
    setSelectedRandomMovie(chosenMovie)
    
    // Scroll to top to see the player
    window.scrollTo({ top: 0, behavior: 'smooth' })
    
    // Guardar en el historial
    await pickRandomMovie(chosenMovie)
  }

  const toggleFav = async (movie: PlexMovie) => {
    const isFav = favorites.includes(movie.ratingKey)
    
    // Actualización optimista
    setFavorites(prev => 
      isFav ? prev.filter(id => id !== movie.ratingKey) : [...prev, movie.ratingKey]
    )
    
    await toggleFavoriteMovie(movie.ratingKey, movie.title, isFav)
  }

  return (
    <>
      <div style={{ marginBottom: '2rem', display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
        {libraries.length > 1 && (
          <CustomSelect
            value={selectedLibrary}
            onChange={setSelectedLibrary}
            placeholder="Selecciona Librería"
            options={libraries.map(lib => ({ value: lib.key, label: lib.title }))}
          />
        )}
        
        <CustomSelect
          value={selectedGenre}
          onChange={setSelectedGenre}
          placeholder="Todos los Géneros"
          options={genres.map(g => ({ value: g, label: g }))}
        />

        <CustomSelect
          value={selectedDecade}
          onChange={setSelectedDecade}
          placeholder="Todas las Décadas"
          options={decades.map(d => ({ value: d, label: d }))}
        />

        <button 
          className="btn" 
          onClick={handlePickRandomMovie} 
          disabled={filteredMovies.length === 0 || loading}
          style={{ flexGrow: 1, textAlign: 'center' }}
        >
          Random Movie
        </button>
      </div>

      {/* Fila de Favoritos */}
      {!loading && favoriteMoviesObjects.length > 0 && (
        <div style={{ marginBottom: '2rem' }}>
          <h2 style={{ fontSize: '1.2rem', marginBottom: '1rem', color: 'var(--primary-color)' }}>
            Mis Películas Favoritas
          </h2>
          <div style={{ 
            display: 'flex', 
            gap: '1rem', 
            overflowX: 'auto', 
            paddingBottom: '1rem',
            // Ocultar barra de scroll en webkit para más elegancia
            scrollbarWidth: 'none',
            msOverflowStyle: 'none'
          }}>
            {favoriteMoviesObjects.map(movie => (
              <div 
                key={movie.ratingKey} 
                style={{ 
                  minWidth: '120px', 
                  width: '120px', 
                  flexShrink: 0, 
                  cursor: 'pointer',
                  transition: 'transform 0.2s'
                }}
                onClick={() => setSelectedRandomMovie(movie)}
                onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.05)'}
                onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
              >
                {movie.thumb ? (
                  <img 
                    src={`${plexUrl}${movie.thumb}?X-Plex-Token=${plexToken}`} 
                    alt={movie.title}
                    style={{ width: '100%', borderRadius: '8px', boxShadow: '0 4px 12px rgba(0,0,0,0.3)', display: 'block' }}
                  />
                ) : (
                  <div style={{ width: '100%', height: '180px', borderRadius: '8px', background: 'rgba(255,255,255,0.1)' }}></div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {loading ? (
        <div style={{ textAlign: 'center', padding: '3rem', opacity: 0.7 }}>
          <div className="spinner"></div>
          <p>Cargando películas...</p>
        </div>
      ) : (
        <div className="movie-collage-container">
          <div className="movie-collage-wrapper">
            {collageColumns.map((col, idx) => {
              const directionClass = idx % 2 === 0 ? 'up' : 'down'
              // Duplicamos el array para que el scroll sea infinito sin saltos feos
              const doubledCol = [...col, ...col]
              
              return (
                <div key={idx} className={`movie-collage-col ${directionClass}`}>
                  {doubledCol.map((movie, mIdx) => (
                    <div key={`${movie.ratingKey}-${mIdx}`} className="movie-collage-item">
                      {movie.thumb ? (
                        <img 
                          src={`${plexUrl}${movie.thumb}?X-Plex-Token=${plexToken}`} 
                          alt=""
                          loading="lazy"
                        />
                      ) : (
                        <div style={{ width: '100%', height: '225px', background: 'rgba(255,255,255,0.05)', borderRadius: '8px' }}></div>
                      )}
                    </div>
                  ))}
                </div>
              )
            })}
          </div>

          {/* Overlay Compacto dentro del Collage */}
          {selectedRandomMovie && (
            <div 
              style={{
                position: 'absolute',
                top: 0, left: 0, right: 0, bottom: 0,
                background: 'rgba(0, 0, 0, 0.65)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 10,
                padding: '1rem',
                animation: 'fadeIn 0.3s ease-out'
              }}
              onClick={() => setSelectedRandomMovie(null)}
            >
              <div 
                style={{
                  maxWidth: '400px',
                  width: '100%',
                  background: 'var(--panel-bg)',
                  border: '1px solid var(--panel-border)',
                  borderRadius: '16px',
                  padding: '1.5rem',
                  boxShadow: '0 24px 48px rgba(0, 0, 0, 0.8)',
                  animation: 'scaleUp 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)'
                }}
                onClick={e => e.stopPropagation()}
              >
                <RandomMoviePlayer 
                  movie={selectedRandomMovie}
                  plexUrl={plexUrl}
                  plexToken={plexToken}
                  plexMachineId={plexMachineId}
                  onRetry={handlePickRandomMovie}
                  isFavorite={favorites.includes(selectedRandomMovie.ratingKey)}
                  onToggleFavorite={() => toggleFav(selectedRandomMovie)}
                />
              </div>
            </div>
          )}
        </div>
      )}
      
      {!loading && filteredMovies.length === 0 && (
        <div style={{ textAlign: 'center', padding: '3rem', opacity: 0.7 }}>
          No hay películas que coincidan con los filtros.
        </div>
      )}


    </>
  )
}
