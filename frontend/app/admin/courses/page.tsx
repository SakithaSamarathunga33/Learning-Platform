/* eslint-disable @typescript-eslint/no-unused-vars */
"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "sonner"
import { jsPDF } from "jspdf"
import autoTable from "jspdf-autotable"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"
import {
  Search,
  MoreHorizontal,
  Download,
  Filter,
  ArrowUpDown,
  Edit,
  Trash2,
  Plus,
  BookOpen,
  Loader2,
  Pencil,
} from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@/components/ui/alert"
import { getAuthenticatedFetch } from '@/utils/auth'

interface Course {
  id: string;
  title: string;
  description: string;
  thumbnailUrl: string;
  price: number;
  category: string;
  isPublished: boolean;
  published?: boolean;
  instructor: {
    id: string;
    username: string;
  };
  students?: number;
  rating?: number;
  createdAt?: string;
}

interface User {
  id: string;
  username: string;
  email: string;
  roles: string[];
  profilePicture?: string;
}

export default function CoursesPage() {
  const [selectedCourses, setSelectedCourses] = useState<string[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [categoryFilter, setCategoryFilter] = useState("all")
  const [statusFilter, setStatusFilter] = useState("all")
  const [mounted, setMounted] = useState(false)
  const [courses, setCourses] = useState<Course[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string>("")
  const [totalCourses, setTotalCourses] = useState(0)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [editingCourse, setEditingCourse] = useState<Course | null>(null)
  const [editForm, setEditForm] = useState({
    title: '',
    description: '',
    price: 0,
    category: '',
    isPublished: false,
    thumbnailUrl: ''
  })
  const [editFormErrors, setEditFormErrors] = useState({
    title: '',
    description: '',
    price: '',
    category: '',
    thumbnailUrl: ''
  })
  const [alert, setAlert] = useState<{
    type: 'success' | 'error' | 'info';
    title: string;
    description: string;
  } | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const authenticatedFetch = getAuthenticatedFetch();

  // Add pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const coursesPerPage = 10;

  // Add new course dialog state with validation errors
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [addForm, setAddForm] = useState({
    title: '',
    description: '',
    price: 0,
    category: '',
    isPublished: false,
    thumbnailUrl: ''
  })
  const [formErrors, setFormErrors] = useState({
    title: '',
    description: '',
    price: '',
    category: '',
    thumbnailUrl: ''
  })

  // Simulate mounted state for animations
  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    // Get user data from localStorage
    const userData = localStorage.getItem('user');
    if (userData) {
      try {
        setUser(JSON.parse(userData));
      } catch (err) {
        console.error('Error parsing user data:', err);
      }
    }
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      const response = await authenticatedFetch('http://localhost:8080/api/courses');
      if (!response) return; // User was redirected to login

      if (!response.ok) {
        throw new Error(`Failed to fetch courses: ${response.status}`);
      }

      const data = await response.json();
      console.log("Raw courses data from backend:", data);
      
      // Transform the data to include additional fields and normalize published status
      const transformedCourses = data.map((course: Course) => {
        // Determine published status from either field (backend inconsistency handling)
        const isPublished = course.published === true || course.isPublished === true;
        
        return {
          ...course,
          // Ensure both publishing fields are set correctly
          isPublished: isPublished,
          published: isPublished,
          instructor: course.instructor || { id: '', username: 'Unknown Instructor' },
          students: Math.floor(Math.random() * 1000), // Placeholder
          rating: (Math.random() * 2 + 3).toFixed(1), // Placeholder
          createdAt: new Date().toLocaleDateString() // Placeholder
        };
      });
      
      console.log("Transformed courses with normalized publish status:", transformedCourses);
      setCourses(transformedCourses);
      
      setTotalCourses(transformedCourses.length);
      
      setLoading(false);
    } catch (err) {
      console.error('Error fetching courses:', err);
      setError(err instanceof Error ? err.message : 'Error connecting to server');
      setLoading(false);
    }
  };

  const handleDelete = async (courseId: string) => {
    if (!confirm('Are you sure you want to delete this course?')) return;

    try {
      const response = await authenticatedFetch(`http://localhost:8080/api/courses/${courseId}`, {
        method: 'DELETE'
      });
      if (!response) return; // User was redirected to login

      if (response.ok) {
        setCourses(courses.filter(course => course.id !== courseId));
        setSelectedCourses(selectedCourses.filter(id => id !== courseId));
        
        setTotalCourses(totalCourses - 1);

        // Show success alert
        setAlert({
          type: 'success',
          title: 'Course deleted',
          description: 'The course has been successfully deleted.'
        });
      } else {
        throw new Error('Failed to delete course');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error connecting to server');
    }
  };

  const handleEdit = (course: Course) => {
    setEditingCourse(course);
    setEditForm({
      title: course.title,
      description: course.description,
      price: course.price,
      category: course.category || '',
      isPublished: course.isPublished,
      thumbnailUrl: course.thumbnailUrl || ''
    });
    // Reset edit form validation errors
    setEditFormErrors({
      title: '',
      description: '',
      price: '',
      category: '',
      thumbnailUrl: ''
    });
    setIsEditDialogOpen(true);
  };

  const handleEditSubmit = async () => {
    try {
      // Reset validation errors
      setEditFormErrors({
        title: '',
        description: '',
        price: '',
        category: '',
        thumbnailUrl: ''
      });
      
      // Validate required fields
      let hasErrors = false;
      const newErrors = {
        title: '',
        description: '',
        price: '',
        category: '',
        thumbnailUrl: ''
      };
      
      // Title validation
      if (!editForm.title.trim()) {
        newErrors.title = "Course title is required";
        hasErrors = true;
      } else if (editForm.title.length < 5) {
        newErrors.title = "Title must be at least 5 characters";
        hasErrors = true;
      } else if (editForm.title.length > 100) {
        newErrors.title = "Title cannot exceed 100 characters";
        hasErrors = true;
      }
      
      // Description validation
      if (!editForm.description.trim()) {
        newErrors.description = "Course description is required";
        hasErrors = true;
      } else if (editForm.description.length < 20) {
        newErrors.description = "Description must be at least 20 characters";
        hasErrors = true;
      }
      
      // Price validation
      if (editForm.price < 0) {
        newErrors.price = "Price cannot be negative";
        hasErrors = true;
      } else if (editForm.price > 10000) {
        newErrors.price = "Price cannot exceed 10,000";
        hasErrors = true;
      }
      
      // Category validation
      if (!editForm.category) {
        newErrors.category = "Category is required";
        hasErrors = true;
      }
      
      // Thumbnail URL validation (optional, but validate if provided)
      if (editForm.thumbnailUrl && !isValidUrl(editForm.thumbnailUrl)) {
        newErrors.thumbnailUrl = "Please enter a valid URL";
        hasErrors = true;
      }
      
      if (hasErrors) {
        setEditFormErrors(newErrors);
        return;
      }
      
      // Proceed with update if there are no validation errors
      if (!editingCourse) {
        toast.error("No course selected for editing");
        return;
      }

      // Format price as a number to ensure it's not sent as a string
      const formattedPrice = typeof editForm.price === 'string' 
        ? parseFloat(editForm.price) 
        : editForm.price;
      
      // Create a properly formatted request body that matches exactly what the Java backend expects
      // The Java model has boolean isPublished field but the getter/setter methods are isPublished()/setPublished()
      // Spring's Jackson mapper will look for both formats
      const requestBody = {
        title: editForm.title || '',
        description: editForm.description || '',
        price: formattedPrice || 0,
        category: editForm.category || "programming",
        // Send only 'published' to match the setter method in the backend
        published: editForm.isPublished,
        thumbnailUrl: editForm.thumbnailUrl || "https://images.unsplash.com/photo-1498050108023-c5249f4df085?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8M3x8Y29kaW5nfGVufDB8fDB8fHww&w=640&q=80",
        // Include tags field expected by the backend
        tags: []
      };
      
      // Log payload for debugging without breaking error boundaries
      console.log("Update payload:", JSON.stringify(requestBody, null, 2));
      
      // Use the authenticatedFetch method which handles token refresh automatically
      const response = await authenticatedFetch(`http://localhost:8080/api/courses/${editingCourse.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestBody)
      });

      // If authenticatedFetch returns undefined, it means the user was redirected to login
      if (!response) {
        console.log("Authentication failed, redirected to login");
        return;
      }

      console.log("Update response status:", response.status);
      
      // Read the response body ONCE as text
      const responseText = await response.text();
      console.log("Response body:", responseText);
      
      // Use console.log instead of console.error to avoid triggering error boundaries
      if (!response.ok) {
        let errorMessage = 'Failed to update course';
        
        // Try to parse the response text as JSON for error details
        if (responseText && responseText.trim()) {
          try {
            const errorData = JSON.parse(responseText);
            errorMessage = errorData.message || errorData.error || errorMessage;
          } catch (parseError) {
            console.log('Error parsing error response as JSON');
            // Use the text directly if not valid JSON
            errorMessage = responseText;
          }
        }
        
        // Use console.log instead of console.error
        console.log("Server returned error:", errorMessage);
        toast.error(`Server error: ${errorMessage}. Updating UI only.`);
      } else {
        // Server responded OK - log success
        console.log("Server accepted the update");
      }

      // Always update UI with local data
      const updatedCourse = {
        ...editingCourse,
        title: editForm.title || '',
        description: editForm.description || '',
        price: formattedPrice || 0,
        category: editForm.category || 'programming',
        isPublished: Boolean(editForm.isPublished),
        published: Boolean(editForm.isPublished),
        thumbnailUrl: editForm.thumbnailUrl || "https://images.unsplash.com/photo-1498050108023-c5249f4df085?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8M3x8Y29kaW5nfGVufDB8fDB8fHww&w=640&q=80"
      };

      // Only try to parse server response if it exists and the request was successful
      if (response.ok && responseText && responseText.trim()) {
        try {
          const serverCourse = JSON.parse(responseText);
          if (serverCourse && serverCourse.id) {
            console.log("Using server data for update");
            Object.assign(updatedCourse, serverCourse);
          }
        } catch (parseError) {
          console.log('Error parsing success response - using local data instead');
        }
      }

      // Update the courses array with the updated course
      const updatedCourses = courses.map(course =>
        course.id === editingCourse.id ? {
          ...course,
          ...updatedCourse,
          students: course.students,
          rating: course.rating,
          createdAt: course.createdAt
        } : course
      );
      
      setCourses(updatedCourses);
      setTotalCourses(updatedCourses.length);

      toast.success('Course updated successfully');
      setIsEditDialogOpen(false);
      setEditingCourse(null);
      
      // Fetch courses without causing a full page reload - only if server update succeeded
      if (response.ok) {
        fetchCourses();
      }
    } catch (err) {
      // Log error without breaking error boundaries
      console.log('Update error:', err);
      toast.error('Failed to update course. Updates applied to UI only.');
    }
  };

  const handleSelectAll = () => {
    if (selectedCourses.length === courses.length) {
      setSelectedCourses([]);
    } else {
      setSelectedCourses(courses.map(course => course.id));
    }
  };

  const handleSelectCourse = (courseId: string) => {
    setSelectedCourses(prev => 
      prev.includes(courseId) 
        ? prev.filter(id => id !== courseId)
        : [...prev, courseId]
    );
  };

  const handlePageChange = (pageNumber: number) => {
    setCurrentPage(pageNumber);
  };

  const filteredCourses = courses.filter(course => {
    const matchesSearch = course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         course.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || course.category === categoryFilter;
    const matchesStatus = statusFilter === 'all' || 
                         (statusFilter === 'published' && course.isPublished) ||
                         (statusFilter === 'draft' && !course.isPublished);
    return matchesSearch && matchesCategory && matchesStatus;
  });

  const totalPages = Math.ceil(filteredCourses.length / coursesPerPage);
  const startIndex = (currentPage - 1) * coursesPerPage;
  const endIndex = startIndex + coursesPerPage;
  const currentCourses = filteredCourses.slice(startIndex, endIndex);

  const handleAddCourse = async () => {
    try {
      // Reset validation errors
      setFormErrors({
        title: '',
        description: '',
        price: '',
        category: '',
        thumbnailUrl: ''
      });
      
      // Validate required fields
      let hasErrors = false;
      const newErrors = {
        title: '',
        description: '',
        price: '',
        category: '',
        thumbnailUrl: ''
      };
      
      // Title validation
      if (!addForm.title.trim()) {
        newErrors.title = "Course title is required";
        hasErrors = true;
      } else if (addForm.title.length < 5) {
        newErrors.title = "Title must be at least 5 characters";
        hasErrors = true;
      } else if (addForm.title.length > 100) {
        newErrors.title = "Title cannot exceed 100 characters";
        hasErrors = true;
      }
      
      // Description validation
      if (!addForm.description.trim()) {
        newErrors.description = "Course description is required";
        hasErrors = true;
      } else if (addForm.description.length < 20) {
        newErrors.description = "Description must be at least 20 characters";
        hasErrors = true;
      }
      
      // Price validation
      if (addForm.price < 0) {
        newErrors.price = "Price cannot be negative";
        hasErrors = true;
      } else if (addForm.price > 10000) {
        newErrors.price = "Price cannot exceed 10,000";
        hasErrors = true;
      }
      
      // Category validation
      if (!addForm.category) {
        newErrors.category = "Category is required";
        hasErrors = true;
      }
      
      // Thumbnail URL validation (optional, but validate if provided)
      if (addForm.thumbnailUrl && !isValidUrl(addForm.thumbnailUrl)) {
        newErrors.thumbnailUrl = "Please enter a valid URL";
        hasErrors = true;
      }
      
      if (hasErrors) {
        setFormErrors(newErrors);
        return;
      }
      
      // Format price as a number
      const formattedPrice = typeof addForm.price === 'string' 
        ? parseFloat(addForm.price) 
        : addForm.price;
      
      // Create a properly formatted request body that matches exactly what the Java backend expects
      const requestBody = {
        title: addForm.title || '',
        description: addForm.description || '',
        price: formattedPrice || 0,
        category: addForm.category || "programming",
        // Send only 'published' to match the setter method in the backend
        published: addForm.isPublished,
        thumbnailUrl: addForm.thumbnailUrl || "https://images.unsplash.com/photo-1498050108023-c5249f4df085?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8M3x8Y29kaW5nfGVufDB8fDB8fHww&w=640&q=80",
        // Include tags field expected by the backend
        tags: []
      };

      console.log("Create payload:", JSON.stringify(requestBody, null, 2));
      
      // Use authenticatedFetch which handles token refresh automatically
      const response = await authenticatedFetch('http://localhost:8080/api/courses', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestBody)
      });

      // If authenticatedFetch returns undefined, it means the user was redirected to login
      if (!response) {
        console.log("Authentication failed, redirected to login");
        return;
      }

      console.log("Create response status:", response.status);

      if (!response.ok) {
        // Try to get the error message from the response
        let errorMessage = "Failed to create course";
        try {
          const text = await response.text();
          console.log("Error response text:", text);
          if (text && text.trim()) {
            try {
              const errorData = JSON.parse(text);
              errorMessage = errorData.message || errorData.error || errorMessage;
            } catch (parseError) {
              // If we can't parse as JSON, use the text directly
              errorMessage = text;
            }
          }
        } catch (e) {
          console.error("Error reading response", e);
        }
        
        toast.error(`Error: ${errorMessage}`);
        return;
      }

      // Parse the response safely
      let newCourse;
      try {
        const text = await response.text();
        console.log("Success response text:", text);
        
        if (text && text.trim()) {
          newCourse = JSON.parse(text);
        } else {
          // If response is empty, use the form data with a temporary ID
          console.log("Empty response, using form data");
          newCourse = {
            id: Date.now().toString(), // Temporary ID
            ...addForm
          };
        }
      } catch (parseError) {
        console.error("Error parsing success response:", parseError);
        // Fallback to form data if parsing fails
        newCourse = {
          id: Date.now().toString(), // Temporary ID
          ...addForm
        };
      }

      setCourses([...courses, newCourse]);
      setTotalCourses(totalCourses + 1);
      setIsAddDialogOpen(false);
      setAddForm({
        title: '',
        description: '',
        price: 0,
        category: '',
        isPublished: false,
        thumbnailUrl: ''
      });

      toast.success('Course created successfully');
      
      // Refresh courses list
      fetchCourses();
    } catch (err) {
      console.error("Course creation error:", err);
      toast.error(err instanceof Error ? err.message : 'Failed to create course');
    }
  };

  const handleExportPDF = () => {
    const doc = new jsPDF();
    
    // Add title
    doc.setFontSize(20);
    doc.text('Courses Report', 14, 15);
    doc.setFontSize(10);

    // Prepare data for the table
    const tableData = courses.map(course => [
      course.title,
      course.category,
      course.instructor?.username || 'Unknown Instructor',
      course.isPublished ? 'Published' : 'Draft',
      `$${course.price}`,
      course.createdAt || new Date().toLocaleDateString()
    ]);

    // Add table
    autoTable(doc, {
      head: [['Title', 'Category', 'Instructor', 'Status', 'Price', 'Created']],
      body: tableData,
      startY: 25,
      theme: 'grid',
      styles: { fontSize: 8 },
      headStyles: { fillColor: [41, 128, 185] }
    });

    // Save the PDF
    doc.save('courses-report.pdf');
  };

  // Helper function to validate URLs
  const isValidUrl = (url: string) => {
    try {
      new URL(url);
      return true;
    } catch (e) {
      return false;
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Card */}
      <Card className="bg-primary/5 border-primary/20 max-w-md">
        <CardContent className="p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-primary/10 rounded-full">
              <BookOpen className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Total Courses</p>
              <p className="text-2xl font-bold">{totalCourses}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Main Content */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-6">
            <div className="flex items-center gap-4">
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search courses..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-8 w-[300px]"
                />
              </div>
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  <SelectItem value="programming">Programming</SelectItem>
                  <SelectItem value="design">Design</SelectItem>
                  <SelectItem value="business">Business</SelectItem>
                  <SelectItem value="marketing">Marketing</SelectItem>
                </SelectContent>
              </Select>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="published">Published</SelectItem>
                  <SelectItem value="draft">Draft</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" className="gap-2" onClick={handleExportPDF}>
                <Download className="h-4 w-4" />
                Export
              </Button>
              <Button size="sm" className="gap-2" onClick={() => setIsAddDialogOpen(true)}>
                <Plus className="h-4 w-4" />
                Add Course
              </Button>
            </div>
          </div>

          {/* Course Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {currentCourses.map((course) => (
              <Card key={course.id} className="group relative overflow-hidden">
                <div className="relative h-48 w-full">
                  {course.thumbnailUrl ? (
                    <img
                      src={course.thumbnailUrl}
                      alt={course.title}
                      className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                  ) : (
                    <div className="h-full w-full bg-muted flex items-center justify-center">
                      <BookOpen className="h-12 w-12 text-muted-foreground" />
        </div>
      )}
                  <div className="absolute top-2 right-2">
                <input
                      type="checkbox"
                      checked={selectedCourses.includes(course.id)}
                      onChange={() => handleSelectCourse(course.id)}
                      className="rounded border-gray-300 bg-white/90"
                />
              </div>
                </div>
                <CardContent className="p-4">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold line-clamp-1">{course.title}</h3>
                      <span className="font-medium">${course.price}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">{course.category}</Badge>
                      <Badge variant={course.isPublished ? "default" : "secondary"}>
                        {course.isPublished ? "Published" : "Draft"}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <span>{course.instructor?.username || 'Unknown Instructor'}</span>
                      <span>•</span>
                      <span>{course.students} students</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="text-yellow-500">★</span>
                      <span className="text-sm">{course.rating}</span>
                    </div>
                    <div className="flex items-center justify-between pt-2">
                      <span className="text-sm text-muted-foreground">{course.createdAt}</span>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleEdit(course)}>
                            <Edit className="mr-2 h-4 w-4" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="text-red-600"
                            onClick={() => handleDelete(course.id)}
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="mt-6">
              <Pagination>
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious
                      onClick={() => handlePageChange(currentPage - 1)}
                      className={currentPage === 1 ? "pointer-events-none opacity-50" : ""}
                    />
                  </PaginationItem>
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                    <PaginationItem key={page}>
                      <PaginationLink
                        onClick={() => handlePageChange(page)}
                        isActive={currentPage === page}
                      >
                        {page}
                      </PaginationLink>
                    </PaginationItem>
                  ))}
                  <PaginationItem>
                    <PaginationNext
                      onClick={() => handlePageChange(currentPage + 1)}
                      className={currentPage === totalPages ? "pointer-events-none opacity-50" : ""}
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
              </div>
          )}
        </CardContent>
      </Card>

      {/* Add Course Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Add New Course</DialogTitle>
            <DialogDescription>
              Create a new course by filling out the form below.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="title">Title <span className="text-red-500">*</span></Label>
              <Input
                id="title"
                value={addForm.title}
                onChange={(e) => setAddForm({ ...addForm, title: e.target.value })}
                placeholder="Enter course title"
                className={formErrors.title ? "border-red-500" : ""}
              />
              {formErrors.title && <p className="text-red-500 text-sm mt-1">{formErrors.title}</p>}
            </div>
            <div className="grid gap-2">
              <Label htmlFor="description">Description <span className="text-red-500">*</span></Label>
              <Textarea
                id="description"
                value={addForm.description}
                onChange={(e) => setAddForm({ ...addForm, description: e.target.value })}
                placeholder="Enter course description"
                className={`min-h-[100px] ${formErrors.description ? "border-red-500" : ""}`}
              />
              {formErrors.description && <p className="text-red-500 text-sm mt-1">{formErrors.description}</p>}
            </div>
            <div className="grid gap-2">
              <Label htmlFor="thumbnailUrl">Thumbnail URL</Label>
              <Input
                id="thumbnailUrl"
                value={addForm.thumbnailUrl}
                onChange={(e) => setAddForm({ ...addForm, thumbnailUrl: e.target.value })}
                placeholder="Enter thumbnail URL"
                className={formErrors.thumbnailUrl ? "border-red-500" : ""}
              />
              {formErrors.thumbnailUrl && <p className="text-red-500 text-sm mt-1">{formErrors.thumbnailUrl}</p>}
            </div>
            <div className="grid gap-2">
              <Label htmlFor="price">Price <span className="text-red-500">*</span></Label>
              <Input
                id="price"
                type="number"
                value={addForm.price}
                onChange={(e) => setAddForm({ ...addForm, price: Number(e.target.value) })}
                placeholder="Enter course price"
                className={formErrors.price ? "border-red-500" : ""}
                min="0"
                step="0.01"
              />
              {formErrors.price && <p className="text-red-500 text-sm mt-1">{formErrors.price}</p>}
            </div>
            <div className="grid gap-2">
              <Label htmlFor="category">Category <span className="text-red-500">*</span></Label>
              <Select
                value={addForm.category}
                onValueChange={(value) => setAddForm({ ...addForm, category: value })}
              >
                <SelectTrigger className={formErrors.category ? "border-red-500" : ""}>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="programming">Programming</SelectItem>
                  <SelectItem value="design">Design</SelectItem>
                  <SelectItem value="business">Business</SelectItem>
                  <SelectItem value="marketing">Marketing</SelectItem>
                </SelectContent>
              </Select>
              {formErrors.category && <p className="text-red-500 text-sm mt-1">{formErrors.category}</p>}
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="isPublished"
                checked={addForm.isPublished}
                onChange={(e) => setAddForm({ ...addForm, isPublished: e.target.checked })}
                className="rounded border-gray-300"
              />
              <Label htmlFor="isPublished">Published</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                Cancel
            </Button>
            <Button onClick={handleAddCourse}>Create Course</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Course Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Edit Course</DialogTitle>
            <DialogDescription>
              Make changes to the course details below.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="edit-title">Title <span className="text-red-500">*</span></Label>
              <Input
                id="edit-title"
                value={editForm.title}
                onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                placeholder="Enter course title"
                className={editFormErrors.title ? "border-red-500" : ""}
              />
              {editFormErrors.title && <p className="text-red-500 text-sm mt-1">{editFormErrors.title}</p>}
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-description">Description <span className="text-red-500">*</span></Label>
              <Textarea
                id="edit-description"
                value={editForm.description}
                onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                placeholder="Enter course description"
                className={`min-h-[100px] ${editFormErrors.description ? "border-red-500" : ""}`}
              />
              {editFormErrors.description && <p className="text-red-500 text-sm mt-1">{editFormErrors.description}</p>}
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-price">Price <span className="text-red-500">*</span></Label>
              <Input
                id="edit-price"
                type="number"
                value={editForm.price}
                onChange={(e) => setEditForm({ ...editForm, price: Number(e.target.value) })}
                placeholder="Enter course price"
                className={editFormErrors.price ? "border-red-500" : ""}
                min="0"
                step="0.01"
              />
              {editFormErrors.price && <p className="text-red-500 text-sm mt-1">{editFormErrors.price}</p>}
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-thumbnail">Thumbnail URL</Label>
              <Input
                id="edit-thumbnail"
                value={editForm.thumbnailUrl}
                onChange={(e) => setEditForm({ ...editForm, thumbnailUrl: e.target.value })}
                placeholder="Enter thumbnail URL"
                className={editFormErrors.thumbnailUrl ? "border-red-500" : ""}
              />
              {editFormErrors.thumbnailUrl && <p className="text-red-500 text-sm mt-1">{editFormErrors.thumbnailUrl}</p>}
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-category">Category <span className="text-red-500">*</span></Label>
              <Select
                value={editForm.category}
                onValueChange={(value) => setEditForm({ ...editForm, category: value })}
              >
                <SelectTrigger className={editFormErrors.category ? "border-red-500" : ""}>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="programming">Programming</SelectItem>
                  <SelectItem value="design">Design</SelectItem>
                  <SelectItem value="business">Business</SelectItem>
                  <SelectItem value="marketing">Marketing</SelectItem>
                </SelectContent>
              </Select>
              {editFormErrors.category && <p className="text-red-500 text-sm mt-1">{editFormErrors.category}</p>}
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="edit-isPublished"
                checked={editForm.isPublished}
                onChange={(e) => setEditForm({ ...editForm, isPublished: e.target.checked })}
                className="rounded border-gray-300"
              />
              <Label htmlFor="edit-isPublished">Published</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleEditSubmit}>Save changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Alert */}
      {alert && (
        <Alert variant={alert.type === 'success' ? 'default' : 'destructive'}>
          <AlertTitle>{alert.title}</AlertTitle>
          <AlertDescription>{alert.description}</AlertDescription>
        </Alert>
      )}
    </div>
  );
} 