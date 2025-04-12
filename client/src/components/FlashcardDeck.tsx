import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { 
  ArrowLeft, 
  ArrowRight, 
  Bookmark,
  X,
  Volume,
  RefreshCw
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
  const [showDefinition, setShowDefinition] = useState(false);
  
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

  const goToPrevious = () => {
    if (currentIndex > 0) {
      setShowDefinition(false);
      setCurrentIndex(currentIndex - 1);
    }
  };

  const goToNext = () => {
    if (currentIndex < totalWords - 1) {
      setShowDefinition(false);
      setCurrentIndex(currentIndex + 1);
    }
  };

  const toggleView = () => {
    setShowDefinition(!showDefinition);
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
        toggleView();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [currentIndex, showDefinition]);

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="max-w-xl w-full bg-transparent rounded-xl overflow-hidden flex flex-col">
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

        <div className="p-4">
          <div 
            className="flashcard-panel rounded-xl p-4 cursor-pointer mx-auto"
            onClick={toggleView}
            style={{height: '170px'}}
          >
            {!showDefinition ? (
              <div className="h-full flex flex-col justify-between">
                <div className="text-center text-white text-3xl font-bold flex-1 flex items-center justify-center">
                  {currentWord.word}
                </div>
                <div className="text-white/70 text-sm italic text-center mt-2">
                  Click to see definition
                </div>
              </div>
            ) : (
              <div className="h-full flex flex-col justify-between overflow-auto">
                <div>
                  <div className="text-white text-lg mb-2">
                    <span className="font-bold">Definition:</span> {currentWord.definition}
                  </div>
                  <div className="text-white text-lg">
                    <span className="font-bold">Example:</span> <span className="italic">"{currentWord.context}"</span>
                  </div>
                </div>
                <div className="text-white/70 text-sm italic text-center mt-2">
                  Click to see word
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="flex justify-between items-center p-4 bg-gradient-to-t from-black/20 to-transparent">
          <Button 
            variant="ghost" 
            className="text-white hover:bg-white/10"
            onClick={goToPrevious}
            disabled={currentIndex === 0}
          >
            <ArrowLeft className="h-5 w-5 mr-1" />
            <span className="hidden sm:inline">Previous</span>
          </Button>

          <div className="flex space-x-2">
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
              onClick={toggleView}
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
            <span className="hidden sm:inline">Next</span>
            <ArrowRight className="h-5 w-5 ml-1" />
          </Button>
        </div>
      </div>
    </div>
  );
}