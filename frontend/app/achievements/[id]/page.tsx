'use client';

import React, { useState, useEffect, FormEvent } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronLeft, Heart, User, Calendar, Share, MessageCircle, Send, Loader2, Trash2 } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { toast } from "@/components/ui/use-toast";
import { ToastAction } from "@/components/ui/toast";
import { useRouter } from 'next/navigation';
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

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

interface Comment {
  id: string;
  text: string;
  user: User;
  achievementId: string;
  createdAt: string;
}

export default function AchievementDetailPage({ params }: { params: { id: string } }) {
  const achievementId = params.id;

  const [achievement, setAchievement] = useState<Achievement | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [isPostingComment, setIsPostingComment] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingComments, setIsLoadingComments] = useState(true);
  const [error, setError] = useState('');
  const [commentsError, setCommentsError] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLikingInProgress, setIsLikingInProgress] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [isDeletingComment, setIsDeletingComment] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem('token');
    setIsAuthenticated(!!token);

    // Get current user info if authenticated
    if (token) {
      try {
        const userString = localStorage.getItem('user');
        if (userString) {
          const userData = JSON.parse(userString);
          setCurrentUserId(userData.id || null);
        }
      } catch (err) {
        console.error('Error parsing user data:', err);
      }
    }

    if (!achievementId || achievementId === 'undefined' || achievementId === 'null') {
      setError('Invalid achievement ID');
      setIsLoading(false);
      setIsLoadingComments(false);
      return;
    }

    const fetchAchievementAndComments = async () => {
      setIsLoading(true);
      setIsLoadingComments(true);
      setError('');
      setCommentsError('');

      try {
        // Fetch achievement first
        const achievementRes = await fetch(`/api/achievements/${achievementId}`, {
          headers: { 'Content-Type': 'application/json' },
          cache: 'no-store'
        });

        const achievementData = await achievementRes.json();
        if (!achievementRes.ok) throw new Error(achievementData?.message || 'Failed to fetch achievement');
        setAchievement(achievementData);

        // Then fetch comments separately to help isolate issues
        await fetchAchievementComments(achievementId);

      } catch (err) {
        console.error('[FRONTEND-UI] Error fetching achievement:', err);
        const message = err instanceof Error ? err.message : 'Error loading data. Please try again later.';
        setError(message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAchievementAndComments();
  }, [achievementId]); // Remove achievement from dependencies to prevent infinite loop

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
      if (isLikingInProgress) return;

      setIsLikingInProgress(true);

      const token = localStorage.getItem('token');

      const method = achievement.hasLiked ? 'DELETE' : 'POST';

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
        throw new Error(
          errorData?.error ||
          errorData?.message ||
          (achievement.hasLiked ? 'Failed to unlike achievement' : 'Failed to like achievement')
        );
      }

      const data = await response.json();

      setAchievement(prev =>
        prev ? {
          ...prev,
          likes: data.likes,
          hasLiked: data.hasLiked
        } : null
      );

      toast({
        title: achievement.hasLiked ? "Removed like" : "Liked!",
        description: achievement.hasLiked ? "You removed your like from this achievement" : "You liked this achievement",
        variant: "default",
      });
    } catch (error) {
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

  const handleCommentSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!newComment.trim() || !achievement || isPostingComment) return;

    if (!isAuthenticated) {
      toast({
        title: "Login Required",
        description: "You need to be logged in to post a comment.",
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

    setIsPostingComment(true);
    setCommentsError('');

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Authentication required');
      }

      const response = await fetch(`/api/achievements/${achievement.id}/comments`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ text: newComment })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to post comment');
      }

      const data = await response.json();

      // Add the new comment to the state and clear the input
      setComments(prev => [data, ...prev]);
      setNewComment('');

      toast({
        title: "Comment posted successfully",
      });

    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to post comment. Please try again.';
      setCommentsError(message);
      toast({
        title: "Error",
        description: message,
        variant: "destructive",
      });
    } finally {
      setIsPostingComment(false);
    }
  };

  // Separate function to fetch comments for an achievement
  const fetchAchievementComments = async (achievementId: string) => {
    try {
      setIsLoadingComments(true);

      const response = await fetch(`/api/achievements/${achievementId}/comments`, {
        headers: { 'Content-Type': 'application/json' },
        cache: 'no-store'
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData?.message || 'Failed to fetch comments');
      }

      const commentsData = await response.json();

      // Only update state if the data is an array
      if (Array.isArray(commentsData)) {
        setComments(commentsData);
        setCommentsError('');
      } else {
        setComments([]);
        setCommentsError('Invalid data format received');
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error loading comments. Please try again.';
      setCommentsError(message);
    } finally {
      setIsLoadingComments(false);
    }
  };

  // Function to handle comment deletion
  const handleDeleteComment = async (commentId: string) => {
    if (!isAuthenticated || isDeletingComment) return;

    try {
      setIsDeletingComment(true);

      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Authentication required');
      }

      const response = await fetch(`/api/achievements/comments/${commentId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to delete comment');
      }

      // Remove the deleted comment from the state
      setComments(prev => prev.filter(comment => comment.id !== commentId));

      toast({
        title: "Comment deleted successfully",
      });

    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to delete comment. Please try again.';
      setCommentsError(message);
      toast({
        title: "Error",
        description: message,
        variant: "destructive",
      });
    } finally {
      setIsDeletingComment(false);
    }
  };

  return (
    <div className="min-h-screen pb-16 bg-gradient-to-br from-background to-muted/30">
      <div className="container mx-auto px-4 pt-8">
        <Link href="/feed">
          <Button variant="ghost" className="mb-6 pl-0 hover:bg-transparent text-muted-foreground hover:text-primary">
            <ChevronLeft className="mr-2 h-4 w-4" />
            Back to Feed
          </Button>
        </Link>

        {isLoading && (
          <div className="flex justify-center items-center h-64">
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
          </div>
        )}

        {error && !isLoading && (
          <Card className="bg-destructive/10 border-destructive">
            <CardHeader>
              <CardTitle className="text-destructive">Error Loading Achievement</CardTitle>
            </CardHeader>
            <CardContent>
              <p>{error}</p>
              <Button onClick={() => router.push('/feed')} className="mt-4">Go Back</Button>
            </CardContent>
          </Card>
        )}

        {achievement && !isLoading && !error && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <Card className="overflow-hidden shadow-lg border rounded-xl">
                <CardHeader className="relative p-0">
                  {achievement.imageUrl ? (
                    <div className="relative w-full h-64 md:h-96">
                      <Image
                        src={achievement.imageUrl}
                        alt={achievement.title}
                        fill
                        className="object-cover"
                        sizes="(max-width: 768px) 100vw, 50vw"
                      />
                    </div>
                  ) : (
                    <div className="bg-muted h-64 md:h-96 w-full flex items-center justify-center">
                      <p className="text-muted-foreground">No image available</p>
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
                </CardHeader>

                <CardContent className="p-6">
                  <CardTitle className="text-3xl font-bold mb-4">{achievement.title}</CardTitle>
                  <p className="text-muted-foreground leading-relaxed">{achievement.description}</p>
                </CardContent>

                <Separator />

                <CardFooter className="p-6 flex flex-col items-start">
                  <h3 className="text-xl font-semibold mb-4 flex items-center">
                    <MessageCircle className="mr-2 h-5 w-5"/> Comments ({comments.length})
                  </h3>

                  {isAuthenticated && (
                     <form onSubmit={handleCommentSubmit} className="w-full mb-6">
                       <div className="flex gap-3">
                         <Textarea
                           placeholder="Write your comment..."
                           value={newComment}
                           onChange={(e) => setNewComment(e.target.value)}
                           disabled={isPostingComment}
                           rows={2}
                           className="flex-grow resize-none"
                         />
                         <Button type="submit" disabled={!newComment.trim() || isPostingComment} size="icon">
                           {isPostingComment ? (
                             <Loader2 className="h-4 w-4 animate-spin" />
                           ) : (
                             <Send className="h-4 w-4" />
                           )}
                         </Button>
                       </div>
                     </form>
                  )}
                  {!isAuthenticated && (
                    <p className="text-sm text-muted-foreground mb-4">
                      <Link href={`/login?redirect=${encodeURIComponent(window.location.pathname)}`} className="underline hover:text-primary">Log in</Link> to post a comment.
                    </p>
                  )}

                  <div className="w-full space-y-4">
                    {isLoadingComments && (
                      <div className="flex justify-center items-center p-4">
                        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                         <span className="ml-2 text-muted-foreground">Loading comments...</span>
                      </div>
                    )}
                    {commentsError && !isLoadingComments && (
                       <p className="text-red-600 text-sm">Error loading comments: {commentsError}</p>
                    )}
                    {!isLoadingComments && !commentsError && comments.length === 0 && (
                       <p className="text-muted-foreground text-sm text-center py-4">No comments yet. Be the first to comment!</p>
                    )}
                    {!isLoadingComments && !commentsError && comments.map(comment => (
                      <div key={comment.id} className="flex items-start gap-3">
                        <Avatar className="h-8 w-8 mt-1">
                           <AvatarImage src={comment.user?.profilePicture} alt={comment.user?.username || 'User'} />
                           <AvatarFallback className="text-xs">
                             {(comment.user?.firstName || comment.user?.username || 'U').charAt(0).toUpperCase()}
                           </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 bg-muted/50 rounded-lg p-3">
                          <div className="flex items-center justify-between mb-1">
                            <Link href={`/profile/${comment.user.id}`} className="font-semibold text-sm hover:underline">
                              {comment.user?.firstName && comment.user?.lastName
                                ? `${comment.user.firstName} ${comment.user.lastName}`
                                : comment.user?.username || 'Anonymous'}
                            </Link>
                            {currentUserId && comment.user.id === currentUserId && (
                              <TooltipProvider>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      className="h-6 w-6 text-muted-foreground hover:text-destructive"
                                      onClick={() => handleDeleteComment(comment.id)}
                                      disabled={isDeletingComment}
                                    >
                                      <Trash2 className="h-4 w-4" />
                                    </Button>
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    <p>Delete your comment</p>
                                  </TooltipContent>
                                </Tooltip>
                              </TooltipProvider>
                            )}
                          </div>
                          <p className="text-sm text-foreground/90">{comment.text}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardFooter>
              </Card>
            </div>

            <div className="lg:col-span-1 space-y-6">
              <Card className="shadow border rounded-xl">
                <CardHeader>
                  <CardTitle>Author</CardTitle>
                </CardHeader>
                <CardContent className="flex items-center gap-3">
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={achievement.user.profilePicture} alt={achievement.user.username} />
                    <AvatarFallback>
                       {(achievement.user?.firstName || achievement.user?.username || 'U').charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <Link href={`/profile/${achievement.user.id}`} className="font-semibold hover:underline">
                       {achievement.user?.firstName && achievement.user?.lastName
                         ? `${achievement.user.firstName} ${achievement.user.lastName}`
                         : achievement.user?.username || 'Anonymous User'}
                    </Link>
                    <p className="text-sm text-muted-foreground">@{achievement.user.username}</p>
                  </div>
                </CardContent>
              </Card>

              <Card className="shadow border rounded-xl">
                <CardHeader>
                  <CardTitle>Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    <span>Posted on {new Date(achievement.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Heart className="h-4 w-4" />
                    <span>{achievement.likes} {achievement.likes === 1 ? 'like' : 'likes'}</span>
                  </div>
                </CardContent>
              </Card>

              <Card className="shadow border rounded-xl">
                 <CardHeader>
                   <CardTitle>Actions</CardTitle>
                 </CardHeader>
                 <CardContent className="flex flex-col gap-3">
                   <TooltipProvider delayDuration={100}>
                     <Tooltip>
                       <TooltipTrigger asChild>
                          <Button
                           variant={achievement.hasLiked ? "default" : "outline"}
                           onClick={handleLike}
                           disabled={isLikingInProgress}
                           className="w-full justify-center"
                         >
                           {isLikingInProgress ? (
                             <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                           ) : (
                             <Heart className={`mr-2 h-4 w-4 ${achievement.hasLiked ? "fill-white" : ""}`} />
                           )}
                           {achievement.hasLiked ? 'Unlike' : 'Like'} ({achievement.likes})
                         </Button>
                       </TooltipTrigger>
                       <TooltipContent>
                         {isAuthenticated ? (achievement.hasLiked ? 'Remove your like' : 'Show your appreciation') : 'Log in to like'}
                       </TooltipContent>
                     </Tooltip>
                   </TooltipProvider>

                   <Button variant="outline" onClick={shareAchievement} className="w-full">
                     <Share className="mr-2 h-4 w-4" /> Share
                   </Button>

                   {/* Optional: Add Edit/Delete buttons if the current user is the author */}
                   {/* Example: Check if currentUser.id === achievement.user.id */}
                 </CardContent>
               </Card>

            </div>
          </div>
        )}
      </div>
    </div>
  );
}