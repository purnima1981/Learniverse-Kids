import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { CheckCircle2, XCircle } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { MicrogameConfig, UserAnswer, checkAnswer } from "@/lib/microgame-service";

interface Question {
  question: string;
  options: string[];
  correctAnswer: string;
  explanation?: string;
}

interface QuizGameProps {
  questions: Question[];
  config?: MicrogameConfig;
  onAnswer: (answer: UserAnswer) => void;
  onComplete: (answers: UserAnswer[]) => void;
}

const QuizGame: React.FC<QuizGameProps> = ({
  questions,
  config,
  onAnswer,
  onComplete,
}) => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [answers, setAnswers] = useState<UserAnswer[]>([]);
  const [shuffledOptions, setShuffledOptions] = useState<string[]>([]);

  const currentQuestion = questions[currentQuestionIndex];
  
  useEffect(() => {
    // Shuffle options if configured
    if (config?.shuffleOptions) {
      setShuffledOptions([...currentQuestion.options].sort(() => Math.random() - 0.5));
    } else {
      setShuffledOptions([...currentQuestion.options]);
    }
    
    // Reset state for new question
    setSelectedOption(null);
    setSubmitted(false);
  }, [currentQuestionIndex, currentQuestion, config?.shuffleOptions]);

  const handleSelectOption = (option: string) => {
    if (!submitted) {
      setSelectedOption(option);
    }
  };

  const handleSubmit = () => {
    if (!selectedOption) return;
    
    const isCorrect = checkAnswer(selectedOption, currentQuestion.correctAnswer);
    const newAnswer: UserAnswer = {
      questionId: currentQuestionIndex,
      userAnswer: selectedOption,
      isCorrect,
    };
    
    // Add to answers list
    const updatedAnswers = [...answers, newAnswer];
    setAnswers(updatedAnswers);
    
    // Notify parent
    onAnswer(newAnswer);
    
    // Show feedback
    setSubmitted(true);
    
    // Automatically move to next question after delay if showing feedback
    if (config?.showFeedback !== false) {
      setTimeout(() => {
        moveToNextQuestion();
      }, 2000);
    } else {
      moveToNextQuestion();
    }
  };

  const moveToNextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prevIndex => prevIndex + 1);
    } else {
      // Quiz completed
      onComplete(answers);
    }
  };

  const progressPercentage = ((currentQuestionIndex + (submitted ? 1 : 0)) / questions.length) * 100;

  return (
    <div className="p-4 md:p-6">
      <div className="mb-4">
        <div className="flex justify-between text-sm mb-1">
          <span>Question {currentQuestionIndex + 1} of {questions.length}</span>
          <span>{Math.round(progressPercentage)}% complete</span>
        </div>
        <Progress value={progressPercentage} className="h-2" />
      </div>
      
      <div className="mb-6">
        <h3 className="text-xl font-semibold mb-4">{currentQuestion.question}</h3>
        
        <RadioGroup 
          value={selectedOption || ""} 
          className="space-y-3"
        >
          {shuffledOptions.map((option, index) => {
            const isSelected = selectedOption === option;
            const isCorrect = submitted && option === currentQuestion.correctAnswer;
            const isWrong = submitted && isSelected && !isCorrect;
            
            return (
              <div 
                key={index}
                className={`
                  relative flex items-center space-x-2 p-3 rounded-lg border 
                  ${isSelected ? 'border-blue-500 bg-blue-50 dark:bg-blue-950' : 'border-gray-200 dark:border-gray-700'}
                  ${isCorrect ? 'border-green-500 bg-green-50 dark:bg-green-950' : ''}
                  ${isWrong ? 'border-red-500 bg-red-50 dark:bg-red-950' : ''}
                  transition-all
                `}
                onClick={() => handleSelectOption(option)}
              >
                <RadioGroupItem 
                  value={option} 
                  id={`option-${index}`} 
                  disabled={submitted}
                  className={`
                    ${isCorrect ? 'text-green-500 border-green-500' : ''}
                    ${isWrong ? 'text-red-500 border-red-500' : ''}
                  `}
                />
                <Label 
                  htmlFor={`option-${index}`}
                  className="flex-grow cursor-pointer font-medium"
                >
                  {option}
                </Label>
                {submitted && (
                  isCorrect ? (
                    <CheckCircle2 className="w-5 h-5 text-green-500 ml-auto" />
                  ) : (option === currentQuestion.correctAnswer ? (
                    <CheckCircle2 className="w-5 h-5 text-green-500 ml-auto" />
                  ) : isWrong ? (
                    <XCircle className="w-5 h-5 text-red-500 ml-auto" />
                  ) : null)
                )}
              </div>
            );
          })}
        </RadioGroup>
      </div>
      
      {submitted && currentQuestion.explanation && config?.showExplanation && (
        <Card className="mb-6 bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800">
          <CardContent className="p-4">
            <h4 className="font-semibold mb-1">Explanation:</h4>
            <p>{currentQuestion.explanation}</p>
          </CardContent>
        </Card>
      )}
      
      <div className="flex justify-between">
        {/* Leave space for back button if needed in the future */}
        <div></div>
        
        {submitted ? (
          <Button 
            onClick={moveToNextQuestion}
            className="ml-auto"
          >
            {currentQuestionIndex < questions.length - 1 ? 'Next Question' : 'Finish Quiz'}
          </Button>
        ) : (
          <Button 
            onClick={handleSubmit}
            disabled={!selectedOption}
            className="ml-auto"
          >
            Submit Answer
          </Button>
        )}
      </div>
    </div>
  );
};

export default QuizGame;