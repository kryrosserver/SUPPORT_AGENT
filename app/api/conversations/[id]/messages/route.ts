import { NextResponse } from 'next/server'
import { sql } from '@/lib/db'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
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
    const { id } = await params
    const { content, sender } = await request.json()

    // Insert the message
    await sql`
      INSERT INTO messages (conversation_id, sender, content)
      VALUES (${id}, ${sender}, ${content})
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
