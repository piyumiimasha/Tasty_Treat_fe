export interface OptionItem {
  id: string      // optionId.toString()
  label: string
  price: number
}

export interface OptionCategory {
  key: string     // type.name.toLowerCase() — dynamic, driven by backend
  label: string
  typeId: number
  multiSelect: boolean
  options: OptionItem[]
}

export type CakeDesign = Record<string, string | string[]>

export const BASE_PRICE = 2000
