import { NextRequest, NextResponse } from 'next/server';

// GET unread message count for the current user
export async function GET(request: NextRequest) {
  try {
    // Get the authorization header from the incoming request
    const authHeader = request.headers.get('Authorization');
    
    if (!authHeader) {
      return NextResponse.json(
        { error: 'Authorization required' },
        { status: 401 }
      );
    }
    
    // Get the API URL from env or use default
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';
    
    // Forward to the backend API (passing through the Authorization header)
    const response = await fetch(`${apiUrl}/api/messages/unread-count`, {
      headers: {
        'Authorization': authHeader
      },
      cache: 'no-store'
    });
    
    if (!response.ok) {
      console.error(`Error fetching unread count: ${response.status} ${response.statusText}`);
      return NextResponse.json(
        { error: `Failed to fetch unread count: ${response.statusText}` },
        { status: response.status }
      );
    }
    
    // Return response from backend
    const data = await response.json();
    
    return NextResponse.json(data, { status: 200 });
  } catch (error) {
    console.error('Error fetching unread message count:', error);
    return NextResponse.json(
      { error: 'Failed to fetch unread message count' },
      { status: 500 }
    );
  }
} 