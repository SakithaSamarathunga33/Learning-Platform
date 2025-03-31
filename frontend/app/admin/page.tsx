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
  TrendingUp,
  TrendingDown,
  Eye,
  Edit,
  Plus,
} from "lucide-react";

export default function AdminDashboard() {
  const [mounted, setMounted] = useState(false);
  const [scrollY, setScrollY] = useState(0);

  // Update scroll position for animations
  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY);
    };

    setMounted(true);

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

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
        <div className="flex gap-2">
          <Button className="transition-all duration-300 hover:scale-105 hover:shadow-md active:scale-95">
            <Plus className="mr-2 h-4 w-4" />
            Add New Course
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[
          { icon: <Users className="h-6 w-6 text-primary" />, title: "Total Users", value: "12,546", change: "+12%", up: true },
          { icon: <BookOpen className="h-6 w-6 text-primary" />, title: "Total Courses", value: "1,245", change: "+8%", up: true },
          { icon: <DollarSign className="h-6 w-6 text-primary" />, title: "Total Revenue", value: "$245,689", change: "+24%", up: true },
          { icon: <CreditCard className="h-6 w-6 text-primary" />, title: "Sales This Month", value: "$42,589", change: "-3%", up: false }
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
                      <Badge className={`${stat.up ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'} hover:${stat.up ? 'bg-green-100' : 'bg-red-100'}`}>
                        {stat.up ? <TrendingUp className="mr-1 h-3 w-3" /> : <TrendingDown className="mr-1 h-3 w-3" />}
                        {stat.change}
                      </Badge>
            </div>
          </div>
            </div>
          </div>
            </CardContent>
          </Card>
        ))}
        </div>

      {/* Charts */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card 
          className="col-span-1 border-0 shadow-md transition-all duration-300 hover:shadow-lg"
          style={{
            transform: 'translateY(20px)',
            opacity: 0,
            animation: mounted ? 'fadeInUp 0.6s ease-out forwards 0.4s' : 'none',
            animationPlayState: (scrollY > 100) ? 'running' : 'paused'
          }}
        >
          <CardHeader>
            <CardTitle>Revenue Overview</CardTitle>
            <CardDescription>Monthly revenue for the current year</CardDescription>
          </CardHeader>
          <CardContent className="pl-2">
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={revenueData}
                  margin={{
                    top: 5,
                    right: 30,
                    left: 20,
                    bottom: 5,
                  }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="revenue" fill="hsl(var(--primary))" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card 
          className="col-span-1 border-0 shadow-md transition-all duration-300 hover:shadow-lg"
          style={{
            transform: 'translateY(20px)',
            opacity: 0,
            animation: mounted ? 'fadeInUp 0.6s ease-out forwards 0.5s' : 'none',
            animationPlayState: (scrollY > 100) ? 'running' : 'paused'
          }}
        >
          <CardHeader>
            <CardTitle>User Growth</CardTitle>
            <CardDescription>New users over the last 12 months</CardDescription>
          </CardHeader>
          <CardContent className="pl-2">
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={userData}
                  margin={{
                    top: 5,
                    right: 30,
                    left: 20,
                    bottom: 5,
                  }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="newUsers" stroke="hsl(var(--primary))" activeDot={{ r: 8 }} />
                  <Line type="monotone" dataKey="activeUsers" stroke="#82ca9d" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
          </div>

      {/* Course Categories and Recent Sales */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card 
          className="col-span-1 border-0 shadow-md transition-all duration-300 hover:shadow-lg"
          style={{
            transform: 'translateY(20px)',
            opacity: 0,
            animation: mounted ? 'fadeInUp 0.6s ease-out forwards 0.6s' : 'none',
            animationPlayState: (scrollY > 400) ? 'running' : 'paused'
          }}
        >
          <CardHeader>
            <CardTitle>Course Categories</CardTitle>
            <CardDescription>Distribution of courses by category</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  >
                    {categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card 
          className="col-span-1 border-0 shadow-md transition-all duration-300 hover:shadow-lg"
          style={{
            transform: 'translateY(20px)',
            opacity: 0,
            animation: mounted ? 'fadeInUp 0.6s ease-out forwards 0.7s' : 'none',
            animationPlayState: (scrollY > 400) ? 'running' : 'paused'
          }}
        >
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Recent Sales</CardTitle>
              <CardDescription>Recent course purchases</CardDescription>
            </div>
            <Button variant="outline" size="sm" className="transition-all duration-300 hover:scale-105 hover:bg-muted/50 active:scale-95">
              View All
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentSales.map((sale, index) => (
                <div 
                  key={sale.id} 
                  className="flex items-center gap-4 transform transition-all duration-300 hover:bg-muted/50 rounded-lg p-2"
                  style={{
                    opacity: mounted ? 1 : 0,
                    animationName: 'fadeIn',
                    animationDuration: '0.6s',
                    animationFillMode: 'both',
                    animationDelay: `${0.8 + index * 0.1}s`,
                    animationPlayState: (scrollY > 450) ? 'running' : 'paused'
                  }}
                >
                  <Avatar className="h-9 w-9 transition-transform duration-300 hover:scale-110">
                    <AvatarImage src={sale.avatar} alt={sale.user} />
                    <AvatarFallback>{sale.initials}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 space-y-1">
                    <p className="text-sm font-medium leading-none">{sale.user}</p>
                    <p className="text-sm text-muted-foreground">{sale.email}</p>
                  </div>
                  <div className="text-sm font-medium">${sale.amount}</div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity and Latest Courses */}
      <div className="grid gap-4 md:grid-cols-7">
        <Card 
          className="col-span-7 md:col-span-4 border-0 shadow-md transition-all duration-300 hover:shadow-lg"
          style={{
            transform: 'translateY(20px)',
            opacity: 0,
            animation: mounted ? 'fadeInUp 0.6s ease-out forwards 0.8s' : 'none',
            animationPlayState: (scrollY > 600) ? 'running' : 'paused'
          }}
        >
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Latest activities on the platform</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivity.map((activity, index) => (
                <div 
                  key={activity.id} 
                  className="flex items-start gap-4 rounded-lg border p-3 transition-all duration-300 hover:bg-muted/30 hover:shadow-sm"
                  style={{
                    opacity: mounted ? 1 : 0,
                    animationName: 'fadeIn',
                    animationDuration: '0.6s',
                    animationFillMode: 'both',
                    animationDelay: `${0.9 + index * 0.1}s`,
                    animationPlayState: (scrollY > 650) ? 'running' : 'paused'
                  }}
                >
                  <div className={`p-2 rounded-full ${activity.iconBg}`}>{activity.icon}</div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">{activity.title}</p>
                    <p className="text-sm text-muted-foreground">{activity.description}</p>
                  </div>
                  <p className="text-sm text-muted-foreground">{activity.time}</p>
          </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card 
          className="col-span-7 md:col-span-3 border-0 shadow-md transition-all duration-300 hover:shadow-lg"
          style={{
            transform: 'translateY(20px)',
            opacity: 0,
            animation: mounted ? 'fadeInUp 0.6s ease-out forwards 0.9s' : 'none',
            animationPlayState: (scrollY > 600) ? 'running' : 'paused'
          }}
        >
          <CardHeader>
            <CardTitle>Latest Courses</CardTitle>
            <CardDescription>Recently added courses</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {latestCourses.map((course, index) => (
                <div 
                  key={course.id} 
                  className="flex items-center gap-4 transition-all duration-300 hover:bg-muted/30 rounded-lg p-2"
                  style={{
                    opacity: mounted ? 1 : 0,
                    animationName: 'fadeIn',
                    animationDuration: '0.6s',
                    animationFillMode: 'both',
                    animationDelay: `${1.0 + index * 0.1}s`,
                    animationPlayState: (scrollY > 650) ? 'running' : 'paused'
                  }}
                >
                  <div className="relative w-16 h-16 rounded-md overflow-hidden">
                    <img
                      src={course.image || "/placeholder.svg"}
                      alt={course.title}
                      className="object-cover w-full h-full transition-transform duration-500 group-hover:scale-110"
                    />
          </div>
                  <div className="flex-1">
                    <h4 className="text-sm font-medium">{course.title}</h4>
                    <p className="text-xs text-muted-foreground">{course.instructor}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="outline" className="text-xs transition-colors">
                        {course.category}
                      </Badge>
                      <p className="text-xs text-muted-foreground">{course.date}</p>
        </div>
      </div>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="icon" className="h-8 w-8 transition-all duration-300 hover:scale-110 hover:bg-muted/50">
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8 transition-all duration-300 hover:scale-110 hover:bg-muted/50">
                      <Edit className="h-4 w-4" />
                    </Button>
          </div>
          </div>
              ))}
              <Button 
                variant="outline" 
                className="w-full transition-all duration-300 hover:scale-[1.02] hover:bg-muted/50 active:scale-95"
              >
                View All Courses
              </Button>
          </div>
          </CardContent>
        </Card>
      </div>

      {/* Pending Tasks */}
      <Card 
        className="border-0 shadow-md transition-all duration-300 hover:shadow-lg"
        style={{
          transform: 'translateY(20px)',
          opacity: 0,
          animation: mounted ? 'fadeInUp 0.6s ease-out forwards 1.0s' : 'none',
          animationPlayState: (scrollY > 800) ? 'running' : 'paused'
        }}
      >
        <CardHeader>
          <CardTitle>Pending Tasks</CardTitle>
          <CardDescription>Tasks that require your attention</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Task</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Priority</TableHead>
                <TableHead>Due Date</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {pendingTasks.map((task, index) => (
                <TableRow 
                  key={task.id}
                  className="transition-colors duration-300 hover:bg-muted/30"
                  style={{
                    opacity: mounted ? 1 : 0,
                    animationName: 'fadeIn',
                    animationDuration: '0.6s',
                    animationFillMode: 'both',
                    animationDelay: `${1.1 + index * 0.1}s`,
                    animationPlayState: (scrollY > 850) ? 'running' : 'paused'
                  }}
                >
                  <TableCell className="font-medium">{task.title}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className={task.statusColor}>
                      {task.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className={task.priorityColor}>
                      {task.priority}
                    </Badge>
                  </TableCell>
                  <TableCell>{task.dueDate}</TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="icon" className="transition-all duration-300 hover:scale-110 hover:bg-muted/50">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

// Sample data
const revenueData = [
  { name: "Jan", revenue: 4000 },
  { name: "Feb", revenue: 3000 },
  { name: "Mar", revenue: 2000 },
  { name: "Apr", revenue: 2780 },
  { name: "May", revenue: 1890 },
  { name: "Jun", revenue: 2390 },
  { name: "Jul", revenue: 3490 },
  { name: "Aug", revenue: 4000 },
  { name: "Sep", revenue: 5000 },
  { name: "Oct", revenue: 6000 },
  { name: "Nov", revenue: 7000 },
  { name: "Dec", revenue: 8000 },
];

const userData = [
  { name: "Jan", newUsers: 400, activeUsers: 2400 },
  { name: "Feb", newUsers: 300, activeUsers: 2210 },
  { name: "Mar", newUsers: 200, activeUsers: 2290 },
  { name: "Apr", newUsers: 278, activeUsers: 2000 },
  { name: "May", newUsers: 189, activeUsers: 2181 },
  { name: "Jun", newUsers: 239, activeUsers: 2500 },
  { name: "Jul", newUsers: 349, activeUsers: 2800 },
  { name: "Aug", newUsers: 430, activeUsers: 3000 },
  { name: "Sep", newUsers: 490, activeUsers: 3300 },
  { name: "Oct", newUsers: 500, activeUsers: 3500 },
  { name: "Nov", newUsers: 600, activeUsers: 3700 },
  { name: "Dec", newUsers: 750, activeUsers: 4000 },
];

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884D8", "#FF6B6B"];

const categoryData = [
  { name: "Web Development", value: 35 },
  { name: "Data Science", value: 25 },
  { name: "Business", value: 15 },
  { name: "Design", value: 10 },
  { name: "Marketing", value: 8 },
  { name: "Other", value: 7 },
];

const recentSales = [
  {
    id: 1,
    user: "Sarah Johnson",
    email: "sarah.j@example.com",
    amount: 129.99,
    avatar: "/placeholder.svg?height=36&width=36",
    initials: "SJ",
  },
  {
    id: 2,
    user: "Michael Chen",
    email: "michael.c@example.com",
    amount: 89.99,
    avatar: "/placeholder.svg?height=36&width=36",
    initials: "MC",
  },
  {
    id: 3,
    user: "Emily Rodriguez",
    email: "emily.r@example.com",
    amount: 149.99,
    avatar: "/placeholder.svg?height=36&width=36",
    initials: "ER",
  },
  {
    id: 4,
    user: "David Wilson",
    email: "david.w@example.com",
    amount: 69.99,
    avatar: "/placeholder.svg?height=36&width=36",
    initials: "DW",
  },
  {
    id: 5,
    user: "Jessica Lee",
    email: "jessica.l@example.com",
    amount: 99.99,
    avatar: "/placeholder.svg?height=36&width=36",
    initials: "JL",
  },
];

const recentActivity = [
  {
    id: 1,
    title: "New User Registration",
    description: "John Doe registered a new account",
    time: "5 min ago",
    icon: <Users className="h-4 w-4 text-blue-600" />,
    iconBg: "bg-blue-100",
  },
  {
    id: 2,
    title: "New Course Published",
    description: "Advanced React Development course is now live",
    time: "1 hour ago",
    icon: <BookOpen className="h-4 w-4 text-green-600" />,
    iconBg: "bg-green-100",
  },
  {
    id: 3,
    title: "Payment Received",
    description: "Received $149.99 for Data Science Bootcamp",
    time: "3 hours ago",
    icon: <DollarSign className="h-4 w-4 text-emerald-600" />,
    iconBg: "bg-emerald-100",
  },
  {
    id: 4,
    title: "Course Completed",
    description: "Sarah Johnson completed Web Development Bootcamp",
    time: "5 hours ago",
    icon: <CheckCircle className="h-4 w-4 text-purple-600" />,
    iconBg: "bg-purple-100",
  },
  {
    id: 5,
    title: "Refund Processed",
    description: "Processed refund for Michael Chen",
    time: "1 day ago",
    icon: <CreditCard className="h-4 w-4 text-red-600" />,
    iconBg: "bg-red-100",
  },
];

const latestCourses = [
  {
    id: 1,
    title: "Advanced React Development",
    instructor: "John Smith",
    category: "Web Development",
    date: "Added 2 days ago",
    image: "/placeholder.svg?height=64&width=64",
  },
  {
    id: 2,
    title: "Machine Learning Fundamentals",
    instructor: "Sarah Johnson",
    category: "Data Science",
    date: "Added 3 days ago",
    image: "/placeholder.svg?height=64&width=64",
  },
  {
    id: 3,
    title: "Digital Marketing Masterclass",
    instructor: "Emily Rodriguez",
    category: "Marketing",
    date: "Added 5 days ago",
    image: "/placeholder.svg?height=64&width=64",
  },
  {
    id: 4,
    title: "UI/UX Design Principles",
    instructor: "Michael Chen",
    category: "Design",
    date: "Added 1 week ago",
    image: "/placeholder.svg?height=64&width=64",
  },
];

const pendingTasks = [
  {
    id: 1,
    title: "Review new course submissions",
    status: "Pending",
    statusColor: "text-yellow-600 bg-yellow-100 border-yellow-200",
    priority: "High",
    priorityColor: "text-red-600 bg-red-100 border-red-200",
    dueDate: "Today",
  },
  {
    id: 2,
    title: "Update pricing for premium courses",
    status: "In Progress",
    statusColor: "text-blue-600 bg-blue-100 border-blue-200",
    priority: "Medium",
    priorityColor: "text-orange-600 bg-orange-100 border-orange-200",
    dueDate: "Tomorrow",
  },
  {
    id: 3,
    title: "Respond to support tickets",
    status: "Pending",
    statusColor: "text-yellow-600 bg-yellow-100 border-yellow-200",
    priority: "High",
    priorityColor: "text-red-600 bg-red-100 border-red-200",
    dueDate: "Today",
  },
  {
    id: 4,
    title: "Prepare monthly financial report",
    status: "Not Started",
    statusColor: "text-gray-600 bg-gray-100 border-gray-200",
    priority: "Medium",
    priorityColor: "text-orange-600 bg-orange-100 border-orange-200",
    dueDate: "3 days",
  },
  {
    id: 5,
    title: "Plan new instructor onboarding webinar",
    status: "In Progress",
    statusColor: "text-blue-600 bg-blue-100 border-blue-200",
    priority: "Low",
    priorityColor: "text-green-600 bg-green-100 border-green-200",
    dueDate: "Next week",
  },
];
