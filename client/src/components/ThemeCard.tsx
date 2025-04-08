import { Theme } from "@shared/schema";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";

interface ThemeCardProps {
  theme: Theme;
  onSelect: (themeId: number) => void;
  isSelecting: boolean;
}

export default function ThemeCard({ theme, onSelect, isSelecting }: ThemeCardProps) {
  const handleClick = () => {
    if (!isSelecting) {
      onSelect(theme.id);
    }
  };
  
  // Theme-specific colors based on the ID
  const getThemeColors = (id: number) => {
    switch (id % 8) {
      case 1: return "from-orange-400 to-amber-600"; // Mythology
      case 2: return "from-purple-500 to-indigo-700"; // Space
      case 3: return "from-amber-500 to-yellow-700"; // Kingdoms
      case 4: return "from-emerald-400 to-teal-600"; // Civilization
      case 5: return "from-pink-400 to-rose-600"; // Folklore
      case 6: return "from-sky-400 to-blue-600"; // Biblical
      case 7: return "from-cyan-400 to-blue-500"; // Ocean
      case 0: return "from-violet-400 to-purple-600"; // Future Technology
      default: return "from-blue-400 to-indigo-600";
    }
  };

  const getBadgeColor = (id: number) => {
    switch (id % 8) {
      case 1: return "bg-orange-500 hover:bg-orange-600"; // Mythology
      case 2: return "bg-purple-600 hover:bg-purple-700"; // Space
      case 3: return "bg-amber-600 hover:bg-amber-700"; // Kingdoms
      case 4: return "bg-emerald-600 hover:bg-emerald-700"; // Civilization
      case 5: return "bg-pink-600 hover:bg-pink-700"; // Folklore
      case 6: return "bg-sky-600 hover:bg-sky-700"; // Biblical
      case 7: return "bg-cyan-600 hover:bg-cyan-700"; // Ocean
      case 0: return "bg-violet-600 hover:bg-violet-700"; // Future Technology
      default: return "bg-blue-600 hover:bg-blue-700";
    }
  };
  
  return (
    <motion.div
      whileHover={{ scale: 1.03 }}
      transition={{ duration: 0.2 }}
    >
      <Card 
        className={`theme-card rounded-xl overflow-hidden cursor-pointer shadow-lg bg-gradient-to-br ${getThemeColors(theme.id)} border-white/20`}
        onClick={handleClick}
      >
        <div className="w-full h-48 relative overflow-hidden">
          {theme.imageUrl ? (
            <div className="relative w-full h-full">
              <img 
                src={theme.imageUrl} 
                alt={theme.name} 
                className="w-full h-full object-cover transition-transform hover:scale-110 duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent mix-blend-overlay"></div>
            </div>
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-blue-700 to-indigo-900 flex items-center justify-center">
              <span className="text-3xl text-white/60">{ theme.name.charAt(0) }</span>
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
        </div>
        <div className="p-4 relative">
          <Badge className={`mb-2 ${getBadgeColor(theme.id)} text-white font-semibold`}>
            {theme.name === "Mythology" ? "🏛️ Mythology" : 
             theme.name === "Space Exploration" ? "🚀 Space" :
             theme.name === "Ancient Kingdoms" ? "👑 Kingdoms" : 
             theme.name === "Modern Civilization" ? "🏙️ Civilization" :
             theme.name === "Folklore & Fairy Tales" ? "🧚 Folklore" :
             theme.name === "Biblical Stories" ? "📜 Biblical" :
             theme.name === "Ocean Adventures" ? "🌊 Ocean" :
             theme.name === "Future Technology" ? "🤖 Technology" : theme.name}
          </Badge>
          <h3 className="font-bold text-xl text-white">{theme.name}</h3>
          <p className="text-white/90 text-sm mt-1">{theme.description}</p>
        </div>
      </Card>
    </motion.div>
  );
}
