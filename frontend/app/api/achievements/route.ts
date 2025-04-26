import { NextRequest, NextResponse } from 'next/server';

// GET all achievements
export async function GET(request: NextRequest) {
  try {
    // Get the authorization header from the incoming request
    const authHeader = request.headers.get('Authorization');
    
    // Get admin header if present
    const adminHeader = request.headers.get('X-Admin-Access');
    
    // Get the URL's search params
    const { searchParams } = new URL(request.url);
    const admin = searchParams.get('admin');
    
    // Set up headers
    const headers: HeadersInit = {};
    if (authHeader) {
      headers['Authorization'] = authHeader;
    }
    
    // Forward X-Admin-Access header if present
    if (adminHeader) {
      headers['X-Admin-Access'] = adminHeader;
    }
    
    // Get the API URL from env or use default
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';
    
    // Build the URL with query parameters
    let url = `${apiUrl}/api/achievements`;
    if (admin) {
      url += `?admin=${admin}`;
    }
    
    // Forward to the backend API
    const response = await fetch(url, {
      headers,
      cache: 'no-store'
    });
    
    // Return response from backend
    const data = await response.json();
    
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch achievements' },
      { status: 500 }
    );
  }
}

// POST a new achievement
export async function POST(request: NextRequest) {
  try {
    // Get the authorization header from the incoming request
    const authHeader = request.headers.get('Authorization');
    
    if (!authHeader) {
      return NextResponse.json(
        { error: 'Authorization required' },
        { status: 401 }
      );
    }
    
    // Parse the request body
    let body;
    try {
      body = await request.json();
    } catch (error) {
      return NextResponse.json(
        { error: 'Invalid request body' },
        { status: 400 }
      );
    }
    
    // Validate required fields
    if (!body.title || !body.description || !body.imageUrl) {
      return NextResponse.json(
        { error: 'Title, description, and image are required' },
        { status: 400 }
      );
    }
    
    // Get the API URL from env or use default
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';
    
    // Forward to the backend API
    const response = await fetch(`${apiUrl}/api/achievements`, {
      method: 'POST',
      headers: {
        'Authorization': authHeader,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(body),
      cache: 'no-store'
    });
    
    if (!response.ok) {
      let errorMessage;
      try {
        const errorData = await response.json();
        errorMessage = errorData.message || `Error: ${response.status}`;
      } catch (e) {
        try {
          const errorText = await response.text();
          errorMessage = errorText || `Error: ${response.status}`;
        } catch (e2) {
          errorMessage = `Failed to create achievement (Status: ${response.status})`;
        }
      }
      
      return NextResponse.json(
        { error: errorMessage },
        { status: response.status }
      );
    }
    
    // Return success response
    const data = await response.json();
    
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to create achievement' },
      { status: 500 }
    );
  }
} 