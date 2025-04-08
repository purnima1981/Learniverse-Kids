import { Card } from "@/components/ui/card";
import { useLocation } from "wouter";
import { Story } from "@shared/schema";
import { SubjectTag } from "./SubjectTag";

interface StoryCardProps {
  story: Story;
}

export default function StoryCard({ story }: StoryCardProps) {
  const [_, setLocation] = useLocation();
  
  const handleClick = () => {
    setLocation(`/story/${story.id}/${story.currentChapter || 1}`);
  };
  
  return (
    <Card 
      className="glass-panel overflow-hidden cursor-pointer hover:bg-white/20 transition duration-300"
      onClick={handleClick}
    >
      <div className="w-full h-40 bg-primary-dark/50 relative">
        {story.imageUrl && (
          <img 
            src={story.imageUrl} 
            alt={story.title} 
            className="w-full h-full object-cover"
          />
        )}
      </div>
      <div className="p-4">
        <h3 className="font-bold text-xl mb-2 text-white">{story.title}</h3>
        <div className="flex flex-wrap items-center text-xs mb-3 gap-1">
          {story.subjects.slice(0, 2).map((subject) => (
            <SubjectTag key={subject.id} subject={subject} small />
          ))}
          {story.subjects.length > 2 && (
            <span className="bg-white/30 text-white px-2 py-0.5 rounded-full text-xs">
              +{story.subjects.length - 2} more
            </span>
          )}
        </div>
        <p className="text-sm text-white">{story.description}</p>
      </div>
    </Card>
  );
}
