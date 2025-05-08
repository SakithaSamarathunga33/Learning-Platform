'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { AlertCircle, CheckCircle2, HelpCircle, Send, Star, MessageSquare } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { toast } from "sonner";
import api from '@/utils/api';

interface FeedbackItem {
  id: string;
  title: string;
  description: string;
  type: string;
  rating: number;
  createdAt: string;
  updatedAt: string;
  status: string;
  adminResponse: string | null;
  userId: string;
  userName: string;
  courseId: string | null;
  courseName: string | null;
}

export default function FeedbackPage() {
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState('GENERAL_FEEDBACK');
  const [rating, setRating] = useState<number>(5);
  const [courseId, setCourseId] = useState<string | null>(null);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [myFeedback, setMyFeedback] = useState<FeedbackItem[]>([]);
  const [loadingFeedback, setLoadingFeedback] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('submit');
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Check if user is authenticated
  useEffect(() => {
    const checkAuth = () => {
      const token = localStorage.getItem('token');
      setIsAuthenticated(!!token);
      
      if (!token && activeTab === 'history') {
        // Redirect to submit tab if not authenticated and trying to view history
        setActiveTab('submit');
        setError('Please log in to view your feedback history');
      }
    };
    
    checkAuth();
    
    // Add event listener for storage changes (e.g., user logs out in another tab)
    window.addEventListener('storage', checkAuth);
    
    return () => {
      window.removeEventListener('storage', checkAuth);
    };
  }, [activeTab]);

  // Fetch user's submitted feedback on component mount or when tab changes to history
  useEffect(() => {
    if (isAuthenticated && activeTab === 'history') {
      fetchMyFeedback();
    }
    
    // Always fetch courses for the dropdown
    fetchCourses();
  }, [isAuthenticated, activeTab]);

  // Fetch available courses for the course selection dropdown
  const fetchCourses = async () => {
    try {
      const response = await api.get('/api/courses');
      setCourses(response.data);
    } catch (error) {
      console.error('Error fetching courses:', error);
    }
  };

  // Fetch user's feedback
  const fetchMyFeedback = async () => {
    try {
      // Check if user is logged in first
      const token = localStorage.getItem('token');
      if (!token) {
        console.error('No authentication token found');
        setError('You need to be logged in to view your feedback');
        return;
      }

      setLoadingFeedback(true);
      setError(null); // Clear any previous errors
      
      const response = await api.get('/api/feedback/my-feedback');
      
      if (response.data) {
        setMyFeedback(response.data);
      } else {
        // Handle empty response
        setMyFeedback([]);
      }
    } catch (error: any) {
      console.error('Error fetching feedback:', error);
      
      if (error.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        if (error.response.status === 401) {
          setError('Please log in to view your feedback');
        } else if (error.response.status === 403) {
          setError('You do not have permission to access this content');
        } else if (error.response.status === 404) {
          setError('Feedback data not found');
        } else {
          setError(`Failed to load your feedback: ${error.response.data?.message || 'Server error'}`);
        }
      } else if (error.request) {
        // The request was made but no response was received
        setError('Cannot connect to the server. Please check your internet connection.');
      } else {
        // Something happened in setting up the request that triggered an Error
        setError('Failed to load your feedback. Please try again.');
      }
    } finally {
      setLoadingFeedback(false);
    }
  };

  // Handle feedback submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Check if user is authenticated
    if (!isAuthenticated) {
      setError('Please log in to submit feedback');
      toast.error('You must be logged in to submit feedback');
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      // Validate inputs
      if (!title.trim()) {
        throw new Error('Please provide a title for your feedback');
      }
      
      if (!description.trim()) {
        throw new Error('Please provide a description for your feedback');
      }
      
      // Create feedback object
      const feedbackData = {
        title,
        description,
        type,
        rating,
        courseId: type === 'COURSE_FEEDBACK' ? courseId : null
      };
      
      // Submit feedback
      await api.post('/api/feedback', feedbackData);
      
      // Reset form
      setTitle('');
      setDescription('');
      setType('GENERAL_FEEDBACK');
      setRating(5);
      setCourseId(null);
      
      // Show success message
      toast.success('Feedback submitted successfully. Thank you!');
      
      // Refresh feedback list
      fetchMyFeedback();
      
      // Switch to "My Feedback" tab
      setActiveTab('history');
      
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Failed to submit feedback');
      toast.error(err.response?.data?.message || err.message || 'Failed to submit feedback');
    } finally {
      setLoading(false);
    }
  };

  // Get badge color based on feedback status
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'PENDING':
        return <Badge variant="outline" className="bg-yellow-100 text-yellow-800 hover:bg-yellow-200">Pending</Badge>;
      case 'REVIEWED':
        return <Badge variant="outline" className="bg-blue-100 text-blue-800 hover:bg-blue-200">Reviewed</Badge>;
      case 'RESOLVED':
        return <Badge variant="outline" className="bg-green-100 text-green-800 hover:bg-green-200">Resolved</Badge>;
      case 'REJECTED':
        return <Badge variant="outline" className="bg-red-100 text-red-800 hover:bg-red-200">Rejected</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  // Format date to readable string
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
  };

  // Render stars based on rating
  const renderStars = (rating: number) => {
    return Array(5).fill(0).map((_, i) => (
      <Star 
        key={i} 
        className={`h-4 w-4 ${i < rating ? 'text-yellow-500 fill-yellow-500' : 'text-gray-300'}`} 
      />
    ));
  };

  // Get type badge
  const getTypeBadge = (type: string) => {
    switch (type) {
      case 'FEATURE_REQUEST':
        return <Badge className="bg-purple-100 text-purple-800 hover:bg-purple-200">Feature Request</Badge>;
      case 'BUG_REPORT':
        return <Badge className="bg-red-100 text-red-800 hover:bg-red-200">Bug Report</Badge>;
      case 'GENERAL_FEEDBACK':
        return <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-200">General Feedback</Badge>;
      case 'COURSE_FEEDBACK':
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-200">Course Feedback</Badge>;
      default:
        return <Badge>{type}</Badge>;
    }
  };

  return (
    <div className="container mx-auto py-10 px-4 max-w-5xl">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold">Feedback Center</h1>
        <p className="text-muted-foreground mt-2">
          We value your feedback! Help us improve our platform by sharing your thoughts, 
          reporting issues, or suggesting new features.
        </p>
      </div>

      <Tabs defaultValue="submit" value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2 mb-8">
          <TabsTrigger value="submit" className="text-center py-2">
            Submit Feedback
          </TabsTrigger>
          <TabsTrigger value="history" className="text-center py-2">
            My Feedback History
          </TabsTrigger>
        </TabsList>

        <TabsContent value="submit">
          <Card className="border-2">
            <CardHeader>
              <CardTitle>Submit Feedback</CardTitle>
              <CardDescription>
                Share your thoughts, suggestions, or report issues you've encountered.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {error && (
                <Alert variant="destructive" className="mb-4">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Error</AlertTitle>
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
              
              {!isAuthenticated ? (
                <div className="text-center py-8 space-y-4">
                  <AlertCircle className="h-12 w-12 mx-auto text-orange-500" />
                  <h3 className="text-lg font-medium">Authentication Required</h3>
                  <p className="text-muted-foreground">
                    You need to be logged in to submit feedback. This helps us track and respond to your submissions.
                  </p>
                  <div className="flex justify-center gap-4 pt-2">
                    <Button 
                      onClick={() => router.push('/login')}
                      className="gap-2"
                    >
                      Login to Continue
                    </Button>
                    <Button 
                      variant="outline"
                      onClick={() => router.push('/register')}
                    >
                      Create an Account
                    </Button>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="feedback-type">Feedback Type</Label>
                    <Select value={type} onValueChange={setType}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select feedback type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="GENERAL_FEEDBACK">General Feedback</SelectItem>
                        <SelectItem value="FEATURE_REQUEST">Feature Request</SelectItem>
                        <SelectItem value="BUG_REPORT">Bug Report</SelectItem>
                        <SelectItem value="COURSE_FEEDBACK">Course Feedback</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {type === 'COURSE_FEEDBACK' && (
                    <div className="space-y-2">
                      <Label htmlFor="course">Select Course</Label>
                      <Select value={courseId || ''} onValueChange={setCourseId}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a course" />
                        </SelectTrigger>
                        <SelectContent>
                          {courses.map((course: any) => (
                            <SelectItem key={course.id} value={course.id}>
                              {course.title}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}

                  <div className="space-y-2">
                    <Label htmlFor="title">Title</Label>
                    <Input
                      id="title"
                      placeholder="Brief title for your feedback"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      placeholder="Please provide details about your feedback..."
                      rows={6}
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Rating</Label>
                    <div className="flex items-center gap-2">
                      <RadioGroup
                        value={rating.toString()}
                        onValueChange={(value) => setRating(parseInt(value))}
                        className="flex gap-2"
                      >
                        {[1, 2, 3, 4, 5].map((star) => (
                          <div key={star} className="flex items-center">
                            <RadioGroupItem
                              value={star.toString()}
                              id={`star-${star}`}
                              className="sr-only"
                            />
                            <Label
                              htmlFor={`star-${star}`}
                              className="cursor-pointer"
                            >
                              <Star
                                className={`h-6 w-6 ${
                                  star <= rating
                                    ? "text-yellow-500 fill-yellow-500"
                                    : "text-gray-300"
                                }`}
                              />
                            </Label>
                          </div>
                        ))}
                      </RadioGroup>
                      <span className="text-sm text-muted-foreground ml-2">
                        {rating} star{rating !== 1 ? 's' : ''}
                      </span>
                    </div>
                  </div>
                </form>
              )}
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="outline" onClick={() => router.back()}>
                Cancel
              </Button>
              {isAuthenticated && (
                <Button 
                  onClick={handleSubmit} 
                  disabled={loading || !title || !description}
                  className="gap-2"
                >
                  {loading ? (
                    <>
                      <div className="spinner h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"></div>
                      <span>Submitting...</span>
                    </>
                  ) : (
                    <>
                      <Send className="h-4 w-4" />
                      <span>Submit Feedback</span>
                    </>
                  )}
                </Button>
              )}
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="history">
          <Card className="border-2">
            <CardHeader>
              <CardTitle>My Feedback History</CardTitle>
              <CardDescription>
                Track the status of your submitted feedback and view responses.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loadingFeedback ? (
                <div className="text-center py-8">
                  <div className="spinner h-8 w-8 mx-auto animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
                  <p className="mt-4 text-muted-foreground">Loading your feedback...</p>
                </div>
              ) : myFeedback.length === 0 ? (
                <div className="text-center py-12 space-y-4">
                  <MessageSquare className="h-12 w-12 mx-auto text-muted-foreground" />
                  <h3 className="text-lg font-medium">No Feedback Yet</h3>
                  <p className="text-muted-foreground">
                    You haven't submitted any feedback yet. We'd love to hear your thoughts!
                  </p>
                  <Button 
                    variant="outline" 
                    onClick={() => setActiveTab('submit')}
                    className="mt-2"
                  >
                    Submit Your First Feedback
                  </Button>
                </div>
              ) : (
                <div className="space-y-6">
                  {myFeedback.map((feedback) => (
                    <div key={feedback.id} className="border rounded-lg p-4 space-y-3">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="font-semibold text-lg">{feedback.title}</h3>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-sm text-muted-foreground">
                              {formatDate(feedback.createdAt)}
                            </span>
                            <span className="text-muted-foreground">•</span>
                            {getTypeBadge(feedback.type)}
                            <span className="text-muted-foreground">•</span>
                            {getStatusBadge(feedback.status)}
                          </div>
                        </div>
                        <div className="flex items-center">
                          {renderStars(feedback.rating)}
                        </div>
                      </div>
                      
                      {feedback.courseName && (
                        <div className="text-sm">
                          <span className="font-medium">Course:</span> {feedback.courseName}
                        </div>
                      )}
                      
                      <div className="text-sm">
                        <p>{feedback.description}</p>
                      </div>
                      
                      {feedback.adminResponse && feedback.status !== 'PENDING' && (
                        <>
                          <Separator />
                          <div className="bg-muted/50 p-3 rounded-md">
                            <div className="flex items-center gap-2 text-sm font-medium mb-1">
                              <CheckCircle2 className="h-4 w-4 text-green-600" />
                              Admin Response
                            </div>
                            <p className="text-sm">{feedback.adminResponse}</p>
                          </div>
                        </>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
            <CardFooter>
              <Button 
                variant="outline" 
                className="w-full" 
                onClick={() => setActiveTab('submit')}
              >
                <HelpCircle className="h-4 w-4 mr-2" />
                Submit New Feedback
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
} 