export interface VisualMetadata {
  type: "color" | "image" | "texture" | "effect" | "shape"
  layer: "base" | "icing" | "topper" | "filling" | "decoration"
  value: string
  imageUrl?: string
  effectConfig?: Record<string, any>
}

export interface DesignerOption {
  id: string | number
  category: "shapes" | "layers" | "frosting" | "colors" | "toppers" | "decorations"
  name: string
  price: number
  visualMetadata: VisualMetadata
  compatible?: {
    maxLayers?: number
    excludeShapes?: string[]
    requireCategories?: string[]
  }
}

export interface CakeDesignState {
  shape: string
  layers: number
  frosting: string
  baseColor: string
  icingColor: string
  toppers: string[]
  fillings: string[]
  flavors: string[]
  dietary: string[]
  size: string
}

export interface RenderLayer {
  id: string
  type: "base" | "icing" | "topper" | "filling" | "decoration"
  visualProperties: Record<string, any>
  order: number
}
