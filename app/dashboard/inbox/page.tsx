import { sql } from '@/lib/db'
import { getSession } from '@/lib/auth'
import { InboxClient } from '@/components/dashboard/inbox-client'

async function getConversations(userId: number, isSuperAdmin: boolean) {
  if (isSuperAdmin) {
    // Super admin sees all conversations
    const conversations = await sql`
      SELECT c.id, c.status, c.last_message, c.updated_at, ct.name, ct.phone, c.user_id
      FROM conversations c
      JOIN contacts ct ON c.contact_id = ct.id
      ORDER BY c.updated_at DESC
    `
    return conversations
  } else {
    // Regular users see only their conversations
    const conversations = await sql`
      SELECT c.id, c.status, c.last_message, c.updated_at, ct.name, ct.phone
      FROM conversations c
      JOIN contacts ct ON c.contact_id = ct.id
      WHERE c.user_id = ${userId}
      ORDER BY c.updated_at DESC
    `
    return conversations
  }
}

export default async function InboxPage() {
  const session = await getSession()
  
  if (!session) {
    return <div>Please log in</div>
  }

  const isSuperAdmin = session.role === 'super_admin'
  const conversations = await getConversations(session.id, isSuperAdmin)

  return (
    <InboxClient 
      initialConversations={conversations} 
      isSuperAdmin={isSuperAdmin} 
    />
  )
}
