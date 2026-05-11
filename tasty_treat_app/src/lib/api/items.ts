// API base URL - update this to match your backend URL
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://localhost:55079';

// TypeScript interfaces matching backend DTOs
export interface ItemDto {
  itemId: number;
  name: string;
  category: string;
  categoryId?: number;
  basePrice: number;
  basePriceUnit?: string;
  description?: string;
  imageUrl?: string;
}

export interface CreateItemDto {
  name: string;
  categoryId?: number;
  basePrice: number;
  basePriceUnit?: string;
  description?: string;
}

export interface UpdateItemDto {
  name?: string;
  categoryId?: number;
  basePrice?: number;
  basePriceUnit?: string;
  description?: string;
}

// API Error class
export class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
    this.name = 'ApiError';
  }
}

// Helper function to get auth token
function getAuthToken(): string | null {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('authToken');
  }
  return null;
}

// Helper function to build headers
function buildHeaders(includeAuth: boolean = false, isFormData: boolean = false): HeadersInit {
  const headers: HeadersInit = {};

  // Don't set Content-Type for FormData, browser will set it with boundary
  if (!isFormData) {
    headers['Content-Type'] = 'application/json';
  }

  if (includeAuth) {
    const token = getAuthToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
  }

  return headers;
}

// Get all items
export async function getAllItems(): Promise<ItemDto[]> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/Items`, {
      method: 'GET',
      headers: buildHeaders(),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new ApiError(response.status, errorText || 'Failed to fetch items');
    }

    return await response.json();
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw new Error('Network error: Unable to fetch items');
  }
}

// Get item by ID
export async function getItemById(id: number): Promise<ItemDto> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/Items/${id}`, {
      method: 'GET',
      headers: buildHeaders(),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new ApiError(response.status, errorText || `Item with id ${id} not found`);
    }

    return await response.json();
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw new Error(`Network error: Unable to fetch item ${id}`);
  }
}

// Get items by category
export async function getItemsByCategory(category: string): Promise<ItemDto[]> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/Items/category/${encodeURIComponent(category)}`, {
      method: 'GET',
      headers: buildHeaders(),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new ApiError(response.status, errorText || `Failed to fetch items in category ${category}`);
    }

    return await response.json();
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw new Error('Network error: Unable to fetch items by category');
  }
}

// Create new item (requires authentication)
export async function createItem(data: CreateItemDto, imageFile?: File): Promise<ItemDto> {
  try {
    const formData = new FormData();
    
    // Append item data
    formData.append('name', data.name);
    formData.append('basePrice', data.basePrice.toString());

    if (data.categoryId !== undefined) {
      formData.append('categoryId', data.categoryId.toString());
    }

    if (data.basePriceUnit) {
      formData.append('basePriceUnit', data.basePriceUnit);
    }

    if (data.description) {
      formData.append('description', data.description);
    }
    
    // Append image if provided
    if (imageFile) {
      formData.append('image', imageFile);
    }

    const response = await fetch(`${API_BASE_URL}/api/Items`, {
      method: 'POST',
      headers: buildHeaders(true, true),
      body: formData,
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new ApiError(response.status, errorText || 'Failed to create item');
    }

    return await response.json();
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw new Error('Network error: Unable to create item');
  }
}

// Update existing item (requires authentication)
export async function updateItem(id: number, data: UpdateItemDto, imageFile?: File): Promise<ItemDto> {
  try {
    const formData = new FormData();
    
    // Append only defined fields
    if (data.name !== undefined) {
      formData.append('name', data.name);
    }
    
    if (data.categoryId !== undefined) {
      formData.append('categoryId', data.categoryId.toString());
    }

    if (data.basePrice !== undefined) {
      formData.append('basePrice', data.basePrice.toString());
    }
    
    if (data.basePriceUnit !== undefined) {
      formData.append('basePriceUnit', data.basePriceUnit);
    }
    
    if (data.description !== undefined) {
      formData.append('description', data.description);
    }
    
    // Append image if provided
    if (imageFile) {
      formData.append('image', imageFile);
    }

    const response = await fetch(`${API_BASE_URL}/api/Items/${id}`, {
      method: 'PUT',
      headers: buildHeaders(true, true),
      body: formData,
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new ApiError(response.status, errorText || `Failed to update item ${id}`);
    }

    return await response.json();
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw new Error('Network error: Unable to update item');
  }
}

// Delete item (requires authentication)
export async function deleteItem(id: number): Promise<boolean> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/Items/${id}`, {
      method: 'DELETE',
      headers: buildHeaders(true),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new ApiError(response.status, errorText || `Failed to delete item ${id}`);
    }

    // NoContent (204) returns successfully
    return true;
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw new Error('Network error: Unable to delete item');
  }
}

// Upload image for existing item (requires authentication)
export async function uploadItemImage(id: number, imageFile: File): Promise<ItemDto> {
  try {
    const formData = new FormData();
    formData.append('file', imageFile);

    const response = await fetch(`${API_BASE_URL}/api/Items/${id}/upload-image`, {
      method: 'POST',
      headers: buildHeaders(true, true),
      body: formData,
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new ApiError(response.status, errorText || 'Failed to upload image');
    }

    return await response.json();
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw new Error('Network error: Unable to upload image');
  }
}

// Delete image from item (requires authentication)
export async function deleteItemImage(id: number): Promise<ItemDto> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/Items/${id}/delete-image`, {
      method: 'DELETE',
      headers: buildHeaders(true),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new ApiError(response.status, errorText || 'Failed to delete image');
    }

    return await response.json();
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw new Error('Network error: Unable to delete image');
  }
}

