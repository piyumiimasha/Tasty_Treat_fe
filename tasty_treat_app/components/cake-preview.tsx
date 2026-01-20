"use client"
import { useMemo } from "react"
import type { RenderLayer, CakeDesignState, DesignerOption } from "@/lib/types/cake-designer"
import { CakeRenderer } from "@/lib/cake-renderer"

interface CakePreviewProps {
  designState: CakeDesignState
  designerOptions: DesignerOption[]
}

export default function CakePreview({ designState, designerOptions }: CakePreviewProps) {
  const renderLayers = useMemo(() => {
    const renderer = new CakeRenderer(designerOptions, designState)
    return renderer.getRenderLayers()
  }, [designState, designerOptions])

  const renderLayer = (layer: RenderLayer) => {
    const props = layer.visualProperties

    switch (layer.type) {
      case "base":
        return (
          <div
            key={layer.id}
            className="absolute transition-all duration-300"
            style={{
              width: `${120 - (Number.parseInt(layer.id.split("-")[1]) || 0) * 15}px`,
              height: "50px",
              backgroundColor: props.color || "#D4A574",
              borderRadius:
                designState.shape === "round" ? "50%" : designState.shape === "heart" ? "50% 50% 50% 0" : "0",
              opacity: props.opacity || 1,
              transform: props.transform || "none",
              border: "2px solid rgba(0,0,0,0.1)",
              zIndex: layer.order,
            }}
          />
        )

      case "icing":
        return (
          <div
            key={layer.id}
            className="absolute transition-all duration-300"
            style={{
              width: "140px",
              height: "60px",
              backgroundColor: props.color || props.value || "#F5CBA7",
              borderRadius: designState.shape === "round" ? "50% 50% 40% 40%" : "50% 50% 40% 40%",
              top: "20px",
              zIndex: layer.order,
              backdropFilter: props.effect === "drip" ? "blur(2px)" : "none",
            }}
          />
        )

      case "topper":
        return (
          <div
            key={layer.id}
            className="absolute text-3xl transition-all duration-300"
            style={{
              top: "-30px",
              zIndex: layer.order,
            }}
          >
            {props.value || "✨"}
          </div>
        )

      case "filling":
        return (
          <div
            key={layer.id}
            className="absolute"
            style={{
              width: "135px",
              height: "4px",
              backgroundColor: props.color || props.value || "#8B4513",
              zIndex: layer.order,
              top: "48px",
            }}
          />
        )

      default:
        return null
    }
  }

  return (
    <div className="flex justify-center p-8 bg-muted rounded-lg min-h-[400px] relative">
      <div className="relative w-64 h-64 flex items-center justify-center">
        {renderLayers.map((layer) => renderLayer(layer))}
      </div>
    </div>
  )
}
