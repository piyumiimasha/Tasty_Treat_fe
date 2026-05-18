"use client"

import { useState, useRef } from "react"
import type React from "react"
import Link from "next/link"
import { Upload, Send, X, ImagePlus, Lightbulb, CheckCircle2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { createDesignRequest } from "@/lib/api/design-requests"
import { getUserInfo } from "@/lib/api/auth"

const O = {
  bg:       "#fef3e8",
  bgHero:   "linear-gradient(135deg, #fde8cc 0%, #fef3e8 60%, #fdf8ee 100%)",
  border:   "#f5d9b0",
  accent:   "#C97040",
  accentLt: "#fde8cc",
  accentMd: "#f5c490",
  btn:      "linear-gradient(135deg, #C97040 0%, #E08848 100%)",
}

export default function UploadPage() {
  const [uploadedFiles, setUploadedFiles]   = useState<File[]>([])
  const [previews, setPreviews]             = useState<string[]>([])
  const [message, setMessage]               = useState("")
  const [submitting, setSubmitting]         = useState(false)
  const [submitted, setSubmitted]           = useState(false)
  const [dragging, setDragging]             = useState(false)
  const fileInputRef                        = useRef<HTMLInputElement>(null)
  const { toast }                           = useToast()

  const addFiles = (files: FileList | null) => {
    if (!files) return
    Array.from(files).forEach((file) => {
      if (!file.type.startsWith("image/")) return
      setUploadedFiles(p => [...p, file])
      const reader = new FileReader()
      reader.onload = (e) => setPreviews(p => [...p, e.target?.result as string])
      reader.readAsDataURL(file)
    })
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setDragging(false)
    addFiles(e.dataTransfer.files)
  }

  const removeFile = (i: number) => {
    setUploadedFiles(p => p.filter((_, idx) => idx !== i))
    setPreviews(p => p.filter((_, idx) => idx !== i))
  }

  const handleSubmit = async () => {
    if (uploadedFiles.length === 0 && !message.trim()) {
      toast({ title: "Nothing to send", description: "Add an image or write a message first.", variant: "destructive" })
      return
    }
    const userInfo = getUserInfo()
    const customerName = userInfo?.name || "Guest"
    try {
      setSubmitting(true)
      await createDesignRequest(customerName, message.trim(), uploadedFiles[0])
      setSubmitted(true)
      toast({ title: "Request sent!", description: "Our team will review your design and be in touch soon." })
    } catch (err) {
      toast({ title: "Upload failed", description: err instanceof Error ? err.message : "Please try again.", variant: "destructive" })
    } finally {
      setSubmitting(false)
    }
  }

  /* ── Success state ── */
  if (submitted) {
    return (
      <main className="min-h-screen flex items-center justify-center p-6" style={{ background: O.bg }}>
        <div className="max-w-sm w-full text-center space-y-6">
          <div className="w-20 h-20 rounded-full mx-auto flex items-center justify-center"
            style={{ background: O.accentLt }}>
            <CheckCircle2 className="w-10 h-10" style={{ color: O.accent }} />
          </div>
          <div>
            <h2 className="font-serif text-3xl font-bold text-primary mb-2">Request Sent!</h2>
            <p className="text-muted-foreground text-sm leading-relaxed">
              Our team will review your design inspiration and get back to you soon.
            </p>
          </div>
          <Link href="/"
            className="inline-flex items-center justify-center w-full h-11 rounded-xl text-sm font-semibold text-white shadow-md transition-opacity hover:opacity-90"
            style={{ background: O.btn }}>
            Back to Browse
          </Link>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen" style={{ background: O.bg }}>

      {/* ── Hero header ── */}
      <div className="relative overflow-hidden" style={{ background: O.bgHero }}>
        {/* Ambient blobs */}
        <div className="absolute -top-20 right-10 w-80 h-80 rounded-full pointer-events-none"
          style={{ background: "#f5a050", filter: "blur(80px)", opacity: 0.16 }} />
        <div className="absolute bottom-0 left-0 w-64 h-52 rounded-full pointer-events-none"
          style={{ background: "#f5c878", filter: "blur(60px)", opacity: 0.14 }} />
        {/* Decorative dots */}
        <div className="absolute top-8 right-[14%] w-4 h-4 rounded-full border-2 pointer-events-none"
          style={{ borderColor: O.accent, opacity: 0.3 }} />
        <div className="absolute top-16 right-[20%] w-2 h-2 rounded-full pointer-events-none"
          style={{ background: O.accent, opacity: 0.25 }} />
        <div className="absolute bottom-6 right-[9%] w-3 h-3 rounded-full pointer-events-none"
          style={{ background: O.accentMd, opacity: 0.35 }} />

        <div className="relative max-w-4xl mx-auto px-6 py-12 lg:py-16">
          <div className="flex items-center gap-2.5 mb-4">
            <div className="w-8 h-[2px] rounded-full" style={{ background: O.accent }} />
            <span className="text-[11px] font-semibold tracking-[0.26em] uppercase" style={{ color: O.accent }}>
              Design Inspiration
            </span>
          </div>
          <h1 className="font-serif text-4xl sm:text-5xl font-bold text-primary leading-tight mb-3">
            Share Your<br />
            <em className="not-italic" style={{ color: O.accent }}>Dream Design</em>
          </h1>
          <p className="text-muted-foreground text-base max-w-md leading-relaxed">
            Upload a photo of a cake you love and tell us your vision — our bakers will bring it to life.
          </p>
          {/* Steps */}
          <div className="flex items-center gap-3 mt-8 flex-wrap">
            {["Upload inspiration", "Describe your vision", "We'll be in touch"].map((step, i) => (
              <div key={step} className="flex items-center gap-2">
                {i > 0 && <div className="w-6 h-px opacity-40" style={{ background: O.accentMd }} />}
                <div className="flex items-center gap-1.5">
                  <span className="w-5 h-5 rounded-full text-[10px] font-bold flex items-center justify-center text-white"
                    style={{ background: O.accent }}>
                    {i + 1}
                  </span>
                  <span className="text-xs font-medium text-muted-foreground">{step}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Form ── */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10 space-y-8">

        {/* Drop zone */}
        <div>
          <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: O.accent }}>
            Upload Image
          </p>
          <div
            onDragOver={(e) => { e.preventDefault(); setDragging(true) }}
            onDragLeave={() => setDragging(false)}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className="cursor-pointer rounded-2xl transition-all duration-200 flex flex-col items-center justify-center gap-4 py-16 px-6"
            style={{
              border: `2px dashed ${dragging ? O.accent : O.border}`,
              background: dragging ? O.accentLt : "rgba(255,255,255,0.6)",
            }}
          >
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center"
              style={{ background: O.accentLt }}>
              <ImagePlus className="w-7 h-7" style={{ color: O.accent }} />
            </div>
            <div className="text-center">
              <p className="text-sm font-semibold text-primary">
                Drag & drop your image here
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                or <span className="font-semibold" style={{ color: O.accent }}>click to browse</span> — JPG, PNG, WebP up to 50 MB
              </p>
            </div>
          </div>
          <input ref={fileInputRef} type="file" accept="image/*" className="hidden"
            onChange={(e) => addFiles(e.target.files)} />
        </div>

        {/* Preview grid */}
        {previews.length > 0 && (
          <div>
            <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: O.accent }}>
              Uploaded ({previews.length})
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {previews.map((src, i) => (
                <div key={i} className="group relative aspect-square rounded-xl overflow-hidden"
                  style={{ border: `1.5px solid ${O.border}` }}>
                  <img src={src} alt={`Preview ${i + 1}`} className="w-full h-full object-cover" />
                  <button
                    onClick={() => removeFile(i)}
                    className="absolute top-2 right-2 w-6 h-6 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                    style={{ background: "rgba(0,0,0,0.55)" }}>
                    <X className="w-3.5 h-3.5 text-white" />
                  </button>
                </div>
              ))}
              {/* Add more */}
              <button
                onClick={() => fileInputRef.current?.click()}
                className="aspect-square rounded-xl flex flex-col items-center justify-center gap-2 transition-colors"
                style={{ border: `2px dashed ${O.border}`, background: "rgba(255,255,255,0.5)" }}>
                <Upload className="w-5 h-5" style={{ color: O.accent }} />
                <span className="text-xs font-medium" style={{ color: O.accent }}>Add more</span>
              </button>
            </div>
          </div>
        )}

        {/* Divider */}
        <div className="h-px" style={{ background: O.border, opacity: 0.6 }} />

        {/* Message */}
        <div>
          <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: O.accent }}>
            Describe Your Vision
          </p>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            rows={5}
            placeholder="e.g. I'd love a two-tier wedding cake with soft pastel flowers, gold leaf accents, and vanilla sponge inside..."
            className="w-full rounded-2xl px-5 py-4 text-sm text-foreground placeholder:text-muted-foreground resize-none outline-none transition-all duration-200"
            style={{
              background: "rgba(255,255,255,0.75)",
              border: `1.5px solid ${O.border}`,
            }}
            onFocus={e => (e.target.style.borderColor = O.accent)}
            onBlur={e => (e.target.style.borderColor = O.border)}
          />
        </div>

        {/* Tips */}
        <div className="rounded-2xl px-5 py-4 flex gap-3"
          style={{ background: O.accentLt, border: `1px solid ${O.border}` }}>
          <Lightbulb className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color: O.accent }} />
          <div className="text-sm text-muted-foreground leading-relaxed space-y-1">
            <p className="font-semibold text-primary text-xs uppercase tracking-wide mb-1.5">Tips for a great request</p>
            <p>Upload clear, well-lit photos — multi-angle shots help our bakers understand the design.</p>
            <p>Mention colours, themes, tier count, flavour, and any dietary requirements in the message.</p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3 pb-4">
          <Link href="/"
            className="flex-1 h-12 rounded-xl border text-sm font-semibold flex items-center justify-center transition-colors hover:bg-white/60"
            style={{ borderColor: O.border, color: O.accent, background: "rgba(255,255,255,0.4)" }}>
            Cancel
          </Link>
          <button
            onClick={handleSubmit}
            disabled={submitting || (uploadedFiles.length === 0 && !message.trim())}
            className="flex-1 h-12 rounded-xl text-sm font-semibold text-white flex items-center justify-center gap-2 shadow-md transition-opacity disabled:opacity-50"
            style={{ background: O.btn }}>
            {submitting ? (
              <><div className="w-4 h-4 rounded-full border-2 border-white/40 border-t-white animate-spin" /> Sending…</>
            ) : (
              <><Send className="w-4 h-4" /> Send Design Request</>
            )}
          </button>
        </div>

      </div>
    </main>
  )
}
