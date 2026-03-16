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
}

interface Message {
  id: number
  conversation_id: number
  sender: string
  content: string
  created_at: string
}

const fetcher = (url: string) => fetch(url).then((res) => res.json())

export function InboxClient({ initialConversations }: { initialConversations: Conversation[] }) {
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

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
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

  const handleTakeover = async () => {
    if (!selectedConversation) return

    try {
      await fetch(`/api/conversations/${selectedConversation.id}/takeover`, {
        method: 'POST',
      })
      mutateConversations()
      setSelectedConversation({ ...selectedConversation, status: 'HUMAN' })
    } catch (error) {
      console.error('Failed to takeover:', error)
    }
  }

  const handleSwitchToAI = async () => {
    if (!selectedConversation) return

    try {
      await fetch(`/api/conversations/${selectedConversation.id}/switch-ai`, {
        method: 'POST',
      })
      mutateConversations()
      setSelectedConversation({ ...selectedConversation, status: 'AI' })
    } catch (error) {
      console.error('Failed to switch to AI:', error)
    }
  }

  return (
    <div className="flex h-[calc(100vh-64px-60px)] bg-white" style={{ borderRadius: '14px', overflow: 'hidden', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
      {/* Chat List - Left Column */}
      <div 
        className="flex flex-col border-r"
        style={{ 
          width: '340px',
          borderColor: '#E5E7EB'
        }}
      >
        {/* Chat List Header */}
        <div 
          className="flex items-center justify-between px-4"
          style={{ 
            height: '60px',
            borderBottom: '1px solid #E5E7EB'
          }}
        >
          <h2 
            className="text-lg font-semibold"
            style={{ color: '#111827' }}
          >
            Inbox
          </h2>
          <Button 
            variant="ghost" 
            size="icon"
            onClick={() => mutateConversations()}
            className="h-8 w-8"
          >
            <RefreshCw className="h-4 w-4" style={{ color: '#6B7280' }} />
          </Button>
        </div>

        {/* Chat List Items */}
        <div className="flex-1 overflow-y-auto">
          {!conversations || conversations.length === 0 ? (
            <div className="p-4 text-center" style={{ color: '#6B7280' }}>
              No conversations yet
            </div>
          ) : (
            <div>
              {conversations.map((conv) => (
                <button
                  key={conv.id}
                  onClick={() => setSelectedConversation(conv)}
                  className={cn(
                    'w-full text-left transition-colors'
                  )}
                  style={{
                    height: '72px',
                    padding: '14px',
                    borderBottom: '1px solid #E5E7EB',
                    backgroundColor: selectedConversation?.id === conv.id ? '#F3F4F6' : 'transparent',
                    borderLeft: selectedConversation?.id === conv.id ? '3px solid #22C55E' : '3px solid transparent'
                  }}
                >
                  <div className="flex items-center justify-between">
                    <span 
                      className="font-medium truncate"
                      style={{ color: '#111827' }}
                    >
                      {conv.name || conv.phone}
                    </span>
                    <span
                      className="inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium"
                      style={{
                        backgroundColor: conv.status === 'AI' ? '#DBEAFE' : '#DCFCE7',
                        color: conv.status === 'AI' ? '#1E40AF' : '#166534'
                      }}
                    >
                      {conv.status === 'AI' ? (
                        <Bot className="mr-1 h-3 w-3" />
                      ) : (
                        <UserCheck className="mr-1 h-3 w-3" />
                      )}
                      {conv.status}
                    </span>
                  </div>
                  <p 
                    className="text-sm truncate mt-1"
                    style={{ color: '#6B7280' }}
                  >
                    {conv.last_message || 'No messages'}
                  </p>
                  <p 
                    className="text-xs mt-1"
                    style={{ color: '#6B7280' }}
                  >
                    {new Date(conv.updated_at).toLocaleString()}
                  </p>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Chat Conversation - Right Column */}
      <div className="flex flex-1 flex-col">
        {selectedConversation ? (
          <>
            {/* Chat Header */}
            <div 
              className="flex items-center justify-between px-6"
              style={{ 
                height: '60px',
                borderBottom: '1px solid #E5E7EB'
              }}
            >
              <div>
                <h3 
                  className="font-semibold"
                  style={{ color: '#111827' }}
                >
                  {selectedConversation.name || selectedConversation.phone}
                </h3>
                <p 
                  className="text-sm"
                  style={{ color: '#6B7280' }}
                >
                  {selectedConversation.phone}
                </p>
              </div>
              <div className="flex items-center gap-2">
                {selectedConversation.status === 'AI' ? (
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={handleTakeover}
                    style={{
                      borderColor: '#E5E7EB',
                      borderRadius: '8px'
                    }}
                  >
                    <UserCheck className="mr-2 h-4 w-4" style={{ color: '#22C55E' }} />
                    <span style={{ color: '#111827' }}>Human Mode</span>
                  </Button>
                ) : (
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={handleSwitchToAI}
                    style={{
                      borderColor: '#E5E7EB',
                      borderRadius: '8px'
                    }}
                  >
                    <Bot className="mr-2 h-4 w-4" style={{ color: '#3B82F6' }} />
                    <span style={{ color: '#111827' }}>Switch to AI</span>
                  </Button>
                )}
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4" style={{ backgroundColor: '#FAFAFA' }}>
              <div className="space-y-4">
                {messages?.map((msg) => (
                  <div
                    key={msg.id}
                    className={cn(
                      'flex',
                      msg.sender === 'customer' ? 'justify-start' : 'justify-end'
                    )}
                  >
                    <div
                      className={cn(
                        'rounded-xl px-4 py-2.5'
                      )}
                      style={{
                        maxWidth: '70%',
                        backgroundColor: msg.sender === 'customer' 
                          ? '#F3F4F6' 
                          : msg.sender === 'ai' 
                            ? '#DBEAFE' 
                            : '#22C55E',
                        color: msg.sender === 'customer' 
                          ? '#111827' 
                          : msg.sender === 'ai' 
                            ? '#1E3A8A' 
                            : 'white',
                      }}
                    >
                      <div 
                        className="flex items-center gap-1 text-xs mb-1 opacity-70"
                      >
                        {msg.sender === 'customer' ? (
                          <User className="h-3 w-3" />
                        ) : msg.sender === 'ai' ? (
                          <Bot className="h-3 w-3" />
                        ) : (
                          <UserCheck className="h-3 w-3" />
                        )}
                        <span>
                          {msg.sender === 'customer' 
                            ? 'Customer' 
                            : msg.sender === 'ai' 
                              ? 'AI' 
                              : 'Agent'}
                        </span>
                      </div>
                      <p className="whitespace-pre-wrap">{msg.content}</p>
                      <p 
                        className="text-xs mt-1 opacity-70"
                      >
                        {new Date(msg.created_at).toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>
            </div>

            {/* Message Input */}
            <form 
              onSubmit={handleSendMessage} 
              className="flex items-center gap-3 px-4"
              style={{ 
                height: '72px',
                borderTop: '1px solid #E5E7EB',
                backgroundColor: '#FFFFFF'
              }}
            >
              <Input
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Type a message..."
                disabled={isSending}
                style={{
                  height: '42px',
                  border: '1px solid #E5E7EB',
                  borderRadius: '10px',
                  padding: '0 12px'
                }}
              />
              <Button 
                type="submit" 
                disabled={isSending || !message.trim()}
                style={{
                  height: '42px',
                  backgroundColor: '#22C55E',
                  borderRadius: '10px',
                  padding: '0 20px'
                }}
              >
                <Send className="h-4 w-4" />
              </Button>
            </form>
          </>
        ) : (
          <div 
            className="flex flex-1 items-center justify-center"
            style={{ color: '#6B7280' }}
          >
            Select a conversation to start chatting
          </div>
        )}
      </div>
    </div>
  )
}
