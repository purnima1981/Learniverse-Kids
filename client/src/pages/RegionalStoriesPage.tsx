import { useEffect, useState, useMemo } from "react";
import { useLocation, useParams } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { regionalEpicsData } from "@/data/regional-epics";
import { RegionalEpic, Theme } from "@shared/schema";
import { motion } from "framer-motion";
import { themeData } from "@/data/themes";
import { ChevronRight, Globe, BookOpen, MapPin } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getThemeColors, isGradeAppropriate } from "@/lib/theme-utils";
import { cn } from "@/lib/utils";

export default function RegionalStoriesPage() {
  const { themeId } = useParams();
  const { user } = useAuth();
  const { toast } = useToast();
  const [_, setLocation] = useLocation();
  const [selectedTheme, setSelectedTheme] = useState<Theme | null>(null);
  const [regionalEpics, setRegionalEpics] = useState<RegionalEpic[]>([]);
  
  // Get theme colors for dynamic styling
  const themeColors = useMemo(() => {
    if (!themeId) return getThemeColors(1); // Default to first theme if none selected
    return getThemeColors(parseInt(themeId));
  }, [themeId]);

  useEffect(() => {
    if (!themeId) {
      toast({
        title: "Theme not found",
        description: "Please go back and select a theme",
        variant: "destructive",
      });
      setLocation("/theme-selection");
      return;
    }

    const theme = themeData.find(t => t.id === parseInt(themeId));
    if (!theme) {
      toast({
        title: "Theme not found",
        description: "Please go back and select a theme",
        variant: "destructive",
      });
      setLocation("/theme-selection");
      return;
    }

    setSelectedTheme(theme);
    
    // Get regional epics for this theme
    const epics = regionalEpicsData[parseInt(themeId)] || [];
    setRegionalEpics(epics);
  }, [themeId, toast, setLocation]);

  const handleEpicSelect = (epicId: number) => {
    // In a production app, this would navigate to the list of stories for this epic
    toast({
      title: "Epic selected!",
      description: "You've selected an epic collection of stories",
    });
    // Just as an example for now
    setLocation(`/dashboard`);
  };

  const handleStorySelect = (storyId: number) => {
    // Navigate to the story reader, starting with chapter 1
    setLocation(`/story/${storyId}/1`);
    toast({
      title: "Loading story...",
      description: "Preparing your reading experience",
    });
  };

  // Just show all epics and stories without filtering
  const filteredEpics = regionalEpics;

  if (!selectedTheme || regionalEpics.length === 0) {
    return (
      <div className={cn(
        "min-h-screen bg-gradient-to-b flex justify-center items-center",
        `from-${themeColors.background.from}`, 
        `to-${themeColors.background.to}`
      )}>
        <div className={cn("text-xl", themeColors.text.primary)}>Loading regional stories...</div>
      </div>
    );
  }

  return (
    <div className={cn(
      "min-h-screen bg-gradient-to-b pt-10 pb-20",
      `from-${themeColors.background.from}`,
      `to-${themeColors.background.to}`
    )}>
      <div className="container mx-auto px-4">
        <div className="max-w-6xl mx-auto">
          <div className={cn("flex items-center gap-2 mb-4", `${themeColors.text.primary}/80`)}>
            <button 
              onClick={() => setLocation('/theme-selection')} 
              className={cn("transition-colors", `hover:${themeColors.text.primary}`)}
            >
              Themes
            </button>
            <ChevronRight size={16} />
            <span className={cn("font-semibold", themeColors.text.primary)}>{selectedTheme.name}</span>
          </div>

          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h1 className={cn("font-bold text-4xl md:text-5xl mb-4", themeColors.text.primary)}>
              {selectedTheme.name}: Regional Stories
            </h1>
            <p className={cn("text-lg mb-8 max-w-3xl", themeColors.text.primary)}>
              Explore stories and learning journeys from different parts of the world, all connected 
              through the theme of {selectedTheme.name.toLowerCase()}.
            </p>
          </motion.div>
          
          {/* Personalization Options removed */}

          <div className="grid grid-cols-1 gap-8 mt-6">
            {filteredEpics.length > 0 ? (
              filteredEpics.map((epic, epicIndex) => (
                <motion.div 
                  key={epic.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: epicIndex * 0.1 }}
                  className="mb-12"
                >
                  <div className={cn(
                    "flex flex-col md:flex-row gap-6 rounded-xl p-6 backdrop-blur-sm shadow-lg",
                    themeColors.card.background,
                    themeColors.card.border
                  )}>
                    <div className="w-full md:w-1/4 flex-shrink-0">
                      <div className="rounded-lg overflow-hidden mb-4 aspect-[4/3] bg-white/10">
                        {epic.imageUrl ? (
                          <img 
                            src={epic.imageUrl} 
                            alt={epic.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Globe className={cn("w-12 h-12", `${themeColors.text.primary}/50`)} />
                          </div>
                        )}
                      </div>
                      
                      <div>
                        <div className={cn("flex items-center gap-2 mb-2", themeColors.text.primary)}>
                          <MapPin size={16} />
                          <span>{epic.region}</span>
                        </div>
                        <Button 
                          className={cn(
                            "w-full bg-gradient-to-r font-semibold border-0",
                            themeColors.button.from,
                            themeColors.button.to,
                            `hover:${themeColors.button.hover.from}`,
                            `hover:${themeColors.button.hover.to}`,
                            themeColors.button.text
                          )} 
                          onClick={() => handleEpicSelect(epic.id)}
                        >
                          Browse All Stories
                        </Button>
                      </div>
                    </div>
                    
                    <div className="flex-grow">
                      <h2 className={cn("text-2xl font-bold mb-2", themeColors.text.primary)}>{epic.name}</h2>
                      <p className={cn("mb-4", `${themeColors.text.primary}/90`)}>{epic.description}</p>
                      
                      {epic.stories.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                          {epic.stories.map((story, storyIndex) => {
                            // Use theme-specific color classes for story cards
                            const storyColor = `from-${themeColors.primary}/90 to-${themeColors.accent}/80`;
                            
                            return (
                              <Card 
                                key={story.id}
                                className={cn(
                                  "bg-gradient-to-br overflow-hidden cursor-pointer hover:shadow-xl transition-all shadow-md border-0",
                                  story.imageUrl ? "" : storyColor,
                                  themeColors.card.border
                                )}
                                onClick={() => handleStorySelect(story.id)}
                              >
                                <div className={cn("p-4", story.imageUrl ? "bg-white/80 rounded-lg" : "")}>
                                  {story.imageUrl && (
                                    <div className="mb-3 rounded-lg overflow-hidden h-48 w-full shadow-md">
                                      <img 
                                        src={story.imageUrl} 
                                        alt={story.title} 
                                        className="object-cover w-full h-full hover:scale-105 transition-transform duration-300"
                                      />
                                    </div>
                                  )}
                                  <div className="mb-2">
                                    <h3 className={cn("font-semibold text-lg", 
                                      story.imageUrl ? "text-cyan-900" : themeColors.text.primary
                                    )}>{story.title}</h3>
                                  </div>
                                  <div className={cn("flex items-center text-sm mt-3", 
                                    story.imageUrl ? "text-cyan-700" : `${themeColors.text.primary}/80`
                                  )}>
                                    <BookOpen size={14} className="mr-2" />
                                    <span>Interactive story with exercises</span>
                                  </div>
                                </div>
                              </Card>
                            );
                          })}
                        </div>
                      ) : (
                        <p className={cn("text-center p-4 italic", `${themeColors.text.primary}/70`)}>
                          No stories available for this theme.
                        </p>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))
            ) : (
              <div className={cn(
                "text-center p-8 rounded-xl backdrop-blur-sm",
                themeColors.card.background,
                themeColors.card.border
              )}>
                <div className={cn("text-xl mb-2", themeColors.text.primary)}>No stories available</div>
                <p className={cn(`${themeColors.text.primary}/80`)}>There are no stories for this theme yet.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}