// netlify/functions/categories.mjs
// Categorias e subcategorias da loja. `?sub=1` opera nas subcategorias.
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
  return !!verify(getCookie(event.headers.cookie, 'session'))
}

// O slug vai para a URL da loja, então precisa ser ASCII e estável.
const slugify = (s) =>
  String(s || '')
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')

// ===== Handler =====
export async function handler(event) {
  if (event.httpMethod === 'OPTIONS') return json(200, {}, event)

  try {
    if (!supabaseUrl || !serviceKey) return json(500, { error: 'Missing SUPABASE env vars' }, event)
    const params = event.queryStringParameters || {}
    const isSub = params.sub === '1'

    // Público: categorias ativas com suas subcategorias aninhadas.
    if (event.httpMethod === 'GET') {
      let q = supabase
        .from('categories')
        .select('*, subcategories(id, name, slug, sort_order)')
      if (!params.all) q = q.eq('active', true)
      const { data, error } = await q.order('sort_order', { ascending: true })
      if (error) return json(500, { error: error.message }, event)

      const ordenado = (data || []).map((c) => ({
        ...c,
        subcategories: [...(c.subcategories || [])].sort((a, b) => a.sort_order - b.sort_order),
      }))
      return json(200, ordenado, event)
    }

    if (!(await requireAdmin(event))) return json(401, { error: 'Unauthorized' }, event)

    if (event.httpMethod === 'POST') {
      const body = JSON.parse(event.body || '{}')
      if (!body.name) return json(400, { error: 'name is required' }, event)

      if (isSub) {
        if (!body.categoryId) return json(400, { error: 'categoryId is required' }, event)
        const payload = {
          category_id: body.categoryId,
          name: body.name,
          slug: slugify(body.slug || body.name),
          sort_order: Number.isFinite(body.sortOrder) ? body.sortOrder : 0,
        }
        const { data, error } = await supabase.from('subcategories').insert(payload).select().single()
        if (error) return json(500, { error: error.message }, event)
        return json(200, data, event)
      }

      const payload = {
        name: body.name,
        slug: slugify(body.slug || body.name),
        description: body.description || null,
        icon: body.icon || 'shopping-bag',
        color: body.color || 'moss',
        sort_order: Number.isFinite(body.sortOrder) ? body.sortOrder : 0,
        active: body.active ?? true,
      }
      const { data, error } = await supabase.from('categories').insert(payload).select().single()
      if (error) return json(500, { error: error.message }, event)
      return json(200, data, event)
    }

    if (event.httpMethod === 'PUT') {
      const body = JSON.parse(event.body || '{}')
      if (!body.id) return json(400, { error: 'id is required' }, event)

      if (isSub) {
        const patch = {
          name: body.name,
          slug: body.slug !== undefined || body.name !== undefined
            ? slugify(body.slug || body.name)
            : undefined,
          sort_order: Number.isFinite(body.sortOrder) ? body.sortOrder : undefined,
        }
        const { data, error } = await supabase.from('subcategories').update(patch).eq('id', body.id).select().single()
        if (error) return json(500, { error: error.message }, event)
        return json(200, data, event)
      }

      const patch = {
        name: body.name,
        slug: body.slug !== undefined || body.name !== undefined
          ? slugify(body.slug || body.name)
          : undefined,
        description: body.description,
        icon: body.icon,
        color: body.color,
        sort_order: Number.isFinite(body.sortOrder) ? body.sortOrder : undefined,
        active: body.active,
      }
      const { data, error } = await supabase.from('categories').update(patch).eq('id', body.id).select().single()
      if (error) return json(500, { error: error.message }, event)
      return json(200, data, event)
    }

    // Apagar categoria leva junto suas subcategorias e os vínculos com produtos
    // (cascade no banco). O produto em si não é tocado.
    if (event.httpMethod === 'DELETE') {
      const id = params.id
      if (!id) return json(400, { error: 'id is required' }, event)
      const tabela = isSub ? 'subcategories' : 'categories'
      const { error } = await supabase.from(tabela).delete().eq('id', id)
      if (error) return json(500, { error: error.message }, event)
      return json(204, {}, event)
    }

    return json(405, { error: 'Method not allowed' }, event)
  } catch (e) {
    return json(500, { error: e.message || String(e) }, event)
  }
}
