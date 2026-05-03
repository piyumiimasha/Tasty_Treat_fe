"use client"

import { useState, useMemo, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useToast } from "@/hooks/use-toast"
import { getUserInfo } from "@/lib/api/auth"
import { createDesignRequest } from "@/lib/api/design-requests"
import { getDesignerOptions, type CustomizationOptionDto } from "@/lib/api/customization-options"
import { getCustomizationTypes, type CustomizationTypeDto } from "@/lib/api/customization-types"
import { BASE_PRICE, type CakeDesign, type OptionCategory } from "@/lib/customizer-options"
import OptionPillGroup from "./option-pill-group"
import PreviewPanel from "./preview-panel"
import PriceSummaryCard from "./price-summary-card"
import AdditionalInstructionsDialog from "./additional-instructions-dialog"
import { Button } from "@/components/ui/button"
import { Send } from "lucide-react"

// Maps backend type.name → CakeDesign key
const TYPE_KEY_MAP: Partial<Record<string, keyof CakeDesign>> = {
  shapes:      "shape",
  layers:      "layers",
  frosting:    "frosting",
  flavour:     "flavour",
  colors:      "color",
  toppers:     "topper",
  decorations: "decorations",
  dietary:     "dietary",
}

const MULTI_SELECT = new Set(["dietary", "decorations"])

function buildCategories(
  types: CustomizationTypeDto[],
  options: CustomizationOptionDto[]
): OptionCategory[] {
  return types
    .map((type) => {
      const key = TYPE_KEY_MAP[type.name]
      if (!key) return null
      return {
        key,
        label: type.name.charAt(0).toUpperCase() + type.name.slice(1),
        typeId: type.typeId,
        multiSelect: MULTI_SELECT.has(type.name),
        options: options
          .filter((o) => o.typeId === type.typeId)
          .map((o) => ({
            id: o.optionId.toString(),
            label: o.name,
            price: o.additionalPrice,
          })),
      } satisfies OptionCategory
    })
    .filter((c): c is OptionCategory => c !== null)
}

const DEFAULT_DESIGN: CakeDesign = {
  layers:       "",
  shape:        "",
  frosting:     "",
  flavour:      "",
  topper:       "",
  color:        "",
  decorations:  [],
  dietary:      [],
  instructions: "",
}

export default function CustomizerShell() {
  const router = useRouter()
  const { toast } = useToast()

  const [design, setDesign]             = useState<CakeDesign>(DEFAULT_DESIGN)
  const [previewImageUrl, setPreviewImageUrl] = useState<string | null>(null)
  const [isGenerating, setIsGenerating] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [apiTypes, setApiTypes]         = useState<CustomizationTypeDto[]>([])
  const [apiOptions, setApiOptions]     = useState<CustomizationOptionDto[]>([])

  useEffect(() => {
    Promise.all([getCustomizationTypes(), getDesignerOptions()])
      .then(([types, options]) => {
        setApiTypes(types)
        setApiOptions(options)
      })
      .catch(() => {})
  }, [])

  const categories = useMemo(() => buildCategories(apiTypes, apiOptions), [apiTypes, apiOptions])

  const breakdown = useMemo(() => {
    const price = (key: string, id: string) =>
      categories.find((c) => c.key === key)?.options.find((o) => o.id === id)?.price ?? 0

    const baseSize        = BASE_PRICE
    const extraLayers     = price("layers",      design.layers)
    const shapeSurcharge  = price("shape",       design.shape)
    const flavoursFillings = price("flavour",     design.flavour)
    const toppers         = price("topper",      design.topper)
    const colorSurcharge  = price("color",       design.color)
    const decorationsCost = design.decorations.reduce((sum, d) => sum + price("decorations", d), 0)
    const dietaryOptions  = design.dietary.reduce((sum, d) => sum + price("dietary", d), 0)

    const subtotal = baseSize + extraLayers + shapeSurcharge + flavoursFillings + toppers + colorSurcharge + decorationsCost + dietaryOptions
    const tax      = Math.round(subtotal * 0.1 * 100) / 100
    const total    = Math.round((subtotal + tax) * 100) / 100

    return { baseSize, extraLayers, shapeSurcharge, flavoursFillings, toppers, colorSurcharge, decorationsCost, dietaryOptions, subtotal, tax, total }
  }, [design, categories])

  const setField = (key: keyof CakeDesign, value: string | string[]) => {
    setDesign((prev) => ({ ...prev, [key]: value }))
  }

  const handleGenerate = async () => {
    setIsGenerating(true)
    try {
      // Resolve optionId → human-readable label for the AI prompt
      const resolve = (key: string, id: string) =>
        categories.find((c) => c.key === key)?.options.find((o) => o.id === id)?.label ?? id

      const layerOption = categories.find((c) => c.key === "layers")?.options.find((o) => o.id === design.layers)
      const layerCount  = layerOption ? parseInt(layerOption.label, 10) || 1 : 1

      const payload = {
        layers:      layerCount,
        shape:       resolve("shape",    design.shape),
        frosting:    resolve("frosting", design.frosting),
        flavour:     resolve("flavour",  design.flavour),
        topper:      resolve("topper",   design.topper),
        color:       design.color ? resolve("color", design.color) : undefined,
        decorations: design.decorations.map((d) => resolve("decorations", d)),
        dietary:     design.dietary.map((d) => resolve("dietary", d)),
        instructions: design.instructions,
      }

      const res = await fetch("/api/generate-preview", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })
      const data = await res.json()
      if (data.fallback) {
        toast({ title: "AI preview not configured", description: "Set PIXAZO_API_KEY in .env.local to enable previews.", variant: "destructive" })
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
      const label = (key: string, id: string) =>
        categories.find((c) => c.key === key)?.options.find((o) => o.id === id)?.label ?? id

      const layerLabel      = label("layers",  design.layers)
      const shapeLabel      = label("shape",   design.shape)
      const frostingLabel   = label("frosting",design.frosting)
      const flavourLabel    = label("flavour", design.flavour)
      const topperLabel     = label("topper",  design.topper)
      const colorLabel      = design.color ? label("color", design.color) : null
      const decorLabels     = design.decorations.map((d) => label("decorations", d))
      const dietaryLabels   = design.dietary.map((d) => label("dietary", d))

      const message = [
        `Custom Cake Order — Rs. ${breakdown.total.toLocaleString()}`,
        layerLabel      ? `Layers: ${layerLabel}`                    : null,
        shapeLabel      ? `Shape: ${shapeLabel}`                     : null,
        frostingLabel   ? `Frosting: ${frostingLabel}`               : null,
        flavourLabel    ? `Flavour: ${flavourLabel}`                  : null,
        topperLabel     ? `Toppers: ${topperLabel}`                   : null,
        colorLabel      ? `Color: ${colorLabel}`                      : null,
        decorLabels.length > 0 ? `Decorations: ${decorLabels.join(", ")}` : null,
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

      <div className="grid grid-cols-1 lg:grid-cols-[340px_1fr] gap-10 items-start">

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
          <div className="rounded-2xl border border-border bg-card overflow-hidden divide-y divide-border">
            {categories.map((cat) => {
              const value = design[cat.key] as string | string[]
              return (
                <div key={cat.key} className="px-5 py-4">
                  <OptionPillGroup
                    label={cat.label}
                    options={cat.options}
                    selected={value}
                    multiSelect={cat.multiSelect}
                    onChange={(val) => setField(cat.key, val as string | string[])}
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
