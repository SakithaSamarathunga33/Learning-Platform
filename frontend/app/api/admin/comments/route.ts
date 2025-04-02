import { NextRequest, NextResponse } from 'next/server';
import { checkIsAdmin } from '@/utils/auth';

/**
 * GET handler to fetch all comments (admin only)
 */
export async function GET(request: NextRequest) {
  try {
    // Get auth token from cookies or headers
    let authToken = request.cookies.get('token')?.value;
    
    // Check Authorization header if cookie token not found
    if (!authToken) {
      const authHeader = request.headers.get('Authorization');
      if (authHeader && authHeader.startsWith('Bearer ')) {
        authToken = authHeader.replace('Bearer ', '');
      }
    }

    // Check token presence
    if (!authToken) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Decode token and check for admin access
    try {
      const [header, payload, signature] = authToken.split('.');
      if (!header || !payload || !signature) {
        return NextResponse.json(
          { error: 'Invalid authentication token format' },
          { status: 401 }
        );
      }
      
      const decodedPayload = JSON.parse(atob(payload));
      
      // Username-based admin check for development
      if (decodedPayload.sub && (
        decodedPayload.sub === 'admin' || 
        decodedPayload.sub === 'administrator' || 
        decodedPayload.sub.includes('admin'))
      ) {
        // Skip regular admin check and proceed with API call
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';
        
        const response = await fetch(`${apiUrl}/api/admin/comments`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${authToken}`,
          },
          cache: 'no-store',
        });
        
        // Handle error responses
        if (response.status === 401) {
          return NextResponse.json(
            { error: 'Authentication failed at the backend' },
            { status: 401 }
          );
        }

        if (response.status === 403) {
          return NextResponse.json(
            { error: 'You do not have admin privileges on the backend' },
            { status: 403 }
          );
        }

        // Handle empty response
        if (response.status === 204 || response.headers.get('content-length') === '0') {
          return NextResponse.json([]);
        }

        // Process successful response
        let data;
        try {
          const text = await response.text();
          
          if (!text || text.trim() === '') {
            return NextResponse.json([]);
          }
          
          data = JSON.parse(text);
        } catch (parseError) {
          return NextResponse.json([], { status: 200 });
        }
        
        const result = Array.isArray(data) ? data : [];
        return NextResponse.json(result);
      }
      
      // Check for token expiration
      const currentTime = Math.floor(Date.now() / 1000);
      if (decodedPayload.exp && decodedPayload.exp < currentTime) {
        return NextResponse.json(
          { error: 'Authentication token expired' },
          { status: 401 }
        );
      }
    } catch (err) {
      console.error("Error processing token:", err);
    }

    // Regular admin check
    const isAdmin = await checkIsAdmin(request);
    
    if (!isAdmin) {
      return NextResponse.json(
        { error: 'Unauthorized. Admin access required.' },
        { status: 403 }
      );
    }

    // Make API call to the backend
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';
    
    const response = await fetch(`${apiUrl}/api/admin/comments`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`,
      },
      cache: 'no-store',
    });
    
    // Handle responses
    if (response.status === 401) {
      return NextResponse.json(
        { error: 'Authentication failed at the backend' },
        { status: 401 }
      );
    }

    if (response.status === 403) {
      return NextResponse.json(
        { error: 'You do not have admin privileges on the backend' },
        { status: 403 }
      );
    }

    // Handle empty response
    if (response.status === 204 || response.headers.get('content-length') === '0') {
      return NextResponse.json([]);
    }

    // Process successful response
    let data;
    try {
      const text = await response.text();
      
      if (!text || text.trim() === '') {
        return NextResponse.json([]);
      }
      
      data = JSON.parse(text);
    } catch (parseError) {
      return NextResponse.json([], { status: 200 });
    }
    
    const result = Array.isArray(data) ? data : [];
    return NextResponse.json(result);
  } catch (error) {
    console.error('Error handling admin comments request:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}