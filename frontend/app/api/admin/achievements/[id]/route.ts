import { NextRequest, NextResponse } from 'next/server';

// Special PUT method for admin updates that bypasses ownership requirements
export async function PUT(
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
    
    // Get the request body
    let body;
    try {
      body = await request.json();
    } catch (error) {
      return NextResponse.json(
        { error: 'Invalid request body' },
        { status: 400 }
      );
    }
    
    // Get the API URL from env or use default
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';
    
    // Make the request to the backend with admin flags
    const response = await fetch(`${apiUrl}/api/achievements/${id}?admin=true`, {
      method: 'PUT',
      headers: {
        'Authorization': authHeader,
        'Content-Type': 'application/json',
        'X-Admin-Request': 'true',
        'X-Admin-Override': 'true'
      },
      body: JSON.stringify({
        ...body,
        adminOverride: true,
        forceAdminUpdate: true
      }),
      cache: 'no-store'
    });
    
    // Handle error responses
    if (!response.ok) {
      let errorMessage = 'Failed to update post as admin';
      
      try {
        const errorData = await response.json();
        errorMessage = errorData.message || `Admin Error: ${response.status}`;
      } catch (parseError) {
        // If we can't parse the JSON, try to get the text
        try {
          const errorText = await response.text();
          errorMessage = errorText || `Admin Error: ${response.status}`;
        } catch (textError) {
          errorMessage = `Failed to update post as admin (Status: ${response.status})`;
        }
      }
      
      return NextResponse.json(
        { error: errorMessage },
        { status: response.status }
      );
    }
    
    // If response is OK, return success
    return NextResponse.json(
      { message: 'Post updated successfully by administrator' },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to update post as admin' },
      { status: 500 }
    );
  }
}

// Special DELETE method for admin deletes that bypasses ownership requirements
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
    
    // Make the request to the backend with admin flags
    const response = await fetch(`${apiUrl}/api/achievements/${id}?admin=true`, {
      method: 'DELETE',
      headers: {
        'Authorization': authHeader,
        'X-Admin-Request': 'true',
        'X-Admin-Override': 'true'
      },
      cache: 'no-store'
    });
    
    if (!response.ok) {
      let errorMessage = 'Failed to delete post as admin';
      
      try {
        const errorData = await response.json();
        errorMessage = errorData.message || `Admin Error: ${response.status}`;
      } catch (parseError) {
        // If we can't parse the JSON, try to get the text
        try {
          const errorText = await response.text();
          errorMessage = errorText || `Admin Error: ${response.status}`;
        } catch (textError) {
          errorMessage = `Failed to delete post as admin (Status: ${response.status})`;
        }
      }
      
      return NextResponse.json(
        { error: errorMessage },
        { status: response.status }
      );
    }
    
    // Return success response
    return NextResponse.json(
      { message: 'Post deleted successfully by administrator' },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to delete post as admin' },
      { status: 500 }
    );
  }
} 