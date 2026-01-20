import type { CakeDesignState, DesignerOption, RenderLayer } from "@/lib/types/cake-designer"

export class CakeRenderer {
  private designerOptions: DesignerOption[] = []
  private designState: CakeDesignState

  constructor(options: DesignerOption[], initialState: CakeDesignState) {
    this.designerOptions = options
    this.designState = initialState
  }

  // Build render layers from current design state
  getRenderLayers(): RenderLayer[] {
    const layers: RenderLayer[] = []

    // Base cake layer
    const baseOption = this.findOption("shapes", this.designState.shape)
    if (baseOption) {
      layers.push({
        id: "base",
        type: "base",
        visualProperties: baseOption.visualMetadata,
        order: 0,
      })
    }

    // Multiple cake layers (stacked)
    for (let i = 0; i < this.designState.layers; i++) {
      layers.push({
        id: `layer-${i}`,
        type: "base",
        visualProperties: {
          ...baseOption?.visualMetadata,
          opacity: 1 - i * 0.1,
          transform: `translateY(${i * 70}px)`,
        },
        order: 1 + i,
      })
    }

    // Icing layer
    const frostingOption = this.findOption("frosting", this.designState.frosting)
    if (frostingOption) {
      layers.push({
        id: "icing",
        type: "icing",
        visualProperties: {
          ...frostingOption.visualMetadata,
          color: this.designState.icingColor,
        },
        order: 100,
      })
    }

    // Filling layers (visual only)
    this.designState.fillings.forEach((filling, idx) => {
      const fillingOption = this.findOption("fillings", filling)
      if (fillingOption) {
        layers.push({
          id: `filling-${idx}`,
          type: "filling",
          visualProperties: fillingOption.visualMetadata,
          order: 50 + idx,
        })
      }
    })

    // Topper layers
    this.designState.toppers.forEach((topper, idx) => {
      const topperOption = this.findOption("toppers", topper)
      if (topperOption) {
        layers.push({
          id: `topper-${idx}`,
          type: "topper",
          visualProperties: topperOption.visualMetadata,
          order: 200 + idx,
        })
      }
    })

    return layers.sort((a, b) => a.order - b.order)
  }

  // Find option by category and id
  private findOption(category: string, optionId: string): DesignerOption | undefined {
    return this.designerOptions.find((opt) => opt.category === category && opt.id === optionId)
  }

  // Check if option is compatible with current design
  isOptionCompatible(option: DesignerOption): boolean {
    if (!option.compatible) return true

    if (option.compatible.maxLayers && this.designState.layers > option.compatible.maxLayers) {
      return false
    }

    if (option.compatible.excludeShapes?.includes(this.designState.shape)) {
      return false
    }

    return true
  }

  // Update design state
  updateDesign(updates: Partial<CakeDesignState>) {
    this.designState = { ...this.designState, ...updates }
  }

  // Get filtered options for a category
  getOptionsForCategory(category: string): DesignerOption[] {
    return this.designerOptions.filter((opt) => opt.category === category).filter((opt) => this.isOptionCompatible(opt))
  }
}
