'use client';

import type React from "react";
import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import {
  BookOpen,
  Users,
  BarChart,
  FileText,
  MessageSquare,
  Bell,
  Search,
  Menu,
  LogOut,
  ChevronDown,
  Home,
  Medal,
  Image,
  DollarSign,
  Pencil,
  Upload,
  MessageCircle,
} from "lucide-react";
import { logout } from "@/utils/auth";
import { Toaster } from "sonner";

interface AdminLayoutProps {
  children: React.ReactNode;
}

interface NavigationItem {
  title: string;
  href: string;
  icon: React.ReactNode;
  exact?: boolean;
  badge?: string;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const pathname = usePathname();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const navigationItems: NavigationItem[] = [
    {
      title: "Dashboard",
      href: "/admin",
      icon: <BarChart className="h-5 w-5" />,
      exact: true,
    },
    {
      title: "Users",
      href: "/admin/users",
      icon: <Users className="h-5 w-5" />,
    },
    {
      title: "Courses",
      href: "/admin/courses",
      icon: <BookOpen className="h-5 w-5" />,
    },
    {
      title: "Achievements",
      href: "/admin/achievements",
      icon: <Medal className="h-5 w-5" />,
    },
    {
      title: "Comments",
      href: "/admin/comments",
      icon: <MessageSquare className="h-5 w-5" />,
    },
    {
      title: "Media",
      href: "/admin/media",
      icon: <Upload className="h-5 w-5" />,
    },
    {
      title: "Feedback",
      href: "/admin/feedback",
      icon: <MessageCircle className="h-5 w-5" />,
    },
  ];

  const isActive = (href: string, exact = false) => {
    if (exact) {
      return pathname === href;
      }
    return pathname.startsWith(href);
  };

  return (
    <div className="min-h-screen bg-muted/30 flex relative overflow-hidden">
      <Toaster position="top-right" richColors />
      {/* Animated background elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none -z-5">
        <div className="absolute top-1/4 -left-10 w-72 h-72 bg-primary/5 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob"></div>
        <div className="absolute bottom-1/4 right-20 w-72 h-72 bg-secondary/5 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000"></div>
        <div className="absolute top-2/3 left-1/3 w-72 h-72 bg-accent/5 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-4000"></div>
      </div>

      {/* Desktop Sidebar */}
      <aside
        className={`fixed inset-y-0 z-20 flex-col bg-background/95 backdrop-blur-sm border-r shadow-md hidden md:flex transition-all duration-300 ${
          isSidebarOpen ? "w-64" : "w-20"
        }`}
      >
        <div className="flex h-16 items-center border-b px-4">
          <Link href="/admin" className="flex items-center gap-2 transition-all duration-300 hover:scale-105">
            <BookOpen className="h-6 w-6 text-primary" />
            {isSidebarOpen && (
              <span className="text-xl font-bold animate-fade-in">
                Learning Platform
              </span>
            )}
          </Link>
          <Button 
            variant="ghost" 
            size="icon" 
            className="ml-auto transition-all duration-300 hover:bg-muted/80"
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          >
            <ChevronDown className={`h-5 w-5 transition-transform duration-300 ${isSidebarOpen ? "" : "rotate-180"}`} />
          </Button>
        </div>
        <div className="flex-1 overflow-auto py-4">
          <nav className="grid gap-1 px-2">
            {navigationItems.map((item, index) => (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-all duration-300 hover:scale-[1.02] ${
                  isActive(item.href, item.exact)
                    ? "bg-primary text-primary-foreground hover:bg-primary/90"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted"
                }`}
                style={{
                  opacity: mounted ? 1 : 0,
                  transform: mounted ? 'translateX(0)' : 'translateX(-10px)',
                  transitionDelay: `${150 + index * 50}ms`
                }}
              >
                {item.icon}
                {isSidebarOpen && (
                  <div className="flex-1 flex items-center justify-between">
                    <span>{item.title}</span>
                    {item.badge && (
                      <Badge variant="outline" className="ml-auto bg-primary/20 text-primary border-primary/20 animate-pulse">
                        {item.badge}
                      </Badge>
                    )}
                  </div>
                )}
              </Link>
            ))}
          </nav>
        </div>
        <div className="border-t p-4">
          {isSidebarOpen ? (
            <div className="flex items-center gap-3">
              <Avatar className="h-9 w-9 transition-transform duration-300 hover:scale-110">
                <AvatarImage src="/placeholder.svg?height=36&width=36" alt="Admin User" />
                <AvatarFallback>AD</AvatarFallback>
              </Avatar>
              <div className="flex-1 overflow-hidden">
                <p className="text-sm font-medium leading-none">Admin User</p>
                <p className="text-xs text-muted-foreground truncate">admin@example.com</p>
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 transition-all duration-300 hover:bg-muted"
                  >
                    <ChevronDown className="h-4 w-4" />
                    <span className="sr-only">Menu</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56 animate-fade-in-up">
                  <DropdownMenuLabel>My Account</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem 
                    className="transition-colors duration-200 cursor-pointer"
                    onClick={logout}
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    Log out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          ) : (
            <div className="flex justify-center">
              <Avatar className="h-9 w-9 transition-transform duration-300 hover:scale-110">
                <AvatarImage src="/placeholder.svg?height=36&width=36" alt="Admin User" />
                <AvatarFallback>AD</AvatarFallback>
              </Avatar>
            </div>
          )}
        </div>
      </aside>

      {/* Main Content */}
      <div className={`flex-1 md:ml-64 flex flex-col transition-all duration-300 ${isSidebarOpen ? "" : "md:ml-20"}`}>
        {/* Header */}
        <header className="sticky top-0 z-10 flex h-16 items-center gap-4 border-b bg-background/95 backdrop-blur-sm px-4 md:px-6 shadow-sm">
          <Button variant="ghost" size="icon" className="md:hidden transition-all duration-300 hover:bg-muted" asChild>
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="transition-all duration-300 hover:scale-110">
                  <Menu className="h-5 w-5" />
                  <span className="sr-only">Toggle Menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-72">
                <div className="flex h-16 items-center border-b px-4">
                  <Link href="/admin" className="flex items-center gap-2">
                    <BookOpen className="h-6 w-6 text-primary" />
                    <span className="text-xl font-bold">Learning Platform</span>
                  </Link>
                </div>
                <nav className="grid gap-2 p-4">
                  {navigationItems.map((item, i) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-all duration-300 hover:scale-[1.02] ${
                        isActive(item.href, item.exact)
                          ? "bg-primary text-primary-foreground hover:bg-primary/90"
                          : "text-muted-foreground hover:text-foreground hover:bg-muted"
                      }`}
                      style={{
                        animationName: 'fadeInUp',
                        animationDuration: '0.5s',
                        animationFillMode: 'both',
                        animationDelay: `${0.1 + i * 0.05}s`
                      }}
                    >
                      {item.icon}
                      <span>{item.title}</span>
                      {item.badge && (
                        <Badge variant="outline" className="ml-auto bg-primary/20 text-primary border-primary/20 animate-pulse">
                          {item.badge}
                        </Badge>
                      )}
                    </Link>
                  ))}
                </nav>
              </SheetContent>
            </Sheet>
          </Button>

          <div className="w-full flex items-center gap-4 md:gap-8">
            <Link 
              href="/" 
              className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors duration-300 hover:scale-105"
            >
              <Home className="h-4 w-4" />
              <span>View Site</span>
            </Link>

            <div className="relative hidden md:flex items-center flex-1 max-w-md">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search..."
                className="pl-8 bg-muted/50 border-none focus-visible:ring-1 transition-all duration-300 focus:scale-[1.01]"
              />
            </div>

            <div className="ml-auto flex items-center gap-4">
              <Button 
                variant="ghost" 
                size="icon" 
                className="relative transition-all duration-300 hover:bg-muted hover:scale-110"
              >
                <Bell className="h-5 w-5" />
                <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-primary animate-pulse"></span>
                <span className="sr-only">Notifications</span>
              </Button>

              <Separator orientation="vertical" className="h-8" />

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="gap-2 transition-all duration-300 hover:bg-muted"
                  >
                    <Avatar className="h-8 w-8 transition-transform duration-300 hover:scale-110">
                      <AvatarImage src="/placeholder.svg?height=32&width=32" alt="Admin User" />
                      <AvatarFallback>AD</AvatarFallback>
                    </Avatar>
                    <div className="hidden md:block text-sm font-normal">Admin User</div>
                    <ChevronDown className="h-4 w-4 text-muted-foreground" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="animate-fade-in-up">
                  <DropdownMenuLabel>My Account</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem 
                    className="transition-colors duration-200 cursor-pointer"
                    onClick={logout}
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    Log out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-4 md:p-6 animate-fade-in">
          {children}
        </main>

        {/* Footer */}
        <footer className="border-t py-4 px-6 text-center text-sm text-muted-foreground bg-background/80">
          <p>© 2024 Learning Platform Admin. All rights reserved.</p>
        </footer>
        </div>
    </div>
  );
}
