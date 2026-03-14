'use client'

import { useState, useEffect } from 'react'
import useSWR from 'swr'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
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
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">WhatsApp Connection</h1>
        <p className="text-muted-foreground">Connect your WhatsApp Business account</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageCircle className="h-5 w-5" />
              Connection Status
            </CardTitle>
            <CardDescription>Current WhatsApp connection state</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4">
              {isLoading ? (
                <Spinner />
              ) : status?.connected ? (
                <>
                  <Badge className="gap-1 bg-green-100 text-green-700 hover:bg-green-100">
                    <CheckCircle className="h-3 w-3" />
                    Connected
                  </Badge>
                  {status.phone && (
                    <span className="text-muted-foreground">{status.phone}</span>
                  )}
                </>
              ) : (
                <Badge variant="secondary" className="gap-1">
                  <AlertTriangle className="h-3 w-3" />
                  Disconnected
                </Badge>
              )}
            </div>

            {status?.error && (
              <div className="mt-4 rounded-md bg-destructive/10 p-3 text-sm text-destructive">
                {status.error}
              </div>
            )}

            <div className="mt-6 flex flex-wrap gap-2">
              {!status?.connected ? (
                <Button onClick={handleConnect} disabled={isConnecting}>
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
                    <Button variant="destructive" disabled={isDisconnecting}>
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

              <Button variant="outline" onClick={() => mutate()}>
                <RefreshCw className="mr-2 h-4 w-4" />
                Refresh Status
              </Button>

              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="outline">
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
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <QrCode className="h-5 w-5" />
              QR Code
            </CardTitle>
            <CardDescription>Scan with WhatsApp to connect</CardDescription>
          </CardHeader>
          <CardContent>
            {status?.connected ? (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <CheckCircle className="mb-4 h-16 w-16 text-green-500" />
                <p className="text-lg font-medium">WhatsApp Connected</p>
                <p className="text-muted-foreground">Your WhatsApp account is linked</p>
              </div>
            ) : status?.qrCode ? (
              <div className="flex flex-col items-center">
                <div className="rounded-lg border bg-white p-4">
                  <img
                    src={status.qrCode}
                    alt="WhatsApp QR Code"
                    className="h-48 w-48"
                  />
                </div>
                <p className="mt-4 text-sm text-muted-foreground text-center">
                  Open WhatsApp on your phone, go to Settings &gt; Linked Devices &gt; Link a Device
                </p>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <QrCode className="mb-4 h-16 w-16 text-muted-foreground" />
                <p className="text-lg font-medium">No QR Code Available</p>
                <p className="text-muted-foreground">
                  Click &quot;Connect WhatsApp&quot; to generate a QR code
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Setup Instructions</CardTitle>
          <CardDescription>How to connect your WhatsApp account</CardDescription>
        </CardHeader>
        <CardContent>
          <ol className="list-inside list-decimal space-y-2 text-muted-foreground">
            <li>Click the &quot;Connect WhatsApp&quot; button above</li>
            <li>Wait for the QR code to appear</li>
            <li>Open WhatsApp on your phone</li>
            <li>Go to Settings &gt; Linked Devices &gt; Link a Device</li>
            <li>Scan the QR code with your phone</li>
            <li>Once connected, incoming messages will appear in the Inbox</li>
          </ol>
        </CardContent>
      </Card>
    </div>
  )
}
