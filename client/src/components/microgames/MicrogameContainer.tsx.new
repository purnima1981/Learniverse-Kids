import React, { useState, useEffect } from "react";
import { Microgame } from "@shared/schema";
import { UserAnswer, saveGameResult, MicrogameConfig } from "@/lib/microgame-service";
import { useToast } from "@/hooks/use-toast";
import QuizGame from "@/components/microgames/QuizGame";
import MatchingGame from "@/components/microgames/MatchingGame";
import ArrangeGame from "@/components/microgames/ArrangeGame";
import FillInBlankGame from "@/components/microgames/FillInBlankGame";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Timer, Trophy, XCircle, Award } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface MicrogameContainerProps {
  microgame: Microgame;
  onComplete: (result: { score: number; passed: boolean }) => void;
  onSkip?: () => void;
}

const MicrogameContainer: React.FC<MicrogameContainerProps> = ({
  microgame,
  onComplete,
  onSkip,
}) => {
  const { toast } = useToast();
  const [started, setStarted] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [answers, setAnswers] = useState<UserAnswer[]>([]);
  const [score, setScore] = useState(0);
  const [passed, setPassed] = useState(false);
  const [timeTaken, setTimeTaken] = useState(0);
  const [startTime, setStartTime] = useState<number | null>(null);
  const [timer, setTimer] = useState<NodeJS.Timeout | null>(null);
  const timeLimit = microgame.timeLimit || 0;
  const [timeLeft, setTimeLeft] = useState(timeLimit);

  // Parse the content JSON
  const content = typeof microgame.content === "string"
    ? JSON.parse(microgame.content)
    : microgame.content;

  // Determine passing threshold (default 60%)
  const passingThreshold = content.passingThreshold || 60;

  useEffect(() => {
    if (started && !completed && timeLimit > 0) {
      // Initialize timer
      setStartTime(Date.now());
      setTimeLeft(timeLimit);
      
      const intervalId = setInterval(() => {
        setTimeLeft((prev) => {
          const newTimeLeft = prev - 1;
          if (newTimeLeft <= 0) {
            clearInterval(intervalId);
            handleTimeout();
            return 0;
          }
          return newTimeLeft;
        });
      }, 1000);
      
      setTimer(intervalId);
      
      return () => {
        if (intervalId) clearInterval(intervalId);
      };
    }
  }, [started, completed, timeLimit]);

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const handleStart = () => {
    setStarted(true);
    setStartTime(Date.now());
  };

  const handleTimeout = () => {
    if (timer) clearInterval(timer);
    
    // Calculate score based on current answers
    finishGame(answers);
    
    toast({
      title: "Time's up!",
      description: "You've run out of time for this microgame.",
      variant: "destructive",
    });
  };

  const handleAnswer = (answer: UserAnswer) => {
    setAnswers((prev) => [...prev, answer]);
  };

  const handleComplete = (finalAnswers: UserAnswer[]) => {
    if (timer) clearInterval(timer);
    
    // Calculate time taken
    if (startTime) {
      const endTime = Date.now();
      const timeElapsed = Math.round((endTime - startTime) / 1000);
      setTimeTaken(timeElapsed);
    }
    
    finishGame(finalAnswers);
  };

  const finishGame = async (finalAnswers: UserAnswer[]) => {
    // Calculate the score
    const totalQuestions = getQuestionCount();
    const correctAnswers = finalAnswers.filter((a) => a.isCorrect).length;
    const calculatedScore = Math.round((correctAnswers / totalQuestions) * 100);
    
    setScore(calculatedScore);
    setPassed(calculatedScore >= passingThreshold);
    setCompleted(true);
    
    // Save the result
    try {
      await saveGameResult(
        microgame.id,
        calculatedScore,
        timeTaken || undefined,
        finalAnswers
      );
    } catch (error) {
      console.error("Error saving game result:", error);
      toast({
        title: "Error",
        description: "Failed to save your game results.",
        variant: "destructive",
      });
    }
  };

  const handleContinue = () => {
    onComplete({ score, passed });
  };

  const getQuestionCount = (): number => {
    switch (microgame.type) {
      case "quiz":
        return content.questions?.length || 0;
      case "match":
        return content.pairs?.length || 0;
      case "arrange":
        return 1; // Typically one arrangement task
      case "fill-in-blank":
        return content.blanks?.length || 0;
      default:
        return 0;
    }
  };

  const renderGame = () => {
    if (!started) {
      return (
        <div className="flex flex-col items-center justify-center p-8 space-y-6">
          <h3 className="text-2xl font-bold text-center">
            {microgame.title}
          </h3>
          <p className="text-center text-gray-600 dark:text-gray-300">
            {microgame.instructions}
          </p>
          {timeLimit > 0 && (
            <div className="flex items-center space-x-2">
              <Timer className="w-5 h-5 text-orange-500" />
              <span>Time limit: {formatTime(timeLimit)}</span>
            </div>
          )}
          <div className="flex items-center space-x-2">
            <Award className="w-5 h-5 text-green-500" />
            <span>Points: {microgame.points}</span>
          </div>
          <Button 
            size="lg" 
            className="mt-4 w-40 bg-blue-600 hover:bg-blue-700"
            onClick={handleStart}
          >
            Start Game
          </Button>
          {onSkip && (
            <Button 
              variant="outline" 
              onClick={onSkip}
              className="text-gray-500"
            >
              Skip for now
            </Button>
          )}
        </div>
      );
    }

    if (completed) {
      return (
        <div className="flex flex-col items-center justify-center p-8 space-y-6">
          <div className="mb-4">
            {passed ? (
              <Trophy className="w-16 h-16 mx-auto text-yellow-500" />
            ) : (
              <XCircle className="w-16 h-16 mx-auto text-red-500" />
            )}
          </div>
          <h3 className="text-2xl font-bold text-center">
            {passed ? "Great job!" : "Not quite there yet"}
          </h3>
          <div className="w-full max-w-md">
            <div className="flex justify-between mb-2">
              <span>Your score</span>
              <span className="font-bold">{score}%</span>
            </div>
            <Progress
              value={score}
              className={`h-3 ${passed ? "bg-green-500" : "bg-orange-500"}`}
            />
            <div className="flex justify-between mt-1 text-sm">
              <span>0%</span>
              <span className="text-green-600">{passingThreshold}% to pass</span>
              <span>100%</span>
            </div>
          </div>
          
          {timeTaken > 0 && (
            <div className="flex items-center space-x-2">
              <Timer className="w-5 h-5 text-blue-500" />
              <span>Time taken: {formatTime(timeTaken)}</span>
            </div>
          )}
          
          <Button 
            size="lg" 
            className="mt-4 w-40"
            onClick={handleContinue}
          >
            Continue
          </Button>
        </div>
      );
    }

    // Render the appropriate game component based on type
    switch (microgame.type) {
      case "quiz":
        return (
          <QuizGame
            questions={content.questions || []}
            config={{
              timeLimit: timeLimit > 0 ? timeLimit : undefined,
              shuffleOptions: content.shuffleOptions,
              showExplanation: content.showExplanation,
            }}
            onAnswer={handleAnswer}
            onComplete={(answers: UserAnswer[]) => handleComplete(answers)}
          />
        );
      case "match":
        return (
          <MatchingGame
            pairs={content.pairs || []}
            config={{
              timeLimit: timeLimit > 0 ? timeLimit : undefined,
              shuffleOptions: content.shuffleOptions,
            }}
            onAnswer={handleAnswer}
            onComplete={(answers: UserAnswer[]) => handleComplete(answers)}
          />
        );
      case "arrange":
        return (
          <ArrangeGame
            items={content.items || []}
            correctOrder={content.correctOrder || []}
            config={{
              timeLimit: timeLimit > 0 ? timeLimit : undefined,
            }}
            onAnswer={handleAnswer}
            onComplete={(answers: UserAnswer[]) => handleComplete(answers)}
          />
        );
      case "fill-in-blank":
        return (
          <FillInBlankGame
            text={content.text || ""}
            blanks={content.blanks || []}
            config={{
              timeLimit: timeLimit > 0 ? timeLimit : undefined,
              showHints: content.showHints,
            }}
            onAnswer={handleAnswer}
            onComplete={(answers: UserAnswer[]) => handleComplete(answers)}
          />
        );
      default:
        return (
          <div className="p-8 text-center">
            <p>Unsupported game type: {microgame.type}</p>
          </div>
        );
    }
  };

  return (
    <Card className="w-full max-w-3xl mx-auto shadow-lg border border-gray-200 dark:border-gray-800">
      <CardHeader className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
        <div className="flex justify-between items-center">
          <div>
            <CardTitle className="text-xl md:text-2xl font-bold">
              {started && !completed ? "In Progress" : microgame.title}
            </CardTitle>
            <CardDescription className="text-blue-100 mt-1">
              {microgame.subject}
              <Badge className="ml-2 bg-blue-800 text-white">
                {microgame.difficulty}
              </Badge>
            </CardDescription>
          </div>
          
          {started && !completed && timeLimit > 0 && (
            <div className="text-xl font-mono bg-black/30 px-3 py-1 rounded-md flex items-center">
              <Timer className="w-5 h-5 mr-2" />
              {formatTime(timeLeft)}
            </div>
          )}
        </div>
      </CardHeader>
      
      <CardContent className="p-0">
        {renderGame()}
      </CardContent>
      
      {started && !completed && (
        <CardFooter className="flex justify-between border-t bg-gray-50 dark:bg-gray-900 p-4">
          <div className="text-sm text-gray-500 dark:text-gray-400">
            {microgame.type.charAt(0).toUpperCase() + microgame.type.slice(1)} Game
          </div>
          {onSkip && (
            <Button 
              variant="ghost" 
              onClick={onSkip}
              className="text-gray-500"
            >
              Skip
            </Button>
          )}
        </CardFooter>
      )}
    </Card>
  );
};

export default MicrogameContainer;