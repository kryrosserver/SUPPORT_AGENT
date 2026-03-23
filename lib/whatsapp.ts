import makeWASocket, { 
  DisconnectReason, 
  useMultiFileAuthState, 
  fetchLatestBaileysVersion,
  makeCacheableSignalKeyStore,
} from '@whiskeysockets/baileys'
import { Boom } from '@hapi/boom'
import pino from 'pino'
import path from 'path'
import fs from 'fs'
import QRCode from 'qrcode-svg'
import { sql } from './db'
import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

// Store WhatsApp instances per user
const whatsappInstances = new Map<string, WhatsAppInstance>()

// WhatsApp status stored in database per user
export interface UserWhatsAppStatus {
  connected: boolean
  qrCode: string | null
  phone: string | null
  error: string | null
  userId: number
}

class WhatsAppInstance {
  public userId: number
  public status: UserWhatsAppStatus
  private sock: any = null
  private authDir: string

  constructor(userId: number) {
    this.userId = userId
    this.authDir = path.join(process.cwd(), 'whatsapp_auth', `user_${userId}`)
    this.status = {
      connected: false,
      qrCode: null,
      phone: null,
      error: null,
      userId: userId
    }
  }

  async connect() {
    // Ensure auth directory exists for this user
    if (!fs.existsSync(this.authDir)) {
      fs.mkdirSync(this.authDir, { recursive: true })
    }

    if (this.sock) {
      console.log(`Closing existing WhatsApp connection for user ${this.userId}...`)
      try {
        await this.sock.logout()
      } catch (e) {
        console.log('Error logging out:', e)
      }
      this.sock.ev.removeAllListeners('connection.update')
      this.sock.ev.removeAllListeners('creds.update')
      this.sock.ev.removeAllListeners('messages.upsert')
    }

    try {
      const { state, saveCreds } = await useMultiFileAuthState(this.authDir)
      const { version } = await fetchLatestBaileysVersion()

      this.sock = makeWASocket({
        version,
        auth: {
          creds: state.creds,
          keys: makeCacheableSignalKeyStore(state.keys, pino({ level: 'silent' })),
        },
        logger: pino({ level: 'silent' }),
      })

      this.sock.ev.on('creds.update', saveCreds)

      this.sock.ev.on('connection.update', (update: any) => {
        const { connection, lastDisconnect, qr } = update
        console.log(`WhatsApp connection update for user ${this.userId}:`, { connection, qr: !!qr })

        if (qr) {
          console.log('Generating QR code SVG...')
          const qrSvg = new QRCode(qr).svg()
          const qrDataUrl = `data:image/svg+xml;base64,${Buffer.from(qrSvg).toString('base64')}`
          this.status.qrCode = qrDataUrl
          this.status.connected = false
          this.status.error = null
          this.saveStatus()
        }

        if (connection === 'close') {
          const shouldReconnect = (lastDisconnect?.error as Boom)?.output?.statusCode !== DisconnectReason.loggedOut
          this.status.connected = false
          this.status.qrCode = null
          this.status.phone = null
          
          if (shouldReconnect) {
            this.connect()
          } else {
            this.status.error = 'Logged out. Please scan QR code again.'
          }
          this.saveStatus()
        } else if (connection === 'open') {
          this.status.connected = true
          this.status.qrCode = null
          this.status.phone = this.sock.user.id.split(':')[0]
          this.status.error = null
          console.log(`WhatsApp connection opened for user ${this.userId}!`)
          this.saveStatus()
          
          // Load existing chats
          this.loadExistingChats()
        }
      })

      this.sock.ev.on('messages.upsert', async (m: any) => {
        const msg = m.messages[0]
        if (!msg.key.fromMe && m.type === 'notify') {
          await this.handleIncomingMessage(msg)
        }
      })

      return this.sock
    } catch (error) {
      console.error(`Error connecting to WhatsApp for user ${this.userId}:`, error)
      this.status.error = `Connection failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      throw error
    }
  }

  async handleIncomingMessage(msg: any) {
    const senderId = msg.key.remoteJid
    const text = msg.message?.conversation || msg.message?.extendedTextMessage?.text
    
    if (!text) return

    const phone = senderId.split('@')[0]
    
    try {
      // 1. Get or create contact for this user
      let contacts = await sql`SELECT id, name FROM contacts WHERE phone = ${phone} AND user_id = ${this.userId}`
      let contactId: number

      if (contacts.length === 0) {
        const newContact = await sql`INSERT INTO contacts (phone, name, user_id) VALUES (${phone}, ${msg.pushName || 'WhatsApp User'}, ${this.userId}) RETURNING id`
        contactId = newContact[0].id
      } else {
        contactId = contacts[0].id
      }

      // 2. Get or create conversation for this user
      let conversations = await sql`SELECT id, status FROM conversations WHERE contact_id = ${contactId} AND user_id = ${this.userId}`
      let conversationId: number
      let status: 'AI' | 'HUMAN'

      if (conversations.length === 0) {
        const newConversation = await sql`INSERT INTO conversations (contact_id, status, user_id) VALUES (${contactId}, 'AI', ${this.userId}) RETURNING id, status`
        conversationId = newConversation[0].id
        status = 'AI'
      } else {
        conversationId = conversations[0].id
        status = conversations[0].status
      }

      // 3. Save incoming message
      await sql`INSERT INTO messages (conversation_id, sender, content, user_id) VALUES (${conversationId}, 'customer', ${text}, ${this.userId})`
      await sql`UPDATE conversations SET last_message = ${text}, updated_at = CURRENT_TIMESTAMP WHERE id = ${conversationId}`

      // 4. Handle AI response if in AI mode
      if (status === 'AI') {
        // Get user settings for AI behavior
        const settings = await sql`SELECT key, value FROM settings WHERE user_id = ${this.userId} AND key IN ('ai_enabled', 'ai_system_prompt', 'human_takeover_keywords')`
        const aiEnabled = settings.find(s => s.key === 'ai_enabled')?.value !== 'false'
        const systemPrompt = settings.find(s => s.key === 'ai_system_prompt')?.value || 'You are a helpful assistant.'
        const keywordsSetting = settings.find(s => s.key === 'human_takeover_keywords')?.value || 'human,agent,support,help'
        const keywords = keywordsSetting.split(',').map((k: string) => k.trim().toLowerCase())
        
        const needsTakeover = keywords.some((k: string) => text.toLowerCase().includes(k))

        if (needsTakeover) {
          await sql`UPDATE conversations SET status = 'HUMAN' WHERE id = ${conversationId}`
          await this.sock.sendMessage(senderId, { text: "I've notified a human agent to help you. One moment please." })
          await sql`INSERT INTO messages (conversation_id, sender, content, user_id) VALUES (${conversationId}, 'ai', "I've notified a human agent to help you. One moment please.", ${this.userId})`
        } else if (aiEnabled) {
          const response = await this.getAIResponse(text, conversationId, senderId, systemPrompt)
          await this.sock.sendMessage(senderId, { text: response })
          await sql`INSERT INTO messages (conversation_id, sender, content, user_id) VALUES (${conversationId}, 'ai', ${response}, ${this.userId})`
        }
      }
    } catch (err) {
      console.error(`Error handling message for user ${this.userId}:`, err)
    }
  }

  async loadExistingChats() {
    if (!this.sock) return
    
    try {
      console.log(`Loading existing WhatsApp chats for user ${this.userId}...`)
      const chats = await this.sock.getChats()
      
      for (const chat of chats) {
        if (chat.id.includes('broadcast') || chat.id.includes('status')) continue
        
        const phone = chat.id.split('@')[0]
        if (phone === this.status.phone) continue
        
        try {
          let contacts = await sql`SELECT id, name FROM contacts WHERE phone = ${phone} AND user_id = ${this.userId}`
          let contactId: number

          if (contacts.length === 0) {
            const newContact = await sql`INSERT INTO contacts (phone, name, user_id) VALUES (${phone}, ${chat.name || 'WhatsApp User'}, ${this.userId}) RETURNING id`
            contactId = newContact[0].id
          } else {
            contactId = contacts[0].id
          }

          let conversations = await sql`SELECT id, status FROM conversations WHERE contact_id = ${contactId} AND user_id = ${this.userId}`
          let conversationId: number

          if (conversations.length === 0) {
            const newConversation = await sql`INSERT INTO conversations (contact_id, status, user_id) VALUES (${contactId}, 'AI', ${this.userId}) RETURNING id, status`
            conversationId = newConversation[0].id
          } else {
            conversationId = conversations[0].id
          }

          const messages = await this.sock.fetchMessagesFromWA(chat.id, { limit: 50 })
          
          for (const msg of messages) {
            if (!msg.message) continue
            
            const msgSender = msg.key.fromMe ? 'agent' : 'customer'
            const text = msg.message?.conversation || msg.message?.extendedTextMessage?.text || msg.message?.imageMessage?.caption || ''
            
            if (!text) continue
            
            await sql`INSERT INTO messages (conversation_id, sender, content, user_id, created_at) VALUES (${conversationId}, ${msgSender}, ${text}, ${this.userId}, ${new Date(msg.messageTimestamp * 1000).toISOString()})`
          }
          
          const lastMsg = messages[messages.length - 1]
          if (lastMsg?.message) {
            const text = lastMsg.message?.conversation || lastMsg.message?.extendedTextMessage?.text || lastMsg.message?.imageMessage?.caption || 'Media message'
            await sql`UPDATE conversations SET last_message = ${text}, updated_at = ${new Date(lastMsg.messageTimestamp * 1000).toISOString()} WHERE id = ${conversationId}`
          }
          
          console.log(`Loaded chat for ${phone} with ${messages.length} messages`)
        } catch (err) {
          console.error(`Error loading chat for ${phone}:`, err)
        }
      }
      
      console.log(`Finished loading existing chats for user ${this.userId}`)
    } catch (err) {
      console.error(`Error loading existing chats for user ${this.userId}:`, err)
    }
  }

  async getAIResponse(userMessage: string, conversationId: number, senderId?: string, systemPrompt?: string): Promise<string> {
    try {
      // Get user-specific settings
      const settings = await sql`SELECT key, value FROM settings WHERE user_id = ${this.userId} AND key IN ('ai_enabled', 'ai_system_prompt')`
      const aiEnabled = settings.find(s => s.key === 'ai_enabled')?.value !== 'false'
      const prompt = systemPrompt || settings.find(s => s.key === 'ai_system_prompt')?.value || 'You are a helpful assistant.'

      if (!aiEnabled) return "AI is currently disabled."

      // Check Content Filters
      const filters = await sql`SELECT * FROM content_filters WHERE user_id = ${this.userId} AND is_active = true`
      for (const filter of filters) {
        if (userMessage.toLowerCase().includes(filter.keyword.toLowerCase())) {
          if (filter.filter_type === 'block') {
            continue
          } else if (filter.filter_type === 'warning') {
            return filter.response_message || "I can't help with that."
          } else if (filter.filter_type === 'escalate') {
            await sql`UPDATE conversations SET status = 'HUMAN' WHERE id = ${conversationId}`
            return filter.response_message || "I've notified a human agent to help you."
          }
        }
      }

      // Check Response Templates
      const templates = await sql`SELECT * FROM response_templates WHERE user_id = ${this.userId} AND is_active = true`
      for (const template of templates) {
        const keywords = template.trigger_keywords.split(',').map((k: string) => k.trim().toLowerCase())
        if (keywords.some((k: string) => userMessage.toLowerCase().includes(k))) {
          return template.response
        }
      }

      // Check FAQs
      const faqs = await sql`SELECT * FROM faqs WHERE user_id = ${this.userId} AND is_active = true`
      for (const faq of faqs) {
        const questionWords = faq.question.toLowerCase().split(' ')
        if (questionWords.some((word: string) => word.length > 3 && userMessage.toLowerCase().includes(word))) {
          return faq.answer
        }
      }

      // Get product info
      const products = await sql`SELECT * FROM product_info WHERE user_id = ${this.userId} AND is_active = true`
      let productInfo = ''
      for (const product of products) {
        if (userMessage.toLowerCase().includes(product.title.toLowerCase()) || 
            userMessage.toLowerCase().includes(product.category.toLowerCase())) {
          productInfo += `\n\n${product.title}: ${product.description}${product.price ? ` - ${product.price}` : ''}`
        }
      }

      // Get message history
      const history = await sql`
        SELECT sender, content 
        FROM messages 
        WHERE conversation_id = ${conversationId} AND user_id = ${this.userId}
        ORDER BY created_at DESC 
        LIMIT 10
      `
      
      let knowledgeContext = ''
      
      if (faqs.length > 0) {
        knowledgeContext += '\n\nFAQs:\n'
        faqs.forEach((faq: any) => {
          knowledgeContext += `Q: ${faq.question}\nA: ${faq.answer}\n`
        })
      }
      
      if (products.length > 0) {
        knowledgeContext += '\nProducts/Services:\n'
        products.forEach((product: any) => {
          knowledgeContext += `- ${product.title}: ${product.description}${product.price ? ` (${product.price})` : ''}\n`
        })
      }

      const enhancedSystemPrompt = prompt + knowledgeContext

      const messages: any[] = [
        { role: 'system', content: enhancedSystemPrompt },
        ...history.reverse().map((m: any) => ({
          role: m.sender === 'customer' ? 'user' : 'assistant',
          content: m.content
        }))
      ]

      const completion = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: messages,
      })

      return completion.choices[0].message.content || "I'm sorry, I couldn't generate a response."
    } catch (err) {
      console.error('OpenAI Error:', err)
      return "I'm having trouble connecting to my AI brain right now. Please try again later."
    }
  }

  async disconnect() {
    if (this.sock) {
      await this.sock.logout()
      this.sock = null
      this.status.connected = false
      this.status.qrCode = null
      this.status.phone = null
      this.status.error = null
      this.saveStatus()
    }
  }

  async reset() {
    await this.disconnect()
    if (fs.existsSync(this.authDir)) {
      fs.rmSync(this.authDir, { recursive: true, force: true })
    }
    await this.connect()
  }

  async saveStatus() {
    // Store status in database
    try {
      await sql`
        INSERT INTO whatsapp_status (user_id, connected, phone, error, updated_at)
        VALUES (${this.userId}, ${this.status.connected}, ${this.status.phone}, ${this.status.error}, CURRENT_TIMESTAMP)
        ON CONFLICT (user_id) DO UPDATE SET
          connected = EXCLUDED.connected,
          phone = EXCLUDED.phone,
          error = EXCLUDED.error,
          updated_at = CURRENT_TIMESTAMP
      `
    } catch (e) {
      console.error('Error saving WhatsApp status:', e)
    }
  }

  async loadStatus() {
    try {
      const result = await sql`SELECT connected, phone, error FROM whatsapp_status WHERE user_id = ${this.userId}`
      if (result.length > 0) {
        this.status.connected = result[0].connected
        this.status.phone = result[0].phone
        this.status.error = result[0].error
      }
    } catch (e) {
      console.error('Error loading WhatsApp status:', e)
    }
  }
}

// Get or create WhatsApp instance for a user
export function getWhatsAppInstance(userId: number): WhatsAppInstance {
  let instance = whatsappInstances.get(String(userId))
  if (!instance) {
    instance = new WhatsAppInstance(userId)
    whatsappInstances.set(String(userId), instance)
  }
  return instance
}

// Get status for a user
export async function getWhatsAppStatus(userId: number) {
  const instance = getWhatsAppInstance(userId)
  await instance.loadStatus()
  return instance.status
}

// Connect WhatsApp for a user
export async function connectToWhatsApp(userId: number) {
  const instance = getWhatsAppInstance(userId)
  return await instance.connect()
}

// Disconnect WhatsApp for a user
export async function disconnectWhatsApp(userId: number) {
  const instance = getWhatsAppInstance(userId)
  await instance.disconnect()
}

// Reset WhatsApp for a user
export async function resetWhatsApp(userId: number) {
  const instance = getWhatsAppInstance(userId)
  await instance.reset()
}

// Export the singleton for backward compatibility (super_admin)
export const whatsappStatus: UserWhatsAppStatus = {
  connected: false,
  qrCode: null,
  phone: null,
  error: null,
  userId: 0
}
