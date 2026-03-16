'use client'

import { Bell, User } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface TopbarProps {
  user?: {
    name: string
    email: string
  }
}

export function Topbar({ user }: TopbarProps) {
  return (
    <header 
      className="fixed top-0 right-0 flex items-center justify-end px-6"
      style={{
        height: '64px',
        backgroundColor: '#FFFFFF',
        borderBottom: '1px solid #E5E7EB',
        left: '260px',
        zIndex: 40,
      }}
    >
      <div className="flex items-center gap-4">
        {/* Notification Icon */}
        <Button 
          variant="ghost" 
          size="icon"
          className="relative"
        >
          <Bell className="h-[18px] w-[18px]" style={{ color: '#6B7280' }} />
          <span className="absolute top-1 right-1 h-2 w-2 rounded-full" style={{ backgroundColor: '#22C55E' }} />
        </Button>

        {/* User Avatar */}
        <div 
          className="flex items-center justify-center rounded-full"
          style={{
            width: '36px',
            height: '36px',
            backgroundColor: '#22C55E'
          }}
        >
          <User className="h-4 w-4 text-white" />
        </div>
      </div>
    </header>
  )
}
