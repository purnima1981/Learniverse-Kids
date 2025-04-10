import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { MicrogameConfig, UserAnswer } from "@/lib/microgame-service";
import { CheckCircle2, XCircle } from "lucide-react";

interface MatchPair {
  left: string;
  right: string;
}

interface MatchingGameProps {
  pairs: MatchPair[];
  config?: MicrogameConfig;
  onAnswer: (answer: UserAnswer) => void;
  onComplete: (answers: UserAnswer[]) => void;
}

const MatchingGame: React.FC<MatchingGameProps> = ({
  pairs,
  config,
  onAnswer,
  onComplete,
}) => {
  const [leftItems, setLeftItems] = useState<(string | null)[]>([]);
  const [rightItems, setRightItems] = useState<string[]>([]);
  const [selectedLeft, setSelectedLeft] = useState<number | null>(null);
  const [matches, setMatches] = useState<Record<number, number | null>>({});
  const [answers, setAnswers] = useState<UserAnswer[]>([]);
  const [feedback, setFeedback] = useState<Record<number, boolean>>({});
  const [showingFeedback, setShowingFeedback] = useState(false);
  const [completed, setCompleted] = useState(false);

  useEffect(() => {
    // Initialize the game
    const left = pairs.map(pair => pair.left);
    const right = [...pairs.map(pair => pair.right)];
    
    // Shuffle right items if configured
    if (config?.shuffleOptions) {
      right.sort(() => Math.random() - 0.5);
    }
    
    setLeftItems(left);
    setRightItems(right);
    setMatches({});
    setFeedback({});
  }, [pairs, config?.shuffleOptions]);

  const handleSelectLeft = (index: number) => {
    if (leftItems[index] === null || showingFeedback) return; // Already matched or showing feedback
    
    setSelectedLeft(index);
  };

  const handleSelectRight = (index: number) => {
    if (selectedLeft === null || showingFeedback) return;
    
    // Record the match
    const updatedMatches = { ...matches, [selectedLeft]: index };
    setMatches(updatedMatches);
    
    // Get the correct answer from the current left item
    const correctAnswer = pairs[selectedLeft].right;
    // Get the user's selected answer from the right items
    const userAnswer = rightItems[index];
    
    // Check if correct
    const correct = correctAnswer === userAnswer;
    console.log("Matching check:", { 
      leftItem: pairs[selectedLeft].left,
      correctAnswer,
      userSelected: userAnswer,
      isCorrect: correct
    });
    
    const updatedFeedback = { ...feedback, [selectedLeft]: correct };
    setFeedback(updatedFeedback);
    
    // Add to answers
    const newAnswer: UserAnswer = {
      questionId: selectedLeft,
      userAnswer: userAnswer,
      isCorrect: correct,
    };
    const updatedAnswers = [...answers, newAnswer];
    setAnswers(updatedAnswers);
    
    // Notify parent
    onAnswer(newAnswer);
    
    // Show feedback
    if (config?.showFeedback !== false) {
      setShowingFeedback(true);
      setTimeout(() => {
        if (correct) {
          // Remove matched item
          const newLeftItems = [...leftItems];
          newLeftItems[selectedLeft] = null;
          setLeftItems(newLeftItems);
        }
        setShowingFeedback(false);
        setSelectedLeft(null);
        
        // Check if all items are matched correctly
        const correctMatches = Object.entries(updatedFeedback)
          .filter(([_, isCorrect]) => isCorrect)
          .length;
          
        if (correctMatches === pairs.length) {
          handleComplete(updatedAnswers);
        }
      }, 1000);
    } else {
      if (correct) {
        // Remove matched item
        const newLeftItems = [...leftItems];
        newLeftItems[selectedLeft] = null;
        setLeftItems(newLeftItems);
      }
      setSelectedLeft(null);
      
      // Check if all items are matched correctly
      const correctMatches = Object.entries(updatedFeedback)
        .filter(([_, isCorrect]) => isCorrect)
        .length;
        
      if (correctMatches === pairs.length) {
        handleComplete(updatedAnswers);
      }
    }
  };

  const handleCheckAnswers = () => {
    // Log for debugging
    console.log("Checking all answers:", { 
      pairs, 
      matches, 
      rightItems 
    });
    
    const allAnswers: UserAnswer[] = pairs.map((pair, index) => {
      const matchedRightIndex = matches[index];
      const userAnswer = matchedRightIndex !== undefined && matchedRightIndex !== null 
        ? rightItems[matchedRightIndex] 
        : "";
      
      // Compare the correct right answer with the user's selected right item
      const isCorrect = pair.right === userAnswer;
      
      console.log(`Pair ${index}:`, {
        leftItem: pair.left,
        correctAnswer: pair.right,
        userSelected: userAnswer,
        isCorrect
      });
      
      return {
        questionId: index,
        userAnswer,
        isCorrect,
      };
    });
    
    handleComplete(allAnswers);
  };

  const handleComplete = (finalAnswers: UserAnswer[]) => {
    setCompleted(true);
    onComplete(finalAnswers);
  };

  const getProgress = (): number => {
    const correctMatches = Object.values(feedback).filter(val => val).length;
    return (correctMatches / pairs.length) * 100;
  };

  return (
    <div className="p-4 md:p-6">
      <div className="mb-4">
        <div className="flex justify-between text-sm mb-1">
          <span>Matching Progress</span>
          <span>{Math.round(getProgress())}% complete</span>
        </div>
        <Progress value={getProgress()} className="h-2" />
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div className="space-y-3">
          <h3 className="text-xl font-semibold text-center mb-4">Items</h3>
          {leftItems.map((item, index) => (
            <div
              key={`left-${index}`}
              className={`
                p-3 rounded-lg border border-gray-200 dark:border-gray-700
                ${item === null ? 'opacity-50 bg-gray-100 dark:bg-gray-800' : 'cursor-pointer'}
                ${selectedLeft === index ? 'border-blue-500 bg-blue-50 dark:bg-blue-950' : ''}
                ${showingFeedback && selectedLeft === index && feedback[index] ? 'border-green-500 bg-green-50 dark:bg-green-950' : ''}
                ${showingFeedback && selectedLeft === index && !feedback[index] ? 'border-red-500 bg-red-50 dark:bg-red-950' : ''}
              `}
              onClick={() => handleSelectLeft(index)}
            >
              <div className="flex items-center">
                <span className="flex-grow font-medium">{item}</span>
                {showingFeedback && selectedLeft === index && (
                  feedback[index] ? (
                    <CheckCircle2 className="w-5 h-5 text-green-500 ml-2" />
                  ) : (
                    <XCircle className="w-5 h-5 text-red-500 ml-2" />
                  )
                )}
              </div>
            </div>
          ))}
        </div>
        
        <div className="space-y-3">
          <h3 className="text-xl font-semibold text-center mb-4">Matches</h3>
          {rightItems.map((item, index) => (
            <div
              key={`right-${index}`}
              className={`
                p-3 rounded-lg border border-gray-200 dark:border-gray-700 cursor-pointer
                ${selectedLeft !== null && !showingFeedback ? 'hover:border-blue-300 hover:bg-blue-50 dark:hover:bg-blue-950' : ''}
                ${Object.values(matches).includes(index) ? 'opacity-70' : ''}
              `}
              onClick={() => handleSelectRight(index)}
            >
              <span className="font-medium">{item}</span>
            </div>
          ))}
        </div>
      </div>
      
      <div className="flex justify-end">
        <Button
          variant="outline"
          onClick={handleCheckAnswers}
        >
          Check Answers
        </Button>
      </div>
    </div>
  );
};

export default MatchingGame;