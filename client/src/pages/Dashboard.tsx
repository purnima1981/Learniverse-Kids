import { useQuery } from "@tanstack/react-query";
import Navigation from "@/components/Navigation";
import ProgressBar from "@/components/ProgressBar";
import { Button } from "@/components/ui/button";
import StoryCard from "@/components/StoryCard";
import LearningTool from "@/components/LearningTool";
import { ChevronLeft, ChevronRight, PlusCircle } from "lucide-react";
import { useLocation } from "wouter";
import { Story, UserProgress } from "@shared/schema";
import { SubjectTag } from "@/components/SubjectTag";

export default function Dashboard() {
  // Simplified approach without auth for now
  const user = { 
    firstName: "Student",
    grade: "5",
    themeName: "Space Exploration"
  };
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
      setLocation(`/story/${currentStory.id}/${currentStory.currentChapter}`);
    }
  };

  if (isProgressLoading || isCurrentStoryLoading || isRecommendedLoading) {
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
                Welcome back, {user?.firstName}!
              </h1>
              <p className="text-lg mt-1 text-white">
                Grade {user?.grade} • {user?.themeName} Theme
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

          {/* Progress Overview */}
          {progress && (
            <div className="glass-panel p-6 mb-8">
              <h2 className="font-bold text-2xl mb-4 text-white">Your Learning Journey</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white/10 rounded-lg p-4">
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-semibold text-white">Story Progress</span>
                    <span className="text-yellow-400 font-bold">{progress.storyProgressPercent}%</span>
                  </div>
                  <ProgressBar progress={progress.storyProgressPercent} />
                  <p className="text-sm mt-2 text-white">
                    {progress.completedChapters} of {progress.totalChapters} chapters completed
                  </p>
                </div>
                <div className="bg-white/10 rounded-lg p-4">
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-semibold text-white">Weekly Goal</span>
                    <span className="text-yellow-400 font-bold">
                      {progress.daysActive}/5
                    </span>
                  </div>
                  <ProgressBar progress={(progress.daysActive / 5) * 100} />
                  <p className="text-sm mt-2 text-white">
                    {progress.daysActive} of 5 days completed
                  </p>
                </div>
                <div className="bg-white/10 rounded-lg p-4">
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-semibold text-white">Vocabulary Words</span>
                    <span className="text-yellow-400 font-bold">{progress.vocabularyLearned}</span>
                  </div>
                  <ProgressBar progress={(progress.vocabularyLearned / progress.vocabularyGoal) * 100} />
                  <p className="text-sm mt-2 text-white">
                    {progress.vocabularyLearned} new words learned
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Current Story */}
          {currentStory && (
            <div className="mb-8">
              <div className="flex justify-between items-center mb-4">
                <h2 className="font-bold text-2xl text-white">Continue Your Adventure</h2>
                <a href="#" className="text-yellow-400 hover:underline font-semibold">
                  View All Stories
                </a>
              </div>

              <div className="glass-panel p-6">
                <div className="flex flex-col md:flex-row gap-6">
                  <img
                    src={currentStory.imageUrl}
                    alt={currentStory.title}
                    className="w-full md:w-1/3 rounded-lg object-cover"
                    style={{ maxHeight: "240px" }}
                  />

                  <div className="flex-1">
                    <h3 className="font-bold text-2xl mb-2 text-white">{currentStory.title}</h3>
                    <div className="flex flex-wrap items-center text-sm mb-3 gap-2">
                      {currentStory.subjects.map((subject) => (
                        <SubjectTag key={subject.id} subject={subject} />
                      ))}
                    </div>
                    <p className="mb-4 text-white">{currentStory.description}</p>

                    <div className="mb-4">
                      <div className="flex justify-between text-sm mb-1 text-white">
                        <span>Chapter {currentStory.currentChapter}: {currentStory.currentChapterTitle}</span>
                        <span>{currentStory.progressPercent}% Complete</span>
                      </div>
                      <ProgressBar progress={currentStory.progressPercent} />
                    </div>

                    <Button
                      onClick={handleContinueReading}
                      className="bg-yellow-400 hover:bg-yellow-500 text-black font-bold"
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

          {/* Recommended Stories */}
          {recommendedStories && recommendedStories.length > 0 && (
            <div>
              <div className="flex justify-between items-center mb-4">
                <h2 className="font-bold text-2xl text-white">Recommended for You</h2>
                <div className="flex space-x-2">
                  <button className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-white hover:bg-white/30">
                    <ChevronLeft className="h-5 w-5" />
                  </button>
                  <button className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-white hover:bg-white/30">
                    <ChevronRight className="h-5 w-5" />
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {recommendedStories.map((story) => (
                  <StoryCard key={story.id} story={story} />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
