import React, { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { fetchRandomMicrogame } from "@/lib/microgame-service";
import MicrogameContainer from "./microgames/MicrogameContainer";
import { Button } from "@/components/ui/button";
import { Microgame } from "@shared/schema";
import { Loader2, PlayCircle } from "lucide-react";

interface InterChapterGameProps {
  storyId: number;
  currentChapter: number;
  nextChapter: number;
  subjects: string[];
  gradeLevel: string;
  onContinue: () => void;
}

const InterChapterGame: React.FC<InterChapterGameProps> = ({
  storyId,
  currentChapter,
  nextChapter,
  subjects,
  gradeLevel,
  onContinue,
}) => {
  const { toast } = useToast();
  const [microgame, setMicrogame] = useState<Microgame | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [gameResult, setGameResult] = useState<{ score: number; passed: boolean } | null>(null);
  const [showGame, setShowGame] = useState(false);

  // Choose a subject based on the story subjects
  const chooseSubject = () => {
    if (subjects.length === 0) return undefined;
    return subjects[Math.floor(Math.random() * subjects.length)];
  };

  useEffect(() => {
    const loadMicrogame = async () => {
      try {
        console.log("InterChapterGame - Loading microgame", { 
          gradeLevel, 
          subjects, 
          storyId, 
          currentChapter, 
          nextChapter 
        });
        
        setLoading(true);
        setError(null);
        
        // Fetch a random microgame relevant to the current story's grade level and a random subject
        const subject = chooseSubject();
        console.log("Selected subject for microgame:", subject);
        
        const game = await fetchRandomMicrogame(gradeLevel, subject);
        console.log("Loaded microgame:", game);
        
        setMicrogame(game);
      } catch (err) {
        console.error("Failed to load microgame:", err);
        setError("Failed to load the activity. You can continue to the next chapter.");
      } finally {
        setLoading(false);
      }
    };

    loadMicrogame();
  }, [gradeLevel, subjects, storyId, currentChapter, nextChapter]);

  const handleGameComplete = (result: { score: number; passed: boolean }) => {
    setGameResult(result);
    
    // Show feedback toast
    if (result.passed) {
      toast({
        title: "Great job!",
        description: `You scored ${result.score}% on the activity.`,
        variant: "default",
      });
    } else {
      toast({
        title: "Keep practicing!",
        description: `You scored ${result.score}%. Try again next time.`,
        variant: "default",
      });
    }
  };

  const handleSkip = () => {
    toast({
      title: "Activity skipped",
      description: "Moving to the next chapter.",
      variant: "default",
    });
    onContinue();
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[300px] p-8 space-y-4">
        <Loader2 className="w-10 h-10 animate-spin text-primary" />
        <p className="text-lg font-medium">Loading activity...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[300px] p-8 space-y-4">
        <div className="text-center space-y-4">
          <h3 className="text-xl font-bold">Unable to Load Activity</h3>
          <p className="text-gray-600 dark:text-gray-300">{error}</p>
          <Button onClick={onContinue}>Continue to Next Chapter</Button>
        </div>
      </div>
    );
  }

  if (gameResult) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[300px] p-8 space-y-6">
        <div className="text-center space-y-4">
          <h3 className="text-2xl font-bold">
            {gameResult.passed ? "Great work!" : "Nice try!"}
          </h3>
          <p className="text-lg">
            You've completed the activity with a score of {gameResult.score}%.
          </p>
          <Button onClick={onContinue} size="lg" className="mt-4">
            Continue to Chapter {nextChapter}
          </Button>
        </div>
      </div>
    );
  }

  if (!showGame) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[300px] p-8 space-y-6">
        <div className="text-center space-y-4">
          <PlayCircle className="w-16 h-16 mx-auto text-primary" />
          <h3 className="text-2xl font-bold">Quick Activity</h3>
          <p className="text-lg">
            Before moving to the next chapter, let's see what you've learned!
          </p>
          <div className="flex justify-center space-x-4 mt-4">
            <Button onClick={() => setShowGame(true)} size="lg" className="bg-primary">
              Start Activity
            </Button>
            <Button onClick={handleSkip} variant="outline" size="lg">
              Skip Activity
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="py-6">
      {microgame && (
        <MicrogameContainer
          microgame={microgame}
          onComplete={handleGameComplete}
          onSkip={handleSkip}
        />
      )}
    </div>
  );
};

export default InterChapterGame;