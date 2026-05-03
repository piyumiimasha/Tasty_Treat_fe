export interface OptionItem {
  id: string      // optionId.toString()
  label: string
  price: number
}

export interface OptionCategory {
  key: keyof CakeDesign
  label: string
  typeId: number
  multiSelect: boolean
  options: OptionItem[]
}

export interface CakeDesign {
  layers: string        // optionId of selected layer option
  shape: string
  frosting: string
  flavour: string
  topper: string
  color: string
  decorations: string[]
  dietary: string[]
  instructions: string
}

export const BASE_PRICE = 2000
