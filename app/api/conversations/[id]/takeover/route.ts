import { NextResponse } from 'next/server'
import { sql } from '@/lib/db'

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

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
