import { getSettings } from '@/app/actions'
import SettingsForm from '@/components/SettingsForm'

export const dynamic = 'force-dynamic'

export default async function SettingsPage() {
  const settings = await getSettings()
  
  return (
    <div>
      <h1 style={{ textAlign: 'center', marginBottom: '2rem' }}>Ajustes</h1>
      <SettingsForm 
        initialUrl={settings?.plexUrl || ''} 
        initialToken={settings?.plexToken || ''} 
      />
    </div>
  )
}
