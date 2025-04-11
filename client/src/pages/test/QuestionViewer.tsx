import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import ChapterQuestions from '@/components/ChapterQuestions';
import { chapterQuestions } from '@/data/chapterQuestions';

export default function QuestionViewer() {
  const [showQuestions, setShowQuestions] = useState(false);
  const [chapterKey, setChapterKey] = useState('8001-4');

  const handleComplete = (analytics: any) => {
    console.log('Question analytics:', analytics);
    setShowQuestions(false);
  };

  const renderChapterSelector = () => {
    return (
      <div className="mb-6 flex flex-wrap gap-2">
        {Object.keys(chapterQuestions).map(key => (
          <Button
            key={key}
            onClick={() => setChapterKey(key)}
            variant={chapterKey === key ? "default" : "outline"}
          >
            {key}
          </Button>
        ))}
      </div>
    );
  };

  return (
    <div className="container py-8">
      <h1 className="text-3xl font-bold text-center mb-8">Question Set Viewer</h1>
      
      {renderChapterSelector()}
      
      {showQuestions ? (
        <ChapterQuestions
          questions={chapterQuestions[chapterKey]}
          onComplete={handleComplete}
          chapterNumber={Number(chapterKey.split('-')[1])}
          onClose={() => setShowQuestions(false)}
        />
      ) : (
        <Card className="p-6 bg-white/5">
          <div className="text-center">
            <h2 className="text-xl font-bold mb-4">Chapter {chapterKey}</h2>
            <p className="mb-4 text-slate-300">{chapterQuestions[chapterKey]?.length || 0} Questions Available</p>
            <Button onClick={() => setShowQuestions(true)}>
              Start Quiz
            </Button>
          </div>
        </Card>
      )}
    </div>
  );
}
