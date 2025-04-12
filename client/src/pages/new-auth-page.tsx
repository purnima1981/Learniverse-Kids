import React, { useState } from 'react';
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

  // For demo purposes, simulate form submission
  const onLogin = async (data: LoginValues) => {
    console.log("Login data:", data);
    alert(`Login attempted with: ${data.email}`);
  };

  const onRegister = async (data: RegisterValues) => {
    console.log("Register data:", data);
    alert(`Registration attempted for: ${data.email}`);
  };

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

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-950 via-purple-900 to-blue-900 overflow-hidden">
      <div className="container mx-auto py-6">
        {/* Main 2x2 grid layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* Quadrant 1: Top Left - Welcome & Highlights */}
          <div className="p-6 flex flex-col justify-center">
            <div className="mb-6">
              <div className="flex items-center mb-4">
                <Rocket className="h-10 w-10 text-yellow-400 mr-4" />
                <h1 className="text-4xl font-bold text-white">Learniverse</h1>
              </div>
              <h2 className="text-2xl font-semibold text-white mb-4">Welcome to a Universe of Learning</h2>
              <p className="text-xl text-blue-100">
                Embark on an educational journey through space and time, connecting subjects in ways 
                you've never experienced before.
              </p>
            </div>
          </div>
          
          {/* Quadrant 2: Top Right - Space Image */}
          <div className="p-6 flex justify-center items-center">
            <div className="relative mx-auto" style={{ maxWidth: "350px" }}>
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
          
          {/* Quadrant 3: Bottom Left - Educational Benefits */}
          <div className="p-6">
            <h3 className="text-xl font-semibold text-white mb-4">Educational Benefits</h3>
            <div className="grid grid-cols-1 gap-4">
              <div className="bg-blue-900/40 rounded-xl p-4 border border-blue-700/30">
                <div className="flex items-center mb-2">
                  <Globe className="h-5 w-5 text-cyan-400 mr-2" />
                  <h4 className="text-lg font-semibold text-white">Themed Journeys</h4>
                </div>
                <p className="text-blue-100">Embark on educational adventures through interactive stories that make learning engaging</p>
              </div>
              
              <div className="bg-blue-900/40 rounded-xl p-4 border border-blue-700/30">
                <div className="flex items-center mb-2">
                  <Atom className="h-5 w-5 text-green-400 mr-2" />
                  <h4 className="text-lg font-semibold text-white">Subject Connections</h4>
                </div>
                <p className="text-blue-100">See how math, science, and language arts connect in our interdisciplinary approach</p>
              </div>
              
              <div className="bg-blue-900/40 rounded-xl p-4 border border-blue-700/30">
                <div className="flex items-center mb-2">
                  <Sparkles className="h-5 w-5 text-yellow-400 mr-2" />
                  <h4 className="text-lg font-semibold text-white">AI Reading Coach</h4>
                </div>
                <p className="text-blue-100">Get personalized reading assistance with our advanced AI companion</p>
              </div>
              
              <div className="bg-blue-900/40 rounded-xl p-4 border border-blue-700/30">
                <div className="flex items-center mb-2">
                  <Star className="h-5 w-5 text-purple-400 mr-2" />
                  <h4 className="text-lg font-semibold text-white">Interactive Learning</h4>
                </div>
                <p className="text-blue-100">Engage with interactive quizzes, flashcards and educational games</p>
              </div>
            </div>
          </div>
          
          {/* Quadrant 4: Bottom Right - Registration Form */}
          <div className="p-6">
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
                        >
                          Login
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
                        >
                          Register
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
  );
}