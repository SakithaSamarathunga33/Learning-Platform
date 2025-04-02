import { NextRequest, NextResponse } from 'next/server';

/**
 * GET handler to fetch comments for a specific achievement
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    
    // Get the API URL from env or use default
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';
    
    // Safely extract the id parameter
    if (!id) {
      return NextResponse.json(
        { error: 'Missing achievement ID' },
        { status: 400 }
      );
    }

    const requestUrl = `${apiUrl}/api/achievements/${id}/comments`;
    
    const response = await fetch(requestUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      cache: 'no-store',
    });

    if (response.status === 204 || response.headers.get('content-length') === '0') {
      return NextResponse.json([]);
    }

    let data;
    let responseText = '';
    try {
      responseText = await response.text();
      
      if (!responseText || responseText.trim() === '') {
        return NextResponse.json([]);
      }
      
      data = JSON.parse(responseText);
    } catch (parseError) {
      return NextResponse.json([], { status: 200 });
    }
    
    if (!response.ok) {
      return NextResponse.json(
        { error: data?.message || 'Failed to fetch comments' },
        { status: response.status }
      );
    }

    // Ensure we always return an array
    const result = Array.isArray(data) ? data : [];
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json([], { status: 200 });
  }
}

/**
 * POST handler to add a new comment to an achievement
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    
    // Get the API URL from env or use default
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';
    
    const authToken = request.cookies.get('token')?.value || 
                      request.headers.get('Authorization')?.replace('Bearer ', '');

    if (!authToken) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const body = await request.json();
    
    const response = await fetch(`${apiUrl}/api/achievements/${id}/comments`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`,
      },
      body: JSON.stringify(body),
    });
    
    // Even if the response is empty, we need to make sure we handled the error properly
    if (!response.ok) {
      let errorData = null;
      try {
        const text = await response.text();
        errorData = text ? JSON.parse(text) : null;
      } catch (e) {
        // Failed to parse error response
      }
      
      return NextResponse.json(
        { error: errorData?.message || `Failed to post comment (status ${response.status})` },
        { status: response.status }
      );
    }

    if (response.status === 204 || response.headers.get('content-length') === '0') {
      // Calculate timestamp adjusted for Sri Lanka time zone (UTC+5:30)
      const now = new Date();
      // Get the UTC time and add 5 hours and 30 minutes for Sri Lanka Standard Time
      const sriLankaTime = new Date(now.getTime() + (5.5 * 60 * 60 * 1000));
      
      return NextResponse.json({ 
        id: Date.now().toString(),
        text: body.text,
        user: { id: 'temp' },
        achievementId: id,
        createdAt: sriLankaTime.toISOString()
      }, { status: 201 });
    }

    let data;
    try {
      const text = await response.text();
      data = text ? JSON.parse(text) : null;
    } catch (parseError) {
      return NextResponse.json(
        { error: 'Failed to process server response' },
        { status: 500 }
      );
    }
    
    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 