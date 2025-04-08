import { useQuery, useMutation } from "@tanstack/react-query";
import { useParams, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, BookmarkIcon, InfoIcon } from "lucide-react";
import { Story, Chapter, InsertFlashcard } from "@shared/schema";
import { SubjectTag } from "@/components/SubjectTag";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import FlashcardDeck, { VocabularyWord } from "@/components/FlashcardDeck";
import { apiRequest, queryClient } from "@/lib/queryClient";

export default function StoryReader() {
  const { id, chapter } = useParams();
  const [_, setLocation] = useLocation();
  const { toast } = useToast();
  const [userAnswer, setUserAnswer] = useState("");
  
  const { data: story, isLoading: storyLoading } = useQuery<Story>({
    queryKey: [`/api/stories/${id}`],
  });
  
  const { data: chapterData, isLoading: chapterLoading } = useQuery<Chapter>({
    queryKey: [`/api/stories/${id}/chapters/${chapter}`],
  });
  
  const handleGoBack = () => {
    setLocation("/dashboard");
  };
  
  const handlePreviousChapter = () => {
    if (chapterData?.previousChapter) {
      setLocation(`/story/${id}/${chapterData.previousChapter}`);
    }
  };
  
  const handleNextChapter = () => {
    if (chapterData?.nextChapter) {
      setLocation(`/story/${id}/${chapterData.nextChapter}`);
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
  
  const checkAnswer = () => {
    if (userAnswer === chapterData?.question?.answer) {
      toast({
        title: "Correct!",
        description: "Great job! That's the right answer.",
        variant: "default",
      });
    } else {
      toast({
        title: "Try again",
        description: "That's not quite right. Give it another try!",
        variant: "destructive",
      });
    }
  };
  
  if (storyLoading || chapterLoading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-10">
        <div className="glass-panel p-8 flex justify-center items-center h-[50vh]">
          <div className="text-white text-xl">Loading story...</div>
        </div>
      </div>
    );
  }
  
  if (!story || !chapterData) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-10">
        <div className="glass-panel p-8">
          <h1 className="text-2xl font-bold text-white mb-4">Story not found</h1>
          <Button onClick={handleGoBack}>Back to Dashboard</Button>
        </div>
      </div>
    );
  }
  
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
          <Button 
            variant="ghost"
            className="text-white hover:text-white/80"
            onClick={handleVocabulary}
          >
            <InfoIcon className="h-5 w-5 mr-1" />
            Vocabulary
          </Button>
        </div>
      </div>
      
      <div className="glass-panel p-8">
        <div className="mb-6">
          <h1 className="font-bold text-3xl mb-2 text-white">{story.title}</h1>
          <h2 className="text-xl mb-4 text-white">Chapter {chapter}: {chapterData.title}</h2>
          <div className="flex flex-wrap items-center text-sm mb-6 gap-2">
            {story.subjects.map((subject) => (
              <SubjectTag key={subject.id} subject={subject} />
            ))}
          </div>
        </div>
        
        <div className="prose prose-lg prose-invert max-w-none">
          <div dangerouslySetInnerHTML={{ __html: chapterData.content }} />
          
          {chapterData.question && (
            <div className="bg-white/10 p-4 rounded-lg my-6">
              <h3 className="font-bold text-xl mb-2 text-white">{chapterData.question.title}</h3>
              <p className="mb-2 text-white">{chapterData.question.description}</p>
              
              {chapterData.question.hint && (
                <p className="text-sm italic mt-2 text-white/80">Hint: {chapterData.question.hint}</p>
              )}
              
              <div className="mt-4 flex items-center">
                <Input
                  type="text"
                  placeholder="Enter your answer"
                  className="flex-1 bg-white/20 border-white/30 text-white placeholder:text-white/50"
                  value={userAnswer}
                  onChange={(e) => setUserAnswer(e.target.value)}
                />
                <Button 
                  className="ml-2 bg-yellow-400 hover:bg-yellow-500 text-black font-bold"
                  onClick={checkAnswer}
                >
                  Check
                </Button>
              </div>
            </div>
          )}
        </div>
        
        <div className="flex justify-between mt-8">
          <Button
            variant="outline"
            className="bg-white/20 hover:bg-white/30 text-white border-transparent"
            onClick={handlePreviousChapter}
            disabled={!chapterData.previousChapter}
          >
            <ChevronLeft className="h-5 w-5 mr-1" />
            Previous Chapter
          </Button>
          <Button
            className="bg-yellow-400 hover:bg-yellow-500 text-black font-bold"
            onClick={handleNextChapter}
            disabled={!chapterData.nextChapter}
          >
            Next Chapter
            <ChevronRight className="h-5 w-5 ml-1" />
          </Button>
        </div>
      </div>
    </div>
  );
}
