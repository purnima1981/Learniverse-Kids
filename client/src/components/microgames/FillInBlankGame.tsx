import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Lightbulb } from "lucide-react";
import { MicrogameConfig, UserAnswer, checkAnswer } from "@/lib/microgame-service";

interface Blank {
  id: string;
  correctAnswer: string;
  options?: string[];
}

interface FillInBlankGameProps {
  text: string;
  blanks: Blank[];
  config?: MicrogameConfig;
  onAnswer: (answer: UserAnswer) => void;
  onComplete: (answers: UserAnswer[]) => void;
}

const FillInBlankGame: React.FC<FillInBlankGameProps> = ({
  text,
  blanks,
  config,
  onAnswer,
  onComplete,
}) => {
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);
  const [results, setResults] = useState<Record<string, boolean>>({});
  const [answersList, setAnswersList] = useState<UserAnswer[]>([]);
  const [showHints, setShowHints] = useState<Record<string, boolean>>({});

  // Process text to include blanks
  const processedText = React.useMemo(() => {
    let result = text;
    blanks.forEach(blank => {
      const placeholder = `[BLANK:${blank.id}]`;
      result = result.replace(placeholder, `<span data-blank="${blank.id}" class="blank"></span>`);
    });
    return result;
  }, [text, blanks]);

  const handleAnswerChange = (blankId: string, value: string) => {
    setAnswers(prev => ({ ...prev, [blankId]: value }));
  };

  const toggleHint = (blankId: string) => {
    setShowHints(prev => ({ ...prev, [blankId]: !prev[blankId] }));
  };

  const getBlankById = (id: string): Blank | undefined => {
    return blanks.find(blank => blank.id === id);
  };

  const handleSubmit = () => {
    const newResults: Record<string, boolean> = {};
    const newAnswersList: UserAnswer[] = [];

    blanks.forEach(blank => {
      const userAnswer = answers[blank.id] || "";
      const isCorrect = checkAnswer(userAnswer.trim().toLowerCase(), blank.correctAnswer.toLowerCase());
      newResults[blank.id] = isCorrect;

      const answerObject: UserAnswer = {
        questionId: blank.id,
        userAnswer,
        isCorrect,
      };
      newAnswersList.push(answerObject);
      onAnswer(answerObject);
    });

    setResults(newResults);
    setAnswersList(newAnswersList);
    setSubmitted(true);
  };

  const handleComplete = () => {
    onComplete(answersList);
  };

  const allAnswered = blanks.every(blank => !!answers[blank.id]);
  const allCorrect = submitted && Object.values(results).every(result => result);

  return (
    <div className="p-4 md:p-6">
      <h3 className="text-xl font-semibold mb-4">Fill in the blanks:</h3>
      
      <div 
        className="mb-6 prose dark:prose-invert max-w-none" 
        dangerouslySetInnerHTML={{ __html: processedText }}
      />
      
      <div className="space-y-6 mb-6">
        {blanks.map((blank) => {
          const isCorrect = submitted && results[blank.id];
          const isWrong = submitted && !results[blank.id];
          
          return (
            <div key={blank.id} className="flex flex-col space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium">
                  Blank #{blank.id}:
                </label>
                {config?.showHints && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => toggleHint(blank.id)}
                    className="h-7 text-blue-600 dark:text-blue-400"
                  >
                    <Lightbulb className="w-4 h-4 mr-1" />
                    Hint
                  </Button>
                )}
              </div>
              
              {showHints[blank.id] && (
                <div className="text-sm bg-blue-50 dark:bg-blue-950 p-2 rounded-md border border-blue-200 dark:border-blue-800">
                  <span className="font-semibold">Hint:</span> The answer is related to {blank.correctAnswer.length} letters long.
                  {blank.correctAnswer.length > 3 && (
                    <span> It starts with "{blank.correctAnswer.substring(0, 1)}"</span>
                  )}
                </div>
              )}
              
              {blank.options ? (
                <Select
                  value={answers[blank.id] || ""}
                  onValueChange={(value) => handleAnswerChange(blank.id, value)}
                  disabled={submitted}
                >
                  <SelectTrigger 
                    className={`
                      ${isCorrect ? 'border-green-500 bg-green-50 dark:bg-green-950' : ''}
                      ${isWrong ? 'border-red-500 bg-red-50 dark:bg-red-950' : ''}
                    `}
                  >
                    <SelectValue placeholder="Select an answer" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Select an answer</SelectItem>
                    {blank.options.map((option) => (
                      <SelectItem key={option} value={option}>
                        {option}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                <Input
                  value={answers[blank.id] || ""}
                  onChange={(e) => handleAnswerChange(blank.id, e.target.value)}
                  placeholder="Type your answer"
                  disabled={submitted}
                  className={`
                    ${isCorrect ? 'border-green-500 bg-green-50 dark:bg-green-950' : ''}
                    ${isWrong ? 'border-red-500 bg-red-50 dark:bg-red-950' : ''}
                  `}
                />
              )}
              
              {submitted && (
                <div className={`text-sm ${isCorrect ? 'text-green-600' : 'text-red-600'}`}>
                  {isCorrect ? (
                    <span>Correct!</span>
                  ) : (
                    <span>Incorrect. The correct answer is: {blank.correctAnswer}</span>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
      
      {submitted ? (
        <div className="flex justify-between items-center">
          <div>
            <Badge className={allCorrect ? "bg-green-500 hover:bg-green-600" : "bg-red-500 hover:bg-red-600"}>
              {allCorrect ? "All Correct!" : "Some answers incorrect"}
            </Badge>
          </div>
          <Button onClick={handleComplete}>
            Continue
          </Button>
        </div>
      ) : (
        <div className="flex justify-end">
          <Button 
            onClick={handleSubmit}
            disabled={!allAnswered}
          >
            Submit Answers
          </Button>
        </div>
      )}
    </div>
  );
};

export default FillInBlankGame;