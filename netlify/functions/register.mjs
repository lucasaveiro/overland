import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.SUPABASE_URL
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

const supabase = createClient(supabaseUrl, serviceKey, { auth: { persistSession: false } })

const json = (status, data) => ({
  statusCode: status,
  headers: {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
    "Access-Control-Allow-Methods": "POST,OPTIONS"
  },
  body: JSON.stringify(data)
})

export async function handler(event, context) {
  if (event.httpMethod === 'OPTIONS') return json(200, {})
  if (event.httpMethod !== 'POST') return json(405, { error: "Method not allowed" })
  try {
    if (!supabaseUrl || !serviceKey) return json(500, { error: "Missing SUPABASE env vars" })
    const body = JSON.parse(event.body || '{}')
    const { tripId, name, whatsapp, email } = body
    if (!tripId || !name || !whatsapp || !email) return json(400, { error: "tripId, name, whatsapp, email required" })

    // validate trip is upcoming
    const { data: trip } = await supabase.from('trips').select('id, date_time').eq('id', tripId).single()
    if (!trip) return json(404, { error: "Trip not found" })
    if (new Date(trip.date_time).getTime() < Date.now()) return json(400, { error: "Trip already happened" })

    const payload = { id: crypto.randomUUID(), trip_id: tripId, name, whatsapp, email }
    const { error } = await supabase.from('registrations').insert(payload)
    if (error) return json(500, { error: error.message })

    return json(200, { ok: true })
  } catch (e) {
    return json(500, { error: e.message || String(e) })
  }
}
