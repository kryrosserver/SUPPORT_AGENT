import { NextResponse } from 'next/server'
import { sql } from '@/lib/db'
import { getSession } from '@/lib/auth'

// Settings keys we support (per user)
const SETTINGS_KEYS = [
  'ai_enabled',
  'ai_system_prompt',
  'human_takeover_keywords',
  'company_name',
  'support_phone',
  'support_email',
]

export async function GET() {
  try {
    const session = await getSession()
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get settings for this user (or super_admin sees all)
    let rows
    if (session.role === 'super_admin') {
      // Super admin can see all settings (for managing companies)
      rows = await sql`
        SELECT user_id, key, value FROM settings 
        WHERE key = ANY(${SETTINGS_KEYS})
        ORDER BY user_id
      `
    } else {
      rows = await sql`
        SELECT key, value FROM settings 
        WHERE user_id = ${session.id} AND key = ANY(${SETTINGS_KEYS})
      `
    }
    
    // Convert key-value rows to object
    const settings: Record<string, string | boolean> = {
      company_name: 'My Company',
      support_phone: '',
      support_email: '',
      ai_enabled: true,
      ai_system_prompt: '',
      human_takeover_keywords: 'human,agent,support,help',
    }
    
    if (session.role === 'super_admin') {
      // For super admin, return as array of all company settings
      const allSettings: Record<string, Record<string, string | boolean>> = {}
      for (const row of rows as any[]) {
        if (!allSettings[row.user_id]) {
          allSettings[row.user_id] = { ...settings }
        }
        if (row.key === 'ai_enabled') {
          allSettings[row.user_id][row.key] = row.value === 'true'
        } else {
          allSettings[row.user_id][row.key] = row.value
        }
      }
      return NextResponse.json({ companies: allSettings })
    } else {
      // Regular user sees their own settings
      for (const row of rows as any[]) {
        if (row.key === 'ai_enabled') {
          settings[row.key] = row.value === 'true'
        } else {
          settings[row.key] = row.value
        }
      }
      return NextResponse.json(settings)
    }
  } catch (error) {
    console.error('Failed to fetch settings:', error)
    return NextResponse.json({ error: 'Failed to fetch settings' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const session = await getSession()
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Only super_admin and agent roles can update settings
    if (session.role !== 'super_admin' && session.role !== 'agent') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const data = await request.json()

    // Upsert each setting for this user
    for (const key of SETTINGS_KEYS) {
      if (data[key] !== undefined) {
        const value = typeof data[key] === 'boolean' ? String(data[key]) : data[key]
        await sql`
          INSERT INTO settings (user_id, key, value, updated_at)
          VALUES (${session.id}, ${key}, ${value}, CURRENT_TIMESTAMP)
          ON CONFLICT (user_id, key) DO UPDATE SET
            value = EXCLUDED.value,
            updated_at = CURRENT_TIMESTAMP
        `
      }
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Failed to save settings:', error)
    return NextResponse.json({ error: 'Failed to save settings' }, { status: 500 })
  }
}
