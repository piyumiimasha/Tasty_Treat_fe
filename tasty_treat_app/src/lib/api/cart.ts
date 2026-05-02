const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://localhost:55079'

export interface CartItem {
  cartItemId: string  // "{itemId}-{size}-{flavor}"
  itemId: number
  name: string
  image: string
  price: number       // per-unit calculated price
  quantity: number
  size: string
  flavor: string
}

function headers(): HeadersInit {
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  }
}

async function getActiveQuote(customerId: number): Promise<{ quoteId: number; items: CartItem[] } | null> {
  const res = await fetch(`${API_BASE_URL}/api/InstantQuotes/customer/${customerId}`, { headers: headers() })
  if (!res.ok) return null
  const quotes: any[] = await res.json()
  const active = quotes.find((q) => q.convertedOrderId == null)
  if (!active) return null
  try {
    return { quoteId: active.quoteId, items: JSON.parse(active.items || '[]') }
  } catch {
    return { quoteId: active.quoteId, items: [] }
  }
}

function calcTotals(items: CartItem[]) {
  const subtotal = items.reduce((s, i) => s + i.price * i.quantity, 0)
  const tax = Math.round(subtotal * 0.1 * 100) / 100
  return { tax, estimatedPrice: Math.round((subtotal + tax) * 100) / 100 }
}

export async function getCart(customerId: number): Promise<{ quoteId: number | null; items: CartItem[] }> {
  const quote = await getActiveQuote(customerId)
  return quote ?? { quoteId: null, items: [] }
}

export async function addItemToCart(
  customerId: number,
  item: Omit<CartItem, 'cartItemId'> & { quantity?: number }
): Promise<void> {
  const cartItemId = `${item.itemId}-${item.size}-${item.flavor}`
  const { quoteId, items } = await getCart(customerId)

  const existing = items.find((i) => i.cartItemId === cartItemId)
  const newItems: CartItem[] = existing
    ? items.map((i) => i.cartItemId === cartItemId ? { ...i, quantity: i.quantity + (item.quantity ?? 1) } : i)
    : [...items, { ...item, cartItemId, quantity: item.quantity ?? 1 }]

  const { tax, estimatedPrice } = calcTotals(newItems)

  if (quoteId == null) {
    await fetch(`${API_BASE_URL}/api/InstantQuotes`, {
      method: 'POST',
      headers: headers(),
      body: JSON.stringify({ customerId, items: JSON.stringify(newItems), tax, discount: 0, deliveryFee: 0, estimatedPrice }),
    })
  } else {
    await fetch(`${API_BASE_URL}/api/InstantQuotes/${quoteId}`, {
      method: 'PUT',
      headers: headers(),
      body: JSON.stringify({ items: JSON.stringify(newItems), tax, estimatedPrice }),
    })
  }

  window.dispatchEvent(new Event('cart-updated'))
}

export async function updateCartItemQuantity(customerId: number, cartItemId: string, quantity: number): Promise<void> {
  const { quoteId, items } = await getCart(customerId)
  if (!quoteId) return

  const newItems = items.map((i) => i.cartItemId === cartItemId ? { ...i, quantity } : i)
  const { tax, estimatedPrice } = calcTotals(newItems)

  await fetch(`${API_BASE_URL}/api/InstantQuotes/${quoteId}`, {
    method: 'PUT',
    headers: headers(),
    body: JSON.stringify({ items: JSON.stringify(newItems), tax, estimatedPrice }),
  })

  window.dispatchEvent(new Event('cart-updated'))
}

export async function removeCartItem(customerId: number, cartItemId: string): Promise<void> {
  const { quoteId, items } = await getCart(customerId)
  if (!quoteId) return

  const newItems = items.filter((i) => i.cartItemId !== cartItemId)
  const { tax, estimatedPrice } = calcTotals(newItems)

  await fetch(`${API_BASE_URL}/api/InstantQuotes/${quoteId}`, {
    method: 'PUT',
    headers: headers(),
    body: JSON.stringify({ items: JSON.stringify(newItems), tax, estimatedPrice }),
  })

  window.dispatchEvent(new Event('cart-updated'))
}

export async function convertCartToOrder(quoteId: number, orderId: number): Promise<void> {
  await fetch(`${API_BASE_URL}/api/InstantQuotes/${quoteId}`, {
    method: 'PUT',
    headers: headers(),
    body: JSON.stringify({ convertedOrderId: orderId }),
  })

  window.dispatchEvent(new Event('cart-updated'))
}
