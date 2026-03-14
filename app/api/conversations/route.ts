import { NextResponse } from 'next/server'
import { sql } from '@/lib/db'

export async function GET() {
  try {
    const conversations = await sql`
      SELECT c.id, c.status, c.last_message, c.updated_at, ct.name, ct.phone
      FROM conversations c
      JOIN contacts ct ON c.contact_id = ct.id
      ORDER BY c.updated_at DESC
    `
    return NextResponse.json(conversations)
  } catch (error) {
    console.error('Failed to fetch conversations:', error)
    return NextResponse.json({ error: 'Failed to fetch conversations' }, { status: 500 })
  }
}
