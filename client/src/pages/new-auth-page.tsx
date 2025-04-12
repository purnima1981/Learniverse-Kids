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
import { Sparkles, Rocket, Star, Globe, Book, Atom } from "lucide-react";

// Import images and styles
import learniverseIllustration from "../assets/images/space/space-bg.png";
import "../assets/css/auth-animations.css";

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

  // Redirect if user is already logged in
  useEffect(() => {
    if (user) {
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
      const loginData = {
        username: data.email,
        password: data.password,
      };
      
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
      const registerData = {
        ...data,
        username: data.email,
      };
      
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

  return (
    <div className="min-h-screen overflow-hidden relative">
      {/* Animated background with stars */}
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-950 via-purple-900 to-blue-900 overflow-hidden">
        <div className="stars-1"></div>
        <div className="stars-2"></div>
        <div className="stars-3"></div>
      </div>
      
      {/* Main content container */}
      <div className="relative z-10 flex flex-col lg:flex-row min-h-screen">
        {/* Mobile logo (only visible on mobile) */}
        <div className="lg:hidden flex items-center justify-center py-6">
          <div className="animate-float flex items-center space-x-3 bg-indigo-900/60 px-5 py-3 rounded-full backdrop-blur-sm border border-indigo-700/50">
            <Rocket className="h-8 w-8 text-yellow-400" />
            <h1 className="text-3xl font-bold text-white">Learniverse</h1>
          </div>
        </div>
        
        {/* Auth Form Section */}
        <div className="w-full lg:w-5/12 p-6 lg:p-12 flex flex-col items-center justify-center order-2 lg:order-1">
          <div className="w-full max-w-md backdrop-blur-md bg-indigo-900/20 rounded-2xl p-6 border border-indigo-700/30 shadow-xl animate-fadeIn">
            <div className="text-center mb-6">
              <h2 className="text-3xl font-bold text-white flex items-center justify-center">
                <Book className="h-7 w-7 mr-3 text-cyan-400" />
                Begin Your Journey
              </h2>
              <p className="text-blue-200 mt-2">Sign in or create an account to start exploring</p>
            </div>
            
            <Card className="bg-indigo-900/40 backdrop-blur-md border border-indigo-700/30 shadow-lg overflow-hidden">
              <CardContent className="pt-6">
                <Tabs
                  defaultValue="login"
                  value={activeTab}
                  onValueChange={setActiveTab}
                  className="w-full"
                >
                  <TabsList className="grid w-full grid-cols-2 mb-6 bg-indigo-950/70">
                    <TabsTrigger value="login" className="rounded-l-lg data-[state=active]:bg-indigo-600 data-[state=active]:text-white">Login</TabsTrigger>
                    <TabsTrigger value="register" className="rounded-r-lg data-[state=active]:bg-indigo-600 data-[state=active]:text-white">Register</TabsTrigger>
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
                          className="w-full py-5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold mt-4 group relative overflow-hidden"
                          disabled={loginMutation.isPending}
                        >
                          <div className="absolute inset-0 w-3/12 bg-white/20 skew-x-[45deg] group-hover:skew-x-[30deg] -translate-x-32 group-hover:translate-x-56 transition-all duration-1000 ease-in-out"></div>
                          {loginMutation.isPending ? "Logging in..." : "Launch Your Journey"}
                        </Button>
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
                          className="w-full py-5 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 text-white font-bold mt-4 group relative overflow-hidden"
                          disabled={registerMutation.isPending}
                        >
                          <div className="absolute inset-0 w-3/12 bg-white/20 skew-x-[45deg] group-hover:skew-x-[30deg] -translate-x-32 group-hover:translate-x-56 transition-all duration-1000 ease-in-out"></div>
                          {registerMutation.isPending ? "Creating account..." : "Start Your Adventure"}
                        </Button>

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
        
        {/* Feature Section */}
        <div className="w-full lg:w-7/12 p-6 lg:p-12 flex flex-col items-center justify-center order-1 lg:order-2">
          {/* Desktop logo (only visible on desktop) */}
          <div className="hidden lg:block mb-8 animate-float">
            <div className="flex items-center space-x-4 bg-indigo-900/60 px-6 py-3 rounded-full backdrop-blur-sm border border-indigo-700/50">
              <Rocket className="h-10 w-10 text-yellow-400" />
              <h1 className="text-4xl font-bold text-white">Learniverse</h1>
            </div>
          </div>
          
          <div className="max-w-3xl mx-auto">
            <p className="text-xl md:text-2xl mb-8 text-center text-blue-100 animate-fadeIn">
              Explore a universe of learning through immersive educational journeys
            </p>
            
            {/* Feature grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
              <div className="bg-blue-900/40 backdrop-blur-sm rounded-xl p-5 border border-blue-700/30 shadow-lg transform transition-all hover:scale-105 hover:bg-blue-800/40 animate-fadeSlideUp" style={{ animationDelay: '0.1s' }}>
                <div className="flex items-center mb-3">
                  <Globe className="h-6 w-6 text-cyan-400 mr-3" />
                  <h3 className="text-xl font-semibold text-white">Themed Journeys</h3>
                </div>
                <p className="text-blue-100">Embark on educational adventures through interactive stories and themes</p>
              </div>
              
              <div className="bg-blue-900/40 backdrop-blur-sm rounded-xl p-5 border border-blue-700/30 shadow-lg transform transition-all hover:scale-105 hover:bg-blue-800/40 animate-fadeSlideUp" style={{ animationDelay: '0.2s' }}>
                <div className="flex items-center mb-3">
                  <Atom className="h-6 w-6 text-green-400 mr-3" />
                  <h3 className="text-xl font-semibold text-white">Subject Connections</h3>
                </div>
                <p className="text-blue-100">See how math, science, and language arts connect in our interdisciplinary approach</p>
              </div>
              
              <div className="bg-blue-900/40 backdrop-blur-sm rounded-xl p-5 border border-blue-700/30 shadow-lg transform transition-all hover:scale-105 hover:bg-blue-800/40 animate-fadeSlideUp" style={{ animationDelay: '0.3s' }}>
                <div className="flex items-center mb-3">
                  <Sparkles className="h-6 w-6 text-yellow-400 mr-3" />
                  <h3 className="text-xl font-semibold text-white">AI Reading Coach</h3>
                </div>
                <p className="text-blue-100">Get personalized reading assistance with our advanced AI companion</p>
              </div>
              
              <div className="bg-blue-900/40 backdrop-blur-sm rounded-xl p-5 border border-blue-700/30 shadow-lg transform transition-all hover:scale-105 hover:bg-blue-800/40 animate-fadeSlideUp" style={{ animationDelay: '0.4s' }}>
                <div className="flex items-center mb-3">
                  <Star className="h-6 w-6 text-purple-400 mr-3" />
                  <h3 className="text-xl font-semibold text-white">Interactive Learning</h3>
                </div>
                <p className="text-blue-100">Engage with interactive quizzes, flashcards and educational games</p>
              </div>
            </div>
            
            {/* Illustration */}
            <div className="relative mx-auto max-w-md mt-8 animate-float">
              <img 
                src={learniverseIllustration} 
                alt="Learniverse illustration"
                className="rounded-lg shadow-2xl border-2 border-indigo-600/50"
              />
              <div className="absolute -top-4 -right-4 bg-gradient-to-r from-yellow-400 to-amber-500 text-black font-bold py-2 px-4 rounded-full transform rotate-12 animate-pulse">
                Grades 1-8
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}