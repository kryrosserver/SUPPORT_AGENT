import { NextResponse } from 'next/server'
import { connectToWhatsApp } from '@/lib/whatsapp'

export async function POST() {
  try {
    await connectToWhatsApp()
    return NextResponse.json({
      success: true,
      message: 'WhatsApp connection initiated.',
    })
  } catch (error) {
    console.error('Failed to connect WhatsApp:', error)
    return NextResponse.json(
      { error: 'Failed to connect WhatsApp' },
      { status: 500 }
    )
  }
}
