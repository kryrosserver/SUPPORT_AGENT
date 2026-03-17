import { NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { sql } from '@/lib/db'

interface RouteParams {
  params: Promise<{ type: string; id: string }>
}

export async function PUT(request: Request, { params }: RouteParams) {
  try {
    const session = await getSession()
    const { type, id } = await params
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (session.role !== 'super_admin' && session.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const data = await request.json()

    try {
      let result

      switch (type) {
        case 'faq':
          result = await sql`
            UPDATE faqs 
            SET question = ${data.question}, answer = ${data.answer}, category = ${data.category}, updated_at = NOW()
            WHERE id = ${id}
            RETURNING *
          `
          break
        case 'template':
          result = await sql`
            UPDATE response_templates 
            SET title = ${data.title}, trigger_keywords = ${data.triggerKeywords}, response = ${data.response}, category = ${data.category}, updated_at = NOW()
            WHERE id = ${id}
            RETURNING *
          `
          break
        case 'filter':
          result = await sql`
            UPDATE content_filters 
            SET keyword = ${data.keyword}, filter_type = ${data.filterType}, response_message = ${data.responseMessage}
            WHERE id = ${id}
            RETURNING *
          `
          break
        case 'product':
          result = await sql`
            UPDATE product_info 
            SET title = ${data.title}, description = ${data.description}, category = ${data.category}, price = ${data.price}, updated_at = NOW()
            WHERE id = ${id}
            RETURNING *
          `
          break
        default:
          return NextResponse.json({ error: 'Invalid type' }, { status: 400 })
      }

      if (result && result.length > 0) {
        return NextResponse.json({ success: true, data: result[0] })
      } else {
        return NextResponse.json({ error: 'Item not found' }, { status: 404 })
      }
    } catch (dbError) {
      console.error('Database error:', dbError)
      return NextResponse.json({ error: 'Database error' }, { status: 500 })
    }
  } catch (error) {
    console.error('Error updating AI control data:', error)
    return NextResponse.json({ error: 'Failed to update data' }, { status: 500 })
  }
}

export async function DELETE(request: Request, { params }: RouteParams) {
  try {
    const session = await getSession()
    const { type, id } = await params
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (session.role !== 'super_admin' && session.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    try {
      let result

      switch (type) {
        case 'faq':
          result = await sql`DELETE FROM faqs WHERE id = ${id} RETURNING id`
          break
        case 'template':
          result = await sql`DELETE FROM response_templates WHERE id = ${id} RETURNING id`
          break
        case 'filter':
          result = await sql`DELETE FROM content_filters WHERE id = ${id} RETURNING id`
          break
        case 'product':
          result = await sql`DELETE FROM product_info WHERE id = ${id} RETURNING id`
          break
        default:
          return NextResponse.json({ error: 'Invalid type' }, { status: 400 })
      }

      if (result && result.length > 0) {
        return NextResponse.json({ success: true })
      } else {
        return NextResponse.json({ error: 'Item not found' }, { status: 404 })
      }
    } catch (dbError) {
      console.error('Database error:', dbError)
      return NextResponse.json({ error: 'Database error' }, { status: 500 })
    }
  } catch (error) {
    console.error('Error deleting AI control data:', error)
    return NextResponse.json({ error: 'Failed to delete data' }, { status: 500 })
  }
}
