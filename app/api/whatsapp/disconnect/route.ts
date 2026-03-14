import { NextResponse } from 'next/server'
import { disconnectWhatsApp } from '@/lib/whatsapp'

export async function POST() {
  try {
    await disconnectWhatsApp()
    return NextResponse.json({ success: true, message: 'WhatsApp disconnected' })
  } catch (error) {
    console.error('Failed to disconnect WhatsApp:', error)
    return NextResponse.json(
      { error: 'Failed to disconnect WhatsApp' },
      { status: 500 }
    )
  }
}
