import { NextResponse } from 'next/server'
import { sql } from '@/lib/db'
import { getSession } from '@/lib/auth'

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession()
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params

    // Verify user owns this conversation (unless super_admin)
    if (session.role !== 'super_admin') {
      const conv = await sql`
        SELECT id FROM conversations 
        WHERE id = ${id} AND user_id = ${session.id}
      `
      if (!conv || conv.length === 0) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
      }
    }

    await sql`
      UPDATE conversations
      SET status = 'HUMAN', updated_at = NOW()
      WHERE id = ${id}
    `

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Failed to takeover conversation:', error)
    return NextResponse.json({ error: 'Failed to takeover' }, { status: 500 })
  }
}
