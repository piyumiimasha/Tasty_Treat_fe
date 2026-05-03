"use client"

import { useState, useMemo, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useToast } from "@/hooks/use-toast"
import { getUserInfo } from "@/lib/api/auth"
import { createDesignRequest } from "@/lib/api/design-requests"
import { getDesignerOptions, type CustomizationOptionDto } from "@/lib/api/customization-options"
import { OPTION_CATEGORIES, BASE_PRICE, type CakeDesign } from "@/lib/customizer-options"
import OptionPillGroup from "./option-pill-group"
import PreviewPanel from "./preview-panel"
import PriceSummaryCard from "./price-summary-card"
import AdditionalInstructionsDialog from "./additional-instructions-dialog"
import { Button } from "@/components/ui/button"
import { Send } from "lucide-react"

const DEFAULT_DESIGN: CakeDesign = {
  layers: 1,
  shape: "round",
  frosting: "buttercream",
  flavour: "vanilla",
  topper: "none",
  dietary: [],
  instructions: "",
}

function buildCategories(apiOptions: CustomizationOptionDto[]) {
  return OPTION_CATEGORIES.map((cat) => {
    // admin stores "shapes"/"toppers" (plural), customizer keys use "shape"/"topper" (singular)
    const typeAliases: Record<string, string> = { shape: "shapes", topper: "toppers" }
    const backendOpts = apiOptions.filter(
      (o) => o.type === cat.key || o.type === (typeAliases[cat.key] ?? cat.key)
    )
    if (backendOpts.length === 0) return { ...cat, options: [] }
    return {
      ...cat,
      options: backendOpts.map((o) => ({
        id: o.optionId.toString(),
        label: o.name,
        price: o.additionalPrice,
      })),
    }
  })
}

export default function CustomizerShell() {
  const router = useRouter()
  const { toast } = useToast()

  const [design, setDesign] = useState<CakeDesign>(DEFAULT_DESIGN)
  const [previewImageUrl, setPreviewImageUrl] = useState<string | null>(null)
  const [isGenerating, setIsGenerating] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [apiOptions, setApiOptions] = useState<CustomizationOptionDto[]>([])

  useEffect(() => {
    getDesignerOptions().then(setApiOptions).catch(() => {})
  }, [])

  const categories = useMemo(() => buildCategories(apiOptions), [apiOptions])

  const breakdown = useMemo(() => {
    const price = (key: string, id: string) =>
      categories.find((c) => c.key === key)?.options.find((o) => o.id === id)?.price ?? 0

    const baseSize         = BASE_PRICE
    const extraLayers      = price("layers", String(design.layers))
    const shapeSurcharge   = price("shape", design.shape)
    const flavoursFillings = price("flavour", design.flavour)
    const toppers          = price("topper", design.topper)
    const dietaryOptions   = design.dietary.reduce((sum, d) => sum + price("dietary", d), 0)

    const subtotal = baseSize + extraLayers + shapeSurcharge + flavoursFillings + toppers + dietaryOptions
    const tax      = Math.round(subtotal * 0.1 * 100) / 100
    const total    = Math.round((subtotal + tax) * 100) / 100

    return { baseSize, extraLayers, shapeSurcharge, flavoursFillings, toppers, dietaryOptions, subtotal, tax, total }
  }, [design, categories])

  const setField = (key: keyof CakeDesign, value: string | string[] | number) => {
    setDesign((prev) => ({ ...prev, [key]: value }))
  }

  const handleGenerate = async () => {
    setIsGenerating(true)
    try {
      const resolve = (key: string, id: string) =>
        categories.find((c) => c.key === key)?.options.find((o) => o.id === id)?.label ?? id

      const payload = {
        layers: design.layers,
        shape: resolve("shape", design.shape),
        frosting: resolve("frosting", design.frosting),
        flavour: resolve("flavour", design.flavour),
        topper: resolve("topper", design.topper),
        dietary: design.dietary.map((d) => resolve("dietary", d)),
        instructions: design.instructions,
      }

      const res = await fetch("/api/generate-preview", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })
      const data = await res.json()
      if (data.fallback) {
        toast({ title: "AI preview not configured", description: "Set REPLICATE_API_TOKEN in .env.local to enable previews.", variant: "destructive" })
        return
      }
      if (data.error || !data.imageUrl) {
        toast({ title: "Preview failed", description: data.error ?? "Unknown error", variant: "destructive" })
        return
      }
      setPreviewImageUrl(data.imageUrl)
    } catch {
      toast({ title: "Preview failed", description: "Could not reach the preview service.", variant: "destructive" })
    } finally {
      setIsGenerating(false)
    }
  }

  const handleSubmit = async () => {
    const info = getUserInfo()
    if (!info) {
      toast({ title: "Please sign in", description: "You need to be logged in to submit a design request.", variant: "destructive" })
      router.push("/login")
      return
    }

    setIsSubmitting(true)
    try {
      const layerLabel = categories.find((c) => c.key === "layers")?.options.find((o) => o.id === String(design.layers))?.label ?? design.layers
      const shapeLabel = categories.find((c) => c.key === "shape")?.options.find((o) => o.id === design.shape)?.label ?? design.shape
      const frostingLabel = categories.find((c) => c.key === "frosting")?.options.find((o) => o.id === design.frosting)?.label ?? design.frosting
      const flavourLabel = categories.find((c) => c.key === "flavour")?.options.find((o) => o.id === design.flavour)?.label ?? design.flavour
      const topperLabel = categories.find((c) => c.key === "topper")?.options.find((o) => o.id === design.topper)?.label ?? design.topper
      const dietaryLabels = design.dietary.map((d) => categories.find((c) => c.key === "dietary")?.options.find((o) => o.id === d)?.label ?? d)

      const message = [
        `Custom Cake Order — Rs. ${breakdown.total.toLocaleString()}`,
        `Layers: ${layerLabel}`,
        `Shape: ${shapeLabel}`,
        `Frosting: ${frostingLabel}`,
        `Flavour: ${flavourLabel}`,
        `Toppers: ${topperLabel}`,
        dietaryLabels.length > 0 ? `Dietary: ${dietaryLabels.join(", ")}` : null,
        design.instructions ? `Special instructions: ${design.instructions}` : null,
      ]
        .filter(Boolean)
        .join("\n")

      let imageFile: File | undefined
      if (previewImageUrl) {
        try {
          const imgRes = await fetch(previewImageUrl)
          const blob = await imgRes.blob()
          imageFile = new File([blob], "cake-preview.webp", { type: blob.type || "image/webp" })
        } catch {
          // Submit without image if fetch fails
        }
      }

      await createDesignRequest(info.name, message, imageFile)
      toast({ title: "Request submitted!", description: "We'll review your design and be in touch soon." })
      router.push("/orders")
    } catch (err: any) {
      toast({ title: "Submission failed", description: err?.message ?? "Please try again.", variant: "destructive" })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-semibold text-foreground mb-1">Design Your Cake</h1>
        <p className="text-sm text-muted-foreground">Every detail, your way. Generate an AI preview then submit your design.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[340px_1fr] gap-30 items-start">

        {/* ── Left panel ── */}
        <div className="lg:sticky lg:top-24 space-y-6">
          <PreviewPanel
            imageUrl={previewImageUrl}
            isGenerating={isGenerating}
            onGenerate={handleGenerate}
          />
          <PriceSummaryCard breakdown={breakdown} />
        </div>

        {/* ── Right panel ── */}
        <div className="space-y-4">
          {/* Options card */}
          <div className="rounded-2xl border border-border bg-card overflow-hidden divide-y divide-border">
            {categories.map((cat) => {
              const value = cat.key === "layers"
                ? String(design.layers)
                : (design[cat.key] as string | string[])

              return (
                <div key={cat.key} className="px-5 py-4">
                  <OptionPillGroup
                    label={cat.label}
                    options={cat.options}
                    selected={value}
                    multiSelect={cat.multiSelect}
                    onChange={(val) => {
                      if (cat.key === "layers") {
                        setField("layers", parseInt(val as string, 10))
                      } else {
                        setField(cat.key as keyof CakeDesign, val as string | string[])
                      }
                    }}
                  />
                </div>
              )
            })}

            <div className="px-5 py-4">
              <AdditionalInstructionsDialog
                value={design.instructions}
                onChange={(val) => setField("instructions", val)}
              />
            </div>
          </div>

          {/* Submit */}
          <Button
            onClick={handleSubmit}
            disabled={isSubmitting}
            size="lg"
            className="w-full gap-2 bg-primary hover:bg-primary/90 text-primary-foreground h-12"
          >
            <Send className="w-4 h-4" />
            {isSubmitting ? "Submitting…" : `Submit Design Request — Rs. ${breakdown.total.toLocaleString()}`}
          </Button>
          <p className="text-center text-xs text-muted-foreground -mt-2">
            Our team will review your design and contact you to confirm the order.
          </p>
        </div>
      </div>
    </div>
  )
}
