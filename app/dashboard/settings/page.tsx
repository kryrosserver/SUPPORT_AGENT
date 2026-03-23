import { sql } from '@/lib/db'
import { getSession } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { SettingsClient } from '@/components/dashboard/settings-client'

const DEFAULT_SETTINGS = {
  company_name: 'My Company',
  support_phone: '',
  support_email: '',
}

async function getSettings(userId: number, isSuperAdmin: boolean) {
  if (isSuperAdmin) {
    // Super admin sees all settings
    const rows = await sql`SELECT user_id, key, value FROM settings`
    
    const allSettings: Record<number, Record<string, string>> = {}
    
    for (const row of rows) {
      if (!allSettings[row.user_id]) {
        allSettings[row.user_id] = { ...DEFAULT_SETTINGS }
      }
      if (row.key in DEFAULT_SETTINGS) {
        allSettings[row.user_id][row.key] = row.value
      }
    }
    
    return { type: 'super_admin', settings: allSettings }
  } else {
    // Regular user sees their own settings
    const rows = await sql`SELECT key, value FROM settings WHERE user_id = ${userId}`
    
    const settings = { ...DEFAULT_SETTINGS }
    
    for (const row of rows) {
      if (row.key in settings) {
        settings[row.key] = row.value
      }
    }
    
    return { type: 'user', settings }
  }
}

export default async function SettingsPage() {
  const session = await getSession()
  
  if (!session) {
    redirect('/login')
  }

  // Only super_admin can access full settings page
  // Regular users get their settings from the AI Control page
  if (session.role !== 'super_admin') {
    redirect('/dashboard/ai-control')
  }

  const data = await getSettings(session.id, session.role === 'super_admin')

  return <SettingsClient initialData={data} isSuperAdmin={session.role === 'super_admin'} />
}
