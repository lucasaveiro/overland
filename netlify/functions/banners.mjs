// netlify/functions/banners.mjs
import { createClient } from '@supabase/supabase-js'
import crypto from 'node:crypto'

// ===== Env / clients =====
const supabaseUrl = process.env.SUPABASE_URL
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
const SESSION_SECRET = (process.env.SESSION_SECRET || '').trim()

const supabase = createClient(supabaseUrl, serviceKey, { auth: { persistSession: false } })

const BUCKET = 'banner-images'

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
  return !!verify(getCookie(event.headers.cookie, 'session'))
}

// O link do banner vai para um href. Só http(s), e vazio é permitido: banner
// pode ser puramente decorativo.
function normalizeLink(value) {
  if (value === null || value === undefined || String(value).trim() === '') return { ok: true, value: null }
  try {
    const url = new URL(String(value).trim())
    if (url.protocol !== 'http:' && url.protocol !== 'https:') return { ok: false }
    return { ok: true, value: url.toString() }
  } catch {
    return { ok: false }
  }
}

async function purgeBannerImages(id) {
  const prefix = `banners/${id}`
  const { data: files, error: listError } = await supabase.storage.from(BUCKET).list(prefix, { limit: 1000 })
  if (listError) return `Banner removido, mas falhou ao listar as imagens: ${listError.message}`
  if (!files?.length) return null

  const { error: removeError } = await supabase.storage
    .from(BUCKET)
    .remove(files.map((f) => `${prefix}/${f.name}`))
  if (removeError) return `Banner removido, mas falhou ao apagar as imagens: ${removeError.message}`
  return null
}

// ===== Handler =====
export async function handler(event) {
  if (event.httpMethod === 'OPTIONS') return json(200, {}, event)

  try {
    if (!supabaseUrl || !serviceKey) return json(500, { error: 'Missing SUPABASE env vars' }, event)

    // Público: só os ativos, na ordem definida pelo admin.
    if (event.httpMethod === 'GET') {
      const params = event.queryStringParameters || {}
      let q = supabase.from('banners').select('*')
      if (!params.all) q = q.eq('active', true)
      const { data, error } = await q
        .order('sort_order', { ascending: true })
        .order('created_at', { ascending: true })
      if (error) return json(500, { error: error.message }, event)
      return json(200, data, event)
    }

    if (!(await requireAdmin(event))) return json(401, { error: 'Unauthorized' }, event)

    if (event.httpMethod === 'POST') {
      const body = JSON.parse(event.body || '{}')
      const imageUrl = body.imageUrl ?? body.image_url
      if (!imageUrl) return json(400, { error: 'Envie ou cole a imagem do banner' }, event)

      const link = normalizeLink(body.linkUrl ?? body.link_url)
      if (!link.ok) return json(400, { error: 'Link do banner inválido (use http ou https)' }, event)

      const payload = {
        id: body.id,
        title: body.title || null,
        image_url: imageUrl,
        link_url: link.value,
        active: body.active ?? true,
        sort_order: Number.isFinite(body.sortOrder) ? body.sortOrder : 0,
      }
      const { data, error } = await supabase.from('banners').insert(payload).select().single()
      if (error) return json(500, { error: error.message }, event)
      return json(200, data, event)
    }

    if (event.httpMethod === 'PUT') {
      const body = JSON.parse(event.body || '{}')
      if (!body.id) return json(400, { error: 'id is required' }, event)

      const rawLink = body.linkUrl ?? body.link_url
      let linkValue
      if (rawLink !== undefined) {
        const link = normalizeLink(rawLink)
        if (!link.ok) return json(400, { error: 'Link do banner inválido (use http ou https)' }, event)
        linkValue = link.value
      }

      const patch = {
        title: body.title,
        image_url: body.imageUrl ?? body.image_url,
        link_url: linkValue,
        active: body.active,
        sort_order: Number.isFinite(body.sortOrder) ? body.sortOrder : undefined,
      }
      const { data, error } = await supabase.from('banners').update(patch).eq('id', body.id).select().single()
      if (error) return json(500, { error: error.message }, event)
      return json(200, data, event)
    }

    if (event.httpMethod === 'DELETE') {
      const id = (event.queryStringParameters || {}).id
      if (!id) return json(400, { error: 'id is required' }, event)
      const { error } = await supabase.from('banners').delete().eq('id', id)
      if (error) return json(500, { error: error.message }, event)

      const warning = await purgeBannerImages(id)
      return warning ? json(200, { ok: true, warning }, event) : json(204, {}, event)
    }

    return json(405, { error: 'Method not allowed' }, event)
  } catch (e) {
    return json(500, { error: e.message || String(e) }, event)
  }
}
