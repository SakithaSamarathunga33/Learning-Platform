import { API_URL } from '@/app/config/api';
import { NextRequest } from 'next/server';

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

/**
 * Check if the current user is an admin by directly examining their stored user data
 * This is more reliable than JWT payload inspection for this application
 */
export function isUserAdmin(): boolean {
  try {
    // First try to get stored user info which should contain roles
    const userJson = localStorage.getItem('user');
    if (userJson) {
      const user = JSON.parse(userJson);
      
      // Check for admin roles in user object
      if (user.roles && Array.isArray(user.roles)) {
        const isAdmin = user.roles.some((role: string) => 
          role === 'ROLE_ADMIN' || role === 'ADMIN' || role.includes('ADMIN')
        );
        return isAdmin;
      }
      
      // Alternative locations in the user object
      if (user.authorities && Array.isArray(user.authorities)) {
        const isAdmin = user.authorities.some((auth: any) => {
          if (typeof auth === 'string') {
            return auth === 'ROLE_ADMIN' || auth === 'ADMIN' || auth.includes('ADMIN');
          } else if (auth && auth.authority) {
            return auth.authority === 'ROLE_ADMIN' || auth.authority === 'ADMIN' || auth.authority.includes('ADMIN');
          }
          return false;
        });
        return isAdmin;
      }
    }
    
    // If user info doesn't have roles, try to decode it from the token
    const token = localStorage.getItem('token');
    if (token) {
      const parts = token.split('.');
      if (parts.length === 3) {
        const payload = JSON.parse(atob(parts[1]));
        
        // Add username to admin whitelist for development or testing
        if (payload.sub && (
          payload.sub === 'admin' || 
          payload.sub === 'administrator' || 
          payload.sub.includes('admin'))
        ) {
          return true;
        }
      }
    }
    
    return false;
  } catch (error) {
    console.error('Error checking admin status:', error);
    return false;
  }
}

/**
 * Check if the user from the request is an admin
 */
export async function checkIsAdmin(request: NextRequest): Promise<boolean> {
  try {
    // Get token from either cookie or Authorization header
    let token = request.cookies.get('token')?.value;
    
    if (!token) {
      // Try from Authorization header
      const authHeader = request.headers.get('Authorization');
      if (authHeader && authHeader.startsWith('Bearer ')) {
        token = authHeader.substring(7);
      }
    }
    
    if (!token) {
      return false;
    }
    
    // Parse JWT
    const parts = token.split('.');
    if (parts.length !== 3) {
      return false;
    }
    
    // Decode payload
    const payload = JSON.parse(atob(parts[1]));
    
    // Extract roles - handle different role formats
    let roles: string[] = [];
    
    // Common roles array formats
    if (Array.isArray(payload.roles)) {
      roles = payload.roles;
    } else if (Array.isArray(payload.authorities)) {
      roles = payload.authorities;
    } else if (Array.isArray(payload.scopes)) {
      roles = payload.scopes;
    } else if (typeof payload.role === 'string') {
      roles = [payload.role];
    }
    
    // Handle Spring Security authorities format (objects with 'authority' field)
    if (Array.isArray(payload.authorities) && payload.authorities.length > 0) {
      if (typeof payload.authorities[0] === 'object' && payload.authorities[0]?.authority) {
        roles = payload.authorities.map(auth => auth.authority);
      }
    }
    
    // Add username check as a fallback method (for development/testing)
    // If the JWT doesn't contain roles but the username is 'admin', allow access
    const username = payload.sub;
    if (username && (username === 'admin' || username === 'administrator' || username.includes('admin'))) {
      return true;
    }
    
    // Check for admin role in various formats
    const isAdmin = roles.some(role => 
      role === 'ROLE_ADMIN' || 
      role === 'ADMIN' || 
      role === 'admin' ||
      role.includes('ADMIN')
    );
    
    return isAdmin;
  } catch (error) {
    console.error('Error in admin check:', error);
    return false;
  }
} 