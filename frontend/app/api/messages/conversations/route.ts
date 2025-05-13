import { NextRequest, NextResponse } from 'next/server';

// GET all user conversations
export async function GET(request: NextRequest) {
  try {
    console.log("API: Received request for conversations");
    
    // Get the authorization header from the incoming request or cookies
    let authHeader = request.headers.get('Authorization');
    const cookies = request.cookies;
    
    // If auth header is missing, try to get token from cookies or add it manually
    if (!authHeader) {
      console.log("API: No Authorization header in request, checking alternatives");
      
      // Try to get token from cookies if it exists
      const tokenCookie = cookies.get('token');
      if (tokenCookie) {
        console.log("API: Found token in cookies");
        authHeader = `Bearer ${tokenCookie.value}`;
      } else {
        console.log("API: No token in cookies, trying localStorage fallback");
        // In server components we can't access localStorage directly
        // This is just a fallback for debugging - in production use a proper auth solution
        
        // We could also create a static token for debugging purposes
        // authHeader = 'Bearer debugTokenForTesting';
      }
    }
    
    if (!authHeader) {
      console.log("API: Missing authorization header after all attempts");
      return NextResponse.json(
        { error: 'Authorization required' },
        { status: 401 }
      );
    }
    
    // Get the API URL from env or use default
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';
    const fullUrl = `${apiUrl}/api/messages/conversations`;
    console.log(`API: Forwarding request to ${fullUrl} with auth header present`);
    
    // Add some debugging to log the first part of the token
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      console.log(`API: Token starts with: ${token.substring(0, 10)}...`);
    }
    
    // Forward to the backend API - preserve the Bearer prefix
    const response = await fetch(fullUrl, {
      headers: {
        'Authorization': authHeader
      },
      cache: 'no-store'
    });
    
    if (!response.ok) {
      console.error(`API: Error fetching conversations: ${response.status} ${response.statusText}`);
      return NextResponse.json(
        { error: `Failed to fetch conversations: ${response.statusText}` },
        { status: response.status }
      );
    }
    
    // Return response from backend
    const data = await response.json();
    console.log(`API: Successfully fetched conversations. Count: ${Array.isArray(data) ? data.length : 'not an array'}`);
    
    return NextResponse.json(data, { status: 200 });
  } catch (error) {
    console.error('API: Error fetching conversations:', error);
    return NextResponse.json(
      { error: 'Failed to fetch conversations' },
      { status: 500 }
    );
  }
} 