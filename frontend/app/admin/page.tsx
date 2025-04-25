/* eslint-disable @next/next/no-img-element */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable react/no-unescaped-entities */
'use client';

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  Legend,
} from "recharts";
import {
  Users,
  BookOpen,
  DollarSign,
  CreditCard,
  CheckCircle,
  MoreHorizontal,
  TrendingDown,
  Eye,
  Edit,
  Plus,
  Loader2,
  Medal,
  MessageSquare,
  Upload,
  AlertCircle,
} from "lucide-react";
import { useRouter } from "next/navigation";
import Link from "next/link";

// Define interfaces for the dashboard data
interface DashboardStats {
  totalUsers?: number;
  activeUsers?: number;
  totalAchievements?: number;
  totalCourses?: number;
  totalComments?: number;
  totalMedia?: number;
}

interface Course {
  id: string;
  title: string;
  description?: string;
  thumbnailUrl?: string;
  price?: number;
  category?: string;
  isPublished?: boolean;
  published?: boolean;
  instructor?: {
    id?: string;
    username?: string;
  };
  createdAt?: string;
}

interface User {
  id: string;
  username: string;
  email?: string;
  name?: string;
  provider?: string;
  profilePicture?: string;
  enabled?: boolean;
  createdAt?: string;
}

interface Achievement {
  id: string;
  title: string;
  description?: string;
  imageUrl?: string;
  createdAt?: string;
  user?: User;
}

interface Comment {
  id: string;
  text: string;
  createdAt?: string;
  user?: User;
  achievement?: {
    id: string;
    title: string;
  };
}

interface DashboardData {
  stats: DashboardStats;
  latestCourses: Course[];
  latestAchievements: Achievement[];
  latestComments: Comment[];
  recentUsers: User[];
}

export default function AdminDashboard() {
  const [mounted, setMounted] = useState(false);
  const [scrollY, setScrollY] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dashboardData, setDashboardData] = useState<DashboardData>({
    stats: {},
    latestCourses: [],
    latestAchievements: [],
    latestComments: [],
    recentUsers: []
  });
  
  const router = useRouter();

  // Fetch dashboard data from the backend
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        
        const token = localStorage.getItem('token');
        if (!token) {
          router.push('/login');
          return;
        }
        
        const response = await fetch('/api/admin/stats', {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });
        
        if (!response.ok) {
          if (response.status === 401 || response.status === 403) {
            router.push('/login');
            return;
          }
          throw new Error('Failed to fetch dashboard data');
        }
        
        const data = await response.json();
        setDashboardData(data);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [router]);

  // Update scroll position for animations
  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY);
    };

    setMounted(true);

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-12 w-12 text-primary animate-spin" />
          <p className="text-muted-foreground">Loading dashboard data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-4 max-w-md text-center">
          <AlertCircle className="h-12 w-12 text-red-500" />
          <h2 className="text-2xl font-bold">Error Loading Dashboard</h2>
          <p className="text-muted-foreground">{error}</p>
          <Button onClick={() => window.location.reload()}>
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  // Prepare real data for display
  const { stats } = dashboardData;
  
  return (
    <div className="space-y-6">
      <div 
        className="flex flex-col md:flex-row justify-between gap-4 md:items-center transform transition-all duration-700 opacity-0 translate-y-4"
        style={{
          animationName: mounted ? 'fadeInUp' : 'none',
          animationDuration: '0.6s',
          animationFillMode: 'forwards'
        }}
      >
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome back, Admin! Here's what's happening with your platform today.
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[
          { 
            icon: <Users className="h-6 w-6 text-primary" />, 
            title: "Total Users", 
            value: stats.totalUsers?.toString() || "0"
          },
          { 
            icon: <BookOpen className="h-6 w-6 text-primary" />, 
            title: "Total Courses", 
            value: stats.totalCourses?.toString() || "0"
          },
          { 
            icon: <Medal className="h-6 w-6 text-primary" />, 
            title: "Achievements", 
            value: stats.totalAchievements?.toString() || "0"
          },
          { 
            icon: <MessageSquare className="h-6 w-6 text-primary" />, 
            title: "Comments", 
            value: stats.totalComments?.toString() || "0"
          }
        ].map((stat, i) => (
          <Card 
            key={stat.title} 
            className="border-0 shadow-md transition-all duration-300 hover:shadow-lg hover:scale-[1.02]"
            style={{
              transform: 'translateY(20px)',
              opacity: 0,
              animation: mounted ? `fadeInUp 0.6s ease-out forwards ${0.1 + i * 0.1}s` : 'none'
            }}
          >
            <CardContent className="p-6">
              <div className="flex items-center justify-between space-x-4">
                <div className="flex items-center gap-4">
                  <div className="bg-primary/10 p-3 rounded-full group-hover:bg-primary/20 transition-colors duration-300">
                    {stat.icon}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">{stat.title}</p>
                    <div className="flex items-baseline gap-2">
                      <h3 className="text-2xl font-bold">{stat.value}</h3>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Recent Users and Latest Courses */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card 
          className="col-span-1 border-0 shadow-md transition-all duration-300 hover:shadow-lg"
          style={{
            transform: 'translateY(20px)',
            opacity: 0,
            animation: mounted ? 'fadeInUp 0.6s ease-out forwards 0.4s' : 'none',
          }}
        >
          <CardHeader>
            <CardTitle>Recent Users</CardTitle>
            <CardDescription>Recently joined users</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {dashboardData.recentUsers.map((user, index) => (
                <div 
                  key={user.id} 
                  className="flex items-center gap-4 transform transition-all duration-300 hover:bg-muted/50 rounded-lg p-2"
                >
                  <Avatar className="h-9 w-9 transition-transform duration-300 hover:scale-110">
                    <AvatarImage src={user.profilePicture || "/placeholder.svg?height=36&width=36"} alt={user.username} />
                    <AvatarFallback>{user.username.charAt(0).toUpperCase()}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 space-y-1">
                    <p className="text-sm font-medium leading-none">{user.name || user.username}</p>
                    <p className="text-sm text-muted-foreground">{user.email || '—'}</p>
                  </div>
                  <Badge variant={user.enabled ? "default" : "secondary"}>
                    {user.enabled ? "Active" : "Inactive"}
                  </Badge>
                </div>
              ))}
            </div>
            <div className="mt-4">
              <Link href="/admin/users">
                <Button variant="outline" className="w-full">View All Users</Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        <Card 
          className="col-span-1 border-0 shadow-md transition-all duration-300 hover:shadow-lg"
          style={{
            transform: 'translateY(20px)',
            opacity: 0,
            animation: mounted ? 'fadeInUp 0.6s ease-out forwards 0.5s' : 'none',
          }}
        >
          <CardHeader>
            <CardTitle>Latest Courses</CardTitle>
            <CardDescription>Recently added courses</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {dashboardData.latestCourses.map((course, index) => (
                <div 
                  key={course.id} 
                  className="flex items-center gap-4 transition-all duration-300 hover:bg-muted/30 rounded-lg p-2"
                >
                  <div className="relative w-16 h-16 rounded-md overflow-hidden">
                    <img
                      src={course.thumbnailUrl || "/placeholder.svg"}
                      alt={course.title}
                      className="object-cover w-full h-full transition-transform duration-500 group-hover:scale-110"
                    />
                  </div>
                  <div className="flex-1">
                    <h4 className="text-sm font-medium">{course.title}</h4>
                    <p className="text-xs text-muted-foreground">{course.instructor?.username || "Unknown Instructor"}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="outline" className="text-xs transition-colors">
                        {course.category || "Uncategorized"}
                      </Badge>
                      <p className="text-xs text-muted-foreground">
                        {course.createdAt ? new Date(course.createdAt).toLocaleDateString() : "—"}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <Link href={`/admin/courses`}>
                      <Button variant="ghost" size="icon" className="h-8 w-8 transition-all duration-300 hover:scale-110 hover:bg-muted/50">
                        <Eye className="h-4 w-4" />
                      </Button>
                    </Link>
                  </div>
                </div>
              ))}
              <Link href="/admin/courses">
                <Button 
                  variant="outline" 
                  className="w-full transition-all duration-300 hover:scale-[1.02] hover:bg-muted/50 active:scale-95"
                >
                  View All Courses
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Latest Achievements and Comments */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card 
          className="col-span-1 border-0 shadow-md transition-all duration-300 hover:shadow-lg"
          style={{
            transform: 'translateY(20px)',
            opacity: 0,
            animation: mounted ? 'fadeInUp 0.6s ease-out forwards 0.6s' : 'none',
          }}
        >
          <CardHeader>
            <CardTitle>Latest Achievements</CardTitle>
            <CardDescription>Recently added achievements</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {dashboardData.latestAchievements.map((achievement, index) => (
                <div 
                  key={achievement.id} 
                  className="flex items-start gap-4 rounded-lg border p-3 transition-all duration-300 hover:bg-muted/30 hover:shadow-sm"
                >
                  <div className="relative w-16 h-16 rounded-md overflow-hidden">
                    <img
                      src={achievement.imageUrl || "/placeholder.svg"}
                      alt={achievement.title}
                      className="object-cover w-full h-full transition-transform duration-500"
                    />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">{achievement.title}</p>
                    <p className="text-xs text-muted-foreground line-clamp-2">{achievement.description}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <p className="text-xs text-muted-foreground">
                        {achievement.createdAt ? new Date(achievement.createdAt).toLocaleDateString() : "—"}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        by {achievement.user?.username || "Unknown User"}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
              <Link href="/admin/achievements">
                <Button variant="outline" className="w-full">
                  View All Achievements
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        <Card 
          className="col-span-1 border-0 shadow-md transition-all duration-300 hover:shadow-lg"
          style={{
            transform: 'translateY(20px)',
            opacity: 0,
            animation: mounted ? 'fadeInUp 0.6s ease-out forwards 0.7s' : 'none',
          }}
        >
          <CardHeader>
            <CardTitle>Latest Comments</CardTitle>
            <CardDescription>Recent comments from users</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {dashboardData.latestComments.map((comment, index) => (
                <div 
                  key={comment.id} 
                  className="flex items-start gap-4 rounded-lg border p-3 transition-all duration-300 hover:bg-muted/30 hover:shadow-sm"
                >
                  <Avatar className="h-9 w-9">
                    <AvatarImage src={comment.user?.profilePicture || "/placeholder.svg?height=36&width=36"} alt={comment.user?.username || "User"} />
                    <AvatarFallback>{comment.user?.username?.charAt(0).toUpperCase() || "U"}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium">{comment.user?.username || "Unknown User"}</p>
                      <p className="text-xs text-muted-foreground">
                        {comment.createdAt ? new Date(comment.createdAt).toLocaleDateString() : "—"}
                      </p>
                    </div>
                    <p className="text-sm text-muted-foreground line-clamp-2">{comment.text}</p>
                    {comment.achievement && (
                      <p className="text-xs text-muted-foreground mt-1">
                        on: {comment.achievement.title}
                      </p>
                    )}
                  </div>
                </div>
              ))}
              <Link href="/admin/comments">
                <Button variant="outline" className="w-full">
                  View All Comments
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
