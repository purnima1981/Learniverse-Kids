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
                    <h4 className="text-lg mb-2 text-[#FF6B9D]">Chapter 1: A Walk to Remember</h4>
                    <div className="flex flex-wrap items-center text-sm mb-3 gap-2">
                      <div className="font-medium text-white mb-1 w-full">Topics:</div>
                      <span className="px-3 py-1 bg-[#8A4FFF]/50 text-white rounded-full text-sm">
                        Shapes (Geometry)
                      </span>
                      <span className="px-3 py-1 bg-[#8A4FFF]/50 text-white rounded-full text-sm">
                        Distance (Measurement)
                      </span>
                      <span className="px-3 py-1 bg-[#8A4FFF]/50 text-white rounded-full text-sm">
                        Energy (Science)
                      </span>
                      <span className="px-3 py-1 bg-[#8A4FFF]/50 text-white rounded-full text-sm">
                        Road Safety
                      </span>
                    </div>
                    
                    <div className="flex flex-wrap items-center text-sm mb-3 gap-2">
                      <div className="font-medium text-white mb-1 w-full">Academic Schedule:</div>
                      <span className="px-3 py-1 bg-[#FF6B9D]/50 text-white rounded-full text-sm">
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
                      className="bg-[#FF6B9D] hover:bg-[#FF4F8B] text-white font-bold"
                    >
                      Continue Reading
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Learning Tools */}
          <div className="mb-8">
            <h2 className="font-bold text-2xl mb-4 text-white">Learning Tools</h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <LearningTool
                title="AI Reading Coach"
                description="Practice reading aloud and get instant feedback to improve your reading fluency and comprehension."
                icon="book"
                onClick={() => setLocation("/reading-coach")}
              />

              <LearningTool
                title="Vocabulary Flashcards"
                description="Review and learn new words with interactive flashcards that build your vocabulary for SAT and beyond."
                icon="cards"
                onClick={() => setLocation("/flashcards")}
              />

              <LearningTool
                title="Practice Challenges"
                description="Test your knowledge with olympiad-style questions that align with your school curriculum."
                icon="test"
                onClick={() => setLocation("/challenges")}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}