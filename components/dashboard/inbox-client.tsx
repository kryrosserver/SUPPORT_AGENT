'use client'

import { useState, useEffect, useRef } from 'react'
import useSWR from 'swr'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
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
    <div className="flex h-full">
      {/* Conversation List */}
      <div className="w-80 border-r bg-card">
        <div className="flex h-16 items-center justify-between border-b px-4">
          <h2 className="text-lg font-semibold">Inbox</h2>
          <Button variant="ghost" size="icon" onClick={() => mutateConversations()}>
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>
        <ScrollArea className="h-[calc(100vh-4rem)]">
          {!conversations || conversations.length === 0 ? (
            <div className="p-4 text-center text-muted-foreground">
              No conversations yet
            </div>
          ) : (
            <div className="divide-y">
              {conversations.map((conv) => (
                <button
                  key={conv.id}
                  onClick={() => setSelectedConversation(conv)}
                  className={cn(
                    'w-full p-4 text-left transition-colors hover:bg-muted',
                    selectedConversation?.id === conv.id && 'bg-muted'
                  )}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-medium">{conv.name || conv.phone}</span>
                    <Badge variant={conv.status === 'AI' ? 'secondary' : 'default'}>
                      {conv.status === 'AI' ? (
                        <Bot className="mr-1 h-3 w-3" />
                      ) : (
                        <UserCheck className="mr-1 h-3 w-3" />
                      )}
                      {conv.status}
                    </Badge>
                  </div>
                  <p className="mt-1 text-sm text-muted-foreground line-clamp-1">
                    {conv.last_message || 'No messages'}
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {new Date(conv.updated_at).toLocaleString()}
                  </p>
                </button>
              ))}
            </div>
          )}
        </ScrollArea>
      </div>

      {/* Chat Area */}
      <div className="flex flex-1 flex-col">
        {selectedConversation ? (
          <>
            {/* Chat Header */}
            <div className="flex h-16 items-center justify-between border-b px-4">
              <div>
                <h3 className="font-semibold">
                  {selectedConversation.name || selectedConversation.phone}
                </h3>
                <p className="text-sm text-muted-foreground">{selectedConversation.phone}</p>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant={selectedConversation.status === 'AI' ? 'secondary' : 'default'}>
                  {selectedConversation.status === 'AI' ? 'AI Mode' : 'Human Mode'}
                </Badge>
                {selectedConversation.status === 'AI' ? (
                  <Button variant="outline" size="sm" onClick={handleTakeover}>
                    <UserCheck className="mr-2 h-4 w-4" />
                    Take Over
                  </Button>
                ) : (
                  <Button variant="outline" size="sm" onClick={handleSwitchToAI}>
                    <Bot className="mr-2 h-4 w-4" />
                    Switch to AI
                  </Button>
                )}
              </div>
            </div>

            {/* Messages */}
            <ScrollArea className="flex-1 p-4">
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
                        'max-w-[70%] rounded-lg px-4 py-2',
                        msg.sender === 'customer'
                          ? 'bg-muted'
                          : msg.sender === 'ai'
                          ? 'bg-blue-100 text-blue-900'
                          : 'bg-primary text-primary-foreground'
                      )}
                    >
                      <div className="mb-1 flex items-center gap-1 text-xs opacity-70">
                        {msg.sender === 'customer' ? (
                          <User className="h-3 w-3" />
                        ) : msg.sender === 'ai' ? (
                          <Bot className="h-3 w-3" />
                        ) : (
                          <UserCheck className="h-3 w-3" />
                        )}
                        {msg.sender === 'customer' ? 'Customer' : msg.sender === 'ai' ? 'AI' : 'Agent'}
                      </div>
                      <p className="whitespace-pre-wrap">{msg.content}</p>
                      <p className="mt-1 text-xs opacity-70">
                        {new Date(msg.created_at).toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>
            </ScrollArea>

            {/* Message Input */}
            <form onSubmit={handleSendMessage} className="border-t p-4">
              <div className="flex gap-2">
                <Input
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Type a message..."
                  disabled={isSending}
                />
                <Button type="submit" disabled={isSending || !message.trim()}>
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </form>
          </>
        ) : (
          <div className="flex flex-1 items-center justify-center text-muted-foreground">
            Select a conversation to start chatting
          </div>
        )}
      </div>
    </div>
  )
}
