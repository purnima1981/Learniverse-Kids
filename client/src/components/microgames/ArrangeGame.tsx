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
    const shuffled = [...items].sort(() => Math.random() - 0.5);
    
    // Make sure the shuffled order is different from the correct order
    // This prevents the rare case where random shuffling results in the correct order
    const isIdentical = JSON.stringify(shuffled) === JSON.stringify(correctOrder);
    
    if (isIdentical && items.length > 1) {
      // If they're identical, swap the first two elements
      [shuffled[0], shuffled[1]] = [shuffled[1], shuffled[0]];
    }
    
    console.log("ArrangeGame initialized:", { 
      correctOrder, 
      shuffledOrder: shuffled,
      areIdentical: isIdentical
    });
    
    setArrangedItems(shuffled);
  }, [items, correctOrder]);

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
    // Check if the arranged items match the correct order
    console.log("Checking arranged items:", arrangedItems);
    console.log("Against correct order:", correctOrder);
    
    // Compare arrays 
    const correct = JSON.stringify(arrangedItems) === JSON.stringify(correctOrder);
    console.log("Is correct:", correct);
    
    setIsCorrect(correct);
    setSubmitted(true);

    const answer: UserAnswer = {
      userAnswer: arrangedItems,
      isCorrect: correct,
    };

    onAnswer(answer);
    
    // We don't auto-complete here, allowing the user to see the correct arrangement
    // onComplete([answer]);
  };

  return (
    <div className="p-4 md:p-6">
      <h3 className="text-xl font-semibold mb-4 text-blue-600 dark:text-blue-400">Arrange in the Correct Order</h3>
      
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
          <div className="bg-blue-50 dark:bg-blue-900/30 p-4 rounded-lg mb-4 border border-blue-200 dark:border-blue-800">
            <h4 className="font-medium text-blue-700 dark:text-blue-300 mb-2">Instructions:</h4>
            <p className="text-gray-600 dark:text-gray-300">
              Arrange the words in the correct order. You can:
            </p>
            <ul className="list-disc pl-5 mt-2 text-gray-600 dark:text-gray-300">
              <li>Drag and drop items using the grip handle</li>
              <li>Use the up/down arrow buttons to move items</li>
            </ul>
            <p className="mt-2 text-sm italic text-gray-500 dark:text-gray-400">
              The goal is to put all items in their logical sequence.
            </p>
          </div>
          
          <DragDropContext onDragEnd={handleDragEnd}>
            <Droppable droppableId="arrangeable-items">
              {(provided) => (
                <div
                  {...provided.droppableProps}
                  ref={provided.innerRef}
                  className="space-y-2"
                >
                  {arrangedItems.map((item, index) => {
                    // Create a unique draggable ID that includes both the item and its position 
                    // This ensures unique keys even when words are repeated
                    const draggableId = `item-${index}-${item.replace(/\s+/g, '-')}`;
                    return (
                      <Draggable key={draggableId} draggableId={draggableId} index={index}>
                        {(provided) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            className="p-3 relative bg-white dark:bg-gray-850 border-2 border-blue-200 dark:border-blue-700 rounded-lg shadow-sm hover:shadow-md transition-all duration-200 transform hover:-translate-y-1"
                          >
                            <div className="flex items-center">
                              <div 
                                {...provided.dragHandleProps} 
                                className="mr-3 flex items-center justify-center bg-blue-100 dark:bg-blue-800 text-blue-500 dark:text-blue-300 p-1.5 rounded-md cursor-grab active:cursor-grabbing"
                              >
                                <GripVertical className="w-5 h-5" />
                              </div>
                              <span className="flex-grow font-medium">{item}</span>
                              <div className="flex space-x-1.5">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => moveItem(index, 'up')}
                                  disabled={index === 0}
                                  className={`h-8 w-8 p-0 rounded-full ${index === 0 ? 'opacity-50' : 'bg-blue-50 border-blue-200 hover:bg-blue-100 dark:bg-blue-900 dark:border-blue-700'}`}
                                >
                                  <ArrowUp className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => moveItem(index, 'down')}
                                  disabled={index === arrangedItems.length - 1}
                                  className={`h-8 w-8 p-0 rounded-full ${index === arrangedItems.length - 1 ? 'opacity-50' : 'bg-blue-50 border-blue-200 hover:bg-blue-100 dark:bg-blue-900 dark:border-blue-700'}`}
                                >
                                  <ArrowDown className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                            {/* Position indicator */}
                            <div className="absolute -left-2 top-1/2 transform -translate-y-1/2 w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center text-xs text-white font-bold border-2 border-white dark:border-gray-800">
                              {index + 1}
                            </div>
                          </div>
                        )}
                      </Draggable>
                    );
                  })}
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