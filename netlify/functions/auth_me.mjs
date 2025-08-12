import crypto from 'crypto'
const SESSION_SECRET = (process.env.SESSION_SECRET || '').trim()

const json = (status, data, event) => {
  const origin = event?.headers?.origin || ''
  const cors = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': origin || '*',
    'Access-Control-Allow-Credentials': 'true',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET,OPTIONS',
    'Vary': 'Origin'
  }
  return { statusCode: status, headers: cors, body: JSON.stringify(data) }
}
function verify(token){
  if(!token || !SESSION_SECRET) return null
  const [body, sig] = token.split('.')
  const expected = crypto.createHmac('sha256', SESSION_SECRET).update(body).digest('base64url')
  if (sig !== expected) return null
  const payload = JSON.parse(Buffer.from(body, 'base64url').toString('utf8'))
  if (payload.exp < Math.floor(Date.now()/1000)) return null
  return payload
}
function getCookie(cookies, name){
  if (!cookies) return null
  const m = cookies.split(/; */).find(c=>c.startsWith(name+'='))
  return m ? decodeURIComponent(m.split('=')[1]) : null
}

export async function handler(event){
  if (event.httpMethod === 'OPTIONS') return json(200, {}, event)
  const token = getCookie(event.headers.cookie, 'session')
  const payload = verify(token)
  if(!payload) return json(401, { error: 'Unauthorized' }, event)
  return json(200, { ok: true, sub: payload.sub, exp: payload.exp }, event)
}
