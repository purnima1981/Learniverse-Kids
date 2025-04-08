import { useMutation } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import ThemeCard from "@/components/ThemeCard";
import { Theme } from "@shared/schema";
import { 
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { themeData } from "@/data/themes";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";

export default function ThemeSelection() {
  const { user } = useAuth();
  const [_, setLocation] = useLocation();
  const { toast } = useToast();
  
  // Use theme data directly since this is a demonstration
  const themes = themeData;
  
  const selectThemeMutation = useMutation({
    mutationFn: async (themeId: number) => {
      return apiRequest('POST', '/api/user/theme', { themeId });
    },
    onSuccess: (_, themeId) => {
      toast({
        title: "Theme selected!",
        description: "Now choose a regional story collection",
      });
      // Instead of going to dashboard, go to the regional stories page
      setLocation(`/regional-stories/${themeId}`);
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
    // For demo purposes, we'll just navigate directly without saving to DB
    setLocation(`/regional-stories/${themeId}`);
    // In production, we would use:
    // selectThemeMutation.mutate(themeId);
  };
  
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-950 to-blue-900 pt-10 pb-20">
      <div className="container mx-auto px-4">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h1 className="font-bold text-4xl md:text-5xl mb-4 text-white text-center">Choose Your Adventure</h1>
            <p className="text-lg mb-12 text-blue-100 text-center max-w-2xl mx-auto">
              Select a learning theme that excites you! Each theme creates a unique journey connecting different subjects through immersive stories.
            </p>
          </motion.div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {themes.map((theme, index) => (
              <motion.div
                key={theme.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <ThemeCard 
                  theme={theme}
                  onSelect={handleThemeSelect}
                  isSelecting={selectThemeMutation.isPending}
                />
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
