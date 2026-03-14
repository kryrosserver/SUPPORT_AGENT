import { NextResponse } from 'next/server'
import { resetWhatsApp } from '@/lib/whatsapp'

export async function POST() {
  try {
    await resetWhatsApp()
    return NextResponse.json({ success: true, message: 'WhatsApp session reset' })
  } catch (error) {
    console.error('Failed to reset WhatsApp session:', error)
    return NextResponse.json(
      { error: 'Failed to reset session' },
      { status: 500 }
    )
  }
}
