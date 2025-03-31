/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable react/no-unescaped-entities */
'use client';

import { useState, useEffect, useCallback, useRef } from "react";
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { BookOpen, Clock, Award, ChevronRight, Star, Search } from "lucide-react"
import useEmblaCarousel from "embla-carousel-react";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselPrevious,
  CarouselNext,
} from "@/components/ui/carousel";

// Define the CarouselApi type
type CarouselApi = ReturnType<typeof useEmblaCarousel>[1];

// Images for the carousel
const courseImages = [
  {
    src: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?ixlib=rb-4.0.3",
    alt: "Students collaborating in a modern classroom",
    caption: "Real-world collaboration skills",
  },
  {
    src: "https://images.unsplash.com/photo-1524178232363-1fb2b075b655?ixlib=rb-4.0.3",
    alt: "Student studying on laptop with notes",
    caption: "Flexible learning environments",
  },
  {
    src: "https://images.unsplash.com/photo-1523240795612-9a054b0db644?ixlib=rb-4.0.3",
    alt: "Online education session with instructor",
    caption: "Expert-led instruction",
  },
  {
    src: "https://images.unsplash.com/photo-1531482615713-2afd69097998?ixlib=rb-4.0.3",
    alt: "Classroom learning environment with students",
    caption: "Community-focused education",
  },
];

export default function HomePage() {
  const [activeSlide, setActiveSlide] = useState(0);
  const [carouselApi, setCarouselApi] = useState<CarouselApi>();
  const [isLoading, setIsLoading] = useState(true);
  const [isPaused, setIsPaused] = useState(false);
  const autoRotateRef = useRef<number | null>(null);
  const [scrollY, setScrollY] = useState(0);
  const [mounted, setMounted] = useState(false);

  // Update scroll position for parallax effects
  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY);
    };
    setMounted(true); // Set mounted after initial render
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Update current slide when carousel changes
  useEffect(() => {
    if (!carouselApi) return;
    const onSelect = () => {
      setActiveSlide(carouselApi.selectedScrollSnap());
    };
    carouselApi.on("select", onSelect);
    onSelect(); // Initial call
    return () => {
      carouselApi.off("select", onSelect);
    };
  }, [carouselApi]);

  // Auto rotate slides
  useEffect(() => {
    if (!carouselApi || isPaused) return;
    if (autoRotateRef.current) {
      clearInterval(autoRotateRef.current);
    }
    autoRotateRef.current = window.setInterval(() => {
      if (activeSlide === courseImages.length - 1) {
        carouselApi.scrollTo(0);
      } else {
        carouselApi.scrollNext();
      }
    }, 5000); // Change image every 5 seconds
    return () => {
      if (autoRotateRef.current) {
        clearInterval(autoRotateRef.current);
        autoRotateRef.current = null;
      }
    };
  }, [carouselApi, activeSlide, isPaused]);

  // Reset loading state when images are loaded
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000);
    return () => clearTimeout(timer);
  }, []);

  // Handler for indicator clicks
  const scrollToSlide = useCallback(
    (index: number) => {
      if (!carouselApi) return;
      carouselApi.scrollTo(index);
    },
    [carouselApi]
  );

  // Pause auto-rotation on hover
  const handleMouseEnter = useCallback(() => {
    setIsPaused(true);
  }, []);

  const handleMouseLeave = useCallback(() => {
    setIsPaused(false);
  }, []);

  return (
    <div className="flex flex-col min-h-screen relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none -z-5">
        <div className="absolute top-1/4 -left-10 w-72 h-72 bg-primary/10 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob"></div>
        <div className="absolute top-3/4 -right-10 w-96 h-96 bg-secondary/10 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000"></div>
        <div className="absolute bottom-1/4 left-1/3 w-72 h-72 bg-accent/10 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-4000"></div>
      </div>

      <main>
      {/* Hero Section */}
        <section className="relative py-20 md:py-32 bg-gradient-to-r from-primary/10 via-primary/5 to-background overflow-hidden">
          <div
            className="absolute inset-0 opacity-20"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000000' fill-opacity='0.05'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
              transform: `translateY(${scrollY * 0.1}px)`
            }}
          ></div>
          <div className="container flex flex-col md:flex-row items-center gap-8">
            <div className="flex-1 space-y-6 transform transition-all duration-700 opacity-0 translate-y-8 animate-fade-in-up">
              <Badge variant="outline" className="px-3 py-1 text-sm">
                Over 1,000+ courses available
              </Badge>
              <h1 className="text-4xl md:text-6xl font-bold tracking-tight">
                Unlock Your Potential With Expert-Led Courses
                </h1>
              <p className="text-xl text-muted-foreground max-w-[600px]">
                Discover courses taught by industry experts and advance your career with hands-on projects and
                certificates.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 pt-4">
                <Button
                  size="lg"
                  className="px-8 transition-all duration-300 hover:scale-105 hover:shadow-lg active:scale-95"
                >
                  Explore Courses
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="px-8 transition-all duration-300 hover:scale-105 hover:bg-muted/50 active:scale-95"
                >
                  View Categories
                </Button>
                  </div>
              <div className="flex items-center gap-8 pt-6">
                <div className="flex flex-col">
                  <span className="text-2xl font-bold">10K+</span>
                  <span className="text-sm text-muted-foreground">Students</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-2xl font-bold">1K+</span>
                  <span className="text-sm text-muted-foreground">Courses</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-2xl font-bold">200+</span>
                  <span className="text-sm text-muted-foreground">Instructors</span>
                </div>
              </div>
            </div>
            <div className="flex-1 relative transform transition-all duration-700 opacity-0 translate-x-8 animate-fade-in-up animation-delay-300">
              {/* Image Carousel */}
              <div
                className="relative rounded-lg overflow-hidden shadow-2xl"
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
              >
                <Carousel
                  opts={{
                    loop: true,
                    align: "start",
                  }}
                  className={`w-full ${isLoading ? 'opacity-90' : 'opacity-100'} transition-opacity duration-500`}
                  setApi={setCarouselApi}
                >
                  <CarouselContent>
                    {courseImages.map((image, index) => (
                      <CarouselItem key={index} className="relative">
                        <img
                          src={image.src}
                          alt={image.alt}
                          onLoad={() => index === 0 && setIsLoading(false)}
                          className={`w-full h-[300px] md:h-[400px] object-cover transition-all duration-300 ${
                            activeSlide === index ? 'opacity-100 scale-100' : 'opacity-90 scale-[1.02]'
                          }`}
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-50"></div>
                        <div className="absolute bottom-0 left-0 right-0 p-4 md:p-6 transform transition-all duration-500" style={{
                          transform: activeSlide === index ? 'translateY(0)' : 'translateY(10px)',
                          opacity: activeSlide === index ? 1 : 0
                        }}>
                          <h3 className="text-white text-lg md:text-xl font-semibold">{image.alt}</h3>
                          <p className="text-white/80 text-sm md:text-base">{image.caption}</p>
                        </div>
                      </CarouselItem>
                    ))}
                  </CarouselContent>

                  <CarouselPrevious className="absolute left-2 top-1/2 -translate-y-1/2 z-10 h-8 w-8 opacity-70 hover:opacity-100 transition-opacity" />
                  <CarouselNext className="absolute right-2 top-1/2 -translate-y-1/2 z-10 h-8 w-8 opacity-70 hover:opacity-100 transition-opacity" />

                  <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-2">
                    {courseImages.map((_, index) => (
                      <button
                        key={index}
                        onClick={() => scrollToSlide(index)}
                        className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${
                          activeSlide === index ? "bg-white scale-110" : "bg-white/50"
                        }`}
                        aria-label={`Go to slide ${index + 1}`}
                      />
                    ))}
                </div>
                </Carousel>
              </div>
              <div className="absolute -bottom-6 -left-6 bg-background rounded-lg p-4 shadow-lg z-10 transform transition hover:scale-105 duration-300">
                <div className="flex items-center gap-3">
                  <div className="bg-primary/10 p-3 rounded-full">
                    <Award className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium">Certified Courses</p>
                    <p className="text-sm text-muted-foreground">Industry recognized</p>
            </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Categories Section */}
        <section className="py-16 bg-muted/30 relative">
          <div className="container">
            <div className="flex flex-col md:flex-row justify-between items-center mb-12">
              <div className="transform transition-all duration-700 opacity-0 translate-y-8"
                   style={{animationName: mounted ? 'fadeInUp' : 'none',
                          animationDuration: '0.6s',
                          animationFillMode: 'forwards',
                          animationDelay: '0.1s',
                          animationPlayState: (scrollY > 100) ? 'running' : 'paused'}}>
                <h2 className="text-3xl font-bold tracking-tight">Browse Top Categories</h2>
                <p className="text-muted-foreground mt-2">Explore our most popular course categories</p>
              </div>
              <Button
                variant="ghost"
                className="mt-4 md:mt-0 transform transition-all duration-700 opacity-0 translate-y-8 hover:scale-105"
                style={{animationName: mounted ? 'fadeInUp' : 'none',
                       animationDuration: '0.6s',
                       animationFillMode: 'forwards',
                       animationDelay: '0.3s',
                       animationPlayState: (scrollY > 100) ? 'running' : 'paused'}}
              >
                View All Categories <ChevronRight className="ml-2 h-4 w-4" />
              </Button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {categories.map((category, i) => (
                <Card
                  key={category.name}
                  className="group hover:shadow-md transition-all duration-300 hover:scale-[1.03] border-0 shadow-lg"
                  style={{
                    transform: 'translateY(20px)',
                    opacity: 0,
                    animation: mounted ? `fadeInUp 0.6s ease-out forwards ${0.2 + i * 0.1}s` : 'none',
                    animationPlayState: (scrollY > 200) ? 'running' : 'paused'
                  }}
                >
                  <CardHeader className="pb-2">
                    <div className="bg-primary/10 p-3 w-fit rounded-lg mb-3 group-hover:bg-primary/20 transition-colors duration-300">{category.icon}</div>
                    <CardTitle className="text-xl group-hover:text-primary transition-colors">
                      {category.name}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription>{category.courses} courses</CardDescription>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Featured Courses */}
        <section className="py-16 relative">
          <div className="container">
            <div className="flex flex-col md:flex-row justify-between items-center mb-12">
              <div className="transform transition-all duration-700 opacity-0 translate-y-8"
                   style={{animationName: mounted ? 'fadeInUp' : 'none',
                          animationDuration: '0.6s',
                          animationFillMode: 'forwards',
                          animationDelay: '0.1s',
                          animationPlayState: (scrollY > 500) ? 'running' : 'paused'}}>
                <h2 className="text-3xl font-bold tracking-tight">Featured Courses</h2>
                <p className="text-muted-foreground mt-2">Learn from industry experts and advance your skills</p>
        </div>
              <Tabs
                defaultValue="popular"
                className="mt-4 md:mt-0 transform transition-all duration-700 opacity-0 translate-y-8"
                style={{animationName: mounted ? 'fadeInUp' : 'none',
                       animationDuration: '0.6s',
                       animationFillMode: 'forwards',
                       animationDelay: '0.3s',
                       animationPlayState: (scrollY > 500) ? 'running' : 'paused'}}
              >
                <TabsList>
                  <TabsTrigger value="popular" className="transition-all hover:bg-muted/80">Popular</TabsTrigger>
                  <TabsTrigger value="trending" className="transition-all hover:bg-muted/80">Trending</TabsTrigger>
                  <TabsTrigger value="new" className="transition-all hover:bg-muted/80">New</TabsTrigger>
                </TabsList>
              </Tabs>
      </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {courses.map((course, i) => (
                <Card
                  key={course.title}
                  className="overflow-hidden group transition-all duration-300 hover:shadow-lg hover:scale-[1.02] border-0 shadow-md"
                  style={{
                    transform: 'translateY(20px)',
                    opacity: 0,
                    animation: mounted ? `fadeInUp 0.6s ease-out forwards ${0.2 + i * 0.1}s` : 'none',
                    animationPlayState: (scrollY > 600) ? 'running' : 'paused'
                  }}
                >
                  <div className="relative overflow-hidden">
                    <img
                      src={course.image}
                      alt={course.title}
                      className="w-full h-48 object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                    <Badge className="absolute top-3 right-3 transition-transform duration-300 group-hover:scale-110">{course.level}</Badge>
                </div>
                  <CardHeader>
                    <div className="flex justify-between items-center">
                      <Badge variant="outline" className="bg-primary/10 hover:bg-primary/20 transition-colors">
                        {course.category}
                      </Badge>
                      <div className="flex items-center">
                        <Star className="h-4 w-4 text-warning-yellow fill-warning-yellow" /> {/* Use theme color */}
                        <span className="ml-1 text-sm font-medium">{course.rating}</span>
                </div>
              </div>
                    <CardTitle className="text-xl mt-2 group-hover:text-primary transition-colors">
                      {course.title}
                    </CardTitle>
                    <CardDescription className="line-clamp-2">{course.description}</CardDescription>
                  </CardHeader>
                  <CardFooter className="border-t pt-4 flex justify-between">
                    <div className="flex items-center text-sm text-muted-foreground">
                      <Clock className="mr-1 h-4 w-4" />
                      {course.duration}
                    </div>
                    <div className="font-bold text-lg">{course.price === 0 ? "Free" : `$${course.price}`}</div>
                  </CardFooter>
                </Card>
              ))}
            </div>

            <div className="flex justify-center mt-12">
              <Button
                size="lg"
                className="transform transition-all duration-300 hover:scale-105 hover:shadow-md active:scale-95"
                style={{
                  transform: 'translateY(20px)',
                  opacity: 0,
                  animation: mounted ? 'fadeInUp 0.6s ease-out forwards 0.6s' : 'none',
                  animationPlayState: (scrollY > 800) ? 'running' : 'paused'
                }}
              >
                Explore All Courses <ChevronRight className="ml-2 h-4 w-4" />
              </Button>
                </div>
              </div>
        </section>

        {/* Testimonials */}
        <section className="py-16 bg-muted/30">
          <div className="container">
            <div className="text-center mb-12 transform transition-all duration-700 opacity-0 translate-y-8"
                 style={{animationName: mounted ? 'fadeInUp' : 'none',
                        animationDuration: '0.6s',
                        animationFillMode: 'forwards',
                        animationPlayState: (scrollY > 900) ? 'running' : 'paused'}}>
              <h2 className="text-3xl font-bold tracking-tight">What Our Students Say</h2>
              <p className="text-muted-foreground mt-2 max-w-2xl mx-auto">
                Thousands of students have transformed their careers with our courses. Here's what they have to say.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {testimonials.map((testimonial, i) => (
                <Card
                  key={i}
                  className="bg-background transition-all duration-300 hover:shadow-lg hover:scale-[1.03] border-0 shadow-md"
                  style={{
                    transform: 'translateY(20px)',
                    opacity: 0,
                    animation: mounted ? `fadeInUp 0.6s ease-out forwards ${0.3 + i * 0.1}s` : 'none',
                    animationPlayState: (scrollY > 1000) ? 'running' : 'paused'
                  }}
                >
                  <CardHeader>
                    <div className="flex items-center gap-4">
                      <img
                        src={testimonial.avatar}
                        alt={testimonial.name}
                        className="rounded-full w-12 h-12 object-cover transition-transform duration-300 hover:scale-110"
                      />
                <div>
                        <CardTitle className="text-lg">{testimonial.name}</CardTitle>
                        <CardDescription>{testimonial.role}</CardDescription>
                </div>
              </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex mb-2">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="h-4 w-4 text-warning-yellow fill-warning-yellow" />
                      ))}
                    </div>
                    <p className="text-muted-foreground italic">"{testimonial.text}"</p>
                  </CardContent>
                  <CardFooter className="text-sm text-muted-foreground">Course: {testimonial.course}</CardFooter>
                </Card>
              ))}
            </div>
          </div>
        </section>

      {/* CTA Section */}
        <section className="py-20 bg-primary text-primary-foreground relative overflow-hidden">
          <div className="absolute inset-0 bg-[url('/noise.svg')] opacity-5 mix-blend-overlay"></div>
          <div
            className="absolute -top-[500px] -right-[500px] w-[1000px] h-[1000px] bg-primary-foreground/5 rounded-full blur-3xl"
            style={{
              transform: `scale(${1 + scrollY * 0.0005}) translateY(${scrollY * 0.05}px)`
            }}
          ></div>
          <div className="container relative z-10">
            <div className="flex flex-col md:flex-row items-center justify-between gap-8 transform transition-all duration-700 opacity-0"
                 style={{animationName: mounted ? 'fadeIn' : 'none',
                        animationDuration: '0.8s',
                        animationFillMode: 'forwards',
                        animationPlayState: (scrollY > 1200) ? 'running' : 'paused'}}>
              <div className="max-w-2xl">
                <h2 className="text-3xl font-bold tracking-tight">Ready to Start Your Learning Journey?</h2>
                <p className="mt-4 text-primary-foreground/80">
                  Join thousands of students who are already learning and advancing their careers with our expert-led
                  courses.
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-4">
                <Button
                  size="lg"
                  variant="secondary"
                  className="px-8 transition-all duration-300 hover:scale-105 active:scale-95"
              >
                Browse Courses
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="bg-transparent border-primary-foreground text-primary-foreground hover:bg-primary-foreground/10 px-8 transition-all duration-300 hover:scale-105 active:scale-95"
                >
                  Sign Up Free
                </Button>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

// Sample data (Defined outside the component)
const categories = [
  { name: "Web Development", courses: 120, icon: <BookOpen className="h-5 w-5 text-primary" /> },
  { name: "Data Science", courses: 85, icon: <BookOpen className="h-5 w-5 text-primary" /> },
  { name: "Business", courses: 95, icon: <BookOpen className="h-5 w-5 text-primary" /> },
  { name: "Design", courses: 75, icon: <BookOpen className="h-5 w-5 text-primary" /> },
  { name: "Marketing", courses: 65, icon: <BookOpen className="h-5 w-5 text-primary" /> },
  { name: "Photography", courses: 40, icon: <BookOpen className="h-5 w-5 text-primary" /> },
  { name: "Music", courses: 35, icon: <BookOpen className="h-5 w-5 text-primary" /> },
  { name: "Health & Fitness", courses: 50, icon: <BookOpen className="h-5 w-5 text-primary" /> },
];

const courses = [
  {
    title: "Complete Web Development Bootcamp",
    description: "Learn HTML, CSS, JavaScript, React, Node.js and more to become a full-stack web developer.",
    image: "https://images.unsplash.com/photo-1498050108023-c5249f4df085?ixlib=rb-4.0.3",
    category: "Web Development",
    level: "Beginner",
    duration: "12 weeks",
    rating: 4.9,
    price: 89.99,
  },
  {
    title: "Data Science Fundamentals",
    description: "Master the basics of data science, including Python, statistics, and machine learning algorithms.",
    image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?ixlib=rb-4.0.3",
    category: "Data Science",
    level: "Intermediate",
    duration: "8 weeks",
    rating: 4.7,
    price: 79.99,
  },
  {
    title: "UI/UX Design Masterclass",
    description:
      "Learn the principles of user interface and user experience design to create beautiful, functional products.",
    image: "https://images.unsplash.com/photo-1561070791-2526d30994b5?ixlib=rb-4.0.3",
    category: "Design",
    level: "All Levels",
    duration: "6 weeks",
    rating: 4.8,
    price: 69.99,
  },
  {
    title: "Digital Marketing Strategy",
    description: "Develop comprehensive digital marketing strategies to grow your business online.",
    image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?ixlib=rb-4.0.3",
    category: "Marketing",
    level: "Beginner",
    duration: "4 weeks",
    rating: 4.6,
    price: 59.99,
  },
  {
    title: "Introduction to Python Programming",
    description: "Learn the basics of Python programming language and start building your own applications.",
    image: "https://images.unsplash.com/photo-1526379095098-d400fd0bf935?ixlib=rb-4.0.3",
    category: "Programming",
    level: "Beginner",
    duration: "5 weeks",
    rating: 4.9,
    price: 0,
  },
  {
    title: "Business Analytics & Intelligence",
    description: "Learn how to analyze business data and make data-driven decisions to improve performance.",
    image: "https://images.unsplash.com/photo-1552664730-d307ca884978?ixlib=rb-4.0.3",
    category: "Business",
    level: "Advanced",
    duration: "10 weeks",
    rating: 4.7,
    price: 99.99,
  },
];

const testimonials = [
  {
    name: "Sarah Johnson",
    role: "Web Developer",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-4.0.3",
    text: "The web development bootcamp completely transformed my career. I went from knowing nothing about coding to landing a job as a junior developer in just 3 months!",
    course: "Complete Web Development Bootcamp",
  },
  {
    name: "Michael Chen",
    role: "Data Analyst",
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?ixlib=rb-4.0.3",
    text: "The data science course was exactly what I needed to transition into analytics. The instructor was knowledgeable and the projects were practical and relevant.",
    course: "Data Science Fundamentals",
  },
  {
    name: "Emily Rodriguez",
    role: "UX Designer",
    avatar: "https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?ixlib=rb-4.0.3",
    text: "I've taken many design courses, but this one stands out. The curriculum is comprehensive and the feedback from instructors helped me improve my portfolio significantly.",
    course: "UI/UX Design Masterclass",
  },
];
