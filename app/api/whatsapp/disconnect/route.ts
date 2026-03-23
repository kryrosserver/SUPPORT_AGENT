import { NextResponse } from 'next/server'
import { disconnectWhatsApp } from '@/lib/whatsapp'
import { getSession } from '@/lib/auth'

export async function POST() {
  try {
    const session = await getSession()
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    await disconnectWhatsApp(session.id)
    return NextResponse.json({ success: true, message: 'WhatsApp disconnected' })
  } catch (error) {
    console.error('Failed to disconnect WhatsApp:', error)
    return NextResponse.json(
      { error: 'Failed to disconnect WhatsApp' },
      { status: 500 }
    )
  }
}
