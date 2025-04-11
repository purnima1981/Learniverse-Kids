import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import chapterQuestions from '../data/chapterQuestions';

// Add console output to check chapter questions
console.log('Chapters available:', Object.keys(chapterQuestions));
const counts: Record<string, number> = {};
Object.keys(chapterQuestions).forEach(key => {
  counts[key] = chapterQuestions[key]?.length || 0;
});
console.log('Question counts per chapter:', counts);

// Detailed output for chapter 8001-4
if (chapterQuestions['8001-4']) {
  console.log('Tags found in 8001-4:', chapterQuestions['8001-4'].map(q => q.tags));
  console.log('Question types in 8001-4:', chapterQuestions['8001-4'].map(q => q.type));
  console.log('Themes in 8001-4:', chapterQuestions['8001-4'].map(q => q.theme));
}

export default function TestQuestions() {
  const [selectedChapter, setSelectedChapter] = useState('8001-4');
  const [filter, setFilter] = useState<{type?: string, theme?: string, difficulty?: string}>({});
  const [filteredQuestions, setFilteredQuestions] = useState<any[]>([]);
  
  // Get unique question types, themes, and difficulty levels
  const questionTypes = Array.from(new Set(
    Object.values(chapterQuestions).flatMap(questions => 
      questions?.map(q => q.type) || []
    )
  ));
  
  const themes = Array.from(new Set(
    Object.values(chapterQuestions).flatMap(questions => 
      questions?.map(q => q.theme) || []
    )
  ));
  
  const difficultyLevels = Array.from(new Set(
    Object.values(chapterQuestions).flatMap(questions => 
      questions?.map(q => q.difficulty) || []
    )
  ));
  
  // Filter questions when filters or selected chapter changes
  useEffect(() => {
    let questions = chapterQuestions[selectedChapter] || [];
    
    if (filter.type && filter.type !== "_all") {
      questions = questions.filter(q => q.type === filter.type);
    }
    
    if (filter.theme && filter.theme !== "_all") {
      questions = questions.filter(q => q.theme === filter.theme);
    }
    
    if (filter.difficulty && filter.difficulty !== "_all") {
      questions = questions.filter(q => q.difficulty === filter.difficulty);
    }
    
    setFilteredQuestions(questions);
  }, [selectedChapter, filter]);
  
  const renderQuestionCount = () => {
    if (!chapterQuestions[selectedChapter]) {
      return <div className="text-red-500">Chapter not found!</div>;
    }
    
    return (
      <div className="flex gap-4 items-center">
        <div className="text-green-500 font-bold">
          {filteredQuestions.length} questions available {filteredQuestions.length !== (chapterQuestions[selectedChapter]?.length || 0) && 
            `(filtered from ${chapterQuestions[selectedChapter]?.length || 0})`}
        </div>
        
        <Button 
          variant="outline" 
          size="sm"
          onClick={() => setFilter({})}
          className="ml-2"
          disabled={!filter.type && !filter.theme && !filter.difficulty}
        >
          Clear Filters
        </Button>
      </div>
    );
  };
  
  const renderFilters = () => {
    return (
      <div className="grid grid-cols-3 gap-4 mb-4">
        <div>
          <label className="text-sm font-medium mb-1 block">Question Type</label>
          <Select value={filter.type} onValueChange={(value) => setFilter({...filter, type: value})}>
            <SelectTrigger>
              <SelectValue placeholder="All Types" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="_all">All Types</SelectItem>
              {questionTypes.filter(type => type).map(type => (
                <SelectItem key={type} value={type}>{type}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        <div>
          <label className="text-sm font-medium mb-1 block">Theme</label>
          <Select value={filter.theme} onValueChange={(value) => setFilter({...filter, theme: value})}>
            <SelectTrigger>
              <SelectValue placeholder="All Themes" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="_all">All Themes</SelectItem>
              {themes.filter(theme => theme).map(theme => (
                <SelectItem key={theme} value={theme}>{theme}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        <div>
          <label className="text-sm font-medium mb-1 block">Difficulty</label>
          <Select value={filter.difficulty} onValueChange={(value) => setFilter({...filter, difficulty: value})}>
            <SelectTrigger>
              <SelectValue placeholder="All Difficulties" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="_all">All Difficulties</SelectItem>
              {difficultyLevels.filter(level => level).map(level => (
                <SelectItem key={level} value={level}>{level}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
    );
  };
  
  const renderQuestionList = () => {
    if (filteredQuestions.length === 0) {
      return <div className="text-yellow-500 p-4 bg-yellow-950/30 rounded-md">No questions match the current filters</div>;
    }
    
    return (
      <div className="space-y-6 mt-4">
        {filteredQuestions.map((question, index) => (
          <Card key={question.id} className="p-4 bg-gray-800/90 border-gray-700">
            <div className="flex flex-wrap justify-between items-start mb-2 gap-2">
              <div>
                <div className="flex gap-2 mb-2 flex-wrap">
                  <Badge variant="outline" className="bg-gray-700">ID: {question.id}</Badge>
                  <Badge className="bg-slate-600">{question.type}</Badge>
                  <Badge className={getThemeColor(question.theme)}>
                    {question.theme}
                  </Badge>
                  <Badge variant="outline" className={getDifficultyColor(question.difficulty)}>
                    {question.difficulty}
                  </Badge>
                </div>
              </div>
            </div>
            
            <div className="text-white font-medium text-lg mb-3">{question.text}</div>
            
            {renderQuestionDetails(question)}
            
            {question.tags && question.tags.length > 0 && (
              <div className="mt-4 flex gap-1 flex-wrap">
                {question.tags.map((tag: string, i: number) => (
                  <Badge key={i} variant="outline" className="text-xs bg-gray-900/50">
                    {tag}
                  </Badge>
                ))}
              </div>
            )}
          </Card>
        ))}
      </div>
    );
  };
  
  const renderQuestionDetails = (question: any) => {
    switch (question.type) {
      case 'multiple-choice':
        return (
          <div className="mt-2 pl-4 space-y-2 bg-gray-900/50 p-3 rounded-md">
            {question.options?.map((option: string, index: number) => (
              <div key={index} className={`p-2 ${question.answer === String.fromCharCode(97 + index) ? 'text-green-400 bg-green-950/30 border border-green-800/50 rounded-md' : 'border border-gray-700/50 rounded-md'}`}>
                <span className="font-bold mr-2">{String.fromCharCode(97 + index)})</span> {option}
              </div>
            ))}
          </div>
        );
      case 'matching':
        return (
          <div className="mt-2 bg-gray-900/50 p-3 rounded-md">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <div className="font-bold text-blue-400 mb-2">Items:</div>
                {question.items?.map((item: any, index: number) => (
                  <div key={index} className="p-2 border border-gray-700/50 rounded-md">{item.item}</div>
                ))}
              </div>
              <div className="space-y-2">
                <div className="font-bold text-pink-400 mb-2">Matches:</div>
                {question.items?.map((item: any, index: number) => (
                  <div key={index} className="p-2 border border-gray-700/50 rounded-md">{item.match}</div>
                ))}
              </div>
            </div>
            <div className="mt-3 pt-3 border-t border-gray-700">
              <div className="font-bold text-green-400 mb-1">Answer:</div>
              <div className="grid grid-cols-1 gap-1">
                {question.answer.map((pair: string, index: number) => {
                  const [item, match] = pair.split(':');
                  return (
                    <div key={index} className="flex items-center">
                      <div className="bg-blue-900/30 p-1 rounded">{item}</div>
                      <div className="mx-2">→</div>
                      <div className="bg-pink-900/30 p-1 rounded">{match}</div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        );
      case 'fill-blank':
        return (
          <div className="mt-2 bg-gray-900/50 p-3 rounded-md">
            <div className="font-bold text-green-400">Answer:</div>
            <div className="p-2 mt-1 bg-green-950/30 border border-green-800/50 rounded-md">{question.answer}</div>
          </div>
        );
      case 'unscramble':
        return (
          <div className="mt-2 bg-gray-900/50 p-3 rounded-md">
            <div className="font-bold text-orange-400 mb-1">Scrambled:</div>
            <div className="p-2 border border-gray-700/50 rounded-md">{question.letters}</div>
            <div className="font-bold text-green-400 mt-3 mb-1">Answers:</div>
            <div className="flex flex-wrap gap-2">
              {question.answer.map((word: string, index: number) => (
                <div key={index} className="p-2 bg-green-950/30 border border-green-800/50 rounded-md">{word}</div>
              ))}
            </div>
          </div>
        );
      case 'hidden-word':
        return (
          <div className="mt-2 bg-gray-900/50 p-3 rounded-md">
            <div className="font-bold text-blue-400 mb-1">Word Grid:</div>
            <div className="font-mono text-xs p-3 bg-gray-950 rounded-md whitespace-pre">
              {question.grid?.map((row: string) => row + '\n')}
            </div>
            <div className="font-bold text-green-400 mt-3 mb-1">Find words:</div>
            <div className="flex flex-wrap gap-2">
              {question.words?.map((word: string, index: number) => (
                <div key={index} className="p-2 bg-blue-950/30 border border-blue-800/50 rounded-md">{word}</div>
              ))}
            </div>
          </div>
        );
      case 'true-false':
        return (
          <div className="mt-2 bg-gray-900/50 p-3 rounded-md">
            <div className="font-bold text-green-400 mb-1">Answer:</div>
            <div className={`p-2 ${question.answer === 'true' ? 'bg-green-950/30 border border-green-800/50' : 'bg-red-950/30 border border-red-800/50'} rounded-md`}>
              {question.answer === 'true' ? 'TRUE' : 'FALSE'}
            </div>
          </div>
        );
      case 'word-sequence':
        return (
          <div className="mt-2 bg-gray-900/50 p-3 rounded-md">
            <div className="font-bold text-orange-400 mb-1">Scrambled sequence:</div>
            <div className="p-2 border border-gray-700/50 rounded-md">
              {question.wordSequence?.map((word: string, i: number) => (
                <span key={i}>
                  <span>{word}</span>
                  {i < question.wordSequence.length - 1 && <span className="mx-1">→</span>}
                </span>
              ))}
            </div>
            <div className="font-bold text-green-400 mt-3 mb-1">Correct sequence:</div>
            <div className="p-2 bg-green-950/30 border border-green-800/50 rounded-md">
              {question.answer?.map((word: string, i: number) => (
                <span key={i}>
                  <span>{word}</span>
                  {i < question.answer.length - 1 && <span className="mx-1">→</span>}
                </span>
              ))}
            </div>
          </div>
        );
      default:
        return <div className="mt-2 text-yellow-500">Unknown question type: {question.type}</div>;
    }
  };
  
  const getThemeColor = (theme?: string) => {
    switch (theme) {
      case 'math': return 'bg-green-600';
      case 'science': return 'bg-blue-600';
      case 'language': return 'bg-purple-600';
      case 'engineering': return 'bg-orange-600';
      case 'materials': return 'bg-amber-600';
      case 'interdisciplinary': return 'bg-pink-600';
      default: return 'bg-gray-600';
    }
  };
  
  const getDifficultyColor = (difficulty?: string) => {
    switch (difficulty) {
      case 'easy': return 'text-green-400 border-green-500';
      case 'medium': return 'text-yellow-400 border-yellow-500';
      case 'hard': return 'text-red-400 border-red-500';
      default: return 'text-gray-400 border-gray-500';
    }
  };
  
  return (
    <div className="container py-8 max-w-5xl">
      <h1 className="text-3xl font-bold mb-8 text-center">Chapter Questions Test</h1>
      
      <Tabs defaultValue={selectedChapter} onValueChange={setSelectedChapter}>
        <TabsList className="mb-6 w-full flex justify-center">
          {Object.keys(chapterQuestions).map(chapterKey => (
            <TabsTrigger key={chapterKey} value={chapterKey} className="px-4">
              Chapter {chapterKey}
              <Badge variant="outline" className="ml-2">{chapterQuestions[chapterKey]?.length || 0}</Badge>
            </TabsTrigger>
          ))}
        </TabsList>
        
        {Object.keys(chapterQuestions).map(chapterKey => (
          <TabsContent key={chapterKey} value={chapterKey}>
            <Card className="p-6 bg-gray-900/50">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold">Chapter {chapterKey}</h2>
                {renderQuestionCount()}
              </div>
              
              {renderFilters()}
              {renderQuestionList()}
            </Card>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}