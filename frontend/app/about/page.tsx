'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function AboutUs() {
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
    <div className="min-h-screen overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none -z-5">
        <div className="absolute top-1/4 -left-10 w-72 h-72 bg-primary/10 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob"></div>
        <div className="absolute top-3/4 -right-10 w-96 h-96 bg-secondary/10 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000"></div>
        <div className="absolute bottom-1/4 left-1/3 w-72 h-72 bg-accent/10 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-4000"></div>
      </div>

      {/* Hero Section */}
      <section className="relative py-20 bg-gradient-to-r from-primary to-primary/80 text-primary-foreground">
        <div className="container mx-auto px-4 text-center">
          <div 
            className="max-w-3xl mx-auto transform transition-all duration-700 opacity-0 translate-y-8"
            style={{
              animationName: mounted ? 'fadeInUp' : 'none',
              animationDuration: '0.6s',
              animationFillMode: 'forwards'
            }}
          >
            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl mb-6">
              About SkillShare
            </h1>
            <p className="text-xl text-primary-foreground/90 max-w-3xl mx-auto">
              Empowering learners through accessible, engaging, and effective educational experiences.
            </p>
          </div>
        </div>
        <div className="absolute bottom-0 inset-x-0 h-16 bg-background transform skew-y-3 -translate-y-8"></div>
      </section>

      {/* Mission Statement */}
      <section className="py-16 bg-background overflow-hidden">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
            <div 
              className="transform transition-all duration-700 opacity-0 translate-y-8"
              style={{
                animationName: mounted ? 'fadeInUp' : 'none',
                animationDuration: '0.6s',
                animationFillMode: 'forwards',
                animationDelay: '0.2s',
                animationPlayState: (scrollY > 100) ? 'running' : 'paused'
              }}
            >
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl mb-6">
                Our Mission
              </h2>
              <p className="text-lg text-muted-foreground mb-4">
                At SkillShare, we believe that education should be accessible to everyone, regardless of their background or circumstances. 
                Our mission is to create a platform that democratizes learning and makes quality education available to all.
              </p>
              <p className="text-lg text-muted-foreground">
                Through innovative teaching methods, engaging content, and a supportive community, 
                we aim to inspire a lifelong love of learning in our users.
              </p>
            </div>
            <div 
              className="relative transform transition-all duration-700 opacity-0 translate-x-8"
              style={{
                animationName: mounted ? 'fadeInUp' : 'none',
                animationDuration: '0.6s',
                animationFillMode: 'forwards',
                animationDelay: '0.4s',
                animationPlayState: (scrollY > 100) ? 'running' : 'paused'
              }}
            >
              <div className="rounded-lg shadow-lg overflow-hidden transition-all duration-300 hover:shadow-xl">
                <Image 
                  src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1200&q=80" 
                  alt="Students collaborating" 
                  width={600} 
                  height={400}
                  className="object-cover w-full h-full"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="bg-muted/30 py-16">
        <div className="container mx-auto px-4 text-center">
          <div 
            className="transform transition-all duration-700 opacity-0 translate-y-8"
            style={{
              animationName: mounted ? 'fadeInUp' : 'none',
              animationDuration: '0.6s',
              animationFillMode: 'forwards',
              animationDelay: '0.2s',
              animationPlayState: (scrollY > 400) ? 'running' : 'paused'
            }}
          >
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl mb-4">
              Meet Our Team
            </h2>
            <p className="max-w-3xl mx-auto text-lg text-muted-foreground mb-12">
              Passionate educators and technologists committed to transforming online learning.
            </p>
          </div>
          
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {/* Team Member 1 */}
            <Card 
              className="border-0 shadow-md overflow-hidden transition-all duration-500 hover:scale-[1.03] hover:shadow-lg"
              style={{
                transform: 'translateY(20px)',
                opacity: 0,
                animation: mounted ? 'fadeInUp 0.6s ease-out forwards 0.3s' : 'none',
                animationPlayState: (scrollY > 450) ? 'running' : 'paused'
              }}
            >
              <div className="h-64 overflow-hidden">
                <Image 
                  src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=600&q=80" 
                  alt="Jane Doe" 
                  width={400} 
                  height={300}
                  className="object-cover w-full h-full transition-transform duration-500 group-hover:scale-110"
                />
              </div>
              <CardContent className="p-6">
                <h3 className="text-xl font-medium mb-1">Jane Doe</h3>
                <Badge variant="outline" className="mb-3">Founder & CEO</Badge>
                <p className="text-muted-foreground">
                  Former educator with 10+ years of experience in educational technology.
                </p>
              </CardContent>
            </Card>
            
            {/* Team Member 2 */}
            <Card 
              className="border-0 shadow-md overflow-hidden transition-all duration-500 hover:scale-[1.03] hover:shadow-lg"
              style={{
                transform: 'translateY(20px)',
                opacity: 0,
                animation: mounted ? 'fadeInUp 0.6s ease-out forwards 0.4s' : 'none',
                animationPlayState: (scrollY > 450) ? 'running' : 'paused'
              }}
            >
              <div className="h-64 overflow-hidden">
                <Image 
                  src="https://images.unsplash.com/photo-1560250097-0b93528c311a?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=600&q=80" 
                  alt="John Smith" 
                  width={400} 
                  height={300}
                  className="object-cover w-full h-full transition-transform duration-500 group-hover:scale-110"
                />
              </div>
              <CardContent className="p-6">
                <h3 className="text-xl font-medium mb-1">John Smith</h3>
                <Badge variant="outline" className="mb-3">CTO</Badge>
                <p className="text-muted-foreground">
                  Tech enthusiast with a background in building scalable educational platforms.
                </p>
              </CardContent>
            </Card>
            
            {/* Team Member 3 */}
            <Card 
              className="border-0 shadow-md overflow-hidden transition-all duration-500 hover:scale-[1.03] hover:shadow-lg"
              style={{
                transform: 'translateY(20px)',
                opacity: 0,
                animation: mounted ? 'fadeInUp 0.6s ease-out forwards 0.5s' : 'none',
                animationPlayState: (scrollY > 450) ? 'running' : 'paused'
              }}
            >
              <div className="h-64 overflow-hidden">
                <Image 
                  src="https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=600&q=80" 
                  alt="Alice Johnson" 
                  width={400} 
                  height={300}
                  className="object-cover w-full h-full transition-transform duration-500 group-hover:scale-110"
                />
              </div>
              <CardContent className="p-6">
                <h3 className="text-xl font-medium mb-1">Alice Johnson</h3>
                <Badge variant="outline" className="mb-3">Lead Curriculum Designer</Badge>
                <p className="text-muted-foreground">
                  Instructional design expert focused on creating engaging learning experiences.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Values Section with Image Background */}
      <section className="py-16 relative">
        <div className="absolute inset-0 z-0">
          <Image
            src="https://images.unsplash.com/photo-1523240795612-9a054b0db644?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1920&q=80"
            alt="Background"
            fill
            className="object-cover brightness-[0.25]"
          />
        </div>
        <div className="container mx-auto px-4 relative z-10">
          <div 
            className="transform transition-all duration-700 opacity-0 translate-y-8 text-center"
            style={{
              animationName: mounted ? 'fadeInUp' : 'none',
              animationDuration: '0.6s',
              animationFillMode: 'forwards',
              animationDelay: '0.2s',
              animationPlayState: (scrollY > 800) ? 'running' : 'paused'
            }}
          >
            <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl mb-12">
              Our Values
            </h2>
          </div>
          
          <div className="grid gap-8 grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
            {/* Value 1 */}
            <Card 
              className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm border-0 shadow-md transition-all duration-500 hover:shadow-lg hover:translate-y-[-4px]"
              style={{
                transform: 'translateY(20px)',
                opacity: 0,
                animation: mounted ? 'fadeInUp 0.6s ease-out forwards 0.3s' : 'none',
                animationPlayState: (scrollY > 850) ? 'running' : 'paused'
              }}
            >
              <CardContent className="p-6">
                <div className="h-12 w-12 bg-primary rounded-md flex items-center justify-center text-primary-foreground mb-4 shadow-md">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium mb-2">Innovation</h3>
                <p className="text-muted-foreground">
                  We continuously explore new ways to enhance the learning experience.
                </p>
              </CardContent>
            </Card>
            
            {/* Value 2 */}
            <Card 
              className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm border-0 shadow-md transition-all duration-500 hover:shadow-lg hover:translate-y-[-4px]"
              style={{
                transform: 'translateY(20px)',
                opacity: 0,
                animation: mounted ? 'fadeInUp 0.6s ease-out forwards 0.4s' : 'none',
                animationPlayState: (scrollY > 850) ? 'running' : 'paused'
              }}
            >
              <CardContent className="p-6">
                <div className="h-12 w-12 bg-primary rounded-md flex items-center justify-center text-primary-foreground mb-4 shadow-md">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium mb-2">Community</h3>
                <p className="text-muted-foreground">
                  We foster a supportive environment where learners can connect and grow together.
                </p>
              </CardContent>
            </Card>
            
            {/* Value 3 */}
            <Card 
              className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm border-0 shadow-md transition-all duration-500 hover:shadow-lg hover:translate-y-[-4px]"
              style={{
                transform: 'translateY(20px)',
                opacity: 0,
                animation: mounted ? 'fadeInUp 0.6s ease-out forwards 0.5s' : 'none',
                animationPlayState: (scrollY > 850) ? 'running' : 'paused'
              }}
            >
              <CardContent className="p-6">
                <div className="h-12 w-12 bg-primary rounded-md flex items-center justify-center text-primary-foreground mb-4 shadow-md">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium mb-2">Accessibility</h3>
                <p className="text-muted-foreground">
                  We believe quality education should be accessible to everyone, regardless of background.
                </p>
              </CardContent>
            </Card>
            
            {/* Value 4 */}
            <Card 
              className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm border-0 shadow-md transition-all duration-500 hover:shadow-lg hover:translate-y-[-4px]"
              style={{
                transform: 'translateY(20px)',
                opacity: 0,
                animation: mounted ? 'fadeInUp 0.6s ease-out forwards 0.6s' : 'none',
                animationPlayState: (scrollY > 850) ? 'running' : 'paused'
              }}
            >
              <CardContent className="p-6">
                <div className="h-12 w-12 bg-primary rounded-md flex items-center justify-center text-primary-foreground mb-4 shadow-md">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium mb-2">Excellence</h3>
                <p className="text-muted-foreground">
                  We are committed to providing high-quality content and exceptional learning experiences.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
      
      {/* Stats Section */}
      <section className="py-16 bg-background">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card 
              className="border-0 shadow-md transition-all duration-300 hover:shadow-lg hover:scale-[1.02]"
              style={{
                transform: 'translateY(20px)',
                opacity: 0,
                animation: mounted ? 'fadeInUp 0.6s ease-out forwards 0.3s' : 'none',
                animationPlayState: (scrollY > 1200) ? 'running' : 'paused'
              }}
            >
              <CardContent className="p-8 flex flex-col items-center justify-center text-center">
                <div className="text-5xl font-bold text-primary mb-4">50,000+</div>
                <div className="text-xl text-muted-foreground">Students</div>
              </CardContent>
            </Card>
            
            <Card 
              className="border-0 shadow-md transition-all duration-300 hover:shadow-lg hover:scale-[1.02]"
              style={{
                transform: 'translateY(20px)',
                opacity: 0,
                animation: mounted ? 'fadeInUp 0.6s ease-out forwards 0.4s' : 'none',
                animationPlayState: (scrollY > 1200) ? 'running' : 'paused'
              }}
            >
              <CardContent className="p-8 flex flex-col items-center justify-center text-center">
                <div className="text-5xl font-bold text-primary mb-4">200+</div>
                <div className="text-xl text-muted-foreground">Courses</div>
              </CardContent>
            </Card>
            
            <Card 
              className="border-0 shadow-md transition-all duration-300 hover:shadow-lg hover:scale-[1.02]"
              style={{
                transform: 'translateY(20px)',
                opacity: 0,
                animation: mounted ? 'fadeInUp 0.6s ease-out forwards 0.5s' : 'none',
                animationPlayState: (scrollY > 1200) ? 'running' : 'paused'
              }}
            >
              <CardContent className="p-8 flex flex-col items-center justify-center text-center">
                <div className="text-5xl font-bold text-primary mb-4">95%</div>
                <div className="text-xl text-muted-foreground">Satisfaction Rate</div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
      
      {/* Our Story Section */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
            <div 
              className="lg:order-2 transform transition-all duration-700 opacity-0 translate-y-8"
              style={{
                animationName: mounted ? 'fadeInUp' : 'none',
                animationDuration: '0.6s',
                animationFillMode: 'forwards',
                animationDelay: '0.2s',
                animationPlayState: (scrollY > 1500) ? 'running' : 'paused'
              }}
            >
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl mb-6">
                Our Story
              </h2>
              <p className="text-lg text-muted-foreground mb-4">
                SkillShare began with a simple idea: to make quality education accessible to everyone. 
                Founded in 2018 by a group of passionate educators and technologists, we've grown from 
                a small startup to a thriving platform serving students worldwide.
              </p>
              <p className="text-lg text-muted-foreground">
                Our journey has been defined by a commitment to innovation and a deep belief in the 
                transformative power of education. We continually evolve our platform based on student 
                feedback and emerging educational research.
              </p>
              <div className="mt-8">
                <Button 
                  className="transition-all duration-300 hover:scale-105 hover:shadow-md active:scale-95"
                >
                  Join Our Journey
                </Button>
              </div>
            </div>
            <div 
              className="lg:order-1 transform transition-all duration-700 opacity-0 translate-x-8"
              style={{
                animationName: mounted ? 'fadeInUp' : 'none',
                animationDuration: '0.6s',
                animationFillMode: 'forwards',
                animationDelay: '0.4s',
                animationPlayState: (scrollY > 1500) ? 'running' : 'paused'
              }}
            >
              <div className="rounded-lg shadow-lg overflow-hidden transition-all duration-300 hover:shadow-xl">
                <Image 
                  src="https://images.unsplash.com/photo-1542744173-8e7e53415bb0?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1200&q=80" 
                  alt="Our team at work" 
                  width={600} 
                  height={400}
                  className="object-cover w-full h-full rounded-lg"
                />
              </div>
            </div>
          </div>
        </div>
      </section>
      
      {/* CTA Section */}
      <section className="py-16 bg-primary text-primary-foreground">
        <div 
          className="container mx-auto px-4 text-center transform transition-all duration-700 opacity-0"
          style={{
            animationName: mounted ? 'fadeIn' : 'none',
            animationDuration: '0.8s',
            animationFillMode: 'forwards',
            animationDelay: '0.2s',
            animationPlayState: (scrollY > 1800) ? 'running' : 'paused'
          }}
        >
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl mb-6">
            Ready to Start Your Learning Journey?
          </h2>
          <p className="text-xl text-primary-foreground/90 max-w-3xl mx-auto mb-8">
            Join thousands of students who are transforming their lives through education.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              variant="secondary"
              size="lg"
              className="px-8 transition-all duration-300 hover:scale-105 active:scale-95"
            >
              Explore Courses
            </Button>
            <Button
              variant="outline"
              size="lg"
              className="px-8 bg-transparent border-primary-foreground text-primary-foreground hover:bg-primary-foreground/10 transition-all duration-300 hover:scale-105 active:scale-95"
            >
              Contact Us
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
} 