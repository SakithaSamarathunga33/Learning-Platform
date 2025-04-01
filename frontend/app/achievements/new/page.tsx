'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import AchievementUpload from '@/components/AchievementUpload';
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { TrophyIcon, AlertCircle } from "lucide-react";

export default function NewAchievementPage() {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [scrollY, setScrollY] = useState(0);

  // Update scroll position for parallax effects
  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login?redirect=/achievements/new');
    } else {
      setIsAuthenticated(true);
    }
  }, [router]);

  if (isAuthenticated === null) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none -z-5">
        <div className="absolute top-1/4 -left-10 w-72 h-72 bg-primary/10 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob"></div>
        <div className="absolute top-3/4 -right-10 w-96 h-96 bg-secondary/10 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000"></div>
        <div className="absolute bottom-1/4 left-1/3 w-72 h-72 bg-accent/10 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-4000"></div>
      </div>

      {/* Header Section */}
      <section className="relative py-12 md:py-16 bg-gradient-to-r from-primary/10 via-primary/5 to-background overflow-hidden">
        <div
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000000' fill-opacity='0.05'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
            transform: `translateY(${scrollY * 0.1}px)`
          }}
        ></div>
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center mb-4 transform transition-all duration-700 opacity-0 translate-y-8 animate-fade-in-up">
            <div className="flex justify-center mb-4">
              <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                <TrophyIcon className="h-6 w-6 text-primary" />
              </div>
            </div>
            <Badge variant="outline" className="px-3 py-1 text-sm mb-3">
              Achievement Showcase
            </Badge>
            <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">
              Share Your Achievement
            </h1>
            <p className="text-lg text-muted-foreground max-w-[600px] mx-auto">
              Share your educational milestones with the community. Upload an image and tell everyone about your learning journey.
            </p>
          </div>
        </div>
      </section>

      <section className="container mx-auto px-4 py-8">
        <Card className="mx-auto max-w-3xl bg-card border shadow-md rounded-xl overflow-hidden">
          <CardContent className="p-0">
            <div className="bg-muted/40 p-4 border-b flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">
                Images should be related to your educational achievement. Inappropriate content will be removed.
              </p>
            </div>
            <div className="p-6">
              <AchievementUpload />
            </div>
          </CardContent>
        </Card>
      </section>
    </div>
  );
} 