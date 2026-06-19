'use server'

import prisma from '@/lib/prisma'
import { testPlexConnection, getShowLibraries, getShowsInLibrary, getAllEpisodesForShow, getPlexHomeUsers, switchPlexUser, getMovieLibraries, getMoviesInLibrary } from '@/lib/plex'
import { revalidatePath } from 'next/cache'
import { cookies } from 'next/headers'

// Helper to get active user context
export async function getActiveUser() {
  const cookieStore = await cookies()
  const userId = cookieStore.get('plexUserId')?.value || 'default'
  const userToken = cookieStore.get('plexUserToken')?.value
  return { userId, userToken }
}

export async function getSettings() {
  const settings = await prisma.settings.findFirst()
  return settings
}

export async function saveSettings(url: string, token: string) {
  try {
    // First test connection
    const data = await testPlexConnection(url, token)
    const machineId = data?.MediaContainer?.machineIdentifier || ""
    
    // Save to DB
    await prisma.settings.upsert({
      where: { id: 1 },
      update: { plexUrl: url, plexToken: token, plexMachineId: machineId },
      create: { id: 1, plexUrl: url, plexToken: token, plexMachineId: machineId }
    })
    
    revalidatePath('/')
    return { success: true }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}

export async function fetchLibraries() {
  try {
    const { userToken } = await getActiveUser()
    const libs = await getShowLibraries(userToken)
    return { success: true, libraries: libs }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}

export async function fetchShows(libraryKey: string) {
  try {
    const { userToken } = await getActiveUser()
    const shows = await getShowsInLibrary(libraryKey, userToken)
    return { success: true, shows }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}

export async function fetchMovieLibraries() {
  try {
    const { userToken } = await getActiveUser()
    const libs = await getMovieLibraries(userToken)
    return { success: true, libraries: libs }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}

export async function fetchMovies(libraryKey: string) {
  try {
    const { userToken } = await getActiveUser()
    const movies = await getMoviesInLibrary(libraryKey, userToken)
    return { success: true, movies }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}

export async function getHomeUsers() {
  try {
    const users = await getPlexHomeUsers()
    return { success: true, users }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}

export async function switchUser(userUuid: string, userId: string) {
  try {
    const token = await switchPlexUser(userUuid)
    const cookieStore = await cookies()
    cookieStore.set('plexUserId', userId, { maxAge: 60 * 60 * 24 * 365 })
    cookieStore.set('plexUserToken', token, { maxAge: 60 * 60 * 24 * 365 })
    revalidatePath('/')
    return { success: true }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}

export async function logoutUser() {
  const cookieStore = await cookies()
  cookieStore.delete('plexUserId')
  cookieStore.delete('plexUserToken')
  revalidatePath('/')
}

export async function pickRandomEpisode(showRatingKey: string) {
  try {
    const { userId, userToken } = await getActiveUser()
    // Fetch all episodes from Plex
    const episodes = await getAllEpisodesForShow(showRatingKey, userToken)
    if (episodes.length === 0) {
      return { success: false, error: 'No episodes found for this show' }
    }

    // Fetch watched episodes for this show from our local DB
    const watched = await prisma.watchedEpisode.findMany({
      where: { showId: showRatingKey, userId },
      select: { id: true, watchedAt: true }
    })
    const watchedIds = new Set(watched.map(w => w.id))

    // Filter unwatched
    const unwatched = episodes.filter(ep => !watchedIds.has(ep.ratingKey))

    let selectedEpisode = null

    if (unwatched.length === 0) {
      // If all are watched, we reset but avoid recently watched episodes (the most recent 30%)
      const sortedWatched = [...watched].sort((a, b) => b.watchedAt.getTime() - a.watchedAt.getTime())
      const excludeCount = Math.floor(episodes.length * 0.3)
      const recentlyWatchedIds = new Set(sortedWatched.slice(0, excludeCount).map(w => w.id))
      
      const eligibleEpisodes = episodes.filter(ep => !recentlyWatchedIds.has(ep.ratingKey))
      
      if (eligibleEpisodes.length > 0) {
        selectedEpisode = eligibleEpisodes[Math.floor(Math.random() * eligibleEpisodes.length)]
      } else {
        selectedEpisode = episodes[Math.floor(Math.random() * episodes.length)]
      }
    } else {
      selectedEpisode = unwatched[Math.floor(Math.random() * unwatched.length)]
    }

    // Mark as watched in local DB
    // Typecast to any to access parentThumb and grandparentThumb since they are not strongly typed
    const epData = selectedEpisode as any

    await prisma.watchedEpisode.upsert({
      where: { userId_id: { userId, id: selectedEpisode.ratingKey } },
      update: { 
        watchedAt: new Date(),
        showTitle: selectedEpisode.grandparentTitle,
        season: selectedEpisode.parentIndex,
        episode: selectedEpisode.index,
        thumb: epData.thumb || epData.parentThumb || epData.grandparentThumb
      },
      create: { 
        userId,
        id: selectedEpisode.ratingKey, 
        showId: showRatingKey, 
        title: selectedEpisode.title,
        showTitle: selectedEpisode.grandparentTitle,
        season: selectedEpisode.parentIndex,
        episode: selectedEpisode.index,
        thumb: epData.thumb || epData.parentThumb || epData.grandparentThumb
      }
    })

    return { success: true, episode: selectedEpisode }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}

export async function getWatchedStats() {
  const { userId } = await getActiveUser()
  const count = await prisma.watchedEpisode.count({ where: { userId } })
  return { count }
}

export async function clearWatchedHistory(formData?: FormData) {
  const { userId } = await getActiveUser()
  await prisma.watchedEpisode.deleteMany({ where: { userId } })
  await prisma.watchedMovie.deleteMany({ where: { userId } })
  revalidatePath('/')
  revalidatePath('/history')
}

export async function getFavorites() {
  try {
    const { userId } = await getActiveUser()
    const favs = await prisma.favoriteShow.findMany({ where: { userId } })
    return { success: true, favorites: favs.map(f => f.id) }
  } catch (error: any) {
    return { success: false, favorites: [] }
  }
}

export async function toggleFavorite(showRatingKey: string, title: string, isFavorite: boolean) {
  try {
    const { userId } = await getActiveUser()
    if (isFavorite) {
      await prisma.favoriteShow.delete({ where: { userId_id: { userId, id: showRatingKey } } })
    } else {
      await prisma.favoriteShow.create({ data: { userId, id: showRatingKey, title } })
    }
    revalidatePath('/')
    return { success: true }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}

export async function getHistory() {
  try {
    const { userId } = await getActiveUser()
    const history = await prisma.watchedEpisode.findMany({
      where: { userId },
      orderBy: { watchedAt: 'desc' },
      take: 50 // Limit to last 50
    })
    return { success: true, history }
  } catch (error: any) {
    return { success: false, history: [] }
  }
}

export async function getHistoryStats() {
  try {
    const { userId } = await getActiveUser()
    const totalCount = await prisma.watchedEpisode.count({ where: { userId } })
    
    // Group by showTitle or showId
    const grouped = await prisma.watchedEpisode.groupBy({
      by: ['showId', 'showTitle'],
      where: { userId },
      _count: {
        id: true
      },
      orderBy: {
        _count: {
          id: 'desc'
        }
      },
      take: 10 // Top 10 shows
    })

    const stats = grouped.map(g => ({
      showId: g.showId,
      showTitle: g.showTitle || 'Desconocido',
      count: g._count.id
    }))

    return { success: true, totalCount, stats }
  } catch (error: any) {
    return { success: false, totalCount: 0, stats: [] }
  }
}

// ---- Funciones para el modo Randomovie ----

export async function pickRandomMovie(movie: any) {
  try {
    const { userId } = await getActiveUser()
    // Añadimos al historial
    await prisma.watchedMovie.upsert({
      where: { userId_id: { userId, id: movie.ratingKey } },
      update: { watchedAt: new Date() },
      create: {
        userId,
        id: movie.ratingKey,
        title: movie.title,
        year: movie.year,
        thumb: movie.thumb
      }
    })
    revalidatePath('/history')
    return { success: true }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}

export async function toggleFavoriteMovie(movieId: string, title: string, isFavorite: boolean) {
  try {
    const { userId } = await getActiveUser()
    if (isFavorite) {
      await prisma.favoriteMovie.delete({ where: { userId_id: { userId, id: movieId } } })
    } else {
      await prisma.favoriteMovie.create({ data: { userId, id: movieId, title } })
    }
    revalidatePath('/')
    return { success: true }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}

export async function getFavoriteMovies() {
  try {
    const { userId } = await getActiveUser()
    const favs = await prisma.favoriteMovie.findMany({ where: { userId } })
    return { success: true, favorites: favs }
  } catch (error: any) {
    return { success: false, favorites: [] }
  }
}

export async function getMovieHistory() {
  try {
    const { userId } = await getActiveUser()
    const history = await prisma.watchedMovie.findMany({
      where: { userId },
      orderBy: { watchedAt: 'desc' },
      take: 50
    })
    return { success: true, history }
  } catch (error: any) {
    return { success: false, history: [] }
  }
}

