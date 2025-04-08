import { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormDescription,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { LEARNING_PREFERENCES, INTERESTS } from "@/lib/constants";
import { apiRequest } from "@/lib/queryClient";

// Personalization schema
const personalizationSchema = z.object({
  learningPreference: z.string().min(1, "Please select a learning preference"),
  interests: z.array(z.string()).min(1, "Please select at least one interest"),
});

type PersonalizationValues = z.infer<typeof personalizationSchema>;

export default function PersonalizationPage() {
  const [_, setLocation] = useLocation();
  const { toast } = useToast();
  const { user } = useAuth();
  
  // Redirect if not logged in
  useEffect(() => {
    if (!user) {
      setLocation('/auth');
    }
  }, [user, setLocation]);

  // Personalization form
  const form = useForm<PersonalizationValues>({
    resolver: zodResolver(personalizationSchema),
    defaultValues: {
      learningPreference: "",
      interests: [],
    },
  });

  // Handle form submission
  const onSubmit = async (data: PersonalizationValues) => {
    try {
      await apiRequest("POST", "/api/user/preferences", data);
      
      toast({
        title: "Preferences saved!",
        description: "Your learning experience has been personalized.",
      });
      
      // Redirect to theme selection
      setLocation('/theme-selection');
    } catch (error) {
      console.error("Error saving preferences:", error);
      toast({
        title: "Something went wrong",
        description: "Could not save your preferences. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-learniverse">
      <div className="max-w-3xl w-full">
        <Card className="glass-panel">
          <CardContent className="p-6">
            <h1 className="font-bold text-3xl mb-6 text-white">Personalize Your Learning Experience</h1>
            <p className="text-white/80 mb-6">
              Let us know how you prefer to learn, so we can tailor your education journey to fit your unique style.
            </p>
            
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                {/* Learning Preference */}
                <FormField
                  control={form.control}
                  name="learningPreference"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-white text-lg">How do you learn best?</FormLabel>
                      <FormDescription className="text-white/70">
                        Select the way you most prefer to absorb new information.
                      </FormDescription>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger className="bg-white/10 border-white/20 text-white">
                            <SelectValue placeholder="Select a learning style" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent className="border-white/20 bg-blue-900/90 backdrop-blur-sm text-white">
                          {LEARNING_PREFERENCES.map((preference) => (
                            <SelectItem key={preference.value} value={preference.value}>
                              {preference.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </FormItem>
                  )}
                />

                {/* Interests */}
                <FormField
                  control={form.control}
                  name="interests"
                  render={() => (
                    <FormItem>
                      <FormLabel className="text-white text-lg">What interests you?</FormLabel>
                      <FormDescription className="text-white/70">
                        Select topics that excite you. We'll use these to recommend stories and activities.
                      </FormDescription>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-3">
                        {INTERESTS.map((interest) => (
                          <FormField
                            key={interest.value}
                            control={form.control}
                            name="interests"
                            render={({ field }) => {
                              return (
                                <FormItem
                                  key={interest.value}
                                  className="flex flex-row items-start space-x-3 space-y-0"
                                >
                                  <FormControl>
                                    <Checkbox
                                      checked={field.value?.includes(interest.value)}
                                      onCheckedChange={(checked) => {
                                        return checked
                                          ? field.onChange([...field.value, interest.value])
                                          : field.onChange(
                                              field.value?.filter(
                                                (value) => value !== interest.value
                                              )
                                            )
                                      }}
                                    />
                                  </FormControl>
                                  <FormLabel className="text-white font-normal cursor-pointer">
                                    {interest.label}
                                  </FormLabel>
                                </FormItem>
                              )
                            }}
                          />
                        ))}
                      </div>
                    </FormItem>
                  )}
                />

                <Button
                  type="submit"
                  className="w-full bg-yellow-400 hover:bg-yellow-500 text-black font-semibold py-2 mt-4"
                  disabled={form.formState.isSubmitting}
                >
                  {form.formState.isSubmitting ? "Saving..." : "Continue to Theme Selection"}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}