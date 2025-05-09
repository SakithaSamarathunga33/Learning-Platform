"use client";

import React, { useState, useEffect, useCallback } from "react";
import { format } from "date-fns";
import { toast } from "react-hot-toast";
import { useRouter } from "next/navigation";
// import { isUserAdmin } from '@/utils/auth';

import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertTriangle, Trash2, Loader2, Edit, Plus, ChevronDown, ChevronRight } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
// import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";

// Define the structure of a Comment object based on the backend model
interface Comment {
  id: string;
  text: string;
  user: { // Assuming user object is populated or at least has username/id
    id: string;
    name?: string; // Adjust based on what User model returns
    username?: string;
  };
  achievementId: string;
  createdAt: string; // ISO date string
}

interface Achievement {
  id: string;
  title: string;
}

// Group of comments belonging to a single achievement
interface CommentGroup {
  achievementId: string;
  achievementTitle: string;
  comments: Comment[];
}

const AdminCommentsPage = () => {
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [loadingAchievements, setLoadingAchievements] = useState(false);
  const [selectedAchievement, setSelectedAchievement] = useState<string>("");
  const [commentText, setCommentText] = useState<string>("");
  const [editingComment, setEditingComment] = useState<Comment | null>(null);
  const [editCommentText, setEditCommentText] = useState<string>("");
  const [commentGroups, setCommentGroups] = useState<CommentGroup[]>([]);
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({});
  const router = useRouter();

  // Group comments by achievement
  const groupCommentsByAchievement = useCallback((commentList: Comment[]) => {
    // Create a map to hold achievement titles
    const achievementTitlesMap: Record<string, string> = {};
    achievements.forEach(achievement => {
      achievementTitlesMap[achievement.id] = achievement.title;
    });

    // Group comments by achievementId
    const groups: Record<string, Comment[]> = {};
    commentList.forEach(comment => {
      if (!groups[comment.achievementId]) {
        groups[comment.achievementId] = [];
      }
      groups[comment.achievementId].push(comment);
    });

    // Convert to array
    const result: CommentGroup[] = Object.entries(groups).map(([achievementId, comments]) => ({
      achievementId,
      achievementTitle: achievementTitlesMap[achievementId] || `Achievement ${achievementId}`,
      comments
    }));

    return result;
  }, [achievements]);

  // Fetch achievements without updating comment groups to avoid circular dependencies
  const fetchAchievements = useCallback(async (silent = false) => {
    try {
      if (!silent) {
        setLoadingAchievements(true);
      }

      // Get token from localStorage
      const token = localStorage.getItem('token');

      if (!token) {
        if (!silent) toast.error("Authentication required");
        return;
      }

      const response = await fetch('/api/achievements', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        cache: 'no-store',
      });

      if (!response.ok) {
        throw new Error('Failed to fetch achievements');
      }

      const data = await response.json();
      setAchievements(Array.isArray(data) ? data : []);

      // Removed the comment group update to avoid circular dependencies
    } catch (err) {
      console.error('Error fetching achievements:', err);
      if (!silent) toast.error(`Failed to load achievements: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      if (!silent) {
        setLoadingAchievements(false);
      }
    }
  }, []); // Empty dependency array to break the circular dependency

  useEffect(() => {
    // Check if user is admin before proceeding
    // We don't need to check here since this is an admin-only page
    // and Next.js middleware should handle access control

    // Function to fetch all comments (admin only)
    const fetchComments = async () => {
      try {
        setLoading(true);
        setError(null);

        // Get token from localStorage
        const token = localStorage.getItem('token');

        if (!token) {
          router.push('/login');
          return;
        }

        // Add timestamp to prevent caching
        const timestamp = new Date().getTime();
        const response = await fetch(`/api/admin/comments?t=${timestamp}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          credentials: 'include',
          cache: 'no-store',
        });

        if (!response.ok) {
          const errorData = await response.json();

          if (response.status === 401) {
            router.push('/login');
            return;
          }

          if (response.status === 403) {
            setError('Unauthorized. Admin access required.');
            return;
          }

          throw new Error(errorData.error || 'Failed to fetch comments');
        }

        // Handle response
        let data: Comment[] = [];
        try {
          const text = await response.text();

          if (text && text.trim() !== '') {
            data = JSON.parse(text);
          }
        } catch (err) {
          console.error('Failed to parse response:', err);
        }

        setComments(Array.isArray(data) ? data : []);

        // We'll fetch achievements in a separate useEffect
      } catch (err: unknown) {
        const errorMessage = err instanceof Error ? err.message : 'Unknown error';
        console.error('Error fetching comments:', err);
        setError(errorMessage || 'Failed to load comments');
      } finally {
        setLoading(false);
      }
    };

    fetchComments();
  }, [router]); // Removed fetchAchievements from dependencies

  // Separate useEffect to fetch achievements
  useEffect(() => {
    fetchAchievements();
  }, [fetchAchievements]);

  // Update comment groups when comments or achievements change
  useEffect(() => {
    if (comments.length > 0 && achievements.length > 0) {
      const groups = groupCommentsByAchievement(comments);
      setCommentGroups(groups);
    }
  }, [comments, achievements, groupCommentsByAchievement]);

  const handleDeleteComment = async (commentId: string) => {
    if (!window.confirm("Are you sure you want to delete this comment?")) {
      return;
    }

    try {
      setError(null);

      // Get token from localStorage for auth
      const token = localStorage.getItem('token');
      if (!token) {
        toast.error("Authentication required. Please log in.");
        setTimeout(() => router.push('/login'), 1500);
        return;
      }

      // Delete the comment
      const response = await fetch(`/api/admin/comments/${commentId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        credentials: 'include',
      });

      if (!response.ok) {
        const errorData = await response.json();

        if (response.status === 401) {
          toast.error("Your session has expired. Please log in again.");
          setTimeout(() => router.push('/login'), 1500);
          return;
        }

        if (response.status === 403) {
          toast.error("You don't have admin privileges to delete comments.");
          return;
        }

        throw new Error(errorData.error || 'Failed to delete comment');
      }

      toast.success("Comment deleted successfully");
      // Update UI by removing the deleted comment
      const updatedComments = comments.filter(comment => comment.id !== commentId);
      setComments(updatedComments);

      // Update the comment groups
      const groups = groupCommentsByAchievement(updatedComments);
      setCommentGroups(groups);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      console.error("Error deleting comment:", err);
      toast.error(errorMessage || "Failed to delete comment.");
      setError(`Failed to delete comment: ${errorMessage}`);
    }
  };

  const handleEditComment = (comment: Comment) => {
    setEditingComment(comment);
    setEditCommentText(comment.text);
  };

  const saveEditedComment = async () => {
    if (!editingComment || !editCommentText.trim()) return;

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        toast.error("Authentication required");
        return;
      }

      try {
        // Try to update via API
        const response = await fetch(`/api/admin/comments/${editingComment.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify({ text: editCommentText }),
        });

        // Try to parse the response data
        let responseData;
        try {
          const responseText = await response.text();
          if (responseText) {
            responseData = JSON.parse(responseText);
          }
        } catch (err) {
          // Silently handle parse error
          console.debug('Response parse error:', err);
        }

        if (response.ok) {
          if (responseData?.localOnly) {
            // Backend doesn't actually support updates, but we're handling it locally
            toast.success("Comment updated in UI only");
            // Show a second toast with additional information
            setTimeout(() => {
              toast("Changes will not persist after page refresh due to backend limitations.");
            }, 500);
          } else {
            toast.success("Comment updated successfully");
          }

          const dialogShouldClose = true;

          // Update the comment in the local state
          const updatedComments = comments.map(c =>
            c.id === editingComment.id ? { ...c, text: editCommentText } : c
          );

          setComments(updatedComments);

          // Update the comment groups
          const groups = groupCommentsByAchievement(updatedComments);
          setCommentGroups(groups);

          // Reset edit state if dialog should close
          if (dialogShouldClose) {
            setEditingComment(null);
            setEditCommentText("");
          }

          // Close the dialog programmatically
          document.getElementById('close-edit-dialog')?.click();

          return true;
        } else {
          // Try to get error details from response
          let errorMessage = "Failed to update comment";

          if (responseData?.error) {
            errorMessage = responseData.error;
          }

          toast.error(`Error: ${errorMessage}`);
          return false;
        }
      } catch (err) {
        console.error('API error:', err);
        toast.error("Network error. Please check your connection and try again.");
        return false;
      }
    } catch (err) {
      console.error('General error:', err);
      toast.error("Failed to update comment");
      return false;
    }
  };

  const [commentError, setCommentError] = useState<string | null>(null);

  const handleAddComment = async () => {
    // Validation: Ensure comment text is not empty or meaningless
    if (!selectedAchievement || !commentText.trim()) {
      toast.error("Please select an achievement and enter comment text");
      return;
    }
  
    // Additional Validation: Check if the comment text is too short or meaningless (e.g., only spaces)
    if (commentText.trim().length < 3) {
      setCommentError("Your comment is too short. Please provide more detail.");
      return;
    } else {
      setCommentError(null); // Clear error if comment is valid
    }
  
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        toast.error("Authentication required");
        return;
      }
  
      const response = await fetch(`/api/achievements/${selectedAchievement}/comments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ text: commentText }),
      });
  
      if (!response.ok) {
        throw new Error('Failed to add comment');
      }
  
      const newComment = await response.json();
  
      toast.success("Comment added successfully");
  
      // Add the new comment to the local state
      const updatedComments = [newComment, ...comments];
      setComments(updatedComments);
  
      // Update the comment groups
      const groups = groupCommentsByAchievement(updatedComments);
      setCommentGroups(groups);
  
      // Ensure the group for this new comment is open
      setOpenGroups({
        ...openGroups,
        [selectedAchievement]: true
      });
  
      // Reset form
      setSelectedAchievement("");
      setCommentText("");
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      console.error("Error adding comment:", err);
      toast.error(errorMessage || "Failed to add comment");
    }
  };
  

  const toggleGroup = (achievementId: string) => {
    setOpenGroups({
      ...openGroups,
      [achievementId]: !openGroups[achievementId]
    });
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Manage Comments</CardTitle>
        <Dialog>
          <DialogTrigger asChild>
            <Button onClick={() => fetchAchievements()}>
              <Plus className="mr-2 h-4 w-4" /> Add Comment
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Add New Comment</DialogTitle>
              <DialogDescription>
                Select an achievement and enter your comment text.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="achievement" className="text-right">
                  Achievement
                </Label>
                <div className="col-span-3">
                  <Select
                    value={selectedAchievement}
                    onValueChange={setSelectedAchievement}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select achievement" />
                    </SelectTrigger>
                    <SelectContent>
                      {loadingAchievements ? (
                        <SelectItem value="loading" disabled>Loading...</SelectItem>
                      ) : (
                        achievements.map((achievement) => (
                          <SelectItem key={achievement.id} value={achievement.id}>
                            {achievement.title}
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="comment" className="text-right">
                  Comment
                </Label>
                <Textarea
                  id="comment"
                  className="col-span-3"
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  placeholder="Enter your comment..."
                />
                {/* Display the error message under the comment field if it's too short */}
              {commentError && <p className="text-red-500 text-sm mt-2">{commentError}</p>}
              </div>
            </div>
            <DialogFooter>
              <DialogClose asChild>
                <Button type="button" variant="secondary">
                  Cancel
                </Button>
              </DialogClose>
              <Button type="button" onClick={handleAddComment}>
                Add Comment
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        {loading && (
          <div className="flex justify-center items-center p-6">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            <span className="ml-2">Loading comments...</span>
          </div>
        )}

        {error && (
           <Alert variant="destructive" className="mb-4">
             <AlertTriangle className="h-4 w-4" />
             <AlertTitle>Error</AlertTitle>
             <AlertDescription>{error}</AlertDescription>
           </Alert>
        )}

        {!loading && !error && commentGroups.length === 0 && (
          <p className="text-center text-muted-foreground">No comments found.</p>
        )}

        {!loading && !error && commentGroups.length > 0 && (
          <div className="space-y-4">
            {commentGroups.map((group) => (
              <Collapsible
                key={group.achievementId}
                open={openGroups[group.achievementId]}
                onOpenChange={() => toggleGroup(group.achievementId)}
                className="border rounded-md"
              >
                <CollapsibleTrigger className="flex w-full items-center justify-between p-4 hover:bg-muted/50">
                  <div className="flex items-center space-x-2">
                    {openGroups[group.achievementId] ? (
                      <ChevronDown className="h-4 w-4" />
                    ) : (
                      <ChevronRight className="h-4 w-4" />
                    )}
                    <span className="font-medium">{group.achievementTitle}</span>
                    <Badge variant="outline">{group.comments.length} comments</Badge>
                  </div>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>User</TableHead>
                        <TableHead>Comment</TableHead>
                        <TableHead>Created At</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {group.comments.map((comment) => (
                        <TableRow key={comment.id}>
                          <TableCell>{comment.user?.name || comment.user?.username || comment.user?.id || 'Unknown User'}</TableCell>
                          <TableCell className="max-w-xs truncate">{comment.text}</TableCell>
                          <TableCell>{format(new Date(comment.createdAt), "PPP")}</TableCell>
                          <TableCell className="flex space-x-2">
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleEditComment(comment)}
                                  aria-label="Edit comment"
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                              </DialogTrigger>
                              <DialogContent className="sm:max-w-[425px]">
                                <DialogHeader>
                                  <DialogTitle>Edit Comment</DialogTitle>
                                  <DialogDescription>
                                    Make changes to the comment text.
                                  </DialogDescription>
                                </DialogHeader>
                                <div className="grid gap-4 py-4">
                                  <div className="grid grid-cols-4 items-center gap-4">
                                    <Label htmlFor="edit-comment" className="text-right">
                                      Comment
                                    </Label>
                                    <Textarea
                                      id="edit-comment"
                                      className="col-span-3"
                                      value={editCommentText}
                                      onChange={(e) => setEditCommentText(e.target.value)}
                                    />
                                  </div>
                                </div>
                                <DialogFooter>
                                  <Button type="button" variant="secondary" onClick={() => {
                                    setEditingComment(null);
                                    setEditCommentText("");
                                  }}>
                                    Cancel
                                  </Button>
                                  <Button type="button" onClick={async () => {
                                    await saveEditedComment();
                                  }}>
                                    Save
                                  </Button>
                                  <DialogClose id="close-edit-dialog" className="hidden" />
                                </DialogFooter>
                              </DialogContent>
                            </Dialog>
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => handleDeleteComment(comment.id)}
                              aria-label="Delete comment"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CollapsibleContent>
              </Collapsible>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default AdminCommentsPage;