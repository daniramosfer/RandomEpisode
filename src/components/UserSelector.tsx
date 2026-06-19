'use client'

import { useState, useRef, useEffect } from 'react'
import { switchUser, logoutUser } from '@/app/actions'

export default function UserSelector({ users, activeUserId }: { users: any[], activeUserId: string }) {
  const [loading, setLoading] = useState(false)
  const [isOpen, setIsOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  if (!users || users.length === 0) return null

  const activeUser = users.find(u => u.id.toString() === activeUserId) || users.find(u => u.admin) || users[0]

  const handleSwitch = async (selectedId: string) => {
    setIsOpen(false)
    if (selectedId === 'logout') {
      await logoutUser()
      return
    }

    const targetUser = users.find(u => u.id.toString() === selectedId)
    if (!targetUser) return

    setLoading(true)
    await switchUser(targetUser.uuid, targetUser.id.toString())
    setLoading(false)
  }

  return (
    <div style={{ position: 'relative' }} ref={menuRef}>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        disabled={loading}
        style={{ 
          display: 'flex', alignItems: 'center', gap: '0.8rem', 
          background: 'rgba(255,255,255,0.1)', border: 'none', 
          padding: '0.5rem 1rem', borderRadius: '50px', cursor: 'pointer',
          color: 'white', fontSize: '1rem', transition: 'background 0.2s'
        }}
      >
        {activeUser?.thumb && (
          <img 
            src={activeUser.thumb} 
            alt="Avatar" 
            style={{ width: '32px', height: '32px', borderRadius: '50%' }} 
          />
        )}
        <span style={{ fontWeight: '500' }}>{activeUser.title}</span>
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ transform: isOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }}>
          <polyline points="6 9 12 15 18 9"></polyline>
        </svg>
      </button>

      {isOpen && (
        <div style={{
          position: 'absolute', top: '120%', right: '0', 
          background: '#1a1a1a', border: '1px solid rgba(255,255,255,0.1)',
          borderRadius: '12px', padding: '0.5rem', minWidth: '200px',
          boxShadow: '0 10px 30px rgba(0,0,0,0.5)', zIndex: 100,
          display: 'flex', flexDirection: 'column', gap: '4px'
        }}>
          {users.map(u => (
            <button 
              key={u.id} 
              onClick={() => handleSwitch(u.id.toString())}
              style={{
                display: 'flex', alignItems: 'center', gap: '1rem',
                width: '100%', padding: '0.8rem 1rem', borderRadius: '8px',
                background: u.id.toString() === activeUser.id.toString() ? 'rgba(229, 9, 20, 0.2)' : 'transparent',
                border: 'none', color: 'white', textAlign: 'left', cursor: 'pointer',
                fontSize: '1rem'
              }}
            >
              {u.thumb && <img src={u.thumb} style={{ width: '28px', height: '28px', borderRadius: '50%' }} alt="" />}
              {u.title}
            </button>
          ))}
          <div style={{ height: '1px', background: 'rgba(255,255,255,0.1)', margin: '0.5rem 0' }}></div>
          <button 
            onClick={() => handleSwitch('logout')}
            style={{
              width: '100%', padding: '0.8rem 1rem', borderRadius: '8px',
              background: 'transparent', border: 'none', color: '#ff8888', 
              textAlign: 'left', cursor: 'pointer', fontSize: '1rem'
            }}
          >
            Cerrar sesión
          </button>
        </div>
      )}
    </div>
  )
}
