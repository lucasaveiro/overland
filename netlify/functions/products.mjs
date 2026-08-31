// netlify/functions/products.mjs
import { createClient } from '@supabase/supabase-js'
import crypto from 'node:crypto'

// ===== Env / clients =====
const supabaseUrl = process.env.SUPABASE_URL
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
const SESSION_SECRET = (process.env.SESSION_SECRET || '').trim()

const supabase = createClient(supabaseUrl, serviceKey, { auth: { persistSession: false } })

const BUCKET = 'product-images'

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

// O link vai direto para um href. Só http(s) entra — bloqueia javascript: e afins.
function normalizeAffiliateUrl(value) {
  if (typeof value !== 'string' || !value.trim()) return null
  try {
    const url = new URL(value.trim())
    return url.protocol === 'http:' || url.protocol === 'https:' ? url.toString() : null
  } catch {
    return null
  }
}

// Apaga as fotos do produto varrendo o prefixo inteiro, o que leva junto
// órfãos de upload interrompido.
async function purgeProductImages(id) {
  const prefix = `products/${id}`
  const { data: files, error: listError } = await supabase.storage
    .from(BUCKET)
    .list(prefix, { limit: 1000 })
  if (listError) return `Produto removido, mas falhou ao listar as fotos: ${listError.message}`
  if (!files?.length) return null

  const { error: removeError } = await supabase.storage
    .from(BUCKET)
    .remove(files.map((f) => `${prefix}/${f.name}`))
  if (removeError) return `Produto removido, mas falhou ao apagar as fotos: ${removeError.message}`
  return null
}

// ===== Handler =====
export async function handler(event) {
  if (event.httpMethod === 'OPTIONS') return json(200, {}, event)

  try {
    if (!supabaseUrl || !serviceKey) return json(500, { error: 'Missing SUPABASE env vars' }, event)

    // Público: só os ativos. O admin usa ?all=1 para ver os pausados também.
    if (event.httpMethod === 'GET') {
      const params = event.queryStringParameters || {}
      let q = supabase.from('products').select('*')
      if (!params.all) q = q.eq('active', true)
      const { data, error } = await q.order('created_at', { ascending: false })
      if (error) return json(500, { error: error.message }, event)
      return json(200, data, event)
    }

    if (!(await requireAdmin(event))) return json(401, { error: 'Unauthorized' }, event)

    if (event.httpMethod === 'POST') {
      const body = JSON.parse(event.body || '{}')
      const affiliateUrl = normalizeAffiliateUrl(body.affiliateUrl ?? body.affiliate_url)
      if (!body.name) return json(400, { error: 'name is required' }, event)
      if (!affiliateUrl) return json(400, { error: 'Link do produto inválido (use http ou https)' }, event)

      const payload = {
        id: body.id,
        name: body.name,
        description: body.description || null,
        category: body.category || null,
        subcategory: body.subcategory || null,
        price: body.price ?? null,
        image_url: body.imageUrl ?? body.image_url ?? null,
        affiliate_url: affiliateUrl,
        active: body.active ?? true,
      }
      const { data, error } = await supabase.from('products').insert(payload).select().single()
      if (error) return json(500, { error: error.message }, event)
      return json(200, data, event)
    }

    if (event.httpMethod === 'PUT') {
      const body = JSON.parse(event.body || '{}')
      if (!body.id) return json(400, { error: 'id is required' }, event)

      const rawUrl = body.affiliateUrl ?? body.affiliate_url
      let affiliateUrl
      if (rawUrl !== undefined) {
        affiliateUrl = normalizeAffiliateUrl(rawUrl)
        if (!affiliateUrl) return json(400, { error: 'Link do produto inválido (use http ou https)' }, event)
      }

      const patch = {
        name: body.name,
        description: body.description,
        category: body.category,
        subcategory: body.subcategory,
        price: body.price,
        image_url: body.imageUrl ?? body.image_url,
        affiliate_url: affiliateUrl,
        active: body.active,
      }
      const { data, error } = await supabase.from('products').update(patch).eq('id', body.id).select().single()
      if (error) return json(500, { error: error.message }, event)
      return json(200, data, event)
    }

    if (event.httpMethod === 'DELETE') {
      const id = (event.queryStringParameters || {}).id
      if (!id) return json(400, { error: 'id is required' }, event)
      const { error } = await supabase.from('products').delete().eq('id', id)
      if (error) return json(500, { error: error.message }, event)

      const warning = await purgeProductImages(id)
      return warning ? json(200, { ok: true, warning }, event) : json(204, {}, event)
    }

    return json(405, { error: 'Method not allowed' }, event)
  } catch (e) {
    return json(500, { error: e.message || String(e) }, event)
  }
}
