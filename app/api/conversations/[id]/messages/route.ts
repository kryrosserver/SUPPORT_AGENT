import { NextResponse } from 'next/server'
import { sql } from '@/lib/db'
import { getSession } from '@/lib/auth'

export async function GET(
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

    const messages = await sql`
      SELECT id, conversation_id, sender, content, created_at
      FROM messages
      WHERE conversation_id = ${id}
      ORDER BY created_at ASC
    `
    return NextResponse.json(messages)
  } catch (error) {
    console.error('Failed to fetch messages:', error)
    return NextResponse.json({ error: 'Failed to fetch messages' }, { status: 500 })
  }
}

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
    const { content, sender } = await request.json()

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

    // Insert the message
    await sql`
      INSERT INTO messages (conversation_id, sender, content, user_id)
      VALUES (${id}, ${sender}, ${content}, ${session.id})
    `

    // Update the conversation's last_message
    await sql`
      UPDATE conversations
      SET last_message = ${content}, updated_at = NOW()
      WHERE id = ${id}
    `

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Failed to send message:', error)
    return NextResponse.json({ error: 'Failed to send message' }, { status: 500 })
  }
}
