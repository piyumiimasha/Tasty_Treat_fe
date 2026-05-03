import { Button } from "@/components/ui/button"
import { CakeSlice, Sparkles } from "lucide-react"

interface PreviewPanelProps {
  imageUrl: string | null
  isGenerating: boolean
  onGenerate: () => void
}

export default function PreviewPanel({ imageUrl, isGenerating, onGenerate }: PreviewPanelProps) {
  return (
    <div className="space-y-3">
      {/* Image area */}
      <div className="relative w-full aspect-square rounded-2xl border border-border bg-muted overflow-hidden">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt="AI-generated cake preview"
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center gap-3 text-muted-foreground">
            <div className="w-16 h-16 rounded-full bg-accent/10 flex items-center justify-center">
              <CakeSlice className="w-8 h-8 text-accent/60" />
            </div>
            <div className="text-center px-6">
              <p className="text-sm font-medium text-foreground">Your cake preview</p>
              <p className="text-xs text-muted-foreground mt-1">Configure your options then click Generate Preview</p>
            </div>
          </div>
        )}

        {/* Loading overlay */}
        {isGenerating && (
          <div className="absolute inset-0 bg-background/80 backdrop-blur-sm flex flex-col items-center justify-center gap-3">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-accent border-t-transparent" />
            <p className="text-sm font-medium text-foreground">Generating your cake…</p>
          </div>
        )}
      </div>

      {/* Generate button */}
      <Button
        onClick={onGenerate}
        disabled={isGenerating}
        className="w-full gap-2 bg-accent hover:bg-accent/90 text-white"
      >
        <Sparkles className="w-4 h-4" />
        {isGenerating ? "Generating…" : imageUrl ? "Regenerate Preview" : "Generate Preview"}
      </Button>

      <p className="text-center text-xs text-muted-foreground">
        AI-generated preview — your actual cake may vary slightly
      </p>
    </div>
  )
}
