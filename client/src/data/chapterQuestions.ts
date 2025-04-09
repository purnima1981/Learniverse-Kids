// Sample chapter questions based on the imported questions
export interface Question {
  id: number;
  type: 'multiple-choice' | 'fill-blank' | 'matching' | 'unscramble';
  text: string;
  options?: string[];
  items?: { item: string; match: string }[];
  letters?: string;
  answer: string | number | string[];
}

export type ChapterQuestionsMap = {
  [key: string]: Question[];
};

export const chapterQuestions: ChapterQuestionsMap = {
  // For Chapter 1 of story ID 8001
  '8001-1': [
    {
      id: 1,
      type: 'multiple-choice',
      text: 'Our average walking speed was:',
      options: ['3.73 mph', '4.2 mph', '3.5 mph', '4.5 mph'],
      answer: 'c',
    },
    {
      id: 2,
      type: 'multiple-choice',
      text: '2.8 miles is approximately:',
      options: ['3.5 km', '4.5 km', '5.5 km', '6.5 km'],
      answer: 'b',
    },
    {
      id: 3,
      type: 'fill-blank',
      text: 'Stop signs are shaped like ________ because they need to be recognizable from all angles.',
      answer: 'octagons',
    },
    {
      id: 4,
      type: 'multiple-choice',
      text: 'The shape of school zone signs is a:',
      options: ['Triangle', 'Rectangle', 'Pentagon', 'Hexagon'],
      answer: 'c',
    },
    {
      id: 5,
      type: 'multiple-choice',
      text: 'We started our walk at:',
      options: ['2:15 PM', '2:30 PM', '2:45 PM', '3:00 PM'],
      answer: 'c',
    },
    {
      id: 6,
      type: 'multiple-choice',
      text: 'Wind transfers ______ energy to wind chimes to create sound.',
      options: ['Thermal', 'Kinetic', 'Potential', 'Electric'],
      answer: 'b',
    },
    {
      id: 7,
      type: 'multiple-choice',
      text: 'In the context of the story, "crisp" air most likely means:',
      options: ['Warm and humid', 'Cool and fresh', 'Hot and dry', 'Foggy and damp'],
      answer: 'b',
    },
    {
      id: 8,
      type: 'multiple-choice',
      text: 'The story takes place in the month of:',
      options: ['January', 'March', 'June', 'September'],
      answer: 'b',
    },
    {
      id: 9,
      type: 'multiple-choice',
      text: 'When walking up a hill, potential energy:',
      options: ['Increases', 'Decreases', 'Stays the same', 'Becomes kinetic'],
      answer: 'a',
    },
    {
      id: 10,
      type: 'multiple-choice',
      text: 'Based on the story, which of the following best describes the relationship between the mother and son?',
      options: ['Distant and formal', 'Competitive and challenging', 'Collaborative and curious', 'Strict and disciplinary'],
      answer: 'c',
    },
  ],
  // Add more chapters as needed
};

export default chapterQuestions;