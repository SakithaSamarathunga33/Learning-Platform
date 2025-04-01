'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Card, 
  CardContent, 
  CardFooter, 
  CardHeader, 
  CardTitle, 
  CardDescription 
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ChevronLeft, Heart, User, Calendar, LinkIcon, Share } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { toast } from "@/components/ui/use-toast";
import { ToastAction } from "@/components/ui/toast";
import { useRouter } from 'next/navigation';

interface User {
  id: string;
  username: string;
  firstName: string;
  lastName: string;
  profilePicture?: string;
}

interface Achievement {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  imagePublicId: string;
  createdAt: string;
  likes: number;
  user: User;
  hasLiked?: boolean;
}

export default function AchievementDetailPage({ params }: { params: { id: string } }) {
  const [achievement, setAchievement] = useState<Achievement | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLikingInProgress, setIsLikingInProgress] = useState(false);
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';
  const router = useRouter();
  
  // Debug: Log params
  console.log('Achievement detail params:', params);
  console.log('Achievement ID type:', typeof params.id);
  console.log('Achievement ID value:', params.id);

  useEffect(() => {
    const token = localStorage.getItem('token');
    setIsAuthenticated(!!token);
    
    // Validate ID format before fetching
    if (!params.id || params.id === 'undefined' || params.id === 'null') {
      setError('Invalid achievement ID');
      setIsLoading(false);
      return;
    }
    
    const fetchAchievement = async () => {
      try {
        setIsLoading(true);
        setError('');
        
        // Use the Next.js API route instead of directly calling the backend
        console.log(`Fetching achievement with ID: ${params.id} via proxy API`);
        const response = await fetch(`/api/achievements/${params.id}`, {
          headers: {
            'Content-Type': 'application/json'
          },
          cache: 'no-store'
        });

        console.log(`Response status: ${response.status}`);
        
        let data;
        try {
          const text = await response.text();
          console.log('Response text:', text);
          data = text ? JSON.parse(text) : null;
          console.log('Parsed data:', data);
        } catch (e) {
          console.error('Error parsing response:', e);
          throw new Error('Failed to load achievement data');
        }

        if (!response.ok) {
          console.error('Error response:', data);
          throw new Error(data?.error || data?.message || 'Failed to fetch achievement');
        }

        if (!data) {
          throw new Error('No achievement data available');
        }

        // For non-authenticated users, ensure hasLiked is false
        if (!token) {
          data.hasLiked = false;
        }

        console.log('Achievement data received:', data);
        setAchievement(data);
      } catch (err) {
        console.error('Error fetching achievement:', err);
        setError(err instanceof Error ? err.message : 'Error loading achievement. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchAchievement();
  }, [params.id]);

  const handleLike = async () => {
    if (!isAuthenticated) {
      toast({
        title: "Authentication required",
        description: "Please log in to like achievements",
        action: (
          <ToastAction altText="Login" asChild>
            <Link href={`/login?redirect=${encodeURIComponent(window.location.pathname)}`}>
              Login
            </Link>
          </ToastAction>
        ),
      });
      return;
    }

    if (!achievement) return;

    try {
      // Don't allow multiple like requests
      if (isLikingInProgress) return;
      
      // Mark as being liked
      setIsLikingInProgress(true);
      
      const token = localStorage.getItem('token');
      
      // If already liked, unlike it
      const method = achievement.hasLiked ? 'DELETE' : 'POST';
      
      // Use the Next.js API route instead of directly calling the backend
      console.log(`${method} request for achievement with ID: ${achievement.id} via proxy API`);
      const response = await fetch(`/api/achievements/${achievement.id}/like`, {
        method,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        cache: 'no-store'
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        console.error('Like operation error:', errorData);
        throw new Error(
          errorData?.error || 
          errorData?.message || 
          (achievement.hasLiked ? 'Failed to unlike achievement' : 'Failed to like achievement')
        );
      }

      const data = await response.json();
      console.log('Like operation response:', data);
      
      // Update achievement data
      setAchievement(prev => 
        prev ? {
          ...prev,
          likes: data.likes,
          hasLiked: data.hasLiked
        } : null
      );

      toast({
        title: achievement.hasLiked ? "Unliked!" : "Liked!",
        description: achievement.hasLiked ? "You unliked this achievement" : "You liked this achievement",
        variant: "default",
      });
    } catch (error) {
      console.error('Error with like operation:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to process like operation. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLikingInProgress(false);
    }
  };

  const shareAchievement = () => {
    if (navigator.share) {
      navigator.share({
        title: achievement?.title || 'Check out this achievement',
        text: achievement?.description || 'A learning achievement',
        url: window.location.href,
      })
      .then(() => {
        toast({
          title: "Shared!",
          description: "Achievement shared successfully",
        });
      })
      .catch((error) => {
        console.error('Error sharing:', error);
      });
    } else {
      // Fallback for browsers that don't support navigator.share
      navigator.clipboard.writeText(window.location.href)
        .then(() => {
          toast({
            title: "Link copied!",
            description: "Achievement link copied to clipboard",
          });
        })
        .catch((error) => {
          console.error('Error copying link:', error);
          toast({
            title: "Error",
            description: "Failed to copy link. Try again later.",
            variant: "destructive",
          });
        });
    }
  };

  return (
    <div className="min-h-screen pb-16 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none -z-5">
        <div className="absolute top-1/4 -left-10 w-72 h-72 bg-primary/10 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob"></div>
        <div className="absolute top-3/4 -right-10 w-96 h-96 bg-secondary/10 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000"></div>
        <div className="absolute bottom-1/4 left-1/3 w-72 h-72 bg-accent/10 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-4000"></div>
      </div>

      {/* Back button at the top */}
      <div className="container mx-auto px-4 pt-8">
        <Link href="/feed">
          <Button variant="ghost" className="mb-6 pl-0 hover:bg-transparent">
            <ChevronLeft className="mr-2 h-4 w-4" />
            Back to Feed
          </Button>
        </Link>
      </div>

      <div className="container mx-auto px-4">
        {isLoading ? (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
          </div>
        ) : error ? (
          <Card className="bg-destructive/10 border-destructive/20 mx-auto max-w-3xl">
            <CardHeader>
              <CardTitle className="text-destructive flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-destructive">
                  <circle cx="12" cy="12" r="10"></circle>
                  <line x1="12" y1="8" x2="12" y2="12"></line>
                  <line x1="12" y1="16" x2="12.01" y2="16"></line>
                </svg>
                Error Loading Achievement
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col items-center text-center gap-3">
                <p className="text-destructive/80 mb-4">{error}</p>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 w-full max-w-md">
                  <Button 
                    variant="outline" 
                    onClick={() => {
                      setError('');
                      setIsLoading(true);
                      window.location.reload();
                    }}
                  >
                    Try Again
                  </Button>
                  
                  <Link href="/feed" className="w-full">
                    <Button variant="default" className="w-full">
                      Return to Feed
                    </Button>
                  </Link>
                </div>
                
                {error.toLowerCase().includes('logged in') && (
                  <Link href={`/login?redirect=${encodeURIComponent(window.location.pathname)}`} className="w-full max-w-md mt-2">
                    <Button variant="default" className="w-full">
                      Log In
                    </Button>
                  </Link>
                )}
                
                <div className="mt-6 text-sm text-muted-foreground bg-muted/50 p-4 rounded-lg">
                  <p className="font-medium mb-2">If the problem persists, please try:</p>
                  <ul className="list-disc list-inside space-y-1 text-left">
                    <li>Checking your internet connection</li>
                    <li>Logging out and logging back in</li>
                    <li>Clearing your browser cache</li>
                    <li>Contacting support if the issue continues</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        ) : achievement ? (
          <div className="max-w-3xl mx-auto">
            <Card className="overflow-hidden border rounded-xl shadow-md">
              {/* Achievement Image */}
              <div className="relative h-[300px] md:h-[400px] w-full">
                {achievement.imagePublicId ? (
                  <img
                    src={achievement.imageUrl || `https://res.cloudinary.com/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload/${achievement.imagePublicId}`}
                    alt={achievement.title}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="bg-muted h-full w-full flex items-center justify-center">
                    <p className="text-muted-foreground">No image available</p>
                  </div>
                )}
              </div>
              
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="px-2 py-1">
                        <Calendar className="mr-1 h-3 w-3" />
                        {new Date(achievement.createdAt).toLocaleDateString()}
                      </Badge>
                    </div>
                    <CardTitle className="text-2xl md:text-3xl mt-2">{achievement.title}</CardTitle>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className={`h-10 w-10 ${achievement.hasLiked ? "text-red-500" : ""}`}
                            onClick={handleLike}
                            disabled={isLikingInProgress}
                          >
                            <Heart className={`h-5 w-5 ${achievement.hasLiked ? "fill-red-500" : ""} ${isLikingInProgress ? "animate-ping" : ""}`} />
                            <span className="sr-only">Like</span>
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          {isAuthenticated 
                            ? (achievement.hasLiked 
                                ? "You liked this achievement" 
                                : "Like this achievement")
                            : "Login to like this achievement"
                          }
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                    
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button 
                            variant="ghost" 
                            size="icon"
                            onClick={shareAchievement}
                          >
                            <Share className="h-5 w-5" />
                            <span className="sr-only">Share</span>
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          Share this achievement
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 mt-2">
                    <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center overflow-hidden">
                      {achievement.user?.profilePicture ? (
                        <img 
                          src={achievement.user.profilePicture} 
                          alt={achievement.user.firstName || achievement.user.username} 
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <User className="h-5 w-5 text-muted-foreground" />
                      )}
                    </div>
                    <div>
                      <p className="text-sm font-medium">
                        {achievement.user?.firstName && achievement.user?.lastName 
                          ? `${achievement.user.firstName} ${achievement.user.lastName}` 
                          : achievement.user?.username || 'Anonymous User'}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {achievement.user?.username ? `@${achievement.user.username}` : ''}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-1">
                    <Heart className={`h-5 w-5 ${achievement.hasLiked ? "fill-red-500 text-red-500" : "text-muted-foreground"}`} />
                    <span className="text-sm font-medium">{achievement.likes} {achievement.likes === 1 ? 'like' : 'likes'}</span>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg font-semibold mb-2">Description</h3>
                    <p className="text-muted-foreground whitespace-pre-line">
                      {achievement.description}
                    </p>
                  </div>
                </div>
              </CardContent>
              
              <CardFooter className="flex justify-between border-t pt-6">
                <div>
                  {isAuthenticated && achievement.user?.id === localStorage.getItem('userId') && (
                    <Link href={`/achievements/${achievement.id}/edit`}>
                      <Button variant="outline" className="mr-2">
                        Edit Achievement
                      </Button>
                    </Link>
                  )}
                </div>
                <Link href="/feed">
                  <Button variant="ghost">
                    <ChevronLeft className="mr-2 h-4 w-4" />
                    Back to Feed
                  </Button>
                </Link>
              </CardFooter>
            </Card>
          </div>
        ) : null}
      </div>
    </div>
  );
} 