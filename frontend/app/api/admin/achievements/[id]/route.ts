import { NextRequest, NextResponse } from 'next/server';

// Special PUT method for admin updates that bypasses ownership requirements
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    console.log('Admin PUT called for achievement ID:', id);
    
    // Get the authorization header from the incoming request
    const authHeader = request.headers.get('Authorization');
    console.log('Auth header present:', !!authHeader);
    
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
      console.log('Request body:', body);
    } catch (error) {
      console.error('Error parsing request body:', error);
      return NextResponse.json(
        { error: 'Invalid request body' },
        { status: 400 }
      );
    }
    
    // Get the API URL from env or use default
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';
    
    // Add isAdmin parameter to ensure it's explicit
    const requestUrl = `${apiUrl}/api/achievements/${id}?admin=true&isAdmin=true`;
    console.log('Sending request to:', requestUrl);
    
    // Make the request to the backend with admin parameter
    const response = await fetch(requestUrl, {
      method: 'PUT',
      headers: {
        'Authorization': authHeader,
        'Content-Type': 'application/json',
        'X-Admin-Access': 'true'
      },
      body: JSON.stringify(body),
    });
    
    console.log('Backend response status:', response.status);
    
    // Handle error responses
    if (!response.ok) {
      let errorData;
      try {
        errorData = await response.json();
        console.error('Backend error response:', errorData);
      } catch (e) {
        console.error('Could not parse error response as JSON');
        try {
          const errorText = await response.text();
          console.error('Error response text:', errorText);
        } catch (textError) {
          console.error('Could not get error response text');
        }
      }
      
      return NextResponse.json(
        { error: `Failed to update post as admin (Status: ${response.status})` },
        { status: response.status }
      );
    }
    
    // If response is OK, return success
    const responseData = await response.json();
    console.log('Success response:', responseData);
    
    return NextResponse.json(
      { message: 'Post updated successfully by administrator', data: responseData },
      { status: 200 }
    );
  } catch (error) {
    console.error("Admin update error:", error);
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
    console.log('Admin DELETE called for achievement ID:', id);
    
    // Get the authorization header from the incoming request
    const authHeader = request.headers.get('Authorization');
    console.log('Auth header present:', !!authHeader);
    
    if (!authHeader) {
      return NextResponse.json(
        { error: 'Authorization required' },
        { status: 401 }
      );
    }
    
    // Get the API URL from env or use default
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';
    
    // Add isAdmin parameter to ensure it's explicit
    const requestUrl = `${apiUrl}/api/achievements/${id}?admin=true&isAdmin=true`;
    console.log('Sending request to:', requestUrl);
    
    // Make the request to the backend with admin parameter
    const response = await fetch(requestUrl, {
      method: 'DELETE',
      headers: {
        'Authorization': authHeader,
        'Content-Type': 'application/json',
        'X-Admin-Access': 'true'
      },
    });
    
    console.log('Backend response status:', response.status);
    
    if (!response.ok) {
      let errorData;
      try {
        errorData = await response.json();
        console.error('Backend error response:', errorData);
      } catch (e) {
        console.error('Could not parse error response as JSON');
        try {
          const errorText = await response.text();
          console.error('Error response text:', errorText);
        } catch (textError) {
          console.error('Could not get error response text');
        }
      }
      
      return NextResponse.json(
        { error: `Failed to delete post as admin (Status: ${response.status})` },
        { status: response.status }
      );
    }
    
    // Return success response
    return NextResponse.json(
      { message: 'Post deleted successfully by administrator' },
      { status: 200 }
    );
  } catch (error) {
    console.error("Admin delete error:", error);
    return NextResponse.json(
      { error: 'Failed to delete post as admin' },
      { status: 500 }
    );
  }
} 