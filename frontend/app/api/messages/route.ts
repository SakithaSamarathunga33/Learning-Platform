import { NextRequest, NextResponse } from 'next/server';

// GET all conversations for the current user
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
    
    // Forward to the backend API - pass the token correctly
    const response = await fetch(`${apiUrl}/api/messages/conversations`, {
      headers: {
        'Authorization': authHeader
      },
      cache: 'no-store'
    });
    
    if (!response.ok) {
      console.error(`Failed to fetch conversations: Status ${response.status}`);
      let errorMessage = `Failed to fetch conversations: ${response.statusText}`;
      try {
        const errorData = await response.json();
        console.error('Error response:', errorData);
        errorMessage = errorData.message || errorMessage;
      } catch (e) {
        // If we can't parse the error as JSON, use the status text
      }
      
      return NextResponse.json(
        { error: errorMessage },
        { status: response.status }
      );
    }
    
    // Return response from backend
    const data = await response.json();
    
    return NextResponse.json(data, { status: 200 });
  } catch (error) {
    console.error('Error fetching conversations:', error);
    return NextResponse.json(
      { error: 'Failed to fetch conversations' },
      { status: 500 }
    );
  }
}

// POST is not used directly here as messages are sent to specific recipients
// using the /api/messages/send/[username] endpoint 