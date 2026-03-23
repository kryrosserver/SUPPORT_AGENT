import { NextResponse } from 'next/server'
import { resetWhatsApp } from '@/lib/whatsapp'
import { getSession } from '@/lib/auth'

export async function POST() {
  try {
    const session = await getSession()
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    await resetWhatsApp(session.id)
    return NextResponse.json({ success: true, message: 'WhatsApp session reset' })
  } catch (error) {
    console.error('Failed to reset WhatsApp session:', error)
    return NextResponse.json(
      { error: 'Failed to reset session' },
      { status: 500 }
    )
  }
}
