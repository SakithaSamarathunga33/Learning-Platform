import { NextRequest, NextResponse } from 'next/server';

// GET debug information about the message system
export async function GET(request: NextRequest) {
  try {
    // Get the authorization header from the incoming request
    const authHeader = request.headers.get('Authorization');
    
    // Get the API URL from env or use default
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';
    
    // Debug information
    const debugInfo = {
      timestamp: new Date().toISOString(),
      auth: {
        headerPresent: !!authHeader,
        headerValue: authHeader ? `${authHeader.substring(0, 10)}...` : null,
      },
      config: {
        apiUrl,
        nextPublicApiUrl: process.env.NEXT_PUBLIC_API_URL,
      },
      endpoints: {
        conversations: `${apiUrl}/api/messages/conversations`,
        unreadCount: `${apiUrl}/api/messages/unread-count`,
        sendMessage: `${apiUrl}/api/messages/send/{username}`,
        getConversation: `${apiUrl}/api/messages/conversation/{username}`,
      }
    };
    
    // Try to connect to the backend API
    let backendConnectivity = null;
    try {
      const response = await fetch(`${apiUrl}/api/debug`, {
        method: 'GET',
        headers: authHeader ? { 'Authorization': authHeader } : {},
        cache: 'no-store',
        signal: AbortSignal.timeout(5000) // 5-second timeout
      });
      
      backendConnectivity = {
        status: response.status,
        statusText: response.statusText,
        ok: response.ok,
      };
      
      if (response.ok) {
        try {
          backendConnectivity.body = await response.json();
        } catch (e) {
          backendConnectivity.body = 'Could not parse JSON response';
        }
      }
    } catch (error) {
      backendConnectivity = {
        error: 'Failed to connect to backend',
        message: error instanceof Error ? error.message : String(error)
      };
    }
    
    return NextResponse.json({
      ...debugInfo,
      backendConnectivity,
    }, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { 
        error: 'Error in debug endpoint', 
        message: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    );
  }
} 