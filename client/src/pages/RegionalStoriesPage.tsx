import { useEffect, useState } from "react";
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

export default function RegionalStoriesPage() {
  const { themeId } = useParams();
  const { user } = useAuth();
  const { toast } = useToast();
  const [_, setLocation] = useLocation();
  const [selectedTheme, setSelectedTheme] = useState<Theme | null>(null);
  const [regionalEpics, setRegionalEpics] = useState<RegionalEpic[]>([]);

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

  if (!selectedTheme || regionalEpics.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-950 to-blue-900 flex justify-center items-center">
        <div className="text-white text-xl">Loading regional stories...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-cyan-500 to-blue-500 pt-10 pb-20">
      <div className="container mx-auto px-4">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center gap-2 text-white/80 mb-4">
            <button onClick={() => setLocation('/theme-selection')} className="hover:text-white transition-colors">
              Themes
            </button>
            <ChevronRight size={16} />
            <span className="text-white font-semibold">{selectedTheme.name}</span>
          </div>

          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h1 className="font-bold text-4xl md:text-5xl mb-4 text-white">
              {selectedTheme.name}: Regional Stories
            </h1>
            <p className="text-lg mb-8 text-white max-w-3xl">
              Explore stories and learning journeys from different parts of the world, all connected 
              through the theme of {selectedTheme.name.toLowerCase()}.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 gap-8 mt-12">
            {regionalEpics.map((epic, epicIndex) => (
              <motion.div 
                key={epic.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: epicIndex * 0.1 }}
                className="mb-12"
              >
                <div className="flex flex-col md:flex-row gap-6 bg-white/10 rounded-xl p-6 backdrop-blur-sm border border-white/20 shadow-lg">
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
                          <Globe className="w-12 h-12 text-white/50" />
                        </div>
                      )}
                    </div>
                    
                    <div>
                      <div className="flex items-center gap-2 mb-2 text-white">
                        <MapPin size={16} />
                        <span>{epic.region}</span>
                      </div>
                      <Button 
                        className="w-full bg-gradient-to-r from-amber-400 to-orange-500 hover:from-amber-500 hover:to-orange-600 text-black font-semibold border-0" 
                        onClick={() => handleEpicSelect(epic.id)}
                      >
                        Browse All Stories
                      </Button>
                    </div>
                  </div>
                  
                  <div className="flex-grow">
                    <h2 className="text-2xl font-bold text-white mb-2">{epic.name}</h2>
                    <p className="text-white/90 mb-4">{epic.description}</p>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                      {epic.stories.map((story, storyIndex) => {
                        // Generate a consistent color for each story based on its ID
                        const colorClass = (() => {
                          switch (story.id % 5) {
                            case 0: return "from-purple-500/80 to-indigo-600/80"; // Space
                            case 1: return "from-amber-500/80 to-orange-600/80"; // Ancient
                            case 2: return "from-emerald-500/80 to-teal-600/80"; // Nature
                            case 3: return "from-pink-500/80 to-rose-600/80"; // Folk
                            case 4: return "from-sky-500/80 to-blue-600/80"; // Ocean
                            default: return "from-gray-500/80 to-slate-600/80";
                          }
                        })();
                        
                        return (
                          <Card 
                            key={story.id}
                            className={`bg-gradient-to-br ${colorClass} border-white/20 overflow-hidden cursor-pointer hover:shadow-xl transition-all`}
                            onClick={() => handleStorySelect(story.id)}
                          >
                            <div className="p-4">
                              <div className="flex justify-between items-start mb-2">
                                <h3 className="font-semibold text-white text-lg">{story.title}</h3>
                                <Badge className="bg-white/30 text-white">{story.grade}</Badge>
                              </div>
                              <div className="flex items-center text-white/80 text-sm mt-3">
                                <BookOpen size={14} className="mr-2" />
                                <span>Interactive story with exercises</span>
                              </div>
                            </div>
                          </Card>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}