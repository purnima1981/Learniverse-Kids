import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import chapterQuestions from '../data/chapterQuestions';

export default function TestQuestions() {
  const [selectedChapter, setSelectedChapter] = useState('8001-4');
  
  const renderQuestionCount = () => {
    if (!chapterQuestions[selectedChapter]) {
      return <div className="text-red-500">Chapter not found!</div>;
    }
    
    return (
      <div className="text-green-500 font-bold">
        {chapterQuestions[selectedChapter].length} questions available
      </div>
    );
  };
  
  const renderQuestionList = () => {
    if (!chapterQuestions[selectedChapter]) {
      return <div className="text-red-500">No questions found for this chapter</div>;
    }
    
    return (
      <div className="space-y-4 mt-4">
        {chapterQuestions[selectedChapter].map((question, index) => (
          <Card key={question.id} className="p-4 bg-gray-800">
            <div className="flex justify-between mb-2">
              <div className="flex gap-2">
                <span className="px-2 py-1 bg-gray-700 rounded">ID: {question.id}</span>
                <span className="px-2 py-1 bg-gray-700 rounded">Type: {question.type}</span>
                <span className={`px-2 py-1 rounded ${getThemeColor(question.theme)}`}>
                  Theme: {question.theme}
                </span>
              </div>
              <span className="px-2 py-1 bg-gray-700 rounded">Difficulty: {question.difficulty}</span>
            </div>
            <div className="text-white font-medium">{question.text}</div>
            {renderQuestionDetails(question)}
            <div className="mt-2 text-xs text-gray-400">
              Tags: {question.tags?.join(', ')}
            </div>
          </Card>
        ))}
      </div>
    );
  };
  
  const renderQuestionDetails = (question: any) => {
    switch (question.type) {
      case 'multiple-choice':
        return (
          <div className="mt-2 pl-4 space-y-1">
            {question.options?.map((option: string, index: number) => (
              <div key={index} className={question.answer === String.fromCharCode(97 + index) ? 'text-green-400' : ''}>
                {String.fromCharCode(97 + index)}) {option}
              </div>
            ))}
          </div>
        );
      case 'matching':
        return (
          <div className="mt-2 grid grid-cols-2 gap-2">
            <div className="space-y-1">
              <div className="font-bold">Items:</div>
              {question.items?.map((item: any, index: number) => (
                <div key={index}>{item.item}</div>
              ))}
            </div>
            <div className="space-y-1">
              <div className="font-bold">Matches:</div>
              {question.items?.map((item: any, index: number) => (
                <div key={index}>{item.match}</div>
              ))}
            </div>
          </div>
        );
      case 'fill-blank':
        return (
          <div className="mt-2">
            <div className="font-bold">Answer: {question.answer}</div>
          </div>
        );
      case 'unscramble':
        return (
          <div className="mt-2">
            <div>Scrambled: {question.letters}</div>
            <div className="font-bold">Answers: {question.answer.join(', ')}</div>
          </div>
        );
      case 'hidden-word':
        return (
          <div className="mt-2">
            <div className="font-mono text-xs whitespace-pre">
              {question.grid?.map((row: string) => row + '\n')}
            </div>
            <div className="font-bold mt-1">Find words: {question.words?.join(', ')}</div>
          </div>
        );
      case 'true-false':
        return (
          <div className="mt-2">
            <div className="font-bold">Answer: {question.answer}</div>
          </div>
        );
      case 'word-sequence':
        return (
          <div className="mt-2">
            <div>Scrambled sequence: {question.wordSequence?.join(' → ')}</div>
            <div className="font-bold mt-1">Correct sequence: {question.answer?.join(' → ')}</div>
          </div>
        );
      default:
        return null;
    }
  };
  
  const getThemeColor = (theme?: string) => {
    switch (theme) {
      case 'math': return 'bg-green-700';
      case 'science': return 'bg-blue-700';
      case 'language': return 'bg-purple-700';
      case 'engineering': return 'bg-orange-700';
      case 'materials': return 'bg-amber-700';
      case 'interdisciplinary': return 'bg-pink-700';
      default: return 'bg-gray-700';
    }
  };
  
  return (
    <div className="container py-8">
      <h1 className="text-3xl font-bold mb-6">Chapter Questions Test</h1>
      
      <div className="mb-6">
        <Tabs defaultValue={selectedChapter} onValueChange={setSelectedChapter}>
          <TabsList className="mb-4">
            {Object.keys(chapterQuestions).map(chapterKey => (
              <TabsTrigger key={chapterKey} value={chapterKey}>
                Chapter {chapterKey}
              </TabsTrigger>
            ))}
          </TabsList>
          
          {Object.keys(chapterQuestions).map(chapterKey => (
            <TabsContent key={chapterKey} value={chapterKey}>
              <Card className="p-4">
                <h2 className="text-xl font-bold mb-2">Chapter {chapterKey}</h2>
                {renderQuestionCount()}
                {renderQuestionList()}
              </Card>
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </div>
  );
}