import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

async function test() {
  const settings = await prisma.settings.findFirst()
  if (!settings) return console.log('no settings')

  const res = await fetch('https://plex.tv/api/v2/users', {
    headers: {
      'Accept': 'application/json',
      'X-Plex-Token': settings.plexToken,
      'X-Plex-Client-Identifier': 'RandomEpisodeApp'
    }
  })
  const text = await res.text()
  console.log(res.status)
  console.log(text.substring(0, 500))
}
test()
