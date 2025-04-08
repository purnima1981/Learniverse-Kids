import { Card } from "@/components/ui/card";
import { BookOpen, Club, FileText } from "lucide-react";

interface LearningToolProps {
  title: string;
  description: string;
  icon: "book" | "cards" | "test";
  onClick: () => void;
}

export default function LearningTool({ title, description, icon, onClick }: LearningToolProps) {
  const renderIcon = () => {
    switch (icon) {
      case "book":
        return <BookOpen className="h-6 w-6 text-black" />;
      case "cards":
        return <Club className="h-6 w-6 text-black" />;
      case "test":
        return <FileText className="h-6 w-6 text-black" />;
    }
  };
  
  return (
    <Card 
      className="glass-panel p-6 hover:bg-white/20 transition duration-300 cursor-pointer"
      onClick={onClick}
    >
      <div className="flex items-center mb-4">
        <div className="w-12 h-12 rounded-full bg-yellow-400 flex items-center justify-center mr-4">
          {renderIcon()}
        </div>
        <h3 className="font-bold text-xl text-white">{title}</h3>
      </div>
      <p className="text-sm text-white">{description}</p>
    </Card>
  );
}
