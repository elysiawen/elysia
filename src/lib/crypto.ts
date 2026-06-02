const API_BASE = import.meta.env.VITE_API_BASE_URL as string
const API_SECRET = import.meta.env.VITE_API_SECRET as string

export const CHARACTER_ID = import.meta.env.VITE_CHARACTER_ID as string

const ERROR_MAP: Record<string, string> = {
  'Missing x-timestamp or x-signature header': '认证失败，请刷新页面重试',
  'Request expired (timestamp too old)': '请求已过期，请刷新页面重试',
  'Invalid timestamp': '时间戳无效，请刷新页面重试',
  'Authentication failed': '签名验证失败，请刷新页面重试',
  'Character is disabled': '该角色暂时无法聊天',
  'Character not found': '角色不存在',
  'Session not found': '会话已失效，请刷新页面重试',
  'Missing required fields: message, sessionId, characterId': '参数缺失',
  'Missing sessionToken or characterId': '参数缺失',
  'Missing sessionToken query parameter': '参数缺失',
  'Missing sessionId query parameter': '参数缺失',
}

function resolveError(raw: string | undefined): string {
  if (!raw) return '未知错误，请稍后重试'
  return ERROR_MAP[raw] ?? raw
}

export function getSessionToken(): string {
  const key = 'elysia-chat-session'
  let token = localStorage.getItem(key)
  if (!token) {
    token = crypto.randomUUID()
    localStorage.setItem(key, token)
  }
  return token
}

async function signRequest(
  method: string,
  path: string,
  body = '',
): Promise<Record<string, string>> {
  const timestamp = Math.floor(Date.now() / 1000).toString()
  const payload = `${timestamp}:${method}:${path}:${body}`

  const encoder = new TextEncoder()
  const key = await crypto.subtle.importKey(
    'raw',
    encoder.encode(API_SECRET),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign'],
  )
  const sig = await crypto.subtle.sign(
    'HMAC',
    key,
    encoder.encode(payload),
  )
  const signature = Array.from(new Uint8Array(sig))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')

  return {
    'Content-Type': 'application/json',
    'x-timestamp': timestamp,
    'x-signature': signature,
  }
}

export interface ChatMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  createdAt?: string
}

export interface Session {
  id: string
  sessionToken: string
  characterId: string
}

export async function createSession(
  sessionToken: string,
  characterId: string,
): Promise<Session> {
  const path = '/api/v1/sessions'
  const body = JSON.stringify({ sessionToken, characterId })
  const headers = await signRequest('POST', path, body)
  const res = await fetch(`${API_BASE}${path}`, {
    method: 'POST',
    headers,
    body,
  })
  const json = await res.json()
  if (!res.ok) throw new Error(resolveError(json.error))
  return json.data
}

export async function getMessages(
  sessionId: string,
): Promise<ChatMessage[]> {
  const path = `/api/v1/messages?sessionId=${sessionId}`
  const headers = await signRequest('GET', path)
  const res = await fetch(`${API_BASE}${path}`, { headers })
  const json = await res.json()
  if (!res.ok) throw new Error(resolveError(json.error))
  return json.data
}

export async function completeChat(
  message: string,
  sessionId: string,
  characterId: string,
): Promise<string> {
  const path = '/api/v1/chat/complete'
  const body = JSON.stringify({ message, sessionId, characterId })
  const headers = await signRequest('POST', path, body)
  const res = await fetch(`${API_BASE}${path}`, {
    method: 'POST',
    headers,
    body,
  })
  const json = await res.json()
  if (!res.ok) throw new Error(resolveError(json.error))
  return json.data.reply
}

export interface StreamResult {
  stream: AsyncGenerator<string>
  fallback: () => Promise<string>
}

export function createChatStream(
  message: string,
  sessionId: string,
  characterId: string,
): StreamResult {
  const path = '/api/v1/chat'
  const body = JSON.stringify({ message, sessionId, characterId })

  const doFetch = async () => {
    const headers = await signRequest('POST', path, body)
    return fetch(`${API_BASE}${path}`, {
      method: 'POST',
      headers,
      body,
    })
  }

  async function* gen(): AsyncGenerator<string> {
    const res = await doFetch()
    if (!res.ok) {
      const json = await res.json().catch(() => ({}))
      throw new Error(resolveError(json.error))
    }
    const reader = res.body!.getReader()
    const decoder = new TextDecoder()
    while (true) {
      const { done, value } = await reader.read()
      if (done) break
      yield decoder.decode(value, { stream: true })
    }
  }

  return {
    stream: gen(),
    fallback: () => completeChat(message, sessionId, characterId),
  }
}
