import { NextRequest, NextResponse } from 'next/server';

// GET conversation with a specific user
export async function GET(
  request: NextRequest,
  { params }: { params: { username: string } }
) {
  try {
    const username = params.username;
    
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
    
    // Forward to the backend API - preserve the Bearer prefix
    const response = await fetch(`${apiUrl}/api/messages/conversation/${username}`, {
      headers: {
        'Authorization': authHeader
      },
      cache: 'no-store'
    });
    
    if (!response.ok) {
      console.error(`Error fetching conversation: ${response.status} ${response.statusText}`);
      return NextResponse.json(
        { error: `Failed to fetch conversation: ${response.statusText}` },
        { status: response.status }
      );
    }
    
    // Return response from backend
    const data = await response.json();
    
    return NextResponse.json(data, { status: 200 });
  } catch (error) {
    console.error('Error fetching conversation:', error);
    return NextResponse.json(
      { error: 'Failed to fetch conversation' },
      { status: 500 }
    );
  }
} 