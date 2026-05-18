import { Button } from "@/components/ui/button"
import { CakeSlice, Sparkles, RefreshCw } from "lucide-react"

interface PreviewPanelProps {
  imageUrl: string | null
  isGenerating: boolean
  onGenerate: () => void
}

export default function PreviewPanel({ imageUrl, isGenerating, onGenerate }: PreviewPanelProps) {
  return (
    <div className="space-y-3">
      {/* Image area */}
      <div className="relative w-full aspect-square rounded-2xl overflow-hidden shadow-md"
        style={{ border: "1.5px solid #f0cede", background: imageUrl ? "#fff" : "linear-gradient(145deg, #fff5fa 0%, #fde8f2 100%)" }}>
        {imageUrl ? (
          <img
            src={imageUrl}
            alt="AI-generated cake preview"
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center gap-4 p-6">
            {/* Decorative placeholder */}
            <div className="relative">
              <div className="w-20 h-20 rounded-full flex items-center justify-center"
                style={{ background: "linear-gradient(135deg, #fde0ef, #fcc8df)" }}>
                <CakeSlice className="w-9 h-9" style={{ color: "#C97B96" }} />
              </div>
              <div className="absolute -top-1 -right-1 w-6 h-6 rounded-full flex items-center justify-center"
                style={{ background: "#fff", border: "1.5px solid #f0cede" }}>
                <Sparkles className="w-3 h-3" style={{ color: "#C97B96" }} />
              </div>
            </div>
            <div className="text-center">
              <p className="text-sm font-semibold text-primary">Your cake preview</p>
              <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                Configure your options then<br />click Generate Preview
              </p>
            </div>
            {/* Decorative dots */}
            <div className="flex gap-1.5 mt-1">
              {[0, 1, 2].map(i => (
                <div key={i} className="w-1.5 h-1.5 rounded-full" style={{ background: "#D98FAC", opacity: 0.4 + i * 0.15 }} />
              ))}
            </div>
          </div>
        )}

        {/* Loading overlay */}
        {isGenerating && (
          <div className="absolute inset-0 backdrop-blur-sm flex flex-col items-center justify-center gap-3"
            style={{ background: "rgba(253,238,245,0.85)" }}>
            <div className="h-9 w-9 animate-spin rounded-full border-4 border-t-transparent"
              style={{ borderColor: "#ECC0D0", borderTopColor: "transparent" }} />
            <p className="text-sm font-medium text-primary">Generating your cake…</p>
            <p className="text-xs text-muted-foreground">This may take a moment</p>
          </div>
        )}

        {/* Corner label when image shown */}
        {imageUrl && !isGenerating && (
          <div className="absolute top-3 right-3 rounded-full px-2.5 py-0.5 text-[10px] font-semibold text-white"
            style={{ background: "rgba(160,82,110,0.85)", backdropFilter: "blur(4px)" }}>
            AI Preview
          </div>
        )}
      </div>

      {/* Generate button */}
      <Button
        onClick={onGenerate}
        disabled={isGenerating}
        className="w-full gap-2 font-semibold text-white h-10 rounded-xl shadow-sm transition-all duration-200"
        style={{ background: "linear-gradient(135deg, #C97B96 0%, #D98FAC 100%)" }}
      >
        {isGenerating
          ? <><RefreshCw className="w-4 h-4 animate-spin" /> Generating…</>
          : <><Sparkles className="w-4 h-4" /> {imageUrl ? "Regenerate Preview" : "Generate Preview"}</>
        }
      </Button>

      <p className="text-center text-[11px] text-muted-foreground">
        AI preview — actual cake may vary slightly
      </p>
    </div>
  )
}
