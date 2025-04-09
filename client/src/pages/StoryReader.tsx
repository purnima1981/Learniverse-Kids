import { useParams, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, BookmarkIcon, InfoIcon, X } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { useToast } from "@/hooks/use-toast";
import * as StoryService from "@/lib/story-service";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog";
import { Card, CardContent } from "@/components/ui/card";
import ChapterQuestions from "@/components/ChapterQuestions";
import chapterQuestions, { ChapterQuestionsMap } from "@/data/chapterQuestions";

// Reading Timer Component
function ReadingTimer({ startTime }: { startTime: number }) {
  const [timeElapsed, setTimeElapsed] = useState("0:00");
  
  useEffect(() => {
    // Update the timer every second
    const interval = setInterval(() => {
      if (startTime) {
        const seconds = Math.floor((Date.now() - startTime) / 1000);
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        setTimeElapsed(`${minutes}:${remainingSeconds.toString().padStart(2, '0')}`);
      }
    }, 1000);
    
    return () => clearInterval(interval);
  }, [startTime]);
  
  return <span>{timeElapsed}</span>;
}

export default function StoryReader() {
  const { id: storyId, chapter: chapterNumberParam } = useParams();
  const [_, setLocation] = useLocation();
  const { toast } = useToast();
  const [userAnswer, setUserAnswer] = useState("");
  const [story, setStory] = useState<StoryService.Story | null>(null);
  const [currentChapter, setCurrentChapter] = useState<StoryService.Chapter | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedWord, setSelectedWord] = useState<StoryService.VocabularyWord | null>(null);
  const [showFlashcard, setShowFlashcard] = useState(false);
  const [showQuestions, setShowQuestions] = useState(false);
  const [hasReadStory, setHasReadStory] = useState(false);
  const [readingStartTime, setReadingStartTime] = useState<number | null>(null);
  const [readingTime, setReadingTime] = useState<number>(0);
  const contentRef = useRef<HTMLDivElement>(null);
  
  // Convert storyId and chapterNumber to numbers
  const storyIdNumber = storyId ? parseInt(storyId) : 8001; // Default to our story ID
  const chapterNumber = chapterNumberParam ? parseInt(chapterNumberParam) : 1; // Default to chapter 1
  
  // Load story and chapter data
  useEffect(() => {
    const loadStory = async () => {
      try {
        setLoading(true);
        setReadingStartTime(null);
        setReadingTime(0);
        
        console.log(`Loading story ID: ${storyIdNumber}, chapter: ${chapterNumber}`);
        const storyData = await StoryService.fetchStory(storyIdNumber);
        console.log("Story data loaded:", storyData);
        setStory(storyData);
        
        // Find the requested chapter
        const chapter = StoryService.getChapter(storyData, chapterNumber);
        console.log("Chapter data:", chapter);
        if (chapter) {
          console.log("Chapter content length:", chapter.content ? chapter.content.length : 0);
          setCurrentChapter(chapter);
        } else {
          console.error("Chapter not found in story");
        }
        
        setLoading(false);
        // Start the reading timer when content loads
        setReadingStartTime(Date.now());
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
  }, [storyId, chapterNumberParam, toast, storyIdNumber, chapterNumber]);
  
  const handleGoBack = () => {
    setLocation("/"); // Return to Dashboard
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
    // Check if we should show questions before going to the next chapter
    const questions = chapterQuestions[`${storyIdNumber}-${chapterNumber}`];
    if (questions && questions.length > 0) {
      setShowQuestions(true);
    } else {
      navigateToNextChapter();
    }
  };
  
  const navigateToNextChapter = () => {
    if (story) {
      const nextChapterNum = StoryService.getNextChapterNumber(story, chapterNumber);
      if (nextChapterNum) {
        setLocation(`/story/${storyId}/${nextChapterNum}`);
      }
    }
  };
  
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [quizAnalytics, setQuizAnalytics] = useState<any[]>([]);
  
  // Reset quiz state when changing chapters
  useEffect(() => {
    setQuizCompleted(false);
    setQuizAnalytics([]);
    setShowQuestions(false);
    setHasReadStory(false); // Reset the reading state
  }, [chapterNumber]);
  
  // State to track reading progress percentage
  const [readingProgressPercent, setReadingProgressPercent] = useState(0);
  
  // Add scroll tracking to detect when user has read the story
  useEffect(() => {
    const handleScroll = () => {
      if (contentRef.current) {
        const { scrollTop, scrollHeight, clientHeight } = contentRef.current;
        // Calculate scroll percentage (0-100)
        const scrollPercentage = (scrollTop + clientHeight) / scrollHeight;
        const percent = Math.min(Math.round(scrollPercentage * 100), 100);
        
        // Update progress percentage state
        setReadingProgressPercent(percent);
        
        // Consider "read" when the user has scrolled to 90% of the content
        if (scrollPercentage > 0.9) {
          setHasReadStory(true);
        }
      }
    };
    
    const contentElement = contentRef.current;
    if (contentElement) {
      contentElement.addEventListener('scroll', handleScroll);
      // Initialize reading progress by triggering the handler once
      handleScroll();
    }
    
    return () => {
      if (contentElement) {
        contentElement.removeEventListener('scroll', handleScroll);
      }
    };
  }, []);
  
  const handleQuizComplete = (analytics: any[]) => {
    console.log("Quiz analytics:", analytics);
    
    // Calculate reading time if we started the timer
    if (readingStartTime) {
      const readingDuration = Math.floor((Date.now() - readingStartTime) / 1000);
      setReadingTime(readingDuration);
      console.log(`Completed reading in ${readingDuration} seconds`);
      
      // Add reading time to analytics
      analytics.push({
        metric: "reading_time_seconds",
        value: readingDuration
      });
    }
    
    setQuizAnalytics(analytics);
    setQuizCompleted(true);
    setShowQuestions(false);
    
    // In a real application, we would submit these analytics to the backend
    // for future analysis, personalization, and educational insights
    toast({
      title: "Quiz Completed!",
      description: readingTime ? `You completed the chapter in ${Math.floor(readingTime / 60)} minutes and ${readingTime % 60} seconds.` : "Great job completing the quiz!"
    });
  };
  
  const handleBookmark = () => {
    toast({
      title: "Story bookmarked",
      description: "You can find this story in your bookmarks",
    });
  };
  
  const handleVocabulary = () => {
    if (currentChapter?.vocabularyWords && currentChapter.vocabularyWords.length > 0) {
      setShowFlashcard(true);
      setSelectedWord(currentChapter.vocabularyWords[0]);
    } else {
      toast({
        title: "No vocabulary words",
        description: "This chapter doesn't have any vocabulary words.",
      });
    }
  };
  
  const handleWordClick = (word: StoryService.VocabularyWord) => {
    setSelectedWord(word);
    setShowFlashcard(true);
  };
  
  const closeFlashcard = () => {
    setShowFlashcard(false);
    setSelectedWord(null);
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
          <Button onClick={handleGoBack}>Back to Dashboard</Button>
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
          Back to Dashboard
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
          <h1 className="font-bold text-3xl mb-2 text-white">Family Adventures</h1>
          <h2 className="text-xl mb-4 text-white">Chapter {chapterNumber}: A Walk to Remember</h2>
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
          
          <div className="flex flex-wrap items-center text-sm mb-6 gap-2">
            <div className="font-medium text-white mb-1 w-full">Academic Schedule:</div>
            <span className="px-3 py-1 bg-[#10B981]/50 text-white rounded-full text-sm">
              Week 3: Geometric Shapes & Physical Science
            </span>
          </div>
          
          {/* Story progress bar */}
          <div className="w-full bg-gray-200/20 rounded-full h-2.5 mb-2">
            <div 
              className="bg-[#10B981] h-2.5 rounded-full" 
              style={{ width: `${progress}%` }}
            ></div>
          </div>
          <div className="flex justify-between text-xs text-white/60 mb-4">
            <span>Story Progress</span>
            <span>Chapter {chapterNumber} of {story.chapters.length}</span>
          </div>
          
          {/* Reading progress bar */}
          <div className="w-full bg-gray-200/20 rounded-full h-2.5 mb-2">
            <div 
              className="bg-[#2563EB] h-2.5 rounded-full transition-all duration-300" 
              style={{ width: `${readingProgressPercent}%` }}
            ></div>
          </div>
          <div className="flex justify-between text-xs text-white/60 mb-1">
            <span>Reading Progress</span>
            <span>{hasReadStory ? 'Complete!' : `${readingProgressPercent}%`}</span>
          </div>
          
          {/* Reading timer */}
          {readingStartTime && (
            <div className="flex justify-end text-xs text-white/60 mb-6">
              <div className="px-2 py-1 bg-[#2563EB]/20 rounded-md flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10"></circle>
                  <polyline points="12 6 12 12 16 14"></polyline>
                </svg>
                <ReadingTimer startTime={readingStartTime} />
              </div>
            </div>
          )}
        </div>
        
        <div className="relative">
          {!hasReadStory && (
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-[#0F172A] to-transparent h-20 flex items-end justify-center pb-2 z-10">
              <span className="text-white/70 text-sm animate-bounce flex items-center">
                Scroll down to read the full story
                <ChevronRight className="h-4 w-4 ml-1 rotate-90" />
              </span>
            </div>
          )}
          
          <div 
            ref={contentRef}
            className="prose prose-lg prose-invert max-w-none text-white max-h-[60vh] overflow-y-auto px-2 pr-4"
          >
            {/* Render chapter content with highlighted vocab words */}
            {!currentChapter.content ? (
              <p className="text-lg">Loading chapter content...</p>
            ) : (
              currentChapter.content.split('\n\n').map((paragraph, pidx) => {
                // Only process if we have vocabulary words
                if (currentChapter.vocabularyWords && currentChapter.vocabularyWords.length > 0) {
                  let processedParagraph = paragraph;
                  let fragments = [];
                  let lastIndex = 0;
                  
                  // Loop through each vocabulary word
                  currentChapter.vocabularyWords.forEach((word, widx) => {
                    const wordRegex = new RegExp(`\\b${word.word}\\b`, 'gi');
                    let match;
                    
                    // Find all instances of the word in this paragraph
                    while ((match = wordRegex.exec(processedParagraph)) !== null) {
                      // Add text before the match
                      if (match.index > lastIndex) {
                        fragments.push(
                          <span key={`${pidx}-text-${lastIndex}`}>{processedParagraph.substring(lastIndex, match.index)}</span>
                        );
                      }
                      
                      // Add the highlighted word
                      fragments.push(
                        <span 
                          key={`${pidx}-word-${match.index}`}
                          className="font-bold text-[#10B981] cursor-pointer hover:underline"
                          onClick={() => handleWordClick(word)}
                        >
                          {match[0]}
                        </span>
                      );
                      
                      lastIndex = match.index + match[0].length;
                    }
                  });
                  
                  // Add any remaining text
                  if (lastIndex < processedParagraph.length) {
                    fragments.push(
                      <span key={`${pidx}-text-${lastIndex}`}>{processedParagraph.substring(lastIndex)}</span>
                    );
                  }
                  
                  // If we found and processed vocabulary words
                  if (fragments.length > 0) {
                    return <p key={pidx} className="mb-4">{fragments}</p>;
                  }
                }
                
                // If no vocabulary words were found or none exist, return the paragraph as is
                return <p key={pidx} className="mb-4">{paragraph}</p>;
              })
            )}
          </div>
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
          
          <div className="flex gap-3">
            {chapterQuestions[`${storyIdNumber}-${chapterNumber}`] && !quizCompleted && (
              <Button
                variant="outline"
                className={`${hasReadStory ? 'bg-[#2563EB] hover:bg-[#1E40AF]' : 'bg-gray-500'} text-white font-bold border-transparent`}
                onClick={() => setShowQuestions(true)}
                disabled={!hasReadStory}
              >
                {hasReadStory ? 'Take Chapter Quiz' : 'Finish Reading Story'}
              </Button>
            )}
            
            <Button
              className="bg-[#10B981] hover:bg-[#0D9488] text-white font-bold"
              onClick={handleNextChapter}
              disabled={
                !nextChapter || 
                (chapterQuestions[`${storyIdNumber}-${chapterNumber}`] && 
                !quizCompleted)
              }
            >
              {chapterQuestions[`${storyIdNumber}-${chapterNumber}`] && !quizCompleted ? (
                <>Complete Quiz to Continue</>
              ) : (
                <>Next Chapter<ChevronRight className="h-5 w-5 ml-1" /></>
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* Chapter Questions */}
      {showQuestions && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="w-full max-w-4xl glass-panel">
            <ChapterQuestions 
              questions={chapterQuestions[`${storyIdNumber}-${chapterNumber}`] || []}
              onComplete={handleQuizComplete}
              chapterNumber={chapterNumber}
            />
          </div>
        </div>
      )}

      {/* Flashcard Dialog */}
      <Dialog open={showFlashcard} onOpenChange={setShowFlashcard}>
        <DialogContent className="sm:max-w-md bg-gradient-to-br from-[#0F172A] to-[#2563EB] border-none">
          <DialogHeader>
            <DialogTitle className="text-center text-2xl font-bold text-white mb-2">
              Vocabulary Flashcard
            </DialogTitle>
            <DialogDescription className="text-center text-white/70 text-sm">
              Learn more about this vocabulary word
            </DialogDescription>
          </DialogHeader>
          
          {selectedWord && (
            <div className="py-4">
              <Card className="bg-white/10 overflow-hidden">
                <div className="p-4 bg-[#2563EB]/50">
                  <h2 className="text-xl font-bold text-center text-white mb-1">
                    {selectedWord.word}
                  </h2>
                </div>
                <CardContent className="p-6">
                  <h3 className="text-lg font-semibold text-[#10B981] mb-2">Definition:</h3>
                  <p className="text-white mb-4">{selectedWord.definition}</p>
                  
                  <h3 className="text-lg font-semibold text-[#10B981] mb-2">Example:</h3>
                  <p className="italic text-white/90 bg-white/5 p-3 rounded border border-white/10">
                    "{selectedWord.context}"
                  </p>
                </CardContent>
              </Card>
            </div>
          )}
          
          <div className="flex justify-center mt-2">
            <Button 
              variant="outline" 
              className="bg-[#2563EB]/30 hover:bg-[#2563EB]/50 border-[#10B981]/50 text-white"
              onClick={closeFlashcard}
            >
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}