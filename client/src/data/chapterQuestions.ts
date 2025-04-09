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
  // For Chapter 1 of story ID 8001 (using questions from the PDF)
  '8001-1': [
    {
      id: 1,
      type: 'multiple-choice',
      text: 'Our average walking speed was:',
      options: ['3.73 mph', '4.2 mph', '3.5 mph', '4.5 mph'],
      answer: 'a',
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
      text: 'Stop signs are shaped like ________ because ________.',
      answer: 'octagons, recognizable from all angles',
    },
    {
      id: 4,
      type: 'multiple-choice',
      text: 'Match the following:\na) Triangular 1) School zone signs\nb) Octagonal 2) Roofs\nc) Pentagonal 3) Stop signs',
      options: ['a-1, b-2, c-3', 'a-2, b-3, c-1', 'a-3, b-1, c-2', 'a-2, b-1, c-3'],
      answer: 'b',
    },
    {
      id: 5,
      type: 'multiple-choice',
      text: 'The area of a triangular roof with a 30-foot base and 12-foot height is:',
      options: ['160 sq ft', '180 sq ft', '200 sq ft', '220 sq ft'],
      answer: 'b',
    },
    {
      id: 6,
      type: 'fill-blank',
      text: 'Wind transfers ______ ______ to wind chimes to create sound.',
      answer: 'kinetic energy',
    },
    {
      id: 7,
      type: 'fill-blank',
      text: 'Unscramble these energy types we discussed:\na) TENTIALPO\nb) TICKING\nc) DINW',
      answer: 'POTENTIAL, KINETIC, WIND',
    },
    {
      id: 8,
      type: 'multiple-choice',
      text: 'When walking up a hill, potential energy:',
      options: ['Increases', 'Decreases', 'Stays the same', 'Becomes kinetic'],
      answer: 'a',
    },
    {
      id: 9,
      type: 'fill-blank',
      text: 'In "The wind is playing us a song," the verb is: ________',
      answer: 'playing',
    },
    {
      id: 10,
      type: 'multiple-choice',
      text: 'Match the following:\na) Crisp 1) Sharp or clear\nb) Gentle 2) Mild or gradual\nc) Melodic 3) Musical or tuneful',
      options: ['a-1, b-2, c-3', 'a-2, b-1, c-3', 'a-3, b-2, c-1', 'a-1, b-3, c-2'],
      answer: 'a',
    },
    {
      id: 11,
      type: 'fill-blank',
      text: 'Unscramble this word used to describe the air: PSICR',
      answer: 'CRISP',
    },
    {
      id: 12,
      type: 'multiple-choice',
      text: 'We started our walk at:',
      options: ['2:15 PM', '2:30 PM', '2:45 PM', '3:00 PM'],
      answer: 'c',
    },
    {
      id: 13,
      type: 'fill-blank',
      text: 'The shape of school zone signs is a _______.',
      answer: 'pentagon',
    },
    {
      id: 14,
      type: 'multiple-choice',
      text: 'Which word best describes the son\'s excitement about sharing knowledge?',
      options: ['Apathetic', 'Enthusiastic', 'Reluctant', 'Indifferent'],
      answer: 'b',
    },
    {
      id: 15,
      type: 'multiple-choice',
      text: 'In the context of the story, "crisp" air most likely means:',
      options: ['Warm and humid', 'Cool and fresh', 'Hot and dry', 'Foggy and damp'],
      answer: 'b',
    },
    {
      id: 16,
      type: 'multiple-choice',
      text: 'The phrase "rich tapestry of mathematical concepts" is an example of:',
      options: ['Simile', 'Metaphor', 'Personification', 'Alliteration'],
      answer: 'b',
    },
    {
      id: 17,
      type: 'multiple-choice',
      text: 'Based on the story, which of the following best describes the relationship between the mother and son?',
      options: ['Distant and formal', 'Competitive and challenging', 'Collaborative and curious', 'Strict and disciplinary'],
      answer: 'c',
    },
    {
      id: 18,
      type: 'fill-blank',
      text: 'The story takes place in the month of _______.',
      answer: 'March',
    },
    {
      id: 19,
      type: 'multiple-choice',
      text: 'What time did the walk end?',
      options: ['3:15 PM', '3:30 PM', '3:45 PM', '4:00 PM'],
      answer: 'b',
    },
    {
      id: 20,
      type: 'multiple-choice',
      text: 'Which word best describes the son\'s demeanor when sharing knowledge about stop signs?',
      options: ['Reticent', 'Ebullient', 'Lethargic', 'Indifferent'],
      answer: 'b',
    }
  ],
  // Add more chapters as needed
};

export default chapterQuestions;