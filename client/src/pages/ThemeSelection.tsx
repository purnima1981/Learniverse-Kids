import { useQuery, useMutation } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { useAuth } from "@/lib/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import ThemeCard from "@/components/ThemeCard";
import { Theme } from "@shared/schema";

export default function ThemeSelection() {
  const { user, refreshUser } = useAuth();
  const [_, setLocation] = useLocation();
  const { toast } = useToast();
  
  const { data: themes, isLoading } = useQuery<Theme[]>({
    queryKey: ['/api/themes'],
  });
  
  const selectThemeMutation = useMutation({
    mutationFn: async (themeId: number) => {
      return apiRequest('POST', '/api/user/theme', { themeId });
    },
    onSuccess: async () => {
      await refreshUser();
      toast({
        title: "Theme selected!",
        description: "Your learning adventure is about to begin",
      });
      setLocation("/dashboard");
    },
    onError: (error) => {
      toast({
        title: "Error selecting theme",
        description: error instanceof Error ? error.message : "Please try again",
        variant: "destructive",
      });
    }
  });
  
  const handleThemeSelect = (themeId: number) => {
    selectThemeMutation.mutate(themeId);
  };
  
  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-10 flex justify-center items-center h-[80vh]">
        <div className="text-white text-xl">Loading themes...</div>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto px-4 py-10">
      <div className="max-w-6xl mx-auto">
        <h1 className="font-bold text-4xl mb-4 text-white">Select a Theme</h1>
        <p className="text-lg mb-8 text-white">
          Choose a learning theme that interests you. Each theme connects different subjects in exciting stories!
        </p>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {themes?.map((theme) => (
            <ThemeCard 
              key={theme.id}
              theme={theme}
              onSelect={handleThemeSelect}
              isSelecting={selectThemeMutation.isPending}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
