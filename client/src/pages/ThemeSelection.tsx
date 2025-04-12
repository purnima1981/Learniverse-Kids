import { useMutation } from "@tanstack/react-query";
import { useLocation } from "wouter";
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
import { useState, useEffect } from "react";

// Animation variants for the page elements
const pageVariants = {
  hidden: { opacity: 0 },
  visible: { 
    opacity: 1,
    transition: { 
      when: "beforeChildren",
      staggerChildren: 0.2,
      duration: 0.6 
    }
  }
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: { 
    y: 0, 
    opacity: 1,
    transition: { duration: 0.5 }
  }
};

// Animated floating elements for cosmic background
const FloatingElement = ({ emoji, delay, duration, size, opacity = 0.5, top, left }: { 
  emoji: string; 
  delay: number; 
  duration: number;
  size: string;
  opacity?: number;
  top: string;
  left: string;
}) => {
  return (
    <motion.div 
      className={`absolute ${size} text-white opacity-${opacity * 10} pointer-events-none`}
      style={{ top, left }}
      initial={{ y: 0 }}
      animate={{ 
        y: [0, -15, 0, -10, 0],
      }}
      transition={{ 
        repeat: Infinity, 
        duration, 
        delay,
        ease: "easeInOut"
      }}
    >
      {emoji}
    </motion.div>
  );
};

export default function ThemeSelection() {
  const [_, setLocation] = useLocation();
  const { toast } = useToast();
  const [isLoaded, setIsLoaded] = useState(false);
  
  // Simple redirect to auth page instead of actual logout
  const handleLogout = async () => {
    toast({
      title: "Logging out...",
    });
    setTimeout(() => {
      setLocation('/auth');
    }, 500);
  };
  
  // Use theme data directly 
  const themes = themeData;
  
  // Simplified theme mutation for demo
  const selectThemeMutation = {
    isPending: false
  };
  
  const handleThemeSelect = (themeId: number) => {
    // Create a selection animation
    toast({
      title: "Theme selected!",
      description: "Preparing your personalized learning journey...",
      duration: 1500,
    });
    
    // Navigate after a brief delay for animation
    setTimeout(() => {
      setLocation(`/regional-stories/${themeId}`);
    }, 700);
  };

  // Simulate a loading effect
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoaded(true);
    }, 300);
    
    return () => clearTimeout(timer);
  }, []);
  
  return (
    <motion.div 
      className="min-h-screen overflow-hidden relative bg-gradient-to-b from-blue-900 via-blue-700 to-cyan-600"
      initial="hidden"
      animate={isLoaded ? "visible" : "hidden"}
      variants={pageVariants}
    >
      {/* Animated background elements */}
      <div className="absolute inset-0 w-full h-full overflow-hidden">
        <div className="stars1"></div>
        <div className="stars2"></div>
        <div className="stars3"></div>
      </div>

      {/* Floating educational symbols */}
      <FloatingElement emoji="π" delay={0.5} duration={5} size="text-2xl" top="10%" left="10%" />
      <FloatingElement emoji="∑" delay={1.2} duration={6} size="text-3xl" top="15%" left="85%" />
      <FloatingElement emoji="∞" delay={2.1} duration={7} size="text-2xl" top="80%" left="15%" />
      <FloatingElement emoji="⚛" delay={0.7} duration={8} size="text-2xl" top="75%" left="80%" />
      <FloatingElement emoji="🔭" delay={1.5} duration={4} size="text-xl" top="25%" left="25%" />
      <FloatingElement emoji="📚" delay={3.2} duration={6} size="text-xl" top="60%" left="88%" />
      <FloatingElement emoji="🧪" delay={2.8} duration={5} size="text-xl" top="85%" left="45%" />
      <FloatingElement emoji="🧮" delay={0.9} duration={7} size="text-xl" top="35%" left="65%" />

      <div className="container mx-auto px-4 pt-6 pb-20 relative z-10">
        {/* Header area with navigation */}
        <div className="flex justify-between items-center mb-10">
          <motion.div 
            variants={itemVariants}
            className="flex items-center"
          >
            <span className="text-3xl mr-2">🌟</span>
            <h2 className="font-bold text-2xl text-white">Learniverse</h2>
          </motion.div>
          
          <motion.button
            variants={itemVariants}
            onClick={handleLogout}
            className="bg-white/10 backdrop-blur-sm text-white py-2 px-4 rounded-full hover:bg-white/20 transition-colors flex items-center border border-white/20 shadow-lg"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.98 }}
          >
            <span className="mr-2">🚀</span>
            Sign Out
          </motion.button>
        </div>
      
        <div className="max-w-6xl mx-auto">
          {/* Hero section */}
          <motion.div
            variants={itemVariants}
            className="mb-12 relative"
          >
            <div className="absolute -top-20 -left-20 w-40 h-40 bg-cyan-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
            <div className="absolute -bottom-20 -right-20 w-40 h-40 bg-purple-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
            
            <h1 className="font-bold text-4xl md:text-6xl mb-6 text-white text-center tracking-tight">
              Choose Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 to-blue-300">Learning Adventure</span>
            </h1>
            <p className="text-xl mb-8 text-blue-100 text-center max-w-2xl mx-auto leading-relaxed">
              Select a theme that speaks to you. Each journey weaves together mathematics, science, and literature through immersive, interconnected stories.
            </p>
            
            <motion.div 
              variants={itemVariants}
              className="flex justify-center gap-4 mb-10"
            >
              <Badge className="bg-gradient-to-r from-cyan-400 to-blue-400 px-4 py-2 text-white text-md">
                <span className="mr-1">📊</span> Personalized Learning
              </Badge>
              <Badge className="bg-gradient-to-r from-purple-400 to-pink-400 px-4 py-2 text-white text-md">
                <span className="mr-1">🧩</span> Interactive Stories
              </Badge>
            </motion.div>
          </motion.div>
          
          {/* Theme selection section with subtle glow */}
          <motion.div 
            variants={itemVariants}
            className="relative z-10 mb-10"
          >
            <div className="absolute inset-0 bg-gradient-to-b from-blue-400/10 to-transparent rounded-3xl blur-xl"></div>
            <h2 className="text-2xl text-white font-bold mb-6 text-center">Available Learning Themes</h2>
          </motion.div>
          
          {/* Carousel for mobile view with improved styling */}
          <motion.div 
            variants={itemVariants}
            className="block md:hidden mb-6"
          >
            <Carousel className="w-full">
              <CarouselContent>
                {themes.map((theme, index) => (
                  <CarouselItem key={theme.id} className="md:basis-1/2 lg:basis-1/3">
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, delay: index * 0.2 }}
                      className="px-3" // Increased padding for spacing between carousel items
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
              <div className="flex justify-center mt-6">
                <CarouselPrevious className="relative mr-4 bg-white/10 backdrop-blur-sm border-white/20 text-white hover:bg-white/20" />
                <CarouselNext className="relative ml-4 bg-white/10 backdrop-blur-sm border-white/20 text-white hover:bg-white/20" />
              </div>
            </Carousel>
          </motion.div>
          
          {/* Grid for tablet and desktop with improved layout and spacing */}
          <motion.div
            variants={itemVariants} 
            className="hidden md:grid md:grid-cols-2 gap-10 max-w-5xl mx-auto"
          >
            {themes.map((theme, index) => (
              <motion.div
                key={theme.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 + index * 0.2 }}
                className="transform hover:scale-105 transition-transform duration-300"
              >
                <div className="relative">
                  {/* Add subtle glow effect behind cards */}
                  <div className="absolute -inset-1 bg-gradient-to-r from-cyan-400 to-blue-500 rounded-xl opacity-20 blur-lg group-hover:opacity-50 transition-opacity"></div>
                  
                  <ThemeCard 
                    theme={theme}
                    onSelect={handleThemeSelect}
                    isSelecting={selectThemeMutation.isPending}
                  />
                </div>
              </motion.div>
            ))}
          </motion.div>
          
          {/* Footer with educational quote */}
          <motion.div 
            variants={itemVariants}
            className="mt-16 text-center text-blue-200 italic max-w-2xl mx-auto border-t border-blue-400/20 pt-6"
          >
            "Education is not the learning of facts, but the training of the mind to think." — Albert Einstein
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
}
