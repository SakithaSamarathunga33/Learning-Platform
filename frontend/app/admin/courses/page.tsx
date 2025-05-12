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
import TaskList from "@/components/admin/TaskList"
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

interface Task {
  id?: string;
  title: string;
  completed?: boolean;
  courseId?: string;
  userId?: string;
  orderIndex?: number;
}

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
  tasks?: Task[];
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
    thumbnailUrl: '',
    tasks: [] as Task[]
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

  // Add new course dialog state
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [addForm, setAddForm] = useState({
    title: '',
    description: '',
    price: 0,
    category: '',
    isPublished: false,
    thumbnailUrl: '',
    tasks: [] as Task[]
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

  const handleEdit = async (course: Course) => {
    setEditingCourse(course);
    
    // Fetch course with tasks
    try {
      const response = await authenticatedFetch(`http://localhost:8080/api/courses/${course.id}/with-tasks`);
      if (response && response.ok) {
        const courseWithTasks = await response.json();
        setEditForm({
          title: courseWithTasks.title || '',
          description: courseWithTasks.description || '',
          price: courseWithTasks.price || 0,
          category: courseWithTasks.category || '',
          isPublished: courseWithTasks.isPublished === true || courseWithTasks.published === true || false,
          thumbnailUrl: courseWithTasks.thumbnailUrl || '',
          tasks: courseWithTasks.tasks || []
        });
      } else {
        // Fallback if we can't get tasks
        setEditForm({
          title: course.title || '',
          description: course.description || '',
          price: course.price || 0,
          category: course.category || '',
          isPublished: course.isPublished === true || course.published === true || false,
          thumbnailUrl: course.thumbnailUrl || '',
          tasks: []
        });
      }
    } catch (err) {
      console.error('Error fetching course tasks:', err);
      // Fallback
      setEditForm({
        title: course.title || '',
        description: course.description || '',
        price: course.price || 0,
        category: course.category || '',
        isPublished: course.isPublished === true || course.published === true || false,
        thumbnailUrl: course.thumbnailUrl || '',
        tasks: []
      });
    }
    
    setIsEditDialogOpen(true);
  };

  const handleEditSubmit = async () => {
    if (!editingCourse) return;

    try {
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
        tags: [],
        // Include tasks
        tasks: editForm.tasks || []
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
      if (!addForm.title.trim()) {
        toast.error("Course title is required");
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
        tags: [],
        // Include tasks
        tasks: addForm.tasks || []
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
        thumbnailUrl: '',
        tasks: []
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
        <DialogContent className="sm:max-w-[650px] max-h-[90vh] overflow-y-auto">
          <DialogHeader className="pb-4 border-b">
            <DialogTitle className="text-xl font-bold flex items-center gap-2">
              <Plus className="h-5 w-5 text-primary" />
              Add New Course
            </DialogTitle>
            <DialogDescription>
              Create a new course by filling out the form below. Add tasks to help students track their progress.
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-6 py-6">
            {/* Basic Information Section */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-primary">Basic Information</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="add-title" className="font-medium">
                    Course Title <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="add-title"
                    value={addForm.title}
                    onChange={(e) => setAddForm({ ...addForm, title: e.target.value })}
                    placeholder="Enter course title"
                    className="w-full"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="add-category" className="font-medium">
                    Category
                  </Label>
                  <Select 
                    value={addForm.category} 
                    onValueChange={(value) => setAddForm({ ...addForm, category: value })}
                  >
                    <SelectTrigger id="add-category" className="w-full">
                      <SelectValue placeholder="Select a category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="programming">Programming</SelectItem>
                      <SelectItem value="design">Design</SelectItem>
                      <SelectItem value="business">Business</SelectItem>
                      <SelectItem value="marketing">Marketing</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="add-description" className="font-medium">
                  Description
                </Label>
                <Textarea
                  id="add-description"
                  value={addForm.description}
                  onChange={(e) => setAddForm({ ...addForm, description: e.target.value })}
                  placeholder="Enter course description"
                  className="w-full min-h-[120px]"
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="add-price" className="font-medium">
                    Price ($)
                  </Label>
                  <Input
                    id="add-price"
                    type="number"
                    value={addForm.price}
                    onChange={(e) => setAddForm({ ...addForm, price: parseFloat(e.target.value) || 0 })}
                    placeholder="0.00"
                    className="w-full"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="add-thumbnailUrl" className="font-medium">
                    Thumbnail URL
                  </Label>
                  <Input
                    id="add-thumbnailUrl"
                    value={addForm.thumbnailUrl}
                    onChange={(e) => setAddForm({ ...addForm, thumbnailUrl: e.target.value })}
                    placeholder="https://example.com/image.jpg"
                    className="w-full"
                  />
                </div>
              </div>
              
              <div className="flex items-center space-x-2 pt-2">
                <input
                  type="checkbox"
                  id="add-isPublished"
                  checked={addForm.isPublished}
                  onChange={(e) => setAddForm({ ...addForm, isPublished: e.target.checked })}
                  className="rounded border-gray-300 h-4 w-4 text-primary focus:ring-primary"
                />
                <Label htmlFor="add-isPublished" className="font-medium cursor-pointer">
                  Publish this course (make it available to students)
                </Label>
              </div>
            </div>
            
            {/* Task List Section */}
            <div className="border-t pt-6 mt-2">
              <h3 className="text-lg font-semibold text-primary mb-4">Course Tasks</h3>
              <div className="bg-muted/30 rounded-lg p-4">
                <TaskList 
                  tasks={addForm.tasks} 
                  onChange={(tasks) => setAddForm({ ...addForm, tasks })}
                />
              </div>
            </div>
          </div>
          
          <DialogFooter className="border-t pt-4 gap-2">
            <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                Cancel
            </Button>
            <Button 
              onClick={handleAddCourse} 
              className="gap-2" 
              disabled={!addForm.title.trim()}
            >
              <Plus className="h-4 w-4" />
              Create Course
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Course Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[650px] max-h-[90vh] overflow-y-auto">
          <DialogHeader className="pb-4 border-b">
            <DialogTitle className="text-xl font-bold flex items-center gap-2">
              <Pencil className="h-5 w-5 text-primary" />
              Edit Course
            </DialogTitle>
            <DialogDescription>
              Update course details and manage tasks to help students track their progress.
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-6 py-6">
            {/* Basic Information Section */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-primary">Basic Information</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="title" className="font-medium">
                    Course Title <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="title"
                    value={editForm.title}
                    onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                    placeholder="Enter course title"
                    className="w-full"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="category" className="font-medium">
                    Category
                  </Label>
                  <Select 
                    value={editForm.category} 
                    onValueChange={(value) => setEditForm({ ...editForm, category: value })}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select a category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="programming">Programming</SelectItem>
                      <SelectItem value="design">Design</SelectItem>
                      <SelectItem value="business">Business</SelectItem>
                      <SelectItem value="marketing">Marketing</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="description" className="font-medium">
                  Description
                </Label>
                <Textarea
                  id="description"
                  value={editForm.description}
                  onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                  placeholder="Enter course description"
                  className="w-full min-h-[120px]"
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="price" className="font-medium">
                    Price ($)
                  </Label>
                  <Input
                    id="price"
                    type="number"
                    value={editForm.price}
                    onChange={(e) => setEditForm({ ...editForm, price: parseFloat(e.target.value) || 0 })}
                    placeholder="0.00"
                    className="w-full"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="thumbnailUrl" className="font-medium">
                    Thumbnail URL
                  </Label>
                  <Input
                    id="thumbnailUrl"
                    value={editForm.thumbnailUrl}
                    onChange={(e) => setEditForm({ ...editForm, thumbnailUrl: e.target.value })}
                    placeholder="https://example.com/image.jpg"
                    className="w-full"
                  />
                </div>
              </div>
              
              <div className="flex items-center space-x-2 pt-2">
                <input
                  type="checkbox"
                  id="isPublished"
                  checked={editForm.isPublished}
                  onChange={(e) => setEditForm({ ...editForm, isPublished: e.target.checked })}
                  className="rounded border-gray-300 h-4 w-4 text-primary focus:ring-primary"
                />
                <Label htmlFor="isPublished" className="font-medium cursor-pointer">
                  Publish this course (make it available to students)
                </Label>
              </div>
            </div>
            
            {/* Task List Section */}
            <div className="border-t pt-6 mt-2">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-primary">Course Tasks</h3>
                {editingCourse && (
                  <div className="text-sm text-muted-foreground">
                    Course ID: {editingCourse.id}
                  </div>
                )}
              </div>
              <div className="bg-muted/30 rounded-lg p-4">
                <TaskList 
                  tasks={editForm.tasks} 
                  onChange={(tasks) => setEditForm({ ...editForm, tasks })}
                />
              </div>
            </div>
          </div>
          
          <DialogFooter className="border-t pt-4 gap-2">
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleEditSubmit} 
              className="gap-2" 
              disabled={!editForm.title.trim()}
            >
              <Pencil className="h-4 w-4" />
              Save Changes
            </Button>
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