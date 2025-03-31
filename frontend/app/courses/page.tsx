'use client';

import type React from "react";
import { useState, useEffect } from 'react';
// import Image from 'next/image'; // Removed unused import
import Link from 'next/link';
// import { useRouter, useSearchParams } from "next/navigation"; // Removed unused imports
import { Button } from "@/components/ui/button"; // Corrected path
import { Input } from "@/components/ui/input"; // Corrected path
import { Badge } from "@/components/ui/badge"; // Corrected path
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"; // Corrected path
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"; // Corrected path
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"; // Corrected path
import { Checkbox } from "@/components/ui/checkbox"; // Corrected path
import { Slider } from "@/components/ui/slider"; // Corrected path
import { Separator } from "@/components/ui/separator"; // Corrected path
// Removed Navbar import, handled in layout
import { BookOpen, Star, Search, ChevronRight, Bookmark, BarChart } from "lucide-react"; // Removed unused Clock, Play, Users icons

// Your existing Course interface
interface Course {
  id: string;
  title: string;
  description: string;
  thumbnailUrl: string; // Use this instead of 'image' from example
  price: number;
  category: string;
  isPublished?: boolean;
  published?: boolean;
  level?: string; // Added from example data structure for filtering
  duration?: string; // Added from example data structure for filtering
  rating?: number; // Added from example data structure for filtering/display
  reviews?: number; // Added from example data structure for display
  students?: number; // Added from example data structure for sorting/display
  instructor: {
    id: string;
    username: string; // Use this instead of 'instructor' string from example
  };
  isBestseller?: boolean; // Added from example data structure
  isNew?: boolean; // Added from example data structure
}

// Example category structure for UI - adapt if needed or derive dynamically
const exampleCategories = [
  { name: "Web Development", courses: 0, icon: <BookOpen className="h-4 w-4 text-primary" /> },
  { name: "Data Science", courses: 0, icon: <BookOpen className="h-4 w-4 text-primary" /> },
  { name: "Business", courses: 0, icon: <BookOpen className="h-4 w-4 text-primary" /> },
  { name: "Design", courses: 0, icon: <BookOpen className="h-4 w-4 text-primary" /> },
  { name: "Marketing", courses: 0, icon: <BookOpen className="h-4 w-4 text-primary" /> },
  // Add more categories as needed or derive dynamically
];

export default function CoursesPage() {
  // Your existing state
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');
  // Keep selectedCategory, but maybe initialize differently if needed by new UI
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null); // Changed from 'all' to null to match example logic

  // State from example UI
  // const router = useRouter(); // Removed unused variable
  // const searchParams = useSearchParams(); // Removed unused variable
  const [selectedLevel, setSelectedLevel] = useState<string[]>([]);
  const [priceRange, setPriceRange] = useState([0, 200]); // Default range, adjust as needed
  const [sortOption, setSortOption] = useState("popular");
  // const [hoveredCourse, setHoveredCourse] = useState<string | null>(null); // Removed unused state

  // Your existing useEffect and fetchCourses
  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    setLoading(true); // Ensure loading is true at the start
    setError(''); // Reset error
    try {
      const response = await fetch('http://localhost:8080/api/courses');
      if (!response.ok) {
        throw new Error(`Failed to fetch courses: ${response.status}`);
      }
      const data = await response.json();
      const publishedCourses = data.filter((course: Course) =>
        course.isPublished === true || course.published === true
      );
      // Add dummy data for fields missing in your DB model but used in UI example
      const coursesWithUIData = publishedCourses.map((course: Course) => ({
        ...course,
        level: course.level || ['Beginner', 'Intermediate', 'Advanced', 'All Levels'][Math.floor(Math.random() * 4)], // Example: Assign random level
        duration: course.duration || `${Math.floor(Math.random() * 15) + 1} hours`, // Example: Assign random duration
        rating: course.rating || (Math.random() * (5 - 3.5) + 3.5).toFixed(1), // Example: Assign random rating
        reviews: course.reviews || Math.floor(Math.random() * 3000), // Example: Assign random reviews
        students: course.students || Math.floor(Math.random() * 150000), // Example: Assign random students
        isBestseller: course.isBestseller ?? Math.random() > 0.8, // Example: Assign random bestseller status
        isNew: course.isNew ?? Math.random() > 0.9, // Example: Assign random new status
      }));
      setCourses(coursesWithUIData);
    } catch (err) {
      console.error('Error fetching courses:', err);
      setError(err instanceof Error ? err.message : 'Error connecting to server');
    } finally {
      setLoading(false);
    }
  };

  // Derive categories for filter UI (using example structure for now)
  // You might want to fetch categories separately or derive from fetched courses more robustly
  const categoriesForFilter = exampleCategories.map(cat => {
      const count = courses.filter(c => c.category === cat.name).length;
      return {...cat, courses: count};
  });

  // Filtering logic from example, adapted for your 'courses' state
  const filteredCourses = courses.filter((course) => {
    // Filter by search query (using your existing state)
    if (searchQuery && !(course.title.toLowerCase().includes(searchQuery.toLowerCase()) || course.description.toLowerCase().includes(searchQuery.toLowerCase()))) {
      return false;
    }

    // Filter by category (using your existing state, adapted type)
    if (selectedCategory && course.category !== selectedCategory) {
      return false;
    }

    // Filter by level (using example state)
    // Ensure your Course type has 'level' or adapt this
    if (selectedLevel.length > 0 && course.level && !selectedLevel.includes(course.level)) {
      return false;
    }

    // Filter by price range (using example state)
    if (course.price < priceRange[0] || course.price > priceRange[1]) {
      return false;
    }

    return true;
  });

  // Sorting logic from example
  const sortedCourses = [...filteredCourses].sort((a, b) => {
    // Ensure properties exist before sorting
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
         // Simple sort: new items first. Adjust if you have actual date field
        if (isNewA && !isNewB) return -1;
        if (!isNewA && isNewB) return 1;
        return 0; // Or sort by ID/date if available
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

  // Handlers from example UI
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // Optional: Update URL query params if needed
    // router.push(`/courses?search=${searchQuery}`);
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

  // Your existing loading state display
  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary dark:border-primary-foreground"></div> {/* Adjusted colors */}
      </div>
    );
  }

  // Main component return with new UI structure
  return (
    // Removed min-h-screen flex flex-col as layout handles this
    <div className="dark:bg-background"> {/* Use theme background */}
      {/* Removed Navbar - Handled by layout */}

      {/* Hero Section from example */}
      <section className="bg-primary/10 py-12">
        <div className="container">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-3xl md:text-4xl font-bold mb-4 text-foreground">Explore Our Courses</h1> {/* Use theme text */}
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
                  onChange={(e) => setSearchQuery(e.target.value)} // Use your state setter
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

      {/* Your existing error display */}
      {error && (
        <div className="container py-4">
          <div className="bg-destructive/10 border border-destructive text-destructive px-4 py-3 rounded relative"> {/* Use theme destructive colors */}
            {error}
          </div>
        </div>
      )}

      {/* Main Content Section from example */}
      <section className="py-12">
        <div className="container">
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Sidebar - Filters from example */}
            <div className="w-full lg:w-1/4 space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-foreground">Filters</h2> {/* Use theme text */}
                <Button variant="ghost" size="sm" onClick={resetFilters}>
                  Reset
                </Button>
              </div>

              <Accordion type="multiple" defaultValue={["category", "level", "price"]} className="w-full">
                {/* Category Filter */}
                <AccordionItem value="category">
                  <AccordionTrigger className="text-base font-medium text-foreground">Category</AccordionTrigger> {/* Use theme text */}
                  <AccordionContent>
                    <div className="space-y-2 pt-1">
                      {/* Use derived categories */}
                      {categoriesForFilter.map((category) => (
                        <div
                          key={category.name}
                          className={`flex items-center px-3 py-2 rounded-md cursor-pointer transition-colors ${
                            selectedCategory === category.name ? "bg-primary/10 text-primary" : "hover:bg-muted"
                          }`}
                          onClick={() => setSelectedCategory(selectedCategory === category.name ? null : category.name)} // Use your state setter
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
                  <AccordionTrigger className="text-base font-medium text-foreground">Level</AccordionTrigger> {/* Use theme text */}
                  <AccordionContent>
                    <div className="space-y-2 pt-1">
                      {["Beginner", "Intermediate", "Advanced", "All Levels"].map((level) => (
                        <div key={level} className="flex items-center space-x-2">
                          <Checkbox
                            id={`level-${level}`}
                            checked={selectedLevel.includes(level)}
                            onCheckedChange={() => handleLevelChange(level)} // Use example handler
                          />
                          <label
                            htmlFor={`level-${level}`}
                            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer text-foreground" /* Use theme text */
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
                  <AccordionTrigger className="text-base font-medium text-foreground">Price</AccordionTrigger> {/* Use theme text */}
                  <AccordionContent>
                    <div className="space-y-4 pt-2 px-1">
                      <div className="flex items-center justify-between">
                        <div className="bg-muted px-2 py-1 rounded text-sm text-muted-foreground">${priceRange[0]}</div>
                        <div className="bg-muted px-2 py-1 rounded text-sm text-muted-foreground">${priceRange[1]}</div>
                      </div>
                      <Slider
                        defaultValue={[0, 200]}
                        max={200} // Adjust max based on your course prices
                        step={5}
                        value={priceRange}
                        onValueChange={setPriceRange} // Use example state setter
                        className="[&>span:first-child]:h-1 [&>span:first-child_span]:bg-primary" // Style slider
                      />
                      <div className="flex items-center space-x-2 pt-2">
                        <Checkbox
                          id="free-courses"
                          checked={priceRange[0] === 0 && priceRange[1] === 0}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              setPriceRange([0, 0])
                            } else {
                              // Reset to max range, adjust if needed
                              setPriceRange([0, 200])
                            }
                          }}
                        />
                        <label
                          htmlFor="free-courses"
                          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer text-foreground" /* Use theme text */
                        >
                          Free Courses Only
                        </label>
                      </div>
                    </div>
                  </AccordionContent>
                </AccordionItem>

                {/* Duration Filter (Optional - Add state/logic if needed) */}
                <AccordionItem value="duration">
                  <AccordionTrigger className="text-base font-medium text-foreground">Duration</AccordionTrigger> {/* Use theme text */}
                  <AccordionContent>
                    <div className="space-y-2 pt-1">
                      {["0-2 hours", "3-6 hours", "7-16 hours", "17+ hours"].map((duration) => (
                        <div key={duration} className="flex items-center space-x-2">
                          <Checkbox id={`duration-${duration}`} /> {/* Add state/handler if implementing */}
                          <label
                            htmlFor={`duration-${duration}`}
                            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer text-foreground" /* Use theme text */
                          >
                            {duration}
                          </label>
                        </div>
                      ))}
                    </div>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>

              {/* Featured Course (Static example - replace or remove) */}
              <div className="mt-8 border rounded-lg overflow-hidden bg-card"> {/* Use theme card bg */}
                <div className="bg-primary/10 p-4">
                  <h3 className="font-semibold text-card-foreground">Featured Course</h3> {/* Use theme card text */}
                </div>
                <div className="p-4">
                  <div className="aspect-video rounded-md overflow-hidden mb-3 bg-muted"> {/* Placeholder bg */}
                    {/* Replace with dynamic image if needed */}
                    <img
                      src="/placeholder.svg?height=200&width=350" // Placeholder
                      alt="Featured course"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <h4 className="font-medium mb-1 text-card-foreground">Complete Web Development Bootcamp</h4> {/* Use theme card text */}
                  <p className="text-sm text-muted-foreground mb-2">Learn full-stack web development from scratch</p>
                  <div className="flex items-center text-sm mb-3">
                    <Star className="h-4 w-4 text-yellow-500 fill-yellow-500 mr-1" />
                    <span className="font-medium mr-1 text-card-foreground">4.9</span> {/* Use theme card text */}
                    <span className="text-muted-foreground">(2,500+ reviews)</span>
                  </div>
                  <Button className="w-full">View Course</Button>
                </div>
              </div>
            </div>

            {/* Main Content - Course Listings from example */}
            <div className="w-full lg:w-3/4">
              {/* Sorting and Results Info */}
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
                <div>
                  {/* Use sortedCourses length */}
                  <h2 className="text-xl font-semibold text-foreground">{sortedCourses.length} courses available</h2> {/* Use theme text */}
                  {(searchQuery ||
                    selectedCategory ||
                    selectedLevel.length > 0 ||
                    priceRange[0] > 0 ||
                    priceRange[1] < 200) && ( // Adjust max price if needed
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
                  <Select value={sortOption} onValueChange={setSortOption}> {/* Use example state/setter */}
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
                  {/* Consider a mobile filter trigger if needed */}
                  {/* <Button variant="outline" size="icon" className="lg:hidden">
                    <Filter className="h-4 w-4" />
                  </Button> */}
                </div>
              </div>

              {/* Course Grid - Map over sortedCourses */}
              {sortedCourses.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {sortedCourses.map((course) => (
                    // Use Link component for navigation
                    <Link href={`/courses/${course.id}`} key={course.id} passHref>
                      <Card
                        // key={course.id} // Key is now on Link
                        className="overflow-hidden group transition-all hover:shadow-md bg-card" // Use theme card bg
                        // Removed hover state handlers as overlay is removed
                        // onMouseEnter={() => setHoveredCourse(course.id)}
                        // onMouseLeave={() => setHoveredCourse(null)}
                      >
                        <div className="relative">
                          {/* Use your thumbnailUrl */}
                          <img
                            src={course.thumbnailUrl || "/placeholder.svg"} // Fallback image
                            alt={course.title}
                            className="w-full aspect-video object-cover"
                          />
                          {/* Removed hover play button overlay */}
                          {/* Display badges directly */}
                          <>
                            {/* Use your data fields or example fields */}
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
                          {/* End of direct badge display */}
                        </div>
                        <CardHeader className="pb-2">
                          <div className="flex justify-between items-start">
                            {/* Use your category */}
                            <Badge variant="outline" className="bg-primary/10 hover:bg-primary/20">
                              {course.category}
                            </Badge>
                            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={(e) => { e.preventDefault(); /* Add bookmark logic */ }}>
                              <Bookmark className="h-4 w-4" />
                              <span className="sr-only">Save course</span>
                            </Button>
                          </div>
                          {/* Use your title */}
                          <CardTitle className="text-lg mt-2 line-clamp-2 group-hover:text-primary transition-colors text-card-foreground"> {/* Use theme card text */}
                            {course.title}
                          </CardTitle>
                          {/* Use your description */}
                          <CardDescription className="line-clamp-2">{course.description}</CardDescription>
                        </CardHeader>
                        <CardContent className="pb-2">
                          <div className="flex items-center text-sm mb-1">
                            {/* Use your instructor username */}
                            <span className="font-medium mr-1 text-card-foreground">{course.instructor?.username || 'System'}</span> {/* Use theme card text */}
                            <span className="text-muted-foreground">• Instructor</span>
                          </div>
                          {/* Removed rating, reviews, students, duration display */}
                        </CardContent>
                        <Separator />
                        <CardFooter className="flex justify-between py-4">
                          <div className="font-bold text-lg text-card-foreground"> {/* Use theme card text */}
                            {/* Use your price */}
                            {course.price === 0 ? "Free" : `$${course.price.toFixed(2)}`}
                          </div>
                          {/* The Link wraps the card, so this button might not be needed, or prevent default */}
                          <Button size="sm" onClick={(e) => e.preventDefault()} className="opacity-0 group-hover:opacity-100 transition-opacity">View Details</Button>
                        </CardFooter>
                      </Card>
                    </Link>
                  ))}
                </div>
              ) : (
                // No courses found message from example
                <div className="text-center py-12 border rounded-lg bg-muted/30">
                  <BarChart className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium mb-2 text-foreground">No courses found</h3> {/* Use theme text */}
                  <p className="text-muted-foreground mb-6">We could not find any courses matching your filters.</p> {/* Fixed linting issue */}
                  <Button onClick={resetFilters}>Reset Filters</Button>
                </div>
              )}

              {/* Pagination (Static example - implement if needed) */}
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
                    {/* Add more page buttons or dynamic pagination logic */}
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

      {/* CTA Section (Static example - replace or remove) */}
      <section className="bg-primary/10 py-16">
        <div className="container">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl font-bold mb-4 text-foreground">Become an Instructor</h2> {/* Use theme text */}
            <p className="text-muted-foreground mb-8 max-w-2xl mx-auto">
              Join our community of expert instructors and share your knowledge with students around the world. Create
              engaging courses and earn revenue.
            </p>
            <Button size="lg">Start Teaching Today</Button>
          </div>
        </div>
      </section>

      {/* Removed Footer - Handled by layout */}
    </div>
  );
}
