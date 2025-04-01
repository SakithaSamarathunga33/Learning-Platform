import { NextRequest, NextResponse } from 'next/server';

// Define a helper function to get params safely
const getParams = async (context: { params: { id: string } }) => {
  return context.params;
};

export async function GET(
  request: NextRequest,
  context: { params: { id: string } }
) {
  try {
    // Safely get params
    const params = await getParams(context);
    const id = params.id;
    
    // Get the API URL from env or use default
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';
    
    // First try to get the achievement without auth
    const response = await fetch(`${apiUrl}/api/achievements/${id}`, {
      headers: {
        'Content-Type': 'application/json'
      },
      method: 'GET',
      cache: 'no-store'
    });

    // Handle 404 case
    if (response.status === 404) {
      return NextResponse.json(
        { error: 'Achievement not found' },
        { status: 404 }
      );
    }

    // Try to parse the response data
    let data;
    try {
      const text = await response.text();
      data = text ? JSON.parse(text) : null;
    } catch (e) {
      return NextResponse.json(
        { error: 'Failed to load achievement data' },
        { status: 500 }
      );
    }

    // If we got data, return it with hasLiked set to false for non-auth users
    if (data) {
      return NextResponse.json({
        ...data,
        hasLiked: false
      }, { status: 200 });
    }

    // If we get here, something went wrong
    return NextResponse.json(
      { error: data?.message || data?.error || 'Failed to fetch achievement' },
      { status: response.status }
    );
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch achievement' },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  context: { params: { id: string } }
) {
  try {
    // Safely get params
    const params = await getParams(context);
    const id = params.id;
    
    console.log(`API Route: Liking achievement with ID: ${id}`);
    
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
    
    // Make the request to the backend
    const response = await fetch(`${apiUrl}/api/achievements/${id}/like`, {
      headers: {
        'Authorization': authHeader
      },
      method: 'POST',
      cache: 'no-store'
    });
    
    // Get the response data
    const data = await response.json();
    
    // Return the response with the same status
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error('Error proxying like request:', error);
    return NextResponse.json(
      { error: 'Failed to like achievement' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  context: { params: { id: string } }
) {
  try {
    // Safely get params
    const params = await getParams(context);
    const id = params.id;
    
    console.log(`API Route: Deleting achievement with ID: ${id}`);
    
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
    
    // Check if this is an admin request
    const isAdminRequest = request.headers.get('X-Admin-Request') === 'true';
    
    // Add admin query parameter for admin requests
    const url = isAdminRequest 
      ? `${apiUrl}/api/achievements/${id}?admin=true` 
      : `${apiUrl}/api/achievements/${id}`;
    
    // Create headers with admin information if needed
    const headers: HeadersInit = {
      'Authorization': authHeader
    };
    
    if (isAdminRequest) {
      headers['X-Admin-Request'] = 'true';
    }
    
    // Make the request to the backend
    const response = await fetch(url, {
      method: 'DELETE',
      headers,
      cache: 'no-store'
    });
    
    if (!response.ok) {
      const errorData = await response.text();
      console.error(`Error from backend: ${errorData}`);
      return NextResponse.json(
        { error: `Failed to delete achievement: ${response.status} ${response.statusText}` },
        { status: response.status }
      );
    }
    
    // Return success response
    return NextResponse.json(
      { message: 'Achievement deleted successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error proxying achievement delete request:', error);
    return NextResponse.json(
      { error: 'Failed to delete achievement' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  context: { params: { id: string } }
) {
  try {
    // Safely get params
    const params = await getParams(context);
    const id = params.id;
    
    console.log(`API Route: Updating achievement with ID: ${id}`);
    
    // Get the authorization header from the incoming request
    const authHeader = request.headers.get('Authorization');
    
    if (!authHeader) {
      return NextResponse.json(
        { error: 'Authorization required' },
        { status: 401 }
      );
    }
    
    // Get the request body
    const body = await request.json();
    
    // Add an isAdmin flag to the request body since this is coming from the admin panel
    const adminBody = {
      ...body,
      isAdmin: true  // This signals to the backend that an admin is making this request
    };
    
    // Get the API URL from env or use default
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';
    
    // Check if this is an admin request
    const isAdminRequest = request.headers.get('X-Admin-Request') === 'true';
    
    // Add admin query parameter for admin requests
    const url = isAdminRequest 
      ? `${apiUrl}/api/achievements/${id}?admin=true` 
      : `${apiUrl}/api/achievements/${id}`;
    
    console.log('Making request to backend URL:', url, 'with admin header:', isAdminRequest);
    
    // Make the request to the backend
    const response = await fetch(url, {
      method: 'PUT',
      headers: {
        'Authorization': authHeader,
        'Content-Type': 'application/json',
        'X-Admin-Request': 'true'  // Add a custom header to indicate this is an admin request
      },
      body: JSON.stringify(adminBody),
      cache: 'no-store'
    });
    
    // Handle error responses specifically
    if (!response.ok) {
      let errorMessage = 'Failed to update post';
      
      try {
        const errorData = await response.json();
        console.error('Backend error response:', errorData);
        
        if (response.status === 403) {
          errorMessage = errorData.message || 'You do not have permission to update this post';
        } else {
          errorMessage = errorData.message || `Error: ${response.status}`;
        }
        
        return NextResponse.json(
          { error: errorMessage },
          { status: response.status }
        );
      } catch (parseError) {
        // If we can't parse the JSON, try to get the text
        try {
          const errorText = await response.text();
          errorMessage = errorText || `Error: ${response.status}`;
        } catch (textError) {
          // If we can't get the text either, just use the status
          errorMessage = `Failed to update post (Status: ${response.status})`;
        }
        
        return NextResponse.json(
          { error: errorMessage },
          { status: response.status }
        );
      }
    }
    
    // If response is OK, get the data and return it
    try {
      const data = await response.json();
      return NextResponse.json(data, { status: response.status });
    } catch (e) {
      // If there's no JSON in the response but it was successful, return a generic success message
      return NextResponse.json(
        { message: 'Post updated successfully' },
        { status: 200 }
      );
    }
  } catch (error) {
    console.error('Error proxying post update request:', error);
    return NextResponse.json(
      { error: 'Failed to update post' },
      { status: 500 }
    );
  }
} 