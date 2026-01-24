"use client"
import { useState, useRef } from "react"
import type React from "react"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Upload, ChevronRight, ArrowLeft } from "lucide-react"

export default function UploadPage() {
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([])
  const [previews, setPreviews] = useState<string[]>([])
  const fileInputRef = useRef<HTMLInputElement>(null)

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
              <CardDescription>Share photos or videos of cake designs you love as inspiration</CardDescription>
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
                  Supported: JPG, PNG, GIF, WebP, MP4, WebM (Max 50MB each)
                </p>
              </div>
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept="image/*,video/*"
                onChange={(e) => handleFileSelect(e.target.files)}
                className="hidden"
              />
            </CardContent>
          </Card>

          {/* Preview Grid */}
          {previews.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Uploaded Designs ({previews.length})</CardTitle>
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

          {/* Action Buttons */}
          <div className="flex gap-4">
            <Link href="/" className="flex-1">
              <Button variant="outline" className="w-full bg-transparent">
                Back to Browse
              </Button>
            </Link>
            <Link href="/customize" className="flex-1">
              <Button disabled={uploadedFiles.length === 0} className="w-full gap-2">
                Proceed to Customizer
                <ChevronRight className="h-4 w-4" />
              </Button>
            </Link>
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
                You can also describe your ideas in detail during the customization process. The more information you
                provide, the better we can match your preferences.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </main>
  )
}
