'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { Spinner } from '@/components/ui/spinner'
import { UserCog, Plus, Shield, ShieldOff, Trash2, User, ShieldCheck, Crown } from 'lucide-react'

interface User {
  id: number
  name: string
  email: string
  role: string
  created_at: string
}

interface Session {
  id: number
  name: string
  email: string
  role: string
}

export default function UsersPage() {
  const router = useRouter()
  const [users, setUsers] = useState<User[]>([])
  const [session, setSession] = useState<Session | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isCreating, setIsCreating] = useState(false)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  
  // New user form
  const [newUser, setNewUser] = useState({
    name: '',
    email: '',
    password: '',
    role: 'user'
  })
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  useEffect(() => {
    checkSession()
  }, [])

  const checkSession = async () => {
    try {
      const response = await fetch('/api/auth/session')
      const data = await response.json()
      
      if (!data.user || data.user.role !== 'super_admin') {
        // Redirect to dashboard if not super admin
        router.push('/dashboard')
        return
      }
      
      setSession(data.user)
      fetchUsers()
    } catch (error) {
      console.error('Failed to check session:', error)
      router.push('/login')
    }
  }

  const fetchUsers = async () => {
    try {
      const response = await fetch('/api/users')
      const data = await response.json()
      
      if (response.ok) {
        setUsers(data.users)
      }
    } catch (error) {
      console.error('Failed to fetch users:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsCreating(true)
    setError('')
    setSuccess('')

    try {
      const response = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newUser)
      })

      const data = await response.json()

      if (response.ok) {
        setSuccess('User created successfully!')
        setNewUser({ name: '', email: '', password: '', role: 'user' })
        fetchUsers()
        setTimeout(() => {
          setIsDialogOpen(false)
          setSuccess('')
        }, 1500)
      } else {
        setError(data.error || 'Failed to create user')
      }
    } catch (error) {
      setError('An error occurred')
    } finally {
      setIsCreating(false)
    }
  }

  const handlePromoteUser = async (userId: number) => {
    try {
      const response = await fetch(`/api/users/${userId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'promote' })
      })

      if (response.ok) {
        fetchUsers()
      }
    } catch (error) {
      console.error('Failed to promote user:', error)
    }
  }

  const handleDemoteUser = async (userId: number) => {
    try {
      const response = await fetch(`/api/users/${userId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'demote' })
      })

      if (response.ok) {
        fetchUsers()
      }
    } catch (error) {
      console.error('Failed to demote user:', error)
    }
  }

  const handleDeleteUser = async (userId: number) => {
    try {
      const response = await fetch(`/api/users/${userId}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        fetchUsers()
      }
    } catch (error) {
      console.error('Failed to delete user:', error)
    }
  }

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'super_admin':
        return (
          <span
            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium"
            style={{ backgroundColor: '#8B5CF6', color: 'white' }}
          >
            <Crown className="h-3 w-3" />
            Super Admin
          </span>
        )
      case 'admin':
        return (
          <span
            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium"
            style={{ backgroundColor: '#3B82F6', color: 'white' }}
          >
            <ShieldCheck className="h-3 w-3" />
            Admin
          </span>
        )
      default:
        return (
          <span
            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium"
            style={{ backgroundColor: '#E5E7EB', color: '#6B7280' }}
          >
            <User className="h-3 w-3" />
            User
          </span>
        )
    }
  }

  if (isLoading || !session) {
    return (
      <div className="flex items-center justify-center h-[50vh]">
        <Spinner />
      </div>
    )
  }

  return (
    <div>
      {/* Page Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 
            className="text-2xl font-bold flex items-center gap-3"
            style={{ color: '#111827' }}
          >
            <UserCog className="h-7 w-7" style={{ color: '#22C55E' }} />
            User Management
          </h1>
          <p 
            className="mt-1 text-sm"
            style={{ color: '#6B7280' }}
          >
            Manage team members and their access levels
          </p>
        </div>

        {/* Create User Button */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button
              style={{
                height: '42px',
                backgroundColor: '#22C55E',
                borderRadius: '8px',
                color: 'white'
              }}
            >
              <Plus className="mr-2 h-4 w-4" />
              Add User
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New User</DialogTitle>
              <DialogDescription>
                Add a new team member to the dashboard
              </DialogDescription>
            </DialogHeader>
            
            <form onSubmit={handleCreateUser} className="space-y-4 mt-4">
              {error && (
                <div 
                  className="p-3 rounded-lg text-sm"
                  style={{ backgroundColor: '#FEF2F2', color: '#DC2626' }}
                >
                  {error}
                </div>
              )}
              
              {success && (
                <div 
                  className="p-3 rounded-lg text-sm"
                  style={{ backgroundColor: '#DCFCE7', color: '#166534' }}
                >
                  {success}
                </div>
              )}

              <div>
                <label 
                  className="text-sm font-medium mb-2 block"
                  style={{ color: '#111827' }}
                >
                  Full Name
                </label>
                <Input
                  value={newUser.name}
                  onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                  placeholder="John Doe"
                  required
                  style={{
                    height: '42px',
                    border: '1px solid #E5E7EB',
                    borderRadius: '8px'
                  }}
                />
              </div>

              <div>
                <label 
                  className="text-sm font-medium mb-2 block"
                  style={{ color: '#111827' }}
                >
                  Email Address
                </label>
                <Input
                  type="email"
                  value={newUser.email}
                  onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                  placeholder="john@example.com"
                  required
                  style={{
                    height: '42px',
                    border: '1px solid #E5E7EB',
                    borderRadius: '8px'
                  }}
                />
              </div>

              <div>
                <label 
                  className="text-sm font-medium mb-2 block"
                  style={{ color: '#111827' }}
                >
                  Password
                </label>
                <Input
                  type="password"
                  value={newUser.password}
                  onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                  placeholder="••••••••"
                  required
                  minLength={6}
                  style={{
                    height: '42px',
                    border: '1px solid #E5E7EB',
                    borderRadius: '8px'
                  }}
                />
              </div>

              <div>
                <label 
                  className="text-sm font-medium mb-2 block"
                  style={{ color: '#111827' }}
                >
                  Role
                </label>
                <select
                  value={newUser.role}
                  onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border"
                  style={{
                    height: '42px',
                    border: '1px solid #E5E7EB',
                    borderRadius: '8px'
                  }}
                >
                  <option value="user">User</option>
                  <option value="admin">Admin</option>
                </select>
              </div>

              <div className="flex gap-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsDialogOpen(false)}
                  className="flex-1"
                  style={{
                    height: '42px',
                    borderColor: '#E5E7EB',
                    borderRadius: '8px'
                  }}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isCreating}
                  className="flex-1"
                  style={{
                    height: '42px',
                    backgroundColor: '#22C55E',
                    borderRadius: '8px',
                    color: 'white'
                  }}
                >
                  {isCreating ? <Spinner className="mr-2" /> : null}
                  Create User
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Users Table Card */}
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
            All Users
          </h2>
          <p 
            className="text-sm mt-1"
            style={{ color: '#6B7280' }}
          >
            {users.length} user{users.length !== 1 ? 's' : ''} total
          </p>
        </div>

        {/* Card Content */}
        <div>
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Spinner />
            </div>
          ) : users.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <UserCog 
                className="mb-4 h-12 w-12" 
                style={{ color: '#6B7280' }} 
              />
              <p 
                className="text-lg font-medium"
                style={{ color: '#111827' }}
              >
                No users found
              </p>
              <p 
                className="mt-1"
                style={{ color: '#6B7280' }}
              >
                Create your first user to get started
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow style={{ backgroundColor: '#F9FAFB' }}>
                  <TableHead className="font-semibold" style={{ color: '#111827' }}>
                    Name
                  </TableHead>
                  <TableHead className="font-semibold" style={{ color: '#111827' }}>
                    Email
                  </TableHead>
                  <TableHead className="font-semibold" style={{ color: '#111827' }}>
                    Role
                  </TableHead>
                  <TableHead className="font-semibold" style={{ color: '#111827' }}>
                    Created
                  </TableHead>
                  <TableHead className="font-semibold text-right" style={{ color: '#111827' }}>
                    Actions
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((user) => (
                  <TableRow 
                    key={user.id}
                    style={{ 
                      height: '64px',
                      borderBottom: '1px solid #E5E7EB'
                    }}
                  >
                    <TableCell className="font-medium" style={{ color: '#111827' }}>
                      {user.name}
                    </TableCell>
                    <TableCell style={{ color: '#6B7280' }}>
                      {user.email}
                    </TableCell>
                    <TableCell>
                      {getRoleBadge(user.role)}
                    </TableCell>
                    <TableCell style={{ color: '#6B7280' }}>
                      {new Date(user.created_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        {/* Promote/Demote Button */}
                        {user.role === 'user' && (
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handlePromoteUser(user.id)}
                            title="Promote to Admin"
                          >
                            <Shield className="h-4 w-4" style={{ color: '#3B82F6' }} />
                          </Button>
                        )}
                        {user.role === 'admin' && (
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDemoteUser(user.id)}
                            title="Demote to User"
                          >
                            <ShieldOff className="h-4 w-4" style={{ color: '#6B7280' }} />
                          </Button>
                        )}
                        
                        {/* Delete Button (cannot delete super_admin) */}
                        {user.role !== 'super_admin' && (
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                title="Delete User"
                              >
                                <Trash2 className="h-4 w-4" style={{ color: '#DC2626' }} />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Delete User?</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Are you sure you want to delete {user.name}? This action cannot be undone.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction 
                                  onClick={() => handleDeleteUser(user.id)}
                                  style={{ backgroundColor: '#DC2626', color: 'white' }}
                                >
                                  Delete
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        )}
                      </div>
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
