"use client"

import { useState, useRef, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Send, ArrowLeft, MessageCircle } from "lucide-react"
import Link from "next/link"
import { getUserInfo } from "@/lib/api/auth"
import {
  ChatMsgDto,
  ConversationUserDto,
  getConversation,
  getConversationUsers,
  markMessagesRead,
  sendMessage,
} from "@/lib/api/chat"

// ─── shared helpers ─────────────────────────────────────────────────────────

function initials(name: string) {
  return name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2)
}

function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
}

function formatDate(iso: string) {
  const d = new Date(iso)
  const today = new Date()
  if (d.toDateString() === today.toDateString()) return "Today"
  const yesterday = new Date(today)
  yesterday.setDate(today.getDate() - 1)
  if (d.toDateString() === yesterday.toDateString()) return "Yesterday"
  return d.toLocaleDateString()
}

// ─── Admin view ──────────────────────────────────────────────────────────────

function AdminChat({ adminId }: { adminId: number }) {
  const [users, setUsers] = useState<ConversationUserDto[]>([])
  const [selectedUser, setSelectedUser] = useState<ConversationUserDto | null>(null)
  const [messages, setMessages] = useState<ChatMsgDto[]>([])
  const [input, setInput] = useState("")
  const [sending, setSending] = useState(false)
  const [search, setSearch] = useState("")
  const messagesRef = useRef<HTMLDivElement>(null)

  const loadUsers = useCallback(async () => {
    try {
      const data = await getConversationUsers()
      setUsers(data)
    } catch {}
  }, [])

  const loadMessages = useCallback(async (userId: number) => {
    try {
      const data = await getConversation(userId)
      setMessages(data)
    } catch {}
  }, [])

  useEffect(() => {
    loadUsers()
    const id = setInterval(loadUsers, 4000)
    return () => clearInterval(id)
  }, [loadUsers])

  useEffect(() => {
    if (!selectedUser) return
    loadMessages(selectedUser.userId)
    const id = setInterval(() => loadMessages(selectedUser.userId), 3000)
    return () => clearInterval(id)
  }, [selectedUser, loadMessages])

  useEffect(() => {
    const el = messagesRef.current
    if (el) el.scrollTop = el.scrollHeight
  }, [messages])

  const handleSend = async () => {
    if (!input.trim() || !selectedUser) return
    try {
      setSending(true)
      const msg = await sendMessage(adminId, input.trim(), selectedUser.userId)
      setMessages((prev) => [...prev, msg])
      setInput("")
      loadUsers()
    } catch {} finally {
      setSending(false)
    }
  }

  const filteredUsers = users.filter((u) =>
    u.name.toLowerCase().includes(search.toLowerCase()),
  )

  return (
    <div className="flex flex-1 overflow-hidden bg-background">
      {/* ── Sidebar ── */}
      <aside className="w-80 flex-shrink-0 border-r border-border flex flex-col overflow-hidden">
        {/* Sidebar header */}
        <div className="px-4 py-4 border-b border-border bg-muted/30">
          <div className="flex items-center justify-between mb-3">
            <h1 className="text-lg font-bold text-foreground">Customer Chats</h1>
            <Link href="/admin">
              <Button variant="ghost" size="sm" className="text-xs text-muted-foreground">
                ← Admin
              </Button>
            </Link>
          </div>
          <Input
            placeholder="Search customers…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-8 text-sm"
          />
        </div>

        {/* Customer list */}
        <div className="flex-1 overflow-y-auto no-scrollbar divide-y divide-border/50">
          {filteredUsers.length === 0 ? (
            <p className="p-6 text-sm text-center text-muted-foreground">No conversations yet.</p>
          ) : (
            filteredUsers.map((u) => (
              <button
                key={u.userId}
                onClick={() => { setSelectedUser(u); markMessagesRead(u.userId).then(loadUsers) }}
                className={`w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-muted/50 transition-colors ${
                  selectedUser?.userId === u.userId ? "bg-accent/10 border-r-2 border-accent" : ""
                }`}
              >
                <Avatar className="w-10 h-10 flex-shrink-0">
                  <AvatarFallback className="bg-primary text-primary-foreground text-sm font-semibold">
                    {initials(u.name)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold text-foreground truncate">{u.name}</span>
                    <span className="text-xs text-muted-foreground ml-1 flex-shrink-0">
                      {formatDate(u.lastMessageAt)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between mt-0.5">
                    <p className="text-xs text-muted-foreground truncate">{u.lastMessage}</p>
                    {u.unreadCount > 0 && (
                      <Badge className="ml-1 h-4 px-1.5 text-xs bg-accent text-white flex-shrink-0">
                        {u.unreadCount}
                      </Badge>
                    )}
                  </div>
                </div>
              </button>
            ))
          )}
        </div>
      </aside>

      {/* ── Conversation panel ── */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {selectedUser ? (
          <>
            {/* Conversation header */}
            <div className="flex items-center gap-3 px-6 py-4 border-b border-border bg-muted/20">
              <Avatar className="w-9 h-9">
                <AvatarFallback className="bg-primary text-primary-foreground text-sm font-semibold">
                  {initials(selectedUser.name)}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="font-semibold text-foreground">{selectedUser.name}</p>
                <p className="text-xs text-muted-foreground">Customer</p>
              </div>
            </div>

            {/* Messages */}
            <div ref={messagesRef} className="flex-1 overflow-y-auto no-scrollbar min-h-0 px-6 py-4 space-y-3">
              {messages.map((msg) => {
                const isAdmin = msg.senderId === adminId
                return (
                  <div key={msg.msgId} className={`flex gap-2 ${isAdmin ? "flex-row-reverse" : "flex-row"}`}>
                    {!isAdmin && (
                      <Avatar className="w-7 h-7 flex-shrink-0 mt-1">
                        <AvatarFallback className="bg-secondary text-secondary-foreground text-xs">
                          {initials(msg.senderName || selectedUser.name)}
                        </AvatarFallback>
                      </Avatar>
                    )}
                    <div className={`max-w-sm ${isAdmin ? "items-end" : "items-start"} flex flex-col gap-0.5`}>
                      <div
                        className={`px-4 py-2 rounded-2xl text-sm leading-relaxed ${
                          isAdmin
                            ? "bg-primary text-primary-foreground rounded-tr-sm"
                            : "bg-muted text-foreground rounded-tl-sm"
                        }`}
                      >
                        {msg.msgTxt}
                      </div>
                      <span className="text-xs text-muted-foreground px-1">{formatTime(msg.createdAt)}</span>
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Input */}
            <div className="border-t border-border px-6 py-4 bg-background">
              <div className="flex gap-2">
                <Input
                  placeholder={`Reply to ${selectedUser.name}…`}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend() } }}
                  className="flex-1"
                />
                <Button onClick={handleSend} disabled={sending || !input.trim()} size="icon">
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-center gap-3 text-muted-foreground">
            <MessageCircle className="w-12 h-12 opacity-30" />
            <p className="text-lg font-medium">Select a customer to view their conversation</p>
            <p className="text-sm">Customer messages appear in the sidebar on the left</p>
          </div>
        )}
      </main>
    </div>
  )
}

// ─── User view ───────────────────────────────────────────────────────────────

function UserChat({ userId, userName }: { userId: number; userName: string }) {
  const [messages, setMessages] = useState<ChatMsgDto[]>([])
  const [input, setInput] = useState("")
  const [sending, setSending] = useState(false)
  const messagesRef = useRef<HTMLDivElement>(null)

  const loadMessages = useCallback(async () => {
    try {
      const data = await getConversation(userId)
      setMessages(data)
    } catch {}
  }, [userId])

  useEffect(() => {
    loadMessages()
    const id = setInterval(loadMessages, 3000)
    return () => clearInterval(id)
  }, [loadMessages])

  useEffect(() => {
    const el = messagesRef.current
    if (el) el.scrollTop = el.scrollHeight
  }, [messages])

  const handleSend = async () => {
    if (!input.trim()) return
    try {
      setSending(true)
      const msg = await sendMessage(userId, input.trim())
      setMessages((prev) => [...prev, msg])
      setInput("")
    } catch {} finally {
      setSending(false)
    }
  }

  return (
    <main className="flex flex-1 flex-col overflow-hidden bg-background">
      {/* Header */}
      <header className="sticky top-0 z-10 border-b border-border bg-background/95 backdrop-blur">
        <div className="mx-auto max-w-3xl px-4 py-3 flex items-center gap-3">
          <Link href="/" className="text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div className="flex items-center gap-3 flex-1">
            <div className="w-9 h-9 rounded-full bg-primary flex items-center justify-center">
              <MessageCircle className="w-5 h-5 text-primary-foreground" />
            </div>
            <div>
              <p className="font-semibold text-foreground text-sm">Baker Support</p>
              <p className="text-xs text-muted-foreground">Available 9AM – 6PM</p>
            </div>
          </div>
        </div>
      </header>

      {/* Messages */}
      <div ref={messagesRef} className="flex-1 overflow-y-auto no-scrollbar min-h-0 mx-auto w-full max-w-3xl px-4 py-6 space-y-3">
        {messages.length === 0 && (
          <div className="text-center py-12 text-muted-foreground">
            <MessageCircle className="w-10 h-10 mx-auto mb-3 opacity-30" />
            <p className="text-sm">Start a conversation with our bakers!</p>
          </div>
        )}
        {messages.map((msg) => {
          const isMe = msg.senderId === userId
          return (
            <div key={msg.msgId} className={`flex gap-2 ${isMe ? "flex-row-reverse" : "flex-row"}`}>
              {!isMe && (
                <Avatar className="w-7 h-7 flex-shrink-0 mt-1">
                  <AvatarFallback className="bg-primary text-primary-foreground text-xs font-semibold">
                    BC
                  </AvatarFallback>
                </Avatar>
              )}
              <div className={`max-w-xs md:max-w-sm flex flex-col gap-0.5 ${isMe ? "items-end" : "items-start"}`}>
                <div
                  className={`px-4 py-2 rounded-2xl text-sm leading-relaxed ${
                    isMe
                      ? "bg-primary text-primary-foreground rounded-tr-sm"
                      : "bg-muted text-foreground rounded-tl-sm"
                  }`}
                >
                  {msg.msgTxt}
                </div>
                <span className="text-xs text-muted-foreground px-1">{formatTime(msg.createdAt)}</span>
              </div>
            </div>
          )
        })}
      </div>

      {/* Input */}
      <div className="border-t border-border bg-background flex-shrink-0">
        <div className="mx-auto max-w-3xl px-4 py-4 flex gap-2">
          <Input
            placeholder="Ask about flavors, designs, delivery…"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend() } }}
            className="flex-1"
          />
          <Button onClick={handleSend} disabled={sending || !input.trim()} size="icon">
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </main>
  )
}

// ─── Root ────────────────────────────────────────────────────────────────────

export default function SupportPage() {
  const [userInfo, setUserInfo] = useState<{ userId: number; name: string; role: string } | null>(null)
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    const b = document.body
    const prev = { overflow: b.style.overflow, display: b.style.display, flexDirection: b.style.flexDirection, height: b.style.height }
    b.style.overflow = 'hidden'
    b.style.display = 'flex'
    b.style.flexDirection = 'column'
    b.style.height = '100vh'
    return () => {
      b.style.overflow = prev.overflow
      b.style.display = prev.display
      b.style.flexDirection = prev.flexDirection
      b.style.height = prev.height
    }
  }, [])

  useEffect(() => {
    const info = getUserInfo()
    setUserInfo(info ? { userId: info.userId, name: info.name, role: info.role } : null)
    setLoaded(true)
  }, [])

  if (!loaded) return null

  if (!userInfo) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center space-y-4">
          <MessageCircle className="w-12 h-12 mx-auto text-muted-foreground" />
          <p className="text-lg font-semibold text-foreground">Please log in to use chat</p>
          <Link href="/login">
            <Button>Log In</Button>
          </Link>
        </div>
      </main>
    )
  }

  if (userInfo.role?.toLowerCase() === "admin") {
    return <AdminChat adminId={userInfo.userId} />
  }

  return <UserChat userId={userInfo.userId} userName={userInfo.name} />
}
