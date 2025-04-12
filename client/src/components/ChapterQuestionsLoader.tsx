import { useState, useEffect } from "react";
import { Loader2 } from "lucide-react";
import ChapterQuestions from "./ChapterQuestions";

interface ChapterQuestionsLoaderProps {
  storyId: number;
  chapterNumber: number;
  onComplete: (analytics: any[]) => void;
  onClose?: () => void;
}

export default function ChapterQuestionsLoader({ 
  storyId, 
  chapterNumber,
  onComplete,
  onClose
}: ChapterQuestionsLoaderProps) {
  const [questions, setQuestions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Always load the latest questions data
  useEffect(() => {
    const loadQuestions = async () => {
      setLoading(true);
      try {
        // Use dynamic import to bypass caching
        const questionModule = await import("@/data/chapterQuestions");
        const chapterKey = `${storyId}-${chapterNumber}`;
        
        // Get all questions from the chapter
        const allQuestions = questionModule.default[chapterKey] || [];
        
        // Filter out word search questions
        const filteredQuestions = allQuestions.filter(q => q.type !== 'hidden-word');
        
        console.log(`Loaded ${allQuestions.length} questions for chapter ${chapterKey}`);
        console.log(`Removed ${allQuestions.length - filteredQuestions.length} word search questions`);
        console.log("Question types remaining:", filteredQuestions.map(q => q.type));
        
        setQuestions(filteredQuestions);
        setLoading(false);
      } catch (error) {
        console.error("Error loading questions:", error);
        setLoading(false);
      }
    };

    loadQuestions();
  }, [storyId, chapterNumber]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <Loader2 className="w-12 h-12 text-blue-500 animate-spin mb-4" />
        <p className="text-white text-lg">Loading questions...</p>
      </div>
    );
  }

  if (questions.length === 0) {
    return (
      <div className="py-12 px-6">
        <h2 className="text-2xl font-bold text-white mb-4">No Questions Available</h2>
        <p className="text-white mb-6">There are no questions for this chapter.</p>
        {onClose && (
          <button 
            onClick={onClose}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Continue to Next Chapter
          </button>
        )}
      </div>
    );
  }

  return (
    <ChapterQuestions 
      questions={questions}
      onComplete={onComplete}
      onClose={onClose}
      chapterNumber={chapterNumber}
    />
  );
}