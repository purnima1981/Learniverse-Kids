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

  // Redirect to dashboard if already logged in
  useEffect(() => {
    if (user) {
      setLocation("/theme-selection");
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
      
      await loginMutation.mutateAsync(loginData as any);
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
      
      await registerMutation.mutateAsync(registerData as any);
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
    <div className="min-h-screen flex bg-gradient-to-r from-cyan-400 to-blue-500 overflow-hidden">
      {/* Hero section (left) */}
      <div className="hidden lg:flex lg:w-1/2 flex-col justify-center items-center p-12 relative">
        <img 
          src="/assets/login-image.png" 
          alt="Learniverse illustration showing diverse students learning" 
          className="absolute h-full w-full object-cover"
        />
        <div className="text-white z-10 max-w-xl">
          <h1 className="text-5xl font-bold mb-6">Welcome to Learniverse</h1>
          <p className="text-xl mb-8">
            An innovative educational platform that connects various subjects through themed stories, making learning more engaging and effective for students in grades 1-8.
          </p>
          <div className="bg-white/20 backdrop-blur-sm rounded-xl p-6">
            <h3 className="text-2xl font-semibold mb-4">Features include:</h3>
            <ul className="space-y-2">
              <li className="flex items-center">
                <div className="h-2 w-2 bg-yellow-300 rounded-full mr-2"></div>
                <span>Personalized learning experiences</span>
              </li>
              <li className="flex items-center">
                <div className="h-2 w-2 bg-yellow-300 rounded-full mr-2"></div>
                <span>Interactive story-based learning</span>
              </li>
              <li className="flex items-center">
                <div className="h-2 w-2 bg-yellow-300 rounded-full mr-2"></div>
                <span>AI-powered reading coach</span>
              </li>
              <li className="flex items-center">
                <div className="h-2 w-2 bg-yellow-300 rounded-full mr-2"></div>
                <span>Vocabulary building with flashcards</span>
              </li>
              <li className="flex items-center">
                <div className="h-2 w-2 bg-yellow-300 rounded-full mr-2"></div>
                <span>Progress tracking and analytics</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Auth forms (right) */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-4 sm:p-8">
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
                      className="w-full py-6 bg-yellow-400 hover:bg-yellow-500 text-black font-bold"
                      disabled={loginMutation.isPending}
                    >
                      {loginMutation.isPending ? "Logging in..." : "SIGN IN"}
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

                    <p className="text-center text-white text-sm mt-6">
                      Don't have an account?{" "}
                      <button
                        type="button"
                        className="text-yellow-400 hover:underline font-medium"
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
                      className="w-full py-6 bg-yellow-400 hover:bg-yellow-500 text-black font-bold"
                      disabled={registerMutation.isPending}
                    >
                      {registerMutation.isPending ? "Creating account..." : "CREATE ACCOUNT"}
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
                        className="text-yellow-400 hover:underline font-medium"
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