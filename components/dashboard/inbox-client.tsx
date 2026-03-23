'use client'

import { useState, useEffect, useRef } from 'react'
import useSWR from 'swr'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Send, Bot, User, UserCheck, RefreshCw } from 'lucide-react'
import { cn } from '@/lib/utils'

interface Conversation {
  id: number
  status: string
  last_message: string
  updated_at: string
  name: string
  phone: string
  user_id?: number
}

interface Message {
  id: number
  conversation_id: number
  sender: string
  content: string
  created_at: string
}

const fetcher = (url: string) => fetch(url).then((res) => res.json())

export function InboxClient({ initialConversations, isSuperAdmin }: { initialConversations: Conversation[]; isSuperAdmin: boolean }) {
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null)
  const [message, setMessage] = useState('')
  const [isSending, setIsSending] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const { data: conversations, mutate: mutateConversations } = useSWR<Conversation[]>(
    '/api/conversations',
    fetcher,
    { fallbackData: initialConversations, refreshInterval: 5000 }
  )

  const { data: messages, mutate: mutateMessages } = useSWR<Message[]>(
    selectedConversation ? `/api/conversations/${selectedConversation.id}/messages` : null,
    fetcher,
    { refreshInterval: 3000 }
  )

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSendMessage = async () => {
    if (!message.trim() || !selectedConversation) return

    setIsSending(true)
    try {
      await fetch(`/api/conversations/${selectedConversation.id}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: message, sender: 'agent' }),
      })
      setMessage('')
      mutateMessages()
      mutateConversations()
    } catch (error) {
      console.error('Failed to send message:', error)
    }
    setIsSending(false)
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  const switchToAI = async () => {
    if (!selectedConversation) return
    try {
      await fetch(`/api/conversations/${selectedConversation.id}/switch-ai`, {
        method: 'POST',
      })
      mutateConversations()
      // Update local state
      setSelectedConversation({ ...selectedConversation, status: 'AI' })
    } catch (error) {
      console.error('Failed to switch to AI:', error)
    }
  }

  const switchToHuman = async () => {
    if (!selectedConversation) return
    try {
      await fetch(`/api/conversations/${selectedConversation.id}/takeover`, {
        method: 'POST',
      })
      mutateConversations()
      // Update local state
      setSelectedConversation({ ...selectedConversation, status: 'HUMAN' })
    } catch (error) {
      console.error('Failed to switch to human:', error)
    }
  }

  return (
    <div className="flex h-[calc(100vh-140px)]" style={{ backgroundColor: '#F3F4F6' }}>
      {/* Chat List */}
      <div 
        className="w-[340px] flex-shrink-0 overflow-y-auto"
        style={{ backgroundColor: 'white', borderRight: '1px solid #E5E7EB' }}
      >
        <div className="p-4 border-b" style={{ borderColor: '#E5E7EB' }}>
          <h2 className="text-lg font-semibold" style={{ color: '#111827' }}>Inbox</h2>
          <p className="text-sm" style={{ color: '#6B7280' }}>{conversations?.length || 0} conversations</p>
        </div>
        
        <div>
          {conversations?.length === 0 ? (
            <div className="p-4 text-center" style={{ color: '#6B7280' }}>
              <p>No conversations yet</p>
              <p className="text-sm mt-1">Connect WhatsApp to start receiving messages</p>
            </div>
          ) : (
            conversations?.map((conv) => (
              <div
                key={conv.id}
                onClick={() => setSelectedConversation(conv)}
                className={cn(
                  "p-4 cursor-pointer transition-colors",
                  selectedConversation?.id === conv.id && "bg-gray-50"
                )}
                style={{ 
                  borderBottom: '1px solid #E5E7EB',
                  borderLeft: selectedConversation?.id === conv.id ? '3px solid #22C55E' : '3px solid transparent'
                }}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div 
                      className="w-10 h-10 rounded-full flex items-center justify-center"
                      style={{ backgroundColor: conv.status === 'AI' ? '#DCFCE7' : '#DBEAFE' }}
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
                  {isSuperAdmin && conv.user_id && (
                    <span className="text-xs" style={{ color: '#9CA3AF' }}>
                      User #{conv.user_id}
                    </span>
                  )}
                </div>
                <p className="text-sm mt-2 truncate" style={{ color: '#6B7280' }}>
                  {conv.last_message || 'No messages'}
                </p>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Chat Conversation */}
      <div className="flex-1 flex flex-col">
        {selectedConversation ? (
          <>
            {/* Chat Header */}
            <div 
              className="h-[60px] px-6 flex items-center justify-between"
              style={{ backgroundColor: 'white', borderBottom: '1px solid #E5E7EB' }}
            >
              <div>
                <h3 className="font-semibold" style={{ color: '#111827' }}>
                  {selectedConversation.name || 'Unknown'}
                </h3>
                <p className="text-sm" style={{ color: '#6B7280' }}>
                  {selectedConversation.phone}
                </p>
              </div>
              <div className="flex items-center gap-2">
                {selectedConversation.status === 'HUMAN' ? (
                  <Button
                    onClick={switchToAI}
                    size="sm"
                    style={{ backgroundColor: '#22C55E', color: 'white', borderRadius: '8px' }}
                  >
                    <Bot className="h-4 w-4 mr-1" />
                    Switch to AI
                  </Button>
                ) : (
                  <Button
                    onClick={switchToHuman}
                    size="sm"
                    style={{ backgroundColor: '#3B82F6', color: 'white', borderRadius: '8px' }}
                  >
                    <User className="h-4 w-4 mr-1" />
                    Human Mode
                  </Button>
                )}
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-6" style={{ backgroundColor: '#F9FAFB' }}>
              {messages?.map((msg) => (
                <div
                  key={msg.id}
                  className={cn(
                    "mb-4 max-w-[70%] rounded-xl px-4 py-2",
                    msg.sender === 'customer' 
                      ? "bg-white text-gray-900 mr-auto" 
                      : msg.sender === 'ai'
                        ? "bg-blue-100 text-blue-900 ml-auto"
                        : "bg-green-100 text-green-900 ml-auto"
                  )}
                  style={{
                    borderRadius: '12px',
                    padding: '10px 14px',
                  }}
                >
                  <p>{msg.content}</p>
                  <p className="text-xs mt-1 opacity-70">
                    {new Date(msg.created_at).toLocaleTimeString()}
                  </p>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            {/* Message Input */}
            <div 
              className="h-[60px] px-6 flex items-center gap-3"
              style={{ backgroundColor: 'white', borderTop: '1px solid #E5E7EB' }}
            >
              <Input
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Type a message..."
                style={{
                  height: '42px',
                  border: '1px solid #E5E7EB',
                  borderRadius: '10px'
                }}
              />
              <Button
                onClick={handleSendMessage}
                disabled={isSending || !message.trim()}
                style={{
                  height: '42px',
                  backgroundColor: '#22C55E',
                  color: 'white',
                  borderRadius: '10px'
                }}
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center" style={{ color: '#6B7280' }}>
            <div className="text-center">
              <p className="text-lg">Select a conversation</p>
              <p className="text-sm mt-1">Choose a conversation from the list to start chatting</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
