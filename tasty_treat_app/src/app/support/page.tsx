"use client"
import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Send, Phone, MessageCircle } from "lucide-react"

interface ChatMessage {
  id: string
  sender: "user" | "baker"
  message: string
  timestamp: Date
}

export default function SupportPage() {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "1",
      sender: "baker",
      message: "Hello! Welcome to our bakery support. How can I help you design your perfect cake today?",
      timestamp: new Date(Date.now() - 300000),
    },
  ])
  const [input, setInput] = useState("")
  const [isOpen, setIsOpen] = useState(true)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSend = () => {
    if (!input.trim()) return

    const newMessage: ChatMessage = {
      id: Date.now().toString(),
      sender: "user",
      message: input,
      timestamp: new Date(),
    }

    setMessages([...messages, newMessage])
    setInput("")

    // Simulate baker response
    setTimeout(() => {
      const bakerResponse: ChatMessage = {
        id: (Date.now() + 1).toString(),
        sender: "baker",
        message:
          "That sounds wonderful! Let me help you create the perfect design. What's your preferred flavor profile?",
        timestamp: new Date(),
      }
      setMessages((prev) => [...prev, bakerResponse])
    }, 1000)
  }

  return (
    <main className="min-h-screen bg-background">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-semibold text-foreground mb-2">Support & Communication</h1>
          <p className="text-muted-foreground">Chat with our bakers to perfect your cake design</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Chat Window */}
          <div className="lg:col-span-2">
            <Card className="h-full flex flex-col border border-border rounded-lg overflow-hidden shadow-sm">
              {/* Chat Header */}
              <div className="bg-gradient-to-r from-primary to-accent p-6 border-b border-border">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary-foreground flex items-center justify-center">
                      <MessageCircle className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <h2 className="font-semibold text-primary-foreground">Baker Support</h2>
                      <p className="text-sm text-primary-foreground/80">Available 9AM - 6PM</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-primary-foreground hover:bg-primary-foreground/20"
                    >
                      <Phone className="w-5 h-5" />
                    </Button>
                  </div>
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-background">
                {messages.map((msg) => (
                  <div key={msg.id} className={`flex gap-3 ${msg.sender === "user" ? "flex-row-reverse" : "flex-row"}`}>
                    {msg.sender === "baker" && (
                      <Avatar className="w-8 h-8 flex-shrink-0">
                        <AvatarFallback className="bg-primary text-primary-foreground text-xs">BC</AvatarFallback>
                      </Avatar>
                    )}
                    <div className={`flex-1 ${msg.sender === "user" ? "flex justify-end" : "flex justify-start"}`}>
                      <div
                        className={`max-w-xs px-4 py-2 rounded-lg ${
                          msg.sender === "user"
                            ? "bg-primary text-primary-foreground rounded-br-none"
                            : "bg-muted text-foreground rounded-bl-none"
                        }`}
                      >
                        <p className="text-sm">{msg.message}</p>
                        <p
                          className={`text-xs mt-1 ${
                            msg.sender === "user" ? "text-primary-foreground/70" : "text-muted-foreground"
                          }`}
                        >
                          {msg.timestamp.toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>

              {/* Input */}
              <div className="border-t border-border p-4 bg-background">
                <div className="flex gap-2">
                  <Input
                    placeholder="Ask about flavors, designs, or dietary options..."
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === "Enter") handleSend()
                    }}
                    className="flex-1 bg-input border border-border"
                  />
                  <Button
                    onClick={handleSend}
                    className="bg-primary text-primary-foreground hover:bg-primary/90"
                    size="icon"
                  >
                    <Send className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </Card>
          </div>

          {/* Support Info */}
          <div className="space-y-4">
            <Card className="p-6 border border-border">
              <h3 className="font-semibold text-foreground mb-4">Quick Tips</h3>
              <ul className="space-y-3 text-sm text-muted-foreground">
                <li className="flex gap-2">
                  <span className="text-accent">•</span>
                  <span>Share photos or inspiration images</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-accent">•</span>
                  <span>Ask about flavor combinations</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-accent">•</span>
                  <span>Discuss dietary restrictions</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-accent">•</span>
                  <span>Get delivery estimates</span>
                </li>
              </ul>
            </Card>

            <Card className="p-6 border border-border bg-accent/5">
              <h3 className="font-semibold text-foreground mb-3">Contact Info</h3>
              <div className="space-y-2 text-sm">
                <p className="text-muted-foreground">
                  <span className="font-medium text-foreground">Phone:</span> (555) 123-CAKE
                </p>
                <p className="text-muted-foreground">
                  <span className="font-medium text-foreground">Email:</span> hello@artisancakes.com
                </p>
                <p className="text-muted-foreground">
                  <span className="font-medium text-foreground">Hours:</span> 9AM - 6PM, Daily
                </p>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </main>
  )
}
