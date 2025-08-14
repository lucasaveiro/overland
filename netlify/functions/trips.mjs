// netlify/functions/trips.mjs
import { createClient } from '@supabase/supabase-js'
import crypto from 'node:crypto'

// ===== Env / clients =====
const supabaseUrl = process.env.SUPABASE_URL
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
const SESSION_SECRET = (process.env.SESSION_SECRET || '').trim()

const supabase = createClient(supabaseUrl, serviceKey, { auth: { persistSession: false } })

// ===== Utils =====
const json = (status, data, event) => {
  const origin = event?.headers?.origin || ''
  const cors = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': origin || '*',
    'Access-Control-Allow-Credentials': 'true',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE,OPTIONS',
    'Vary': 'Origin',
  }
  return { statusCode: status, headers: cors, body: JSON.stringify(data) }
}

function getCookie(cookies, name) {
  if (!cookies) return null
  const m = cookies.split(/; */).find((c) => c.startsWith(name + '='))
  return m ? decodeURIComponent(m.split('=')[1]) : null
}

function verify(token) {
  if (!token || !SESSION_SECRET) return null
  const [body, sig] = token.split('.')
  const expected = crypto.createHmac('sha256', SESSION_SECRET).update(body).digest('base64url')
  if (sig !== expected) return null
  const payload = JSON.parse(Buffer.from(body, 'base64url').toString('utf8'))
  if (payload.exp < Math.floor(Date.now() / 1000)) return null
  return payload
}

async function requireAdmin(event) {
  const token = getCookie(event.headers.cookie, 'session')
  const payload = verify(token)
  return !!payload
}

// ===== Handler =====
export async function handler(event) {
  if (event.httpMethod === 'OPTIONS') return json(200, {}, event)

  try {
    if (!supabaseUrl || !serviceKey) return json(500, { error: 'Missing SUPABASE env vars' }, event)

    // Público: listar ou obter passeio específico
    if (event.httpMethod === 'GET') {
      const params = event.queryStringParameters || {}
      const id = params.id
      if (id) {
        const { data, error } = await supabase
          .from('trips')
          .select('*')
          .eq('id', id)
          .single()
        if (error) return json(404, { error: error.message }, event)
        return json(200, data, event)
      }
      const all = params.all === '1' || params.all === 'true'
      const upcoming = params.upcoming === '1' || params.upcoming === 'true'
      let q = supabase.from('trips').select('*')
      if (upcoming && !all) q = q.gte('date_time', new Date().toISOString())
      const { data, error } = await q.order('date_time', { ascending: true })
      if (error) return json(500, { error: error.message }, event)
      return json(200, data, event)
    }

    // Privado: exige sessão
    const ok = await requireAdmin(event)
    if (!ok) return json(401, { error: 'Unauthorized' }, event)

    if (event.httpMethod === 'POST') {
      const body = JSON.parse(event.body || '{}')
      const payload = {
        id: body.id,
        name: body.name,
        date_time: body.dateTime || body.date_time,
        location: body.location || null,
        description: body.description || null,
        images: body.images || [],
        price_car: body.priceCar ?? body.price_car ?? null,
        price_extra: body.priceExtra ?? body.price_extra ?? null,
      }
      if (!payload.name || !payload.date_time) return json(400, { error: 'name and date_time are required' }, event)
      const { data, error } = await supabase.from('trips').insert(payload).select().single()
      if (error) return json(500, { error: error.message }, event)
      return json(200, data, event)
    }

    if (event.httpMethod === 'PUT') {
      const body = JSON.parse(event.body || '{}')
      if (!body.id) return json(400, { error: 'id is required' }, event)
      const patch = {
        name: body.name,
        date_time: body.dateTime || body.date_time,
        location: body.location,
        description: body.description,
        images: body.images || [],
        price_car: body.priceCar ?? body.price_car,
        price_extra: body.priceExtra ?? body.price_extra,
      }
      const { data, error } = await supabase.from('trips').update(patch).eq('id', body.id).select().single()
      if (error) return json(500, { error: error.message }, event)
      return json(200, data, event)
    }

    if (event.httpMethod === 'DELETE') {
      const id = (event.queryStringParameters || {}).id
      if (!id) return json(400, { error: 'id is required' }, event)
      await supabase.from('registrations').delete().eq('trip_id', id)
      const { error } = await supabase.from('trips').delete().eq('id', id)
      if (error) return json(500, { error: error.message }, event)
      return json(204, {}, event)
    }

    return json(405, { error: 'Method not allowed' }, event)
  } catch (e) {
    return json(500, { error: e.message || String(e) }, event)
  }
}
