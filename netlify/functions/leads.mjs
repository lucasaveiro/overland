// netlify/functions/leads.mjs
// Solicitações comerciais que não são inscrição em passeio: proposta de marca,
// lista do Club, filme pessoal e interesse em Off Day. Inscrição em
// passeio continua em register.mjs / registrations.
import { createClient } from '@supabase/supabase-js'
import crypto from 'node:crypto'

const supabaseUrl = process.env.SUPABASE_URL
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
const SESSION_SECRET = (process.env.SESSION_SECRET || '').trim()

const supabase = createClient(supabaseUrl, serviceKey, { auth: { persistSession: false } })

const KINDS = ['brand', 'club', 'films', 'off_day']
const STATUSES = ['novo', 'em_contato', 'concluido']

const json = (status, data) => ({
  statusCode: status,
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(data),
})

function getCookie(cookies, name) {
  if (!cookies) return null
  const m = cookies.split(/; */).find((c) => c.startsWith(name + '='))
  return m ? decodeURIComponent(m.split('=')[1]) : null
}

function isAdmin(event) {
  const token = getCookie(event.headers.cookie, 'session')
  if (!token || !SESSION_SECRET) return false
  const [body, sig] = token.split('.')
  const expected = crypto.createHmac('sha256', SESSION_SECRET).update(body).digest('base64url')
  if (sig !== expected) return false
  const payload = JSON.parse(Buffer.from(body, 'base64url').toString('utf8'))
  return payload.exp >= Math.floor(Date.now() / 1000)
}

const text = (v, max) => (typeof v === 'string' ? v.trim().slice(0, max) : '')

// Só chaves e valores de texto curtos: o corpo vem de um formulário público.
function flatObject(obj, maxKeys, maxLen) {
  if (!obj || typeof obj !== 'object' || Array.isArray(obj)) return {}
  const out = {}
  for (const [k, v] of Object.entries(obj).slice(0, maxKeys)) {
    const value = text(String(v ?? ''), maxLen)
    if (value) out[text(k, 40)] = value
  }
  return out
}

export async function handler(event) {
  try {
    if (!supabaseUrl || !serviceKey) return json(500, { error: 'Missing SUPABASE env vars' })

    if (event.httpMethod === 'POST') {
      const body = JSON.parse(event.body || '{}')
      // Campo-isca invisível no formulário: quem preenche é robô. Responde ok
      // para não ensinar o robô a contornar.
      if (body.website) return json(200, { ok: true })

      // 'signature_day' é o nome antigo de 'off_day': quem ainda estiver com a
      // versão anterior do site aberta no navegador envia assim.
      const kind = text(body.kind, 30) === 'signature_day' ? 'off_day' : text(body.kind, 30)
      const name = text(body.name, 120)
      const email = text(body.email, 160)
      if (!KINDS.includes(kind)) return json(400, { error: 'Tipo de solicitação inválido.' })
      if (!name) return json(400, { error: 'Informe seu nome.' })
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return json(400, { error: 'Informe um e-mail válido.' })
      if (body.consent !== true) return json(400, { error: 'É preciso autorizar o contato para enviar.' })

      const { error } = await supabase.from('leads').insert({
        kind,
        name,
        email,
        whatsapp: text(body.whatsapp, 40) || null,
        company: text(body.company, 160) || null,
        details: flatObject(body.details, 20, 2000),
        source: flatObject(body.source, 12, 300),
        consent: true,
      })
      if (error) return json(500, { error: error.message })
      return json(200, { ok: true })
    }

    if (!isAdmin(event)) return json(401, { error: 'Unauthorized' })

    if (event.httpMethod === 'GET') {
      const { data, error } = await supabase
        .from('leads')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(500)
      if (error) return json(500, { error: error.message })
      return json(200, data)
    }

    if (event.httpMethod === 'PUT') {
      const body = JSON.parse(event.body || '{}')
      if (!body.id || !STATUSES.includes(body.status)) return json(400, { error: 'id e status são obrigatórios' })
      const { data, error } = await supabase.from('leads').update({ status: body.status }).eq('id', body.id).select().single()
      if (error) return json(500, { error: error.message })
      return json(200, data)
    }

    return json(405, { error: 'Method not allowed' })
  } catch (e) {
    return json(500, { error: e.message || String(e) })
  }
}
