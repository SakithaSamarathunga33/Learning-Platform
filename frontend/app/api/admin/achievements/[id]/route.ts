import { NextRequest, NextResponse } from 'next/server';

// Define a helper function to get params safely
const getParams = async (context: { params: { id: string } }) => {
  return context.params;
};

// Special PUT method for admin updates that bypasses ownership requirements
export async function PUT(
  request: NextRequest,
  context: { params: { id: string } }
) {
  console.log('ADMIN API: Starting PUT request handler');
  try {
    // Safely get params
    const params = await getParams(context);
    const id = params.id;
    
    console.log(`Admin API Route: Force updating achievement with ID: ${id}`);
    
    // Get the authorization header from the incoming request
    const authHeader = request.headers.get('Authorization');
    
    if (!authHeader) {
      console.log('ADMIN API: No authorization header provided');
      return NextResponse.json(
        { error: 'Authorization required' },
        { status: 401 }
      );
    }
    
    console.log('ADMIN API: Authorization header found');
    
    // Get the request body
    let body;
    try {
      body = await request.json();
      console.log('ADMIN API: Request body:', body);
    } catch (error) {
      console.error('ADMIN API: Error parsing request body:', error);
      return NextResponse.json(
        { error: 'Invalid request body' },
        { status: 400 }
      );
    }
    
    // Get the API URL from env or use default
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';
    console.log(`ADMIN API: Using backend URL: ${apiUrl}`);
    
    // Make the request to the backend with admin flags
    console.log(`ADMIN API: Sending PUT request to ${apiUrl}/api/achievements/${id}?admin=true`);
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
    
    console.log(`ADMIN API: Backend responded with status: ${response.status}`);
    
    // Handle error responses
    if (!response.ok) {
      let errorMessage = 'Failed to update post as admin';
      
      try {
        const errorData = await response.json();
        console.error('ADMIN API: Backend error response for admin update:', errorData);
        errorMessage = errorData.message || `Admin Error: ${response.status}`;
      } catch (parseError) {
        console.error('ADMIN API: Could not parse error response as JSON:', parseError);
        try {
          const errorText = await response.text();
          console.error('ADMIN API: Error response text:', errorText);
          errorMessage = errorText || `Admin Error: ${response.status}`;
        } catch (textError) {
          console.error('ADMIN API: Could not get error response text:', textError);
          errorMessage = `Failed to update post as admin (Status: ${response.status})`;
        }
      }
      
      console.log(`ADMIN API: Returning error response: ${errorMessage}`);
      return NextResponse.json(
        { error: errorMessage },
        { status: response.status }
      );
    }
    
    // If response is OK, return success
    console.log('ADMIN API: Successfully updated post');
    return NextResponse.json(
      { message: 'Post updated successfully by administrator' },
      { status: 200 }
    );
  } catch (error) {
    console.error('ADMIN API: Error in admin achievement update request:', error);
    return NextResponse.json(
      { error: 'Failed to update post as admin' },
      { status: 500 }
    );
  }
}

// Special DELETE method for admin deletes that bypasses ownership requirements
export async function DELETE(
  request: NextRequest,
  context: { params: { id: string } }
) {
  console.log('ADMIN API: Starting DELETE request handler');
  try {
    // Safely get params
    const params = await getParams(context);
    const id = params.id;
    
    console.log(`Admin API Route: Force deleting achievement with ID: ${id}`);
    
    // Get the authorization header from the incoming request
    const authHeader = request.headers.get('Authorization');
    
    if (!authHeader) {
      console.log('ADMIN API: No authorization header provided');
      return NextResponse.json(
        { error: 'Authorization required' },
        { status: 401 }
      );
    }
    
    console.log('ADMIN API: Authorization header found');
    
    // Get the API URL from env or use default
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';
    console.log(`ADMIN API: Using backend URL: ${apiUrl}`);
    
    // Make the request to the backend with admin flags
    console.log(`ADMIN API: Sending DELETE request to ${apiUrl}/api/achievements/${id}?admin=true`);
    const response = await fetch(`${apiUrl}/api/achievements/${id}?admin=true`, {
      method: 'DELETE',
      headers: {
        'Authorization': authHeader,
        'X-Admin-Request': 'true',
        'X-Admin-Override': 'true'
      },
      cache: 'no-store'
    });
    
    console.log(`ADMIN API: Backend responded with status: ${response.status}`);
    
    if (!response.ok) {
      let errorMessage = 'Failed to delete post as admin';
      
      try {
        const errorData = await response.json();
        console.error('ADMIN API: Backend error response for admin delete:', errorData);
        errorMessage = errorData.message || `Admin Error: ${response.status}`;
      } catch (parseError) {
        console.error('ADMIN API: Could not parse error response as JSON:', parseError);
        try {
          const errorText = await response.text();
          console.error('ADMIN API: Error response text:', errorText);
          errorMessage = errorText || `Admin Error: ${response.status}`;
        } catch (textError) {
          console.error('ADMIN API: Could not get error response text:', textError);
          errorMessage = `Failed to delete post as admin (Status: ${response.status})`;
        }
      }
      
      console.log(`ADMIN API: Returning error response: ${errorMessage}`);
      return NextResponse.json(
        { error: errorMessage },
        { status: response.status }
      );
    }
    
    // Return success response
    console.log('ADMIN API: Successfully deleted post');
    return NextResponse.json(
      { message: 'Post deleted successfully by administrator' },
      { status: 200 }
    );
  } catch (error) {
    console.error('ADMIN API: Error in admin achievement delete request:', error);
    return NextResponse.json(
      { error: 'Failed to delete post as admin' },
      { status: 500 }
    );
  }
} 