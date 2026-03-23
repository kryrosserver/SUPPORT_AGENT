import { sql } from '@/lib/db'
import { getSession } from '@/lib/auth'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { MessageSquare, Users, Bot, UserCheck } from 'lucide-react'
import { cn } from '@/lib/utils'

async function getStats(userId: number, isSuperAdmin: boolean) {
  if (isSuperAdmin) {
    // Super admin sees all data
    const [conversations, contacts, aiConversations, humanConversations] = await Promise.all([
      sql`SELECT COUNT(*) as count FROM conversations`,
      sql`SELECT COUNT(*) as count FROM contacts`,
      sql`SELECT COUNT(*) as count FROM conversations WHERE status = 'AI'`,
      sql`SELECT COUNT(*) as count FROM conversations WHERE status = 'HUMAN'`,
    ])

    return {
      totalConversations: Number(conversations[0]?.count || 0),
      totalContacts: Number(contacts[0]?.count || 0),
      aiHandled: Number(aiConversations[0]?.count || 0),
      humanHandled: Number(humanConversations[0]?.count || 0),
    }
  } else {
    // Regular users see only their data
    const [conversations, contacts, aiConversations, humanConversations] = await Promise.all([
      sql`SELECT COUNT(*) as count FROM conversations WHERE user_id = ${userId}`,
      sql`SELECT COUNT(*) as count FROM contacts WHERE user_id = ${userId}`,
      sql`SELECT COUNT(*) as count FROM conversations WHERE user_id = ${userId} AND status = 'AI'`,
      sql`SELECT COUNT(*) as count FROM conversations WHERE user_id = ${userId} AND status = 'HUMAN'`,
    ])

    return {
      totalConversations: Number(conversations[0]?.count || 0),
      totalContacts: Number(contacts[0]?.count || 0),
      aiHandled: Number(aiConversations[0]?.count || 0),
      humanHandled: Number(humanConversations[0]?.count || 0),
    }
  }
}

async function getRecentConversations(userId: number, isSuperAdmin: boolean) {
  if (isSuperAdmin) {
    const conversations = await sql`
      SELECT c.id, c.status, c.last_message, c.updated_at, ct.name, ct.phone, c.user_id
      FROM conversations c
      JOIN contacts ct ON c.contact_id = ct.id
      ORDER BY c.updated_at DESC
      LIMIT 5
    `
    return conversations
  } else {
    const conversations = await sql`
      SELECT c.id, c.status, c.last_message, c.updated_at, ct.name, ct.phone
      FROM conversations c
      JOIN contacts ct ON c.contact_id = ct.id
      WHERE c.user_id = ${userId}
      ORDER BY c.updated_at DESC
      LIMIT 5
    `
    return conversations
  }
}

export default async function DashboardPage() {
  const session = await getSession()
  
  if (!session) {
    return <div>Please log in</div>
  }

  const isSuperAdmin = session.role === 'super_admin'
  const stats = await getStats(session.id, isSuperAdmin)
  const recentConversations = await getRecentConversations(session.id, isSuperAdmin)

  return (
    <div>
      {/* Page Header */}
      <div className="mb-8">
        <h1 
          className="text-2xl font-bold" 
          style={{ color: '#111827' }}
        >
          Dashboard
        </h1>
        <p 
          className="mt-1 text-sm"
          style={{ color: '#6B7280' }}
        >
          {isSuperAdmin 
            ? 'Welcome to KRYROS Support Dashboard - All Users' 
            : 'Welcome to your Support Dashboard'
          }
        </p>
      </div>

      {/* Stats Cards Grid */}
      <div 
        className="mb-8 grid gap-6"
        style={{ 
          gridTemplateColumns: 'repeat(4, 1fr)',
        }}
      >
        {/* Total Conversations */}
        <div 
          className="bg-white"
          style={{ 
            borderRadius: '14px', 
            padding: '24px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.05)'
          }}
        >
          <div className="flex items-center justify-between mb-4">
            <span 
              className="text-sm font-medium"
              style={{ color: '#6B7280' }}
            >
              Total Conversations
            </span>
            <MessageSquare 
              className="h-5 w-5" 
              style={{ color: '#6B7280' }} 
            />
          </div>
          <div 
            className="text-3xl font-bold"
            style={{ color: '#111827' }}
          >
            {stats.totalConversations}
          </div>
        </div>

        {/* Total Contacts */}
        <div 
          className="bg-white"
          style={{ 
            borderRadius: '14px', 
            padding: '24px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.05)'
          }}
        >
          <div className="flex items-center justify-between mb-4">
            <span 
              className="text-sm font-medium"
              style={{ color: '#6B7280' }}
            >
              Total Contacts
            </span>
            <Users 
              className="h-5 w-5" 
              style={{ color: '#6B7280' }} 
            />
          </div>
          <div 
            className="text-3xl font-bold"
            style={{ color: '#111827' }}
          >
            {stats.totalContacts}
          </div>
        </div>

        {/* AI Handled */}
        <div 
          className="bg-white"
          style={{ 
            borderRadius: '14px', 
            padding: '24px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.05)'
          }}
        >
          <div className="flex items-center justify-between mb-4">
            <span 
              className="text-sm font-medium"
              style={{ color: '#6B7280' }}
            >
              AI Handled
            </span>
            <Bot 
              className="h-5 w-5" 
              style={{ color: '#22C55E' }} 
            />
          </div>
          <div 
            className="text-3xl font-bold"
            style={{ color: '#22C55E' }}
          >
            {stats.aiHandled}
          </div>
        </div>

        {/* Human Handled */}
        <div 
          className="bg-white"
          style={{ 
            borderRadius: '14px', 
            padding: '24px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.05)'
          }}
        >
          <div className="flex items-center justify-between mb-4">
            <span 
              className="text-sm font-medium"
              style={{ color: '#6B7280' }}
            >
              Human Handled
            </span>
            <UserCheck 
              className="h-5 w-5" 
              style={{ color: '#3B82F6' }} 
            />
          </div>
          <div 
            className="text-3xl font-bold"
            style={{ color: '#3B82F6' }}
          >
            {stats.humanHandled}
          </div>
        </div>
      </div>

      {/* Recent Conversations */}
      <div 
        className="bg-white"
        style={{ 
          borderRadius: '14px', 
          padding: '24px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.05)'
        }}
      >
        <h2 
          className="text-lg font-semibold mb-6"
          style={{ color: '#111827' }}
        >
          Recent Conversations
        </h2>
        
        {recentConversations.length === 0 ? (
          <p style={{ color: '#6B7280' }}>No conversations yet. Connect WhatsApp to start receiving messages.</p>
        ) : (
          <div className="space-y-4">
            {recentConversations.map((conv: any) => (
              <div 
                key={conv.id}
                className="flex items-center justify-between p-4"
                style={{ 
                  backgroundColor: '#F9FAFB',
                  borderRadius: '8px',
                  border: '1px solid #E5E7EB'
                }}
              >
                <div className="flex items-center gap-4">
                  <div 
                    className={cn(
                      "w-10 h-10 rounded-full flex items-center justify-center",
                      conv.status === 'AI' ? "bg-green-100" : "bg-blue-100"
                    )}
                  >
                    {conv.status === 'AI' ? (
                      <Bot className="h-5 w-5" style={{ color: '#22C55E' }} />
                    ) : (
                      <UserCheck className="h-5 w-5" style={{ color: '#3B82F6' }} />
                    )}
                  </div>
                  <div>
                    <p className="font-medium" style={{ color: '#111827' }}>
                      {conv.name || 'Unknown'}
                    </p>
                    <p className="text-sm" style={{ color: '#6B7280' }}>
                      {conv.phone}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p 
                    className="text-sm font-medium"
                    style={{ color: conv.status === 'AI' ? '#22C55E' : '#3B82F6' }}
                  >
                    {conv.status === 'AI' ? 'AI Mode' : 'Human Mode'}
                  </p>
                  <p className="text-xs" style={{ color: '#6B7280' }}>
                    {conv.last_message?.substring(0, 30) || 'No messages'}...
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
