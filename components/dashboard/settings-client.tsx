'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Spinner } from '@/components/ui/spinner'
import { Building2, Bot, Save, CheckCircle } from 'lucide-react'

interface Settings {
  id?: number
  company_name: string
  support_phone: string
  support_email: string
  ai_enabled: boolean
  ai_system_prompt: string
  human_takeover_keywords: string
}

export function SettingsClient({ initialSettings }: { initialSettings: Settings }) {
  const [settings, setSettings] = useState<Settings>(initialSettings)
  const [isSaving, setIsSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  const handleSave = async () => {
    setIsSaving(true)
    setSaved(false)

    try {
      await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
      })
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    } catch (error) {
      console.error('Failed to save settings:', error)
    }

    setIsSaving(false)
  }

  return (
    <div>
      {/* Page Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 
            className="text-2xl font-bold"
            style={{ color: '#111827' }}
          >
            Settings
          </h1>
          <p 
            className="mt-1 text-sm"
            style={{ color: '#6B7280' }}
          >
            Configure your support dashboard
          </p>
        </div>
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

      {/* Settings Cards */}
      <div className="space-y-6">
        {/* Company Information Card */}
        <div 
          className="bg-white"
          style={{ 
            borderRadius: '14px', 
            padding: '24px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.05)'
          }}
        >
          <div className="flex items-center gap-2 mb-6">
            <Building2 className="h-5 w-5" style={{ color: '#22C55E' }} />
            <h2 
              className="text-lg font-semibold"
              style={{ color: '#111827' }}
            >
              Company Information
            </h2>
          </div>
          <p 
            className="text-sm mb-6"
            style={{ color: '#6B7280' }}
          >
            Your company details for customer support
          </p>

          <div className="space-y-4">
            {/* Company Name */}
            <div>
              <label 
                className="text-sm font-medium mb-2 block"
                style={{ color: '#111827' }}
                htmlFor="company_name"
              >
                Company Name
              </label>
              <Input
                id="company_name"
                value={settings.company_name}
                onChange={(e) =>
                  setSettings({ ...settings, company_name: e.target.value })
                }
                style={{
                  height: '42px',
                  border: '1px solid #E5E7EB',
                  borderRadius: '8px'
                }}
              />
            </div>

            {/* Support Phone */}
            <div>
              <label 
                className="text-sm font-medium mb-2 block"
                style={{ color: '#111827' }}
                htmlFor="support_phone"
              >
                Support Phone
              </label>
              <Input
                id="support_phone"
                value={settings.support_phone}
                onChange={(e) =>
                  setSettings({ ...settings, support_phone: e.target.value })
                }
                style={{
                  height: '42px',
                  border: '1px solid #E5E7EB',
                  borderRadius: '8px'
                }}
              />
            </div>

            {/* Support Email */}
            <div>
              <label 
                className="text-sm font-medium mb-2 block"
                style={{ color: '#111827' }}
                htmlFor="support_email"
              >
                Support Email
              </label>
              <Input
                id="support_email"
                type="email"
                value={settings.support_email}
                onChange={(e) =>
                  setSettings({ ...settings, support_email: e.target.value })
                }
                style={{
                  height: '42px',
                  border: '1px solid #E5E7EB',
                  borderRadius: '8px'
                }}
              />
            </div>
          </div>
        </div>

        {/* AI Configuration Card */}
        <div 
          className="bg-white"
          style={{ 
            borderRadius: '14px', 
            padding: '24px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.05)'
          }}
        >
          <div className="flex items-center gap-2 mb-6">
            <Bot className="h-5 w-5" style={{ color: '#22C55E' }} />
            <h2 
              className="text-lg font-semibold"
              style={{ color: '#111827' }}
            >
              AI Configuration
            </h2>
          </div>
          <p 
            className="text-sm mb-6"
            style={{ color: '#6B7280' }}
          >
            Configure automatic AI responses
          </p>

          <div className="space-y-4">
            {/* AI Enabled Switch */}
            <div>
              <div className="flex items-center justify-between">
                <div>
                  <label 
                    className="text-sm font-medium"
                    style={{ color: '#111827' }}
                    htmlFor="ai_enabled"
                  >
                    AI Responses Enabled
                  </label>
                  <p 
                    className="text-sm mt-1"
                    style={{ color: '#6B7280' }}
                  >
                    When enabled, AI will automatically respond to customer messages
                  </p>
                </div>
                <Switch
                  id="ai_enabled"
                  checked={settings.ai_enabled}
                  onCheckedChange={(checked) =>
                    setSettings({ ...settings, ai_enabled: checked })
                  }
                />
              </div>
            </div>

            {/* AI System Prompt */}
            <div className="mt-6">
              <label 
                className="text-sm font-medium mb-2 block"
                style={{ color: '#111827' }}
                htmlFor="ai_system_prompt"
              >
                AI System Prompt
              </label>
              <Textarea
                id="ai_system_prompt"
                rows={8}
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
                This prompt tells the AI how to behave when responding to customers
              </p>
            </div>

            {/* Human Takeover Keywords */}
            <div className="mt-6">
              <label 
                className="text-sm font-medium mb-2 block"
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
                placeholder="human, agent, support, help"
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
                Comma-separated list of keywords that trigger human takeover
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
