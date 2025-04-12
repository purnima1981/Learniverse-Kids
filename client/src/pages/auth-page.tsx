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

// Import the images directly from the assets folder

import learniverseCharacters from "../assets/images/learniverse-kids.png";

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

export default function AuthPage() {
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
    <div className="min-h-screen flex bg-gradient-to-r from-[#36D7B7] to-[#45AEF5] overflow-hidden">
      {/* Hero section (left) */}
      <div className="hidden lg:block lg:w-1/2 relative">
        <div className="absolute inset-0 bg-gradient-to-r from-[#36D7B7]/80 to-[#45AEF5]/80 z-10"></div>
        <div className="relative flex flex-col justify-center h-full p-12 z-20">
          <div className="text-white z-20 max-w-xl">
            <h1 className="text-5xl font-bold mb-6">Welcome to Learniverse</h1>
            <p className="text-xl mb-8">
              An innovative educational platform that connects various subjects through themed stories, making learning more engaging and effective for students in grades 1-8.
            </p>
            
            {/* Feature highlight cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
              <div className="bg-white/20 backdrop-blur-sm rounded-xl p-5 hover:bg-white/30 transition-all duration-300 transform hover:-translate-y-1">
                <div className="flex items-center mb-3">
                  <div className="h-4 w-4 bg-[#36D7B7] rounded-full mr-3"></div>
                  <h3 className="text-xl font-semibold">Story-Based Learning</h3>
                </div>
                <p className="text-white/90 text-sm">Engaging narratives that connect different subjects in a meaningful context</p>
              </div>
              
              <div className="bg-white/20 backdrop-blur-sm rounded-xl p-5 hover:bg-white/30 transition-all duration-300 transform hover:-translate-y-1">
                <div className="flex items-center mb-3">
                  <div className="h-4 w-4 bg-[#45AEF5] rounded-full mr-3"></div>
                  <h3 className="text-xl font-semibold">AI Reading Coach</h3>
                </div>
                <p className="text-white/90 text-sm">Personalized reading assistance and feedback for continuous improvement</p>
              </div>
              
              <div className="bg-white/20 backdrop-blur-sm rounded-xl p-5 hover:bg-white/30 transition-all duration-300 transform hover:-translate-y-1">
                <div className="flex items-center mb-3">
                  <div className="h-4 w-4 bg-[#36D7B7] rounded-full mr-3"></div>
                  <h3 className="text-xl font-semibold">Connected Platform</h3>
                </div>
                <p className="text-white/90 text-sm">Cetralized platform that connects parents, teachers,students and tutors</p>
              </div>
              
              <div className="bg-white/20 backdrop-blur-sm rounded-xl p-5 hover:bg-white/30 transition-all duration-300 transform hover:-translate-y-1">
                <div className="flex items-center mb-3">
                  <div className="h-4 w-4 bg-[#45AEF5] rounded-full mr-3"></div>
                  <h3 className="text-xl font-semibold">Progress Tracking</h3>
                </div>
                <p className="text-white/90 text-sm">Detailed analytics to monitor learning achievements and areas for growth</p>
              </div>
            </div>

            {/* Additional educational benefits section */}
            <div className="bg-white/20 backdrop-blur-sm rounded-xl p-5 mb-4">
              <h3 className="text-xl font-semibold mb-3">Educational Benefits</h3>
              <ul className="space-y-2">
                <li className="flex items-start">
                  <div className="h-2 w-2 bg-[#36D7B7] rounded-full mr-2 mt-2"></div>
                  <span>Improved retention through contextual learning</span>
                </li>
                <li className="flex items-start">
                  <div className="h-2 w-2 bg-[#45AEF5] rounded-full mr-2 mt-2"></div>
                  <span>Interdisciplinary approach connecting multiple subjects</span>
                </li>
                <li className="flex items-start">
                  <div className="h-2 w-2 bg-[#36D7B7] rounded-full mr-2 mt-2"></div>
                  <span>Culturally diverse content from regional epics</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Auth forms (right) */}
      <div className="w-full lg:w-1/2 flex flex-col items-center justify-center p-4 sm:p-8">
        <img 
          src={learniverseCharacters} 
          alt="Learniverse characters" 
          className="mb-6 w-full max-w-md"
        />
        <Card className="w-full max-w-md bg-white/20 backdrop-blur-md border-0 shadow-xl">
          <CardContent className="pt-6">
            <Tabs
              defaultValue="login"
              value={activeTab}
              onValueChange={setActiveTab}
              className="w-full"
            >
              <TabsList className="grid w-full grid-cols-2 mb-6">
                <TabsTrigger value="login" className="rounded-l-lg">Login</TabsTrigger>
                <TabsTrigger value="register" className="rounded-r-lg">Register</TabsTrigger>
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
                          <FormLabel className="text-white">Email Address</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="your.email@example.com"
                              className="bg-white/10 border-white/20 text-white placeholder:text-white/50"
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
                          <FormLabel className="text-white">Password</FormLabel>
                          <FormControl>
                            <Input
                              type="password"
                              placeholder="••••••••"
                              className="bg-white/10 border-white/20 text-white placeholder:text-white/50"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <Button
                      type="submit"
                      className="w-full py-6 bg-gradient-to-r from-[#36D7B7] to-[#27c9a9] text-white font-bold text-lg"
                      disabled={loginMutation.isPending}
                      size="lg"
                    >
                      <div className="flex items-center justify-center">
                        {loginMutation.isPending ? "Logging in..." : "SIGN IN TO YOUR ACCOUNT"}
                        <svg className="w-6 h-6 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3"></path>
                        </svg>
                      </div>
                    </Button>

                    <div className="relative my-6">
                      <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-white/20"></div>
                      </div>
                      <div className="relative flex justify-center text-sm">
                        <span className="px-2 bg-transparent text-white">Or continue with</span>
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-3">
                      <Button
                        type="button"
                        variant="outline"
                        className="bg-white/10 border-white/20 hover:bg-white/20 text-white"
                        onClick={() => handleSocialLogin('Google')}
                      >
                        <FcGoogle className="h-5 w-5" />
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        className="bg-white/10 border-white/20 hover:bg-white/20 text-white"
                        onClick={() => handleSocialLogin('Facebook')}
                      >
                        <SiFacebook className="h-5 w-5 text-blue-600" />
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        className="bg-white/10 border-white/20 hover:bg-white/20 text-white"
                        onClick={() => handleSocialLogin('Apple')}
                      >
                        <SiApple className="h-5 w-5" />
                      </Button>
                    </div>

                    <div className="flex flex-col items-center space-y-2 mt-4">
                      <button 
                        type="button" 
                        className="text-[#45AEF5] hover:underline text-sm font-medium"
                        onClick={() => {
                          toast({
                            title: "Password reset",
                            description: "Password reset link sent to your email!",
                          });
                        }}
                      >
                        Forgot your password?
                      </button>
                      
                      <p className="text-center text-white text-sm mt-2">
                        Don't have an account?{" "}
                        <button
                          type="button"
                          className="text-[#45AEF5] hover:underline font-medium"
                          onClick={() => setActiveTab("register")}
                        >
                          Register now
                        </button>
                      </p>
                    </div>
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
                            <FormLabel className="text-white">First Name</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="First name"
                                className="bg-white/10 border-white/20 text-white placeholder:text-white/50"
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
                            <FormLabel className="text-white">Last Name</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="Last name"
                                className="bg-white/10 border-white/20 text-white placeholder:text-white/50"
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
                          <FormLabel className="text-white">Email Address</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="your.email@example.com"
                              className="bg-white/10 border-white/20 text-white placeholder:text-white/50"
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
                          <FormLabel className="text-white">Password</FormLabel>
                          <FormControl>
                            <Input
                              type="password"
                              placeholder="••••••••"
                              className="bg-white/10 border-white/20 text-white placeholder:text-white/50"
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
                              <SelectContent className="bg-slate-900 border-white/20 text-white">
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
                              <SelectContent className="bg-slate-900 border-white/20 text-white">
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
                      className="w-full py-6 bg-gradient-to-r from-[#45AEF5] to-[#3498db] text-white font-bold text-lg"
                      disabled={registerMutation.isPending}
                      size="lg"
                    >
                      <div className="flex items-center justify-center">
                        {registerMutation.isPending ? "Creating account..." : "CREATE YOUR ACCOUNT NOW"}
                        <svg className="w-6 h-6 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
                        </svg>
                      </div>
                    </Button>

                    <div className="relative my-6">
                      <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-white/20"></div>
                      </div>
                      <div className="relative flex justify-center text-sm">
                        <span className="px-2 bg-transparent text-white">Or register with</span>
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-3">
                      <Button
                        type="button"
                        variant="outline"
                        className="bg-white/10 border-white/20 hover:bg-white/20 text-white"
                        onClick={() => handleSocialLogin('Google')}
                      >
                        <FcGoogle className="h-5 w-5" />
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        className="bg-white/10 border-white/20 hover:bg-white/20 text-white"
                        onClick={() => handleSocialLogin('Facebook')}
                      >
                        <SiFacebook className="h-5 w-5 text-blue-600" />
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        className="bg-white/10 border-white/20 hover:bg-white/20 text-white"
                        onClick={() => handleSocialLogin('Apple')}
                      >
                        <SiApple className="h-5 w-5" />
                      </Button>
                    </div>

                    <p className="text-center text-white text-sm mt-6">
                      Already have an account?{" "}
                      <button
                        type="button"
                        className="text-[#36D7B7] hover:underline font-medium"
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
  );
}