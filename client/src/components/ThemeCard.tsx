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
  
  // Ensure consistent description length for uniform card heights
  const truncateDescription = (description: string, maxLength = 80) => {
    return description.length > maxLength
      ? `${description.substring(0, maxLength)}...`
      : description;
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
  
  // Theme-specific background patterns based on the ID
  const getThemeBackground = (id: number) => {
    switch (id % 8) {
      case 1: return "from-orange-600 to-amber-800"; // Mythology
      case 2: return "from-purple-700 to-indigo-900"; // Space
      case 3: return "from-amber-700 to-yellow-900"; // Kingdoms
      case 4: return "from-emerald-600 to-teal-800"; // Civilization
      case 5: return "from-pink-600 to-rose-800"; // Folklore
      case 6: return "from-sky-600 to-blue-800"; // Biblical
      case 7: return "from-cyan-600 to-blue-800"; // Ocean
      case 0: return "from-violet-600 to-purple-900"; // Future Technology
      default: return "from-blue-600 to-indigo-900";
    }
  };
  
  // Theme-specific icons based on the ID
  const getThemeIcon = (id: number, name: string) => {
    const iconSize = "text-6xl text-white/80";
    
    switch (id % 8) {
      case 1: return <div className={iconSize}>🏛️</div>; // Mythology
      case 2: return <div className={iconSize}>🚀</div>; // Space
      case 3: return <div className={iconSize}>👑</div>; // Kingdoms
      case 4: return <div className={iconSize}>🏙️</div>; // Civilization
      case 5: return <div className={iconSize}>🧚</div>; // Folklore
      case 6: return <div className={iconSize}>📜</div>; // Biblical
      case 7: return <div className={iconSize}>🌊</div>; // Ocean
      case 0: return <div className={iconSize}>🤖</div>; // Future Technology
      default: return <span className="text-6xl text-white/80">{ name.charAt(0) }</span>;
    }
  };
  
  return (
    <motion.div
      whileHover={{ scale: 1.03 }}
      transition={{ duration: 0.2 }}
    >
      <Card 
        className={`theme-card rounded-xl overflow-hidden cursor-pointer shadow-lg bg-gradient-to-br ${getThemeColors(theme.id)} border-white/20 h-[360px]`}
        onClick={handleClick}
      >
        <div className="w-full h-48 relative overflow-hidden">
          {/* Generate theme-specific background if a proper image URL is not available */}
          {(theme.imageUrl && !theme.imageUrl.includes("themes-cover.png")) ? (
            <div className="relative w-full h-full">
              <img 
                src={theme.imageUrl} 
                alt={theme.name} 
                className="w-full h-full object-cover transition-transform hover:scale-110 duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent mix-blend-overlay"></div>
            </div>
          ) : (
            <div className={`w-full h-full bg-gradient-to-br ${getThemeBackground(theme.id)} flex items-center justify-center`}>
              {getThemeIcon(theme.id, theme.name)}
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
        </div>
        <div className="p-4 relative">
          <Badge className={`mb-2 ${getBadgeColor(theme.id)} text-white font-semibold px-3 py-1 h-[28px]`}>
            {theme.name === "Mythology" ? "🏛️ Mythology" : 
             theme.name === "Space Exploration" ? "🚀 Space" :
             theme.name === "Ancient Kingdoms" ? "👑 Kingdoms" : 
             theme.name === "Modern Civilization" ? "🏙️ Civilization" :
             theme.name === "Folklore & Fairy Tales" ? "🧚 Folklore" :
             theme.name === "Biblical Stories" ? "📜 Biblical" :
             theme.name === "Ocean Adventures" ? "🌊 Ocean" :
             theme.name === "Future Technology" ? "🤖 Technology" : theme.name}
          </Badge>
          <h3 className="font-bold text-xl text-white h-[30px] flex items-center">{theme.name}</h3>
          <p className="text-white/90 text-sm mt-1 line-clamp-3 h-[60px]">{truncateDescription(theme.description)}</p>
        </div>
      </Card>
    </motion.div>
  );
}
