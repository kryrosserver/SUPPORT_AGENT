import { sql } from '@/lib/db'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { MessageSquare, Users, Bot, UserCheck } from 'lucide-react'
import { cn } from '@/lib/utils'

async function getStats() {
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
}

async function getRecentConversations() {
  const conversations = await sql`
    SELECT c.id, c.status, c.last_message, c.updated_at, ct.name, ct.phone
    FROM conversations c
    JOIN contacts ct ON c.contact_id = ct.id
    ORDER BY c.updated_at DESC
    LIMIT 5
  `
  return conversations
}

export default async function DashboardPage() {
  const stats = await getStats()
  const recentConversations = await getRecentConversations()

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
          Welcome to KRYROS Support Dashboard
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
            className="font-bold"
            style={{ 
              fontSize: '28px',
              color: '#111827'
            }}
          >
            {stats.totalConversations}
          </div>
          <p 
            className="text-xs mt-1"
            style={{ color: '#6B7280' }}
          >
            All customer chats
          </p>
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
            className="font-bold"
            style={{ 
              fontSize: '28px',
              color: '#111827'
            }}
          >
            {stats.totalContacts}
          </div>
          <p 
            className="text-xs mt-1"
            style={{ color: '#6B7280' }}
          >
            Unique customers
          </p>
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
              style={{ color: '#6B7280' }} 
            />
          </div>
          <div 
            className="font-bold"
            style={{ 
              fontSize: '28px',
              color: '#111827'
            }}
          >
            {stats.aiHandled}
          </div>
          <p 
            className="text-xs mt-1"
            style={{ color: '#6B7280' }}
          >
            Automated responses
          </p>
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
              style={{ color: '#6B7280' }} 
            />
          </div>
          <div 
            className="font-bold"
            style={{ 
              fontSize: '28px',
              color: '#111827'
            }}
          >
            {stats.humanHandled}
          </div>
          <p 
            className="text-xs mt-1"
            style={{ color: '#6B7280' }}
          >
            Agent responses
          </p>
        </div>
      </div>

      {/* Recent Conversations Card */}
      <div 
        className="bg-white"
        style={{ 
          borderRadius: '14px', 
          padding: '24px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.05)'
        }}
      >
        <div className="mb-6">
          <h2 
            className="text-lg font-semibold"
            style={{ color: '#111827' }}
          >
            Recent Conversations
          </h2>
          <p 
            className="text-sm mt-1"
            style={{ color: '#6B7280' }}
          >
            Latest customer interactions
          </p>
        </div>

        {recentConversations.length === 0 ? (
          <div className="text-center py-8">
            <p style={{ color: '#6B7280' }}>
              No conversations yet. Connect WhatsApp to start receiving messages.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {recentConversations.map((conv) => (
              <div
                key={conv.id}
                className="flex items-center justify-between pb-4 last:border-0"
                style={{ 
                  borderBottom: '1px solid #E5E7EB',
                  paddingBottom: '16px'
                }}
              >
                <div className="flex-1 min-w-0">
                  <p 
                    className="font-medium truncate"
                    style={{ color: '#111827' }}
                  >
                    {conv.name || conv.phone}
                  </p>
                  <p 
                    className="text-sm truncate mt-1"
                    style={{ color: '#6B7280' }}
                  >
                    {conv.last_message || 'No messages'}
                  </p>
                </div>
                <div className="flex items-center gap-3 ml-4">
                  <span
                    className="inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium"
                    style={{
                      backgroundColor: conv.status === 'AI' ? '#DBEAFE' : '#DCFCE7',
                      color: conv.status === 'AI' ? '#1E40AF' : '#166534'
                    }}
                  >
                    {conv.status}
                  </span>
                  <p 
                    className="text-xs whitespace-nowrap"
                    style={{ color: '#6B7280' }}
                  >
                    {new Date(conv.updated_at).toLocaleDateString()}
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
