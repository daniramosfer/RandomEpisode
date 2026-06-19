import prisma from './prisma'

export interface PlexLibrary {
  key: string
  title: string
  type: string
}

export interface PlexShow {
  ratingKey: string
  title: string
  thumb: string
  year: number
  childCount: number // Number of seasons
  leafCount: number // Number of episodes
}

export interface PlexEpisode {
  ratingKey: string
  parentRatingKey: string // Season
  grandparentRatingKey: string // Show
  title: string
  grandparentTitle: string // Show Title
  parentIndex: number // Season Number
  index: number // Episode Number
  summary: string
  thumb: string
}

export interface PlexHomeUser {
  id: number
  uuid: string
  title: string
  thumb: string
  restricted: boolean
  admin: boolean
}

const getPlexConfig = async () => {
  const settings = await prisma.settings.findFirst()
  if (!settings || !settings.plexUrl || !settings.plexToken) {
    throw new Error('Plex is not configured')
  }
  
  // Clean up URL
  let url = settings.plexUrl.trim()
  if (url.endsWith('/')) {
    url = url.slice(0, -1)
  }
  return { url, token: settings.plexToken.trim() }
}

const fetchFromPlex = async (endpoint: string, customToken?: string) => {
  const { url, token } = await getPlexConfig()
  const sep = endpoint.includes('?') ? '&' : '?'
  const finalToken = customToken || token
  
  const res = await fetch(`${url}${endpoint}${sep}X-Plex-Token=${finalToken}`, {
    headers: {
      'Accept': 'application/json'
    },
    // We want fresh data from Plex
    cache: 'no-store'
  })

  if (!res.ok) {
    throw new Error(`Plex API error: ${res.status} ${res.statusText}`)
  }

  return res.json()
}

export const testPlexConnection = async (testUrl: string, testToken: string) => {
  let url = testUrl.trim()
  if (url.endsWith('/')) {
    url = url.slice(0, -1)
  }
  const res = await fetch(`${url}/?X-Plex-Token=${testToken.trim()}`, {
    headers: {
      'Accept': 'application/json'
    }
  })
  if (!res.ok) {
    throw new Error('Failed to connect to Plex')
  }
  return res.json()
}

export interface PlexMovie {
  ratingKey: string
  title: string
  thumb: string
  year?: number
  summary?: string
  Genre?: { tag: string }[]
}

export const getShowLibraries = async (customToken?: string): Promise<PlexLibrary[]> => {
  const data = await fetchFromPlex('/library/sections', customToken)
  const directories = data.MediaContainer.Directory || []
  return directories.filter((dir: any) => dir.type === 'show')
}

export const getMovieLibraries = async (customToken?: string): Promise<PlexLibrary[]> => {
  const data = await fetchFromPlex('/library/sections', customToken)
  const directories = data.MediaContainer.Directory || []
  return directories.filter((dir: any) => dir.type === 'movie')
}

export const getShowsInLibrary = async (libraryKey: string, customToken?: string): Promise<PlexShow[]> => {
  const data = await fetchFromPlex(`/library/sections/${libraryKey}/all`, customToken)
  return data.MediaContainer.Metadata || []
}

export const getMoviesInLibrary = async (libraryKey: string, customToken?: string): Promise<PlexMovie[]> => {
  const data = await fetchFromPlex(`/library/sections/${libraryKey}/all`, customToken)
  return data.MediaContainer.Metadata || []
}

export const getAllEpisodesForShow = async (showRatingKey: string, customToken?: string): Promise<PlexEpisode[]> => {
  const data = await fetchFromPlex(`/library/metadata/${showRatingKey}/allLeaves`, customToken)
  return data.MediaContainer.Metadata || []
}

export const getPlexHomeUsers = async (): Promise<PlexHomeUser[]> => {
  const { token } = await getPlexConfig()
  const res = await fetch(`https://plex.tv/api/v2/home/users`, {
    headers: {
      'Accept': 'application/json',
      'X-Plex-Token': token,
      'X-Plex-Client-Identifier': 'RandomEpisodeApp'
    },
    cache: 'no-store'
  })
  if (!res.ok) return []
  const data = await res.json()
  return data.users || []
}

export const switchPlexUser = async (userUuid: string): Promise<string> => {
  const { token } = await getPlexConfig()
  const res = await fetch(`https://plex.tv/api/v2/home/users/${userUuid}/switch`, {
    method: 'POST',
    headers: {
      'Accept': 'application/json',
      'X-Plex-Token': token,
      'X-Plex-Client-Identifier': 'RandomEpisodeApp'
    },
    cache: 'no-store'
  })
  if (!res.ok) throw new Error('Failed to switch user')
  const data = await res.json()
  return data.authToken
}
