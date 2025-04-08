import { Theme } from "@shared/schema";
import { Card } from "@/components/ui/card";

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
    <Card 
      className="theme-card bg-orange-400 rounded-xl overflow-hidden cursor-pointer shadow-lg"
      onClick={handleClick}
    >
      <div className="w-full h-40 bg-orange-500 relative">
        {theme.imageUrl && (
          <img 
            src={theme.imageUrl} 
            alt={theme.name} 
            className="w-full h-full object-cover"
          />
        )}
      </div>
      <div className="p-4">
        <h3 className="font-bold text-xl text-white">{theme.name.toUpperCase()}</h3>
        <p className="text-white/80 text-sm mt-1">{theme.description}</p>
      </div>
    </Card>
  );
}
