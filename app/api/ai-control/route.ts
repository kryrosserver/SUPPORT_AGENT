import { NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { sql } from '@/lib/db'

export async function GET(request: Request) {
  try {
    const session = await getSession()
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Only super admins and admins can access AI control
    if (session.role !== 'super_admin' && session.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type')

    let data

    try {
      switch (type) {
        case 'faqs':
          data = await sql`SELECT * FROM faqs ORDER BY created_at DESC`
          break
        case 'templates':
          data = await sql`SELECT * FROM response_templates ORDER BY created_at DESC`
          break
        case 'filters':
          data = await sql`SELECT * FROM content_filters ORDER BY created_at DESC`
          break
        case 'products':
          data = await sql`SELECT * FROM product_info ORDER BY created_at DESC`
          break
        default:
          // Return all data
          const [faqs, templates, filters, products] = await Promise.all([
            sql`SELECT * FROM faqs ORDER BY created_at DESC`,
            sql`SELECT * FROM response_templates ORDER BY created_at DESC`,
            sql`SELECT * FROM content_filters ORDER BY created_at DESC`,
            sql`SELECT * FROM product_info ORDER BY created_at DESC`
          ])
          data = { faqs, templates, filters, products }
      }
    } catch (dbError) {
      // Tables might not exist yet
      console.error('Database error:', dbError)
      return NextResponse.json([])
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error('Error fetching AI control data:', error)
    return NextResponse.json([])
  }
}

export async function POST(request: Request) {
  try {
    const session = await getSession()
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Only super admins and admins can modify AI control
    if (session.role !== 'super_admin' && session.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { type, data } = await request.json()

    let result

    switch (type) {
      case 'faq':
        result = await sql`
          INSERT INTO faqs (question, answer, category)
          VALUES (${data.question}, ${data.answer}, ${data.category || 'General'})
          RETURNING *
        `
        break
      case 'template':
        result = await sql`
          INSERT INTO response_templates (title, trigger_keywords, response, category)
          VALUES (${data.title}, ${data.triggerKeywords}, ${data.response}, ${data.category || 'General'})
          RETURNING *
        `
        break
      case 'filter':
        result = await sql`
          INSERT INTO content_filters (keyword, filter_type, response_message)
          VALUES (${data.keyword}, ${data.filterType || 'block'}, ${data.responseMessage})
          RETURNING *
        `
        break
      case 'product':
        result = await sql`
          INSERT INTO product_info (title, description, category, price)
          VALUES (${data.title}, ${data.description}, ${data.category || 'General'}, ${data.price})
          RETURNING *
        `
        break
      default:
        return NextResponse.json({ error: 'Invalid type' }, { status: 400 })
    }

    return NextResponse.json({ success: true, data: result[0] })
  } catch (error) {
    console.error('Error creating AI control data:', error)
    return NextResponse.json({ error: 'Failed to create data' }, { status: 500 })
  }
}
