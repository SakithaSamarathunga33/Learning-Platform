'use client';

import Link from 'next/link';
import { 
  Card, 
  CardContent, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Heart } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

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
  user: User | null;
  hasLiked?: boolean;
}

interface AchievementCardProps {
  achievement: Achievement;
  onLike: () => void;
  isLoading: boolean;
  isAuthenticated: boolean;
}

export default function AchievementCard({ 
  achievement, 
  onLike,
  isLoading,
  isAuthenticated
}: AchievementCardProps) {
  // Check if user exists to avoid null references
  const userExists = achievement.user !== null && achievement.user !== undefined;
  const username = userExists ? (achievement.user.username || 'Anonymous') : 'Anonymous';
  const firstName = userExists ? achievement.user.firstName : '';
  const lastName = userExists ? achievement.user.lastName : '';
  const displayName = firstName && lastName ? `${firstName} ${lastName}` : username;
  const profilePicture = userExists ? achievement.user.profilePicture : undefined;
  const userId = userExists ? achievement.user.id : 'anonymous';
  const firstInitial = (firstName || username || 'A').charAt(0).toUpperCase();

  return (
    <Card className="overflow-hidden border rounded-xl transition-all duration-300 hover:shadow-md h-full flex flex-col">
      <div className="relative h-48 w-full">
        {achievement.imageUrl ? (
          <img
            src={achievement.imageUrl}
            alt={achievement.title}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="bg-muted h-full w-full flex items-center justify-center">
            <p className="text-muted-foreground">No image available</p>
          </div>
        )}
      </div>
      
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between mb-2">
          <Badge variant="outline">{new Date(achievement.createdAt).toLocaleDateString()}</Badge>
          <div className="flex items-center gap-1 text-muted-foreground">
            <Heart className={`h-4 w-4 ${achievement.hasLiked ? "fill-red-500 text-red-500" : ""}`} /> 
            <span className="text-sm">{achievement.likes}</span>
          </div>
        </div>
        <CardTitle className="text-xl line-clamp-1">{achievement.title}</CardTitle>
      </CardHeader>
      
      <CardContent className="py-2 flex-grow">
        <p className="line-clamp-3 text-muted-foreground text-sm">
          {achievement.description}
        </p>
      </CardContent>
      
      <CardFooter className="flex justify-between pt-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center overflow-hidden">
            {profilePicture ? (
              <img 
                src={profilePicture} 
                alt={displayName} 
                className="w-full h-full object-cover"
              />
            ) : (
              <span className="text-xs font-semibold text-muted-foreground">
                {firstInitial}
              </span>
            )}
          </div>
          {userExists ? (
            <Link href={`/profile/${userId}`} className="hover:underline">
              <span className="text-sm font-medium">{displayName}</span>
            </Link>
          ) : (
            <span className="text-sm font-medium text-muted-foreground">Anonymous User</span>
          )}
        </div>
        <div className="flex gap-2">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className={`h-8 w-8 p-0 ${achievement.hasLiked ? "text-red-500" : ""}`}
                  onClick={onLike}
                  disabled={isLoading}
                >
                  <Heart className={`h-4 w-4 ${achievement.hasLiked ? "fill-red-500" : ""} ${isLoading ? "animate-ping" : ""}`} />
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
          
          <Link href={`/achievements/${achievement.id}`}>
            <Button 
              variant="outline" 
              size="sm"
            >
              View
            </Button>
          </Link>
        </div>
      </CardFooter>
    </Card>
  );
} 