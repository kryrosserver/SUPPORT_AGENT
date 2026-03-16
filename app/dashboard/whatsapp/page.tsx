'use client'

import { useState, useEffect } from 'react'
import useSWR from 'swr'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Spinner } from '@/components/ui/spinner'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { MessageCircle, QrCode, RefreshCw, Power, AlertTriangle, CheckCircle } from 'lucide-react'

interface WhatsAppStatus {
  connected: boolean
  qrCode?: string
  phone?: string
  error?: string
}

const fetcher = (url: string) => fetch(url).then((res) => res.json())

export default function WhatsAppPage() {
  const [isConnecting, setIsConnecting] = useState(false)
  const [isDisconnecting, setIsDisconnecting] = useState(false)

  const { data: status, mutate, isLoading } = useSWR<WhatsAppStatus>(
    '/api/whatsapp/status',
    fetcher,
    { refreshInterval: 5000 }
  )

  const handleConnect = async () => {
    setIsConnecting(true)
    try {
      await fetch('/api/whatsapp/connect', { method: 'POST' })
      mutate()
    } catch (error) {
      console.error('Failed to connect:', error)
    }
    setIsConnecting(false)
  }

  const handleDisconnect = async () => {
    setIsDisconnecting(true)
    try {
      await fetch('/api/whatsapp/disconnect', { method: 'POST' })
      mutate()
    } catch (error) {
      console.error('Failed to disconnect:', error)
    }
    setIsDisconnecting(false)
  }

  const handleReset = async () => {
    try {
      await fetch('/api/whatsapp/reset', { method: 'POST' })
      mutate()
    } catch (error) {
      console.error('Failed to reset:', error)
    }
  }

  return (
    <div>
      {/* Page Header */}
      <div className="mb-8">
        <h1 
          className="text-2xl font-bold"
          style={{ color: '#111827' }}
        >
          WhatsApp Connection
        </h1>
        <p 
          className="mt-1 text-sm"
          style={{ color: '#6B7280' }}
        >
          Connect your WhatsApp Business account
        </p>
      </div>

      {/* Connection Status and QR Code Cards */}
      <div 
        className="grid gap-6"
        style={{ gridTemplateColumns: 'repeat(2, 1fr)' }}
      >
        {/* Connection Status Card */}
        <div 
          className="bg-white"
          style={{ 
            borderRadius: '14px', 
            padding: '24px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.05)'
          }}
        >
          <div className="flex items-center gap-2 mb-2">
            <MessageCircle className="h-5 w-5" style={{ color: '#22C55E' }} />
            <h2 
              className="text-lg font-semibold"
              style={{ color: '#111827' }}
            >
              Connection Status
            </h2>
          </div>
          <p 
            className="text-sm mb-6"
            style={{ color: '#6B7280' }}
          >
            Current WhatsApp connection state
          </p>

          <div className="flex items-center gap-4 mb-4">
            {isLoading ? (
              <Spinner />
            ) : status?.connected ? (
              <>
                <span
                  className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-medium"
                  style={{
                    backgroundColor: '#DCFCE7',
                    color: '#166534'
                  }}
                >
                  <CheckCircle className="h-4 w-4" />
                  Connected
                </span>
                {status.phone && (
                  <span style={{ color: '#6B7280' }}>{status.phone}</span>
                )}
              </>
            ) : (
              <span
                className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-medium"
                style={{
                  backgroundColor: '#F3F4F6',
                  color: '#6B7280'
                }}
              >
                <AlertTriangle className="h-4 w-4" />
                Disconnected
              </span>
            )}
          </div>

          {status?.error && (
            <div 
              className="mt-4 rounded-md p-3 text-sm"
              style={{ 
                backgroundColor: '#FEF2F2',
                color: '#DC2626'
              }}
            >
              {status.error}
            </div>
          )}

          <div className="mt-6 flex flex-wrap gap-3">
            {!status?.connected ? (
              <Button 
                onClick={handleConnect} 
                disabled={isConnecting}
                style={{
                  height: '42px',
                  backgroundColor: '#22C55E',
                  borderRadius: '8px',
                  color: 'white'
                }}
              >
                {isConnecting ? (
                  <>
                    <Spinner className="mr-2" />
                    Connecting...
                  </>
                ) : (
                  <>
                    <Power className="mr-2 h-4 w-4" />
                    Connect WhatsApp
                  </>
                )}
              </Button>
            ) : (
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button 
                    variant="destructive"
                    disabled={isDisconnecting}
                    style={{
                      height: '42px',
                      borderRadius: '8px'
                    }}
                  >
                    {isDisconnecting ? (
                      <>
                        <Spinner className="mr-2" />
                        Disconnecting...
                      </>
                    ) : (
                      <>
                        <Power className="mr-2 h-4 w-4" />
                        Disconnect
                      </>
                    )}
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Disconnect WhatsApp?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This will disconnect your WhatsApp account. You will need to scan the QR
                      code again to reconnect.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={handleDisconnect}>
                      Disconnect
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            )}

            <Button 
              variant="outline" 
              onClick={() => mutate()}
              style={{
                height: '42px',
                borderColor: '#E5E7EB',
                borderRadius: '8px',
                color: '#111827'
              }}
            >
              <RefreshCw className="mr-2 h-4 w-4" />
              Refresh Status
            </Button>

            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button 
                  variant="outline"
                  style={{
                    height: '42px',
                    borderColor: '#E5E7EB',
                    borderRadius: '8px',
                    color: '#111827'
                  }}
                >
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Reset Session
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Reset WhatsApp Session?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This will clear the stored session data. You will need to scan the QR code
                    again to connect.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={handleReset}>Reset Session</AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>

        {/* QR Code Card */}
        <div 
          className="bg-white"
          style={{ 
            borderRadius: '14px', 
            padding: '24px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.05)'
          }}
        >
          <div className="flex items-center gap-2 mb-2">
            <QrCode className="h-5 w-5" style={{ color: '#22C55E' }} />
            <h2 
              className="text-lg font-semibold"
              style={{ color: '#111827' }}
            >
              QR Code
            </h2>
          </div>
          <p 
            className="text-sm mb-6"
            style={{ color: '#6B7280' }}
          >
            Scan with WhatsApp to connect
          </p>

          {status?.connected ? (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <CheckCircle 
                className="mb-4 h-16 w-16" 
                style={{ color: '#22C55E' }} 
              />
              <p 
                className="text-lg font-medium"
                style={{ color: '#111827' }}
              >
                WhatsApp Connected
              </p>
              <p 
                className="text-sm mt-1"
                style={{ color: '#6B7280' }}
              >
                Your WhatsApp account is linked
              </p>
            </div>
          ) : status?.qrCode ? (
            <div className="flex flex-col items-center">
              <div 
                className="rounded-lg border p-4"
                style={{ borderColor: '#E5E7EB', backgroundColor: 'white' }}
              >
                <img
                  src={status.qrCode}
                  alt="WhatsApp QR Code"
                  className="h-48 w-48"
                />
              </div>
              <p 
                className="mt-4 text-sm text-center"
                style={{ color: '#6B7280' }}
              >
                Open WhatsApp on your phone, go to Settings &gt; Linked Devices &gt; Link a Device
              </p>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <QrCode 
                className="mb-4 h-16 w-16" 
                style={{ color: '#6B7280' }} 
              />
              <p 
                className="text-lg font-medium"
                style={{ color: '#111827' }}
              >
                No QR Code Available
              </p>
              <p 
                className="text-sm mt-1"
                style={{ color: '#6B7280' }}
              >
                Click "Connect WhatsApp" to generate a QR code
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Setup Instructions Card */}
      <div 
        className="bg-white mt-6"
        style={{ 
          borderRadius: '14px', 
          padding: '24px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.05)'
        }}
      >
        <h2 
          className="text-lg font-semibold mb-2"
          style={{ color: '#111827' }}
        >
          Setup Instructions
        </h2>
        <p 
          className="text-sm mb-6"
          style={{ color: '#6B7280' }}
        >
          How to connect your WhatsApp account
        </p>
        <ol 
          className="list-inside list-decimal space-y-2"
          style={{ color: '#6B7280' }}
        >
          <li>Click the "Connect WhatsApp" button above</li>
          <li>Wait for the QR code to appear</li>
          <li>Open WhatsApp on your phone</li>
          <li>Go to Settings &gt; Linked Devices &gt; Link a Device</li>
          <li>Scan the QR code with your phone</li>
          <li>Once connected, incoming messages will appear in the Inbox</li>
        </ol>
      </div>
    </div>
  )
}
