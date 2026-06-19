'use client'

import { useState } from 'react'
import { saveSettings, clearWatchedHistory } from '@/app/actions'

export default function SettingsForm({ initialUrl, initialToken }: { initialUrl: string, initialToken: string }) {
  const [url, setUrl] = useState(initialUrl)
  const [token, setToken] = useState(initialToken)
  const [status, setStatus] = useState({ loading: false, message: '', error: false })

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setStatus({ loading: true, message: 'Probando conexión...', error: false })
    
    const res = await saveSettings(url, token)
    if (res.success) {
      setStatus({ loading: false, message: '¡Conectado y guardado correctamente!', error: false })
    } else {
      setStatus({ loading: false, message: res.error || 'Error de conexión', error: true })
    }
  }

  const handleClear = async () => {
    if (!confirm('¿Seguro que quieres borrar el historial de capítulos vistos?')) return
    setStatus({ loading: true, message: 'Borrando historial...', error: false })
    try {
      await clearWatchedHistory()
      setStatus({ loading: false, message: 'Historial borrado.', error: false })
    } catch (e) {
      setStatus({ loading: false, message: 'Error al borrar', error: true })
    }
  }

  return (
    <div className="glass-panel" style={{ maxWidth: '600px', margin: '0 auto' }}>
      <h2>Configuración de Plex</h2>
      
      <form onSubmit={handleSave}>
        <div className="form-group">
          <label className="label">URL del Servidor Plex</label>
          <input 
            type="text" 
            className="input" 
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="http://192.168.1.100:32400"
            required
          />
        </div>

        <div className="form-group">
          <label className="label">Plex Token</label>
          <input 
            type="password" 
            className="input" 
            value={token}
            onChange={(e) => setToken(e.target.value)}
            placeholder="xxxxxxxxxxxxxxxxx"
            required
          />
        </div>

        {status.message && (
          <div style={{ padding: '1rem', marginBottom: '1rem', borderRadius: '4px', background: status.error ? 'rgba(255,0,0,0.2)' : 'rgba(0,255,0,0.2)', color: status.error ? '#ff8888' : '#88ff88' }}>
            {status.message}
          </div>
        )}

        <div className="actions">
          <button type="submit" className="btn" disabled={status.loading}>
            {status.loading ? 'Guardando...' : 'Guardar y Probar'}
          </button>
          <button type="button" className="btn btn-secondary" onClick={handleClear} disabled={status.loading}>
            Borrar Historial
          </button>
        </div>
      </form>

      <div className="guide-box">
        <h3>¿Cómo obtener tu Plex Token?</h3>
        <p>1. Abre la aplicación web de Plex en tu navegador e inicia sesión.</p>
        <p>2. Ve a cualquier película o episodio en tu biblioteca y pulsa sobre él para ver los detalles.</p>
        <p>3. Pulsa en el menú de los 3 puntos (Más...) arriba a la derecha y selecciona <strong>"Obtener información"</strong>.</p>
        <p>4. En la ventana que aparece, pulsa abajo a la izquierda en <strong>"Ver XML"</strong>.</p>
        <p>5. Se abrirá una nueva pestaña. Mira la URL en tu navegador y copia el valor que hay justo después de <code>X-Plex-Token=</code>.</p>
        <p>Ejemplo: <code>...&X-Plex-Token=<strong>abc123xyz</strong></code></p>
      </div>
    </div>
  )
}
