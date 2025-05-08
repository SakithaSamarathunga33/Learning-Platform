'use client';

import React, { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { 
  BarChart3, 
  CheckCircle2, 
  ChevronLeft, 
  ChevronRight, 
  Clock, 
  Download, 
  Flag, 
  MessageSquare, 
  Search, 
  Send, 
  Star, 
  ThumbsDown, 
  ThumbsUp, 
  XCircle
} from "lucide-react";
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
  userEmail: string;
  courseId: string | null;
  courseName: string | null;
}

interface FeedbackStats {
  totalFeedback: number;
  pendingFeedback: number;
  reviewedFeedback: number;
  resolvedFeedback: number;
  rejectedFeedback: number;
}

export default function AdminFeedbackPage() {
  const [feedback, setFeedback] = useState<FeedbackItem[]>([]);
  const [stats, setStats] = useState<FeedbackStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedFeedback, setSelectedFeedback] = useState<FeedbackItem | null>(null);
  const [adminResponse, setAdminResponse] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('ALL_TYPES');
  const [filterStatus, setFilterStatus] = useState('ALL_STATUSES');
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const pageSize = 10;
  const [openDialog, setOpenDialog] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Fetch feedback data on component mount or when filters change
  useEffect(() => {
    fetchFeedback();
    fetchStats();
  }, [currentPage, filterType, filterStatus]);

  // Fetch feedback with filters
  const fetchFeedback = async () => {
    try {
      setLoading(true);
      
      let url = `/api/feedback?page=${currentPage}&size=${pageSize}`;
      
      // Only use status endpoint for specific statuses
      if (filterStatus && filterStatus !== 'ALL_STATUSES') {
        url = `/api/feedback/status/${filterStatus}?page=${currentPage}&size=${pageSize}`;
      }
      
      const response = await api.get(url);
      
      // Get feedback data with fallback to empty array
      let feedbackData = response.data.content || [];
      
      // Apply type filter on client side
      if (filterType && filterType !== 'ALL_TYPES') {
        feedbackData = feedbackData.filter((item: FeedbackItem) => item.type === filterType);
      }
      
      setFeedback(feedbackData);
      setTotalPages(response.data.totalPages || 1);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching feedback:', error);
      setLoading(false);
      toast.error('Failed to load feedback data');
    }
  };

  // Fetch feedback statistics
  const fetchStats = async () => {
    try {
      const response = await api.get('/api/feedback/stats');
      setStats(response.data);
    } catch (error) {
      console.error('Error fetching feedback stats:', error);
    }
  };

  // Handle responding to feedback
  const handleResponseSubmit = async () => {
    if (!selectedFeedback || !selectedStatus) return;
    
    try {
      setIsUpdating(true);
      
      await api.put(`/api/feedback/${selectedFeedback.id}/status`, {
        status: selectedStatus,
        adminResponse: adminResponse.trim() ? adminResponse : null
      });
      
      // Success message
      toast.success(`Feedback marked as ${selectedStatus.toLowerCase()}`);
      
      // Reset form
      setOpenDialog(false);
      setSelectedFeedback(null);
      setAdminResponse('');
      setSelectedStatus('');
      
      // Refresh data
      fetchFeedback();
      fetchStats();
      
    } catch (error) {
      console.error('Error updating feedback:', error);
      toast.error('Failed to update feedback');
    } finally {
      setIsUpdating(false);
    }
  };

  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  // Open feedback response dialog
  const openResponseDialog = (feedback: FeedbackItem) => {
    setSelectedFeedback(feedback);
    setAdminResponse(feedback.adminResponse || '');
    setSelectedStatus(feedback.status);
    setOpenDialog(true);
  };

  // Open feedback delete confirmation dialog
  const openDeleteConfirmation = (feedback: FeedbackItem) => {
    setSelectedFeedback(feedback);
    setOpenDeleteDialog(true);
  };

  // Handle feedback deletion
  const handleDelete = async () => {
    if (!selectedFeedback) return;
    
    try {
      setIsDeleting(true);
      
      await api.delete(`/api/feedback/${selectedFeedback.id}`);
      
      // Success message
      toast.success('Feedback deleted successfully');
      
      // Reset form
      setOpenDeleteDialog(false);
      setSelectedFeedback(null);
      
      // Refresh data
      fetchFeedback();
      fetchStats();
      
    } catch (error) {
      console.error('Error deleting feedback:', error);
      toast.error('Failed to delete feedback');
    } finally {
      setIsDeleting(false);
    }
  };

  // Get status badge
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'PENDING':
        return <Badge variant="outline" className="bg-yellow-100 text-yellow-800">
          <Clock className="w-3 h-3 mr-1" />
          Pending
        </Badge>;
      case 'REVIEWED':
        return <Badge variant="outline" className="bg-blue-100 text-blue-800">
          <CheckCircle2 className="w-3 h-3 mr-1" />
          Reviewed
        </Badge>;
      case 'RESOLVED':
        return <Badge variant="outline" className="bg-green-100 text-green-800">
          <ThumbsUp className="w-3 h-3 mr-1" />
          Resolved
        </Badge>;
      case 'REJECTED':
        return <Badge variant="outline" className="bg-red-100 text-red-800">
          <ThumbsDown className="w-3 h-3 mr-1" />
          Rejected
        </Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  // Get type badge
  const getTypeBadge = (type: string) => {
    switch (type) {
      case 'FEATURE_REQUEST':
        return <Badge className="bg-purple-100 text-purple-800">
          <Flag className="w-3 h-3 mr-1" />
          Feature Request
        </Badge>;
      case 'BUG_REPORT':
        return <Badge className="bg-red-100 text-red-800">
          <XCircle className="w-3 h-3 mr-1" />
          Bug Report
        </Badge>;
      case 'GENERAL_FEEDBACK':
        return <Badge className="bg-blue-100 text-blue-800">
          <MessageSquare className="w-3 h-3 mr-1" />
          General Feedback
        </Badge>;
      case 'COURSE_FEEDBACK':
        return <Badge className="bg-green-100 text-green-800">
          <Star className="w-3 h-3 mr-1" />
          Course Feedback
        </Badge>;
      default:
        return <Badge>{type}</Badge>;
    }
  };

  // Render stars based on rating
  const renderStars = (rating: number) => {
    return (
      <div className="flex">
        {Array(5).fill(0).map((_, i) => (
          <Star
            key={i}
            size={16}
            className={`${i < rating ? 'text-yellow-500 fill-yellow-500' : 'text-gray-300'}`}
          />
        ))}
      </div>
    );
  };

  // Check if a feedback matches search query
  const matchesSearch = (item: FeedbackItem) => {
    if (!searchQuery.trim()) return true;
    
    const query = searchQuery.toLowerCase();
    return (
      item.title.toLowerCase().includes(query) ||
      item.description.toLowerCase().includes(query) ||
      item.userName.toLowerCase().includes(query) ||
      item.userEmail.toLowerCase().includes(query) ||
      (item.courseName && item.courseName.toLowerCase().includes(query))
    );
  };

  // Handle pagination
  const handleNextPage = () => {
    if (currentPage < totalPages - 1) {
      setCurrentPage(currentPage + 1);
    }
  };

  const handlePrevPage = () => {
    if (currentPage > 0) {
      setCurrentPage(currentPage - 1);
    }
  };

  // Export feedback data to CSV
  const exportToCSV = () => {
    // Create CSV header
    const headers = ['ID', 'Title', 'Description', 'Type', 'Rating', 'Status', 'User', 'Email', 'Course', 'Created At', 'Admin Response'];
    
    // Filter feedback based on current filters
    const filteredFeedback = feedback.filter(matchesSearch);
    
    // Convert feedback data to CSV rows
    const csvRows = [
      headers.join(','),
      ...filteredFeedback.map(item => [
        item.id,
        `"${item.title.replace(/"/g, '""')}"`,
        `"${item.description.replace(/"/g, '""')}"`,
        item.type,
        item.rating,
        item.status,
        `"${item.userName.replace(/"/g, '""')}"`,
        item.userEmail,
        item.courseName ? `"${item.courseName.replace(/"/g, '""')}"` : '',
        formatDate(item.createdAt),
        item.adminResponse ? `"${item.adminResponse.replace(/"/g, '""')}"` : ''
      ].join(','))
    ];
    
    // Create and download CSV file
    const csvContent = csvRows.join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `feedback_export_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Get filtered feedback based on search
  const filteredFeedback = feedback.filter(matchesSearch);

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Feedback Management</h1>
          <p className="text-muted-foreground">
            Manage user feedback, respond to inquiries, and track issues
          </p>
        </div>
        <Button 
          variant="outline" 
          className="gap-2 w-full md:w-auto"
          onClick={exportToCSV}
        >
          <Download className="h-4 w-4" />
          Export Feedback Data
        </Button>
      </div>

      {/* Statistics Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <Card>
            <CardContent className="p-4 flex flex-col items-center justify-center h-full">
              <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center mb-2">
                <MessageSquare className="h-6 w-6 text-blue-700" />
              </div>
              <p className="text-muted-foreground text-sm">Total Feedback</p>
              <p className="text-3xl font-bold">{stats.totalFeedback}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 flex flex-col items-center justify-center h-full">
              <div className="h-12 w-12 rounded-full bg-yellow-100 flex items-center justify-center mb-2">
                <Clock className="h-6 w-6 text-yellow-700" />
              </div>
              <p className="text-muted-foreground text-sm">Pending</p>
              <p className="text-3xl font-bold">{stats.pendingFeedback}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 flex flex-col items-center justify-center h-full">
              <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center mb-2">
                <CheckCircle2 className="h-6 w-6 text-blue-700" />
              </div>
              <p className="text-muted-foreground text-sm">Reviewed</p>
              <p className="text-3xl font-bold">{stats.reviewedFeedback}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 flex flex-col items-center justify-center h-full">
              <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center mb-2">
                <ThumbsUp className="h-6 w-6 text-green-700" />
              </div>
              <p className="text-muted-foreground text-sm">Resolved</p>
              <p className="text-3xl font-bold">{stats.resolvedFeedback}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 flex flex-col items-center justify-center h-full">
              <div className="h-12 w-12 rounded-full bg-red-100 flex items-center justify-center mb-2">
                <ThumbsDown className="h-6 w-6 text-red-700" />
              </div>
              <p className="text-muted-foreground text-sm">Rejected</p>
              <p className="text-3xl font-bold">{stats.rejectedFeedback}</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filters and Search */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input 
                  placeholder="Search feedback by title, description, or user..." 
                  className="pl-8"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)} 
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4 md:w-[400px]">
              <div>
                <Select value={filterType} onValueChange={setFilterType}>
                  <SelectTrigger>
                    <SelectValue placeholder="Filter by type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ALL_TYPES">All Types</SelectItem>
                    <SelectItem value="GENERAL_FEEDBACK">General Feedback</SelectItem>
                    <SelectItem value="FEATURE_REQUEST">Feature Request</SelectItem>
                    <SelectItem value="BUG_REPORT">Bug Report</SelectItem>
                    <SelectItem value="COURSE_FEEDBACK">Course Feedback</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Select value={filterStatus} onValueChange={(value) => {
                  setFilterStatus(value);
                  setCurrentPage(0); // Reset page when filter changes
                }}>
                  <SelectTrigger>
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ALL_STATUSES">All Statuses</SelectItem>
                    <SelectItem value="PENDING">Pending</SelectItem>
                    <SelectItem value="REVIEWED">Reviewed</SelectItem>
                    <SelectItem value="RESOLVED">Resolved</SelectItem>
                    <SelectItem value="REJECTED">Rejected</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Feedback List */}
      <Card>
        <CardHeader className="pb-0">
          <CardTitle>Feedback List</CardTitle>
          <CardDescription>
            Viewing page {currentPage + 1} of {totalPages || 1}
          </CardDescription>
        </CardHeader>
        <CardContent className="px-0">
          {loading ? (
            <div className="text-center py-8">
              <div className="spinner h-8 w-8 mx-auto animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
              <p className="mt-4 text-muted-foreground">Loading feedback...</p>
            </div>
          ) : filteredFeedback.length === 0 ? (
            <div className="text-center py-12 space-y-4">
              <MessageSquare className="h-12 w-12 mx-auto text-muted-foreground" />
              <h3 className="text-lg font-medium">No Feedback Found</h3>
              <p className="text-muted-foreground">
                There are no feedback items matching your criteria.
              </p>
              <Button 
                variant="outline" 
                onClick={() => {
                  setSearchQuery('');
                  setFilterType('ALL_TYPES');
                  setFilterStatus('ALL_STATUSES');
                  setCurrentPage(0);
                }}
                className="mt-2"
              >
                Clear Filters
              </Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Title</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>User</TableHead>
                    <TableHead>Rating</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredFeedback.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell className="font-medium max-w-[200px] truncate">
                        {item.title}
                      </TableCell>
                      <TableCell>{getTypeBadge(item.type)}</TableCell>
                      <TableCell>
                        <div>
                          <div>{item.userName}</div>
                          <div className="text-sm text-muted-foreground">{item.userEmail}</div>
                        </div>
                      </TableCell>
                      <TableCell>{renderStars(item.rating)}</TableCell>
                      <TableCell>{getStatusBadge(item.status)}</TableCell>
                      <TableCell>
                        <div className="text-sm">{formatDate(item.createdAt)}</div>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button 
                            variant="ghost"
                            size="sm"
                            onClick={() => openResponseDialog(item)}
                          >
                            Respond
                          </Button>
                          <Button 
                            variant="ghost"
                            size="sm"
                            className="text-red-500 hover:text-red-700 hover:bg-red-100"
                            onClick={() => openDeleteConfirmation(item)}
                          >
                            Delete
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}

          {/* Pagination */}
          {!loading && filteredFeedback.length > 0 && (
            <div className="flex items-center justify-center space-x-2 py-4">
              <Button
                variant="outline"
                size="sm"
                onClick={handlePrevPage}
                disabled={currentPage === 0}
              >
                <ChevronLeft className="h-4 w-4" />
                <span className="sr-only">Previous Page</span>
              </Button>
              <div className="text-sm">
                Page {currentPage + 1} of {totalPages}
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={handleNextPage}
                disabled={currentPage >= totalPages - 1}
              >
                <ChevronRight className="h-4 w-4" />
                <span className="sr-only">Next Page</span>
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Feedback Response Dialog */}
      <Dialog open={openDialog} onOpenChange={setOpenDialog}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Respond to Feedback</DialogTitle>
            <DialogDescription>
              Review feedback details and provide a response
            </DialogDescription>
          </DialogHeader>
          
          {selectedFeedback && (
            <div className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between items-start">
                  <h3 className="font-semibold text-lg">{selectedFeedback.title}</h3>
                  <div className="flex items-center">
                    {renderStars(selectedFeedback.rating)}
                  </div>
                </div>
                
                <div className="flex flex-wrap gap-2 items-center text-sm">
                  <span className="text-muted-foreground">
                    {formatDate(selectedFeedback.createdAt)}
                  </span>
                  <span className="text-muted-foreground">•</span>
                  {getTypeBadge(selectedFeedback.type)}
                  <span className="text-muted-foreground">•</span>
                  {getStatusBadge(selectedFeedback.status)}
                </div>
                
                {selectedFeedback.courseName && (
                  <div className="text-sm">
                    <span className="font-medium">Course:</span> {selectedFeedback.courseName}
                  </div>
                )}
                
                <div className="text-sm">
                  <span className="font-medium">From:</span> {selectedFeedback.userName} ({selectedFeedback.userEmail})
                </div>
                
                <div className="border rounded-md p-3 bg-muted/30 mt-2">
                  <p className="text-sm">{selectedFeedback.description}</p>
                </div>
              </div>
              
              <Separator />
              
              <div className="space-y-4">
                <div className="space-y-2">
                  <label htmlFor="status">Update Status</label>
                  <Select 
                    value={selectedStatus} 
                    onValueChange={setSelectedStatus}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="PENDING">Pending</SelectItem>
                      <SelectItem value="REVIEWED">Reviewed</SelectItem>
                      <SelectItem value="RESOLVED">Resolved</SelectItem>
                      <SelectItem value="REJECTED">Rejected</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <label htmlFor="response">Response (optional)</label>
                  <Textarea
                    id="response"
                    placeholder="Enter your response..."
                    rows={5}
                    value={adminResponse}
                    onChange={(e) => setAdminResponse(e.target.value)}
                  />
                  <p className="text-xs text-muted-foreground">
                    Your response will be visible to the user who submitted this feedback.
                  </p>
                </div>
              </div>
            </div>
          )}
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpenDialog(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleResponseSubmit}
              disabled={isUpdating || !selectedStatus}
              className="gap-2"
            >
              {isUpdating ? (
                <>
                  <div className="spinner h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"></div>
                  <span>Updating...</span>
                </>
              ) : (
                <>
                  <Send className="h-4 w-4" />
                  <span>Submit Response</span>
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Feedback Confirmation Dialog */}
      <Dialog open={openDeleteDialog} onOpenChange={setOpenDeleteDialog}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Delete Feedback</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this feedback? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          
          {selectedFeedback && (
            <div className="space-y-4 py-2">
              <div className="space-y-2">
                <h3 className="font-semibold">{selectedFeedback.title}</h3>
                <div className="flex flex-wrap gap-2 items-center text-sm">
                  <span className="text-muted-foreground">
                    {formatDate(selectedFeedback.createdAt)}
                  </span>
                  <span className="text-muted-foreground">•</span>
                  {getTypeBadge(selectedFeedback.type)}
                </div>
              </div>
            </div>
          )}
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpenDeleteDialog(false)}>
              Cancel
            </Button>
            <Button 
              variant="destructive"
              onClick={handleDelete}
              disabled={isDeleting}
              className="gap-2"
            >
              {isDeleting ? (
                <>
                  <div className="spinner h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"></div>
                  <span>Deleting...</span>
                </>
              ) : (
                <>
                  <XCircle className="h-4 w-4" />
                  <span>Delete Feedback</span>
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
} 