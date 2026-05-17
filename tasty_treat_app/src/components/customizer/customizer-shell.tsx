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
import { Send } from "lucide-react"

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
            {loadingOptions ? (
              <div className="flex justify-center py-16">
                <div className="h-7 w-7 animate-spin rounded-full border-4 border-primary border-t-transparent" />
              </div>
            ) : categories.map((cat) => {
              const value = design[cat.key] ?? (cat.multiSelect ? [] : "")
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
                value={(design.instructions as string) ?? ""}
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
