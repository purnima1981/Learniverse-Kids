import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { MicrogameConfig, UserAnswer, checkAnswer } from "@/lib/microgame-service";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import { GripVertical, ArrowDown, ArrowUp, CheckCircle2 } from "lucide-react";

interface ArrangeGameProps {
  items: string[];
  correctOrder: string[];
  config?: MicrogameConfig;
  onAnswer: (answer: UserAnswer) => void;
  onComplete: (answers: UserAnswer[]) => void;
}

const ArrangeGame: React.FC<ArrangeGameProps> = ({
  items,
  correctOrder,
  config,
  onAnswer,
  onComplete,
}) => {
  const [arrangedItems, setArrangedItems] = useState<string[]>([]);
  const [submitted, setSubmitted] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);

  useEffect(() => {
    // Initialize with shuffled items
    setArrangedItems([...items].sort(() => Math.random() - 0.5));
  }, [items]);

  const handleDragEnd = (result: any) => {
    if (!result.destination) return;

    const reorderedItems = [...arrangedItems];
    const [movedItem] = reorderedItems.splice(result.source.index, 1);
    reorderedItems.splice(result.destination.index, 0, movedItem);

    setArrangedItems(reorderedItems);
  };

  const moveItem = (index: number, direction: 'up' | 'down') => {
    if (
      (direction === 'up' && index === 0) ||
      (direction === 'down' && index === arrangedItems.length - 1)
    ) {
      return;
    }

    const newItems = [...arrangedItems];
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    
    [newItems[index], newItems[newIndex]] = [newItems[newIndex], newItems[index]];
    setArrangedItems(newItems);
  };

  const handleSubmit = () => {
    const correct = checkAnswer(arrangedItems, correctOrder);
    setIsCorrect(correct);
    setSubmitted(true);

    const answer: UserAnswer = {
      userAnswer: arrangedItems,
      isCorrect: correct,
    };

    onAnswer(answer);
    onComplete([answer]);
  };

  return (
    <div className="p-4 md:p-6">
      <h3 className="text-xl font-semibold mb-4">Arrange in the correct order:</h3>
      
      {submitted ? (
        <div className="mb-6">
          <div className="flex items-center mb-4">
            <CheckCircle2 className={`w-6 h-6 mr-2 ${isCorrect ? 'text-green-500' : 'text-red-500'}`} />
            <h4 className="text-lg font-medium">
              {isCorrect ? 'Correct order!' : 'Not quite right'}
            </h4>
          </div>
          
          <div className="space-y-2">
            <h5 className="font-medium">Correct order:</h5>
            {correctOrder.map((item, index) => (
              <div
                key={`correct-${index}`}
                className="p-3 bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 rounded-lg"
              >
                <div className="flex items-center">
                  <span className="w-6 h-6 flex items-center justify-center rounded-full bg-green-500 text-white mr-3">
                    {index + 1}
                  </span>
                  <span>{item}</span>
                </div>
              </div>
            ))}
          </div>
          
          {!isCorrect && (
            <div className="mt-4 space-y-2">
              <h5 className="font-medium">Your order:</h5>
              {arrangedItems.map((item, index) => (
                <div
                  key={`your-${index}`}
                  className={`p-3 border rounded-lg ${
                    item === correctOrder[index]
                      ? 'bg-green-50 dark:bg-green-950 border-green-200 dark:border-green-800'
                      : 'bg-red-50 dark:bg-red-950 border-red-200 dark:border-red-800'
                  }`}
                >
                  <div className="flex items-center">
                    <span className={`w-6 h-6 flex items-center justify-center rounded-full mr-3 text-white ${
                      item === correctOrder[index] ? 'bg-green-500' : 'bg-red-500'
                    }`}>
                      {index + 1}
                    </span>
                    <span>{item}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        <div className="mb-6">
          <p className="text-gray-600 dark:text-gray-300 mb-4">
            Drag and drop the items or use the arrow buttons to arrange them in the correct order.
          </p>
          
          <DragDropContext onDragEnd={handleDragEnd}>
            <Droppable droppableId="arrangeable-items">
              {(provided) => (
                <div
                  {...provided.droppableProps}
                  ref={provided.innerRef}
                  className="space-y-2"
                >
                  {arrangedItems.map((item, index) => (
                    <Draggable key={item} draggableId={item} index={index}>
                      {(provided) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          className="p-3 bg-white dark:bg-gray-850 border border-gray-200 dark:border-gray-700 rounded-lg"
                        >
                          <div className="flex items-center">
                            <div {...provided.dragHandleProps} className="mr-3 text-gray-400">
                              <GripVertical className="w-5 h-5" />
                            </div>
                            <span className="flex-grow">{item}</span>
                            <div className="flex space-x-1">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => moveItem(index, 'up')}
                                disabled={index === 0}
                                className="h-8 w-8 p-0"
                              >
                                <ArrowUp className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => moveItem(index, 'down')}
                                disabled={index === arrangedItems.length - 1}
                                className="h-8 w-8 p-0"
                              >
                                <ArrowDown className="h-4 w-4" />
                              </Button>
                            </div>
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
      )}
      
      {!submitted ? (
        <div className="flex justify-end">
          <Button onClick={handleSubmit}>Submit Answer</Button>
        </div>
      ) : (
        <div className="flex justify-end">
          <Button onClick={() => onComplete([{ userAnswer: arrangedItems, isCorrect }])}>
            Continue
          </Button>
        </div>
      )}
    </div>
  );
};

export default ArrangeGame;