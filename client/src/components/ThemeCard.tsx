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
  
  return (
    <motion.div
      whileHover={{ scale: 1.03 }}
      transition={{ duration: 0.2 }}
    >
      <Card 
        className="theme-card rounded-xl overflow-hidden cursor-pointer shadow-lg bg-gradient-to-b from-blue-900/60 to-blue-800/80 border-blue-500/30"
        onClick={handleClick}
      >
        <div className="w-full h-48 relative overflow-hidden">
          {theme.imageUrl ? (
            <img 
              src={theme.imageUrl} 
              alt={theme.name} 
              className="w-full h-full object-cover transition-transform hover:scale-110 duration-700"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-blue-700 to-indigo-900 flex items-center justify-center">
              <span className="text-3xl text-white/60">{ theme.name.charAt(0) }</span>
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-blue-900/80 to-transparent"></div>
        </div>
        <div className="p-4 relative">
          <Badge className="mb-2 bg-blue-600/80 hover:bg-blue-500 text-white">
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
          <p className="text-white/80 text-sm mt-1">{theme.description}</p>
        </div>
      </Card>
    </motion.div>
  );
}
