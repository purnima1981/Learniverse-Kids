import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { CheckCircle, XCircle, Clock, X } from "lucide-react";
import { Question } from "@/data/chapterQuestions";

interface QuestionAnalytics {
  questionId: number;
  timeSpent: number; // in seconds
  correct: boolean;
  answer: string | number | string[];
}

interface ChapterQuestionsProps {
  questions: Question[];
  onComplete: (analytics: QuestionAnalytics[]) => void;
  chapterNumber: number;
  onClose?: () => void; // Optional close handler
}

export default function ChapterQuestions({ questions, onComplete, chapterNumber, onClose }: ChapterQuestionsProps) {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<number, any>>({});
  const [showFeedback, setShowFeedback] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [score, setScore] = useState(0);
  const [timer, setTimer] = useState(0);
  const [questionStartTime, setQuestionStartTime] = useState(Date.now());
  const [analytics, setAnalytics] = useState<QuestionAnalytics[]>([]);
  
  // Timer setup - increment every second
  useEffect(() => {
    const timerInterval = setInterval(() => {
      setTimer(prev => prev + 1);
    }, 1000);
    
    return () => clearInterval(timerInterval);
  }, []);
  
  // Track question changes to reset timer
  useEffect(() => {
    setQuestionStartTime(Date.now());
    setTimer(0);
  }, [currentQuestionIndex]);

  const currentQuestion = questions[currentQuestionIndex];
  const isLastQuestion = currentQuestionIndex === questions.length - 1;

  const handleAnswer = (value: any) => {
    setAnswers(prev => ({ ...prev, [currentQuestion.id]: value }));
  };

  const checkAnswer = () => {
    // Check if the current answer is correct
    const currentAnswer = answers[currentQuestion.id];
    let correct = false;

    if (Array.isArray(currentQuestion.answer)) {
      // For matching questions
      correct = JSON.stringify(currentAnswer) === JSON.stringify(currentQuestion.answer);
    } else {
      // For multiple choice and fill in the blank
      correct = currentAnswer === currentQuestion.answer;
    }

    setIsCorrect(correct);
    setShowFeedback(true);

    if (correct) {
      setScore(prev => prev + 1);
    }
    
    // Record analytics for this question
    const questionAnalytics: QuestionAnalytics = {
      questionId: currentQuestion.id,
      timeSpent: timer,
      correct: correct,
      answer: currentAnswer
    };
    
    setAnalytics(prev => [...prev, questionAnalytics]);
    
    // Auto-advance after a short delay
    setTimeout(() => {
      setShowFeedback(false);
      if (isLastQuestion) {
        setShowResults(true);
      } else {
        setCurrentQuestionIndex(prev => prev + 1);
      }
    }, 1500);
  };

  const renderMultipleChoice = (question: Question) => (
    <RadioGroup 
      value={answers[question.id] || ""}
      onValueChange={handleAnswer}
      className="space-y-3"
    >
      {question.options?.map((option, index) => (
        <div key={index} className="flex items-center space-x-2 bg-white/10 p-3 rounded-md">
          <RadioGroupItem value={String.fromCharCode(97 + index)} id={`option-${index}`} />
          <Label htmlFor={`option-${index}`} className="text-white">{option}</Label>
        </div>
      ))}
    </RadioGroup>
  );

  const renderFillBlank = (question: Question) => (
    <div className="space-y-3">
      <Input 
        type="text" 
        placeholder="Your answer..."
        value={answers[question.id] || ""}
        onChange={(e) => handleAnswer(e.target.value)}
        className="bg-white/10 border-[#2563EB]/30 text-white"
      />
    </div>
  );

  const renderQuestion = (question: Question) => {
    switch (question.type) {
      case 'multiple-choice':
        return renderMultipleChoice(question);
      case 'fill-blank':
        return renderFillBlank(question);
      default:
        return <p className="text-white">Question type not supported yet</p>;
    }
  };

  const renderFeedback = () => (
    <div className={`p-4 rounded-md mb-4 ${isCorrect ? 'bg-[#10B981]/20' : 'bg-red-500/20'}`}>
      <div className="flex items-center space-x-2">
        {isCorrect ? (
          <>
            <CheckCircle className="h-6 w-6 text-[#10B981]" />
            <span className="text-white font-medium">Correct! Good job!</span>
          </>
        ) : (
          <>
            <XCircle className="h-6 w-6 text-red-500" />
            <span className="text-white font-medium">Incorrect. The correct answer was: {currentQuestion.answer}</span>
          </>
        )}
      </div>
    </div>
  );

  const renderResults = () => {
    // Calculate average time spent per question
    const totalTimeSpent = analytics.reduce((total, item) => total + item.timeSpent, 0);
    const avgTimePerQuestion = Math.round(totalTimeSpent / analytics.length);
    
    const handleCompleteClick = () => {
      onComplete(analytics);
    };
    
    return (
      <div className="text-center p-6 bg-[#2563EB]/30 rounded-lg relative">
        {/* Close button in corner of results screen */}
        {onClose && (
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-2 right-2 text-white/70 hover:text-white"
            onClick={onClose}
          >
            <X className="h-5 w-5" />
          </Button>
        )}
      
        <h3 className="text-2xl font-bold text-white mb-4">Chapter {chapterNumber} Quiz Results</h3>
        <div className="text-6xl font-bold mb-4 text-white">{score}/{questions.length}</div>
        
        <div className="mb-4 flex justify-center gap-8">
          <div className="text-center">
            <p className="text-white/70">Avg. Time per Question</p>
            <p className="text-2xl font-bold text-white">
              {Math.floor(avgTimePerQuestion / 60)}:{(avgTimePerQuestion % 60).toString().padStart(2, '0')}
            </p>
          </div>
          <div className="text-center">
            <p className="text-white/70">Accuracy</p>
            <p className="text-2xl font-bold text-white">
              {Math.round((score / questions.length) * 100)}%
            </p>
          </div>
        </div>
        
        <p className="text-lg mb-6 text-white">
          {score === questions.length
            ? "Perfect score! You've mastered this chapter!"
            : score > questions.length / 2
            ? "Good work! You're understanding the key concepts."
            : "Keep practicing! Reread the chapter to improve your understanding."}
        </p>
        
        <Button onClick={handleCompleteClick} className="bg-[#10B981] hover:bg-[#0D9488] text-white">
          Continue to Next Chapter
        </Button>
      </div>
    );
  };

  if (showResults) {
    return renderResults();
  }

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-8 relative">
        {/* Close button in top right corner */}
        {onClose && (
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-0 right-0 text-white/70 hover:text-white"
            onClick={onClose}
          >
            <X className="h-5 w-5" />
          </Button>
        )}
        
        <h2 className="text-2xl font-bold text-white mb-2 text-center">Chapter {chapterNumber} Comprehension Quiz</h2>
        <p className="text-white/70 text-center">Question {currentQuestionIndex + 1} of {questions.length}</p>
        <div className="w-full bg-gray-200/20 h-2 rounded-full mt-4 mb-6">
          <div 
            className="bg-[#10B981] h-2 rounded-full" 
            style={{ width: `${((currentQuestionIndex + 1) / questions.length) * 100}%` }}
          />
        </div>
      </div>

      <Card className="bg-[#0F172A]/60 border-[#2563EB]/30 p-6 mb-6">
        <div className="flex justify-between items-center mb-2">
          <h3 className="text-xl font-medium text-white">{currentQuestion.text}</h3>
          <div className="flex items-center text-white/70 text-sm">
            <Clock className="h-4 w-4 mr-1" />
            <span>{Math.floor(timer / 60).toString().padStart(2, '0')}:{(timer % 60).toString().padStart(2, '0')}</span>
          </div>
        </div>
        
        {showFeedback ? renderFeedback() : renderQuestion(currentQuestion)}
      </Card>

      <div className="flex justify-between">
        <Button 
          variant="outline" 
          onClick={() => currentQuestionIndex > 0 && setCurrentQuestionIndex(prev => prev - 1)}
          disabled={currentQuestionIndex === 0 || showFeedback}
          className="bg-white/10 hover:bg-white/20 text-white border-transparent"
        >
          Previous
        </Button>
        <Button 
          onClick={checkAnswer}
          disabled={!answers[currentQuestion.id] || showFeedback}
          className="bg-[#10B981] hover:bg-[#0D9488] text-white"
        >
          Check Answer
        </Button>
      </div>
    </div>
  );
}