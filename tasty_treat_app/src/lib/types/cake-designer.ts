export interface DesignerOption {
  id: string | number
  category: "shapes" | "layers" | "frosting" | "colors" | "toppers" | "decorations"
  name: string
  price: number
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
