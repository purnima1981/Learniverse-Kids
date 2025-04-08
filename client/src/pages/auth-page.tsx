import { useState } from 'react';
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
  FormDescription,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useLocation } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { GRADES, GENDERS, LEARNING_PREFERENCES, INTERESTS } from "@/lib/constants";
import { Separator } from "@/components/ui/separator";

// Login schema
const loginSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(1, "Password is required"),
});

// Registration schema
const registerSchema = z.object({
  firstName: z.string().min(2, "First name must be at least 2 characters"),
  lastName: z.string().min(2, "Last name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  grade: z.string().refine((val) => val !== "", "Please select a grade"),
  gender: z.string().refine((val) => val !== "", "Please select a gender"),
  learningPreference: z.string().optional(),
  interests: z.array(z.string()).optional().default([]),
});

type LoginValues = z.infer<typeof loginSchema>;
type RegisterValues = z.infer<typeof registerSchema>;

export default function AuthPage() {
  const [_, setLocation] = useLocation();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<"login" | "register">("register");

  // Login form
  const loginForm = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  // Registration form
  const registerForm = useForm<RegisterValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      password: "",
      grade: "",
      gender: "",
      learningPreference: "",
      interests: [],
    },
  });

  // Get auth context
  const { user, loginMutation, registerMutation } = useAuth();
  
  // Redirect if user is already logged in
  if (user) {
    // Always redirect to personalization for profile setup
    setLocation("/personalization");
  }

  // Login submission handler
  const onLoginSubmit = async (data: LoginValues) => {
    try {
      const user = await loginMutation.mutateAsync(data);
      console.log("Login successful, user:", user);
      
      // Redirect to personalization to select or create a profile
      setLocation("/personalization");
    } catch (error) {
      console.error("Login error:", error);
      // Toast notifications are handled by the auth context
    }
  };

  // Registration submission handler
  const onRegisterSubmit = async (data: RegisterValues) => {
    try {
      const user = await registerMutation.mutateAsync(data);
      console.log("Registration successful, user:", user);
      
      // New users should always go to personalization to create profiles
      setLocation("/personalization");
    } catch (error) {
      console.error("Registration error:", error);
      // Toast notifications are handled by the auth context
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-learniverse">
      <div className="max-w-5xl w-full grid md:grid-cols-2 gap-8">
        {/* Left side - Hero content */}
        <div className="flex flex-col justify-center text-white">
          <h1 className="font-bold text-4xl mb-6">Welcome to Learniverse</h1>
          <div className="mb-6">
            <img 
              src="/learniverse-kids.png"
              alt="Learniverse students learning" 
              className="w-full h-auto rounded-lg shadow-lg"
            />
          </div>
        </div>

        {/* Right side - Auth forms */}
        <div>
          <Card className="glass-panel">
            <CardContent className="p-6">
              <Tabs 
                defaultValue="register" 
                value={activeTab} 
                onValueChange={(value) => setActiveTab(value as "login" | "register")}
                className="w-full"
              >
                <TabsList className="hidden">
                  <TabsTrigger value="login">Login</TabsTrigger>
                  <TabsTrigger value="register">Register</TabsTrigger>
                </TabsList>

                {/* Login Form */}
                <TabsContent value="login">
                  <h2 className="font-bold text-2xl mb-6 text-white">Welcome back</h2>
                  <Form {...loginForm}>
                    <form onSubmit={loginForm.handleSubmit(onLoginSubmit)} className="space-y-4">
                      <FormField
                        control={loginForm.control}
                        name="email"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-white">Email</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="you@example.com"
                                className="bg-white/10 border-white/20 text-white placeholder:text-white/50"
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
                            <FormLabel className="text-white">Password</FormLabel>
                            <FormControl>
                              <Input
                                type="password"
                                placeholder="••••••••"
                                className="bg-white/10 border-white/20 text-white placeholder:text-white/50"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage className="text-red-300" />
                          </FormItem>
                        )}
                      />
                      <Button
                        type="submit"
                        className="w-full bg-gradient-to-r from-yellow-400 to-amber-500 hover:from-yellow-500 hover:to-amber-600 text-black font-bold"
                        disabled={loginForm.formState.isSubmitting}
                      >
                        {loginForm.formState.isSubmitting ? "Logging in..." : "Login"}
                      </Button>
                    </form>
                  </Form>
                  <div className="mt-6">
                    <div className="relative">
                      <div className="absolute inset-0 flex items-center">
                        <Separator className="w-full border-white/20" />
                      </div>
                      <div className="relative flex justify-center text-xs">
                        <span className="bg-transparent px-2 text-white/70">
                          Or continue with
                        </span>
                      </div>
                    </div>
                    
                    <div className="mt-4 flex gap-3">
                      <a 
                        href="/api/auth/google" 
                        className="flex-1 bg-white text-black font-medium rounded-md py-2 px-4 flex items-center justify-center hover:bg-gray-100 transition-colors"
                      >
                        <img src="https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/google/google-original.svg" className="w-5 h-5 mr-2" /> 
                        Google
                      </a>
                      <a 
                        href="/api/auth/facebook" 
                        className="flex-1 bg-[#1877F2] text-white font-medium rounded-md py-2 px-4 flex items-center justify-center hover:bg-[#166FE5] transition-colors"
                      >
                        <img src="https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/facebook/facebook-original.svg" className="w-5 h-5 mr-2" /> 
                        Facebook
                      </a>
                      <a 
                        href="/api/auth/apple" 
                        className="flex-1 bg-black text-white font-medium rounded-md py-2 px-4 flex items-center justify-center hover:bg-gray-900 transition-colors"
                      >
                        <svg className="w-5 h-5 mr-2" viewBox="0 0 384 512" fill="currentColor">
                          <path d="M318.7 268.7c-.2-36.7 16.4-64.4 50-84.8-18.8-26.9-47.2-41.7-84.7-44.6-35.5-2.8-74.3 20.7-88.5 20.7-15 0-49.4-19.7-76.4-19.7C63.3 141.2 4 184.8 4 273.5q0 39.3 14.4 81.2c12.8 36.7 59 126.7 107.2 125.2 25.2-.6 43-17.9 75.8-17.9 31.8 0 48.3 17.9 76.4 17.9 48.6-.7 90.4-82.5 102.6-119.3-65.2-30.7-61.7-90-61.7-91.9zm-56.6-164.2c27.3-32.4 24.8-61.9 24-72.5-24.1 1.4-52 16.4-67.9 34.9-17.5 19.8-27.8 44.3-25.6 71.9 26.1 2 49.9-11.4 69.5-34.3z"/>
                        </svg>
                        Apple
                      </a>
                    </div>
                  </div>
                  
                  <div className="mt-4 text-center text-white/70">
                    <p>Don't have an account?{" "}
                      <button 
                        onClick={() => setActiveTab("register")} 
                        className="text-yellow-300 hover:underline"
                      >
                        Sign up
                      </button>
                    </p>
                  </div>
                </TabsContent>

                {/* Registration Form */}
                <TabsContent value="register">
                  <h2 className="font-bold text-2xl mb-4 text-white">Begin your learning adventure</h2>
                  <Form {...registerForm}>
                    <form onSubmit={registerForm.handleSubmit(onRegisterSubmit)} className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <FormField
                          control={registerForm.control}
                          name="firstName"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-white">First Name</FormLabel>
                              <FormControl>
                                <Input
                                  placeholder="Your first name"
                                  className="bg-white/10 border-white/20 text-white placeholder:text-white/50"
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
                              <FormLabel className="text-white">Last Name</FormLabel>
                              <FormControl>
                                <Input
                                  placeholder="Your last name"
                                  className="bg-white/10 border-white/20 text-white placeholder:text-white/50"
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
                            <FormLabel className="text-white">Email Address</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="you@example.com"
                                className="bg-white/10 border-white/20 text-white placeholder:text-white/50"
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
                            <FormLabel className="text-white">Password</FormLabel>
                            <FormControl>
                              <Input
                                type="password"
                                placeholder="Create a secure password"
                                className="bg-white/10 border-white/20 text-white placeholder:text-white/50"
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
                              <FormLabel className="text-white">Grade</FormLabel>
                              <Select
                                onValueChange={field.onChange}
                                defaultValue={field.value}
                              >
                                <FormControl>
                                  <SelectTrigger className="bg-white/10 border-white/20 text-white">
                                    <SelectValue placeholder="Select Grade" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent className="border-white/20 bg-blue-900/90 backdrop-blur-sm text-white">
                                  {GRADES.map((grade) => (
                                    <SelectItem key={grade} value={grade}>
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
                              <FormLabel className="text-white">Gender</FormLabel>
                              <Select
                                onValueChange={field.onChange}
                                defaultValue={field.value}
                              >
                                <FormControl>
                                  <SelectTrigger className="bg-white/10 border-white/20 text-white">
                                    <SelectValue placeholder="Select Gender" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent className="border-white/20 bg-blue-900/90 backdrop-blur-sm text-white">
                                  {GENDERS.map((gender) => {
                                    let label = "Male";
                                    if (gender === "female") label = "Female";
                                    else if (gender === "other") label = "Other";
                                    else if (gender === "prefer_not_to_say") label = "Prefer not to say";
                                    
                                    return (
                                      <SelectItem key={gender} value={gender}>
                                        {label}
                                      </SelectItem>
                                    );
                                  })}
                                </SelectContent>
                              </Select>
                              <FormMessage className="text-red-300" />
                            </FormItem>
                          )}
                        />
                      </div>
                      
                      <Button
                        type="submit"
                        className="w-full bg-yellow-400 hover:bg-yellow-500 text-black font-semibold py-2 mt-4"
                        disabled={registerForm.formState.isSubmitting}
                      >
                        {registerForm.formState.isSubmitting ? "Creating account..." : "REGISTER"}
                      </Button>
                    </form>
                  </Form>
                  <div className="mt-6">
                    <div className="relative">
                      <div className="absolute inset-0 flex items-center">
                        <Separator className="w-full border-white/20" />
                      </div>
                      <div className="relative flex justify-center text-xs">
                        <span className="bg-transparent px-2 text-white/70">
                          Or sign up with
                        </span>
                      </div>
                    </div>
                    
                    <div className="mt-4 flex gap-3">
                      <a 
                        href="/api/auth/google" 
                        className="flex-1 bg-white text-black font-medium rounded-md py-2 px-4 flex items-center justify-center hover:bg-gray-100 transition-colors"
                      >
                        <img src="https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/google/google-original.svg" className="w-5 h-5 mr-2" /> 
                        Google
                      </a>
                      <a 
                        href="/api/auth/facebook" 
                        className="flex-1 bg-[#1877F2] text-white font-medium rounded-md py-2 px-4 flex items-center justify-center hover:bg-[#166FE5] transition-colors"
                      >
                        <img src="https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/facebook/facebook-original.svg" className="w-5 h-5 mr-2" /> 
                        Facebook
                      </a>
                      <a 
                        href="/api/auth/apple" 
                        className="flex-1 bg-black text-white font-medium rounded-md py-2 px-4 flex items-center justify-center hover:bg-gray-900 transition-colors"
                      >
                        <svg className="w-5 h-5 mr-2" viewBox="0 0 384 512" fill="currentColor">
                          <path d="M318.7 268.7c-.2-36.7 16.4-64.4 50-84.8-18.8-26.9-47.2-41.7-84.7-44.6-35.5-2.8-74.3 20.7-88.5 20.7-15 0-49.4-19.7-76.4-19.7C63.3 141.2 4 184.8 4 273.5q0 39.3 14.4 81.2c12.8 36.7 59 126.7 107.2 125.2 25.2-.6 43-17.9 75.8-17.9 31.8 0 48.3 17.9 76.4 17.9 48.6-.7 90.4-82.5 102.6-119.3-65.2-30.7-61.7-90-61.7-91.9zm-56.6-164.2c27.3-32.4 24.8-61.9 24-72.5-24.1 1.4-52 16.4-67.9 34.9-17.5 19.8-27.8 44.3-25.6 71.9 26.1 2 49.9-11.4 69.5-34.3z"/>
                        </svg>
                        Apple
                      </a>
                    </div>
                  </div>
                  
                  <div className="mt-4 text-center text-white">
                    <p>Already have an account? <button 
                      onClick={() => setActiveTab("login")} 
                      className="text-yellow-400 hover:underline font-medium"
                    >
                      Sign in
                    </button></p>
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}