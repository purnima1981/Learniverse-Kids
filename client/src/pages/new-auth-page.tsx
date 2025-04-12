import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
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
  Lightbulb, Scroll, Mountain, ChevronRight, CheckCircle
} from "lucide-react";

import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";

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

// Key features data
const features = [
  {
    title: "Weekly Learning Adventures",
    description: "Progress through story chapters that align with your school curriculum",
    icon: <CalendarDays className="h-6 w-6 text-cyan-500" />
  },
  {
    title: "Interdisciplinary Stories",
    description: "Math, science, and language arts seamlessly integrated in immersive stories",
    icon: <Atom className="h-6 w-6 text-green-500" />
  },
  {
    title: "Interactive Reasoning",
    description: "Develop critical thinking through story puzzles and creative challenges",
    icon: <Puzzle className="h-6 w-6 text-purple-500" />
  },
  {
    title: "AI Reading Coach",
    description: "Get personalized reading assistance with our advanced AI companion",
    icon: <Sparkles className="h-6 w-6 text-amber-500" />
  }
];

export default function NewAuthPage() {
  const [showLogin, setShowLogin] = useState(false);
  const [showRegister, setShowRegister] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [forgotPasswordEmail, setForgotPasswordEmail] = useState("");
  const { toast } = useToast();
  const [, navigate] = useLocation();
  
  // Instead of checking user from authentication provider
  // We'll rely on form submission only for this demo
  
  const handleForgotPassword = () => {
    if (!forgotPasswordEmail.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
      toast({
        variant: "destructive",
        title: "Invalid email",
        description: "Please enter a valid email address",
      });
      return;
    }
    
    // Show success message - in a real app this would trigger password reset process
    toast({
      title: "Password reset email sent",
      description: `Instructions have been sent to ${forgotPasswordEmail}`,
    });
    setShowForgotPassword(false);
  };

  const onLogin = async (data: LoginValues) => {
    try {
      // Simulated login success
      toast({
        title: "Login successful",
        description: "Welcome back to Learniverse!",
      });
      setShowLogin(false);
      
      // Redirect to dashboard would happen in a real app
      setTimeout(() => {
        navigate("/dashboard");
      }, 1500);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Login failed",
        description: "Please check your credentials and try again.",
      });
    }
  };

  const onRegister = async (data: RegisterValues) => {
    try {
      // Simulated registration success
      toast({
        title: "Registration successful",
        description: "Welcome to Learniverse! Get ready for an amazing learning adventure.",
      });
      setShowRegister(false);
      
      // Redirect to theme selection would happen in a real app
      setTimeout(() => {
        navigate("/theme-selection");
      }, 1500);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Registration failed",
        description: "Please check your information and try again.",
      });
    }
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
    <div className="min-h-screen overflow-x-hidden bg-gradient-to-b from-indigo-950 to-blue-900 animate-gradient">
      {/* Hero section with navigation */}
      <header className="relative overflow-hidden">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="stars-small"></div>
          <div className="stars-medium"></div>
          <div className="comet-1"></div>
          <div className="comet-2"></div>
          <div className="comet-3"></div>
          
          {/* Space particles */}
          <div className="space-particles">
            {Array.from({ length: 20 }).map((_, i) => (
              <div 
                key={i} 
                className="particle" 
                style={{ 
                  left: `${Math.random() * 100}%`, 
                  top: `${Math.random() * 100}%`, 
                  animationDelay: `${Math.random() * 15}s`,
                  animationDuration: `${15 + Math.random() * 10}s`
                }}
              />
            ))}
          </div>
        </div>
        
        <div className="container relative z-10 mx-auto px-4 py-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center fade-in">
              <Rocket className="h-10 w-10 text-yellow-400 mr-3 animate-pulse" />
              <h1 className="text-3xl font-bold text-white">Learniverse</h1>
            </div>
            
            <div className="flex gap-4 fade-in">
              <Button 
                variant="outline" 
                className="bg-transparent border-white text-white hover:bg-white/10 hover:border-blue-400 transition-all duration-300"
                onClick={() => {
                  setShowLogin(true);
                  setShowRegister(false);
                }}
              >
                Log In
              </Button>
              
              <Button 
                className="bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white animate-pulse-slow"
                onClick={() => {
                  setShowRegister(true);
                  setShowLogin(false);
                }}
              >
                Sign Up Free
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="container mx-auto px-4 pb-16">
        {/* Hero content */}
        <div className="flex flex-col lg:flex-row items-center justify-between my-8 lg:my-16 gap-8">
          <div className="lg:w-1/2 slide-in-left">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Where Learning and Adventure Connect
            </h2>
            <p className="text-xl text-blue-100 mb-8">
              Embark on an educational journey through story-based learning that connects math, science, and language arts 
              in ways you've never experienced before.
            </p>
            
            <Button 
              size="lg"
              className="bg-gradient-to-r from-yellow-500 to-amber-500 hover:from-yellow-600 hover:to-amber-600 text-black font-bold text-lg px-8 py-6 animate-glow"
              onClick={() => {
                setShowRegister(true);
                setShowLogin(false);
              }}
            >
              Start Your Learning Adventure
              <ChevronRight className="ml-2 h-5 w-5" />
            </Button>
            
            <div className="mt-8 flex items-center">
              <div className="px-4 py-2 bg-indigo-800/60 rounded-lg border border-indigo-700/30 text-white">
                <span className="font-bold">For Grades 1-8</span>
              </div>
              <div className="h-8 border-l border-indigo-400/30 mx-4"></div>
              <div className="text-blue-100">
                <span className="font-bold">Parents & Teachers:</span> Request a demo
              </div>
            </div>
          </div>
          
          <div className="lg:w-1/2 slide-in-right">
            <div className="relative float">
              <img 
                src={learniverseIllustration} 
                alt="Learniverse platform preview"
                className="rounded-xl shadow-2xl border-2 border-indigo-600/50 w-full h-auto"
              />
              <div className="absolute -top-4 -right-4 bg-gradient-to-r from-emerald-500 to-green-500 text-white font-bold py-2 px-4 rounded-full shadow-lg animate-pulse-slow">
                New Curriculum
              </div>
            </div>
          </div>
        </div>
        
        {/* What makes us different */}
        <div className="text-center mb-16">
          <div className="inline-block mb-4 px-6 py-2 bg-indigo-800/40 rounded-full border border-indigo-700/30">
            <span className="text-cyan-400 font-semibold">What Makes Us Different</span>
          </div>
          
          <h3 className="text-3xl font-bold text-white mb-4">
            A Revolutionarily Different Learning Experience
          </h3>
          
          <p className="text-xl text-blue-100 max-w-3xl mx-auto">
            Learniverse is the only educational platform that brings subjects together through continuous 
            weekly adventures that follow your school curriculum.
          </p>
        </div>
        
        {/* Features grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          {features.map((feature, index) => (
            <div 
              key={index}
              className={`bg-indigo-900/40 backdrop-blur-sm rounded-xl p-6 border border-indigo-700/30 hover:border-blue-500/50 transition-all hover:shadow-lg group fade-in-delay-${index + 1}`}
            >
              <div className="p-3 bg-indigo-800/50 rounded-full inline-block mb-4 group-hover:bg-indigo-700/70 transition-colors">
                {feature.icon}
              </div>
              <h4 className="text-xl font-bold text-white mb-2">
                {feature.title}
              </h4>
              <p className="text-blue-100">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
        
        {/* Comparison section */}
        <div className="bg-indigo-900/40 backdrop-blur-sm rounded-xl p-8 border border-indigo-700/30 mb-16">
          <h3 className="text-2xl font-bold text-white mb-6 flex items-center">
            <CheckCircle className="h-6 w-6 text-green-500 mr-3" />
            Only Learniverse Offers All These Features
          </h3>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="flex items-start">
              <CheckCircle className="h-5 w-5 text-green-500 mr-3 mt-1 flex-shrink-0" />
              <div>
                <h4 className="text-lg font-bold text-white">Weekly Curriculum Alignment</h4>
                <p className="text-blue-100">Stories synchronized perfectly with your school's weekly lessons</p>
              </div>
            </div>
            
            <div className="flex items-start">
              <CheckCircle className="h-5 w-5 text-green-500 mr-3 mt-1 flex-shrink-0" />
              <div>
                <h4 className="text-lg font-bold text-white">True Interdisciplinary Learning</h4>
                <p className="text-blue-100">Subjects interwoven in a single narrative, not taught separately</p>
              </div>
            </div>
            
            <div className="flex items-start">
              <CheckCircle className="h-5 w-5 text-green-500 mr-3 mt-1 flex-shrink-0" />
              <div>
                <h4 className="text-lg font-bold text-white">Thematic Personalization</h4>
                <p className="text-blue-100">Choose your preferred story world while learning the same concepts</p>
              </div>
            </div>
            
            <div className="flex items-start">
              <CheckCircle className="h-5 w-5 text-green-500 mr-3 mt-1 flex-shrink-0" />
              <div>
                <h4 className="text-lg font-bold text-white">Creative Writing + STEM</h4>
                <p className="text-blue-100">Blend creative expression with technical learning activities</p>
              </div>
            </div>
            
            <div className="flex items-start">
              <CheckCircle className="h-5 w-5 text-green-500 mr-3 mt-1 flex-shrink-0" />
              <div>
                <h4 className="text-lg font-bold text-white">Continuous Narrative</h4>
                <p className="text-blue-100">An engaging story that unfolds throughout the school year</p>
              </div>
            </div>
            
            <div className="flex items-start">
              <CheckCircle className="h-5 w-5 text-green-500 mr-3 mt-1 flex-shrink-0" />
              <div>
                <h4 className="text-lg font-bold text-white">Advanced AI Reading Coach</h4>
                <p className="text-blue-100">Personalized reading assistance using cutting-edge technology</p>
              </div>
            </div>
          </div>
        </div>
        
        {/* Testimonials summary */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center mb-4">
            {[1, 2, 3, 4, 5].map((star) => (
              <Star key={star} className="h-6 w-6 text-yellow-400 fill-yellow-400" />
            ))}
          </div>
          <h3 className="text-2xl font-bold text-white mb-2">
            Trusted by students, parents, and teachers
          </h3>
          <p className="text-xl text-blue-100">
            Join thousands of others on a revolutionary learning journey
          </p>
        </div>
      </main>
      
      {/* Login Modal */}
      {showLogin && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
          <Card className="w-full max-w-md bg-indigo-900/90 backdrop-blur-lg border border-indigo-700/50 shadow-2xl animate-glow">
            <CardContent className="pt-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-white fade-in">Log In</h2>
                <button 
                  onClick={() => setShowLogin(false)}
                  className="text-blue-300 hover:text-white"
                >
                  ✕
                </button>
              </div>
              
              <Form {...loginForm}>
                <form onSubmit={loginForm.handleSubmit(onLogin)} className="space-y-4">
                  <FormField
                    control={loginForm.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem className="fade-in-delay-1">
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
                      <FormItem className="fade-in-delay-2">
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
                    className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-lg animate-gradient fade-in-delay-3"
                  >
                    Log In
                  </Button>
                  
                  <div className="flex flex-col items-center space-y-2 mt-4 fade-in-delay-4">
                    <button 
                      type="button" 
                      className="text-blue-300 hover:text-blue-100 text-sm"
                      onClick={() => {
                        setShowForgotPassword(true);
                        setShowLogin(false);
                      }}
                    >
                      Forgot your password?
                    </button>
                    
                    <button 
                      type="button" 
                      className="text-blue-300 hover:text-blue-100"
                      onClick={() => {
                        setShowLogin(false);
                        setShowRegister(true);
                      }}
                    >
                      Don't have an account? Sign up
                    </button>
                  </div>
                </form>
              </Form>
            </CardContent>
          </Card>
        </div>
      )}
      
      {/* Register Modal */}
      {showRegister && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
          <Card className="w-full max-w-md bg-indigo-900/90 backdrop-blur-lg border border-indigo-700/50 shadow-2xl animate-glow-green">
            <CardContent className="pt-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-white fade-in">Create Your Account</h2>
                <button 
                  onClick={() => setShowRegister(false)}
                  className="text-blue-300 hover:text-white"
                >
                  ✕
                </button>
              </div>
              
              <Form {...registerForm}>
                <form onSubmit={registerForm.handleSubmit(onRegister)} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4 fade-in-delay-1">
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
                      <FormItem className="fade-in-delay-2">
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
                      <FormItem className="fade-in-delay-2">
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

                  <div className="grid grid-cols-2 gap-4 fade-in-delay-3">
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
                    className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-lg font-semibold animate-gradient fade-in-delay-4"
                  >
                    Start Your Free Account
                  </Button>
                  
                  <div className="text-center mt-4 fade-in-delay-4">
                    <button 
                      type="button" 
                      className="text-blue-300 hover:text-blue-100"
                      onClick={() => {
                        setShowRegister(false);
                        setShowLogin(true);
                      }}
                    >
                      Already have an account? Log in
                    </button>
                  </div>
                </form>
              </Form>
            </CardContent>
          </Card>
        </div>
      )}
      
      {/* Forgot Password Modal */}
      {showForgotPassword && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
          <Card className="w-full max-w-md bg-indigo-900/90 backdrop-blur-lg border border-indigo-700/50 shadow-2xl animate-glow">
            <CardContent className="pt-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-white fade-in">Reset Your Password</h2>
                <button 
                  onClick={() => setShowForgotPassword(false)}
                  className="text-blue-300 hover:text-white"
                >
                  ✕
                </button>
              </div>
              
              <div className="space-y-4">
                <p className="text-blue-100 fade-in-delay-1">
                  Enter your email address and we'll send you instructions to reset your password.
                </p>
                
                <div className="fade-in-delay-2">
                  <FormLabel className="text-blue-100">Email Address</FormLabel>
                  <Input
                    type="email"
                    placeholder="your.email@example.com"
                    className="bg-blue-900/50 border-blue-700/50 text-white mt-1"
                    value={forgotPasswordEmail}
                    onChange={(e) => setForgotPasswordEmail(e.target.value)}
                  />
                </div>

                <Button
                  onClick={handleForgotPassword}
                  className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-lg animate-gradient fade-in-delay-3"
                >
                  Send Reset Link
                </Button>
                
                <div className="text-center mt-4 fade-in-delay-4">
                  <button 
                    type="button" 
                    className="text-blue-300 hover:text-blue-100"
                    onClick={() => {
                      setShowForgotPassword(false);
                      setShowLogin(true);
                    }}
                  >
                    Back to Login
                  </button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
      
      {/* Footer */}
      <footer className="bg-indigo-950 py-8 border-t border-indigo-900/30">
        <div className="container mx-auto px-4 text-center">
          <p className="text-blue-200 text-sm">
            Learniverse © {new Date().getFullYear()} - Transforming education through interdisciplinary, story-based learning
          </p>
        </div>
      </footer>
    </div>
  );
}