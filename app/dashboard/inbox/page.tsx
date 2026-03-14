import { sql } from '@/lib/db'
import { InboxClient } from '@/components/dashboard/inbox-client'

async function getConversations() {
  const conversations = await sql`
    SELECT c.id, c.status, c.last_message, c.updated_at, ct.name, ct.phone
    FROM conversations c
    JOIN contacts ct ON c.contact_id = ct.id
    ORDER BY c.updated_at DESC
  `
  return conversations
}

export default async function InboxPage() {
  const conversations = await getConversations()

  return <InboxClient initialConversations={conversations} />
}
