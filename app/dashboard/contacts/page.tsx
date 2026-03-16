import { sql } from '@/lib/db'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { User } from 'lucide-react'

async function getContacts() {
  const contacts = await sql`
    SELECT 
      ct.id, 
      ct.phone, 
      ct.name, 
      ct.created_at,
      c.last_message,
      c.updated_at as last_activity,
      c.status
    FROM contacts ct
    LEFT JOIN conversations c ON ct.id = c.contact_id
    ORDER BY c.updated_at DESC NULLS LAST, ct.created_at DESC
  `
  return contacts
}

export default async function ContactsPage() {
  const contacts = await getContacts()

  return (
    <div>
      {/* Page Header */}
      <div className="mb-8">
        <h1 
          className="text-2xl font-bold"
          style={{ color: '#111827' }}
        >
          Contacts
        </h1>
        <p 
          className="mt-1 text-sm"
          style={{ color: '#6B7280' }}
        >
          All customers who have sent messages
        </p>
      </div>

      {/* Contacts Table Card */}
      <div 
        className="bg-white overflow-hidden"
        style={{ 
          borderRadius: '12px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.05)'
        }}
      >
        {/* Card Header */}
        <div 
          className="px-6 py-4 border-b"
          style={{ borderColor: '#E5E7EB' }}
        >
          <h2 
            className="text-lg font-semibold"
            style={{ color: '#111827' }}
          >
            Customer Directory
          </h2>
          <p 
            className="text-sm mt-1"
            style={{ color: '#6B7280' }}
          >
            {contacts.length} contact{contacts.length !== 1 ? 's' : ''} total
          </p>
        </div>

        {/* Card Content */}
        <div>
          {contacts.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <User 
                className="mb-4 h-12 w-12" 
                style={{ color: '#6B7280' }} 
              />
              <p 
                className="text-lg font-medium"
                style={{ color: '#111827' }}
              >
                No contacts yet
              </p>
              <p 
                className="mt-1"
                style={{ color: '#6B7280' }}
              >
                Contacts will appear here when customers message you on WhatsApp
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow style={{ backgroundColor: '#F9FAFB' }}>
                  <TableHead 
                    className="font-semibold"
                    style={{ color: '#111827' }}
                  >
                    Phone Number
                  </TableHead>
                  <TableHead 
                    className="font-semibold"
                    style={{ color: '#111827' }}
                  >
                    Name
                  </TableHead>
                  <TableHead 
                    className="font-semibold"
                    style={{ color: '#111827' }}
                  >
                    Last Message
                  </TableHead>
                  <TableHead 
                    className="font-semibold"
                    style={{ color: '#111827' }}
                  >
                    Last Activity
                  </TableHead>
                  <TableHead 
                    className="font-semibold"
                    style={{ color: '#111827' }}
                  >
                    Status
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {contacts.map((contact) => (
                  <TableRow 
                    key={contact.id}
                    style={{ 
                      height: '56px',
                      borderBottom: '1px solid #E5E7EB'
                    }}
                  >
                    <TableCell 
                      className="font-medium"
                      style={{ color: '#111827' }}
                    >
                      {contact.phone}
                    </TableCell>
                    <TableCell style={{ color: '#111827' }}>
                      {contact.name || '-'}
                    </TableCell>
                    <TableCell 
                      className="max-w-xs truncate"
                      style={{ color: '#6B7280' }}
                    >
                      {contact.last_message || '-'}
                    </TableCell>
                    <TableCell style={{ color: '#6B7280' }}>
                      {contact.last_activity
                        ? new Date(contact.last_activity).toLocaleString()
                        : '-'}
                    </TableCell>
                    <TableCell>
                      {contact.status ? (
                        <span
                          className="inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium"
                          style={{
                            backgroundColor: contact.status === 'AI' ? '#DBEAFE' : '#DCFCE7',
                            color: contact.status === 'AI' ? '#1E40AF' : '#166534'
                          }}
                        >
                          {contact.status}
                        </span>
                      ) : (
                        '-'
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </div>
      </div>
    </div>
  )
}
