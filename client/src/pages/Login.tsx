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
import { Link, useLocation } from "wouter";
import { useAuth } from "@/lib/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

const loginSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(1, "Please enter your password"),
});

type LoginValues = z.infer<typeof loginSchema>;

export default function Login() {
  const { login } = useAuth();
  const [_, setLocation] = useLocation();
  const { toast } = useToast();

  const form = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (data: LoginValues) => {
    try {
      await login(data.email, data.password);
      toast({
        title: "Login successful",
        description: "Welcome back to Learniverse!",
      });
      setLocation("/dashboard");
    } catch (error) {
      console.error("Login error:", error);
      toast({
        title: "Login failed",
        description: error instanceof Error ? error.message : "Invalid email or password",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="container mx-auto px-4 py-10">
      <div className="max-w-md mx-auto">
        <Card className="glass-panel border-0">
          <CardContent className="pt-6">
            <h2 className="font-bold text-2xl mb-6 text-center text-white">Welcome back to Learniverse</h2>
            
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
                          placeholder="Your email address"
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
                          placeholder="Your password"
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
                  disabled={form.formState.isSubmitting}
                >
                  {form.formState.isSubmitting ? "Logging in..." : "SIGN IN"}
                </Button>
                
                <p className="text-center text-white mt-4">
                  Don't have an account?{" "}
                  <Link href="/register">
                    <a className="text-yellow-400 font-semibold hover:underline">
                      Register
                    </a>
                  </Link>
                </p>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
