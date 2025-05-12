'use client';

import type React from "react";
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Checkbox } from "@/components/ui/checkbox";
import { Slider } from "@/components/ui/slider";
import { Separator } from "@/components/ui/separator";
import { BookOpen, Star, Search, ChevronRight, Bookmark, BarChart, LogIn } from "lucide-react";

// Course interface
interface Course {
  id: string;
  title: string;
  description: string;
  thumbnailUrl: string;
  price: number;
  category: string;
  isPublished?: boolean;
  published?: boolean;
  level?: string;
  duration?: string;
  rating?: number;
  reviews?: number;
  students?: number;
  instructor: {
    id: string;
    username: string;
  };
  isBestseller?: boolean;
  isNew?: boolean;
}

// Example category structure for UI
const exampleCategories = [
  { name: "Web Development", courses: 0, icon: <BookOpen className="h-4 w-4 text-primary" /> },
  { name: "Data Science", courses: 0, icon: <BookOpen className="h-4 w-4 text-primary" /> },
  { name: "Business", courses: 0, icon: <BookOpen className="h-4 w-4 text-primary" /> },
  { name: "Design", courses: 0, icon: <BookOpen className="h-4 w-4 text-primary" /> },
  { name: "Marketing", courses: 0, icon: <BookOpen className="h-4 w-4 text-primary" /> },
];

export default function CoursesPage() {
  // State
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedLevel, setSelectedLevel] = useState<string[]>([]);
  const [priceRange, setPriceRange] = useState([0, 200]);
  const [sortOption, setSortOption] = useState("popular");
  const router = useRouter();

  // Fetch courses on component mount
  useEffect(() => {
    fetchCourses();
  }, []);

  // Handle course click with authentication check
  const handleCourseClick = (e: React.MouseEvent, courseId: string) => {
    e.preventDefault();
    
    // Check if user is authenticated (using localStorage token as a simple check)
    const token = localStorage.getItem('token');
    
    if (!token) {
      // If not authenticated, store the intended destination and redirect to login
      localStorage.setItem('redirectAfterLogin', `/courses/${courseId}`);
      router.push('/login');
      return;
    }
    
    // If authenticated, navigate to the course details page
    router.push(`/courses/${courseId}`);
  };

  // Fetch courses from API
  const fetchCourses = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await fetch('http://localhost:8080/api/courses');
      if (!response.ok) {
        throw new Error(`Failed to fetch courses: ${response.status}`);
      }
      const data = await response.json();
      
      // Only show published courses to users
      const publishedCourses = data.filter((course: Course) => 
        course.isPublished === true || course.published === true
      );
      
      // Add UI data for display
      const coursesWithUIData = publishedCourses.map((course: Course) => ({
        ...course,
        level: course.level || ['Beginner', 'Intermediate', 'Advanced', 'All Levels'][Math.floor(Math.random() * 4)],
        duration: course.duration || `${Math.floor(Math.random() * 15) + 1} hours`,
        rating: course.rating || (Math.random() * (5 - 3.5) + 3.5).toFixed(1),
        reviews: course.reviews || Math.floor(Math.random() * 3000),
        students: course.students || Math.floor(Math.random() * 150000),
        isBestseller: course.isBestseller ?? Math.random() > 0.8,
        isNew: course.isNew ?? Math.random() > 0.9,
      }));
      
      setCourses(coursesWithUIData);
    } catch (err) {
      console.error('Error fetching courses:', err);
      setError(err instanceof Error ? err.message : 'Error connecting to server');
    } finally {
      setLoading(false);
    }
  };

  // Derive categories for filter UI
  const categoriesForFilter = exampleCategories.map(cat => {
    const count = courses.filter(c => c.category === cat.name).length;
    return {...cat, courses: count};
  });

  // Filtering logic
  const filteredCourses = courses.filter((course) => {
    // Filter by search query
    if (searchQuery && !(course.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         course.description.toLowerCase().includes(searchQuery.toLowerCase()))) {
      return false;
    }

    // Filter by category
    if (selectedCategory && course.category !== selectedCategory) {
      return false;
    }

    // Filter by level
    if (selectedLevel.length > 0 && course.level && !selectedLevel.includes(course.level)) {
      return false;
    }

    // Filter by price range
    if (course.price < priceRange[0] || course.price > priceRange[1]) {
      return false;
    }

    return true;
  });

  // Sorting logic
  const sortedCourses = [...filteredCourses].sort((a, b) => {
    const studentsA = a.students ?? 0;
    const studentsB = b.students ?? 0;
    const ratingA = a.rating ?? 0;
    const ratingB = b.rating ?? 0;
    const priceA = a.price ?? 0;
    const priceB = b.price ?? 0;
    const isNewA = a.isNew ?? false;
    const isNewB = b.isNew ?? false;

    switch (sortOption) {
      case "popular":
        return studentsB - studentsA;
      case "newest":
        if (isNewA && !isNewB) return -1;
        if (!isNewA && isNewB) return 1;
        return 0;
      case "highest-rated":
        return ratingB - ratingA;
      case "price-low":
        return priceA - priceB;
      case "price-high":
        return priceB - priceA;
      default:
        return 0;
    }
  });

  // Handlers
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
  };

  const handleLevelChange = (level: string) => {
    setSelectedLevel((prev) => (prev.includes(level) ? prev.filter((l) => l !== level) : [...prev, level]));
  };

  const resetFilters = () => {
    setSearchQuery("");
    setSelectedCategory(null);
    setSelectedLevel([]);
    setPriceRange([0, 200]);
    setSortOption("popular");
  };

  // Loading state
  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary dark:border-primary-foreground"></div>
      </div>
    );
  }

  // Main component return
  return (
    <div className="dark:bg-background">
      {/* Hero Section */}
      <section className="bg-primary/10 py-12">
        <div className="container">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-3xl md:text-4xl font-bold mb-4 text-foreground">Explore Our Courses</h1>
            <p className="text-muted-foreground mb-8">
              Discover thousands of courses taught by expert instructors to help you advance your skills and achieve
              your goals.
            </p>
            <div className="relative max-w-xl mx-auto">
              <form onSubmit={handleSearch}>
                <Input
                  type="search"
                  placeholder="Search for courses..."
                  className="pl-10 pr-4 h-12 rounded-full"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                <Search className="absolute left-3 top-3.5 h-5 w-5 text-muted-foreground" />
                <Button type="submit" className="absolute right-1 top-1 rounded-full h-10">
                  Search
                </Button>
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* Error display */}
      {error && (
        <div className="container py-4">
          <div className="bg-destructive/10 border border-destructive text-destructive px-4 py-3 rounded relative">
            {error}
          </div>
        </div>
      )}

      {/* Main Content Section */}
      <section className="py-12">
        <div className="container">
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Sidebar - Filters */}
            <div className="w-full lg:w-1/4 space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-foreground">Filters</h2>
                <Button variant="ghost" size="sm" onClick={resetFilters}>
                  Reset
                </Button>
              </div>

              <Accordion type="multiple" defaultValue={["category", "level", "price"]} className="w-full">
                {/* Category Filter */}
                <AccordionItem value="category">
                  <AccordionTrigger className="text-base font-medium text-foreground">Category</AccordionTrigger>
                  <AccordionContent>
                    <div className="space-y-2 pt-1">
                      {categoriesForFilter.map((category) => (
                        <div
                          key={category.name}
                          className={`flex items-center px-3 py-2 rounded-md cursor-pointer transition-colors ${
                            selectedCategory === category.name ? "bg-primary/10 text-primary" : "hover:bg-muted"
                          }`}
                          onClick={() => setSelectedCategory(selectedCategory === category.name ? null : category.name)}
                        >
                          <div className="flex-1 flex items-center">
                            {category.icon}
                            <span className="ml-2 text-sm">{category.name}</span>
                          </div>
                          <span className="text-xs text-muted-foreground">({category.courses})</span>
                        </div>
                      ))}
                    </div>
                  </AccordionContent>
                </AccordionItem>

                {/* Level Filter */}
                <AccordionItem value="level">
                  <AccordionTrigger className="text-base font-medium text-foreground">Level</AccordionTrigger>
                  <AccordionContent>
                    <div className="space-y-2 pt-1">
                      {["Beginner", "Intermediate", "Advanced", "All Levels"].map((level) => (
                        <div key={level} className="flex items-center space-x-2">
                          <Checkbox
                            id={`level-${level}`}
                            checked={selectedLevel.includes(level)}
                            onCheckedChange={() => handleLevelChange(level)}
                          />
                          <label
                            htmlFor={`level-${level}`}
                            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer text-foreground"
                          >
                            {level}
                          </label>
                        </div>
                      ))}
                    </div>
                  </AccordionContent>
                </AccordionItem>

                {/* Price Filter */}
                <AccordionItem value="price">
                  <AccordionTrigger className="text-base font-medium text-foreground">Price</AccordionTrigger>
                  <AccordionContent>
                    <div className="space-y-4 pt-2 px-1">
                      <div className="flex items-center justify-between">
                        <div className="bg-muted px-2 py-1 rounded text-sm text-muted-foreground">${priceRange[0]}</div>
                        <div className="bg-muted px-2 py-1 rounded text-sm text-muted-foreground">${priceRange[1]}</div>
                      </div>
                      <Slider
                        defaultValue={[0, 200]}
                        max={200}
                        step={5}
                        value={priceRange}
                        onValueChange={setPriceRange}
                        className="[&>span:first-child]:h-1 [&>span:first-child_span]:bg-primary"
                      />
                      <div className="flex items-center space-x-2 pt-2">
                        <Checkbox
                          id="free-courses"
                          checked={priceRange[0] === 0 && priceRange[1] === 0}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              setPriceRange([0, 0])
                            } else {
                              setPriceRange([0, 200])
                            }
                          }}
                        />
                        <label
                          htmlFor="free-courses"
                          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer text-foreground"
                        >
                          Free Courses Only
                        </label>
                      </div>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>

              {/* Featured Course */}
              <div className="mt-8 border rounded-lg overflow-hidden bg-card">
                <div className="bg-primary/10 p-4">
                  <h3 className="font-semibold text-card-foreground">Featured Course</h3>
                </div>
                <div className="p-4">
                  <div className="aspect-video rounded-md overflow-hidden mb-3 bg-muted">
                    <img
                      src="/placeholder.svg?height=200&width=350"
                      alt="Featured course"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <h4 className="font-medium mb-1 text-card-foreground">Complete Web Development Bootcamp</h4>
                  <p className="text-sm text-muted-foreground mb-2">Learn full-stack web development from scratch</p>
                  <div className="flex items-center text-sm mb-3">
                    <Star className="h-4 w-4 text-yellow-500 fill-yellow-500 mr-1" />
                    <span className="font-medium mr-1 text-card-foreground">4.9</span>
                    <span className="text-muted-foreground">(2,500+ reviews)</span>
                  </div>
                  <Button className="w-full">View Course</Button>
                </div>
              </div>
            </div>

            {/* Main Content - Course Listings */}
            <div className="w-full lg:w-3/4">
              {/* Sorting and Results Info */}
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
                <div>
                  <h2 className="text-xl font-semibold text-foreground">{sortedCourses.length} courses available</h2>
                  {(searchQuery ||
                    selectedCategory ||
                    selectedLevel.length > 0 ||
                    priceRange[0] > 0 ||
                    priceRange[1] < 200) && (
                    <p className="text-sm text-muted-foreground">
                      Showing filtered results
                      {selectedCategory && (
                        <span>
                          {" "}
                          in <span className="font-medium">{selectedCategory}</span>
                        </span>
                      )}
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <Select value={sortOption} onValueChange={setSortOption}>
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Sort by" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="popular">Most Popular</SelectItem>
                      <SelectItem value="newest">Newest</SelectItem>
                      <SelectItem value="highest-rated">Highest Rated</SelectItem>
                      <SelectItem value="price-low">Price: Low to High</SelectItem>
                      <SelectItem value="price-high">Price: High to Low</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Course Grid */}
              {sortedCourses.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {sortedCourses.map((course) => (
                    <div key={course.id}>
                      <Card
                        onClick={(e) => handleCourseClick(e, course.id)}
                        className="overflow-hidden group transition-all hover:shadow-md bg-card cursor-pointer"
                      >
                        <div className="relative">
                          <img
                            src={course.thumbnailUrl || "/placeholder.svg"}
                            alt={course.title}
                            className="w-full aspect-video object-cover"
                          />
                          <>
                            {course.isBestseller && (
                              <Badge className="absolute top-3 left-3 bg-yellow-500 hover:bg-yellow-600">
                                Bestseller
                              </Badge>
                            )}
                            {course.isNew && !course.isBestseller && <Badge className="absolute top-3 left-3">New</Badge>}
                            {course.level && (
                              <Badge
                                variant="outline"
                                className="absolute top-3 right-3 bg-background/80 hover:bg-background"
                              >
                                {course.level}
                              </Badge>
                            )}
                          </>
                        </div>
                        <CardHeader className="pb-2">
                          <div className="flex justify-between items-start">
                            <Badge variant="outline" className="bg-primary/10 hover:bg-primary/20">
                              {course.category}
                            </Badge>
                            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={(e) => { e.preventDefault(); }}>
                              <Bookmark className="h-4 w-4" />
                              <span className="sr-only">Save course</span>
                            </Button>
                          </div>
                          <CardTitle className="text-lg mt-2 line-clamp-2 group-hover:text-primary transition-colors text-card-foreground">
                            {course.title}
                          </CardTitle>
                          <CardDescription className="line-clamp-2">{course.description}</CardDescription>
                        </CardHeader>
                        <CardContent className="pb-2">
                          <div className="flex items-center text-sm mb-1">
                            <span className="font-medium mr-1 text-card-foreground">{course.instructor?.username || 'System'}</span>
                            <span className="text-muted-foreground">• Instructor</span>
                          </div>
                        </CardContent>
                        <Separator />
                        <CardFooter className="flex justify-between py-4">
                          <div className="font-bold text-lg text-card-foreground">
                            {course.price === 0 ? "Free" : `$${course.price.toFixed(2)}`}
                          </div>
                          <div className="flex items-center gap-2">
                            <LogIn className="h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                            <span className="text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity">Login to View</span>
                          </div>
                        </CardFooter>
                      </Card>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 border rounded-lg bg-muted/30">
                  <BarChart className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium mb-2 text-foreground">No courses found</h3>
                  <p className="text-muted-foreground mb-6">We could not find any courses matching your filters.</p>
                  <Button onClick={resetFilters}>Reset Filters</Button>
                </div>
              )}

              {/* Pagination */}
              {sortedCourses.length > 0 && (
                <div className="flex justify-center mt-12">
                  <div className="flex items-center space-x-2">
                    <Button variant="outline" size="icon" disabled>
                      <ChevronRight className="h-4 w-4 rotate-180" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-8 w-8 p-0 font-medium bg-primary text-primary-foreground hover:bg-primary/90"
                    >
                      1
                    </Button>
                    <Button variant="outline" size="icon">
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-primary/10 py-16">
        <div className="container">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl font-bold mb-4 text-foreground">Become an Instructor</h2>
            <p className="text-muted-foreground mb-8 max-w-2xl mx-auto">
              Join our community of expert instructors and share your knowledge with students around the world. Create
              engaging courses and earn revenue.
            </p>
            <Button size="lg">Start Teaching Today</Button>
          </div>
        </div>
      </section>
    </div>
  );
}
