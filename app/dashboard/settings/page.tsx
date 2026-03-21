import { sql } from '@/lib/db'
import { SettingsClient } from '@/components/dashboard/settings-client'

const DEFAULT_SETTINGS = {
  company_name: 'KRYROS',
  support_phone: '+260 966 423 719',
  support_email: 'kryrosmobile@gmail.com',
}

async function getSettings() {
  const rows = await sql`SELECT key, value FROM settings`
  
  const settings = { ...DEFAULT_SETTINGS }
  
  for (const row of rows) {
    if (row.key in settings) {
      (settings as Record<string, string>)[row.key] = row.value
    }
  }
  
  return settings
}

export default async function SettingsPage() {
  const settings = await getSettings()

  return <SettingsClient initialSettings={settings} />
}
