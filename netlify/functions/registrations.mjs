import { createClient } from '@supabase/supabase-js'
import crypto from 'node:crypto'

const supabaseUrl = process.env.SUPABASE_URL
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
const SESSION_SECRET = (process.env.SESSION_SECRET || '').trim()

const supabase = createClient(supabaseUrl, serviceKey, { auth: { persistSession: false } })

const json = (status, data, event) => {
  const origin = event?.headers?.origin || ''
  const cors = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': origin || '*',
    'Access-Control-Allow-Credentials': 'true',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Methods': 'GET,OPTIONS',
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

export async function handler(event) {
  if (event.httpMethod === 'OPTIONS') return json(200, {}, event)

  try {
    if (!supabaseUrl || !serviceKey) return json(500, { error: 'Missing SUPABASE env vars' }, event)

    const ok = await requireAdmin(event)
    if (!ok) return json(401, { error: 'Unauthorized' }, event)

    if (event.httpMethod === 'GET') {
      const params = event.queryStringParameters || {}
      const tripId = params.tripId || params.trip_id || params.id
      if (!tripId) return json(400, { error: 'tripId is required' }, event)
      const { data, error } = await supabase
        .from('registrations')
        .select('*')
        .eq('trip_id', tripId)
      if (error) return json(500, { error: error.message }, event)
      return json(200, data, event)
    }

    return json(405, { error: 'Method not allowed' }, event)
  } catch (e) {
    return json(500, { error: e.message || String(e) }, event)
  }
}
