// API base URL - update this to match your backend URL
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://localhost:55079';

export interface RegisterDto {
  name: string;
  email: string;
  password: string;
  role?: string;
  phoneNo?: string;
  address?: string;
}

export interface LoginDto {
  email: string;
  password: string;
}

export interface AuthResponseDto {
  token: string;
  userId: number;
  email: string;
  name: string;
  role: string;
}

export interface UserInfo {
  userId: number;
  email: string;
  name: string;
  role: string;
}

// API Error class
export class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
    this.name = 'ApiError';
  }
}

// Register new user
export async function register(data: RegisterDto): Promise<AuthResponseDto> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/Auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    const result = await response.json();

    if (!response.ok) {
      throw new ApiError(response.status, result.message || 'Registration failed');
    }

    return result;
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError(500, 'Network error. Please check your connection.');
  }
}

// Login user
export async function login(data: LoginDto): Promise<AuthResponseDto> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/Auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    const result = await response.json();

    if (!response.ok) {
      throw new ApiError(response.status, result.message || 'Login failed');
    }

    return result;
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError(500, 'Network error. Please check your connection.');
  }
}

// Store auth data in localStorage
export function setAuthData(authResponse: AuthResponseDto): void {
  localStorage.setItem('authToken', authResponse.token);
  localStorage.setItem('userInfo', JSON.stringify({
    userId: authResponse.userId,
    email: authResponse.email,
    name: authResponse.name,
    role: authResponse.role,
  }));
  
  // Dispatch storage event for cross-component sync
  window.dispatchEvent(new Event('storage'));
}

// Get stored auth token
export function getAuthToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('authToken');
}

// Get stored user info
export function getUserInfo(): UserInfo | null {
  if (typeof window === 'undefined') return null;
  const userInfoStr = localStorage.getItem('userInfo');
  if (!userInfoStr) return null;
  
  try {
    return JSON.parse(userInfoStr);
  } catch {
    return null;
  }
}

// Check if user is authenticated
export function isAuthenticated(): boolean {
  return !!getAuthToken();
}

// Logout user
export function logout(): void {
  localStorage.removeItem('authToken');
  localStorage.removeItem('userInfo');
  
  // Dispatch storage event for cross-component sync
  window.dispatchEvent(new Event('storage'));
}

// Decode JWT token (basic decode without verification)
export function decodeToken(token: string): any {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch {
    return null;
  }
}

// Check if token is expired
export function isTokenExpired(token: string): boolean {
  const decoded = decodeToken(token);
  if (!decoded || !decoded.exp) return true;
  
  const currentTime = Date.now() / 1000;
  return decoded.exp < currentTime;
}

// Check if current user is an admin
export function isAdmin(): boolean {
  const userInfo = getUserInfo();
  return userInfo?.role?.toLowerCase() === 'admin';
}

// Check if current user has a specific role
export function hasRole(role: string): boolean {
  const userInfo = getUserInfo();
  return userInfo?.role?.toLowerCase() === role.toLowerCase();
}
