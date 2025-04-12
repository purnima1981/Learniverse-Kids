import { useMutation } from "@tanstack/react-query";
import { useLocation } from "wouter";
// Removed auth import that was causing issues
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
  // Removed auth dependency
  const [_, setLocation] = useLocation();
  const { toast } = useToast();
  
  // Simple redirect to auth page instead of actual logout
  const handleLogout = async () => {
    toast({
      title: "Logging out...",
    });
    setTimeout(() => {
      setLocation('/auth');
    }, 500);
  };
  
  // Use theme data directly since this is a demonstration
  const themes = themeData;
  
  // Simplified theme mutation for demo without actual API calls
  const selectThemeMutation = {
    isPending: false
  };
  
  const handleThemeSelect = (themeId: number) => {
    // For demo purposes, we'll just navigate directly without saving to DB
    setLocation(`/regional-stories/${themeId}`);
    // In production, we would use:
    // selectThemeMutation.mutate(themeId);
  };
  
  return (
    <div className="min-h-screen bg-gradient-to-b from-cyan-500 to-blue-500 pt-10 pb-20">
      <div className="container mx-auto px-4">
        {/* Logout Button at the top right */}
        <div className="flex justify-end mb-4">
          <button
            onClick={handleLogout}
            className="bg-white/20 text-white py-2 px-4 rounded-md hover:bg-white/30 transition-colors flex items-center"
          >
            Sign Out
          </button>
        </div>
      
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h1 className="font-bold text-4xl md:text-5xl mb-4 text-white text-center">Choose Your Adventure</h1>
            <p className="text-lg mb-12 text-white text-center max-w-2xl mx-auto">
              Select a learning theme that excites you! Each theme creates a unique journey connecting different subjects through immersive stories.
            </p>
          </motion.div>
          
          {/* Carousel for mobile view */}
          <div className="block md:hidden mb-6">
            <Carousel className="w-full">
              <CarouselContent>
                {themes.map((theme, index) => (
                  <CarouselItem key={theme.id} className="md:basis-1/2 lg:basis-1/3">
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, delay: index * 0.1 }}
                      className="px-2" // Add padding for spacing between carousel items
                    >
                      <ThemeCard 
                        theme={theme}
                        onSelect={handleThemeSelect}
                        isSelecting={selectThemeMutation.isPending}
                      />
                    </motion.div>
                  </CarouselItem>
                ))}
              </CarouselContent>
              <div className="flex justify-center mt-4">
                <CarouselPrevious className="relative mr-2 static transform-none" />
                <CarouselNext className="relative ml-2 static transform-none" />
              </div>
            </Carousel>
          </div>
          
          {/* Grid for tablet and desktop */}
          <div className="hidden md:grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
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
