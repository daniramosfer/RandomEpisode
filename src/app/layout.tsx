import type { Metadata } from "next";
import "./globals.css";
import Link from "next/link";

export const metadata: Metadata = {
  title: "RandomEpisode for Plex",
  description: "Self-hosted webapp to play random episodes from your Plex server",
};

import { getHomeUsers, getActiveUser } from '@/app/actions'
import UserSelector from '@/components/UserSelector'

import ModeSelector from '@/components/ModeSelector'

export const dynamic = 'force-dynamic'

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const usersRes = await getHomeUsers()
  const users = (usersRes.success && usersRes.users) ? usersRes.users : []
  const { userId } = await getActiveUser()

  return (
    <html lang="es">
      <body>
        <nav style={{ display: 'flex', alignItems: 'center' }}>
          <ModeSelector />
          <div style={{ flexGrow: 1 }}></div>
          <div className="nav-links" style={{ display: 'flex', gap: '1rem', marginRight: '1rem', alignItems: 'center' }}>
            <Link href="/" className="nav-link">Inicio</Link>
            <Link href="/history" className="nav-link">Historial</Link>
            <Link href="/settings" className="nav-link">Ajustes</Link>
          </div>
          <UserSelector users={users} activeUserId={userId} />
        </nav>
        <main className="container">
          {children}
        </main>
      </body>
    </html>
  );
}
