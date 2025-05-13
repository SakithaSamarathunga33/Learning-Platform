import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';

export async function GET(request: NextRequest) {
  try {
    // Get the authorization header from the incoming request
    const authHeader = request.headers.get('Authorization');
    
    // Get the API URL from env or use default
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';
    
    // 1. Test direct connection to backend
    let directBackendTest;
    try {
      const response = await fetch(`${apiUrl}/api/messages/conversations`, {
        headers: authHeader ? { 'Authorization': authHeader } : {},
        cache: 'no-store'
      });
      
      const status = response.status;
      const statusText = response.statusText;
      let data = null;
      
      try {
        if (response.ok) {
          data = await response.json();
        }
      } catch (e) {
        // Ignore JSON parsing errors
      }
      
      directBackendTest = {
        success: response.ok,
        status,
        statusText,
        data: data ? (Array.isArray(data) ? `Array with ${data.length} items` : typeof data) : null,
        error: !response.ok ? `HTTP ${status} ${statusText}` : null
      };
    } catch (error) {
      directBackendTest = {
        success: false,
        error: error instanceof Error ? error.message : String(error)
      };
    }
    
    // 2. Test axios connection (like the useEffect in the messages page)
    let axiosTest;
    try {
      // Recreate axios instance with same config as in utils/api.ts
      const axiosInstance = axios.create({
        baseURL: apiUrl
      });
      
      // Add auth header if present
      if (authHeader) {
        axiosInstance.defaults.headers.common['Authorization'] = authHeader;
      }
      
      const response = await axiosInstance.get('/api/messages/conversations');
      
      axiosTest = {
        success: true,
        status: response.status,
        data: Array.isArray(response.data) ? `Array with ${response.data.length} items` : typeof response.data
      };
    } catch (error) {
      if (axios.isAxiosError(error)) {
        axiosTest = {
          success: false,
          status: error.response?.status,
          statusText: error.response?.statusText,
          error: error.message,
          details: error.response?.data
        };
      } else {
        axiosTest = {
          success: false,
          error: error instanceof Error ? error.message : String(error)
        };
      }
    }
    
    // 3. Check stored messages in localStorage
    let localStorageCheck = {};
    
    if (typeof window !== 'undefined') {
      const localStorageKeys = Object.keys(localStorage)
        .filter(key => key.startsWith('messages_') || key.includes('conversation'));
      
      localStorageCheck = {
        messageRelatedKeys: localStorageKeys.length,
        keys: localStorageKeys
      };
    } else {
      localStorageCheck = {
        error: "localStorage not available on server side"
      };
    }
    
    return NextResponse.json({
      timestamp: new Date().toISOString(),
      auth: {
        headerPresent: !!authHeader,
        headerValue: authHeader ? `${authHeader.substring(0, 10)}...` : null,
      },
      endpoints: {
        testUrls: [
          `${apiUrl}/api/messages/conversations`,
          `${apiUrl}/api/messages/unread-count`
        ]
      },
      tests: {
        directBackendTest,
        axiosTest,
        localStorageCheck
      }
    }, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { 
        error: 'Error in debug endpoint', 
        message: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    );
  }
} 