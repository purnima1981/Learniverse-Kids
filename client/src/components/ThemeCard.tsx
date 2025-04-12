import { Theme } from "@shared/schema";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import { useState } from "react";

interface ThemeCardProps {
  theme: Theme;
  onSelect: (themeId: number) => void;
  isSelecting: boolean;
}

export default function ThemeCard({ theme, onSelect, isSelecting }: ThemeCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  
  const handleClick = () => {
    if (!isSelecting) {
      onSelect(theme.id);
    }
  };
  
  // Ensure consistent description length for uniform card heights
  const truncateDescription = (description: string, maxLength = 100) => {
    return description.length > maxLength
      ? `${description.substring(0, maxLength)}...`
      : description;
  };
  
  // Theme-specific colors based on the ID
  const getThemeColors = (id: number) => {
    switch (id) {
      case 2: return "from-purple-500 to-indigo-700"; // Realistic Fiction
      case 7: return "from-cyan-500 to-blue-600"; // Voyages
      default: return "from-blue-500 to-indigo-700";
    }
  };

  const getBadgeColor = (id: number) => {
    switch (id) {
      case 2: return "bg-purple-600 hover:bg-purple-700"; // Realistic Fiction
      case 7: return "bg-cyan-600 hover:bg-cyan-700"; // Voyages
      default: return "bg-blue-600 hover:bg-blue-700";
    }
  };
  
  // Theme-specific background patterns based on the ID
  const getThemeBackground = (id: number) => {
    switch (id) {
      case 2: return "from-purple-700 to-indigo-900"; // Realistic Fiction
      case 7: return "from-cyan-700 to-blue-900"; // Voyages
      default: return "from-blue-700 to-indigo-900";
    }
  };
  
  // Theme-specific icons based on the ID
  const getThemeIcon = (id: number, name: string) => {
    const iconSize = "text-7xl text-white/90";
    
    switch (id) {
      case 2: return <div className={iconSize}>📚</div>; // Realistic Fiction
      case 7: return <div className={iconSize}>🧭</div>; // Voyages
      default: return <span className={iconSize}>{ name.charAt(0) }</span>;
    }
  };

  // Theme-specific subjects icons
  const getThemeSubjects = (id: number) => {
    switch (id) {
      case 2: // Realistic Fiction
        return (
          <div className="flex space-x-2 mt-2">
            <span className="text-xl animate-float" style={{ animationDelay: '0s' }}>📏</span>
            <span className="text-xl animate-float" style={{ animationDelay: '0.5s' }}>🧪</span>
            <span className="text-xl animate-float" style={{ animationDelay: '1s' }}>📖</span>
            <span className="text-xl animate-float" style={{ animationDelay: '1.5s' }}>🌍</span>
          </div>
        );
      case 7: // Voyages
        return (
          <div className="flex space-x-2 mt-2">
            <span className="text-xl animate-float" style={{ animationDelay: '0s' }}>🧮</span>
            <span className="text-xl animate-float" style={{ animationDelay: '0.5s' }}>🔭</span>
            <span className="text-xl animate-float" style={{ animationDelay: '1s' }}>🧭</span>
            <span className="text-xl animate-float" style={{ animationDelay: '1.5s' }}>🌊</span>
          </div>
        );
      default:
        return null;
    }
  };
  
  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      transition={{ duration: 0.3 }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
    >
      <Card 
        className={`theme-card rounded-xl overflow-hidden cursor-pointer shadow-xl bg-gradient-to-br ${getThemeColors(theme.id)} border-white/20 h-[380px] transition-all duration-300`}
        onClick={handleClick}
      >
        <div className="w-full h-52 relative overflow-hidden">
          {/* Generate theme-specific background if a proper image URL is not available */}
          {(theme.imageUrl && !theme.imageUrl.includes("themes-cover.png")) ? (
            <div className="relative w-full h-full">
              <motion.img 
                src={theme.imageUrl} 
                alt={theme.name} 
                className="w-full h-full object-cover"
                animate={isHovered ? { scale: 1.1 } : { scale: 1 }}
                transition={{ duration: 0.5 }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent mix-blend-overlay"></div>
            </div>
          ) : (
            <div className={`w-full h-full bg-gradient-to-br ${getThemeBackground(theme.id)} flex items-center justify-center relative overflow-hidden`}>
              {/* Animated pattern overlay */}
              <div className="absolute inset-0 opacity-20">
                <div className="stars1"></div>
              </div>
              
              {/* Icon with floating animation */}
              <motion.div
                animate={isHovered ? { y: [-5, 5, -5] } : { y: 0 }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                className="z-10"
              >
                {getThemeIcon(theme.id, theme.name)}
              </motion.div>
            </div>
          )}
          
          {/* Gradient overlay with enhanced opacity and depth */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent"></div>
          
          {/* Illuminated border that appears on hover */}
          <motion.div 
            className="absolute inset-0 border-2 border-white/0 rounded-t-xl z-10"
            animate={isHovered ? { borderColor: "rgba(255,255,255,0.3)", boxShadow: "inset 0 0 20px rgba(255,255,255,0.1)" } : { borderColor: "rgba(255,255,255,0)" }}
            transition={{ duration: 0.3 }}
          />
          
          {/* Subject icons that appear on hover */}
          <motion.div 
            className="absolute bottom-2 right-2 z-20"
            initial={{ opacity: 0 }}
            animate={isHovered ? { opacity: 1 } : { opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            {getThemeSubjects(theme.id)}
          </motion.div>
        </div>
        
        {/* Card content with improved spacing and animations */}
        <div className="p-5 relative">
          <motion.div 
            initial={{ y: 0 }}
            animate={isHovered ? { y: -5 } : { y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Badge className={`mb-3 ${getBadgeColor(theme.id)} text-white font-semibold px-4 py-1 h-[28px] shadow-md`}>
              {theme.name === "Realistic Fiction" ? "📚 Realistic Fiction" :
               theme.name === "Voyages" ? "🧭 Voyages" : theme.name}
            </Badge>
            
            <h3 className="font-bold text-xl text-white mb-2">{theme.name}</h3>
            
            <p className="text-white/90 text-sm leading-relaxed line-clamp-3">
              {truncateDescription(theme.description)}
            </p>
          </motion.div>
          
          {/* Select button that becomes more visible on hover */}
          <motion.div 
            className="mt-3 flex justify-end"
            initial={{ opacity: 0.7 }}
            animate={isHovered ? { opacity: 1 } : { opacity: 0.7 }}
            transition={{ duration: 0.3 }}
          >
            <Badge className="bg-white/30 hover:bg-white/50 text-white px-3 py-1 cursor-pointer transition-all duration-300">
              Select Theme
            </Badge>
          </motion.div>
        </div>
      </Card>
    </motion.div>
  );
}
