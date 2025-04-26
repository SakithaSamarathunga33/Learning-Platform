/* eslint-disable @typescript-eslint/no-unused-vars */
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
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
import { ThumbsUp, Search, Share, MessageSquare, Filter, ChevronRight, Heart, LogIn, Plus, X } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { toast } from "@/components/ui/use-toast";
import { ToastAction } from "@/components/ui/toast";
import AchievementCard from '@/components/AchievementCard';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetFooter,
  SheetClose,
} from "@/components/ui/sheet";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";

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

export default function FeedPage() {
  const router = useRouter();
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [filteredAchievements, setFilteredAchievements] = useState<Achievement[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [filter, setFilter] = useState('all');
  const [likingInProgress, setLikingInProgress] = useState<{[key: string]: boolean}>({});
  const [searchTerm, setSearchTerm] = useState('');
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [sortOption, setSortOption] = useState('newest');
  const [showOnlyLiked, setShowOnlyLiked] = useState(false);
  const [showMineOnly, setShowMineOnly] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

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
    
    const fetchAchievements = async () => {
      try {
        setIsLoading(true);

        // Add authorization header if token exists
        const headers: HeadersInit = {};
        if (token) {
          headers['Authorization'] = `Bearer ${token}`;
        }

        // Use the Next.js API route instead of directly calling the backend
        console.log('Fetching all achievements via proxy API');
        const response = await fetch(`/api/achievements`, {
          headers,
          cache: 'no-store'
        });

        if (!response.ok) {
          throw new Error('Failed to fetch achievements');
        }

        const data = await response.json();
        console.log(`Received ${data.length} achievements`);
        
        // Filter out any achievements with null/undefined user to prevent errors
        const validAchievements = data.filter(achievement => achievement && achievement.user);
        
        setAchievements(validAchievements);
        setFilteredAchievements(validAchievements); // Initialize filtered achievements with all achievements
      } catch (err) {
        console.error('Error fetching achievements:', err);
        setError('Error loading achievements. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchAchievements();
  }, [apiUrl]);

  // Apply filters and search whenever the relevant states change
  useEffect(() => {
    if (!achievements.length) return;
    
    let result = [...achievements];
    
    // Apply search term filter
    if (searchTerm) {
      const searchTermLower = searchTerm.toLowerCase();
      result = result.filter(
        achievement => 
          achievement.title.toLowerCase().includes(searchTermLower) ||
          achievement.description.toLowerCase().includes(searchTermLower) ||
          (achievement.user?.username?.toLowerCase() || '').includes(searchTermLower)
      );
    }
    
    // Apply liked filter
    if (showOnlyLiked) {
      result = result.filter(achievement => achievement.hasLiked);
    }
    
    // Apply mine only filter
    if (showMineOnly && currentUserId) {
      result = result.filter(achievement => achievement.user && achievement.user.id === currentUserId);
    }
    
    // Apply sorting
    if (sortOption === 'newest') {
      result = result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    } else if (sortOption === 'oldest') {
      result = result.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
    } else if (sortOption === 'most_liked') {
      result = result.sort((a, b) => b.likes - a.likes);
    }
    
    setFilteredAchievements(result);
  }, [achievements, searchTerm, sortOption, showOnlyLiked, showMineOnly, currentUserId]);

  const handleLike = async (achievement: Achievement) => {
    if (!isAuthenticated) {
      toast({
        title: "Authentication required",
        description: "Please log in to like achievements",
        action: (
          <ToastAction altText="Login" asChild>
            <Link href="/login">Login</Link>
          </ToastAction>
        ),
      });
      return;
    }

    try {
      // Don't allow multiple like requests for the same achievement
      if (likingInProgress[achievement.id]) return;
      
      // Mark this achievement as being liked
      setLikingInProgress(prev => ({ ...prev, [achievement.id]: true }));
      
      const token = localStorage.getItem('token');
      
      // If already liked, unlike it
      const method = achievement.hasLiked ? 'DELETE' : 'POST';
      
      // Use the Next.js API route instead of directly calling the backend
      console.log(`${method} request for achievement with ID: ${achievement.id} via proxy API`);
      const response = await fetch(`/api/achievements/${achievement.id}/like`, {
        method,
        headers: {
          'Authorization': `Bearer ${token}`
        },
        cache: 'no-store'
      });

      if (!response.ok) {
        throw new Error(achievement.hasLiked ? 'Failed to unlike achievement' : 'Failed to like achievement');
      }

      const data = await response.json();
      console.log('Like operation response:', data);
      
      // Update the likes count in the UI
      setAchievements(prev =>
        prev.map(item =>
          item.id === achievement.id
            ? { ...item, likes: data.likes, hasLiked: !item.hasLiked }
            : item
        )
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
        description: "Failed to process like operation. Please try again.",
        variant: "destructive",
      });
    } finally {
      // Clear the progress flag
      setLikingInProgress(prev => ({ ...prev, [achievement.id]: false }));
    }
  };

  const resetFilters = () => {
    setSearchTerm('');
    setSortOption('newest');
    setShowOnlyLiked(false);
    setShowMineOnly(false);
  };

  const navigateToCreatePost = () => {
    if (isAuthenticated) {
      router.push('/create-post');
    } else {
      router.push('/login?redirect=/create-post');
    }
  };

  return (
    <div className="flex flex-col min-h-screen relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-[1]">
        <div className="absolute top-1/4 -left-10 w-72 h-72 bg-primary/10 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob"></div>
        <div className="absolute top-3/4 -right-10 w-96 h-96 bg-secondary/10 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000"></div>
        <div className="absolute bottom-1/4 left-1/3 w-72 h-72 bg-accent/10 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-4000"></div>
      </div>

      {/* Hero Section */}
      <section className="relative py-12 md:py-16 bg-gradient-to-r from-primary/10 via-primary/5 to-background z-[2]">
        <div
          className="absolute inset-0 opacity-20 pointer-events-none"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000000' fill-opacity='0.05'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
            mixBlendMode: 'normal'
          }}
        ></div>
        <div className="container mx-auto px-4 relative z-[3]">
          <div className="max-w-4xl mx-auto text-center mb-8 transform transition-all duration-700 opacity-0 translate-y-8 animate-fade-in-up">
            <Badge variant="outline" className="px-3 py-1 text-sm mb-4">
              Community Achievements
            </Badge>
            <h1 className="text-3xl md:text-5xl font-bold tracking-tight mb-4">
              Achievement Feed
            </h1>
            <p className="text-lg text-muted-foreground max-w-[700px] mx-auto">
              Celebrate learning milestones and share your educational journey with the community.
              Discover what others are accomplishing and get inspired.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row justify-between items-center gap-4 max-w-6xl mx-auto relative z-[3]">
            <div className="relative w-full max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search achievements..."
                className="w-full py-2 pl-10 pr-4 rounded-md border bg-card text-card-foreground"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              {searchTerm && (
                <button 
                  className="absolute right-3 top-1/2 transform -translate-y-1/2"
                  onClick={() => setSearchTerm('')}
                >
                  <X className="h-4 w-4 text-muted-foreground" />
                </button>
              )}
            </div>
            <div className="flex items-center gap-4 z-30 relative">
              <Sheet>
                <SheetTrigger asChild>
                  <button className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-secondary text-secondary-foreground hover:bg-secondary/80 h-10 px-4 py-2">
                    <Filter className="mr-2 h-4 w-4" />
                    Filter
                  </button>
                </SheetTrigger>
                <SheetContent>
                  <SheetHeader>
                    <SheetTitle>Filter Achievements</SheetTitle>
                    <SheetDescription>
                      Customize your feed by applying filters
                    </SheetDescription>
                  </SheetHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                      <Label htmlFor="sort">Sort By</Label>
                      <select
                        id="sort"
                        value={sortOption}
                        onChange={(e) => setSortOption(e.target.value)}
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        <option value="newest">Newest First</option>
                        <option value="oldest">Oldest First</option>
                        <option value="most_liked">Most Liked</option>
                      </select>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="liked"
                        checked={showOnlyLiked}
                        onCheckedChange={(checked) => setShowOnlyLiked(checked as boolean)}
                      />
                      <Label htmlFor="liked">Show Only Liked</Label>
                    </div>
                    {isAuthenticated && (
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="mine"
                          checked={showMineOnly}
                          onCheckedChange={(checked) => setShowMineOnly(checked as boolean)}
                        />
                        <Label htmlFor="mine">Show Only My Posts</Label>
                      </div>
                    )}
                  </div>
                  <SheetFooter>
                    <SheetClose asChild>
                      <button className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2">
                        Close
                      </button>
                    </SheetClose>
                  </SheetFooter>
                </SheetContent>
              </Sheet>

              <button
                onClick={() => router.push('/create-post')}
                className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2"
              >
                <Share className="mr-2 h-4 w-4" />
                Share Achievement
              </button>
            </div>
          </div>
        </div>
      </section>

      <section className="container mx-auto px-4 py-8">
        {isLoading ? (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
          </div>
        ) : error ? (
          <Card className="bg-destructive/10 border-destructive/20 mx-auto max-w-2xl">
            <CardContent className="py-6">
              <div className="flex flex-col items-center text-center gap-2">
                <span className="text-destructive">{error}</span>
                <Button variant="outline" onClick={() => window.location.reload()}>
                  Try Again
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : filteredAchievements.length === 0 ? (
          <div className="text-center py-12">
            <div className="inline-flex h-20 w-20 rounded-full bg-muted items-center justify-center mb-6">
              <Filter className="h-10 w-10 text-muted-foreground" />
            </div>
            <h2 className="text-2xl font-bold mb-2">No achievements found</h2>
            <p className="text-muted-foreground mb-6 max-w-md mx-auto">
              {searchTerm 
                ? "We couldn't find any achievements matching your search criteria."
                : showOnlyLiked 
                  ? "You haven't liked any achievements yet."
                  : showMineOnly
                    ? "You haven't shared any achievements yet."
                    : "There are no achievements to display at the moment."}
            </p>
            <div className="flex justify-center gap-4">
              {(searchTerm || showOnlyLiked || showMineOnly) && (
                <button
                  onClick={resetFilters}
                  className="bg-white hover:bg-gray-100 text-gray-800 font-semibold py-2 px-4 border border-gray-400 rounded shadow"
                >
                  Clear Filters
                </button>
              )}
              <button
                onClick={() => router.push('/create-post')}
                className="bg-primary hover:bg-primary/90 text-white font-semibold py-2 px-4 border border-primary rounded shadow"
              >
                Share Your First Achievement
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredAchievements.map((achievement) => (
              achievement && achievement.user ? (
                <AchievementCard
                  key={achievement.id}
                  achievement={achievement}
                  onLike={() => handleLike(achievement)}
                  isLoading={!!likingInProgress[achievement.id]}
                  isAuthenticated={isAuthenticated}
                />
              ) : null
            ))}
          </div>
        )}
      </section>

      {/* CTA Section */}
      <section className="bg-primary/5 py-12 mt-12 border-t">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-2xl md:text-3xl font-bold mb-4">Ready to share your achievements?</h2>
            <p className="text-muted-foreground mb-6">
              Join our community and showcase your learning journey. Get recognition and inspire others!
            </p>
            {isAuthenticated && (
              <button
                onClick={() => router.push('/create-post')}
                className="bg-primary hover:bg-primary/90 text-white font-semibold py-3 px-6 rounded-md shadow text-lg"
              >
                Create New Post
              </button>
            )}
          </div>
        </div>
      </section>
    </div>
  );
} 