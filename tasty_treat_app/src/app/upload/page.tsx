"use client"
import { useState, useRef } from "react"
import type React from "react"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Upload, ArrowLeft, Send } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { createDesignRequest } from "@/lib/api/design-requests"
import { getUserInfo } from "@/lib/api/auth"

export default function UploadPage() {
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([])
  const [previews, setPreviews] = useState<string[]>([])
  const [message, setMessage] = useState("")
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { toast } = useToast()

  const handleFileSelect = (files: FileList | null) => {
    if (!files) return
    Array.from(files).forEach((file) => {
      if (file.type.startsWith("image/") || file.type.startsWith("video/")) {
        setUploadedFiles((prev) => [...prev, file])
        const reader = new FileReader()
        reader.onload = (e) => {
          setPreviews((prev) => [...prev, e.target?.result as string])
        }
        reader.readAsDataURL(file)
      }
    })
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    handleFileSelect(e.dataTransfer.files)
  }

  const removeFile = (index: number) => {
    setUploadedFiles((prev) => prev.filter((_, i) => i !== index))
    setPreviews((prev) => prev.filter((_, i) => i !== index))
  }

  const handleUpload = async () => {
    if (uploadedFiles.length === 0 && !message.trim()) {
      toast({
        title: "Nothing to upload",
        description: "Please add an image or write a message first.",
        variant: "destructive",
      })
      return
    }

    const userInfo = getUserInfo()
    const customerName = userInfo?.name || "Guest"

    try {
      setSubmitting(true)
      await createDesignRequest(customerName, message.trim(), uploadedFiles[0])
      setSubmitted(true)
      toast({
        title: "Request sent!",
        description: "Your design request has been sent to our team.",
      })
    } catch (err) {
      toast({
        title: "Upload failed",
        description: err instanceof Error ? err.message : "Please try again.",
        variant: "destructive",
      })
    } finally {
      setSubmitting(false)
    }
  }

  if (submitted) {
    return (
      <main className="min-h-screen bg-background flex items-center justify-center p-6">
        <Card className="max-w-md w-full text-center">
          <CardHeader>
            <CardTitle className="text-2xl text-accent">Request Sent!</CardTitle>
            <CardDescription>
              Our team will review your design request and get back to you soon.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/">
              <Button className="w-full">Back to Browse</Button>
            </Link>
          </CardContent>
        </Card>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-background">
      <header className="sticky top-0 z-10 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <Link
              href="/"
              className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Browse
            </Link>
            <h1 className="text-2xl font-bold text-foreground">Design Inspiration</h1>
            <div className="w-24" />
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="space-y-8">
          {/* Upload Area */}
          <Card className="border-2 border-dashed">
            <CardHeader>
              <CardTitle>Upload Your Design</CardTitle>
              <CardDescription>Share a photo of a cake design you love as inspiration</CardDescription>
            </CardHeader>
            <CardContent>
              <div
                onDragOver={handleDragOver}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className="flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-border bg-muted/50 px-6 py-12 transition-colors hover:bg-muted"
              >
                <Upload className="mb-3 h-12 w-12 text-muted-foreground" />
                <p className="mb-2 text-center text-sm font-medium text-foreground">
                  Drag and drop your files here or click to browse
                </p>
                <p className="text-xs text-muted-foreground">
                  Supported: JPG, PNG, GIF, WebP (Max 50MB)
                </p>
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={(e) => handleFileSelect(e.target.files)}
                className="hidden"
              />
            </CardContent>
          </Card>

          {/* Preview Grid */}
          {previews.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Uploaded Design ({previews.length})</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {previews.map((preview, index) => (
                    <div key={index} className="group relative overflow-hidden rounded-lg border border-border">
                      <img
                        src={preview || "/placeholder.svg"}
                        alt={`Preview ${index + 1}`}
                        className="aspect-square w-full object-cover"
                      />
                      <button
                        onClick={() => removeFile(index)}
                        className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 transition-opacity group-hover:opacity-100"
                      >
                        <span className="rounded bg-destructive px-3 py-1 text-sm font-medium text-destructive-foreground">
                          Remove
                        </span>
                      </button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Additional Message */}
          <Card>
            <CardHeader>
              <CardTitle>Additional Details</CardTitle>
              <CardDescription>Describe your vision or any specific requirements</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Label htmlFor="message">Message (optional)</Label>
                <Textarea
                  id="message"
                  placeholder="e.g. I want a two-tier wedding cake with pastel flowers and gold accents..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  rows={4}
                  className="resize-none"
                />
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex gap-4">
            <Link href="/" className="flex-1">
              <Button variant="outline" className="w-full bg-transparent">
                Back to Browse
              </Button>
            </Link>
            <Button
              className="flex-1 gap-2"
              onClick={handleUpload}
              disabled={submitting || (uploadedFiles.length === 0 && !message.trim())}
            >
              {submitting ? (
                "Sending..."
              ) : (
                <>
                  <Send className="h-4 w-4" />
                  Upload
                </>
              )}
            </Button>
          </div>

          {/* Info Section */}
          <Card className="bg-muted/50">
            <CardHeader>
              <CardTitle className="text-base">Design Tips</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm text-muted-foreground">
              <p>
                Upload clear photos of cake designs you like. Multi-angle shots help our designers understand your
                vision better.
              </p>
              <p>
                Use the message field to describe colors, themes, dietary requirements, or any other details.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </main>
  )
}
