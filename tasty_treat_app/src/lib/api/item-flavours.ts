const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://localhost:55079';

export interface ItemFlavourDto {
  itemFlavourId: number;
  itemId: number;
  name: string;
  extraPrice: number;
}

export interface CreateItemFlavourDto {
  name: string;
  extraPrice: number;
}

export interface UpdateItemFlavourDto {
  name?: string;
  extraPrice?: number;
}

function getAuthToken(): string | null {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('authToken');
  }
  return null;
}

function buildHeaders(includeAuth = false): HeadersInit {
  const headers: HeadersInit = { 'Content-Type': 'application/json' };
  if (includeAuth) {
    const token = getAuthToken();
    if (token) headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
}

export async function getFlavoursByItem(itemId: number): Promise<ItemFlavourDto[]> {
  const response = await fetch(`${API_BASE_URL}/api/Items/${itemId}/flavours`, {
    method: 'GET',
    headers: buildHeaders(),
  });
  if (!response.ok) throw new Error('Failed to fetch flavours');
  return response.json();
}

export async function createFlavour(itemId: number, data: CreateItemFlavourDto): Promise<ItemFlavourDto> {
  const response = await fetch(`${API_BASE_URL}/api/Items/${itemId}/flavours`, {
    method: 'POST',
    headers: buildHeaders(true),
    body: JSON.stringify(data),
  });
  if (!response.ok) throw new Error('Failed to create flavour');
  return response.json();
}

export async function updateFlavour(itemId: number, id: number, data: UpdateItemFlavourDto): Promise<ItemFlavourDto> {
  const response = await fetch(`${API_BASE_URL}/api/Items/${itemId}/flavours/${id}`, {
    method: 'PUT',
    headers: buildHeaders(true),
    body: JSON.stringify(data),
  });
  if (!response.ok) throw new Error('Failed to update flavour');
  return response.json();
}

export async function deleteFlavour(itemId: number, id: number): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/api/Items/${itemId}/flavours/${id}`, {
    method: 'DELETE',
    headers: buildHeaders(true),
  });
  if (!response.ok) throw new Error('Failed to delete flavour');
}

