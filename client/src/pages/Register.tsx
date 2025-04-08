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
import { Link, useLocation } from "wouter";
import { useAuth } from "@/lib/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

const registerSchema = z.object({
  firstName: z.string().min(2, "First name must be at least 2 characters"),
  lastName: z.string().min(2, "Last name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  grade: z.string().refine((val) => val !== "", "Please select a grade"),
  gender: z.string().refine((val) => val !== "", "Please select a gender"),
});

type RegisterValues = z.infer<typeof registerSchema>;

export default function Register() {
  const { register } = useAuth();
  const [_, setLocation] = useLocation();
  const { toast } = useToast();

  const form = useForm<RegisterValues>({
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

  const onSubmit = async (data: RegisterValues) => {
    try {
      await register(data);
      toast({
        title: "Registration successful",
        description: "Welcome to Learniverse!",
      });
      setLocation("/theme-selection");
    } catch (error) {
      console.error("Registration error:", error);
      toast({
        title: "Registration failed",
        description: error instanceof Error ? error.message : "Please try again",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="container mx-auto px-4 py-10">
      <div className="max-w-4xl mx-auto grid md:grid-cols-2 gap-8">
        <div className="flex flex-col justify-center">
          <h1 className="font-bold text-4xl mb-6 text-white">Welcome to Learniverse</h1>
          <p className="text-lg mb-6 text-white">
            Where learning becomes an exciting adventure! Connect subjects through
            themed stories that align with your school curriculum.
          </p>
          <div className="hidden md:block">
            <img
              src="/src/assets/children-learning.svg"
              alt="Children learning"
              className="rounded-xl h-64 w-full object-cover"
            />
          </div>
        </div>
        
        <Card className="glass-panel border-0">
          <CardContent className="pt-6">
            <h2 className="font-bold text-2xl mb-6 text-white">Begin your learning adventure</h2>
            
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
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
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
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
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
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
                          placeholder="Create a password"
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
                    control={form.control}
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
                          <SelectContent>
                            <SelectItem value="1">Grade 1</SelectItem>
                            <SelectItem value="2">Grade 2</SelectItem>
                            <SelectItem value="3">Grade 3</SelectItem>
                            <SelectItem value="4">Grade 4</SelectItem>
                            <SelectItem value="5">Grade 5</SelectItem>
                            <SelectItem value="6">Grade 6</SelectItem>
                            <SelectItem value="7">Grade 7</SelectItem>
                            <SelectItem value="8">Grade 8</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
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
                          <SelectContent>
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
                  disabled={form.formState.isSubmitting}
                >
                  {form.formState.isSubmitting ? "Registering..." : "REGISTER"}
                </Button>
                
                <p className="text-center text-white mt-4">
                  Already have an account?{" "}
                  <Link href="/login">
                    <a className="text-yellow-400 font-semibold hover:underline">
                      Sign in
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
