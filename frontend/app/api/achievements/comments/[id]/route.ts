import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/utils/auth';

/**
 * DELETE handler to remove a comment (only for the comment owner)
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id: commentId } = params;

    // Get auth token from cookies or authorization header
    let authToken = request.cookies.get('token')?.value;
    
    if (!authToken) {
      const authHeader = request.headers.get('Authorization');
      if (authHeader && authHeader.startsWith('Bearer ')) {
        authToken = authHeader.replace('Bearer ', '');
      }
    }

    if (!authToken) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Verify the token is valid
    const decodedPayload = await verifyToken(authToken);
    if (!decodedPayload) {
      return NextResponse.json(
        { error: 'Invalid authentication token' },
        { status: 401 }
      );
    }

    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';
    
    // Delete the comment
    const response = await fetch(`${apiUrl}/api/achievements/comments/${commentId}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`,
      },
    });
    
    if (!response.ok) {
      let errorMessage = 'Failed to delete comment';
      
      try {
        const errorData = await response.json();
        errorMessage = errorData.message || errorMessage;
      } catch (e) {
        // If we can't parse the response, use the default error message
      }
      
      return NextResponse.json(
        { error: errorMessage },
        { status: response.status }
      );
    }

    return NextResponse.json(
      { message: 'Comment deleted successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error deleting comment:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
