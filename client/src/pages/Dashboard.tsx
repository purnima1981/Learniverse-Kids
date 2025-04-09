import { useQuery } from "@tanstack/react-query";
import Navigation from "@/components/Navigation";
import ProgressBar from "@/components/ProgressBar";
import { Button } from "@/components/ui/button";
import StoryCard from "@/components/StoryCard";
import LearningTool from "@/components/LearningTool";
import { ChevronLeft, ChevronRight, PlusCircle } from "lucide-react";
import { useLocation } from "wouter";
import { Story, UserProgress, User } from "@shared/schema";
import { SubjectTag } from "@/components/SubjectTag";

export default function Dashboard() {
  // Get user data from API
  const { data: userData, isLoading: isUserLoading } = useQuery<User>({
    queryKey: ['/api/user'],
  });
  
  // Data for display
  const userName = userData?.firstName || "Student";
  const userGrade = userData?.grade || "5";
  const themeName = "Family Adventures";
  const [_, setLocation] = useLocation();

  const { data: progress, isLoading: isProgressLoading } = useQuery<UserProgress>({
    queryKey: ['/api/user/progress'],
  });

  const { data: currentStory, isLoading: isCurrentStoryLoading } = useQuery<Story>({
    queryKey: ['/api/user/current-story'],
  });

  const { data: recommendedStories, isLoading: isRecommendedLoading } = useQuery<Story[]>({
    queryKey: ['/api/stories/recommended'],
  });

  const handleContinueReading = () => {
    if (currentStory) {
      // Start at chapter 1 when continuing the story
      setLocation(`/story/${currentStory.id}/1`);
    }
  };

  if (isUserLoading || isProgressLoading || isCurrentStoryLoading || isRecommendedLoading) {
    return (
      <div className="min-h-screen">
        <Navigation />
        <div className="container mx-auto px-4 py-10 flex justify-center items-center">
          <div className="text-white text-xl">Loading dashboard...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <Navigation />
      
      <div className="container mx-auto px-4 py-6">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
            <div>
              <h1 className="font-bold text-3xl md:text-4xl text-white">
                Welcome back, {userName}!
              </h1>
              <p className="text-lg mt-1 text-white">
                Grade {userGrade} • {themeName} Theme
              </p>
            </div>
            <div className="mt-4 md:mt-0">
              <Button
                onClick={() => setLocation("/theme-selection")}
                className="bg-yellow-400 hover:bg-yellow-500 text-black font-bold"
              >
                <PlusCircle className="h-5 w-5 mr-2" />
                Switch Theme
              </Button>
            </div>
          </div>

          {/* Learning Tools */}
          <div className="mb-8">
            <div className="flex justify-between items-center mb-4">
              <h2 className="font-bold text-2xl text-white">Learning Tools</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* AI Reading Coach */}
              <div 
                className="glass-panel p-6 cursor-pointer hover:bg-white/10 transition-colors duration-300"
                onClick={() => setLocation('/reading-coach')}
              >
                <div className="flex items-start">
                  <div className="flex-shrink-0 mr-4 bg-[#45AEF5]/20 p-3 rounded-full">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-[#45AEF5]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2z"></path>
                      <path d="M12 16c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z"></path>
                      <path d="M12 8v4m0 4v-1"></path>
                      <path d="M5 3a2 2 0 0 0-2 2"></path>
                      <path d="M9 3h1"></path>
                      <path d="M14 3h1"></path>
                      <path d="M19 3a2 2 0 0 1 2 2"></path>
                      <path d="M21 9v1"></path>
                      <path d="M21 14v1"></path>
                      <path d="M19 21a2 2 0 0 1-2-2"></path>
                      <path d="M14 21h1"></path>
                      <path d="M9 21h1"></path>
                      <path d="M5 21a2 2 0 0 1-2-2"></path>
                      <path d="M3 14v1"></path>
                      <path d="M3 9v1"></path>
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-bold text-xl text-white mb-2">AI Reading Coach</h3>
                    <p className="text-white text-sm mb-3">
                      Practice reading aloud with our AI-powered coach to improve your fluency,
                      pronunciation, and comprehension skills.
                    </p>
                    <Button
                      className="bg-[#45AEF5] hover:bg-[#3B82F6] text-white"
                      onClick={(e) => {
                        e.stopPropagation();
                        setLocation('/reading-coach');
                      }}
                    >
                      Start Practice
                    </Button>
                  </div>
                </div>
              </div>
              
              {/* Interactive Challenges */}
              <div className="glass-panel p-6 cursor-pointer hover:bg-white/10 transition-colors duration-300">
                <div className="flex items-start">
                  <div className="flex-shrink-0 mr-4 bg-[#10B981]/20 p-3 rounded-full">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-[#10B981]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z"></path>
                      <path d="m9 12 2 2 4-4"></path>
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-bold text-xl text-white mb-2">Interactive Challenges</h3>
                    <p className="text-white text-sm mb-3">
                      Fun educational games aligned with your curriculum that reinforce
                      key concepts through play-based learning.
                    </p>
                    <div className="px-3 py-1 bg-white/10 inline-block rounded-full text-white text-xs">
                      Coming Soon
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Current Story */}
          {currentStory && (
            <div className="mb-8">
              <div className="flex justify-between items-center mb-4">
                <h2 className="font-bold text-2xl text-white">Continue Family Adventures</h2>
                <a href="#" className="text-yellow-400 hover:underline font-semibold">
                  View All Stories
                </a>
              </div>

              <div className="glass-panel p-6">
                <div className="flex flex-col md:flex-row gap-6">
                  <img
                    src={currentStory.imageUrl || '/epics/family-adventures.svg'}
                    alt={currentStory.title}
                    className="w-full md:w-1/3 rounded-lg object-cover"
                    style={{ maxHeight: "240px" }}
                  />

                  <div className="flex-1">
                    <h3 className="font-bold text-2xl mb-2 text-white">Family Adventures</h3>
                    <h4 className="text-lg mb-2 text-[#10B981]">Chapter 1: A Walk to Remember</h4>
                    <div className="flex flex-wrap items-center text-sm mb-3 gap-2">
                      <div className="font-medium text-white mb-1 w-full">Topics:</div>
                      <span className="px-3 py-1 bg-[#2563EB]/50 text-white rounded-full text-sm">
                        Shapes (Geometry)
                      </span>
                      <span className="px-3 py-1 bg-[#2563EB]/50 text-white rounded-full text-sm">
                        Distance (Measurement)
                      </span>
                      <span className="px-3 py-1 bg-[#2563EB]/50 text-white rounded-full text-sm">
                        Energy (Science)
                      </span>
                      <span className="px-3 py-1 bg-[#2563EB]/50 text-white rounded-full text-sm">
                        Road Safety
                      </span>
                    </div>
                    
                    <div className="flex flex-wrap items-center text-sm mb-3 gap-2">
                      <div className="font-medium text-white mb-1 w-full">Academic Schedule:</div>
                      <span className="px-3 py-1 bg-[#10B981]/50 text-white rounded-full text-sm">
                        Week 3: Geometric Shapes & Physical Science
                      </span>
                    </div>
                    <p className="mb-4 text-white">{currentStory.description}</p>

                    <div className="mb-4">
                      <div className="flex justify-between text-sm mb-1 text-white">
                        <span>Story Progress</span>
                        <span>{currentStory.progressPercent}% Complete</span>
                      </div>
                      <ProgressBar progress={currentStory.progressPercent} />
                    </div>

                    <Button
                      onClick={handleContinueReading}
                      className="bg-[#10B981] hover:bg-[#0D9488] text-white font-bold"
                    >
                      Continue Reading
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}


        </div>
      </div>
    </div>
  );
}