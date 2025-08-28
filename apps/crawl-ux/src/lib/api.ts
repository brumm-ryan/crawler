import type { DatasheetCreate, DatasheetRead } from './types';

const API_BASE_URL = import.meta.env.VITE_CRAWLER_API || 'http://localhost:3000';

class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
    this.name = 'ApiError';
  }
}

export interface User {
  id: number;
  email: string;
  firstName?: string;
  lastName?: string;
}

export interface AuthStatus {
  authenticated: boolean;
  user?: User;
}

async function fetchApi<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;
  
  const config: RequestInit = {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    credentials: 'include', // Include cookies for authentication
    ...options,
  };

  try {
    const response = await fetch(url, config);
    
    if (!response.ok) {
      // Try to get detailed error message from response body
      let errorMessage = `HTTP ${response.status}`;
      let errorDetail = '';
      
      try {
        const errorBody = await response.text();
        if (errorBody) {
          try {
            const errorJson = JSON.parse(errorBody);
            errorMessage = errorJson.message || errorJson.error || errorMessage;
            errorDetail = errorJson.details || errorJson.stack || '';
          } catch {
            // If not JSON, use the raw text
            errorMessage = errorBody.substring(0, 200); // Limit length
          }
        }
      } catch {
        // If we can't read the response body, use default message
        errorMessage = `HTTP error! status: ${response.status}`;
      }

      console.error(`API Error ${response.status} for ${endpoint}:`, {
        status: response.status,
        message: errorMessage,
        detail: errorDetail,
        url,
        requestOptions: options
      });

      throw new ApiError(response.status, errorMessage);
    }
    
    return await response.json();
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    
    console.error(`Network Error for ${endpoint}:`, {
      error,
      url,
      requestOptions: options
    });
    
    throw new ApiError(500, `Network error: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

export const authApi = {
  // Get login URL (redirects to WorkOS)
  getLoginUrl(redirectUri?: string): string {
    const params = new URLSearchParams();
    if (redirectUri) {
      params.set('redirect', redirectUri);
    }
    return `${API_BASE_URL}/auth/login${params.toString() ? `?${params.toString()}` : ''}`;
  },

  // Get current user info
  async getCurrentUser(): Promise<User> {
    return fetchApi<User>('/auth/me');
  },

  // Check authentication status
  async getAuthStatus(): Promise<AuthStatus> {
    try {
      const user = await this.getCurrentUser();
      return { authenticated: true, user };
    } catch (error) {
      if (error instanceof ApiError && error.status === 401) {
        return { authenticated: false };
      }
      throw error;
    }
  },

  // Logout user
  async logout(): Promise<{ message: string }> {
    return fetchApi<{ message: string }>('/auth/logout', {
      method: 'POST',
    });
  },
};

export const datasheetApi = {
  // Get all datasheets
  async getAll(): Promise<DatasheetRead[]> {
    return fetchApi<DatasheetRead[]>('/datasheets');
  },

  // Get a specific datasheet by ID
  async getById(id: number): Promise<DatasheetRead> {
    return fetchApi<DatasheetRead>(`/datasheets/${id}`);
  },

  // Create a new datasheet
  async create(datasheet: DatasheetCreate): Promise<DatasheetRead> {
    return fetchApi<DatasheetRead>('/datasheets', {
      method: 'POST',
      body: JSON.stringify(datasheet),
    });
  },

  // Update an existing datasheet
  async update(id: number, datasheet: Partial<DatasheetCreate>): Promise<DatasheetRead> {
    return fetchApi<DatasheetRead>(`/datasheets/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(datasheet),
    });
  },

  // Delete a datasheet
  async delete(id: number): Promise<{ message: string }> {
    return fetchApi<{ message: string }>(`/datasheets/${id}`, {
      method: 'DELETE',
    });
  },
};

export { ApiError };