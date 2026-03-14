'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { FieldGroup, Field, FieldLabel } from '@/components/ui/field'
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
    <div className="p-6">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Settings</h1>
          <p className="text-muted-foreground">Configure your support dashboard</p>
        </div>
        <Button onClick={handleSave} disabled={isSaving}>
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

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              Company Information
            </CardTitle>
            <CardDescription>Your company details for customer support</CardDescription>
          </CardHeader>
          <CardContent>
            <FieldGroup>
              <Field>
                <FieldLabel htmlFor="company_name">Company Name</FieldLabel>
                <Input
                  id="company_name"
                  value={settings.company_name}
                  onChange={(e) =>
                    setSettings({ ...settings, company_name: e.target.value })
                  }
                />
              </Field>
              <Field>
                <FieldLabel htmlFor="support_phone">Support Phone</FieldLabel>
                <Input
                  id="support_phone"
                  value={settings.support_phone}
                  onChange={(e) =>
                    setSettings({ ...settings, support_phone: e.target.value })
                  }
                />
              </Field>
              <Field>
                <FieldLabel htmlFor="support_email">Support Email</FieldLabel>
                <Input
                  id="support_email"
                  type="email"
                  value={settings.support_email}
                  onChange={(e) =>
                    setSettings({ ...settings, support_email: e.target.value })
                  }
                />
              </Field>
            </FieldGroup>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bot className="h-5 w-5" />
              AI Configuration
            </CardTitle>
            <CardDescription>Configure automatic AI responses</CardDescription>
          </CardHeader>
          <CardContent>
            <FieldGroup>
              <Field>
                <div className="flex items-center justify-between">
                  <div>
                    <FieldLabel htmlFor="ai_enabled">AI Responses Enabled</FieldLabel>
                    <p className="text-sm text-muted-foreground">
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
              </Field>
              <Field>
                <FieldLabel htmlFor="ai_system_prompt">AI System Prompt</FieldLabel>
                <Textarea
                  id="ai_system_prompt"
                  rows={8}
                  value={settings.ai_system_prompt}
                  onChange={(e) =>
                    setSettings({ ...settings, ai_system_prompt: e.target.value })
                  }
                  placeholder="Instructions for the AI assistant..."
                />
                <p className="mt-1 text-sm text-muted-foreground">
                  This prompt tells the AI how to behave when responding to customers
                </p>
              </Field>
              <Field>
                <FieldLabel htmlFor="human_takeover_keywords">Human Takeover Keywords</FieldLabel>
                <Input
                  id="human_takeover_keywords"
                  value={settings.human_takeover_keywords}
                  onChange={(e) =>
                    setSettings({ ...settings, human_takeover_keywords: e.target.value })
                  }
                  placeholder="human, agent, support, help"
                />
                <p className="mt-1 text-sm text-muted-foreground">
                  Comma-separated list of keywords that trigger human takeover
                </p>
              </Field>
            </FieldGroup>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
