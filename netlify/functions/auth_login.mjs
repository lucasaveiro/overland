import crypto from 'crypto'

const ADMIN_PASSWORD = (process.env.ADMIN_PASSWORD || '').trim()
const SESSION_SECRET = (process.env.SESSION_SECRET || '').trim()

const json = (status, data, event) => {
  const origin = event?.headers?.origin || ''
  const cors = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': origin || '*',
    'Access-Control-Allow-Credentials': 'true',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST,OPTIONS',
    'Vary': 'Origin'
  }
  return { statusCode: status, headers: cors, body: JSON.stringify(data) }
}

function sign(payload){
  const body = Buffer.from(JSON.stringify(payload)).toString('base64url')
  const sig = crypto.createHmac('sha256', SESSION_SECRET).update(body).digest('base64url')
  return `${body}.${sig}`
}

export async function handler(event) {
  if (event.httpMethod === 'OPTIONS') return json(200, {}, event)
  if (event.httpMethod !== 'POST') return json(405, { error: 'Method not allowed' }, event)

  if (!ADMIN_PASSWORD || !SESSION_SECRET) return json(500, { error: 'Missing env vars' }, event)

  const { password } = JSON.parse(event.body || '{}')
  if ((password || '') !== ADMIN_PASSWORD) return json(401, { error: 'Invalid credentials' }, event)

  const now = Math.floor(Date.now()/1000)
  const exp = now + 7*24*3600 // 7 dias
  const token = sign({ sub: 'admin', iat: now, exp })

  const secure = true // no Netlify é https
  const cookie = `session=${token}; HttpOnly; Secure=${secure? '': ''}; SameSite=Strict; Path=/; Max-Age=${7*24*3600}`

  return {
    ...json(200, { ok: true }, event),
    headers: { ...json(200, {}, event).headers, 'Set-Cookie': cookie }
  }
}
