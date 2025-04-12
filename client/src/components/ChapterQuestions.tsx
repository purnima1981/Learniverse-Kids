import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { CheckCircle, XCircle, Clock, X, GripVertical, Flag, SkipForward, BookOpen, Zap, RefreshCw } from "lucide-react";
import { Question } from "@/data/chapterQuestions";
import { DragDropContext, Droppable, Draggable, DropResult } from "react-beautiful-dnd";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Checkbox } from "@/components/ui/checkbox";
// Force re-import to ensure we're using the latest version
import chapterQuestionsData from "../data/chapterQuestions";

// Add CSS for touch dragging
const touchDragStyles = `
  [data-draggable="true"].dragging {
    opacity: 0.7;
    transform: scale(1.02);
    box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3);
    z-index: 1000;
  }
  
  @media (pointer: coarse) {
    [data-draggable="true"] {
      touch-action: none;
    }
  }
`;

const styleElement = document.createElement('style');
styleElement.textContent = touchDragStyles;
document.head.appendChild(styleElement);

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
  const [flaggedQuestions, setFlaggedQuestions] = useState<number[]>([]);
  const [skippedQuestions, setSkippedQuestions] = useState<number[]>([]);
  
  // For matching questions
  const [matchItems, setMatchItems] = useState<{[key: number]: {item: string, match: string}[]}>({});
  
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
    
    // Initialize data for current question if needed
    const currentQuestion = questions[currentQuestionIndex];
    if (currentQuestion) {
      // Handle special question types
      if (currentQuestion.type === 'matching' && currentQuestion.items) {
        // Always initialize matching items when changing questions to avoid sync issues
        const items = [...currentQuestion.items];
        // Shuffle the items for the matching game
        const shuffledItems = [...items].sort(() => Math.random() - 0.5);
        setMatchItems(prev => ({ ...prev, [currentQuestion.id]: shuffledItems }));
        
        // Initialize answers structure for this question if not already present
        if (!answers[currentQuestion.id]) {
          const initialAnswers: Record<string, string> = {};
          currentQuestion.items.forEach(item => {
            initialAnswers[item.item] = "";
          });
          setAnswers(prev => ({
            ...prev,
            [currentQuestion.id]: initialAnswers
          }));
        }
      }
    }
  }, [currentQuestionIndex]);

  const currentQuestion = questions[currentQuestionIndex];
  const isLastQuestion = currentQuestionIndex === questions.length - 1;

  const handleAnswer = (value: any) => {
    setAnswers(prev => ({ ...prev, [currentQuestion.id]: value }));
  };

  // Handle flagging a question for review later
  const handleFlagQuestion = () => {
    const questionId = currentQuestion.id;
    if (flaggedQuestions.includes(questionId)) {
      // If already flagged, unflag it
      setFlaggedQuestions(prev => prev.filter(id => id !== questionId));
    } else {
      // Flag the question
      setFlaggedQuestions(prev => [...prev, questionId]);
    }
  };

  // Handle skipping a question
  const handleSkipQuestion = () => {
    // Add to skipped questions list
    const questionId = currentQuestion.id;
    if (!skippedQuestions.includes(questionId)) {
      setSkippedQuestions(prev => [...prev, questionId]);
    }
    
    // Move to next question
    if (isLastQuestion) {
      // If it's the last question, show results
      setShowResults(true);
    } else {
      setCurrentQuestionIndex(prev => prev + 1);
    }
  };

  const checkAnswer = () => {
    // Check if the current answer is correct
    const currentAnswer = answers[currentQuestion.id];
    let correct = false;

    if (currentQuestion.type === 'matching' && currentQuestion.items) {
      // For matching questions with the new format (object with term-definition pairs)
      const userAnswers = currentAnswer || {};
      
      // Check if all terms have a selected answer
      const hasAllAnswers = currentQuestion.items.every(item => 
        userAnswers.hasOwnProperty(item.item) && userAnswers[item.item]
      );
      
      if (hasAllAnswers) {
        // Check if all matches are correct
        correct = currentQuestion.items.every(item => 
          userAnswers[item.item] === item.match
        );
      }
    } else if (Array.isArray(currentQuestion.answer)) {
      // For array-based answers (word-sequence, hidden-word, etc.)
      correct = JSON.stringify(currentAnswer) === JSON.stringify(currentQuestion.answer);
    } else if (currentQuestion.type === 'fill-blank') {
      // For fill in the blank questions, compare with the correct answer
      // We're now using an exact match since we've switched to multiple choice
      correct = currentAnswer === currentQuestion.answer;
    } else {
      // For multiple choice, true-false, etc.
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
      className="space-y-4"
    >
      {question.options?.map((option, index) => (
        <div key={index} className="flex items-start space-x-3 bg-white/10 p-4 rounded-md hover:bg-white/20 transition-colors cursor-pointer">
          <RadioGroupItem value={String.fromCharCode(97 + index)} id={`option-${index}`} className="mt-1" />
          <Label 
            htmlFor={`option-${index}`} 
            className="text-white flex-1 cursor-pointer"
            onClick={() => handleAnswer(String.fromCharCode(97 + index))}
          >
            {option}
          </Label>
        </div>
      ))}
    </RadioGroup>
  );

  // Generate multiple choice options for fill-in-blank questions
  const generateOptions = (correctAnswer: string): string[] => {
    // If the answer has multiple words, split it into parts
    const parts = correctAnswer.split(/[ ,]+/);
    
    // Generate options including the correct answer
    const options = [correctAnswer];
    
    // Generate 3 additional plausible but incorrect answers
    if (parts.length > 1) {
      // For multi-word answers, create variations by changing one word
      for (let i = 0; i < Math.min(3, parts.length); i++) {
        const modified = [...parts];
        modified[i] = modified[i] + 's'; // Simple modification
        options.push(modified.join(' '));
      }
    } else {
      // For single word answers, add similar options
      options.push(correctAnswer + 's');
      options.push(correctAnswer.substring(0, Math.max(3, correctAnswer.length - 2)));
      options.push(correctAnswer.charAt(0) + correctAnswer.substring(1).split('').sort(() => 0.5 - Math.random()).join(''));
    }
    
    // If we don't have 4 options yet, add some generic ones
    while (options.length < 4) {
      options.push(`${correctAnswer} (variation ${options.length})`);
    }
    
    // Shuffle the options
    return options.sort(() => Math.random() - 0.5);
  };
  
  // Cache options for fill-in-blank questions to avoid regenerating on re-renders
  const [fillBlankOptions, setFillBlankOptions] = useState<{[key: number]: string[]}>({});
  
  // Generate and cache options for fill-in-blank questions when they first appear
  useEffect(() => {
    if (currentQuestion?.type === 'fill-blank' && !fillBlankOptions[currentQuestion.id]) {
      const options = generateOptions(currentQuestion.answer as string);
      setFillBlankOptions(prev => ({ ...prev, [currentQuestion.id]: options }));
    }
  }, [currentQuestionIndex, currentQuestion]);
  
  const renderFillBlank = (question: Question) => {
    // Get or generate options for this question
    const options = fillBlankOptions[question.id] || generateOptions(question.answer as string);
    
    return (
      <div className="space-y-4">
        <div className="p-2 rounded-md bg-[#2563EB]/20 text-white/80 text-sm mb-2">
          Choose the correct answer to complete the sentence.
        </div>
        <RadioGroup 
          value={answers[question.id] || ""}
          onValueChange={handleAnswer}
          className="space-y-4"
        >
          {options.map((option, index) => (
            <div key={index} className="flex items-start space-x-3 bg-white/10 p-4 rounded-md hover:bg-white/20 transition-colors cursor-pointer">
              <RadioGroupItem value={option} id={`option-fill-${index}`} className="mt-1" />
              <Label 
                htmlFor={`option-fill-${index}`} 
                className="text-white flex-1 cursor-pointer"
                onClick={() => handleAnswer(option)}
              >
                {option}
              </Label>
            </div>
          ))}
        </RadioGroup>
      </div>
    );
  };

  const handleDragEnd = (result: DropResult, question: Question) => {
    const { source, destination } = result;
    
    // Return if dropped outside a droppable area or didn't move
    if (!destination || (source.droppableId === destination.droppableId && source.index === destination.index)) {
      return;
    }
    
    // Get current matches for this question
    const currentItems = [...(matchItems[question.id] || [])];
    
    // Reorder the items
    const [removed] = currentItems.splice(source.index, 1);
    currentItems.splice(destination.index, 0, removed);
    
    // Update the state
    setMatchItems({
      ...matchItems,
      [question.id]: currentItems,
    });
    
    // Update the answer with the new order
    const mappedAnswers = currentItems.map(item => `${item.item}:${item.match}`);
    handleAnswer(mappedAnswers);
  };
  
  // Touch support for drag and drop
  const touchSupportRef = useRef<boolean>(false);
  
  // Track shuffled matching answers
  const [matchAnswers, setMatchAnswers] = useState<{[key: number]: string[]}>({});
  
  useEffect(() => {
    // Set up touch support for matching questions
    if (currentQuestion?.type === 'matching' && !touchSupportRef.current) {
      // Add a simple instruction for mobile users
      const instruction = document.createElement('div');
      instruction.className = 'p-2 bg-blue-500/20 text-white text-sm mt-2 mb-4 rounded';
      instruction.innerHTML = 'For mobile devices: Drag the answers on the right to match with terms on the left.';
      
      setTimeout(() => {
        const matchingContainer = document.querySelector('[data-droppable="true"]');
        if (matchingContainer && matchingContainer.parentNode) {
          matchingContainer.parentNode.insertBefore(instruction, matchingContainer);
        }
      }, 500);
      
      touchSupportRef.current = true;
    }
  }, [currentQuestion]);
  
  // Initialize shuffled answers for matching questions
  useEffect(() => {
    if (currentQuestion?.type === 'matching' && currentQuestion.items && !matchAnswers[currentQuestion.id]) {
      // Get all the possible answers (definitions)
      const answers = currentQuestion.items.map(item => item.match);
      
      // Shuffle the answers
      const shuffledAnswers = [...answers].sort(() => Math.random() - 0.5);
      
      setMatchAnswers(prev => ({
        ...prev,
        [currentQuestion.id]: shuffledAnswers
      }));
    }
  }, [currentQuestion]);

  // Handle dragging and dropping answers
  const handleMatchingDragEnd = (result: DropResult, question: Question) => {
    const { source, destination } = result;
    
    // Return if dropped outside a droppable area or didn't move
    if (!destination) {
      return;
    }
    
    // If dragging within the same droppable (reordering the answers)
    if (source.droppableId === destination.droppableId) {
      const answerList = [...matchAnswers[question.id]];
      const [removed] = answerList.splice(source.index, 1);
      answerList.splice(destination.index, 0, removed);
      
      setMatchAnswers({
        ...matchAnswers,
        [question.id]: answerList
      });
      return;
    }
    
    // Handle dragging from answer list to a term slot
    if (!question.items) {
      return;
    }
    
    const termIndex = parseInt(destination.droppableId.split('-')[1]);
    const answerIndex = source.index;
    
    // Make sure the index is valid
    if (termIndex < 0 || termIndex >= question.items.length) {
      return;
    }
    
    // Get the current term and the selected answer
    const term = question.items[termIndex].item;
    const selectedAnswer = matchAnswers[question.id][answerIndex];
    
    // Create or update the selection
    const updatedAnswers = {
      ...answers[question.id] || {},
      [term]: selectedAnswer
    };
    
    // Update the answers state
    handleAnswer(updatedAnswers);
  };

  const renderMatching = (question: Question) => {
    if (!question.items || !matchAnswers[question.id]) return null;
    
    return (
      <div className="space-y-4">
        <div className="p-3 rounded-md bg-[#2563EB]/20 text-white/80 text-sm mb-2">
          Drag the definitions from the right column to match with the terms on the left.
        </div>
        
        <DragDropContext onDragEnd={(result) => handleMatchingDragEnd(result, question)}>
          <div className="grid grid-cols-2 gap-4">
            {/* Left side - Terms */}
            <div className="space-y-3">
              <div className="text-white font-semibold text-center pb-2 border-b border-white/30">
                Terms
              </div>
              
              {question.items.map((item, index) => (
                <div key={`term-${index}`} className="bg-white/10 p-3 rounded-md">
                  <div className="text-white font-medium mb-2">{item.item}</div>
                  
                  <Droppable droppableId={`term-${index}`}>
                    {(provided, snapshot) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.droppableProps}
                        className={`h-10 border ${snapshot.isDraggingOver ? 'border-green-500 bg-green-500/10' : 'border-white/30'} rounded-md min-h-[2.5rem]`}
                        data-droppable={`term-${index}`}
                      >
                        {/* Show selected answer if one exists */}
                        {answers[question.id] && answers[question.id][item.item] && (
                          <div className="text-white p-2 text-sm">
                            {answers[question.id][item.item]}
                          </div>
                        )}
                        {provided.placeholder}
                      </div>
                    )}
                  </Droppable>
                </div>
              ))}
            </div>
            
            {/* Right side - Answers */}
            <div className="space-y-3">
              <div className="text-white font-semibold text-center pb-2 border-b border-white/30">
                Definitions
              </div>
              
              <Droppable droppableId="answers-list">
                {(provided) => (
                  <div 
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    className="space-y-2"
                    data-droppable="true"
                  >
                    {matchAnswers[question.id].map((answer, index) => (
                      <Draggable key={`answer-${index}`} draggableId={`answer-${index}`} index={index}>
                        {(provided, snapshot) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            className={`flex items-center bg-[#0F172A]/60 p-3 rounded-md cursor-grab ${
                              snapshot.isDragging ? 'border-2 border-[#10B981] shadow-lg' : ''
                            }`}
                            data-draggable="true"
                          >
                            <div className="text-white text-sm flex-1">
                              {answer}
                            </div>
                            <GripVertical className="h-5 w-5 text-white/70 ml-2" />
                          </div>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </div>
          </div>
        </DragDropContext>
      </div>
    );
  };

  // Hidden Word (Word Search) Puzzle
  const [highlightedCells, setHighlightedCells] = useState<{[key: string]: boolean}>({});
  const [foundWords, setFoundWords] = useState<string[]>([]);
  const [foundMessage, setFoundMessage] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [selectedPath, setSelectedPath] = useState<string[]>([]);
  const [selectedWord, setSelectedWord] = useState("");
  
  // Reset state when question changes
  useEffect(() => {
    if (currentQuestion?.type === 'hidden-word') {
      // Initialize found words from saved answers
      if (answers[currentQuestion.id] && Array.isArray(answers[currentQuestion.id])) {
        setFoundWords(answers[currentQuestion.id] as string[]);
      } else {
        setFoundWords([]);
      }
      setSelectedPath([]);
      setSelectedWord("");
      setHighlightedCells({});
    }
  }, [currentQuestionIndex, answers]);
  
  // Auto-hide found message
  useEffect(() => {
    if (foundMessage) {
      const timer = setTimeout(() => {
        setFoundMessage(null);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [foundMessage]);
  
  // Add touch support to cells
  useEffect(() => {
    if (isDragging) {
      const preventDefault = (e: TouchEvent) => {
        e.preventDefault();
      };
      document.addEventListener("touchmove", preventDefault, { passive: false });
      return () => {
        document.removeEventListener("touchmove", preventDefault);
      };
    }
  }, [isDragging]);
  
  const startDrag = (cellId: string, letter: string) => {
    setIsDragging(true);
    setSelectedPath([cellId]);
    setSelectedWord(letter);
  };
  
  const continueDrag = (cellId: string, letter: string) => {
    if (!isDragging || selectedPath.includes(cellId)) return;
    
    // Get the coordinates of the current cell and the last cell in the path
    const [lastRowStr, lastColStr] = selectedPath[selectedPath.length - 1].split('-');
    const [rowStr, colStr] = cellId.split('-');
    
    const lastRow = parseInt(lastRowStr);
    const lastCol = parseInt(lastColStr);
    const row = parseInt(rowStr);
    const col = parseInt(colStr);
    
    // Check if this move is valid (adjacent or in line with previous selections)
    const rowDiff = Math.abs(row - lastRow);
    const colDiff = Math.abs(col - lastCol);
    
    // If it's the second cell, establish direction
    if (selectedPath.length === 1) {
      // Any adjacent cell is valid for the second selection
      if ((rowDiff <= 1 && colDiff <= 1) && !(rowDiff === 0 && colDiff === 0)) {
        setSelectedPath([...selectedPath, cellId]);
        setSelectedWord(selectedWord + letter);
      }
    } else {
      // For subsequent cells, must follow the established direction
      const firstCell = selectedPath[0].split('-').map(Number);
      const secondCell = selectedPath[1].split('-').map(Number);
      
      // Calculate the direction vector from the first two cells
      const directionRow = secondCell[0] - firstCell[0];
      const directionCol = secondCell[1] - firstCell[1];
      
      // Check if the new cell continues in the same direction
      const expectedRow = lastRow + directionRow;
      const expectedCol = lastCol + directionCol;
      
      if (row === expectedRow && col === expectedCol) {
        setSelectedPath([...selectedPath, cellId]);
        setSelectedWord(selectedWord + letter);
      }
    }
  };
  
  const endDrag = (question: Question) => {
    if (!isDragging || !question.words) {
      setIsDragging(false);
      return;
    }
    
    // Check if the selected word is in the list of words to find
    const wordToFind = selectedWord.toUpperCase();
    const wordBackwards = selectedWord.split('').reverse().join('').toUpperCase();
    
    let found = question.words.find(word => 
      word.toUpperCase() === wordToFind || word.toUpperCase() === wordBackwards
    );
    
    if (found && !foundWords.includes(found)) {
      // Mark cells as highlighted
      const highlightMap: {[key: string]: boolean} = {};
      selectedPath.forEach(cell => {
        highlightMap[cell] = true;
      });
      
      setHighlightedCells({...highlightedCells, ...highlightMap});
      
      // Add to found words
      const newFoundWords = [...foundWords, found];
      setFoundWords(newFoundWords);
      
      // Show found message
      setFoundMessage(found);
      
      // Update answer for the question
      handleAnswer(newFoundWords);
    }
    
    // Reset selection
    setSelectedPath([]);
    setSelectedWord("");
    setIsDragging(false);
  };

  const renderHiddenWord = (question: Question) => {
    if (!question.grid || !question.words) return null;
    
    const foundCount = foundWords.length;
    const totalWords = question.words.length;
    
    return (
      <div className="space-y-4">
        <div className="p-3 rounded-md bg-[#2563EB]/20 text-white/80 text-sm mb-2">
          Find these words by dragging across letters in the grid. Found {foundCount} of {totalWords} words.
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="relative">
            <div className="font-mono bg-white/10 p-4 rounded-md select-none">
              {question.grid.map((row, rowIndex) => (
                <div key={rowIndex} className="flex justify-center">
                  {row.split('').map((char, colIndex) => {
                    const cellId = `${rowIndex}-${colIndex}`;
                    const isSelected = selectedPath.includes(cellId);
                    const isHighlighted = highlightedCells[cellId];
                    
                    let cellClass = "w-9 h-9 flex items-center justify-center text-lg font-medium";
                    
                    if (isHighlighted) {
                      cellClass += " bg-green-600 text-white rounded-md";
                    } else if (isSelected) {
                      cellClass += " bg-blue-500 text-white rounded-md";
                    } else {
                      cellClass += " text-white hover:bg-white/20 hover:rounded-md transition-colors";
                    }
                    
                    return (
                      <div
                        key={cellId}
                        className={cellClass}
                        data-cell-id={cellId}
                        onMouseDown={() => startDrag(cellId, char)}
                        onMouseEnter={() => continueDrag(cellId, char)}
                        onMouseUp={() => endDrag(question)}
                        onTouchStart={(e) => {
                          e.preventDefault();
                          startDrag(cellId, char);
                        }}
                        onTouchMove={(e) => {
                          if (!isDragging) return;
                          
                          const touch = e.touches[0];
                          
                          // Get element from point
                          try {
                            const element = document.elementFromPoint(touch.clientX, touch.clientY);
                            if (element) {
                              const cellIdAttr = element.getAttribute('data-cell-id');
                              if (cellIdAttr) {
                                const charContent = element.textContent || '';
                                continueDrag(cellIdAttr, charContent);
                              }
                            }
                          } catch (err) {
                            console.error("Touch error:", err);
                          }
                        }}
                        onTouchEnd={() => endDrag(question)}
                      >
                        {char}
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
            
            {foundMessage && (
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 
                            bg-green-600 text-white px-4 py-2 rounded-lg shadow-lg 
                            flex items-center animate-bounce">
                <CheckCircle className="mr-2 h-5 w-5" />
                <span className="font-bold">{foundMessage} Found!</span>
              </div>
            )}
          </div>
          
          <div className="space-y-3">
            <div className="text-white font-semibold text-center pb-2 border-b border-white/30">
              Words to Find
            </div>
            
            <div className="space-y-2">
              {question.words.map((word, index) => {
                const found = foundWords.includes(word);
                
                return (
                  <div 
                    key={index} 
                    className={`flex items-center p-2 rounded-md ${found ? 'bg-green-600/20' : 'bg-white/10'}`}
                  >
                    {found && <CheckCircle className="h-5 w-5 text-green-500 mr-2" />}
                    <span className={`${found ? 'text-green-400 font-medium' : 'text-white'}`}>
                      {word}
                    </span>
                  </div>
                );
              })}
            </div>
            
            <div className="mt-4 p-3 bg-[#0F172A]/60 rounded-md text-white/70 text-sm">
              <p className="mb-1 font-medium text-white">How to play:</p>
              <ol className="list-decimal list-inside space-y-1 pl-1">
                <li>Find words in the grid</li>
                <li>Click and drag to select letters</li>
                <li>Words can run in any direction:
                  <ul className="list-disc list-inside pl-4 mt-1 text-xs">
                    <li>Horizontally (→ or ←)</li>
                    <li>Vertically (↓ or ↑)</li>
                    <li>Diagonally (↘ ↗ ↙ ↖)</li>
                  </ul>
                </li>
                <li>When you find a word, it will be highlighted</li>
              </ol>
            </div>
          </div>
        </div>
      </div>
    );
  };
  
  // True/False Question
  const renderTrueFalse = (question: Question) => {
    return (
      <RadioGroup 
        value={answers[question.id] || ""}
        onValueChange={handleAnswer}
        className="space-y-4"
      >
        <div className="flex items-start space-x-3 bg-white/10 p-4 rounded-md hover:bg-white/20 transition-colors cursor-pointer">
          <RadioGroupItem value="true" id="true" className="mt-1" />
          <Label 
            htmlFor="true" 
            className="text-white flex-1 cursor-pointer"
            onClick={() => handleAnswer("true")}
          >
            True
          </Label>
        </div>
        <div className="flex items-start space-x-3 bg-white/10 p-4 rounded-md hover:bg-white/20 transition-colors cursor-pointer">
          <RadioGroupItem value="false" id="false" className="mt-1" />
          <Label 
            htmlFor="false" 
            className="text-white flex-1 cursor-pointer"
            onClick={() => handleAnswer("false")}
          >
            False
          </Label>
        </div>
      </RadioGroup>
    );
  };
  
  // Unscramble Question Handler
  const renderUnscramble = (question: Question) => {
    if (!question.letters) return null;
    
    // Split the letters by comma if provided as a comma-separated list
    const wordList = question.letters.includes(',') ? 
      question.letters.split(',').map(s => s.trim()) : 
      [question.letters];
    
    return (
      <div className="space-y-6">
        <div className="p-3 rounded-md bg-[#2563EB]/20 text-white/80 text-sm mb-4">
          Unscramble the letters to form the correct words.
        </div>
        
        <div className="space-y-4">
          {wordList.map((scrambledWord, wordIndex) => (
            <div key={wordIndex} className="space-y-2">
              <div className="font-mono text-white bg-white/10 p-3 rounded-md text-center text-lg tracking-wider">
                {scrambledWord}
              </div>
              <div className="flex items-center">
                <Input
                  type="text"
                  placeholder="Type your answer here"
                  className="flex-1 bg-white/5 border-white/20 text-white"
                  value={
                    answers[question.id] && Array.isArray(answers[question.id]) 
                      ? answers[question.id][wordIndex] || '' 
                      : ''
                  }
                  onChange={(e) => {
                    const currentAnswers = Array.isArray(answers[question.id]) 
                      ? [...answers[question.id]] 
                      : new Array(wordList.length).fill('');
                    currentAnswers[wordIndex] = e.target.value.toUpperCase();
                    handleAnswer(currentAnswers);
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  // Word Sequence (Ordering)
  const [wordSequenceItems, setWordSequenceItems] = useState<{[key: number]: string[]}>({});
  
  useEffect(() => {
    if (currentQuestion?.type === 'word-sequence' && currentQuestion.wordSequence) {
      if (!wordSequenceItems[currentQuestion.id]) {
        // Initialize with the wordSequence or fallback to options if available
        const sequenceItems = currentQuestion.wordSequence || 
                            (currentQuestion.options || []);
        
        setWordSequenceItems({
          ...wordSequenceItems,
          [currentQuestion.id]: [...sequenceItems].sort(() => Math.random() - 0.5)
        });
      }
    }
  }, [currentQuestion]);
  
  const handleWordSequenceDragEnd = (result: DropResult, question: Question) => {
    const { source, destination } = result;
    
    if (!destination || source.droppableId !== destination.droppableId) {
      return;
    }
    
    if (source.index === destination.index) {
      return;
    }
    
    const items = [...wordSequenceItems[question.id]];
    const [reorderedItem] = items.splice(source.index, 1);
    items.splice(destination.index, 0, reorderedItem);
    
    setWordSequenceItems({
      ...wordSequenceItems,
      [question.id]: items
    });
    
    handleAnswer(items);
  };
  
  const renderWordSequence = (question: Question) => {
    if (!question.wordSequence || !wordSequenceItems[question.id]) return null;
    
    return (
      <div className="space-y-4">
        <div className="p-3 rounded-md bg-[#2563EB]/20 text-white/80 text-sm mb-4">
          Drag the items below to arrange them in the correct order.
        </div>
        
        <DragDropContext onDragEnd={(result) => handleWordSequenceDragEnd(result, question)}>
          <Droppable droppableId="word-sequence">
            {(provided) => (
              <div
                ref={provided.innerRef}
                {...provided.droppableProps}
                className="space-y-2"
              >
                {wordSequenceItems[question.id].map((item, index) => (
                  <Draggable key={`${item}-${index}`} draggableId={`${item}-${index}`} index={index}>
                    {(provided, snapshot) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        className={`flex items-center bg-white/10 p-3 rounded-md ${
                          snapshot.isDragging ? 'border-2 border-[#10B981]' : ''
                        }`}
                      >
                        <div 
                          {...provided.dragHandleProps}
                          className="mr-3 text-white/70 hover:text-white/90 cursor-grab"
                        >
                          <GripVertical className="h-5 w-5" />
                        </div>
                        <div className="text-white">
                          {item}
                        </div>
                        <div className="ml-auto bg-white/20 w-7 h-7 rounded-full flex items-center justify-center text-white">
                          {index + 1}
                        </div>
                      </div>
                    )}
                  </Draggable>
                ))}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </DragDropContext>
      </div>
    );
  };
  
  const renderQuestion = (question: Question) => {
    switch (question.type) {
      case 'multiple-choice':
        return renderMultipleChoice(question);
      case 'fill-blank':
        return renderFillBlank(question);
      case 'matching':
        return renderMatching(question);
      case 'unscramble':
        return renderUnscramble(question);
      case 'hidden-word':
        return renderHiddenWord(question);
      case 'true-false':
        return renderTrueFalse(question);
      case 'word-sequence':
        return renderWordSequence(question);
      default:
        return <p className="text-white">Question type not supported yet</p>;
    }
  };

  const renderFeedback = () => {
    const displayCorrectAnswer = () => {
      if (currentQuestion.type === 'matching' && currentQuestion.items) {
        return (
          <div className="mt-3 space-y-2">
            <p className="text-white font-medium mb-2">The correct matches are:</p>
            {currentQuestion.items.map((item, index) => (
              <div key={index} className="flex space-x-2 text-sm bg-white/10 p-2 rounded">
                <span className="text-[#10B981] font-semibold">{item.item}:</span>
                <span className="text-white">{item.match}</span>
              </div>
            ))}
          </div>
        );
      } else {
        return (
          <span className="text-white font-medium">
            Incorrect. The correct answer was: {Array.isArray(currentQuestion.answer) 
              ? currentQuestion.answer.join(', ')
              : currentQuestion.answer}
          </span>
        );
      }
    };
    
    return (
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
              {displayCorrectAnswer()}
            </>
          )}
        </div>
      </div>
    );
  };

  const renderResults = () => {
    // Calculate average time spent per question
    const totalTimeSpent = analytics.reduce((total, item) => total + item.timeSpent, 0);
    const avgTimePerQuestion = Math.round(totalTimeSpent / analytics.length);
    
    // Count flagged and skipped questions
    const flaggedCount = flaggedQuestions.length;
    const skippedCount = skippedQuestions.length;
    
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
        
        <div className="mb-6 flex justify-center gap-8">
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
          
          {(flaggedCount > 0 || skippedCount > 0) && (
            <div className="text-center">
              <p className="text-white/70">Question Status</p>
              <div className="flex items-center gap-2 mt-1">
                {flaggedCount > 0 && (
                  <Badge variant="outline" className="border-yellow-500 text-yellow-500">
                    <Flag className="h-3 w-3 mr-1" />
                    {flaggedCount} Flagged
                  </Badge>
                )}
                {skippedCount > 0 && (
                  <Badge variant="outline" className="border-blue-500 text-blue-500">
                    <SkipForward className="h-3 w-3 mr-1" />
                    {skippedCount} Skipped
                  </Badge>
                )}
              </div>
            </div>
          )}
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
        <div className="flex justify-between items-start mb-4">
          <div className="flex flex-col">
            <div className="flex items-center mb-2">
              {currentQuestion.theme && (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Badge 
                        className={`mr-2 ${
                          currentQuestion.theme === 'math' ? 'bg-green-600/80' : 
                          currentQuestion.theme === 'science' ? 'bg-blue-600/80' : 
                          currentQuestion.theme === 'language' ? 'bg-purple-600/80' : 
                          'bg-amber-600/80'
                        }`}
                      >
                        {currentQuestion.theme === 'math' && <BookOpen className="h-3 w-3 mr-1" />}
                        {currentQuestion.theme === 'science' && <Zap className="h-3 w-3 mr-1" />}
                        {currentQuestion.theme === 'language' && <BookOpen className="h-3 w-3 mr-1" />}
                        {currentQuestion.theme === 'interdisciplinary' && <BookOpen className="h-3 w-3 mr-1" />}
                        {currentQuestion.theme}
                      </Badge>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>This question tests {currentQuestion.theme} concepts</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}
              {flaggedQuestions.includes(currentQuestion.id) && (
                <Badge variant="outline" className="border-yellow-500 text-yellow-500">
                  <Flag className="h-3 w-3 mr-1" />
                  Flagged
                </Badge>
              )}
            </div>
            <h3 className="text-xl font-medium text-white w-full">{currentQuestion.text}</h3>
          </div>
          <div className="flex items-center text-white/70 text-sm whitespace-nowrap ml-4">
            <Clock className="h-4 w-4 mr-1" />
            <span>{Math.floor(timer / 60).toString().padStart(2, '0')}:{(timer % 60).toString().padStart(2, '0')}</span>
          </div>
        </div>
        
        <div className="mt-6">
          {showFeedback ? renderFeedback() : renderQuestion(currentQuestion)}
        </div>
      </Card>

      <div className="flex justify-between items-center">
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            onClick={() => currentQuestionIndex > 0 && setCurrentQuestionIndex(prev => prev - 1)}
            disabled={currentQuestionIndex === 0 || showFeedback}
            className="bg-white/10 hover:bg-white/20 text-white border-transparent"
          >
            Previous
          </Button>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  onClick={handleFlagQuestion}
                  disabled={showFeedback}
                  className={`border-transparent ${
                    flaggedQuestions.includes(currentQuestion.id)
                      ? 'bg-yellow-500/20 text-yellow-500 hover:bg-yellow-500/30'
                      : 'bg-white/10 hover:bg-white/20 text-white'
                  }`}
                >
                  <Flag className="h-4 w-4 mr-2" />
                  {flaggedQuestions.includes(currentQuestion.id) ? 'Unflag' : 'Flag'}
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Mark this question to review later</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
        
        <div className="flex gap-2">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  onClick={handleSkipQuestion}
                  disabled={showFeedback}
                  className="bg-white/10 hover:bg-white/20 text-white border-transparent"
                >
                  <SkipForward className="h-4 w-4 mr-2" />
                  Skip
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Skip this question and come back later</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          <Button 
            onClick={checkAnswer}
            disabled={!answers[currentQuestion.id] || showFeedback}
            className="bg-[#10B981] hover:bg-[#0D9488] text-white"
          >
            Check Answer
          </Button>
        </div>
      </div>
    </div>
  );
}