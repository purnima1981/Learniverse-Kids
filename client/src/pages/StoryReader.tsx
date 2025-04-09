import { useParams, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, BookmarkIcon, InfoIcon } from "lucide-react";
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import * as StoryService from "@/lib/story-service";

export default function StoryReader() {
  const { id: storyId, chapter: chapterNumberParam } = useParams();
  const [_, setLocation] = useLocation();
  const { toast } = useToast();
  const [userAnswer, setUserAnswer] = useState("");
  const [story, setStory] = useState<StoryService.Story | null>(null);
  const [currentChapter, setCurrentChapter] = useState<StoryService.Chapter | null>(null);
  const [loading, setLoading] = useState(true);
  
  // Convert storyId and chapterNumber to numbers
  const storyIdNumber = storyId ? parseInt(storyId) : 8001; // Default to our story ID
  const chapterNumber = chapterNumberParam ? parseInt(chapterNumberParam) : 1; // Default to chapter 1
  
  // Load story and chapter data
  useEffect(() => {
    const loadStory = async () => {
      try {
        setLoading(true);
        const storyData = await StoryService.fetchStory(storyIdNumber);
        setStory(storyData);
        
        // Find the requested chapter
        const chapter = StoryService.getChapter(storyData, chapterNumber);
        if (chapter) {
          setCurrentChapter(chapter);
        }
        
        setLoading(false);
      } catch (error) {
        console.error("Error loading story:", error);
        toast({
          title: "Error loading story",
          description: "Unable to load the story content.",
          variant: "destructive"
        });
        setLoading(false);
      }
    };
    
    loadStory();
  }, [storyId, chapterNumberParam, toast]);
  
  const handleGoBack = () => {
    setLocation("/regional-stories/8"); // Return to Family Adventures page
  };
  
  const handlePreviousChapter = () => {
    if (story) {
      const prevChapterNum = StoryService.getPrevChapterNumber(story, chapterNumber);
      if (prevChapterNum) {
        setLocation(`/story/${storyId}/${prevChapterNum}`);
      }
    }
  };
  
  const handleNextChapter = () => {
    if (story) {
      const nextChapterNum = StoryService.getNextChapterNumber(story, chapterNumber);
      if (nextChapterNum) {
        setLocation(`/story/${storyId}/${nextChapterNum}`);
      }
    }
  };
  
  const handleBookmark = () => {
    toast({
      title: "Story bookmarked",
      description: "You can find this story in your bookmarks",
    });
  };
  
  const handleVocabulary = () => {
    toast({
      title: "Vocabulary",
      description: "Vocabulary feature coming soon!",
    });
  };
  
  // Show loading state
  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-10">
        <div className="glass-panel p-8 flex justify-center items-center h-[50vh]">
          <div className="text-white text-xl">Loading story...</div>
        </div>
      </div>
    );
  }
  
  // Show error state if story or chapter not found
  if (!story || !currentChapter) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-10">
        <div className="glass-panel p-8">
          <h1 className="text-2xl font-bold text-white mb-4">Story not found</h1>
          <Button onClick={handleGoBack}>Back to Family Adventures</Button>
        </div>
      </div>
    );
  }
  
  // Calculate progress
  const progress = StoryService.calculateProgress(story, chapterNumber);
  
  // Get the previous and next chapter numbers
  const prevChapter = StoryService.getPrevChapterNumber(story, chapterNumber);
  const nextChapter = StoryService.getNextChapterNumber(story, chapterNumber);
  
  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      <div className="flex justify-between items-center mb-6">
        <Button 
          variant="ghost" 
          className="text-white hover:text-white/80"
          onClick={handleGoBack}
        >
          <ChevronLeft className="h-5 w-5 mr-2" />
          Back to Family Adventures
        </Button>
        <div className="flex space-x-4">
          <Button 
            variant="ghost" 
            className="text-white hover:text-white/80"
            onClick={handleBookmark}
          >
            <BookmarkIcon className="h-5 w-5 mr-1" />
            Bookmark
          </Button>
          {currentChapter.vocabularyWords && currentChapter.vocabularyWords.length > 0 && (
            <Button 
              variant="ghost"
              className="text-white hover:text-white/80"
              onClick={handleVocabulary}
            >
              <InfoIcon className="h-5 w-5 mr-1" />
              Vocabulary
            </Button>
          )}
        </div>
      </div>
      
      <div className="glass-panel p-8">
        <div className="mb-6">
          <h1 className="font-bold text-3xl mb-2 text-white">{story.title}</h1>
          <h2 className="text-xl mb-4 text-white">Chapter {chapterNumber}: {currentChapter.title}</h2>
          <div className="flex flex-wrap items-center text-sm mb-6 gap-2">
            {story.subjects.map((subject, index) => (
              <span key={index} className="px-3 py-1 bg-cyan-700/50 text-white rounded-full text-sm">
                {subject}
              </span>
            ))}
          </div>
          
          {/* Progress bar */}
          <div className="w-full bg-gray-200/20 rounded-full h-2.5 mb-6">
            <div 
              className="bg-cyan-600 h-2.5 rounded-full" 
              style={{ width: `${progress}%` }}
            ></div>
          </div>
        </div>
        
        <div className="prose prose-lg prose-invert max-w-none">
          {/* Render the chapter content as paragraphs */}
          {currentChapter.content.split('\n\n').map((paragraph, idx) => (
            <p key={idx}>{paragraph}</p>
          ))}
          
          {/* Vocabulary section */}
          {currentChapter.vocabularyWords && currentChapter.vocabularyWords.length > 0 && (
            <div className="bg-cyan-800/30 p-4 rounded-lg my-6">
              <h3 className="font-bold text-xl mb-4 text-white">Vocabulary Words</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {currentChapter.vocabularyWords.map((word, idx) => (
                  <div key={idx} className="bg-white/10 p-3 rounded-lg">
                    <h4 className="font-bold text-cyan-300">{word.word}</h4>
                    <p className="text-white">{word.definition}</p>
                    <p className="text-sm text-white/70 mt-1">"{word.context}"</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
        
        <div className="flex justify-between mt-8">
          <Button
            variant="outline"
            className="bg-white/20 hover:bg-white/30 text-white border-transparent"
            onClick={handlePreviousChapter}
            disabled={!prevChapter}
          >
            <ChevronLeft className="h-5 w-5 mr-1" />
            Previous Chapter
          </Button>
          <Button
            className="bg-yellow-400 hover:bg-yellow-500 text-black font-bold"
            onClick={handleNextChapter}
            disabled={!nextChapter}
          >
            Next Chapter
            <ChevronRight className="h-5 w-5 ml-1" />
          </Button>
        </div>
      </div>
    </div>
  );
}