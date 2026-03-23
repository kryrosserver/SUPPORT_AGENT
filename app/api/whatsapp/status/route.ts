import { NextResponse } from 'next/server'
import { getWhatsAppStatus } from '@/lib/whatsapp'
import { getSession } from '@/lib/auth'

export async function GET() {
  try {
    const session = await getSession()
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get status for this user
    const status = await getWhatsAppStatus(session.id)
    return NextResponse.json(status)
  } catch (error) {
    console.error('Failed to get WhatsApp status:', error)
    return NextResponse.json({ error: 'Failed to get status' }, { status: 500 })
  }
}
