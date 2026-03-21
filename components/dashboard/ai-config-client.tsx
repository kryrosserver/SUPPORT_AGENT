'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Spinner } from '@/components/ui/spinner'
import { Bot, Save, CheckCircle } from 'lucide-react'

interface AISettings {
  ai_enabled: boolean
  ai_system_prompt: string
  human_takeover_keywords: string
}

const DEFAULT_AI_SETTINGS: AISettings = {
  ai_enabled: true,
  ai_system_prompt: `You are the customer support assistant for KRYROS.

Company contact information:
Phone: +260 966 423 719
Email: kryrosmobile@gmail.com

Respond politely and clearly to customer questions.

If the customer asks to speak with a human agent, stop responding and allow a human support agent to take over.`,
  human_takeover_keywords: 'human,agent,support,help,talk to human',
}

export function AIConfigClient({ initialSettings }: { initialSettings?: Partial<AISettings> }) {
  const [settings, setSettings] = useState<AISettings>({ ...DEFAULT_AI_SETTINGS, ...initialSettings })
  const [isSaving, setIsSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  const handleSave = async () => {
    setIsSaving(true)
    setSaved(false)

    try {
      // Save to settings API
      await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
      })
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    } catch (error) {
      console.error('Failed to save AI settings:', error)
    }

    setIsSaving(false)
  }

  return (
    <div>
      {/* AI Configuration Card - More Prominent */}
      <div 
        className="bg-white"
        style={{ 
          borderRadius: '14px', 
          padding: '24px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.05)'
        }}
      >
        {/* Header */}
        <div className="flex items-center gap-3 mb-2">
          <div 
            className="flex items-center justify-center rounded-lg"
            style={{ 
              backgroundColor: '#22C55E',
              width: '40px',
              height: '40px'
            }}
          >
            <Bot className="h-5 w-5 text-white" />
          </div>
          <div>
            <h2 
              className="text-xl font-bold"
              style={{ color: '#111827' }}
            >
              AI Configuration
            </h2>
            <p 
              className="text-sm"
              style={{ color: '#6B7280' }}
            >
              Core AI settings for automatic responses
            </p>
          </div>
        </div>

        {/* Save Button - Prominent Position */}
        <div className="flex justify-end mb-6">
          <Button 
            onClick={handleSave} 
            disabled={isSaving}
            style={{
              height: '42px',
              backgroundColor: '#22C55E',
              borderRadius: '8px',
              color: 'white'
            }}
          >
            {isSaving ? (
              <>
                <Spinner className="mr-2" />
                Saving...
              </>
            ) : saved ? (
              <>
                <CheckCircle className="mr-2 h-4 w-4" />
                Saved
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Save Changes
              </>
            )}
          </Button>
        </div>

        <div className="space-y-6">
          {/* AI Enabled Switch - Prominent */}
          <div 
            className="p-4 rounded-xl border-2"
            style={{ 
              borderColor: settings.ai_enabled ? '#22C55E' : '#E5E7EB',
              backgroundColor: settings.ai_enabled ? '#F0FDF4' : '#F9FAFB'
            }}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div 
                  className="flex items-center justify-center rounded-full"
                  style={{
                    width: '44px',
                    height: '44px',
                    backgroundColor: settings.ai_enabled ? '#22C55E' : '#9CA3AF'
                  }}
                >
                  <Bot className="h-5 w-5 text-white" />
                </div>
                <div>
                  <label 
                    className="text-base font-semibold"
                    style={{ color: '#111827' }}
                    htmlFor="ai_enabled"
                  >
                    AI Responses
                  </label>
                  <p 
                    className="text-sm"
                    style={{ color: '#6B7280' }}
                  >
                    {settings.ai_enabled ? 'AI is actively responding to customers' : 'AI is disabled - customers will wait for human agents'}
                  </p>
                </div>
              </div>
              <Switch
                id="ai_enabled"
                checked={settings.ai_enabled}
                onCheckedChange={(checked) =>
                  setSettings({ ...settings, ai_enabled: checked })
                }
                style={{ 
                  backgroundColor: settings.ai_enabled ? '#22C55E' : '#9CA3AF'
                }}
              />
            </div>
          </div>

          {/* AI System Prompt */}
          <div>
            <label 
              className="text-sm font-semibold mb-2 block"
              style={{ color: '#111827' }}
              htmlFor="ai_system_prompt"
            >
              AI System Prompt
            </label>
            <Textarea
              id="ai_system_prompt"
              rows={10}
              value={settings.ai_system_prompt}
              onChange={(e) =>
                setSettings({ ...settings, ai_system_prompt: e.target.value })
              }
              placeholder="Instructions for the AI assistant..."
              style={{
                border: '1px solid #E5E7EB',
                borderRadius: '8px'
              }}
            />
            <p 
              className="text-sm mt-2"
              style={{ color: '#6B7280' }}
            >
              This prompt tells the AI how to behave when responding to customers. Be specific about your company policies and tone.
            </p>
          </div>

          {/* Human Takeover Keywords */}
          <div>
            <label 
              className="text-sm font-semibold mb-2 block"
              style={{ color: '#111827' }}
              htmlFor="human_takeover_keywords"
            >
              Human Takeover Keywords
            </label>
            <Input
              id="human_takeover_keywords"
              value={settings.human_takeover_keywords}
              onChange={(e) =>
                setSettings({ ...settings, human_takeover_keywords: e.target.value })
              }
              placeholder="human, agent, support, help, talk to human"
              style={{
                height: '42px',
                border: '1px solid #E5E7EB',
                borderRadius: '8px'
              }}
            />
            <p 
              className="text-sm mt-2"
              style={{ color: '#6B7280' }}
            >
              Comma-separated keywords. When customer uses these words, AI will stop and allow human agent to take over the conversation.
            </p>
          </div>
        </div>
      </div>

      {/* Quick Tips Card */}
      <div 
        className="mt-6 bg-blue-50"
        style={{ 
          borderRadius: '14px', 
          padding: '20px',
          border: '1px solid #BFDBFE'
        }}
      >
        <h3 className="font-semibold text-blue-900 mb-2">💡 Quick Tips</h3>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• Keep the system prompt clear and concise</li>
          <li>• Include your company contact information</li>
          <li>• Add common questions to FAQs tab for better responses</li>
          <li>• Use Templates for automated responses to specific triggers</li>
        </ul>
      </div>
    </div>
  )
}
