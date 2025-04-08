import React from 'react';
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
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";

// We'll reference the image directly from the public folder

const loginSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

type LoginValues = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const { loginMutation, user } = useAuth();
  const [_, setLocation] = useLocation();
  const { toast } = useToast();

  // Redirect to dashboard if already logged in
  React.useEffect(() => {
    if (user) {
      setLocation("/theme-selection");
    }
  }, [user, setLocation]);

  const form = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (data: LoginValues) => {
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

  return (
    <div className="flex min-h-screen">
      {/* Left side with image */}
      <div className="hidden lg:flex lg:w-1/2 relative">
        <img 
          src="/kids-learning.png"
          alt="Learniverse illustration showing diverse students learning" 
          className="absolute w-full h-full object-cover"
        />
        <div className="absolute inset-0 flex flex-col justify-center p-12 bg-gradient-to-r from-blue-600/80 to-cyan-500/70">
          <div className="text-white max-w-xl">
            <h1 className="text-5xl font-bold mb-6">Welcome to Learniverse</h1>
            <p className="text-xl mb-8">
              An innovative educational platform that connects various subjects through themed stories, making learning more engaging and effective for students in grades 1-8.
            </p>
          </div>
        </div>
      </div>

      {/* Right side with login form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-gradient-to-r from-cyan-400 to-blue-500">
        <Card className="w-full max-w-md bg-white/20 backdrop-blur-md border-0 shadow-xl">
          <CardContent className="pt-6">
            <h2 className="text-2xl font-bold text-white mb-6 text-center">Login to Your Account</h2>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
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
                  control={form.control}
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

                <p className="text-center text-white text-sm mt-6">
                  Don't have an account?{" "}
                  <button
                    type="button"
                    className="text-yellow-400 hover:underline font-medium"
                    onClick={() => setLocation("/register")}
                  >
                    Register now
                  </button>
                </p>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}