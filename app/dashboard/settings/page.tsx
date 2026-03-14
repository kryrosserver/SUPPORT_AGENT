import { sql } from '@/lib/db'
import { SettingsClient } from '@/components/dashboard/settings-client'

const DEFAULT_SETTINGS = {
  company_name: 'KRYROS',
  support_phone: '+260 966 423 719',
  support_email: 'kryrosmobile@gmail.com',
  ai_enabled: true,
  ai_system_prompt: `You are the customer support assistant for KRYROS.

Company contact information:
Phone: +260 966 423 719
Email: kryrosmobile@gmail.com

Respond politely and clearly to customer questions.

If the customer asks to speak with a human agent, stop responding and allow a human support agent to take over.`,
  human_takeover_keywords: 'human,agent,support,help,talk to human',
}

async function getSettings() {
  const rows = await sql`SELECT key, value FROM settings`
  
  const settings = { ...DEFAULT_SETTINGS }
  
  for (const row of rows) {
    if (row.key === 'ai_enabled') {
      settings.ai_enabled = row.value === 'true'
    } else if (row.key in settings) {
      (settings as Record<string, string | boolean>)[row.key] = row.value
    }
  }
  
  return settings
}

export default async function SettingsPage() {
  const settings = await getSettings()

  return <SettingsClient initialSettings={settings} />
}
