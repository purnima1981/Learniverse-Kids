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
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useLocation } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { GRADES, GENDERS } from "@/lib/constants";

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
    },
  });

  // Get auth context
  const { loginMutation, registerMutation } = useAuth();

  // Login submission handler
  const onLoginSubmit = async (data: LoginValues) => {
    try {
      await loginMutation.mutateAsync(data);
      // Redirect to dashboard on success
      setLocation("/dashboard");
    } catch (error) {
      console.error("Login error:", error);
      // Toast notifications are handled by the auth context
    }
  };

  // Registration submission handler
  const onRegisterSubmit = async (data: RegisterValues) => {
    try {
      await registerMutation.mutateAsync(data);
      // Redirect to theme selection on success
      setLocation("/theme-selection");
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
              src="client/src/assets/learniverse-kids.png"
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