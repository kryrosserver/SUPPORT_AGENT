import { NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { sql } from '@/lib/db'

interface RouteParams {
  params: Promise<{ id: string }>
}

export async function DELETE(request: Request, { params }: RouteParams) {
  try {
    const session = await getSession()
    const { id } = await params
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Only super admins can delete users
    if (session.role !== 'super_admin') {
      return NextResponse.json({ error: 'Forbidden - Super admin only' }, { status: 403 })
    }

    // Prevent self-deletion
    if (session.id === parseInt(id)) {
      return NextResponse.json({ error: 'Cannot delete your own account' }, { status: 400 })
    }

    // Check if user exists
    const existingUser = await sql`
      SELECT id FROM users WHERE id = ${id}
    `

    if (existingUser.length === 0) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Delete user
    await sql`
      DELETE FROM users WHERE id = ${id}
    `

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting user:', error)
    return NextResponse.json({ error: 'Failed to delete user' }, { status: 500 })
  }
}

export async function POST(request: Request, { params }: RouteParams) {
  try {
    const session = await getSession()
    const { id } = await params
    const { action } = await request.json()

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Only super admins can promote/demote users
    if (session.role !== 'super_admin') {
      return NextResponse.json({ error: 'Forbidden - Super admin only' }, { status: 403 })
    }

    // Prevent self-promotion/demotion
    if (session.id === parseInt(id)) {
      return NextResponse.json({ error: 'Cannot modify your own role' }, { status: 400 })
    }

    // Check if user exists
    const existingUser = await sql`
      SELECT id, role FROM users WHERE id = ${id}
    `

    if (existingUser.length === 0) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    let newRole: string

    if (action === 'promote') {
      // Can only promote to admin (super_admin is the highest)
      newRole = 'admin'
    } else if (action === 'demote') {
      // Demote to user
      newRole = 'user'
    } else {
      return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
    }

    // Update user role
    await sql`
      UPDATE users SET role = ${newRole} WHERE id = ${id}
    `

    return NextResponse.json({ 
      success: true, 
      user: { id: parseInt(id), role: newRole } 
    })
  } catch (error) {
    console.error('Error updating user:', error)
    return NextResponse.json({ error: 'Failed to update user' }, { status: 500 })
  }
}
