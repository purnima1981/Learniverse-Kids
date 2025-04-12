import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Rocket } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";

// Login validation schema
const loginSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email address" }),
  password: z.string().min(6, { message: "Password must be at least 6 characters" }),
});

// Registration validation schema
const registerSchema = z.object({
  firstName: z.string().min(2, { message: "First name must be at least 2 characters" }),
  lastName: z.string().min(2, { message: "Last name must be at least 2 characters" }),
  email: z.string().email({ message: "Please enter a valid email address" }),
  password: z.string().min(6, { message: "Password must be at least 6 characters" }),
  grade: z.string().optional(),
  gender: z.string().optional(),
});

type LoginValues = z.infer<typeof loginSchema>;
type RegisterValues = z.infer<typeof registerSchema>;

export default function NewAuthPage() {
  const { loginMutation, registerMutation } = useAuth();
  const { toast } = useToast();
  const [showLogin, setShowLogin] = useState(false);
  const [showRegister, setShowRegister] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [forgotPasswordEmail, setForgotPasswordEmail] = useState("");

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
      grade: undefined,
      gender: undefined,
    },
  });

  const onLogin = async (data: LoginValues) => {
    try {
      await loginMutation.mutateAsync(data);
      toast({
        title: "Success",
        description: "You have successfully logged in",
      });
    } catch (error) {
      console.error("Login error:", error);
      // Error handling is in the mutation itself
    }
  };

  const onRegister = async (data: RegisterValues) => {
    try {
      await registerMutation.mutateAsync(data);
      toast({
        title: "Success",
        description: "Your account has been created",
      });
    } catch (error) {
      console.error("Registration error:", error);
      // Error handling is in the mutation itself
    }
  };

  const handleForgotPassword = () => {
    if (!forgotPasswordEmail) {
      toast({
        title: "Error",
        description: "Please enter your email address",
        variant: "destructive",
      });
      return;
    }

    // This is just a UI demo - would be connected to real password reset in production
    toast({
      title: "Password Reset Link Sent",
      description: `We've sent a password reset link to ${forgotPasswordEmail}`,
    });
    
    setShowForgotPassword(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-900 to-indigo-950 text-white">
      {/* Header with navigation */}
      <header className="container mx-auto px-4 py-6 flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <Rocket className="h-8 w-8 text-yellow-400" />
          <span className="text-2xl font-bold">Learniverse</span>
        </div>
        
        <div className="flex items-center space-x-4">
          <button 
            className="px-6 py-2 rounded-md border border-blue-400 text-blue-100 hover:bg-blue-900/30 font-medium"
            onClick={() => setShowLogin(true)}
          >
            LOG IN
          </button>
          <button 
            className="px-6 py-2 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-md text-white font-medium hover:from-blue-600 hover:to-indigo-700"
            onClick={() => setShowRegister(true)}
          >
            SIGN UP FREE
          </button>
        </div>
      </header>
      
      {/* Main content */}
      <main className="container mx-auto px-4 py-16 flex flex-col md:flex-row items-center">
        <div className="md:w-2/3 mb-12 md:mb-0 md:pr-12">
          <h1 className="text-5xl font-bold mb-6 leading-tight">
            Interdisciplinary <span className="text-blue-300">learning</span> adventures for curious minds
          </h1>
          <p className="text-xl text-blue-100 mb-8">
            Connect math, science, and language arts through immersive stories that make learning meaningful and exciting.
          </p>
          <div className="space-y-6">
            <div className="flex items-start">
              <div className="bg-blue-500/20 rounded-full p-2 mr-4">
                <svg className="w-6 h-6 text-blue-300" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <h3 className="text-xl font-semibold text-blue-200">Curriculum-Aligned Stories</h3>
                <p className="text-blue-100">Experience adventures that seamlessly integrate key academic concepts</p>
              </div>
            </div>
            
            <div className="flex items-start">
              <div className="bg-blue-500/20 rounded-full p-2 mr-4">
                <svg className="w-6 h-6 text-blue-300" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <h3 className="text-xl font-semibold text-blue-200">Adaptive Learning Platform</h3>
                <p className="text-blue-100">Personalized content that adjusts to each student's learning style and progress</p>
              </div>
            </div>
            
            <div className="flex items-start">
              <div className="bg-blue-500/20 rounded-full p-2 mr-4">
                <svg className="w-6 h-6 text-blue-300" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <h3 className="text-xl font-semibold text-blue-200">Interactive Assessments</h3>
                <p className="text-blue-100">Engaging activities that reinforce learning through practical application</p>
              </div>
            </div>
          </div>
        </div>
        
        <div className="md:w-1/3 bg-blue-800/20 p-8 rounded-xl shadow-2xl backdrop-blur-sm">
          <h2 className="text-3xl font-bold mb-6 text-center">
            Start Your Learning Journey
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            Join thousands of others on a revolutionary learning journey
          </p>
          
          {/* No "Forgot password" link in the testimonial section */}
          <div className="mt-8 mb-16">
            {/* Empty space where the link used to be */}
          </div>
        </div>
      </main>
      
      {/* Login Card - always visible (removed modal) */}
      {showLogin && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
          <div className="flex w-full max-w-4xl shadow-2xl rounded-xl overflow-hidden">
            {/* Left side with illustration */}
            <div className="w-2/5 p-8 relative" style={{ backgroundColor: "#00d2ff", background: "#00d2ff" }}>
              <div className="flex justify-center mb-8">
                <div className="text-white text-2xl font-bold flex items-center">
                  <Rocket className="h-8 w-8 text-yellow-400 mr-2" />
                  Learniverse
                </div>
              </div>
              
              {/* Space-themed decorative elements */}
              <div className="relative h-full">
                {/* Mathematical orbit system */}
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-48 h-48">
                  {/* Circular orbits */}
                  <div className="absolute inset-0 border-2 border-white/20 rounded-full animate-spin-slower"></div>
                  <div className="absolute inset-4 border border-white/15 rounded-full animate-spin-slow" style={{ animationDirection: 'reverse' }}></div>
                  <div className="absolute inset-8 border border-white/10 rounded-full animate-spin-slow"></div>
                  
                  {/* Mathematical symbols */}
                  <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                    <div className="flex items-center justify-center w-12 h-12 rounded-full bg-purple-500 shadow-lg animate-float-slow">
                      <span className="text-white text-xl font-bold">π</span>
                    </div>
                  </div>
                  
                  <div className="absolute top-1/2 right-0 transform translate-x-1/2 -translate-y-1/2">
                    <div className="flex items-center justify-center w-10 h-10 rounded-full bg-yellow-300 shadow-lg animate-float">
                      <span className="text-indigo-900 text-xl font-bold">∑</span>
                    </div>
                  </div>
                  
                  <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-1/2">
                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-lime-300 shadow-lg animate-float-slow">
                      <span className="text-indigo-900 text-lg font-bold">∞</span>
                    </div>
                  </div>
                </div>
                
                {/* Small decorative planets */}
                <div className="absolute top-20 left-5 w-4 h-4 bg-yellow-300 rounded-full animate-pulse-slow"></div>
                <div className="absolute bottom-28 right-8 w-3 h-3 bg-white rounded-full animate-pulse-slow"></div>
                <div className="absolute top-1/4 right-10 w-5 h-5 bg-lime-300 rounded-full animate-ping-slow"></div>
                
                {/* Shooting star */}
                <div className="absolute top-16 right-16 w-20 h-px bg-gradient-to-r from-transparent via-white to-transparent transform -rotate-45 animate-pulse-slow"></div>
                
                {/* Constellation */}
                <div className="absolute bottom-16 left-8">
                  <div className="flex items-start">
                    <div className="w-1 h-1 bg-white rounded-full"></div>
                    <div className="w-8 h-px bg-white/30 transform rotate-45"></div>
                    <div className="w-1 h-1 bg-white rounded-full"></div>
                    <div className="w-6 h-px bg-white/30 transform -rotate-12"></div>
                    <div className="w-1 h-1 bg-white rounded-full"></div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Right side with form */}
            <div className="w-3/5 bg-[#151439] p-8 text-white">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-3xl font-bold text-white">Sign in to Learniverse</h2>
                <button 
                  onClick={() => setShowLogin(false)}
                  className="text-gray-300 hover:text-white"
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
                      <FormItem>
                        <div className="flex justify-between">
                          <FormLabel className="text-gray-200 font-medium">Email Address</FormLabel>
                          <button 
                            type="button" 
                            className="text-blue-300 text-sm hover:text-white"
                            onClick={() => {
                              setShowForgotPassword(true);
                              setShowLogin(false);
                            }}
                          >
                            Forgot username?
                          </button>
                        </div>
                        <FormControl>
                          <Input
                            placeholder="your.email@example.com"
                            className="bg-[#252458] border-[#5555aa] text-white focus:border-[#7f7fce]"
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
                        <div className="flex justify-between">
                          <FormLabel className="text-gray-200 font-medium">Password</FormLabel>
                          <button 
                            type="button" 
                            className="text-blue-300 text-sm hover:text-white"
                            onClick={() => {
                              setShowForgotPassword(true);
                              setShowLogin(false);
                            }}
                          >
                            Forgot password?
                          </button>
                        </div>
                        <FormControl>
                          <Input
                            type="password"
                            placeholder="••••••••"
                            className="bg-[#252458] border-[#5555aa] text-white focus:border-[#7f7fce]"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="flex items-center my-4">
                    <input
                      type="checkbox"
                      id="remember"
                      className="h-4 w-4 text-green-500 rounded border-[#5555aa] bg-[#252458]"
                    />
                    <label htmlFor="remember" className="ml-2 text-gray-200">
                      Remember
                    </label>
                  </div>

                  <Button
                    type="submit"
                    className="w-full py-3 rounded-md text-white font-bold"
                    style={{ backgroundColor: "#32cd66", background: "#32cd66" }}
                  >
                    Sign in
                  </Button>
                  
                  <div className="flex items-center justify-center mt-6">
                    <span className="text-gray-300">Not a member yet?</span>
                    <button 
                      type="button" 
                      className="ml-2 text-blue-300 font-medium hover:text-white"
                      onClick={() => {
                        setShowLogin(false);
                        setShowRegister(true);
                      }}
                    >
                      Join now &gt;
                    </button>
                  </div>
                </form>
              </Form>
            </div>
          </div>
        </div>
      )}
      
      {/* Register Modal */}
      {showRegister && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
          <div className="flex w-full max-w-4xl shadow-2xl rounded-xl overflow-hidden">
            {/* Left side with illustration */}
            <div className="w-2/5 p-8 relative" style={{ background: "linear-gradient(to bottom, #a855f7, #7e22ce)" }}>
              <div className="flex justify-center mb-8">
                <div className="text-white text-2xl font-bold flex items-center">
                  <Rocket className="h-8 w-8 text-yellow-400 mr-2" />
                  Learniverse
                </div>
              </div>
              
              {/* Space-themed decorative elements */}
              <div className="relative h-full">
                {/* Mathematical orbit system */}
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-48 h-48">
                  {/* Circular orbits */}
                  <div className="absolute inset-0 border-2 border-white/20 rounded-full animate-spin-slower"></div>
                  <div className="absolute inset-4 border border-white/15 rounded-full animate-spin-slow" style={{ animationDirection: 'reverse' }}></div>
                  <div className="absolute inset-8 border border-white/10 rounded-full animate-spin-slow"></div>
                  
                  {/* Mathematical symbols */}
                  <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                    <div className="flex items-center justify-center w-12 h-12 rounded-full bg-indigo-500 shadow-lg animate-float-slow">
                      <span className="text-white text-xl font-bold">∆</span>
                    </div>
                  </div>
                  
                  <div className="absolute top-1/2 right-0 transform translate-x-1/2 -translate-y-1/2">
                    <div className="flex items-center justify-center w-10 h-10 rounded-full bg-yellow-300 shadow-lg animate-float">
                      <span className="text-indigo-900 text-xl font-bold">⚛</span>
                    </div>
                  </div>
                  
                  <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-1/2">
                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-purple-400 shadow-lg animate-float-slow">
                      <span className="text-white text-lg font-bold">∞</span>
                    </div>
                  </div>
                  
                  <div className="absolute top-1/2 left-0 transform -translate-x-1/2 -translate-y-1/2">
                    <div className="flex items-center justify-center w-10 h-10 rounded-full bg-pink-400 shadow-lg animate-float">
                      <span className="text-white text-lg font-bold">∑</span>
                    </div>
                  </div>
                </div>
                
                {/* Small decorative planets */}
                <div className="absolute top-20 left-5 w-4 h-4 bg-yellow-300 rounded-full animate-pulse-slow"></div>
                <div className="absolute bottom-28 right-8 w-3 h-3 bg-white rounded-full animate-pulse-slow"></div>
                <div className="absolute top-1/4 right-10 w-5 h-5 bg-lime-300 rounded-full animate-ping-slow"></div>
                
                {/* Shooting star */}
                <div className="absolute top-16 right-16 w-20 h-px bg-gradient-to-r from-transparent via-white to-transparent transform -rotate-45 animate-pulse-slow"></div>
                
                {/* Constellation */}
                <div className="absolute bottom-16 left-8">
                  <div className="flex items-start">
                    <div className="w-1 h-1 bg-white rounded-full"></div>
                    <div className="w-8 h-px bg-white/30 transform rotate-45"></div>
                    <div className="w-1 h-1 bg-white rounded-full"></div>
                    <div className="w-6 h-px bg-white/30 transform -rotate-12"></div>
                    <div className="w-1 h-1 bg-white rounded-full"></div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Right side with form */}
            <div className="w-3/5 bg-[#151439] p-8 text-white">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-3xl font-bold text-white">Create Your Account</h2>
                <button 
                  onClick={() => setShowRegister(false)}
                  className="text-blue-300 hover:text-white"
                >
                  ✕
                </button>
              </div>
              
              <Form {...registerForm}>
                <form onSubmit={registerForm.handleSubmit(onRegister)} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={registerForm.control}
                      name="firstName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-blue-100 font-medium">First Name</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="First name"
                              className="bg-[#252458] border-indigo-700 text-white focus:border-blue-500"
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
                          <FormLabel className="text-blue-100 font-medium">Last Name</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Last name"
                              className="bg-[#252458] border-indigo-700 text-white focus:border-blue-500"
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
                        <FormLabel className="text-blue-100 font-medium">Email Address</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="your.email@example.com"
                            className="bg-[#252458] border-indigo-700 text-white focus:border-blue-500"
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
                        <FormLabel className="text-blue-100 font-medium">Password</FormLabel>
                        <FormControl>
                          <Input
                            type="password"
                            placeholder="••••••••"
                            className="bg-[#252458] border-indigo-700 text-white focus:border-blue-500"
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
                          <FormLabel className="text-blue-100 font-medium">Grade</FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger className="bg-[#252458] border-indigo-700 text-white focus:border-blue-500">
                                <SelectValue placeholder="Select Grade" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent className="bg-[#252458] border-indigo-700">
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
                          <FormLabel className="text-blue-100 font-medium">Gender</FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger className="bg-[#252458] border-indigo-700 text-white focus:border-blue-500">
                                <SelectValue placeholder="Select Gender" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent className="bg-[#252458] border-indigo-700">
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
                    className="w-full text-white font-bold py-3 rounded-md mt-6"
                    style={{ background: "linear-gradient(to right, #a855f7, #7e22ce)" }}
                  >
                    Sign up
                  </Button>
                  
                  <div className="flex items-center justify-center mt-6">
                    <span className="text-blue-100">Already have an account?</span>
                    <button 
                      type="button" 
                      className="ml-2 text-blue-300 font-medium hover:text-blue-100"
                      onClick={() => {
                        setShowRegister(false);
                        setShowLogin(true);
                      }}
                    >
                      Log in &gt;
                    </button>
                  </div>
                </form>
              </Form>
            </div>
          </div>
        </div>
      )}
      
      {/* Forgot Password Modal */}
      {showForgotPassword && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
          <div className="flex w-full max-w-4xl shadow-2xl rounded-xl overflow-hidden">
            {/* Left side with illustration */}
            <div className="w-2/5 bg-gradient-to-b from-blue-500 to-blue-700 p-8 relative">
              <div className="flex justify-center mb-8">
                <div className="text-white text-2xl font-bold flex items-center">
                  <Rocket className="h-8 w-8 text-yellow-400 mr-2" />
                  Learniverse
                </div>
              </div>
              
              {/* Space-themed decorative elements */}
              <div className="relative h-full">
                {/* Learniverse-themed decorations */}
                <div className="absolute top-10 left-10 w-16 h-16 bg-blue-300 rounded-full opacity-10 animate-pulse-slow"></div>
                <div className="absolute top-1/3 right-5 w-8 h-8 bg-cyan-300 rounded-full opacity-20 animate-ping-slow"></div>
                
                {/* Email-related animation */}
                <div className="absolute top-1/3 left-1/2 transform -translate-x-1/2 -translate-y-1/3">
                  <div className="w-24 h-16 rounded-lg border-2 border-white/30 relative">
                    <div className="absolute top-0 left-0 w-full h-full">
                      <div className="absolute h-0 w-0 border-l-[12px] border-l-transparent border-b-[10px] border-b-white/30 border-r-[12px] border-r-transparent top-[-10px] left-1/2 transform -translate-x-1/2"></div>
                    </div>
                    
                    <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 animate-pulse-slow">
                      <div className="w-16 h-2 bg-white/50 rounded-full mb-2"></div>
                      <div className="w-10 h-2 bg-white/50 rounded-full"></div>
                    </div>
                  </div>
                </div>
                
                {/* Lock icon */}
                <div className="absolute bottom-32 left-1/2 transform -translate-x-1/2">
                  <div className="w-12 h-6 rounded-t-lg bg-white/30 flex justify-center">
                    <div className="w-4 h-3 rounded-t-md bg-blue-700/50 mt-1"></div>
                  </div>
                  <div className="w-16 h-14 rounded-md bg-white/30 relative">
                    <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-blue-700/50">
                      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-1 h-1 rounded-full bg-white/70"></div>
                    </div>
                  </div>
                </div>
                
                {/* Space-themed decorative elements */}
                <div className="absolute bottom-5 left-0 right-0">
                  <div className="w-full h-12 bg-gradient-to-r from-blue-900 via-blue-700 to-blue-900 opacity-40 rounded-b-lg"></div>
                  <div className="absolute bottom-4 left-4">
                    <div className="w-3 h-3 bg-white rounded-full animate-pulse-slow"></div>
                  </div>
                  <div className="absolute bottom-8 left-1/3">
                    <div className="w-2 h-2 bg-white rounded-full animate-pulse-slow"></div>
                  </div>
                  <div className="absolute bottom-6 right-1/4">
                    <div className="w-1 h-1 bg-white rounded-full animate-ping-slow"></div>
                  </div>
                  <div className="absolute bottom-2 right-8">
                    <div className="w-2 h-2 bg-white rounded-full animate-pulse-slow"></div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Right side with form */}
            <div className="w-3/5 bg-indigo-950 p-8 text-white">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-3xl font-bold text-white">Reset Your Password</h2>
                <button 
                  onClick={() => setShowForgotPassword(false)}
                  className="text-blue-300 hover:text-white"
                >
                  ✕
                </button>
              </div>
              
              <div className="space-y-6">
                <p className="text-blue-100">
                  Enter your email address and we'll send you instructions to reset your password.
                </p>
                
                <div>
                  <FormLabel className="text-blue-100 font-medium">Email Address</FormLabel>
                  <Input
                    type="email"
                    placeholder="your.email@example.com"
                    className="bg-indigo-900/50 border-indigo-700 text-white focus:border-blue-500 mt-1"
                    value={forgotPasswordEmail}
                    onChange={(e) => setForgotPasswordEmail(e.target.value)}
                  />
                </div>

                <Button
                  onClick={handleForgotPassword}
                  className="w-full bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white font-bold py-3 rounded-md"
                >
                  Send Password Reset Link
                </Button>
                
                <div className="flex items-center justify-center mt-6">
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
            </div>
          </div>
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