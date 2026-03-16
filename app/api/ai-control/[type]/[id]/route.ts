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

    // Only super admins and admins can modify AI control
    if (session.role !== 'super_admin' && session.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const data = await request.json()

    let tableName: string
    let updateFields: string[] = []

    switch (type) {
      case 'faq':
        tableName = 'faqs'
        if (data.question) updateFields.push(`question = '${data.question}'`)
        if (data.answer) updateFields.push(`answer = '${data.answer}'`)
        if (data.category) updateFields.push(`category = '${data.category}'`)
        if (typeof data.is_active === 'boolean') updateFields.push(`is_active = ${data.is_active}`)
        break
      case 'template':
        tableName = 'response_templates'
        if (data.title) updateFields.push(`title = '${data.title}'`)
        if (data.trigger_keywords) updateFields.push(`trigger_keywords = '${data.triggerKeywords}'`)
        if (data.response) updateFields.push(`response = '${data.response}'`)
        if (data.category) updateFields.push(`category = '${data.category}'`)
        if (typeof data.is_active === 'boolean') updateFields.push(`is_active = ${data.is_active}`)
        break
      case 'filter':
        tableName = 'content_filters'
        if (data.keyword) updateFields.push(`keyword = '${data.keyword}'`)
        if (data.filter_type) updateFields.push(`filter_type = '${data.filterType}'`)
        if (data.response_message) updateFields.push(`response_message = '${data.responseMessage}'`)
        if (typeof data.is_active === 'boolean') updateFields.push(`is_active = ${data.is_active}`)
        break
      case 'product':
        tableName = 'product_info'
        if (data.title) updateFields.push(`title = '${data.title}'`)
        if (data.description) updateFields.push(`description = '${data.description}'`)
        if (data.category) updateFields.push(`category = '${data.category}'`)
        if (data.price) updateFields.push(`price = '${data.price}'`)
        if (typeof data.is_active === 'boolean') updateFields.push(`is_active = ${data.is_active}`)
        break
      default:
        return NextResponse.json({ error: 'Invalid type' }, { status: 400 })
    }

    if (updateFields.length === 0) {
      return NextResponse.json({ error: 'No fields to update' }, { status: 400 })
    }

    updateFields.push(`updated_at = CURRENT_TIMESTAMP`)

    const query = `UPDATE ${tableName} SET ${updateFields.join(', ')} WHERE id = ${id} RETURNING *`
    const result = await sql.query(query)

    return NextResponse.json({ success: true, data: result[0] })
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

    // Only super admins and admins can delete AI control items
    if (session.role !== 'super_admin' && session.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    let tableName: string

    switch (type) {
      case 'faq':
        tableName = 'faqs'
        break
      case 'template':
        tableName = 'response_templates'
        break
      case 'filter':
        tableName = 'content_filters'
        break
      case 'product':
        tableName = 'product_info'
        break
      default:
        return NextResponse.json({ error: 'Invalid type' }, { status: 400 })
    }

    await sql`DELETE FROM ${sql(tableName)} WHERE id = ${id}`

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting AI control data:', error)
    return NextResponse.json({ error: 'Failed to delete data' }, { status: 500 })
  }
}
