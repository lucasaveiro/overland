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
export async function handler(event){
  if (event.httpMethod === 'OPTIONS') return json(200, {}, event)
  // expira o cookie
  return {
    ...json(200, { ok: true }, event),
    headers: { ...json(200, {}, event).headers, 'Set-Cookie': 'session=; Path=/; Max-Age=0; HttpOnly; SameSite=Strict' }
  }
}
