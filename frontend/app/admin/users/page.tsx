"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Checkbox } from "@/components/ui/checkbox"
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
import { Card, CardContent } from "@/components/ui/card"
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
  Mail,
  Edit,
  Trash2,
  UserPlus,
  Users,
  UserCheck,
  UserX,
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
import { Terminal } from "lucide-react"

// Interface for the user data structure from API
interface ApiUser {
  id: string;
  username: string;
  email: string;
  roles: string[];
  enabled: boolean;
  picture?: string;
  name?: string;
  provider?: string;
  // Add any other fields from your API
}

// Interface for our transformed user data
interface User {
  id: string;
  name: string;
  username: string;
  email: string;
  role: string;
  status: string;
  avatar: string;
  initials: string;
  joinedDate: string;
  courses: number;
}

export default function UsersPage() {
  const [selectedUsers, setSelectedUsers] = useState<string[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [roleFilter, setRoleFilter] = useState("all")
  const [statusFilter, setStatusFilter] = useState("all")
  const [mounted, setMounted] = useState(false)
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string>("")
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeUsers: 0,
    newUsers: 0,
    inactiveUsers: 0
  })
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [editingUser, setEditingUser] = useState<User | null>(null)
  const [editForm, setEditForm] = useState({
    name: '',
    email: '',
    role: ''
  })
  const [alert, setAlert] = useState<{
    type: 'success' | 'error' | 'info';
    title: string;
    description: string;
  } | null>(null);

  // Add state for create user dialog
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [createForm, setCreateForm] = useState({
    username: '',
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'User'
  });
  
  // Add state for form validation errors
  const [formErrors, setFormErrors] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    name: ''
  });

  // Add pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const usersPerPage = 10;

  // Simulate mounted state for animations
  useEffect(() => {
    setMounted(true)
  }, [])

  // Fetch users from API
  useEffect(() => {
    fetchUsers()
  }, [])

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setError('No authentication token found');
        setLoading(false);
        return;
      }

      const response = await fetch('http://localhost:8080/api/admin/users', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        credentials: 'include'
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(errorData?.message || `HTTP error! status: ${response.status}`);
      }

      const apiUsers: ApiUser[] = await response.json();
      
      // Transform API data to match our UI structure
      const transformedUsers = apiUsers.map(apiUser => {
        // Extract the highest role
        const roleMap: { [key: string]: string } = {
          'ROLE_ADMIN': 'Admin',
          'ROLE_USER': 'User'
        };
        
        const highestRole = apiUser.roles
          .map(role => roleMap[role] || role.replace('ROLE_', ''))
          .reduce((prev, curr) => {
            const priority = {
              'Admin': 2,
              'User': 1
            };
            return (priority[prev] || 0) > (priority[curr] || 0) ? prev : curr;
          }, 'User');
        
        // Generate initials from username or name
        const nameToUse = apiUser.name || apiUser.username;
        const initials = nameToUse
          .split(' ')
          .map(n => n[0])
          .join('')
          .toUpperCase()
          .substring(0, 2);
        
        return {
          id: apiUser.id,
          name: apiUser.name || apiUser.username,
          username: apiUser.username,
          email: apiUser.email,
          role: highestRole,
          status: apiUser.enabled ? 'Active' : 'Inactive',
          avatar: apiUser.picture || "/placeholder.svg?height=32&width=32",
          initials: initials,
          joinedDate: new Date().toLocaleDateString(), // This would ideally come from your API
          courses: 0, // This would ideally come from your API
        };
      });
      
      setUsers(transformedUsers);
      
      // Calculate stats
      const totalUsers = transformedUsers.length;
      const activeUsers = transformedUsers.filter(u => u.status === 'Active').length;
      const inactiveUsers = transformedUsers.filter(u => u.status !== 'Active').length;
      
      // This is a placeholder - you should get real data about new users from your API
      const newUsers = Math.floor(totalUsers * 0.1); // Just assuming 10% are new users for now
      
      setStats({
        totalUsers,
        activeUsers,
        newUsers,
        inactiveUsers
      });
      
      setLoading(false);
    } catch (err) {
      console.error('Error fetching users:', err);
      setError(err instanceof Error ? err.message : 'Error connecting to server');
      setLoading(false);
    }
  };

  const handleDelete = async (userId: string) => {
    if (!confirm('Are you sure you want to delete this user?')) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:8080/api/admin/users/${userId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (response.ok) {
        setUsers(users.filter(user => user.id !== userId));
        setSelectedUsers(selectedUsers.filter(id => id !== userId));
        
        // Update stats
        const userToDelete = users.find(u => u.id === userId);
        if (userToDelete) {
          const newStats = {...stats};
          newStats.totalUsers--;
          if (userToDelete.status === 'Active') {
            newStats.activeUsers--;
          } else {
            newStats.inactiveUsers--;
          }
          setStats(newStats);
        }

        // Show success alert
        setAlert({
          type: 'success',
          title: 'Success!',
          description: 'User deleted successfully.'
        });
        setTimeout(() => setAlert(null), 3000);
      } else {
        setAlert({
          type: 'error',
          title: 'Error',
          description: 'Failed to delete user.'
        });
        setTimeout(() => setAlert(null), 3000);
      }
    } catch (err) {
      setAlert({
        type: 'error',
        title: 'Error',
        description: 'Error connecting to server.'
      });
      setTimeout(() => setAlert(null), 3000);
    }
  };

  const handleEdit = (user: User) => {
    setEditingUser(user)
    setEditForm({
      name: user.name || '',
      email: user.email || '',
      role: user.role
    })
    setIsEditDialogOpen(true)
  }

  const handleEditSubmit = async () => {
    if (!editingUser) return

    try {
      // First update user details
      const response = await fetch(`http://localhost:8080/api/admin/users/${editingUser.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          name: editForm.name,
          email: editForm.email
        })
      });

      if (!response.ok) {
        throw new Error('Failed to update user');
      }

      // Then update role if changed
      if (editForm.role !== editingUser.role) {
        const roleResponse = await fetch(`http://localhost:8080/api/admin/users/${editingUser.id}/role`, {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            roles: [editForm.role === 'Admin' ? 'ROLE_ADMIN' : 'ROLE_USER']
          })
        });

        if (!roleResponse.ok) {
          throw new Error('Failed to update user role');
        }
      }

      // Update the user in the local state
      setUsers(users.map(u => 
        u.id === editingUser.id 
          ? {
              ...u,
              name: editForm.name,
              email: editForm.email,
              role: editForm.role,
              initials: editForm.name.split(' ').map(n => n[0]).join('').toUpperCase()
            }
          : u
      ));

      setIsEditDialogOpen(false)
      setEditingUser(null)
      setEditForm({ name: '', email: '', role: '' })
      
      // Show success alert
      setAlert({
        type: 'success',
        title: 'Success!',
        description: 'User details updated successfully.'
      });
      
      // Clear alert after 3 seconds
      setTimeout(() => setAlert(null), 3000);
    } catch (error) {
      console.error('Error updating user:', error);
      setAlert({
        type: 'error',
        title: 'Error',
        description: 'Failed to update user details. Please try again.'
      });
      setTimeout(() => setAlert(null), 3000);
    }
  }

  // Handle select all users
  const handleSelectAll = () => {
    if (selectedUsers.length === filteredUsers.length) {
      setSelectedUsers([])
    } else {
      setSelectedUsers(filteredUsers.map((user) => user.id))
    }
  }

  // Handle select individual user
  const handleSelectUser = (userId: string) => {
    if (selectedUsers.includes(userId)) {
      setSelectedUsers(selectedUsers.filter((id) => id !== userId))
    } else {
      setSelectedUsers([...selectedUsers, userId])
    }
  }

  // Filter users based on search query, role, and status
  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.username.toLowerCase().includes(searchQuery.toLowerCase())

    const matchesRole = roleFilter === "all" || user.role === roleFilter
    const matchesStatus = statusFilter === "all" || user.status === statusFilter

    return matchesSearch && matchesRole && matchesStatus
  })

  // Calculate pagination
  const indexOfLastUser = currentPage * usersPerPage;
  const indexOfFirstUser = indexOfLastUser - usersPerPage;
  const currentUsers = filteredUsers.slice(indexOfFirstUser, indexOfLastUser);
  const totalPages = Math.ceil(filteredUsers.length / usersPerPage);

  // Handle page change
  const handlePageChange = (pageNumber: number) => {
    setCurrentPage(pageNumber);
  };

  // Validate a single field
  const validateField = (name: string, value: string) => {
    let error = '';
    
    switch (name) {
      case 'username':
        if (!value.trim()) {
          error = 'Username is required';
        } else if (value.length < 3) {
          error = 'Username must be at least 3 characters';
        } else if (!/^[a-zA-Z0-9_]+$/.test(value)) {
          error = 'Username can only contain letters, numbers, and underscores';
        }
        break;
        
      case 'email':
        if (!value.trim()) {
          error = 'Email is required';
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
          error = 'Please enter a valid email address';
        }
        break;
        
      case 'password':
        if (!value.trim()) {
          error = 'Password is required';
        } else if (value.length < 8) {
          error = 'Password must be at least 8 characters';
        } else if (!/(?=.*[a-z])/.test(value)) {
          error = 'Password must include at least one lowercase letter';
        } else if (!/(?=.*[A-Z])/.test(value)) {
          error = 'Password must include at least one uppercase letter';
        } else if (!/(?=.*\d)/.test(value)) {
          error = 'Password must include at least one number';
        }
        break;
        
      case 'confirmPassword':
        if (!value.trim()) {
          error = 'Please confirm your password';
        } else if (value !== createForm.password) {
          error = 'Passwords do not match';
        }
        break;
        
      case 'name':
        // Name is optional, but if provided, validate it
        if (value.trim() && value.length < 2) {
          error = 'Name must be at least 2 characters';
        }
        break;
    }
    
    return error;
  };

  // Handle field change with validation
  const handleFieldChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    
    // Update form data
    setCreateForm({
      ...createForm,
      [name]: value
    });
    
    // Validate the field
    const error = validateField(name, value);
    
    // Update error state
    setFormErrors({
      ...formErrors,
      [name]: error
    });
    
    // If this is a password field, also validate confirmPassword
    if (name === 'password') {
      const confirmError = createForm.confirmPassword 
        ? (value !== createForm.confirmPassword ? 'Passwords do not match' : '')
        : '';
      
      setFormErrors(prev => ({
        ...prev,
        confirmPassword: confirmError
      }));
    }
  };

  // Validate the entire form
  const validateForm = () => {
    const errors = {
      username: validateField('username', createForm.username),
      email: validateField('email', createForm.email),
      password: validateField('password', createForm.password),
      confirmPassword: validateField('confirmPassword', createForm.confirmPassword),
      name: validateField('name', createForm.name)
    };
    
    setFormErrors(errors);
    
    // Form is valid if there are no errors
    return !Object.values(errors).some(error => error !== '');
  };

  // Add a handler for creating a new user
  const handleCreateUser = async () => {
    try {
      // Validate the form
      if (!validateForm()) {
        throw new Error('Please fix the errors in the form');
      }

      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Authentication required');
      }

      // Prepare the request body
      const userData = {
        username: createForm.username,
        name: createForm.name,
        email: createForm.email,
        password: createForm.password,
        roles: [createForm.role === 'Admin' ? 'ROLE_ADMIN' : 'ROLE_USER']
      };

      const response = await fetch('http://localhost:8080/api/admin/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(userData)
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Failed to create user (${response.status})`);
      }

      const newUser = await response.json();

      // Create a UI-friendly user object
      const nameToUse = newUser.name || newUser.username;
      const initials = nameToUse
        .split(' ')
        .map((n: string) => n[0])
        .join('')
        .toUpperCase()
        .substring(0, 2);

      const uiUser: User = {
        id: newUser.id,
        name: newUser.name || newUser.username,
        username: newUser.username,
        email: newUser.email,
        role: createForm.role,
        status: 'Active',
        avatar: newUser.picture || "/placeholder.svg?height=32&width=32",
        initials: initials,
        joinedDate: new Date().toLocaleDateString(),
        courses: 0
      };

      // Add the new user to the state
      setUsers([uiUser, ...users]);
      
      // Update stats
      setStats({
        ...stats,
        totalUsers: stats.totalUsers + 1,
        activeUsers: stats.activeUsers + 1
      });

      // Reset form and close dialog
      setCreateForm({
        username: '',
        name: '',
        email: '',
        password: '',
        confirmPassword: '',
        role: 'User'
      });
      
      // Reset errors
      setFormErrors({
        username: '',
        email: '',
        password: '',
        confirmPassword: '',
        name: ''
      });
      
      setIsCreateDialogOpen(false);

      // Show success alert
      setAlert({
        type: 'success',
        title: 'Success!',
        description: 'User created successfully.'
      });
      setTimeout(() => setAlert(null), 3000);
    } catch (error) {
      console.error('Error creating user:', error);
      setAlert({
        type: 'error',
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to create user'
      });
      setTimeout(() => setAlert(null), 3000);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh] animate-fade-in">
        <div className="flex flex-col items-center">
          <Loader2 className="h-12 w-12 text-primary animate-spin mb-4" />
          <p className="text-muted-foreground">Loading users...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[60vh] animate-fade-in">
        <div className="flex flex-col items-center max-w-md text-center">
          <div className="bg-red-100 p-3 rounded-full mb-4">
            <Users className="h-12 w-12 text-red-600" />
          </div>
          <h3 className="text-xl font-medium mb-2">Error Loading Users</h3>
          <p className="text-muted-foreground mb-4">{error}</p>
          <Button 
            onClick={fetchUsers}
            className="transition-all duration-300 hover:scale-105 hover:shadow-md active:scale-95"
          >
            Retry
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Alert Component */}
      {alert && (
        <Alert 
          variant={alert.type === 'error' ? 'destructive' : 'default'}
          className="animate-fade-in"
        >
          <Terminal className="h-4 w-4" />
          <AlertTitle>{alert.title}</AlertTitle>
          <AlertDescription>{alert.description}</AlertDescription>
        </Alert>
      )}

      <div 
        className="flex flex-col md:flex-row justify-between gap-4 md:items-center transform transition-all duration-700 opacity-0 translate-y-4"
        style={{
          animationName: mounted ? 'fadeInUp' : 'none',
          animationDuration: '0.6s',
          animationFillMode: 'forwards'
        }}
      >
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Users</h1>
          <p className="text-muted-foreground">Manage your platform users and their permissions</p>
        </div>
        <div className="flex gap-2">
          <Button 
            className="transition-all duration-300 hover:scale-105 hover:shadow-md active:scale-95"
            onClick={() => setIsCreateDialogOpen(true)}
          >
            <UserPlus className="mr-2 h-4 w-4" />
            Add New User
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        {[
          { icon: <Users className="h-6 w-6 text-primary" />, title: "Total Users", value: stats.totalUsers.toString(), bgClass: "bg-primary/10" },
          { icon: <UserCheck className="h-6 w-6 text-green-600" />, title: "Active Users", value: stats.activeUsers.toString(), bgClass: "bg-green-100" },
          { icon: <UserPlus className="h-6 w-6 text-yellow-600" />, title: "New This Month", value: stats.newUsers.toString(), bgClass: "bg-yellow-100" },
          { icon: <UserX className="h-6 w-6 text-red-600" />, title: "Inactive Users", value: stats.inactiveUsers.toString(), bgClass: "bg-red-100" }
        ].map((stat, i) => (
          <Card 
            key={stat.title} 
            className="border-0 shadow-md transition-all duration-300 hover:shadow-lg hover:scale-[1.02]"
            style={{
              transform: 'translateY(20px)',
              opacity: 0,
              animation: mounted ? `fadeInUp 0.6s ease-out forwards ${0.1 + i * 0.1}s` : 'none'
            }}
          >
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className={`${stat.bgClass} p-3 rounded-full`}>
                  {stat.icon}
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">{stat.title}</p>
                  <h3 className="text-2xl font-bold">{stat.value}</h3>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Filters and Search */}
      <div 
        className="flex flex-col md:flex-row gap-4"
        style={{
          transform: 'translateY(20px)',
          opacity: 0,
          animation: mounted ? 'fadeInUp 0.6s ease-out forwards 0.5s' : 'none'
        }}
      >
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search users..."
            className="pl-8 transition-all duration-300 focus:scale-[1.01]"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="flex gap-2">
          <Select value={roleFilter} onValueChange={setRoleFilter}>
            <SelectTrigger className="w-[180px] transition-all duration-300 hover:bg-muted/50">
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4" />
                <span>Role: {roleFilter === "all" ? "All" : roleFilter}</span>
              </div>
            </SelectTrigger>
            <SelectContent className="animate-fade-in-up">
              <SelectItem value="all">All Roles</SelectItem>
              <SelectItem value="User">User</SelectItem>
              <SelectItem value="Admin">Admin</SelectItem>
            </SelectContent>
          </Select>

          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[180px] transition-all duration-300 hover:bg-muted/50">
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4" />
                <span>Status: {statusFilter === "all" ? "All" : statusFilter}</span>
              </div>
            </SelectTrigger>
            <SelectContent className="animate-fade-in-up">
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="Active">Active</SelectItem>
              <SelectItem value="Inactive">Inactive</SelectItem>
              <SelectItem value="Pending">Pending</SelectItem>
              <SelectItem value="Suspended">Suspended</SelectItem>
            </SelectContent>
          </Select>

          <Button 
            variant="outline" 
            size="icon" 
            className="transition-all duration-300 hover:scale-105 hover:bg-muted/50 active:scale-95"
          >
            <Download className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Users Table */}
      <Card 
        className="border-0 shadow-md transition-all duration-300 hover:shadow-lg"
        style={{
          transform: 'translateY(20px)',
          opacity: 0,
          animation: mounted ? 'fadeInUp 0.6s ease-out forwards 0.6s' : 'none'
        }}
      >
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12">
                  <Checkbox
                    checked={selectedUsers.length === filteredUsers.length}
                    onCheckedChange={handleSelectAll}
                  />
                </TableHead>
                <TableHead>User</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {currentUsers.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>
                    <Checkbox
                      checked={selectedUsers.includes(user.id)}
                      onCheckedChange={() => handleSelectUser(user.id)}
                    />
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar className="h-10 w-10">
                        <AvatarImage 
                          src={user.avatar !== "/placeholder.svg?height=32&width=32" ? user.avatar : ""} 
                          alt={user.name} 
                        />
                        <AvatarFallback className="bg-primary/10 text-primary font-medium">
                          {user.initials}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-medium">{user.name}</div>
                        <div className="text-sm text-muted-foreground">{user.username}</div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className={getRoleBadgeClass(user.role)}>
                      {user.role}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className={getStatusBadgeClass(user.status)}>
                      {user.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <span className="sr-only">Open menu</span>
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleEdit(user)}>
                          <Pencil className="mr-2 h-4 w-4" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleDelete(user.id)} className="text-red-600">
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Only show pagination if there are more than one page */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between px-2">
          <div className="flex-1 text-sm text-muted-foreground">
            Showing {indexOfFirstUser + 1} to {Math.min(indexOfLastUser, filteredUsers.length)} of {filteredUsers.length} users
          </div>
          <div className="flex items-center space-x-6 lg:space-x-8">
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
              >
                Previous
              </Button>
              <div className="flex items-center gap-1">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <Button
                    key={page}
                    variant={currentPage === page ? "default" : "outline"}
                    size="sm"
                    onClick={() => handlePageChange(page)}
                  >
                    {page}
                  </Button>
                ))}
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
              >
                Next
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Edit User Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Edit User</DialogTitle>
            <DialogDescription>
              Make changes to the user's information here. Click save when you're done.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">
                Name
              </Label>
              <Input
                id="name"
                value={editForm.name}
                onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="email" className="text-right">
                Email
              </Label>
              <Input
                id="email"
                type="email"
                value={editForm.email}
                onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="role" className="text-right">
                Role
              </Label>
              <Select
                value={editForm.role}
                onValueChange={(value) => setEditForm({ ...editForm, role: value })}
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Select a role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Admin">Admin</SelectItem>
                  <SelectItem value="User">User</SelectItem>
                </SelectContent>
              </Select>
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

      {/* Add Create User Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Create New User</DialogTitle>
            <DialogDescription>
              Add a new user to the platform. All fields are required except name.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="username" className="text-right">
                Username
              </Label>
              <div className="col-span-3 space-y-1">
                <Input
                  id="username"
                  name="username"
                  className={formErrors.username ? "border-red-500" : ""}
                  value={createForm.username}
                  onChange={handleFieldChange}
                  onBlur={() => {
                    const error = validateField('username', createForm.username);
                    setFormErrors({...formErrors, username: error});
                  }}
                />
                {formErrors.username && (
                  <p className="text-xs text-red-500">{formErrors.username}</p>
                )}
              </div>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">
                Name
              </Label>
              <div className="col-span-3 space-y-1">
                <Input
                  id="name"
                  name="name"
                  className={formErrors.name ? "border-red-500" : ""}
                  value={createForm.name}
                  onChange={handleFieldChange}
                  onBlur={() => {
                    const error = validateField('name', createForm.name);
                    setFormErrors({...formErrors, name: error});
                  }}
                />
                {formErrors.name && (
                  <p className="text-xs text-red-500">{formErrors.name}</p>
                )}
              </div>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="email" className="text-right">
                Email
              </Label>
              <div className="col-span-3 space-y-1">
                <Input
                  id="email"
                  name="email"
                  type="email"
                  className={formErrors.email ? "border-red-500" : ""}
                  value={createForm.email}
                  onChange={handleFieldChange}
                  onBlur={() => {
                    const error = validateField('email', createForm.email);
                    setFormErrors({...formErrors, email: error});
                  }}
                />
                {formErrors.email && (
                  <p className="text-xs text-red-500">{formErrors.email}</p>
                )}
              </div>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="password" className="text-right">
                Password
              </Label>
              <div className="col-span-3 space-y-1">
                <Input
                  id="password"
                  name="password"
                  type="password"
                  className={formErrors.password ? "border-red-500" : ""}
                  value={createForm.password}
                  onChange={handleFieldChange}
                  onBlur={() => {
                    const error = validateField('password', createForm.password);
                    setFormErrors({...formErrors, password: error});
                  }}
                />
                {formErrors.password && (
                  <p className="text-xs text-red-500">{formErrors.password}</p>
                )}
                <p className="text-xs text-muted-foreground">
                  Must be at least 8 characters with uppercase, lowercase and numbers
                </p>
              </div>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="confirmPassword" className="text-right">
                Confirm Password
              </Label>
              <div className="col-span-3 space-y-1">
                <Input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  className={formErrors.confirmPassword ? "border-red-500" : ""}
                  value={createForm.confirmPassword}
                  onChange={handleFieldChange}
                  onBlur={() => {
                    const error = validateField('confirmPassword', createForm.confirmPassword);
                    setFormErrors({...formErrors, confirmPassword: error});
                  }}
                />
                {formErrors.confirmPassword && (
                  <p className="text-xs text-red-500">{formErrors.confirmPassword}</p>
                )}
              </div>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="role" className="text-right">
                Role
              </Label>
              <Select 
                value={createForm.role} 
                onValueChange={(value) => setCreateForm({...createForm, role: value})}
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Select a role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="User">User</SelectItem>
                  <SelectItem value="Admin">Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setIsCreateDialogOpen(false);
              // Reset form and errors
              setCreateForm({
                username: '',
                name: '',
                email: '',
                password: '',
                confirmPassword: '',
                role: 'User'
              });
              setFormErrors({
                username: '',
                email: '',
                password: '',
                confirmPassword: '',
                name: ''
              });
            }}>Cancel</Button>
            <Button onClick={handleCreateUser}>Create User</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

// Helper functions for badge styling
function getRoleBadgeClass(role: string) {
  switch (role) {
    case "Admin":
      return "text-purple-600 bg-purple-100 border-purple-200"
    case "User":
    default:
      return "text-green-600 bg-green-100 border-green-200"
  }
}

function getStatusBadgeClass(status: string) {
  switch (status) {
    case "Active":
      return "text-green-600 bg-green-100 border-green-200"
    case "Inactive":
      return "text-gray-600 bg-gray-100 border-gray-200"
    case "Pending":
      return "text-yellow-600 bg-yellow-100 border-yellow-200"
    case "Suspended":
      return "text-red-600 bg-red-100 border-red-200"
    default:
      return ""
  }
}
