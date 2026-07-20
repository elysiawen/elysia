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

interface SessionRecord {
  id: string
  token: string
  preview: string
  createdAt: number
}

const HISTORY_KEY = 'elysia-chat-sessions'
const GREETING = '嗨~ 期待已久的相遇，是不是觉得，今天的我又比昨天更美丽了一点呢？快跟我聊聊吧，关于你的一切，我可都超级好奇哦~✨'

function getHistory(): SessionRecord[] {
  try {
    return JSON.parse(localStorage.getItem(HISTORY_KEY) || '[]')
  } catch {
    return []
  }
}

function saveHistory(list: SessionRecord[]) {
  localStorage.setItem(HISTORY_KEY, JSON.stringify(list))
}

function addToHistory(record: SessionRecord) {
  const list = getHistory().filter((r) => r.id !== record.id)
  list.unshift(record)
  if (list.length > 10) list.length = 10
  saveHistory(list)
}

function removeFromHistory(sessionId: string) {
  saveHistory(getHistory().filter((r) => r.id !== sessionId))
}

function formatTime(ts: number): string {
  const d = new Date(ts)
  const now = new Date()
  const pad = (n: number) => String(n).padStart(2, '0')
  const hm = `${pad(d.getHours())}:${pad(d.getMinutes())}`
  const isToday =
    d.getFullYear() === now.getFullYear() &&
    d.getMonth() === now.getMonth() &&
    d.getDate() === now.getDate()
  if (isToday) return hm
  const yesterday = new Date(now)
  yesterday.setDate(yesterday.getDate() - 1)
  const isYesterday =
    d.getFullYear() === yesterday.getFullYear() &&
    d.getMonth() === yesterday.getMonth() &&
    d.getDate() === yesterday.getDate()
  if (isYesterday) return `昨天 ${hm}`
  return `${d.getMonth() + 1}/${d.getDate()} ${hm}`
}

let sessionReady: Promise<string> | null = null

function ensureSession() {
  if (!sessionReady) {
    const token = getSessionToken()
    sessionReady = createSession(token, CHARACTER_ID).then((s) => {
      // 创建会话时立刻存入历史，确保 token 不会丢失
      if (!getHistory().some((r) => r.id === s.id)) {
        addToHistory({
          id: s.id,
          token,
          preview: '新会话',
          createdAt: Date.now(),
        })
      }
      return s.id
    })
  }
  return sessionReady
}

function resetSession() {
  sessionReady = null
  const newToken = crypto.randomUUID()
  localStorage.setItem('elysia-chat-session', newToken)
}

function WarnIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="8" x2="12" y2="12" />
      <line x1="12" y1="16" x2="12.01" y2="16" />
    </svg>
  )
}

function ConfirmOverlay({ onCancel, children }: { onCancel: () => void; children: React.ReactNode }) {
  return (
    <div className="chat-confirm-overlay" onClick={onCancel}>
      <div className="chat-confirm-dialog" onClick={(e) => e.stopPropagation()}>
        <div className="chat-confirm-icon"><WarnIcon /></div>
        {children}
      </div>
    </div>
  )
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
  const [showHistory, setShowHistory] = useState(false)
  const [sessionHistory, setSessionHistory] = useState<SessionRecord[]>([])
  const [pendingDelete, setPendingDelete] = useState<string | null>(null)
  const [pendingNewSession, setPendingNewSession] = useState(false)
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null)
  const listRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)
  const abortRef = useRef<AbortController | null>(null)
  const activeSidRef = useRef<string | null>(null)

  useEffect(() => {
    if (!open) return
    ensureSession().then(async (sid) => {
      activeSidRef.current = sid
      setActiveSessionId(sid)
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
          // 用实际第一条消息更新历史预览
          const history = getHistory()
          const record = history.find((r) => r.id === sid)
          if (record) {
            const firstUser = hist.find((m) => m.role === 'user')
            if (firstUser) {
              record.preview = firstUser.content.length > 30
                ? firstUser.content.slice(0, 30) + '…'
                : firstUser.content
              saveHistory(history)
            }
          }
        } else {
          setMessages([{
            id: crypto.randomUUID(),
            role: 'assistant',
            content: GREETING,
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

  const greetingText = GREETING

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
      activeSidRef.current = sessionId
      setActiveSessionId(sessionId)
      // 更新历史预览（会话已由 ensureSession 创建时存入）
      const history = getHistory()
      const record = history.find((r) => r.id === sessionId)
      if (record) {
        record.preview = text.length > 30 ? text.slice(0, 30) + '…' : text
        saveHistory(history)
      }
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

  const handleNewSession = useCallback(() => {
    if (getHistory().length >= 10) {
      setPendingNewSession(true)
      return
    }
    doNewSession()
  }, [])

  const doNewSession = useCallback(() => {
    resetSession()
    setMessages([])
    setHistoryLoaded(false)
    setError('')
    setShowHistory(false)
  }, [])

  const handleSelectSession = useCallback((record: SessionRecord) => {
    // 切换到已存在的会话
    sessionReady = Promise.resolve(record.id)
    localStorage.setItem('elysia-chat-session', record.token)
    activeSidRef.current = record.id
    setActiveSessionId(record.id)

    setLoading(true)
    getMessages(record.id)
      .then((hist) => {
        if (hist.length) {
          setMessages(
            hist.map((m) => ({
              id: m.id,
              role: m.role,
              content: m.content,
            })),
          )
        } else {
          const greeting = GREETING
          setMessages([{
            id: crypto.randomUUID(),
            role: 'assistant',
            content: greeting,
          }])
        }
        setHistoryLoaded(true)
        setShowHistory(false)
      })
      .catch(() => {
        setError('加载会话失败')
        setShowHistory(false)
      })
      .finally(() => setLoading(false))
  }, [])

  const handleDeleteSession = useCallback((sessionId: string) => {
    removeFromHistory(sessionId)
    setSessionHistory(getHistory())
    // 如果正在删除的是当前活跃的会话，创建新会话
    if (activeSidRef.current === sessionId) {
      resetSession()
      setMessages([])
      setHistoryLoaded(false)
      setError('')
    }
  }, [])

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
          <div className="chat-header-actions">
            <button
              className={`chat-history-btn ${showHistory ? 'active' : ''}`}
              onClick={() => {
                setShowHistory((v) => {
                  if (!v) setSessionHistory(getHistory())
                  return !v
                })
              }}
              aria-label="历史会话"
              title="历史会话"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" />
                <polyline points="12 6 12 12 16 14" />
              </svg>
            </button>
            <button
              className="chat-new-session-btn"
              onClick={handleNewSession}
              aria-label="新建会话"
              title="新建会话"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 5v14M5 12h14" />
              </svg>
            </button>
            <button
              className="chat-close-btn"
              onClick={() => setOpen(false)}
              aria-label="关闭"
            >
              ✕
            </button>
          </div>
        </div>

        <div className="chat-messages" ref={listRef}>
          {showHistory ? (
            <div className="chat-history-view">
              <div className="chat-history-title">历史会话</div>
              <div className="chat-history-list">
                {sessionHistory.length === 0 ? (
                  <div className="chat-history-empty">暂无历史会话</div>
                ) : (
                  sessionHistory.map((session) => (
                    <div
                      key={session.id}
                      className="chat-history-item"
                      onClick={() => handleSelectSession(session)}
                    >
                      <div className="chat-history-item-avatar">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
                        </svg>
                      </div>
                      <div className="chat-history-item-main">
                        <span className="chat-history-item-preview">{session.preview}</span>
                        <span className="chat-history-item-time">{formatTime(session.createdAt)}</span>
                      </div>
                      {session.id === activeSessionId ? (
                        <span className="chat-history-item-current">当前</span>
                      ) : (
                      <button
                        className="chat-history-item-delete"
                        onClick={(e) => {
                          e.stopPropagation()
                          setPendingDelete(session.id)
                        }}
                        aria-label="删除"
                      >
                        ✕
                      </button>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          ) : (
            <>
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
            </>
          )}
        </div>

        {!showHistory && (
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
        )}

        {pendingDelete && (
          <ConfirmOverlay onCancel={() => setPendingDelete(null)}>
            <p className="chat-confirm-text">确定要删除该会话吗？</p>
            <p className="chat-confirm-warning">删除后不可恢复</p>
            <div className="chat-confirm-actions">
              <button
                className="chat-confirm-cancel"
                onClick={() => setPendingDelete(null)}
              >
                取消
              </button>
              <button
                className="chat-confirm-delete"
                onClick={() => {
                  handleDeleteSession(pendingDelete)
                  setPendingDelete(null)
                }}
              >
                确认删除
              </button>
            </div>
          </ConfirmOverlay>
        )}

        {pendingNewSession && (
          <ConfirmOverlay onCancel={() => setPendingNewSession(false)}>
            <p className="chat-confirm-text">历史会话已达上限（10个）</p>
            <p className="chat-confirm-warning">新建会话将自动移除最早的会话记录</p>
            <div className="chat-confirm-actions">
              <button
                className="chat-confirm-cancel"
                onClick={() => setPendingNewSession(false)}
              >
                取消
              </button>
              <button
                className="chat-confirm-delete"
                onClick={() => {
                  setPendingNewSession(false)
                  doNewSession()
                }}
              >
                继续新建
              </button>
            </div>
          </ConfirmOverlay>
        )}
      </div>
    </>
  )
}
