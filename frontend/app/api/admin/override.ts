import { NextRequest, NextResponse } from 'next/server';

// Simple endpoint to force update an achievement as an admin
export async function POST(request: NextRequest) {
  try {
    const { method, url, achievementId, data } = await request.json();
    
    console.log(`Admin Override: ${method} request for achievement ID: ${achievementId}`);
    
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
    
    // Construct the backend URL with admin parameter
    const backendUrl = `${apiUrl}/api/achievements/${achievementId}?admin=true`;
    
    console.log('Making admin override request to:', backendUrl);
    
    // Set up the request options
    const requestOptions: RequestInit = {
      method: method,
      headers: {
        'Authorization': authHeader,
        'Content-Type': 'application/json',
        'X-Admin-Request': 'true',
        'X-Admin-Override': 'true'
      },
      cache: 'no-store'
    };
    
    // Add body for PUT requests
    if (method === 'PUT' && data) {
      requestOptions.body = JSON.stringify({
        ...data,
        isAdmin: true,
        adminOverride: true,
        forceAdminUpdate: true
      });
    }
    
    // Make the request to the backend
    const response = await fetch(backendUrl, requestOptions);
    
    // Get response data if any
    let responseData;
    const contentType = response.headers.get('content-type');
    
    if (contentType && contentType.includes('application/json')) {
      try {
        responseData = await response.json();
      } catch (e) {
        responseData = null;
      }
    } else {
      try {
        responseData = await response.text();
      } catch (e) {
        responseData = null;
      }
    }
    
    // Return the response
    return NextResponse.json(
      responseData || { message: 'Admin operation completed' },
      { status: response.status }
    );
  } catch (error) {
    console.error('Error in admin override:', error);
    return NextResponse.json(
      { error: 'Failed to perform admin operation' },
      { status: 500 }
    );
  }
} 