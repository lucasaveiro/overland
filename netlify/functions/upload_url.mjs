// netlify/functions/upload_url.mjs
import { createClient } from '@supabase/supabase-js'
import crypto from 'node:crypto'

// ===== Env / clients =====
const supabaseUrl = process.env.SUPABASE_URL
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
const SESSION_SECRET = (process.env.SESSION_SECRET || '').trim()

const supabase = createClient(supabaseUrl, serviceKey, { auth: { persistSession: false } })

// Cada tipo tem seu bucket e seu prefixo. O prefixo agrupa por dono, o que faz
// a exclusão em cascata ser só varrer <prefix>/<ownerId>/.
const KINDS = {
  trip: { bucket: 'trip-images', prefix: 'trips' },
  product: { bucket: 'product-images', prefix: 'products' },
}

const EXT_BY_TYPE = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
  'image/avif': 'avif',
  'image/gif': 'gif',
}
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

// ===== Utils =====
const json = (status, data, event) => {
  const origin = event?.headers?.origin || ''
  const cors = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': origin || '*',
    'Access-Control-Allow-Credentials': 'true',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Methods': 'POST,DELETE,OPTIONS',
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
  return !!verify(getCookie(event.headers.cookie, 'session'))
}

// Descobre bucket e caminho a partir da URL pública. Devolve null para URL
// externa (colada à mão), que não é nossa para apagar.
function locateFromPublicUrl(url) {
  if (!url) return null
  for (const { bucket, prefix } of Object.values(KINDS)) {
    const marker = `/storage/v1/object/public/${bucket}/`
    const i = url.indexOf(marker)
    if (i === -1) continue
    const path = decodeURIComponent(url.slice(i + marker.length))
    if (!path.startsWith(`${prefix}/`)) return null
    return { bucket, path }
  }
  return null
}

// ===== Handler =====
export async function handler(event) {
  if (event.httpMethod === 'OPTIONS') return json(200, {}, event)

  try {
    if (!supabaseUrl || !serviceKey) return json(500, { error: 'Missing SUPABASE env vars' }, event)
    if (!(await requireAdmin(event))) return json(401, { error: 'Unauthorized' }, event)

    // Emite URL assinada para o navegador subir o arquivo direto no Supabase.
    // O arquivo nunca passa pela function (limite de 6 MB de payload no Lambda).
    if (event.httpMethod === 'POST') {
      const body = JSON.parse(event.body || '{}')
      const kind = body.kind || 'trip'
      const target = KINDS[kind]
      if (!target) return json(400, { error: `kind inválido: ${kind}` }, event)

      const ownerId = body.ownerId || body.tripId
      if (!UUID_RE.test(ownerId || '')) return json(400, { error: 'ownerId inválido' }, event)

      const ext = EXT_BY_TYPE[body.contentType]
      if (!ext) return json(400, { error: `Tipo não suportado: ${body.contentType}` }, event)

      const path = `${target.prefix}/${ownerId}/${crypto.randomUUID()}.${ext}`
      const { data, error } = await supabase.storage.from(target.bucket).createSignedUploadUrl(path)
      if (error) return json(500, { error: error.message }, event)

      return json(200, {
        signedUrl: data.signedUrl,
        token: data.token,
        path,
        publicUrl: `${supabaseUrl}/storage/v1/object/public/${target.bucket}/${path}`,
      }, event)
    }

    // Remove um objeto avulso (ex.: admin tira uma foto antes de salvar).
    if (event.httpMethod === 'DELETE') {
      const found = locateFromPublicUrl((event.queryStringParameters || {}).url)
      if (!found) return json(400, { error: 'url inválida' }, event)

      const { error } = await supabase.storage.from(found.bucket).remove([found.path])
      if (error) return json(500, { error: error.message }, event)
      return json(204, {}, event)
    }

    return json(405, { error: 'Method not allowed' }, event)
  } catch (e) {
    return json(500, { error: e.message || String(e) }, event)
  }
}
