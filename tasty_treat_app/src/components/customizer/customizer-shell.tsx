"use client"

import { useState, useMemo, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useToast } from "@/hooks/use-toast"
import { getUserInfo } from "@/lib/api/auth"
import { createDesignRequest } from "@/lib/api/design-requests"
import { getDesignerOptions, type CustomizationOptionDto } from "@/lib/api/customization-options"
import { getCustomizationTypes, type CustomizationTypeDto } from "@/lib/api/customization-types"
import { generateCakePreview } from "@/lib/api/cake-preview"
import { calculateBreakdown } from "@/lib/customizer-pricing"
import { type CakeDesign, type OptionCategory } from "@/lib/customizer-options"
import { getBasePrice } from "@/lib/api/app-settings"
import OptionPillGroup from "./option-pill-group"
import PreviewPanel from "./preview-panel"
import PriceSummaryCard from "./price-summary-card"
import AdditionalInstructionsDialog from "./additional-instructions-dialog"
import { Button } from "@/components/ui/button"
import { Send, Sparkles, Cake } from "lucide-react"

function buildCategories(
  types: CustomizationTypeDto[],
  options: CustomizationOptionDto[]
): OptionCategory[] {
  return types.map((type) => ({
    key: type.name.toLowerCase(),
    label: type.name.charAt(0).toUpperCase() + type.name.slice(1),
    typeId: type.typeId,
    multiSelect: type.isMultiSelect,
    options: options
      .filter((o) => o.typeId === type.typeId)
      .map((o) => ({ id: o.optionId.toString(), label: o.name, price: o.additionalPrice })),
  }))
}

export default function CustomizerShell() {
  const router = useRouter()
  const { toast } = useToast()

  const [design, setDesign]             = useState<CakeDesign>({ instructions: "" })
  const [previewImageUrl, setPreviewImageUrl] = useState<string | null>(null)
  const [isGenerating, setIsGenerating] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [apiTypes, setApiTypes]         = useState<CustomizationTypeDto[]>([])
  const [apiOptions, setApiOptions]     = useState<CustomizationOptionDto[]>([])
  const [loadingOptions, setLoadingOptions] = useState(true)
  const [basePrice, setBasePrice]       = useState(2000)

  useEffect(() => {
    setLoadingOptions(true)
    Promise.all([getCustomizationTypes(), getDesignerOptions(), getBasePrice()])
      .then(([types, options, price]) => {
        setApiTypes(types)
        setApiOptions(options)
        setBasePrice(price)
      })
      .catch((err) => {
        console.error("[Customizer] failed to load options:", err)
        toast({ title: "Could not load options", description: "Make sure the backend is running.", variant: "destructive" })
      })
      .finally(() => setLoadingOptions(false))
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const categories = useMemo(() => buildCategories(apiTypes, apiOptions), [apiTypes, apiOptions])

  const breakdown = useMemo(
    () => calculateBreakdown(design, categories, basePrice),
    [design, categories, basePrice]
  )

  const setField = (key: string, value: string | string[]) => {
    setDesign((prev) => ({ ...prev, [key]: value }))
  }

  const handleGenerate = async () => {
    setIsGenerating(true)
    try {
      const blobUrl = await generateCakePreview(design, categories)
      console.log("[Preview] blob URL received:", blobUrl)
      setPreviewImageUrl(blobUrl)
    } catch (err: any) {
      toast({ title: "Preview failed", description: err?.message ?? "Could not generate preview.", variant: "destructive" })
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
      const selectionLines = categories
        .map((cat) => {
          const val = design[cat.key]
          if (!val) return null
          if (Array.isArray(val) && val.length > 0) {
            const labels = val.map((id) => cat.options.find((o) => o.id === id)?.label ?? id)
            return `${cat.label}: ${labels.join(", ")}`
          }
          if (typeof val === "string" && val) {
            const label = cat.options.find((o) => o.id === val)?.label ?? val
            return `${cat.label}: ${label}`
          }
          return null
        })
        .filter(Boolean)

      const instructions = design.instructions as string
      const message = [
        `Custom Cake Order — Rs. ${breakdown.total.toLocaleString()}`,
        ...selectionLines,
        instructions ? `Special instructions: ${instructions}` : null,
      ]
        .filter(Boolean)
        .join("\n")

      await createDesignRequest(info.name, message, undefined, previewImageUrl ?? undefined, info.userId)
      toast({ title: "Request submitted!", description: "We'll review your design and be in touch soon." })
      router.push("/orders")
    } catch (err: any) {
      toast({ title: "Submission failed", description: err?.message ?? "Please try again.", variant: "destructive" })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div>
      {/* ── Hero header ── */}
      <div className="relative overflow-hidden" style={{ background: "linear-gradient(135deg, #fde0ef 0%, #fdeef5 60%, #fdf3e8 100%)" }}>
        {/* Decorative blobs */}
        <div className="absolute -top-24 right-8 w-96 h-96 rounded-full pointer-events-none"
          style={{ background: "oklch(0.80 0.09 350)", filter: "blur(80px)", opacity: 0.18 }} />
        <div className="absolute bottom-0 left-0 w-72 h-56 rounded-full pointer-events-none"
          style={{ background: "oklch(0.85 0.06 30)", filter: "blur(60px)", opacity: 0.14 }} />
        {/* Decorative circles */}
        <div className="absolute top-6 right-[12%] w-5 h-5 rounded-full border-2 pointer-events-none" style={{ borderColor: "#C97B96", opacity: 0.3 }} />
        <div className="absolute top-14 right-[18%] w-2.5 h-2.5 rounded-full pointer-events-none" style={{ background: "#C97B96", opacity: 0.25 }} />
        <div className="absolute bottom-6 right-[8%] w-3 h-3 rounded-full pointer-events-none" style={{ background: "#D98FAC", opacity: 0.3 }} />

        <div className="relative max-w-5xl mx-auto px-6 py-12 lg:py-16">
          <div className="flex items-center gap-2.5 mb-4">
            <div className="w-8 h-[2px] rounded-full" style={{ background: "#C97B96" }} />
            <span className="text-[11px] font-semibold tracking-[0.26em] uppercase" style={{ color: "#C97B96" }}>
              Design Studio
            </span>
          </div>
          <div className="flex items-end gap-4 flex-wrap">
            <div>
              <h1 className="font-serif text-4xl sm:text-5xl font-bold text-primary leading-tight mb-3">
                Design Your<br />
                <em className="not-italic" style={{ color: "#C97B96" }}>Dream Cake</em>
              </h1>
              <p className="text-muted-foreground text-base max-w-md leading-relaxed">
                Pick your flavours, tiers, and frosting. Generate an AI preview, then send us your design.
              </p>
            </div>
            {/* Decorative cake icon cluster */}
            <div className="hidden lg:flex items-center gap-3 ml-auto mb-1">
              <div className="flex flex-col items-center gap-1 opacity-25">
                <Cake className="w-8 h-8" style={{ color: "#A0526E" }} />
                <Sparkles className="w-4 h-4" style={{ color: "#C97B96" }} />
              </div>
              <div className="w-px h-12 rounded-full" style={{ background: "#D98FAC", opacity: 0.3 }} />
              <div className="text-right opacity-40">
                <p className="font-serif text-xl font-bold text-primary">Baked</p>
                <p className="font-serif text-xl font-bold" style={{ color: "#C97B96" }}>with love</p>
              </div>
            </div>
          </div>
          {/* Step indicators */}
          <div className="flex items-center gap-3 mt-8 flex-wrap">
            {["Choose options", "Generate preview", "Submit request"].map((step, i) => (
              <div key={step} className="flex items-center gap-2">
                {i > 0 && <div className="w-6 h-px" style={{ background: "#D0A0B8", opacity: 0.5 }} />}
                <div className="flex items-center gap-1.5">
                  <span className="w-5 h-5 rounded-full text-[10px] font-bold flex items-center justify-center text-white"
                    style={{ background: "#C97B96" }}>
                    {i + 1}
                  </span>
                  <span className="text-xs font-medium text-muted-foreground">{step}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Main content ── */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-[340px_1fr] gap-8 items-start">

          {/* ── Left panel ── */}
          <div className="lg:sticky lg:top-24 space-y-5">
            <PreviewPanel
              imageUrl={previewImageUrl}
              isGenerating={isGenerating}
              onGenerate={handleGenerate}
            />
            <PriceSummaryCard breakdown={breakdown} />
          </div>

          {/* ── Right panel ── */}
          <div className="space-y-4">
            <div className="rounded-2xl border overflow-hidden divide-y shadow-sm"
              style={{ borderColor: "#f0cede", background: "rgba(255,255,255,0.82)", backdropFilter: "blur(8px)", divideColor: "#f5e0ea" }}>
              {loadingOptions ? (
                <div className="flex flex-col items-center justify-center gap-3 py-20">
                  <div className="h-8 w-8 animate-spin rounded-full border-4 border-t-transparent" style={{ borderColor: "#ECC0D0", borderTopColor: "transparent" }} />
                  <p className="text-sm text-muted-foreground">Loading options…</p>
                </div>
              ) : categories.map((cat) => {
                const value = design[cat.key] ?? (cat.multiSelect ? [] : "")
                return (
                  <div key={cat.key} className="px-5 py-4" style={{ borderColor: "#f5e0ea" }}>
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

              <div className="px-5 py-4" style={{ borderColor: "#f5e0ea" }}>
                <AdditionalInstructionsDialog
                  value={(design.instructions as string) ?? ""}
                  onChange={(val) => setField("instructions", val)}
                />
              </div>
            </div>

            <Button
              onClick={handleSubmit}
              disabled={isSubmitting}
              size="lg"
              className="w-full gap-2 h-12 text-white font-semibold rounded-xl shadow-md transition-all duration-200"
              style={{ background: "linear-gradient(135deg, #A0526E 0%, #C97B96 100%)" }}
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
    </div>
  )
}
