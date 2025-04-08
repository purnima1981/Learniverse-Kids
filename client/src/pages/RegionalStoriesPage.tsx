import { useEffect, useState, useMemo } from "react";
import { useLocation, useParams } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { regionalEpicsData } from "@/data/regional-epics";
import { RegionalEpic, Theme } from "@shared/schema";
import { motion } from "framer-motion";
import { themeData } from "@/data/themes";
import { ChevronRight, Globe, BookOpen, MapPin, Filter, X } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getThemeColors, isGradeAppropriate } from "@/lib/theme-utils";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { cn } from "@/lib/utils";

export default function RegionalStoriesPage() {
  const { themeId } = useParams();
  const { user } = useAuth();
  const { toast } = useToast();
  const [_, setLocation] = useLocation();
  const [selectedTheme, setSelectedTheme] = useState<Theme | null>(null);
  const [regionalEpics, setRegionalEpics] = useState<RegionalEpic[]>([]);
  const [showOnlyGradeAppropriate, setShowOnlyGradeAppropriate] = useState<boolean>(true);
  const [selectedGradeFilter, setSelectedGradeFilter] = useState<string | null>(null);
  
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
    // In a production app, this would navigate to the story reader
    toast({
      title: "Story selected!",
      description: "You've selected a story to read",
    });
    // Just as an example for now
    setLocation(`/dashboard`);
  };

  // Get all grade ranges from stories for filtering
  const allGradeRanges = useMemo(() => {
    if (!regionalEpics.length) return [];
    
    const grades = new Set<string>();
    regionalEpics.forEach(epic => {
      epic.stories.forEach(story => {
        grades.add(story.grade);
      });
    });
    
    return Array.from(grades).sort((a, b) => {
      // Sort by the first number in the grade range
      const aNum = parseInt(a.split('-')[0]);
      const bNum = parseInt(b.split('-')[0]);
      return aNum - bNum;
    });
  }, [regionalEpics]);
  
  // Filter stories by grade and return epics that have at least one matching story
  const filteredEpics = useMemo(() => {
    if (!user || !showOnlyGradeAppropriate) return regionalEpics;
    
    return regionalEpics.map(epic => {
      // Create a new epic object with filtered stories
      const filteredStories = epic.stories.filter(story => {
        if (selectedGradeFilter) {
          // If a specific grade filter is selected, use that
          return story.grade === selectedGradeFilter;
        } else {
          // Otherwise filter by user's grade appropriateness
          return isGradeAppropriate(story.grade, user.grade);
        }
      });
      
      return { ...epic, stories: filteredStories };
    }).filter(epic => epic.stories.length > 0); // Only keep epics with at least one story
  }, [regionalEpics, user, showOnlyGradeAppropriate, selectedGradeFilter]);

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
          
          {/* Grade Filters */}
          {user && (
            <div className={cn(
              "mb-8 p-4 rounded-lg backdrop-blur-sm", 
              themeColors.card.background, 
              themeColors.card.border
            )}>
              <div className="flex items-center gap-3 mb-3">
                <Filter size={20} className={cn(themeColors.text.primary)} />
                <h3 className={cn("text-lg font-medium", themeColors.text.primary)}>Personalization Options</h3>
              </div>
              
              <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                <div className="flex items-center gap-2">
                  <input 
                    type="checkbox" 
                    id="grade-filter"
                    checked={showOnlyGradeAppropriate}
                    onChange={() => setShowOnlyGradeAppropriate(!showOnlyGradeAppropriate)}
                    className="rounded text-primary-500 focus:ring-primary-500"
                  />
                  <label htmlFor="grade-filter" className={cn(themeColors.text.primary)}>
                    Show content for my grade ({user.grade})
                  </label>
                </div>
                
                {allGradeRanges.length > 0 && (
                  <div className={cn(
                    "flex flex-wrap gap-2", 
                    !showOnlyGradeAppropriate && "opacity-50 pointer-events-none"
                  )}>
                    <span className={cn("self-center mr-1", themeColors.text.primary)}>Grade Range:</span>
                    <ToggleGroup type="single" value={selectedGradeFilter || ''} onValueChange={(value) => setSelectedGradeFilter(value || null)}>
                      <ToggleGroupItem value="" className={cn(
                        themeColors.text.primary, 
                        `bg-${themeColors.primary}/20`
                      )}>
                        All
                      </ToggleGroupItem>
                      {allGradeRanges.map(grade => (
                        <ToggleGroupItem 
                          key={grade} 
                          value={grade}
                          className={cn(
                            themeColors.text.primary, 
                            `bg-${themeColors.primary}/20`
                          )}
                        >
                          {grade}
                        </ToggleGroupItem>
                      ))}
                    </ToggleGroup>
                  </div>
                )}
              </div>
            </div>
          )}

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
                            const storyColor = `from-${themeColors.primary}/80 to-${themeColors.accent}/80`;
                            
                            return (
                              <Card 
                                key={story.id}
                                className={cn(
                                  "bg-gradient-to-br overflow-hidden cursor-pointer hover:shadow-xl transition-all",
                                  storyColor,
                                  themeColors.card.border
                                )}
                                onClick={() => handleStorySelect(story.id)}
                              >
                                <div className="p-4">
                                  <div className="flex justify-between items-start mb-2">
                                    <h3 className={cn("font-semibold text-lg", themeColors.text.primary)}>{story.title}</h3>
                                    <Badge className={cn(
                                      themeColors.text.primary, 
                                      `bg-${themeColors.accent}/30`
                                    )}>{story.grade}</Badge>
                                  </div>
                                  <div className={cn("flex items-center text-sm mt-3", `${themeColors.text.primary}/80`)}>
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
                          No stories found for your grade. Try adjusting the filter settings.
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
                <div className={cn("text-xl mb-2", themeColors.text.primary)}>No stories match your grade level</div>
                <p className={cn(`${themeColors.text.primary}/80`)}>Try turning off grade filtering to see all available stories</p>
                <Button 
                  className={cn(
                    "mt-4 bg-gradient-to-r",
                    themeColors.button.from,
                    themeColors.button.to
                  )}
                  onClick={() => setShowOnlyGradeAppropriate(false)}
                >
                  <X size={16} className="mr-2" />
                  Remove Grade Filter
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}