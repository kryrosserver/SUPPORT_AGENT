'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Spinner } from '@/components/ui/spinner'
import { MessageSquare, AlertCircle } from 'lucide-react'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || 'Login failed')
        setIsLoading(false)
        return
      }

      router.push('/dashboard')
    } catch {
      setError('An error occurred. Please try again.')
      setIsLoading(false)
    }
  }

  return (
    <div 
      className="min-h-screen flex items-center justify-center"
      style={{ backgroundColor: '#F3F4F6' }}
    >
      {/* Login Card */}
      <div 
        className="w-full max-w-md px-8 py-10"
        style={{ 
          backgroundColor: '#FFFFFF',
          borderRadius: '16px',
          boxShadow: '0 10px 25px rgba(0,0,0,0.08)'
        }}
      >
        {/* Logo and Header */}
        <div className="text-center mb-8">
          <div 
            className="mx-auto mb-4 flex items-center justify-center rounded-xl"
            style={{
              width: '56px',
              height: '56px',
              backgroundColor: '#22C55E'
            }}
          >
            <MessageSquare className="h-7 w-7 text-white" />
          </div>
          <h1 
            className="text-2xl font-bold"
            style={{ color: '#111827' }}
          >
            KRYROS
          </h1>
          <p 
            className="mt-2 text-sm"
            style={{ color: '#6B7280' }}
          >
            Welcome Back
          </p>
          <p 
            className="text-sm"
            style={{ color: '#6B7280' }}
          >
            Sign in to your account
          </p>
        </div>

        {/* Login Form */}
        <form onSubmit={handleSubmit}>
          {/* Email Input */}
          <div className="mb-5">
            <label 
              className="text-sm font-medium mb-2 block"
              style={{ color: '#111827' }}
              htmlFor="email"
            >
              Email
            </label>
            <Input
              id="email"
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={isLoading}
              style={{
                height: '42px',
                border: '1px solid #E5E7EB',
                borderRadius: '8px'
              }}
            />
          </div>

          {/* Password Input */}
          <div className="mb-5">
            <div className="flex items-center justify-between mb-2">
              <label 
                className="text-sm font-medium"
                style={{ color: '#111827' }}
                htmlFor="password"
              >
                Password
              </label>
              <a 
                href="#" 
                className="text-sm"
                style={{ color: '#22C55E' }}
              >
                Forgot password?
              </a>
            </div>
            <Input
              id="password"
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={isLoading}
              style={{
                height: '42px',
                border: '1px solid #E5E7EB',
                borderRadius: '8px'
              }}
            />
          </div>

          {/* Remember Me */}
          <div className="flex items-center mb-6">
            <input
              type="checkbox"
              id="remember"
              className="mr-2"
              style={{ accentColor: '#22C55E' }}
            />
            <label 
              htmlFor="remember" 
              className="text-sm"
              style={{ color: '#6B7280' }}
            >
              Remember me
            </label>
          </div>

          {/* Error Message */}
          {error && (
            <div 
              className="flex items-center gap-2 text-sm mb-4 p-3 rounded-lg"
              style={{ 
                backgroundColor: '#FEF2F2',
                color: '#DC2626'
              }}
            >
              <AlertCircle className="h-4 w-4" />
              {error}
            </div>
          )}

          {/* Sign In Button */}
          <Button 
            type="submit" 
            className="w-full"
            disabled={isLoading}
            style={{
              height: '48px',
              backgroundColor: '#22C55E',
              borderRadius: '10px',
              color: 'white',
              fontWeight: '500'
            }}
          >
            {isLoading ? (
              <>
                <Spinner className="mr-2" />
                Signing in...
              </>
            ) : (
              'Sign In'
            )}
          </Button>
        </form>
      </div>
    </div>
  )
}
