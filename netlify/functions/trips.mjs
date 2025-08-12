import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.SUPABASE_URL
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
const adminToken = process.env.ADMIN_TOKEN

const supabase = createClient(supabaseUrl, serviceKey, { auth: { persistSession: false } })

const json = (status, data) => ({
  statusCode: status,
  headers: {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
    "Access-Control-Allow-Methods": "GET,POST,PUT,DELETE,OPTIONS"
  },
  body: JSON.stringify(data)
})

export async function handler(event, context) {
  if (event.httpMethod === 'OPTIONS') return json(200, {})

  try {
    if (!supabaseUrl || !serviceKey) {
      return json(500, { error: "Missing SUPABASE env vars" })
    }

    if (event.httpMethod === 'GET') {
      const params = event.queryStringParameters || {}
      const all = params.all === '1' || params.all === 'true'
      const upcoming = params.upcoming === '1' || params.upcoming === 'true'
      let q = supabase.from('trips').select('*')
      if (upcoming && !all) q = q.gte('date_time', new Date().toISOString())
      const { data, error } = await q.order('date_time', { ascending: true })
      if (error) return json(500, { error: error.message })
      return json(200, data)
    }

    // Auth check for write operations
    const auth = event.headers['authorization'] || event.headers['Authorization']
    const token = auth?.startsWith('Bearer ') ? auth.slice(7) : null
    if (token !== adminToken) return json(401, { error: "Unauthorized" })

    if (event.httpMethod === 'POST') {
      const body = JSON.parse(event.body || '{}')
      const payload = {
        id: body.id,
        name: body.name,
        date_time: body.dateTime || body.date_time,
        location: body.location || null,
        description: body.description || null,
        images: body.images || []
      }
      if (!payload.name || !payload.date_time) return json(400, { error: "name and date_time are required" })
      const { data, error } = await supabase.from('trips').insert(payload).select().single()
      if (error) return json(500, { error: error.message })
      return json(200, data)
    }

    if (event.httpMethod === 'PUT') {
      const body = JSON.parse(event.body || '{}')
      if (!body.id) return json(400, { error: "id is required" })
      const patch = {
        name: body.name,
        date_time: body.dateTime || body.date_time,
        location: body.location,
        description: body.description,
        images: body.images || []
      }
      const { data, error } = await supabase.from('trips').update(patch).eq('id', body.id).select().single()
      if (error) return json(500, { error: error.message })
      return json(200, data)
    }

    if (event.httpMethod === 'DELETE') {
      const id = (event.queryStringParameters || {}).id
      if (!id) return json(400, { error: "id is required" })
      // remove registrations first
      await supabase.from('registrations').delete().eq('trip_id', id)
      const { error } = await supabase.from('trips').delete().eq('id', id)
      if (error) return json(500, { error: error.message })
      return json(204, {})
    }

    return json(405, { error: "Method not allowed" })
  } catch (e) {
    return json(500, { error: e.message || String(e) })
  }
}
