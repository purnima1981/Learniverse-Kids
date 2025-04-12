import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { FcGoogle } from "react-icons/fc";
import { SiFacebook, SiApple } from "react-icons/si";
import { Sparkles, Rocket, Star, Globe, Book, Atom } from "lucide-react";

// Import images and styles
import learniverseIllustration from "../assets/images/space/space-bg.png";
import learniFrame from "../assets/images/learniverse-login.png";
import "../assets/css/space-theme.css";

const loginSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

const registerSchema = z.object({
  firstName: z.string().min(2, "First name must be at least 2 characters"),
  lastName: z.string().min(2, "Last name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  grade: z.string().min(1, "Please select a grade"),
  gender: z.string().min(1, "Please select a gender option"),
});

type LoginValues = z.infer<typeof loginSchema>;
type RegisterValues = z.infer<typeof registerSchema>;

export default function NewAuthPage() {
  const [activeTab, setActiveTab] = useState("login");
  const { loginMutation, registerMutation, user } = useAuth();
  const [_, setLocation] = useLocation();
  const { toast } = useToast();

  // Redirect to appropriate page based on login state and theme selection
  useEffect(() => {
    if (user) {
      // If user has a theme selected, go to dashboard, otherwise go to theme selection
      if (user.themeId) {
        setLocation("/dashboard");
      } else {
        setLocation("/theme-selection");
      }
    }
  }, [user, setLocation]);

  const loginForm = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const registerForm = useForm<RegisterValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      password: "",
      grade: "",
      gender: "",
    },
  });

  const onLogin = async (data: LoginValues) => {
    try {
      // Create the data structure expected by the backend
      const loginData = {
        username: data.email, // backend expects username field
        password: data.password,
      };
      
      console.log("Submitting login data:", loginData);
      await loginMutation.mutateAsync(loginData);
      toast({
        title: "Login successful",
        description: "Welcome back to Learniverse!"
      });
    } catch (error) {
      console.error("Login error:", error);
      toast({
        title: "Login failed",
        description: "Invalid email or password",
        variant: "destructive",
      });
    }
  };

  const onRegister = async (data: RegisterValues) => {
    try {
      // Create the data structure expected by the backend
      const registerData = {
        ...data,
        username: data.email, // backend expects username field
      };
      
      console.log("Submitting register data:", registerData);
      await registerMutation.mutateAsync(registerData);
      toast({
        title: "Registration successful",
        description: "Welcome to Learniverse!"
      });
    } catch (error) {
      console.error("Registration error:", error);
      toast({
        title: "Registration failed",
        description: "Could not create your account. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleSocialLogin = (provider: string) => {
    toast({
      title: `${provider} login`,
      description: `Redirecting to ${provider} for authentication...`,
    });
    // This would be a redirect to the social auth endpoint
    // window.location.href = `/api/auth/${provider.toLowerCase()}`;
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row overflow-hidden">
      {/* Left Side - Space Imagery */}
      <div className="relative w-full md:w-1/2 bg-gradient-to-br from-indigo-900 via-purple-900 to-blue-900 p-6 md:p-12 flex flex-col justify-center">
        {/* Stars animation using absolute positioning */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="stars-1"></div>
          <div className="stars-2"></div>
          <div className="stars-3"></div>
        </div>
        
        <div className="relative z-10 text-white max-w-2xl mx-auto">
          <div className="flex items-center mb-6">
            <Rocket className="h-10 w-10 text-yellow-400 mr-4" />
            <h1 className="text-4xl md:text-5xl font-bold">Learniverse</h1>
          </div>
          
          <p className="text-xl mb-8 text-blue-100">
            Explore a universe of learning through immersive educational journeys
          </p>
          
          {/* Features with space-themed icons */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
            <div className="bg-blue-900/40 backdrop-blur-sm rounded-xl p-5 border border-blue-700/30 transform transition-all hover:scale-105">
              <div className="flex items-center mb-3">
                <Globe className="h-6 w-6 text-cyan-400 mr-3" />
                <h3 className="text-xl font-semibold">Themed Journeys</h3>
              </div>
              <p className="text-blue-100">Embark on educational adventures through interactive stories and themes</p>
            </div>
            
            <div className="bg-blue-900/40 backdrop-blur-sm rounded-xl p-5 border border-blue-700/30 transform transition-all hover:scale-105">
              <div className="flex items-center mb-3">
                <Atom className="h-6 w-6 text-green-400 mr-3" />
                <h3 className="text-xl font-semibold">Subject Connections</h3>
              </div>
              <p className="text-blue-100">See how math, science, and language arts connect in our interdisciplinary approach</p>
            </div>
            
            <div className="bg-blue-900/40 backdrop-blur-sm rounded-xl p-5 border border-blue-700/30 transform transition-all hover:scale-105">
              <div className="flex items-center mb-3">
                <Sparkles className="h-6 w-6 text-yellow-400 mr-3" />
                <h3 className="text-xl font-semibold">AI Reading Coach</h3>
              </div>
              <p className="text-blue-100">Get personalized reading assistance with our advanced AI companion</p>
            </div>
            
            <div className="bg-blue-900/40 backdrop-blur-sm rounded-xl p-5 border border-blue-700/30 transform transition-all hover:scale-105">
              <div className="flex items-center mb-3">
                <Star className="h-6 w-6 text-purple-400 mr-3" />
                <h3 className="text-xl font-semibold">Interactive Learning</h3>
              </div>
              <p className="text-blue-100">Engage with interactive quizzes, flashcards and educational games</p>
            </div>
          </div>
          
          {/* Illustration */}
          <div className="relative mx-auto max-w-md">
            <img 
              src={learniverseIllustration} 
              alt="Learniverse illustration"
              className="rounded-lg shadow-2xl border-2 border-indigo-600/50"
            />
            <div className="absolute -top-4 -right-4 bg-yellow-400 text-black font-bold py-2 px-4 rounded-full transform rotate-12">
              Grades 1-8
            </div>
          </div>
        </div>
      </div>
      
      {/* Right Side - Auth Forms */}
      <div className="w-full md:w-1/2 bg-gradient-to-br from-blue-900 to-indigo-900 p-6 md:p-12 flex flex-col items-center justify-center">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-white flex items-center justify-center">
              <Book className="h-7 w-7 mr-3 text-blue-400" />
              Begin Your Journey
            </h2>
            <p className="text-blue-200 mt-2">Sign in or create an account to start exploring</p>
          </div>
          
          <Card className="bg-blue-800/40 backdrop-blur-md border border-blue-700/30 shadow-xl overflow-hidden">
            <CardContent className="pt-6">
              <Tabs
                defaultValue="login"
                value={activeTab}
                onValueChange={setActiveTab}
                className="w-full"
              >
                <TabsList className="grid w-full grid-cols-2 mb-6 bg-blue-950/50">
                  <TabsTrigger value="login" className="rounded-l-lg data-[state=active]:bg-blue-600">Login</TabsTrigger>
                  <TabsTrigger value="register" className="rounded-r-lg data-[state=active]:bg-blue-600">Register</TabsTrigger>
                </TabsList>

                {/* Login Form */}
                <TabsContent value="login">
                  <Form {...loginForm}>
                    <form onSubmit={loginForm.handleSubmit(onLogin)} className="space-y-4">
                      <FormField
                        control={loginForm.control}
                        name="email"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-blue-100">Email Address</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="your.email@example.com"
                                className="bg-blue-900/50 border-blue-700/50 text-white placeholder:text-blue-300/50"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage className="text-red-300" />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={loginForm.control}
                        name="password"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-blue-100">Password</FormLabel>
                            <FormControl>
                              <Input
                                type="password"
                                placeholder="••••••••"
                                className="bg-blue-900/50 border-blue-700/50 text-white placeholder:text-blue-300/50"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage className="text-red-300" />
                          </FormItem>
                        )}
                      />

                      <Button
                        type="submit"
                        className="w-full py-5 bg-blue-600 hover:bg-blue-700 text-white font-bold mt-4"
                        disabled={loginMutation.isPending}
                      >
                        {loginMutation.isPending ? "Logging in..." : "Launch Your Journey"}
                      </Button>

                      <div className="relative my-6">
                        <div className="absolute inset-0 flex items-center">
                          <div className="w-full border-t border-blue-700/30"></div>
                        </div>
                        <div className="relative flex justify-center text-sm">
                          <span className="px-2 bg-blue-800/40 text-blue-200">Or continue with</span>
                        </div>
                      </div>

                      <div className="grid grid-cols-3 gap-3">
                        <Button
                          type="button"
                          variant="outline"
                          className="bg-blue-900/30 border-blue-700/30 hover:bg-blue-800/40 text-white"
                          onClick={() => handleSocialLogin('Google')}
                        >
                          <FcGoogle className="h-5 w-5" />
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          className="bg-blue-900/30 border-blue-700/30 hover:bg-blue-800/40 text-white"
                          onClick={() => handleSocialLogin('Facebook')}
                        >
                          <SiFacebook className="h-5 w-5 text-blue-500" />
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          className="bg-blue-900/30 border-blue-700/30 hover:bg-blue-800/40 text-white"
                          onClick={() => handleSocialLogin('Apple')}
                        >
                          <SiApple className="h-5 w-5" />
                        </Button>
                      </div>

                      <p className="text-center text-blue-200 text-sm mt-6">
                        Don't have an account?{" "}
                        <button
                          type="button"
                          className="text-cyan-400 hover:underline font-medium"
                          onClick={() => setActiveTab("register")}
                        >
                          Register now
                        </button>
                      </p>
                    </form>
                  </Form>
                </TabsContent>

                {/* Register Form */}
                <TabsContent value="register">
                  <Form {...registerForm}>
                    <form onSubmit={registerForm.handleSubmit(onRegister)} className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <FormField
                          control={registerForm.control}
                          name="firstName"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-blue-100">First Name</FormLabel>
                              <FormControl>
                                <Input
                                  placeholder="First name"
                                  className="bg-blue-900/50 border-blue-700/50 text-white placeholder:text-blue-300/50"
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage className="text-red-300" />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={registerForm.control}
                          name="lastName"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-blue-100">Last Name</FormLabel>
                              <FormControl>
                                <Input
                                  placeholder="Last name"
                                  className="bg-blue-900/50 border-blue-700/50 text-white placeholder:text-blue-300/50"
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage className="text-red-300" />
                            </FormItem>
                          )}
                        />
                      </div>

                      <FormField
                        control={registerForm.control}
                        name="email"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-blue-100">Email Address</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="your.email@example.com"
                                className="bg-blue-900/50 border-blue-700/50 text-white placeholder:text-blue-300/50"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage className="text-red-300" />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={registerForm.control}
                        name="password"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-blue-100">Password</FormLabel>
                            <FormControl>
                              <Input
                                type="password"
                                placeholder="••••••••"
                                className="bg-blue-900/50 border-blue-700/50 text-white placeholder:text-blue-300/50"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage className="text-red-300" />
                          </FormItem>
                        )}
                      />

                      <div className="grid grid-cols-2 gap-4">
                        <FormField
                          control={registerForm.control}
                          name="grade"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-blue-100">Grade</FormLabel>
                              <Select
                                onValueChange={field.onChange}
                                defaultValue={field.value}
                              >
                                <FormControl>
                                  <SelectTrigger className="bg-blue-900/50 border-blue-700/50 text-white">
                                    <SelectValue placeholder="Select Grade" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent className="bg-blue-900 border-blue-700 text-white">
                                  {Array.from({ length: 8 }, (_, i) => i + 1).map((grade) => (
                                    <SelectItem key={grade} value={grade.toString()}>
                                      Grade {grade}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              <FormMessage className="text-red-300" />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={registerForm.control}
                          name="gender"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-blue-100">Gender</FormLabel>
                              <Select
                                onValueChange={field.onChange}
                                defaultValue={field.value}
                              >
                                <FormControl>
                                  <SelectTrigger className="bg-blue-900/50 border-blue-700/50 text-white">
                                    <SelectValue placeholder="Select Gender" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent className="bg-blue-900 border-blue-700 text-white">
                                  <SelectItem value="male">Male</SelectItem>
                                  <SelectItem value="female">Female</SelectItem>
                                  <SelectItem value="other">Other</SelectItem>
                                  <SelectItem value="prefer_not_to_say">Prefer not to say</SelectItem>
                                </SelectContent>
                              </Select>
                              <FormMessage className="text-red-300" />
                            </FormItem>
                          )}
                        />
                      </div>

                      <Button
                        type="submit"
                        className="w-full py-5 bg-cyan-600 hover:bg-cyan-700 text-white font-bold mt-4"
                        disabled={registerMutation.isPending}
                      >
                        {registerMutation.isPending ? "Creating account..." : "Start Your Adventure"}
                      </Button>

                      <div className="relative my-6">
                        <div className="absolute inset-0 flex items-center">
                          <div className="w-full border-t border-blue-700/30"></div>
                        </div>
                        <div className="relative flex justify-center text-sm">
                          <span className="px-2 bg-blue-800/40 text-blue-200">Or register with</span>
                        </div>
                      </div>

                      <div className="grid grid-cols-3 gap-3">
                        <Button
                          type="button"
                          variant="outline"
                          className="bg-blue-900/30 border-blue-700/30 hover:bg-blue-800/40 text-white"
                          onClick={() => handleSocialLogin('Google')}
                        >
                          <FcGoogle className="h-5 w-5" />
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          className="bg-blue-900/30 border-blue-700/30 hover:bg-blue-800/40 text-white"
                          onClick={() => handleSocialLogin('Facebook')}
                        >
                          <SiFacebook className="h-5 w-5 text-blue-500" />
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          className="bg-blue-900/30 border-blue-700/30 hover:bg-blue-800/40 text-white"
                          onClick={() => handleSocialLogin('Apple')}
                        >
                          <SiApple className="h-5 w-5" />
                        </Button>
                      </div>

                      <p className="text-center text-blue-200 text-sm mt-6">
                        Already have an account?{" "}
                        <button
                          type="button"
                          className="text-cyan-400 hover:underline font-medium"
                          onClick={() => setActiveTab("login")}
                        >
                          Sign in
                        </button>
                      </p>
                    </form>
                  </Form>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      </div>
      

    </div>
  );
}