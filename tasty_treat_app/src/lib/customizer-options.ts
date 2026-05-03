export interface OptionItem {
  id: string
  label: string
  price: number
}

export interface OptionCategory {
  key: keyof CakeDesign
  label: string
  multiSelect: boolean
  options: OptionItem[]
}

export interface CakeDesign {
  layers: number
  shape: string
  frosting: string
  flavour: string
  topper: string
  dietary: string[]
  instructions: string
}

export const BASE_PRICE = 2000

export const OPTION_CATEGORIES: OptionCategory[] = [
  {
    key: "layers",
    label: "Number of Layers",
    multiSelect: false,
    options: [
      { id: "1", label: "1", price: 0 },
      { id: "2", label: "2", price: 300 },
      { id: "3", label: "3", price: 600 },
      { id: "4", label: "4", price: 900 },
    ],
  },
  {
    key: "shape",
    label: "Shape",
    multiSelect: false,
    options: [
      { id: "round",  label: "Round",  price: 0   },
      { id: "square", label: "Square", price: 150 },
      { id: "heart",  label: "Heart",  price: 200 },
    ],
  },
  {
    key: "frosting",
    label: "Frosting Type",
    multiSelect: false,
    options: [
      { id: "buttercream", label: "Buttercream", price: 0   },
      { id: "fondant",     label: "Fondant",     price: 400 },
      { id: "ganache",     label: "Ganache",     price: 350 },
    ],
  },
  {
    key: "flavour",
    label: "Flavour",
    multiSelect: false,
    options: [
      { id: "vanilla",    label: "Vanilla",    price: 0   },
      { id: "chocolate",  label: "Chocolate",  price: 150 },
      { id: "red-velvet", label: "Red Velvet", price: 250 },
    ],
  },
  {
    key: "topper",
    label: "Toppers",
    multiSelect: false,
    options: [
      { id: "none",          label: "None",          price: 0   },
      { id: "fresh-flowers", label: "Fresh Flowers", price: 500 },
      { id: "gold-drip",     label: "Gold Drip",     price: 450 },
    ],
  },
  {
    key: "dietary",
    label: "Dietary",
    multiSelect: true,
    options: [
      { id: "vegan",       label: "Vegan",       price: 300 },
      { id: "gluten-free", label: "Gluten Free", price: 250 },
      { id: "dairy-free",  label: "Dairy Free",  price: 300 },
    ],
  },
]

export function findOptionPrice(key: string, id: string): number {
  return OPTION_CATEGORIES.find((c) => c.key === key)?.options.find((o) => o.id === id)?.price ?? 0
}
