import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence, PanInfo } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { 
  ArrowLeft, 
  ArrowRight, 
  Bookmark,
  X,
  Volume,
  RefreshCw,
  ThumbsUp,
  ThumbsDown
} from 'lucide-react';
import './FlashcardDeck.css';

export type VocabularyWord = {
  word: string;
  definition: string;
  context: string;
};

type FlashcardDeckProps = {
  words: VocabularyWord[];
  onClose: () => void;
  onSave?: (word: VocabularyWord) => void;
};

export default function FlashcardDeck({ words, onClose, onSave }: FlashcardDeckProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [direction, setDirection] = useState<'left' | 'right' | null>(null);
  const constraintsRef = useRef(null);
  
  // Speech synthesis
  const speak = (text: string) => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.9; // Slightly slower for clarity
      window.speechSynthesis.speak(utterance);
    }
  };

  const totalWords = words.length;
  const currentWord = words[currentIndex];

  const handleDragEnd = (_e: MouseEvent, info: PanInfo) => {
    if (info.offset.x < -100) {
      // Swiped left
      goToNext();
    } else if (info.offset.x > 100) {
      // Swiped right
      goToPrevious();
    }
  };

  const goToPrevious = () => {
    if (currentIndex > 0) {
      setFlipped(false);
      setDirection('left');
      setTimeout(() => {
        setCurrentIndex(currentIndex - 1);
      }, 300);
    }
  };

  const goToNext = () => {
    if (currentIndex < totalWords - 1) {
      setFlipped(false);
      setDirection('right');
      setTimeout(() => {
        setCurrentIndex(currentIndex + 1);
      }, 300);
    }
  };

  const toggleFlip = () => {
    setFlipped(!flipped);
  };

  const saveToFlashcards = () => {
    if (onSave) {
      onSave(currentWord);
    }
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') {
        goToPrevious();
      } else if (e.key === 'ArrowRight') {
        goToNext();
      } else if (e.key === ' ' || e.key === 'Enter') {
        toggleFlip();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [currentIndex, flipped]);

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div 
        className="max-w-3xl w-full bg-transparent rounded-xl overflow-hidden flex flex-col"
        ref={constraintsRef}
        style={{maxHeight: '500px'}}
      >
        <div className="flex justify-between items-center p-3">
          <h2 className="text-white text-lg font-bold">
            Vocabulary Flashcards ({currentIndex + 1}/{totalWords})
          </h2>
          <Button 
            variant="ghost" 
            className="text-white hover:bg-white/10"
            onClick={onClose}
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        <div className="relative flex-1 flex justify-center items-center py-3 px-4">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentIndex}
              className="w-full mx-auto" 
              initial={{ 
                opacity: 0, 
                x: direction === 'right' ? 200 : -200
              }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ 
                opacity: 0, 
                x: direction === 'right' ? -200 : 200
              }}
              transition={{ duration: 0.3 }}
              drag="x"
              dragConstraints={constraintsRef}
              onDragEnd={handleDragEnd}
            >
              {/* Simple card-based approach with fixed heights */}
              <div className="w-full">
                {/* Active card - either word or definition based on flip state */}
                <div 
                  className="glass-panel rounded-xl p-5 cursor-pointer transition-all duration-300 border-2 border-blue-300 shadow-lg shadow-blue-500/20 mx-auto max-w-2xl"
                  onClick={toggleFlip}
                  style={{height: '180px'}}
                >
                  {!flipped ? (
                    // Word side
                    <div className="flex flex-col justify-between h-full">
                      <div className="text-center text-white text-3xl font-bold flex-1 flex items-center justify-center">
                        {currentWord.word}
                      </div>
                      <div className="text-white/70 text-sm italic text-center">
                        Click to see definition
                      </div>
                    </div>
                  ) : (
                    // Definition side
                    <div className="flex flex-col justify-between h-full overflow-auto">
                      <div className="flex-1">
                        <div className="text-white text-lg mb-2">
                          <span className="font-bold">Definition:</span> {currentWord.definition}
                        </div>
                        <div className="text-white text-lg">
                          <span className="font-bold">Example:</span> <span className="italic">"{currentWord.context}"</span>
                        </div>
                      </div>
                      <div className="text-white/70 text-sm italic text-center">
                        Click to see word
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        <div className="flex justify-between items-center p-4 bg-gradient-to-t from-black/20 to-transparent">
          <Button 
            variant="ghost" 
            className="text-white hover:bg-white/10"
            onClick={goToPrevious}
            disabled={currentIndex === 0}
          >
            <ArrowLeft className="h-5 w-5 mr-1" />
            Previous
          </Button>

          <div className="flex space-x-3">
            <Button 
              variant="ghost" 
              className="text-white hover:bg-white/10"
              onClick={() => speak(currentWord.word)}
            >
              <Volume className="h-5 w-5" />
            </Button>
            <Button 
              variant="ghost" 
              className="text-white hover:bg-white/10"
              onClick={toggleFlip}
            >
              <RefreshCw className="h-5 w-5" />
            </Button>
            <Button 
              variant="ghost" 
              className="text-white hover:bg-white/10"
              onClick={saveToFlashcards}
            >
              <Bookmark className="h-5 w-5" />
            </Button>
          </div>

          <Button 
            variant="ghost" 
            className="text-white hover:bg-white/10"
            onClick={goToNext}
            disabled={currentIndex === totalWords - 1}
          >
            Next
            <ArrowRight className="h-5 w-5 ml-1" />
          </Button>
        </div>
      </div>
    </div>
  );
}