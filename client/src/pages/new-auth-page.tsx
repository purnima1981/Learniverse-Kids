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
import { 
  Sparkles, Rocket, Star, Globe, Book, Atom, 
  Brain, Users, BarChart, CalendarDays, Puzzle, 
  Lightbulb, Scroll, Mountain
} from "lucide-react";

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
  const [activeHighlight, setActiveHighlight] = useState(0);

  // Highlights data with expanded unique value propositions
  const highlights = [
    {
      title: "Weekly Learning Adventures",
      description: "Progress through story chapters that align perfectly with your school curriculum",
      icon: <CalendarDays className="h-5 w-5 text-cyan-400" />
    },
    {
      title: "Interdisciplinary Stories",
      description: "Experience how math, science, and language arts connect in immersive storylines",
      icon: <Atom className="h-5 w-5 text-green-400" />
    },
    {
      title: "Personal Theme Selection",
      description: "Choose your learning environment - space, mythology, sports, and more",
      icon: <Mountain className="h-5 w-5 text-indigo-400" />
    },
    {
      title: "Continuous Narrative",
      description: "Follow an engaging story that unfolds throughout the school year",
      icon: <Book className="h-5 w-5 text-yellow-400" />
    },
    {
      title: "Real-World Connections",
      description: "Apply what you learn to relatable, real-world scenarios",
      icon: <Globe className="h-5 w-5 text-blue-400" />
    },
    {
      title: "AI Reading Coach",
      description: "Get personalized reading assistance with our advanced AI companion",
      icon: <Sparkles className="h-5 w-5 text-purple-400" />
    },
    {
      title: "Creative Expression",
      description: "Blend creative writing with STEM learning in interactive activities",
      icon: <Scroll className="h-5 w-5 text-pink-400" />
    },
    {
      title: "Interactive Reasoning",
      description: "Solve puzzles and mysteries that develop critical thinking skills",
      icon: <Puzzle className="h-5 w-5 text-amber-400" />
    }
  ];

  // Auto-rotate through highlights
  React.useEffect(() => {
    const timer = setTimeout(() => {
      setActiveHighlight((prev) => (prev + 1) % highlights.length);
    }, 5000);
    return () => clearTimeout(timer);
  }, [activeHighlight, highlights.length]);

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
      {/* Animated space elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="stars-small"></div>
        <div className="stars-medium"></div>
        <div className="stars-large"></div>
        <div className="comet-1"></div>
        <div className="comet-2"></div>
        <div className="comet-3"></div>
      </div>
      
      <div className="container relative z-10 mx-auto py-6">
        {/* Main 2x2 grid layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* Quadrant 1: Top Left - Welcome & Highlights */}
          <div className="p-6 flex flex-col justify-center">
            <div className="mb-6">
              <div className="flex items-center mb-4">
                <Rocket className="h-10 w-10 text-yellow-400 mr-4 animate-pulse" />
                <h1 className="text-4xl font-bold text-white">Learniverse</h1>
              </div>
              <h2 className="text-2xl font-semibold text-white mb-4">Where Learning and Adventure Connect</h2>
              <p className="text-xl text-blue-100">
                Embark on an educational journey through space and time, connecting subjects in ways 
                you've never experienced before.
              </p>
            </div>
            
            {/* Rotating highlights */}
            <div className="mt-6 relative h-28">
              {highlights.map((highlight, index) => (
                <div 
                  key={index}
                  className={`absolute inset-0 transition-opacity duration-700 flex items-center bg-blue-900/40 backdrop-blur-sm rounded-xl p-4 border border-blue-700/30 ${
                    index === activeHighlight ? "opacity-100" : "opacity-0 pointer-events-none"
                  }`}
                >
                  <div className="mr-4 p-2 bg-indigo-800/50 rounded-full">
                    {highlight.icon}
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-white">{highlight.title}</h3>
                    <p className="text-blue-100">{highlight.description}</p>
                  </div>
                </div>
              ))}
              
              {/* Indicator dots */}
              <div className="absolute -bottom-6 left-0 right-0 flex justify-center space-x-2">
                {highlights.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setActiveHighlight(index)}
                    className={`w-2.5 h-2.5 rounded-full transition-all ${
                      index === activeHighlight ? "bg-cyan-400 w-5" : "bg-blue-800/80"
                    }`}
                    aria-label={`Highlight ${index + 1}`}
                  />
                ))}
              </div>
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
              <div className="absolute -top-4 -right-4 bg-gradient-to-r from-yellow-400 to-amber-500 text-black font-bold py-2 px-4 rounded-full transform rotate-12 animate-pulse">
                Grades 1-8
              </div>
              <div className="absolute -bottom-4 -left-4 bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-bold py-2 px-4 rounded-full shadow-lg">
                Story-Based Learning
              </div>
            </div>
          </div>
          
          {/* Quadrant 3: Bottom Left - "What Sets Us Apart" Section */}
          <div className="p-6">
            <h3 className="text-xl font-semibold text-white mb-4 flex items-center">
              <Lightbulb className="h-5 w-5 text-yellow-400 mr-2" />
              What Sets Us Apart
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-blue-900/40 backdrop-blur-sm rounded-xl p-4 border border-blue-700/30 hover:border-cyan-500/50 transition-colors">
                <div className="flex items-center mb-2">
                  <Brain className="h-5 w-5 text-cyan-400 mr-2" />
                  <h4 className="text-lg font-semibold text-white">Truly Interdisciplinary</h4>
                </div>
                <p className="text-blue-100">Math, science, and language arts seamlessly woven into one continuous story</p>
              </div>
              
              <div className="bg-blue-900/40 backdrop-blur-sm rounded-xl p-4 border border-blue-700/30 hover:border-green-500/50 transition-colors">
                <div className="flex items-center mb-2">
                  <CalendarDays className="h-5 w-5 text-green-400 mr-2" />
                  <h4 className="text-lg font-semibold text-white">Week-by-Week Adventure</h4>
                </div>
                <p className="text-blue-100">Stories synchronized with your school curriculum for relevant, timely learning</p>
              </div>
              
              <div className="bg-blue-900/40 backdrop-blur-sm rounded-xl p-4 border border-blue-700/30 hover:border-yellow-500/50 transition-colors">
                <div className="flex items-center mb-2">
                  <Users className="h-5 w-5 text-yellow-400 mr-2" />
                  <h4 className="text-lg font-semibold text-white">Thematic Choice</h4>
                </div>
                <p className="text-blue-100">Choose your story world - learn the same concepts in your preferred setting</p>
              </div>
              
              <div className="bg-blue-900/40 backdrop-blur-sm rounded-xl p-4 border border-blue-700/30 hover:border-purple-500/50 transition-colors">
                <div className="flex items-center mb-2">
                  <Puzzle className="h-5 w-5 text-purple-400 mr-2" />
                  <h4 className="text-lg font-semibold text-white">Reasoning & Creativity</h4>
                </div>
                <p className="text-blue-100">Develop critical thinking through interactive story puzzles and creative challenges</p>
              </div>
            </div>
          </div>
          
          {/* Quadrant 4: Bottom Right - Registration Form */}
          <div className="p-6">
            <Card className="bg-indigo-900/40 backdrop-blur-sm border border-indigo-700/30 shadow-lg">
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
                          className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:bg-blue-700"
                        >
                          Continue Your Journey
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
                          className="w-full bg-gradient-to-r from-cyan-600 to-blue-600 hover:bg-cyan-700"
                        >
                          Begin Your Adventure
                        </Button>

                        <p className="text-center text-sm text-blue-200 mt-4">
                          By creating an account, you are agreeing to our
                          <a href="#" className="text-cyan-400 hover:underline ml-1">Terms of Service</a> and
                          <a href="#" className="text-cyan-400 hover:underline ml-1">Privacy Policy</a>
                        </p>
                      </form>
                    </Form>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </div>
        </div>
        
        {/* Footer */}
        <div className="mt-8 text-center text-blue-200 text-sm">
          <p>Learniverse: Transforming education through interdisciplinary, story-based learning</p>
        </div>
      </div>
    </div>
  );
}