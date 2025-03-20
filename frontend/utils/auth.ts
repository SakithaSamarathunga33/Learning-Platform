import { API_URL } from '@/app/config/api';

interface TokenResponse {
  accessToken: string;
  refreshToken: string;
}

interface User {
  id: string;
  username: string;
  roles: string[];
}

export const refreshToken = async (): Promise<boolean> => {
  try {
    const refreshToken = localStorage.getItem('refreshToken');
    if (!refreshToken) {
      return false;
    }

    const response = await fetch(`${API_URL}/api/auth/refresh`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ refreshToken }),
    });

    if (!response.ok) {
      throw new Error('Failed to refresh token');
    }

    const data: TokenResponse = await response.json();
    localStorage.setItem('token', data.accessToken);
    localStorage.setItem('refreshToken', data.refreshToken);
    return true;
  } catch (error) {
    console.error('Error refreshing token:', error);
    return false;
  }
};

export const isTokenExpired = (token: string): boolean => {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    const expiryTime = payload.exp * 1000; // Convert to milliseconds
    return Date.now() >= expiryTime;
  } catch (error) {
    return true;
  }
};

export const getAuthenticatedFetch = () => {
  return async (url: string, options: RequestInit = {}) => {
    let token = localStorage.getItem('token');

    // Check if token is expired
    if (token && isTokenExpired(token)) {
      const refreshSuccessful = await refreshToken();
      if (!refreshSuccessful) {
        // Redirect to login if refresh fails
        window.location.href = '/login';
        return;
      }
      token = localStorage.getItem('token');
    }

    // Add token to headers
    const headers = {
      ...options.headers,
      'Authorization': `Bearer ${token}`,
    };

    const response = await fetch(url, {
      ...options,
      headers,
    });

    // If unauthorized, try to refresh token
    if (response.status === 401) {
      const refreshSuccessful = await refreshToken();
      if (refreshSuccessful) {
        token = localStorage.getItem('token');
        // Retry the request with new token
        return fetch(url, {
          ...options,
          headers: {
            ...options.headers,
            'Authorization': `Bearer ${token}`,
          },
        });
      } else {
        // Redirect to login if refresh fails
        window.location.href = '/login';
        return;
      }
    }

    return response;
  };
};

export const logout = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('refreshToken');
  localStorage.removeItem('user');
  window.location.href = '/login';
}; 