'use client'

import { useState, useRef, useEffect } from 'react'

export interface SelectOption {
  value: string
  label: string
}

export default function CustomSelect({ 
  value, 
  options, 
  onChange, 
  placeholder 
}: { 
  value: string, 
  options: SelectOption[], 
  onChange: (val: string) => void,
  placeholder: string
}) {
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

  const selectedOption = options.find(o => o.value === value)

  return (
    <div style={{ position: 'relative', zIndex: isOpen ? 50 : 1 }} ref={menuRef}>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        style={{ 
          display: 'flex', alignItems: 'center', gap: '0.8rem', justifyContent: 'space-between',
          background: 'rgba(255,255,255,0.1)', border: 'none', 
          padding: '0.8rem 1.2rem', borderRadius: '50px', cursor: 'pointer',
          color: 'white', fontSize: '1rem', transition: 'background 0.2s',
          minWidth: '200px'
        }}
      >
        <span style={{ fontWeight: '500', opacity: selectedOption ? 1 : 0.7 }}>
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ transform: isOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }}>
          <polyline points="6 9 12 15 18 9"></polyline>
        </svg>
      </button>

      {isOpen && (
        <div style={{
          position: 'absolute', top: 'calc(100% + 8px)', left: '0', 
          background: '#1a1a1a', border: '1px solid rgba(255,255,255,0.1)',
          borderRadius: '12px', padding: '0.5rem', minWidth: '100%',
          boxShadow: '0 10px 30px rgba(0,0,0,0.5)', zIndex: 100,
          display: 'flex', flexDirection: 'column', gap: '4px',
          maxHeight: '300px', overflowY: 'auto'
        }}>
          <button
            onClick={() => { onChange(''); setIsOpen(false) }}
            style={{
              width: '100%', padding: '0.8rem 1rem', borderRadius: '8px',
              background: value === '' ? 'rgba(229, 9, 20, 0.2)' : 'transparent',
              border: 'none', color: 'white', textAlign: 'left', cursor: 'pointer',
              fontSize: '1rem'
            }}
          >
            {placeholder}
          </button>
          
          {options.map(o => (
            <button 
              key={o.value} 
              onClick={() => { onChange(o.value); setIsOpen(false) }}
              style={{
                width: '100%', padding: '0.8rem 1rem', borderRadius: '8px',
                background: o.value === value ? 'rgba(229, 9, 20, 0.2)' : 'transparent',
                border: 'none', color: 'white', textAlign: 'left', cursor: 'pointer',
                fontSize: '1rem'
              }}
            >
              {o.label}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
