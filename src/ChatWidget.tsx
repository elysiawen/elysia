import { useCallback, useEffect, useRef, useState } from 'react'
import iconClose from './assets/wbchat_close.png'
import iconOpen from './assets/webchat_open.png'
import './ChatWidget.css'
import {
  CHARACTER_ID,
  createChatStream,
  createSession,
  getMessages,
  getSessionToken,
} from './lib/crypto'

interface Msg {
  id: string
  role: 'user' | 'assistant'
  content: string
}

let sessionReady: Promise<string> | null = null

function ensureSession() {
  if (!sessionReady) {
    const token = getSessionToken()
    sessionReady = createSession(token, CHARACTER_ID).then((s) => s.id)
  }
  return sessionReady
}

export default function ChatWidget() {
  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState<Msg[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [historyLoaded, setHistoryLoaded] = useState(false)
  const [showGreeting, setShowGreeting] = useState(false)
  const [greetingChars, setGreetingChars] = useState(0)
  const listRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)
  const abortRef = useRef<AbortController | null>(null)

  useEffect(() => {
    if (!open) return
    ensureSession().then(async (sid) => {
      if (historyLoaded) return
      try {
        const hist = await getMessages(sid)
        if (hist.length) {
          setMessages(
            hist.map((m) => ({
              id: m.id,
              role: m.role,
              content: m.content,
            })),
          )
        } else {
          const greeting = '嗨~ 期待已久的相遇，是不是觉得，今天的我又比昨天更美丽了一点呢？快跟我聊聊吧，关于你的一切，我可都超级好奇哦~✨'
          setMessages([{
            id: crypto.randomUUID(),
            role: 'assistant',
            content: greeting,
          }])
        }
      } catch {
        // ignore history load errors
      }
      setHistoryLoaded(true)
    })
  }, [open, historyLoaded])

  useEffect(() => {
    const el = listRef.current
    if (el) el.scrollTop = el.scrollHeight
  }, [messages])

  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 350)
    }
  }, [open])

  useEffect(() => {
    if (!open) return
    const onDocClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement
      if (!target.closest('.chat-panel') && !target.closest('.chat-fab')) {
        setOpen(false)
      }
    }
    document.addEventListener('click', onDocClick)
    return () => document.removeEventListener('click', onDocClick)
  }, [open])

  useEffect(() => {
    const show = setTimeout(() => setShowGreeting(true), 300)
    const hide = setTimeout(() => setShowGreeting(false), 8300)
    return () => { clearTimeout(show); clearTimeout(hide) }
  }, [])

  const greetingText = '嗨~ 期待已久的相遇，是不是觉得，今天的我又比昨天更美丽了一点呢？快跟我聊聊吧，关于你的一切，我可都超级好奇哦~✨'

  useEffect(() => {
    if (!showGreeting) return
    let i = 0
    queueMicrotask(() => setGreetingChars(0))
    const t = setInterval(() => {
      i++
      setGreetingChars(i)
      if (i >= greetingText.length) clearInterval(t)
    }, 60)
    return () => clearInterval(t)
  }, [showGreeting])

  const send = useCallback(async () => {
    const text = input.trim()
    if (!text || loading) return

    setInput('')
    setError('')
    const userMsg: Msg = {
      id: crypto.randomUUID(),
      role: 'user',
      content: text,
    }
    setMessages((prev) => [...prev, userMsg])
    setLoading(true)

    try {
      const sessionId = await ensureSession()
      const assistantId = crypto.randomUUID()
      setMessages((prev) => [
        ...prev,
        { id: assistantId, role: 'assistant', content: '' },
      ])

      abortRef.current = new AbortController()
      const { stream, fallback } = createChatStream(text, sessionId, CHARACTER_ID)
      let acc = ''

      try {
        for await (const chunk of stream) {
          if (abortRef.current?.signal.aborted) break
          acc += chunk
          setMessages((prev) =>
            prev.map((m) =>
              m.id === assistantId ? { ...m, content: acc } : m,
            ),
          )
        }
      } catch {
        if (acc) {
          setMessages((prev) =>
            prev.map((m) =>
              m.id === assistantId
                ? { ...m, content: acc + '\n\n（回复中断，正在重试…）' }
                : m,
            ),
          )
          try {
            const full = await fallback()
            setMessages((prev) =>
              prev.map((m) =>
                m.id === assistantId ? { ...m, content: full } : m,
              ),
            )
          } catch {
            setMessages((prev) =>
              prev.map((m) =>
                m.id === assistantId ? { ...m, content: acc } : m,
              ),
            )
            throw new Error('回复中断，请重新发送')
          }
        } else {
          throw new Error('连接中断，请重试')
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : '发送失败')
      setMessages((prev) => prev.slice(0, -1))
    } finally {
      setLoading(false)
      abortRef.current = null
    }
  }, [input, loading])

  const handleKey = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      send()
    }
  }

  return (
    <>
      <div
        className={`chat-greeting ${showGreeting ? 'visible' : ''}`}
        onClick={() => { setShowGreeting(false); setOpen(true) }}
      >
        <p>{greetingText.slice(0, greetingChars)}</p>
        <span className="chat-greeting-arrow" />
      </div>

      <button
        className="chat-fab"
        onClick={() => { setShowGreeting(false); setOpen((v) => !v) }}
        aria-label={open ? '关闭聊天' : '打开聊天'}
      >
        <img src={open ? iconOpen : iconClose} alt="" />
      </button>

      <div className={`chat-panel ${open ? 'open' : ''}`}>
        <div className="chat-header">
          <div className="chat-header-left">
            <img
              className="chat-header-avatar"
              src="/rolemap/assets/images/avatar-elysia-02.png"
              alt=""
            />
            <div className="chat-header-info">
              <h3>爱莉希雅</h3>
              <p>Elysia · 在线</p>
            </div>
          </div>
          <button
            className="chat-close-btn"
            onClick={() => setOpen(false)}
            aria-label="关闭"
          >
            ✕
          </button>
        </div>

        <div className="chat-messages" ref={listRef}>
          {!historyLoaded && messages.length === 0 && (
            <div className="chat-msg assistant">
              <img
                className="chat-msg-avatar"
                src="/rolemap/assets/images/avatar-elysia-02.png"
                alt=""
              />
              <div className="chat-msg-bubble">
                <div className="chat-msg-typing">
                  <span /><span /><span />
                </div>
              </div>
            </div>
          )}
          {messages.map((m) => (
            <div key={m.id} className={`chat-msg ${m.role}`}>
              {m.role === 'assistant' && (
                <img
                  className="chat-msg-avatar"
                  src="/rolemap/assets/images/avatar-elysia-02.png"
                  alt=""
                />
              )}
              <div className="chat-msg-bubble">
                {m.content || (
                  <div className="chat-msg-typing">
                    <span /><span /><span />
                  </div>
                )}
              </div>
            </div>
          ))}
          {error && <div className="chat-error">{error}</div>}
        </div>

        <div className="chat-input-area">
          <textarea
            ref={inputRef}
            className="chat-input"
            placeholder="说点什么吧..."
            rows={1}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKey}
            disabled={loading}
          />
          <button
            className="chat-send-btn"
            onClick={send}
            disabled={!input.trim() || loading}
            aria-label="发送"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="22" y1="2" x2="11" y2="13" />
              <polygon points="22 2 15 22 11 13 2 9 22 2" />
            </svg>
          </button>
        </div>
      </div>
    </>
  )
}
