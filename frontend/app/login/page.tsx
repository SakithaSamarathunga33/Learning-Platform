"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Separator } from "@/components/ui/separator"
import { Eye, EyeOff, Mail } from "lucide-react"

// Login form schema
const loginFormSchema = z.object({
  username: z.string().min(1, { message: "Username is required" }),
  password: z.string().min(1, { message: "Password is required" }),
  rememberMe: z.boolean().default(false),
})

// Registration form schema
const registerFormSchema = z
  .object({
    username: z.string().min(2, { message: "Username must be at least 2 characters" }),
    email: z.string().email({ message: "Please enter a valid email address" }),
    password: z.string().min(8, { message: "Password must be at least 8 characters" }),
    confirmPassword: z.string(),
    terms: z.boolean().refine((val) => val === true, {
      message: "You must agree to the terms and conditions",
    }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  })

export default function AuthPage() {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState("login")
  const [showLoginPassword, setShowLoginPassword] = useState(false)
  const [showRegisterPassword, setShowRegisterPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [pageLoaded, setPageLoaded] = useState(false)

  useEffect(() => {
    // Check if user was redirected from registration or has a query parameter
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('registered') === 'true') {
      setSuccessMessage('Registration successful! Please log in with your credentials.');
      setActiveTab('login');
    } else if (urlParams.get('tab') === 'register') {
      // Switch to register tab if specified in URL
      setActiveTab('register');
    }

    // Add animation delay for page load
    setTimeout(() => {
      setPageLoaded(true);
    }, 100);
  }, []);

  // Login form
  const loginForm = useForm<z.infer<typeof loginFormSchema>>({
    resolver: zodResolver(loginFormSchema),
    defaultValues: {
      username: "",
      password: "",
      rememberMe: false,
    },
  })

  // Register form
  const registerForm = useForm<z.infer<typeof registerFormSchema>>({
    resolver: zodResolver(registerFormSchema),
    defaultValues: {
      username: "",
      email: "",
      password: "",
      confirmPassword: "",
      terms: false,
    },
  })

  // Handle Google login
  const handleGoogleLogin = () => {
    window.location.href = 'http://localhost:8080/api/auth/google';
  };

  // Handle login form submission
  async function onLoginSubmit(values: z.infer<typeof loginFormSchema>) {
    setIsLoading(true)
    setError(null)
    console.log(values)

    try {
      const response = await fetch('http://localhost:8080/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({
          username: values.username,
          password: values.password,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        if (!data.token) {
          throw new Error('No authentication token received');
        }
        
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        
        // Dispatch custom event to update navbar
        try {
          const event = new CustomEvent('userDataChanged');
          window.dispatchEvent(event);
        } catch (e) {
          console.error('Error creating custom event:', e);
          const event = document.createEvent('Event');
          event.initEvent('userDataChanged', true, true);
          window.dispatchEvent(event);
        }
        
        if (data.user.roles && data.user.roles.includes('ROLE_ADMIN')) {
          console.log('Admin login detected, redirecting to admin dashboard');
          router.push('/admin');
        } else {
          router.push('/');
        }
      } else {
        setError(data.message || 'Login failed. Please check your credentials.');
      }
    } catch (error) {
      console.error('Login error:', error);
      setError('An error occurred during login. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }

  // Handle registration form submission
  async function onRegisterSubmit(values: z.infer<typeof registerFormSchema>) {
    setIsLoading(true)
    setError(null)
    console.log(values)

    try {
      const response = await fetch('http://localhost:8080/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          username: values.username,
          email: values.email,
          password: values.password
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Registration failed');
      }

      // Switch to login tab after successful registration
      setSuccessMessage('Registration successful! Please log in with your credentials.');
      setActiveTab('login');
      registerForm.reset();
    } catch (err) {
      console.error('Registration error:', err);
      setError(err instanceof Error ? err.message : 'An error occurred during registration. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden">
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/20 via-background to-background"></div>
      
      {/* Animated background elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-5 pointer-events-none">
        <div className="absolute top-1/4 -left-10 w-72 h-72 bg-primary/10 rounded-full mix-blend-multiply filter blur-3xl opacity-50 animate-blob"></div>
        <div className="absolute top-2/3 -right-10 w-72 h-72 bg-secondary/10 rounded-full mix-blend-multiply filter blur-3xl opacity-50 animate-blob animation-delay-2000"></div>
        <div className="absolute bottom-1/4 left-1/3 w-72 h-72 bg-accent/10 rounded-full mix-blend-multiply filter blur-3xl opacity-50 animate-blob animation-delay-4000"></div>
          </div>

      <div className="flex-1 flex items-center justify-center p-4 sm:p-8">
        <div className={`w-full max-w-md transition-all duration-1000 ${pageLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold animate-fade-in">Welcome</h1>
            <p className="text-muted-foreground mt-2 animate-fade-in animation-delay-200">Join our community of learners and instructors</p>
        </div>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full animate-fade-in animation-delay-300">
            <TabsList className="grid w-full grid-cols-2 mb-8">
              <TabsTrigger value="login" className="transition-all">Sign In</TabsTrigger>
              <TabsTrigger value="register" className="transition-all">Register</TabsTrigger>
            </TabsList>

            {/* Login Tab */}
            <TabsContent value="login" className="animate-fade-in animation-delay-400">
              <Card className="border-none shadow-lg transition-all hover:shadow-xl">
                <CardHeader className="space-y-1">
                  <CardTitle className="text-2xl font-bold text-center">Sign in to your account</CardTitle>
                  <CardDescription className="text-center">
                    Enter your credentials to access your account
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
            {error && (
                    <div className="p-3 rounded-md bg-destructive/10 text-destructive text-sm animate-shake">
                      {error}
              </div>
            )}
            {successMessage && (
                    <div className="p-3 rounded-md bg-green-100 text-green-800 text-sm dark:bg-green-900/20 dark:text-green-400 animate-fade-in">
                      {successMessage}
              </div>
            )}

                  <Form {...loginForm}>
                    <form onSubmit={loginForm.handleSubmit(onLoginSubmit)} className="space-y-4">
                      <FormField
                        control={loginForm.control}
                      name="username"
                        render={({ field }) => (
                          <FormItem className="transition-all duration-300 hover:scale-[1.01]">
                            <FormLabel>Username</FormLabel>
                            <FormControl>
                              <Input placeholder="Enter your username" {...field} className="h-11 transition-all focus:scale-[1.02]" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={loginForm.control}
                        name="password"
                        render={({ field }) => (
                          <FormItem className="transition-all duration-300 hover:scale-[1.01]">
                            <div className="flex items-center justify-between">
                              <FormLabel>Password</FormLabel>
                              <Button variant="link" className="p-0 h-auto text-xs transition-all hover:text-primary" type="button">
                                Forgot password?
                              </Button>
                  </div>
                            <FormControl>
                              <div className="relative">
                                <Input
                                  type={showLoginPassword ? "text" : "password"}
                                  placeholder="••••••••"
                                  {...field}
                                  className="h-11 transition-all focus:scale-[1.02]"
                                />
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="icon"
                                  className="absolute right-0 top-0 h-full px-3 transition-all"
                                  onClick={() => setShowLoginPassword(!showLoginPassword)}
                                >
                                  {showLoginPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                </Button>
                </div>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={loginForm.control}
                        name="rememberMe"
                        render={({ field }) => (
                          <FormItem className="flex items-center space-x-2 space-y-0 transition-all duration-300">
                            <FormControl>
                              <Checkbox checked={field.value} onCheckedChange={field.onChange} className="transition-all hover:scale-110" />
                            </FormControl>
                            <FormLabel className="text-sm font-normal">Remember me for 30 days</FormLabel>
                          </FormItem>
                        )}
                      />
                      <Button 
                  type="submit"
                        className="w-full h-11 text-base transition-all hover:scale-[1.02] hover:shadow-md duration-300 active:scale-95" 
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <div className="flex items-center">
                            <svg
                              className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                              xmlns="http://www.w3.org/2000/svg"
                              fill="none"
                              viewBox="0 0 24 24"
                            >
                              <circle
                                className="opacity-25"
                                cx="12"
                                cy="12"
                                r="10"
                                stroke="currentColor"
                                strokeWidth="4"
                              ></circle>
                              <path
                                className="opacity-75"
                                fill="currentColor"
                                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                              ></path>
                            </svg>
                      Signing in...
                    </div>
                  ) : (
                          "Sign in"
                  )}
                      </Button>
                    </form>
                  </Form>

                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                      <Separator className="w-full" />
                  </div>
                    <div className="relative flex justify-center text-xs uppercase">
                      <span className="bg-background px-2 text-muted-foreground">Or continue with</span>
                  </div>
                </div>

                  <div className="flex justify-center">
                    <Button 
                      variant="outline" 
                      type="button" 
                      className="h-11 transition-all duration-300 hover:scale-[1.03] hover:shadow-sm hover:bg-muted/50 active:scale-95" 
                      disabled={isLoading} 
                      onClick={handleGoogleLogin}
                    >
                      <Mail className="mr-2 h-4 w-4" />
                      Google
                    </Button>
                  </div>
                </CardContent>
                <CardFooter className="flex flex-col items-center">
                  <p className="text-sm text-muted-foreground mt-2">
                    Don&apos;t have an account?{" "}
                    <Button variant="link" className="p-0 h-auto transition-all hover:scale-105" onClick={() => setActiveTab("register")}>
                      Register
                    </Button>
                  </p>
                </CardFooter>
              </Card>
            </TabsContent>

            {/* Register Tab */}
            <TabsContent value="register" className="animate-fade-in animation-delay-400">
              <Card className="border-none shadow-lg transition-all hover:shadow-xl">
                <CardHeader className="space-y-1">
                  <CardTitle className="text-2xl font-bold text-center">Create an account</CardTitle>
                  <CardDescription className="text-center">
                    Enter your information to create your account
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {error && <div className="p-3 rounded-md bg-destructive/10 text-destructive text-sm animate-shake">{error}</div>}

                  <Form {...registerForm}>
                    <form onSubmit={registerForm.handleSubmit(onRegisterSubmit)} className="space-y-4">
                      <FormField
                        control={registerForm.control}
                        name="username"
                        render={({ field }) => (
                          <FormItem className="transition-all duration-300 hover:scale-[1.01]">
                            <FormLabel>Username</FormLabel>
                            <FormControl>
                              <Input placeholder="Choose a username" {...field} className="h-11 transition-all focus:scale-[1.02]" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={registerForm.control}
                        name="email"
                        render={({ field }) => (
                          <FormItem className="transition-all duration-300 hover:scale-[1.01]">
                            <FormLabel>Email</FormLabel>
                            <FormControl>
                              <Input placeholder="you@example.com" {...field} className="h-11 transition-all focus:scale-[1.02]" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={registerForm.control}
                        name="password"
                        render={({ field }) => (
                          <FormItem className="transition-all duration-300 hover:scale-[1.01]">
                            <FormLabel>Password</FormLabel>
                            <FormControl>
                              <div className="relative">
                                <Input
                                  type={showRegisterPassword ? "text" : "password"}
                                  placeholder="••••••••"
                                  {...field}
                                  className="h-11 transition-all focus:scale-[1.02]"
                                />
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="icon"
                                  className="absolute right-0 top-0 h-full px-3 transition-all"
                                  onClick={() => setShowRegisterPassword(!showRegisterPassword)}
                                >
                                  {showRegisterPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                </Button>
                              </div>
                            </FormControl>
                            <FormDescription className="text-xs">
                              Password must be at least 8 characters long
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={registerForm.control}
                        name="confirmPassword"
                        render={({ field }) => (
                          <FormItem className="transition-all duration-300 hover:scale-[1.01]">
                            <FormLabel>Confirm Password</FormLabel>
                            <FormControl>
                              <div className="relative">
                                <Input
                                  type={showConfirmPassword ? "text" : "password"}
                                  placeholder="••••••••"
                                  {...field}
                                  className="h-11 transition-all focus:scale-[1.02]"
                                />
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="icon"
                                  className="absolute right-0 top-0 h-full px-3 transition-all"
                                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                >
                                  {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                </Button>
                              </div>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={registerForm.control}
                        name="terms"
                        render={({ field }) => (
                          <FormItem className="flex items-start space-x-2 space-y-0 transition-all duration-300">
                            <FormControl>
                              <Checkbox checked={field.value} onCheckedChange={field.onChange} className="transition-all hover:scale-110" />
                            </FormControl>
                            <div className="space-y-1 leading-none">
                              <FormLabel className="text-sm font-normal">
                                I agree to the{" "}
                                <Button variant="link" className="p-0 h-auto text-sm transition-all hover:text-primary">
                                  terms of service
                                </Button>{" "}
                                and{" "}
                                <Button variant="link" className="p-0 h-auto text-sm transition-all hover:text-primary">
                                  privacy policy
                                </Button>
                              </FormLabel>
                              <FormMessage />
                            </div>
                          </FormItem>
                        )}
                      />
                      <Button 
                        type="submit" 
                        className="w-full h-11 text-base transition-all hover:scale-[1.02] hover:shadow-md duration-300 active:scale-95" 
                        disabled={isLoading}
                      >
                        {isLoading ? (
                          <div className="flex items-center">
                            <svg
                              className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                              xmlns="http://www.w3.org/2000/svg"
                              fill="none"
                              viewBox="0 0 24 24"
                            >
                              <circle
                                className="opacity-25"
                                cx="12"
                                cy="12"
                                r="10"
                                stroke="currentColor"
                                strokeWidth="4"
                              ></circle>
                      <path
                                className="opacity-75"
                                fill="currentColor"
                                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                              ></path>
                    </svg>
                            Creating account...
                          </div>
                        ) : (
                          "Create Account"
                        )}
                      </Button>
                    </form>
                  </Form>

                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <Separator className="w-full" />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                      <span className="bg-background px-2 text-muted-foreground">Or continue with</span>
                </div>
              </div>

                  <div className="flex justify-center">
                    <Button
                      variant="outline"
                      type="button"
                      className="h-11 transition-all duration-300 hover:scale-[1.03] hover:shadow-sm hover:bg-muted/50 active:scale-95"
                      disabled={isLoading}
                      onClick={handleGoogleLogin}
                    >
                      <Mail className="mr-2 h-4 w-4" />
                      Google
                    </Button>
                  </div>
                </CardContent>
                <CardFooter className="flex flex-col items-center">
                  <p className="text-sm text-muted-foreground mt-2">
                    Already have an account?{" "}
                    <Button variant="link" className="p-0 h-auto transition-all hover:scale-105" onClick={() => setActiveTab("login")}>
                      Sign in
                    </Button>
                  </p>
                </CardFooter>
              </Card>
            </TabsContent>
          </Tabs>

          <div className="mt-8 text-center text-sm text-muted-foreground animate-fade-in animation-delay-500">
            <p>
              By signing in or creating an account, you agree to our{" "}
              <Link href="#" className="text-primary hover:underline transition-colors">
                Terms of Service
              </Link>{" "}
              and{" "}
              <Link href="#" className="text-primary hover:underline transition-colors">
                Privacy Policy
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
