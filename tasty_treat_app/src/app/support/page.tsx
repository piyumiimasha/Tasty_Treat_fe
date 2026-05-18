"use client"

import { useState, useRef, useEffect, useCallback } from "react"
import { Send, MessageCircle, Headphones, Truck } from "lucide-react"
import Link from "next/link"
import { getUserInfo } from "@/lib/api/auth"
import {
  ChatMsgDto,
  ConversationUserDto,
  getConversation,
  getConversationUsers,
  getDirectConversation,
  getDirectPartners,
  markDirectMessagesRead,
  markMessagesRead,
  sendMessage,
} from "@/lib/api/chat"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"

// ─── helpers ─────────────────────────────────────────────────────────────────

function initials(name: string) {
  return name.split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2)
}
function asUtc(iso: string) {
  return iso.endsWith("Z") || iso.includes("+") ? iso : iso + "Z"
}
function formatTime(iso: string) {
  return new Date(asUtc(iso)).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
}
function formatDate(iso: string) {
  const d = new Date(asUtc(iso))
  const today = new Date()
  if (d.toDateString() === today.toDateString()) return "Today"
  const yesterday = new Date(today)
  yesterday.setDate(today.getDate() - 1)
  if (d.toDateString() === yesterday.toDateString()) return "Yesterday"
  return d.toLocaleDateString()
}

// ─── Shared message bubble ────────────────────────────────────────────────────

function Bubble({ msg, isMe, avatarFallback, avatarClass }: {
  msg: ChatMsgDto
  isMe: boolean
  avatarFallback: string
  avatarClass: string
}) {
  return (
    <div className={`flex gap-2 ${isMe ? "flex-row-reverse" : "flex-row"}`}>
      {!isMe && (
        <div className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 mt-1 text-[10px] font-bold ${avatarClass}`}>
          {avatarFallback}
        </div>
      )}
      <div className={`max-w-[70%] flex flex-col gap-0.5 ${isMe ? "items-end" : "items-start"}`}>
        <div className={`px-3.5 py-2 rounded-2xl text-sm leading-relaxed ${
          isMe
            ? "bg-primary text-primary-foreground rounded-tr-sm"
            : "bg-muted/70 text-foreground rounded-tl-sm"
        }`}>
          {msg.msgTxt}
        </div>
        <span className="text-[10px] text-muted-foreground px-1">{formatTime(msg.createdAt)}</span>
      </div>
    </div>
  )
}

// ─── Shared message input ─────────────────────────────────────────────────────

function MessageInput({ placeholder, onSend, sending }: {
  placeholder: string
  onSend: (text: string) => Promise<void>
  sending: boolean
}) {
  const [value, setValue] = useState("")

  const submit = async () => {
    if (!value.trim() || sending) return
    await onSend(value.trim())
    setValue("")
  }

  return (
    <div className="flex gap-2 items-center px-4 py-3 border-t border-border/60 bg-background/80 flex-shrink-0">
      <input
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); submit() } }}
        placeholder={placeholder}
        className="flex-1 h-10 rounded-xl px-4 text-sm bg-muted/50 border border-border/60 outline-none focus:border-accent/50 transition-colors placeholder:text-muted-foreground"
      />
      <button
        onClick={submit}
        disabled={sending || !value.trim()}
        className="w-10 h-10 rounded-xl flex items-center justify-center text-white flex-shrink-0 disabled:opacity-40 transition-opacity"
        style={{ background: "linear-gradient(135deg, var(--primary), oklch(0.35 0.04 28))" }}
      >
        <Send className="w-4 h-4" />
      </button>
    </div>
  )
}

// ─── Admin view ───────────────────────────────────────────────────────────────

function AdminChat({ adminId }: { adminId: number }) {
  const [users, setUsers]             = useState<ConversationUserDto[]>([])
  const [selected, setSelected]       = useState<ConversationUserDto | null>(null)
  const [messages, setMessages]       = useState<ChatMsgDto[]>([])
  const [sending, setSending]         = useState(false)
  const [search, setSearch]           = useState("")
  const messagesRef                   = useRef<HTMLDivElement>(null)
  const shouldScroll                  = useRef(true)

  const loadUsers    = useCallback(async () => { try { setUsers(await getConversationUsers()) } catch {} }, [])
  const loadMessages = useCallback(async (uid: number) => { try { setMessages(await getConversation(uid)) } catch {} }, [])

  useEffect(() => { loadUsers(); const id = setInterval(loadUsers, 4000); return () => clearInterval(id) }, [loadUsers])
  useEffect(() => {
    if (!selected) return
    shouldScroll.current = true
    loadMessages(selected.userId)
    const id = setInterval(() => loadMessages(selected.userId), 3000)
    return () => clearInterval(id)
  }, [selected, loadMessages])
  useEffect(() => {
    const el = messagesRef.current
    if (!el) return
    const fn = () => { shouldScroll.current = el.scrollHeight - el.scrollTop - el.clientHeight < 80 }
    el.addEventListener("scroll", fn)
    return () => el.removeEventListener("scroll", fn)
  }, [selected])
  useEffect(() => {
    const el = messagesRef.current
    if (el && shouldScroll.current) el.scrollTop = el.scrollHeight
  }, [messages])

  const handleSend = async (text: string) => {
    if (!selected) return
    setSending(true)
    try {
      shouldScroll.current = true
      const msg = await sendMessage(adminId, text, selected.userId)
      setMessages(p => [...p, msg])
      loadUsers()
    } catch {} finally { setSending(false) }
  }

  const filtered = users.filter(u => u.name.toLowerCase().includes(search.toLowerCase()))

  return (
    <div className="flex flex-1 min-h-0 overflow-hidden rounded-2xl border border-border/60 bg-background shadow-sm">

      {/* Sidebar */}
      <aside className="w-72 flex-shrink-0 border-r border-border/50 flex flex-col overflow-hidden">
        <div className="px-4 py-3.5 border-b border-border/50 bg-muted/20 flex-shrink-0">
          <p className="text-sm font-bold text-primary mb-2.5">Customer Chats</p>
          <input
            placeholder="Search customers…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full h-8 rounded-lg px-3 text-xs bg-background border border-border/60 outline-none focus:border-accent/50 transition-colors placeholder:text-muted-foreground"
          />
        </div>
        <div className="flex-1 overflow-y-auto divide-y divide-border/30">
          {filtered.length === 0
            ? <p className="p-6 text-xs text-center text-muted-foreground">No conversations yet.</p>
            : filtered.map(u => (
              <button key={u.userId}
                onClick={() => { setSelected(u); markMessagesRead(u.userId).then(loadUsers) }}
                className={`w-full flex items-center gap-2.5 px-4 py-3 text-left transition-colors ${
                  selected?.userId === u.userId
                    ? "bg-accent/10 border-l-2 border-l-accent"
                    : "hover:bg-muted/40"
                }`}
              >
                <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 text-xs font-bold text-primary">
                  {initials(u.name)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-foreground truncate">{u.name}</span>
                    <span className="text-[10px] text-muted-foreground ml-1 flex-shrink-0">{formatDate(u.lastMessageAt)}</span>
                  </div>
                  <div className="flex items-center justify-between mt-0.5">
                    <p className="text-[11px] text-muted-foreground truncate">{u.lastMessage}</p>
                    {u.unreadCount > 0 && (
                      <span className="ml-1 h-4 min-w-[16px] px-1 rounded-full bg-accent text-white text-[9px] font-bold flex items-center justify-center flex-shrink-0">
                        {u.unreadCount}
                      </span>
                    )}
                  </div>
                </div>
              </button>
            ))
          }
        </div>
      </aside>

      {/* Conversation */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {selected ? (
          <>
            <div className="flex items-center gap-3 px-5 py-3.5 border-b border-border/50 bg-muted/10 flex-shrink-0">
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary">
                {initials(selected.name)}
              </div>
              <div>
                <p className="text-sm font-semibold text-primary">{selected.name}</p>
                <p className="text-[11px] text-muted-foreground">Customer</p>
              </div>
            </div>
            <div ref={messagesRef} className="flex-1 overflow-y-auto min-h-0 px-5 py-4 space-y-3">
              {messages.map(msg => (
                <Bubble key={msg.msgId} msg={msg} isMe={msg.senderId === adminId}
                  avatarFallback={initials(msg.senderName || selected.name)}
                  avatarClass="bg-muted text-foreground" />
              ))}
            </div>
            <MessageInput
              placeholder={`Reply to ${selected.name}…`}
              onSend={handleSend}
              sending={sending}
            />
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center gap-3 text-muted-foreground">
            <MessageCircle className="w-10 h-10 opacity-20" />
            <p className="text-sm font-medium">Select a customer to view their conversation</p>
          </div>
        )}
      </div>
    </div>
  )
}

// ─── User view ────────────────────────────────────────────────────────────────

type UserPanel = { kind: "admin" } | { kind: "direct"; partnerId: number; partnerName: string }

function UserChat({ userId }: { userId: number }) {
  const [panel, setPanel]       = useState<UserPanel>({ kind: "admin" })
  const [partners, setPartners] = useState<ConversationUserDto[]>([])
  const [messages, setMessages] = useState<ChatMsgDto[]>([])
  const [sending, setSending]   = useState(false)
  const messagesRef             = useRef<HTMLDivElement>(null)
  const shouldScroll            = useRef(true)

  const loadPartners = useCallback(async () => {
    try { setPartners(await getDirectPartners(userId)) } catch {}
  }, [userId])

  const loadMessages = useCallback(async () => {
    try {
      setMessages(
        panel.kind === "admin"
          ? await getConversation(userId)
          : await getDirectConversation(userId, panel.partnerId)
      )
    } catch {}
  }, [panel, userId])

  useEffect(() => { loadPartners(); const id = setInterval(loadPartners, 5000); return () => clearInterval(id) }, [loadPartners])
  useEffect(() => {
    shouldScroll.current = true
    loadMessages()
    const id = setInterval(loadMessages, 3000)
    return () => clearInterval(id)
  }, [loadMessages])
  useEffect(() => {
    const el = messagesRef.current
    if (!el) return
    const fn = () => { shouldScroll.current = el.scrollHeight - el.scrollTop - el.clientHeight < 80 }
    el.addEventListener("scroll", fn)
    return () => el.removeEventListener("scroll", fn)
  }, [panel])
  useEffect(() => {
    const el = messagesRef.current
    if (el && shouldScroll.current) el.scrollTop = el.scrollHeight
  }, [messages])

  const handleSend = async (text: string) => {
    setSending(true)
    try {
      shouldScroll.current = true
      const msg = await sendMessage(userId, text, panel.kind === "direct" ? panel.partnerId : undefined)
      setMessages(p => [...p, msg])
    } catch {} finally { setSending(false) }
  }

  const isAdminPanel  = panel.kind === "admin"
  const headerName    = isAdminPanel ? "Baker Support" : panel.partnerName
  const headerSub     = isAdminPanel ? "Typically replies within a few hours" : "Delivery team"

  return (
    <div className="flex flex-1 min-h-0 overflow-hidden rounded-2xl border border-border/60 bg-background shadow-sm">

      {/* Sidebar */}
      <aside className="w-64 flex-shrink-0 border-r border-border/50 flex flex-col overflow-hidden">
        <div className="px-4 py-3.5 border-b border-border/50 bg-muted/20 flex-shrink-0">
          <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Messages</p>
        </div>

        {/* Baker Support thread */}
        <button
          onClick={() => setPanel({ kind: "admin" })}
          className={`w-full flex items-center gap-3 px-4 py-3.5 text-left transition-colors border-b border-border/30 ${
            isAdminPanel ? "bg-accent/10 border-l-2 border-l-accent" : "hover:bg-muted/40"
          }`}
        >
          <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
            <Headphones className="w-4 h-4 text-primary" />
          </div>
          <div>
            <p className="text-xs font-semibold text-foreground">Baker Support</p>
            <p className="text-[11px] text-muted-foreground mt-0.5">9 AM – 6 PM</p>
          </div>
        </button>

        {/* Delivery threads */}
        {partners.map(p => (
          <button
            key={p.userId}
            onClick={() => {
              setPanel({ kind: "direct", partnerId: p.userId, partnerName: p.name })
              markDirectMessagesRead(p.userId, userId).then(loadPartners).catch(() => {})
            }}
            className={`w-full flex items-center gap-3 px-4 py-3.5 text-left transition-colors border-b border-border/30 ${
              panel.kind === "direct" && panel.partnerId === p.userId
                ? "bg-accent/10 border-l-2 border-l-accent"
                : "hover:bg-muted/40"
            }`}
          >
            <div className="w-9 h-9 rounded-full bg-sky-100 flex items-center justify-center flex-shrink-0">
              <Truck className="w-4 h-4 text-sky-600" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-1">
                <span className="text-xs font-semibold text-foreground truncate">{p.name}</span>
                {p.unreadCount > 0 && (
                  <span className="min-w-[16px] h-4 px-1 rounded-full bg-accent text-white text-[9px] font-bold flex items-center justify-center flex-shrink-0">
                    {p.unreadCount}
                  </span>
                )}
              </div>
              <p className="text-[11px] text-muted-foreground mt-0.5 truncate">{p.lastMessage}</p>
            </div>
          </button>
        ))}
      </aside>

      {/* Conversation */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Header */}
        <div className="flex items-center gap-3 px-5 py-3.5 border-b border-border/50 bg-muted/10 flex-shrink-0">
          <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
            isAdminPanel ? "bg-primary/10" : "bg-sky-100"
          }`}>
            {isAdminPanel
              ? <Headphones className="w-4 h-4 text-primary" />
              : <Truck className="w-4 h-4 text-sky-600" />
            }
          </div>
          <div>
            <p className="text-sm font-semibold text-primary">{headerName}</p>
            <p className="text-[11px] text-muted-foreground">{headerSub}</p>
          </div>
        </div>

        {/* Messages */}
        <div ref={messagesRef} className="flex-1 overflow-y-auto min-h-0 px-5 py-4 space-y-3">
          {messages.length === 0 && (
            <div className="flex flex-col items-center justify-center h-full min-h-[160px] gap-2 text-muted-foreground">
              <MessageCircle className="w-8 h-8 opacity-20" />
              <p className="text-xs">
                {isAdminPanel ? "Start a conversation with our bakers!" : "No messages yet."}
              </p>
            </div>
          )}
          {messages.map(msg => (
            <Bubble key={msg.msgId} msg={msg} isMe={msg.senderId === userId}
              avatarFallback={isAdminPanel ? "BC" : initials(panel.kind === "direct" ? panel.partnerName : "")}
              avatarClass={isAdminPanel ? "bg-primary/10 text-primary" : "bg-sky-100 text-sky-700"}
            />
          ))}
        </div>

        <MessageInput
          placeholder={isAdminPanel ? "Ask about flavours, designs, delivery…" : `Message ${headerName}…`}
          onSend={handleSend}
          sending={sending}
        />
      </div>
    </div>
  )
}

// ─── Root ─────────────────────────────────────────────────────────────────────

export default function SupportPage() {
  const [userInfo, setUserInfo] = useState<{ userId: number; name: string; role: string } | null>(null)
  const [loaded, setLoaded]     = useState(false)

  useEffect(() => {
    const info = getUserInfo()
    setUserInfo(info ? { userId: info.userId, name: info.name, role: info.role } : null)
    setLoaded(true)
  }, [])

  if (!loaded) return null

  const isAdmin = userInfo?.role?.toLowerCase() === "admin"

  /* ── Not logged in ── */
  if (!userInfo) {
    return (
      <main className="min-h-screen bg-background flex items-center justify-center p-6">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto">
            <MessageCircle className="w-8 h-8 text-muted-foreground" />
          </div>
          <p className="text-lg font-semibold text-foreground">Please log in to use support chat</p>
          <Link href="/login"
            className="inline-flex items-center justify-center h-10 px-6 rounded-xl text-sm font-semibold text-primary-foreground bg-primary hover:bg-primary/90 transition-colors">
            Log In
          </Link>
        </div>
      </main>
    )
  }

  return (
    <main className="bg-background flex flex-col overflow-hidden" style={{ height: "calc(100vh - 56px)" }}>

      {/* Page header */}
      <div className="flex-shrink-0 px-6 py-4 bg-background/80 backdrop-blur-sm">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 mb-0.5">
              <div className="w-5 h-[2px] rounded-full bg-accent" />
              <span className="text-[10px] font-semibold tracking-[0.22em] uppercase text-accent">
                {isAdmin ? "Admin" : "Help Centre"}
              </span>
            </div>
            <h1 className="font-serif text-xl font-bold text-primary">
              {isAdmin ? "Customer Conversations" : "Support Chat"}
            </h1>
          </div>
          {isAdmin && (
            <Link href="/admin"
              className="text-xs font-semibold text-muted-foreground hover:text-accent transition-colors">
              ← Back to Admin
            </Link>
          )}
        </div>
      </div>

      {/* Chat area */}
      <div className="flex-1 min-h-0 px-6 py-5">
        <div className="max-w-6xl mx-auto h-full flex flex-col">
          {isAdmin
            ? <AdminChat adminId={userInfo.userId} />
            : <UserChat userId={userInfo.userId} />
          }
        </div>
      </div>

    </main>
  )
}
