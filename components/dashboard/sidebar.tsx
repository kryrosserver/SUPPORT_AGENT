'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import {
  LayoutDashboard,
  MessageSquare,
  Users,
  MessageCircle,
  Settings,
  LogOut,
} from 'lucide-react'

interface User {
  id: number
  name: string
  email: string
  role: string
}

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/dashboard/inbox', label: 'Inbox', icon: MessageSquare },
  { href: '/dashboard/contacts', label: 'Contacts', icon: Users },
  { href: '/dashboard/whatsapp', label: 'WhatsApp', icon: MessageCircle },
  { href: '/dashboard/settings', label: 'Settings', icon: Settings },
]

export function DashboardSidebar({ user }: { user: User }) {
  const pathname = usePathname()
  const router = useRouter()

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' })
    router.push('/login')
  }

  const isActive = (href: string) => {
    if (href === '/dashboard') {
      return pathname === '/dashboard'
    }
    return pathname.startsWith(href)
  }

  return (
    <aside 
      className="fixed left-0 top-0 flex h-screen flex-col"
      style={{
        backgroundColor: '#0F172A',
        width: '260px',
        padding: '20px'
      }}
    >
      {/* Logo */}
      <div className="flex h-12 items-center px-2 mb-6">
        <Link href="/dashboard" className="flex items-center gap-2">
          <div 
            className="flex h-9 w-9 items-center justify-center rounded-lg"
            style={{ backgroundColor: '#22C55E' }}
          >
            <MessageCircle className="h-5 w-5 text-white" />
          </div>
          <span className="text-xl font-bold text-white">KRYROS</span>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon
          const active = isActive(item.href)
          
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 rounded-lg transition-all duration-200',
                active 
                  ? 'text-white' 
                  : 'text-[#94A3B8] hover:text-white'
              )}
              style={{
                height: '44px',
                padding: '0 14px',
                backgroundColor: active ? '#22C55E' : 'transparent',
                borderRadius: '8px',
              }}
            >
              <Icon className="h-[18px] w-[18px]" style={{ color: active ? 'white' : '#94A3B8' }} />
              <span className="text-sm font-medium">{item.label}</span>
            </Link>
          )
        })}
      </nav>

      {/* User Profile Section */}
      <div 
        className="border-t pt-4 mt-4"
        style={{ borderColor: 'rgba(255,255,255,0.1)' }}
      >
        <div className="flex items-center gap-3 px-3 mb-4">
          <div 
            className="flex h-8 w-8 items-center justify-center rounded-full text-white font-semibold text-sm"
            style={{ backgroundColor: '#22C55E' }}
          >
            {user.name.charAt(0).toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-white truncate">{user.name}</p>
            <p className="text-xs text-[#94A3B8] truncate">{user.email}</p>
          </div>
        </div>
        <Button
          variant="ghost"
          className="w-full justify-start text-[#94A3B8] hover:text-white hover:bg-white/5"
          onClick={handleLogout}
          style={{
            height: '40px',
            padding: '0 14px',
            borderRadius: '8px'
          }}
        >
          <LogOut className="mr-3 h-[18px] w-[18px]" />
          <span className="text-sm">Logout</span>
        </Button>
      </div>
    </aside>
  )
}
