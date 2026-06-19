import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function GET() {
  const settings = await prisma.settings.findFirst()
  if (!settings) return NextResponse.json({ error: 'No settings' })
  
  const res = await fetch('https://plex.tv/api/home/users', {
    headers: {
      'Accept': 'application/json',
      'X-Plex-Token': settings.plexToken,
      'X-Plex-Client-Identifier': 'RandomEpisode'
    }
  })
  const text = await res.text()
  return NextResponse.json({ status: res.status, body: text })
}
