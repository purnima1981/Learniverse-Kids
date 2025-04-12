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
    <div className="min-h-screen bg-gradient-to-br from-indigo-950 via-purple-900 to-blue-900">
      <div className="container mx-auto px-4 py-8">
        
        {/* Main content container */}
        <div className="flex flex-col lg:flex-row gap-8">
          
          {/* Left Side - Welcome & Features */}
          <div className="w-full lg:w-5/12">
            <div className="mb-8">
              <h1 className="text-4xl font-bold text-white mb-4">Learniverse</h1>
              <p className="text-xl text-blue-100">Embark on an educational journey through space and time.</p>
            </div>
            
            {/* Feature grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
              <div className="bg-blue-900/40 rounded-xl p-5 border border-blue-700/30">
                <h3 className="text-xl font-semibold text-white mb-2">Themed Journeys</h3>
                <p className="text-blue-100">Embark on educational adventures through interactive stories</p>
              </div>
              
              <div className="bg-blue-900/40 rounded-xl p-5 border border-blue-700/30">
                <h3 className="text-xl font-semibold text-white mb-2">Subject Connections</h3>
                <p className="text-blue-100">See how math, science, and language arts connect</p>
              </div>
              
              <div className="bg-blue-900/40 rounded-xl p-5 border border-blue-700/30">
                <h3 className="text-xl font-semibold text-white mb-2">AI Reading Coach</h3>
                <p className="text-blue-100">Get personalized reading assistance</p>
              </div>
              
              <div className="bg-blue-900/40 rounded-xl p-5 border border-blue-700/30">
                <h3 className="text-xl font-semibold text-white mb-2">Interactive Learning</h3>
                <p className="text-blue-100">Engage with quizzes, flashcards and games</p>
              </div>
            </div>
          </div>
          
          {/* Right Side - Image and Auth Forms */}
          <div className="w-full lg:w-7/12">
            {/* Top half - Image */}
            <div className="mb-8">
              <div className="relative mx-auto" style={{ maxWidth: "400px" }}>
                <img 
                  src={learniverseIllustration} 
                  alt="Learniverse illustration"
                  className="rounded-lg shadow-xl border-2 border-indigo-600/50 w-full h-auto"
                />
                <div className="absolute -top-4 -right-4 bg-gradient-to-r from-yellow-400 to-amber-500 text-black font-bold py-2 px-4 rounded-full transform rotate-12">
                  Grades 1-8
                </div>
              </div>
            </div>
            
            {/* Bottom half - Auth Form */}
            <div>
              <Card className="bg-indigo-900/40 border border-indigo-700/30 shadow-lg">
                <CardContent className="pt-6">
                  <Tabs
                    defaultValue="login"
                    value={activeTab}
                    onValueChange={setActiveTab}
                    className="w-full"
                  >
                    <TabsList className="grid w-full grid-cols-2 mb-6">
                      <TabsTrigger value="login">Login</TabsTrigger>
                      <TabsTrigger value="register">Register</TabsTrigger>
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
                                    className="bg-blue-900/50 border-blue-700/50 text-white"
                                    {...field}
                                  />
                                </FormControl>
                                <FormMessage />
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
                                    className="bg-blue-900/50 border-blue-700/50 text-white"
                                    {...field}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <Button
                            type="submit"
                            className="w-full"
                            disabled={loginMutation.isPending}
                          >
                            {loginMutation.isPending ? "Logging in..." : "Login"}
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
                                      className="bg-blue-900/50 border-blue-700/50 text-white"
                                      {...field}
                                    />
                                  </FormControl>
                                  <FormMessage />
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
                                      className="bg-blue-900/50 border-blue-700/50 text-white"
                                      {...field}
                                    />
                                  </FormControl>
                                  <FormMessage />
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
                                    className="bg-blue-900/50 border-blue-700/50 text-white"
                                    {...field}
                                  />
                                </FormControl>
                                <FormMessage />
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
                                    className="bg-blue-900/50 border-blue-700/50 text-white"
                                    {...field}
                                  />
                                </FormControl>
                                <FormMessage />
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
                                  <FormMessage />
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
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>

                          <Button
                            type="submit"
                            className="w-full"
                            disabled={registerMutation.isPending}
                          >
                            {registerMutation.isPending ? "Creating account..." : "Register"}
                          </Button>
                        </form>
                      </Form>
                    </TabsContent>
                  </Tabs>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}