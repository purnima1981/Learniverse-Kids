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
// We'll load the questions dynamically to ensure we get the latest version
import ChapterQuestionsLoader from "@/components/ChapterQuestionsLoader";
import InterChapterGame from "@/components/InterChapterGame";

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
  // We no longer need highlightedWordsRef since we're using hardcoded highlights
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
    setLocation("/dashboard"); // Return to Dashboard explicitly, instead of root
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
    // Since we're now loading questions dynamically, just show the questions component
    // which will handle the case when there are no questions
    setShowQuestions(true);
  };
  
  const navigateToNextChapter = () => {
    if (story) {
      const nextChapterNum = StoryService.getNextChapterNumber(story, chapterNumber);
      if (nextChapterNum) {
        // Show InterChapterGame if we have subjects and it's not the last chapter
        if (story.subjects && story.subjects.length > 0) {
          console.log("Showing InterChapterGame before next chapter", {
            subjects: story.subjects,
            currentChapter: chapterNumber,
            nextChapter: nextChapterNum
          });
          setShowInterChapterGame(true);
        } else {
          console.log("No subjects found for story, skipping InterChapterGame");
          setLocation(`/story/${storyId}/${nextChapterNum}`);
        }
      }
    }
  };
  
  const handleInterChapterGameComplete = () => {
    setShowInterChapterGame(false);
    if (story) {
      const nextChapterNum = StoryService.getNextChapterNumber(story, chapterNumber);
      if (nextChapterNum) {
        setLocation(`/story/${storyId}/${nextChapterNum}`);
      }
    }
  };
  
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [quizAnalytics, setQuizAnalytics] = useState<any[]>([]);
  const [showInterChapterGame, setShowInterChapterGame] = useState(false);
  
  // Reset state when changing chapters
  useEffect(() => {
    setQuizCompleted(false);
    setQuizAnalytics([]);
    setShowQuestions(false);
    setHasReadStory(false); // Reset the reading state
    setShowInterChapterGame(false); // Reset the inter-chapter game state
    
    console.log(`Chapter changed to ${chapterNumber}, reset UI state`);
  }, [chapterNumber]);
  
  // State to track reading progress percentage
  const [readingProgressPercent, setReadingProgressPercent] = useState(0);
  
  // Implement manual progress buttons instead of scroll tracking
  useEffect(() => {
    // Start with 10% progress
    setReadingProgressPercent(10);
    
    // Create a timer to automatically increase progress
    const progressInterval = setInterval(() => {
      setReadingProgressPercent(prev => {
        // Increase by 5% every 3 seconds until we reach 90%
        const newValue = Math.min(prev + 5, 90);
        return newValue;
      });
    }, 3000); // Update every 3 seconds
    
    return () => clearInterval(progressInterval);
  }, []);
  
  // Function to manually complete reading
  const completeReading = () => {
    setReadingProgressPercent(100);
    setHasReadStory(true);
  };
  
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
    
    // Navigate to next chapter or show the interchapter game
    setTimeout(() => {
      navigateToNextChapter();
    }, 1500);
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
            {story.subjects.map((subject, idx) => (
              <span key={idx} className="px-3 py-1 bg-[#2563EB]/50 text-white rounded-full text-sm">
                {subject}
              </span>
            ))}
          </div>
          
          {/* Vocabulary color guide */}
          {currentChapter.vocabularyWords && currentChapter.vocabularyWords.length > 0 && (
            <div className="flex flex-wrap items-center text-sm mb-5 gap-2 p-3 bg-white/5 rounded-md">
              <div className="font-medium text-white mb-1 w-full">Vocabulary Word Color Guide:</div>
              {Array.from(new Set(currentChapter.vocabularyWords.map(word => word.subject))).map((subject, idx) => (
                subject && (
                  <div key={idx} className="flex items-center mr-3">
                    <span className={`w-3 h-3 rounded-full mr-1.5 ${
                      subject === 'Geometry' ? 'bg-[#10B981]' :
                      subject === 'Physics' ? 'bg-[#2563EB]' :
                      subject === 'Materials Science' ? 'bg-[#D97706]' :
                      subject === 'Language Arts' ? 'bg-[#8B5CF6]' :
                      'bg-[#2563EB]'
                    }`}></span>
                    <span className="text-white/80 text-xs">{subject}</span>
                  </div>
                )
              ))}
              <div className="text-white/60 text-xs italic mt-1 w-full">
                Click on any highlighted word to see its definition
              </div>
            </div>
          )}
          
          <div className="flex flex-wrap items-center text-sm mb-6 gap-2">
            <div className="font-medium text-white mb-1 w-full">Academic Schedule:</div>
            <span className="px-3 py-1 bg-[#10B981]/50 text-white rounded-full text-sm">
              Week 3: Geometric Shapes & Physical Science
            </span>
          </div>
          
          {/* Reading progress bar - single combined bar for simplicity */}
          <div className="w-full bg-gray-200/20 rounded-full h-4 mb-3">
            <div 
              className="bg-gradient-to-r from-[#10B981] to-[#2563EB] h-4 rounded-full transition-all duration-300" 
              style={{ width: `${readingProgressPercent}%` }}
            ></div>
          </div>
          <div className="flex justify-between text-xs text-white/70 mb-6">
            <span>Reading Progress ({hasReadStory ? 'Complete!' : `${readingProgressPercent}%`})</span>
            <span>Chapter {chapterNumber} of {story.chapters.length}</span>
          </div>
        </div>
        
        <div className="relative">
          {!hasReadStory && (
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-[#0F172A] to-transparent h-32 flex flex-col items-center justify-end pb-4 z-10">
              <Button 
                variant="outline"
                className="bg-[#2563EB] hover:bg-[#1E40AF] text-white border-transparent mb-4 px-6 py-2 text-base font-semibold shadow-lg"
                onClick={completeReading}
              >
                Mark as Read
              </Button>
              <div className="flex items-center justify-center mb-1">
                <span className="text-white/80 text-sm flex items-center">
                  Continue reading the story
                  <ChevronRight className="h-4 w-4 ml-1 rotate-90" />
                </span>
              </div>
            </div>
          )}
          
          <div 
            ref={contentRef}
            className="prose prose-lg prose-invert max-w-none text-white min-h-[50vh] overflow-y-auto px-2 pr-4 pb-24"
          >
            {/* Hardcoded highlighted vocabulary */}
            <div className="content">
              <p className="mb-4">As the clock struck 2:45 PM on a crisp Sunday afternoon in March 2025, my 10-year-old son Ethan and I set out for an unforgettable stroll through our neighborhood. The spring air carried the scent of new beginnings, and our familiar surroundings transformed into a living classroom.</p>
              
              <p className="mb-4">"Mom, did you know stop signs are <span className="font-bold text-[#10B981] cursor-pointer hover:underline" onClick={() => currentChapter.vocabularyWords && handleWordClick(currentChapter.vocabularyWords[0])}>octagons</span> for a reason?" Ethan asked as we approached an intersection. His eyes sparkled with enthusiasm as he explained how the unique shape made them recognizable from all angles. This led to a discussion about school zone signs, which are shaped like <span className="font-bold text-[#10B981] cursor-pointer hover:underline" onClick={() => currentChapter.vocabularyWords && handleWordClick(currentChapter.vocabularyWords[1])}>pentagons</span>.</p>
              
              <p className="mb-4">As we passed houses with <span className="font-bold text-[#10B981] cursor-pointer hover:underline" onClick={() => currentChapter.vocabularyWords && handleWordClick(currentChapter.vocabularyWords[2])}>triangular</span> roofs, Ethan stopped and pointed. "Mom, do you know why so many roofs are shaped like triangles?"</p>
              
              <p className="mb-4">"I think it has something to do with rain or snow sliding off easily," I guessed.</p>
              
              <p className="mb-4">"That's right," Ethan said. "But there's more! Triangles are one of the strongest shapes in geometry—they can handle a lot of pressure from wind or heavy snow without collapsing."</p>
              
              <p className="mb-4">He picked up a stick and drew a <span className="font-bold text-[#10B981] cursor-pointer hover:underline" onClick={() => currentChapter.vocabularyWords && handleWordClick(currentChapter.vocabularyWords[3])}>rhombus</span> in the dirt. "Look at this," he said excitedly. "If I draw a diagonal line across this rhombus, it splits into two triangles! And if we measure the diagonals, we can even calculate the area of the rhombus using those triangles."</p>
              
              <p className="mb-4">As we continued walking, we passed by a diamond-shaped road sign warning drivers about construction ahead. Ethan stopped to observe it closely. "Mom, look at this sign! If you stand behind it, the support pillars divide it into two equal triangles."</p>
              
              <p className="mb-4">"You're absolutely right!" I said. "That's geometry in action. A diagonal line splits a diamond—or rhombus—into two <span className="font-bold text-[#10B981] cursor-pointer hover:underline" onClick={() => currentChapter.vocabularyWords && handleWordClick(currentChapter.vocabularyWords[4])}>congruent</span> triangles."</p>
              
              <p className="mb-4">Ethan grinned. "Geometry is everywhere if you just look for it!"</p>
              
              <p className="mb-4">Our path led us up a gentle hill, prompting a conversation about energy and work. "Mom," Ethan called back, "do you know what happens to our energy as we climb?"</p>
              
              <p className="mb-4">"What do you mean?" I asked.</p>
              
              <p className="mb-4">"When we walk uphill," he explained, "our bodies store energy because of our height above the ground. That's called <span className="font-bold text-[#2563EB] cursor-pointer hover:underline" onClick={() => currentChapter.vocabularyWords && handleWordClick(currentChapter.vocabularyWords[5])}>potential energy</span>! The higher we go, the more potential energy we gain."</p>
              
              <p className="mb-4">"That makes sense," I said as I caught up with him at the top of the hill. "What happens to that energy when we go back down?"</p>
              
              <p className="mb-4">"It turns into <span className="font-bold text-[#2563EB] cursor-pointer hover:underline" onClick={() => currentChapter.vocabularyWords && handleWordClick(currentChapter.vocabularyWords[6])}>kinetic energy</span>—the energy of motion!" Ethan said excitedly. "Think about rolling a ball down this hill—it speeds up as it goes down because its potential energy is turning into kinetic energy."</p>
              
              <p className="mb-4">To demonstrate, Ethan picked up a small rock and let it roll down the hill. "See? The rock is accelerating just like I said!"</p>
              
              <p className="mb-4">At the top of the hill, a strong breeze greeted us. Ethan spread his arms wide and leaned into the wind. "Mom, it feels like the wind is trying to push us back home!" he laughed.</p>
              
              <p className="mb-4">"That's <span className="font-bold text-[#2563EB] cursor-pointer hover:underline" onClick={() => currentChapter.vocabularyWords && handleWordClick(currentChapter.vocabularyWords[7])}>air resistance</span>," Ethan explained before I could respond. "It's a force that impedes us when we move forward against the wind."</p>
              
              <p className="mb-4">We passed by a neighbor's house with wind chimes hanging on their porch. The breeze made them tinkle softly. "Mom, do you know how wind chimes make music?" Ethan asked.</p>
              
              <p className="mb-4">"No idea—tell me!" I said.</p>
              
              <p className="mb-4">"The wind transfers kinetic energy to the chimes," he explained patiently. "That energy makes them vibrate and create sound waves that travel through the air to our ears."</p>
              
              <p className="mb-4">He paused and then added thoughtfully: "The wind is playing us a song—kind of like it has its own personality!"</p>
              
              <p className="mb-4">"Wait," I interrupted playfully. "That sounds like <span className="font-bold text-[#8B5CF6] cursor-pointer hover:underline" onClick={() => currentChapter.vocabularyWords && handleWordClick(currentChapter.vocabularyWords[8])}>personification</span>! You're giving human qualities to something non-human."</p>
              
              <p className="mb-4">"You're right!" Ethan laughed. "Personification is one of my favorite literary devices."</p>
              
              <p className="mb-4">As we neared home after our 2.8-mile journey (yes, Ethan insisted on measuring it), he noticed something interesting about our surroundings: "Mom, everything around us is made of different materials—wood fences, metal stop signs, glass windows… Do you know why people choose certain materials for specific things?"</p>
              
              <p className="mb-4">"I'm guessing it depends on what they need," I replied.</p>
              
              <p className="mb-4">"Exactly!" Ethan said eagerly. "Metal is durable and doesn't break easily—that's why stop signs are made of metal instead of wood or plastic. Glass is transparent so light can pass through it—that's why windows are made of glass."</p>
              
              <p className="mb-4">He touched the wooden fence next to us and added thoughtfully: "Wood feels coarse compared to metal and isn't as <span className="font-bold text-[#D97706] cursor-pointer hover:underline" onClick={() => currentChapter.vocabularyWords && handleWordClick(currentChapter.vocabularyWords[9])}>resilient</span> outdoors unless treated properly."</p>
              
              <p className="mb-4">"Wow," I said again. "You've really been paying attention to everything around you!"</p>
              
              <p className="mb-4">By the time we reached home at 3:30 PM, Ethan was glowing with excitement about everything he had shared during our walk. As we stepped onto our porch, he turned to me and said with a big smile: "Mom, let's explore more places next weekend! Maybe that park in the next neighborhood?"</p>
              
              <p className="mb-4">"Of course," I replied warmly. And just like that, our ordinary walk transformed into an unforgettable journey filled with curiosity and discovery—led by my brilliant son.</p>
            </div>
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
            {/* Show quiz button regardless, the loader will handle if there are no questions */}
            {!quizCompleted && (
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
                (!quizCompleted && hasReadStory) // Only require quiz completion if the user has read the story
              }
            >
              {!quizCompleted && hasReadStory ? (
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
            {/* Dynamically import question data to avoid caching */}
            <ChapterQuestionsLoader 
              storyId={storyIdNumber}
              chapterNumber={chapterNumber}
              onComplete={handleQuizComplete}
              onClose={() => setShowQuestions(false)}
            />
          </div>
        </div>
      )}

      {/* Flashcard Dialog */}
      <Dialog open={showFlashcard} onOpenChange={setShowFlashcard}>
        <DialogContent className="sm:max-w-lg bg-gray-800 border-none max-h-[90vh] overflow-auto">
          <DialogHeader>
            <DialogTitle className="text-center text-xl font-bold text-white mb-2">
              {selectedWord?.type === 'formula' ? 'Formula Flashcard' : 
               selectedWord?.type === 'concept' ? 'Concept Flashcard' : 
               'Vocabulary Flashcard'}
            </DialogTitle>
            <DialogDescription className="text-center text-white/70 text-sm">
              {selectedWord?.type === 'formula' ? 'Learn more about this mathematical formula' : 
               selectedWord?.type === 'concept' ? 'Explore this important concept' : 
               'Learn more about this vocabulary word'}
            </DialogDescription>
          </DialogHeader>
          
          {selectedWord && (
            <div className="py-4">
              <Card className="bg-gray-800 overflow-hidden border border-gray-700">
                {selectedWord.subject && (
                  <div className={`text-xs uppercase tracking-wider text-white text-center py-1 ${
                    selectedWord.subject === 'Geometry' ? 'bg-green-800' :
                    selectedWord.subject === 'Physics' ? 'bg-blue-800' :
                    selectedWord.subject === 'Materials Science' ? 'bg-amber-800' :
                    selectedWord.subject === 'Language Arts' ? 'bg-purple-800' :
                    'bg-blue-800'
                  }`}>
                    {selectedWord.subject}
                  </div>
                )}
                <div className={`p-4 ${
                  selectedWord.subject === 'Geometry' ? 'bg-green-900/50' :
                  selectedWord.subject === 'Physics' ? 'bg-blue-900/50' :
                  selectedWord.subject === 'Materials Science' ? 'bg-amber-900/50' :
                  selectedWord.subject === 'Language Arts' ? 'bg-purple-900/50' :
                  'bg-blue-900/50'
                }`}>
                  <h2 className="text-xl font-bold text-center text-white mb-1">
                    {selectedWord.word}
                  </h2>
                </div>
                <CardContent className="p-6">
                  <div className="bg-gray-700 p-4 rounded-md border border-green-500/30 mb-4">
                    <h3 className="text-lg font-semibold text-green-400 mb-2">Definition:</h3>
                    <p className="text-white">{selectedWord.definition}</p>
                  </div>
                  
                  <div className="bg-gray-700 p-4 rounded-md border border-green-500/30">
                    <h3 className="text-lg font-semibold text-green-400 mb-2">Example:</h3>
                    <p className="italic text-white/90 bg-gray-800 p-3 rounded border border-gray-600">
                      "{selectedWord.context}"
                    </p>
                  </div>
                  
                  {/* Display formula if it exists */}
                  {selectedWord.formula && (
                    <div className="mt-4 bg-gray-700 p-4 rounded-md border border-blue-500/30">
                      <h3 className="text-lg font-semibold text-blue-400 mb-2">Formula:</h3>
                      <div className="text-white text-center font-mono text-xl p-2 bg-black/30 rounded mb-2" style={{maxWidth: "100%", overflow: "auto"}}>
                        {selectedWord.formula}
                      </div>
                      {selectedWord.formulaExplanation && (
                        <p className="text-white/90 text-sm italic">
                          {selectedWord.formulaExplanation}
                        </p>
                      )}
                    </div>
                  )}
                  
                  {/* Display mnemonic if it exists */}
                  {selectedWord.mnemonic && (
                    <div className="mt-4 bg-gray-700 p-4 rounded-md border border-green-500/30">
                      <h3 className="text-lg font-semibold text-green-400 mb-2">Memory Aid:</h3>
                      <p className="text-white font-medium p-3 bg-gray-800 rounded border border-gray-600">
                        {selectedWord.mnemonic}
                      </p>
                    </div>
                  )}
                  
                  {/* Show image if it exists */}
                  {selectedWord.image && (
                    <div className="mt-4 bg-gray-700 p-4 rounded-md border border-green-500/30">
                      <h3 className="text-lg font-semibold text-green-400 mb-2">Visual Reference:</h3>
                      <div className="w-full bg-gray-800 rounded-md flex justify-center items-center p-2" style={{maxHeight: "200px"}}>
                        <img 
                          src={selectedWord.image} 
                          alt={`Visual for ${selectedWord.word}`} 
                          className="max-h-[180px] max-w-full object-contain rounded"
                        />
                      </div>
                    </div>
                  )}
                  
                  {/* Show synonyms and antonyms only for Language Arts vocabulary */}
                  {selectedWord.subject === "Language Arts" && selectedWord.synonyms && selectedWord.synonyms.length > 0 && (
                    <div className="mt-4 bg-gray-700 p-4 rounded-md border border-purple-500/30">
                      <h3 className="text-lg font-semibold text-purple-400 mb-2">Synonyms:</h3>
                      <div className="flex flex-wrap gap-2">
                        {selectedWord.synonyms.map((synonym, index) => (
                          <span key={index} className="px-2 py-1 bg-purple-500/20 text-white rounded text-sm">
                            {synonym}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {selectedWord.subject === "Language Arts" && selectedWord.antonyms && selectedWord.antonyms.length > 0 && (
                    <div className="mt-4 bg-gray-700 p-4 rounded-md border border-purple-500/30">
                      <h3 className="text-lg font-semibold text-purple-400 mb-2">Antonyms:</h3>
                      <div className="flex flex-wrap gap-2">
                        {selectedWord.antonyms.map((antonym, index) => (
                          <span key={index} className="px-2 py-1 bg-purple-500/10 text-white/90 rounded text-sm border border-purple-500/20">
                            {antonym}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          )}
          
          <div className="flex justify-center mt-4">
            <Button 
              variant="outline" 
              className="bg-gray-700 hover:bg-gray-600 border-gray-600 text-white px-6 py-2"
              onClick={closeFlashcard}
            >
              Close Flashcard
            </Button>
          </div>
        </DialogContent>
      </Dialog>
      {/* InterChapterGame - Show between chapters */}
      {showInterChapterGame && nextChapter && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="w-full max-w-4xl">
            <InterChapterGame
              storyId={storyIdNumber}
              currentChapter={chapterNumber}
              nextChapter={nextChapter}
              subjects={story.subjects || []}
              gradeLevel={story.gradeLevel || ""}
              onContinue={handleInterChapterGameComplete}
            />
          </div>
        </div>
      )}
    </div>
  );
}