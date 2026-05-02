const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://localhost:55079';

export interface DesignRequestDto {
  designRequestId: number;
  customerName: string;
  message?: string;
  imageUrl?: string;
  status: string;
  createdAt: string;
}

function getAuthToken(): string | null {
  if (typeof window !== 'undefined') return localStorage.getItem('token');
  return null;
}

function authHeaders(): HeadersInit {
  const token = getAuthToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export async function getAllDesignRequests(): Promise<DesignRequestDto[]> {
  const response = await fetch(`${API_BASE_URL}/api/DesignRequests`, {
    headers: { 'Content-Type': 'application/json' },
  });
  if (!response.ok) throw new Error('Failed to fetch design requests');
  return response.json();
}

export async function createDesignRequest(
  customerName: string,
  message: string,
  imageFile?: File,
): Promise<DesignRequestDto> {
  const formData = new FormData();
  formData.append('customerName', customerName);
  if (message) formData.append('message', message);
  if (imageFile) formData.append('image', imageFile);

  const response = await fetch(`${API_BASE_URL}/api/DesignRequests`, {
    method: 'POST',
    headers: authHeaders(),
    body: formData,
  });
  if (!response.ok) {
    const text = await response.text();
    throw new Error(text || 'Failed to submit design request');
  }
  return response.json();
}

export async function updateDesignRequestStatus(id: number, status: string): Promise<DesignRequestDto> {
  const response = await fetch(`${API_BASE_URL}/api/DesignRequests/${id}/status`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', ...authHeaders() },
    body: JSON.stringify({ status }),
  });
  if (!response.ok) throw new Error('Failed to update status');
  return response.json();
}
