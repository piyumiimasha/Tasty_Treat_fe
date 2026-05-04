const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://localhost:55079'

export interface OrderDto {
  orderId: number
  customerId: number
  status: string
  deliveryAddress: string | null
  specialInstructions: string | null
  totalAmount: number
  orderDate: string
}

export interface CreateOrderDto {
  customerId: number
  status?: string
  deliveryAddress?: string
  specialInstructions?: string
  totalAmount: number
}

export interface UpdateOrderDto {
  status?: string
  deliveryAddress?: string
  specialInstructions?: string
  totalAmount?: number
}

export interface OrderItemDto {
  orderItemId: number
  orderId: number
  itemId: number
  customizationOptionId?: number | null
  quantity: number
  orderItemPrice: number
  isAvailable: boolean
  createdAt: string
}

export interface CreateOrderItemDto {
  orderId: number
  itemId: number
  quantity: number
  orderItemPrice: number
  isAvailable?: boolean
}

function headers(): HeadersInit {
  const token = typeof window !== 'undefined' ? localStorage.getItem('authToken') : null
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  }
}

// â”€â”€ Orders â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

export async function getAllOrders(): Promise<OrderDto[]> {
  const res = await fetch(`${API_BASE_URL}/api/Orders`, { headers: headers() })
  if (!res.ok) throw new Error('Failed to fetch orders')
  return res.json()
}

export async function getOrderById(id: number): Promise<OrderDto> {
  const res = await fetch(`${API_BASE_URL}/api/Orders/${id}`, { headers: headers() })
  if (!res.ok) throw new Error(`Order ${id} not found`)
  return res.json()
}

export async function getOrdersByCustomer(customerId: number): Promise<OrderDto[]> {
  const res = await fetch(`${API_BASE_URL}/api/Orders/customer/${customerId}`, { headers: headers() })
  if (!res.ok) throw new Error('Failed to fetch customer orders')
  return res.json()
}

export async function getOrdersByStatus(status: string): Promise<OrderDto[]> {
  const res = await fetch(`${API_BASE_URL}/api/Orders/status/${encodeURIComponent(status)}`, { headers: headers() })
  if (!res.ok) throw new Error('Failed to fetch orders by status')
  return res.json()
}

export async function createOrder(dto: CreateOrderDto): Promise<OrderDto> {
  const res = await fetch(`${API_BASE_URL}/api/Orders`, {
    method: 'POST',
    headers: headers(),
    body: JSON.stringify({ status: 'Pending', ...dto }),
  })
  if (!res.ok) throw new Error('Failed to create order')
  return res.json()
}

export async function updateOrder(id: number, dto: UpdateOrderDto): Promise<OrderDto> {
  const res = await fetch(`${API_BASE_URL}/api/Orders/${id}`, {
    method: 'PUT',
    headers: headers(),
    body: JSON.stringify(dto),
  })
  if (!res.ok) throw new Error('Failed to update order')
  return res.json()
}

export async function deleteOrder(id: number): Promise<void> {
  const res = await fetch(`${API_BASE_URL}/api/Orders/${id}`, {
    method: 'DELETE',
    headers: headers(),
  })
  if (!res.ok) throw new Error('Failed to delete order')
}

// â”€â”€ Order Items â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

export async function getOrderItems(orderId: number): Promise<OrderItemDto[]> {
  const res = await fetch(`${API_BASE_URL}/api/OrderItems/order/${orderId}`, { headers: headers() })
  if (!res.ok) throw new Error('Failed to fetch order items')
  return res.json()
}

export async function createOrderItem(dto: CreateOrderItemDto): Promise<OrderItemDto> {
  const res = await fetch(`${API_BASE_URL}/api/OrderItems`, {
    method: 'POST',
    headers: headers(),
    body: JSON.stringify({ isAvailable: true, ...dto }),
  })
  if (!res.ok) throw new Error('Failed to create order item')
  return res.json()
}

