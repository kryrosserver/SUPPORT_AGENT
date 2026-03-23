'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Spinner } from '@/components/ui/spinner'
import { Building2, Save, CheckCircle, Users } from 'lucide-react'

interface Settings {
  company_name: string
  support_phone: string
  support_email: string
}

interface SuperAdminSettings {
  type: 'super_admin'
  settings: Record<number, Settings>
}

interface UserSettings {
  type: 'user'
  settings: Settings
}

type SettingsData = SuperAdminSettings | UserSettings

export function SettingsClient({ initialData, isSuperAdmin }: { initialData: SettingsData; isSuperAdmin: boolean }) {
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null)
  const [settings, setSettings] = useState<Settings>(
    initialData.type === 'user' 
      ? initialData.settings 
      : (initialData.type === 'super_admin' && Object.keys(initialData.settings).length > 0 
          ? initialData.settings[Number(Object.keys(initialData.settings)[0])]
          : { company_name: '', support_phone: '', support_email: '' })
  )
  const [isSaving, setIsSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  // For super admin, get list of users
  const allUserSettings = initialData.type === 'super_admin' ? initialData.settings : {}
  const userIds = Object.keys(allUserSettings).map(Number)

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

  const handleUserSelect = (userId: number) => {
    setSelectedUserId(userId)
    setSettings(allUserSettings[userId])
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
            {isSuperAdmin 
              ? 'Configure company information for all users' 
              : 'Configure your company information'
            }
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

      {/* Super Admin: User Selector */}
      {isSuperAdmin && userIds.length > 1 && (
        <div className="mb-6">
          <label 
            className="text-sm font-medium mb-2 block"
            style={{ color: '#111827' }}
          >
            Select User/Company
          </label>
          <div className="flex flex-wrap gap-2">
            {userIds.map(userId => (
              <Button
                key={userId}
                variant={selectedUserId === userId || (selectedUserId === null && userId === userIds[0]) ? 'default' : 'outline'}
                onClick={() => handleUserSelect(userId)}
                style={{
                  backgroundColor: selectedUserId === userId || (selectedUserId === null && userId === userIds[0]) ? '#22C55E' : 'transparent',
                  color: selectedUserId === userId || (selectedUserId === null && userId === userIds[0]) ? 'white' : '#6B7280',
                  border: '1px solid #E5E7EB'
                }}
              >
                <Users className="mr-2 h-4 w-4" />
                User #{userId}
              </Button>
            ))}
          </div>
        </div>
      )}

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
            Your company details for customer support - these details will be shown to customers
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

        {/* Note about AI Settings */}
        <div 
          className="bg-gray-50"
          style={{ 
            borderRadius: '14px', 
            padding: '20px',
            border: '1px solid #E5E7EB'
          }}
        >
          <div className="flex items-start gap-3">
            <div 
              className="flex items-center justify-center rounded-lg"
              style={{ 
                backgroundColor: '#22C55E',
                width: '36px',
                height: '36px',
                minWidth: '36px'
              }}
            >
              <Building2 className="h-4 w-4 text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-1">AI Settings Location</h3>
              <p className="text-sm text-gray-600">
                AI configuration (system prompt, enabled status, human takeover keywords) has been moved to <strong>AI Control → Configuration</strong> tab for better organization. This Settings page now only contains company information.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
