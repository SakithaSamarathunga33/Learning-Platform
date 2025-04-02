import { NextRequest, NextResponse } from 'next/server';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    
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
    
    // Forward to the backend API with the auth header
    const response = await fetch(`${apiUrl}/api/achievements/${id}/like`, {
      method: 'POST',
      headers: {
        'Authorization': authHeader,
        'Content-Type': 'application/json'
      },
      cache: 'no-store'
    });
    
    // Return response from backend
    const data = await response.json();
    
    return NextResponse.json(
      data,
      { status: response.status }
    );
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to like achievement' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    
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
    
    // Forward to the backend API with the auth header
    const response = await fetch(`${apiUrl}/api/achievements/${id}/like`, {
      method: 'DELETE',
      headers: {
        'Authorization': authHeader,
        'Content-Type': 'application/json'
      },
      cache: 'no-store'
    });
    
    // Return response from backend
    const data = await response.json();
    
    return NextResponse.json(
      data,
      { status: response.status }
    );
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to unlike achievement' },
      { status: 500 }
    );
  }
} 