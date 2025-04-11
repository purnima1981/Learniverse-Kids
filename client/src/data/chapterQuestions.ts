// Sample chapter questions based on the imported questions
export interface Question {
  id: number;
  type: 'multiple-choice' | 'fill-blank' | 'matching' | 'unscramble';
  text: string;
  options?: string[];
  items?: { item: string; match: string }[];
  letters?: string;
  answer: string | number | string[];
  theme?: 'math' | 'science' | 'language' | 'interdisciplinary';
  difficulty?: 'easy' | 'medium' | 'hard';
}

export type ChapterQuestionsMap = {
  [key: string]: Question[];
};

export const chapterQuestions: ChapterQuestionsMap = {
  // For Chapter 1 of story ID 8001 - Ethan's Walk story with new question set
  '8001-1': [
    {
      id: 1,
      type: 'multiple-choice',
      text: 'Ethan jogged downhill at 6 mph for 0.4 miles. How many minutes did that take?',
      options: ['3 minutes', '4 minutes', '5 minutes', '6 minutes'],
      answer: 'b',
    },
    {
      id: 2,
      type: 'multiple-choice',
      text: 'What kind of energy does the wind transfer to the chimes to create sound?',
      options: ['Thermal energy', 'Kinetic energy', 'Nuclear energy', 'Chemical energy'],
      answer: 'b',
    },
    {
      id: 3,
      type: 'multiple-choice',
      text: 'What happens to potential energy when Ethan walks downhill?',
      options: ['It increases', 'It decreases', 'It stays the same', 'It multiplies'],
      answer: 'b',
    },
    {
      id: 4,
      type: 'multiple-choice',
      text: 'If Ethan\'s average walking speed was 3.73 mph, how long would he take to walk 5 miles?',
      options: ['About 1 hour', 'About 1 hour and 15 minutes', 'About 1 hour and 20 minutes', 'About 1 hour and 30 minutes'],
      answer: 'c',
    },
    {
      id: 5,
      type: 'multiple-choice',
      text: 'What is the area of a triangle-shaped roof with base 10 ft and height 5 ft?',
      options: ['25 sq ft', '30 sq ft', '40 sq ft', '50 sq ft'],
      answer: 'a',
    },
    {
      id: 6,
      type: 'multiple-choice',
      text: 'Why are so many roofs shaped like triangles?',
      options: ['They look better', 'They are easier to build', 'They shed water and snow effectively', 'They use less material'],
      answer: 'c',
    },
    {
      id: 7,
      type: 'multiple-choice',
      text: 'Which word best describes Ethan\'s personality during the walk?',
      options: ['Curious', 'Bored', 'Tired', 'Anxious'],
      answer: 'a',
    },
    {
      id: 8,
      type: 'multiple-choice',
      text: 'What is the total duration of Ethan and Mom\'s walk if they left at 2:45 PM and returned at 3:30 PM?',
      options: ['30 minutes', '45 minutes', '60 minutes', '75 minutes'],
      answer: 'b',
    },
    {
      id: 9,
      type: 'multiple-choice',
      text: 'Which force did Ethan feel when he leaned into the wind?',
      options: ['Gravity', 'Air resistance', 'Friction', 'Magnetic force'],
      answer: 'b',
    },
    {
      id: 10,
      type: 'fill-blank',
      text: 'What is Ethan demonstrating by observing shapes, energy, and materials during a walk?',
      answer: 'interdisciplinary thinking',
    },
    {
      id: 11,
      type: 'multiple-choice',
      text: 'If Ethan and Mom walked the same pace but took a 10-minute break, what was their total time outside?',
      options: ['35 minutes', '45 minutes', '55 minutes', '65 minutes'],
      answer: 'c',
    },
    {
      id: 12,
      type: 'multiple-choice',
      text: 'Why is glass used for windows instead of wood?',
      options: ['It\'s more durable', 'It allows light to pass through', 'It\'s cheaper', 'It\'s easier to install'],
      answer: 'b',
    },
    {
      id: 13,
      type: 'fill-blank',
      text: 'What shape results if a square is split from corner to corner?',
      answer: 'triangles',
    },
    {
      id: 14,
      type: 'multiple-choice',
      text: 'What type of energy increases as Ethan and Mom walk uphill?',
      options: ['Kinetic energy', 'Thermal energy', 'Potential energy', 'Sound energy'],
      answer: 'c',
    },
    {
      id: 15,
      type: 'fill-blank',
      text: 'What word means the same as \'coarse\' in the phrase \'wood feels coarse\'?',
      answer: 'rough',
    },
    {
      id: 16,
      type: 'multiple-choice',
      text: 'If Ethan made 4 equal stops along the 2.8-mile walk, how far apart were the stops?',
      options: ['0.56 miles', '0.7 miles', '1.4 miles', '2.0 miles'],
      answer: 'b',
    },
    {
      id: 17,
      type: 'fill-blank',
      text: 'Potential Energy is to Height as Kinetic Energy is to ___?',
      answer: 'motion',
    },
    {
      id: 18,
      type: 'fill-blank',
      text: 'How did the wind cause the wind chimes to make music?',
      answer: 'transferring kinetic energy',
    },
    {
      id: 19,
      type: 'multiple-choice',
      text: 'What emotion is shown when \'Ethan\'s eyes sparkled with enthusiasm\'?',
      options: ['Sadness', 'Excitement', 'Anger', 'Frustration'],
      answer: 'b',
    },
    {
      id: 20,
      type: 'matching',
      text: 'Match the object to its shape:',
      items: [
        { item: 'Stop sign', match: 'Octagon' },
        { item: 'School zone sign', match: 'Pentagon' },
        { item: 'Roof', match: 'Triangle' }
      ],
      answer: ['Stop sign:Octagon', 'School zone sign:Pentagon', 'Roof:Triangle'],
    },
  ],
  // For Chapter 2 of story ID 8001 - Additional questions from the set
  '8001-2': [
    {
      id: 1,
      type: 'multiple-choice',
      text: 'Which of these best describes air resistance?',
      options: ['A force that pushes objects upward', 'A force that opposes motion through air', 'A force that makes objects heavier', 'A force that generates heat'],
      answer: 'b',
    },
    {
      id: 2,
      type: 'multiple-choice',
      text: 'What literary technique is shown in the phrase \'sparkled with enthusiasm\'?',
      options: ['Metaphor', 'Simile', 'Imagery', 'Alliteration'],
      answer: 'c',
    },
    {
      id: 3,
      type: 'multiple-choice',
      text: 'What is special about the triangles formed when splitting a rectangle diagonally?',
      options: ['They are scalene', 'They are isosceles', 'They are equilateral', 'They are right-angled'],
      answer: 'd',
    },
    {
      id: 4,
      type: 'multiple-choice',
      text: 'Which triangle has all sides and angles equal?',
      options: ['Scalene', 'Isosceles', 'Equilateral', 'Right-angled'],
      answer: 'c',
    },
    {
      id: 5,
      type: 'multiple-choice',
      text: 'What material would best resist weather for a stop sign?',
      options: ['Paper', 'Wood', 'Metal', 'Plastic'],
      answer: 'c',
    },
    {
      id: 6,
      type: 'multiple-choice',
      text: 'Why are triangles the strongest shape for building structures?',
      options: ['They use less material', 'They are easiest to build', 'They can\'t be deformed without changing side lengths', 'They look more appealing'],
      answer: 'c',
    },
    {
      id: 7,
      type: 'multiple-choice',
      text: 'If the wind doubled in speed, how might the wind chimes\' sound change?',
      options: ['Become quieter', 'Become louder', 'Stay exactly the same', 'Disappear completely'],
      answer: 'b',
    },
    {
      id: 8,
      type: 'multiple-choice',
      text: 'Why are stop signs designed as octagons?',
      options: ['To be unique from other signs', 'To be recognizable from any angle', 'To minimize material used', 'To withstand strong winds'],
      answer: 'b',
    },
    {
      id: 9,
      type: 'multiple-choice',
      text: 'What is the perimeter of a rectangular window that is 4 feet tall and 3 feet wide?',
      options: ['7 feet', '12 feet', '14 feet', '16 feet'],
      answer: 'c',
    },
    {
      id: 10,
      type: 'multiple-choice',
      text: 'When Ethan rolls a rock down the hill, what kind of energy conversion occurs?',
      options: ['Chemical to thermal', 'Potential to kinetic', 'Thermal to sound', 'Kinetic to potential'],
      answer: 'b',
    },
    {
      id: 11,
      type: 'multiple-choice',
      text: 'Which of these is an example of potential energy?',
      options: ['A moving car', 'A flying bird', 'A book on a high shelf', 'A ringing bell'],
      answer: 'c',
    },
    {
      id: 12,
      type: 'multiple-choice',
      text: 'If Ethan and Mom walked uphill for 1.2 miles and downhill for 1.6 miles, what fraction of their journey was uphill?',
      options: ['3/7', '3/8', '2/7', '2/5'],
      answer: 'b',
    },
    {
      id: 13,
      type: 'multiple-choice',
      text: 'What is the perimeter of a square sidewalk tile with side length 2 ft?',
      options: ['4 ft', '6 ft', '8 ft', '10 ft'],
      answer: 'c',
    },
    {
      id: 14,
      type: 'multiple-choice',
      text: 'When we say "The wind is playing us a song," what literary device is being used?',
      options: ['Metaphor', 'Personification', 'Hyperbole', 'Onomatopoeia'],
      answer: 'b',
    },
    {
      id: 15,
      type: 'multiple-choice',
      text: 'If the rhombus Ethan drew had diagonals of 10 in. and 6 in., what is its area?',
      options: ['20 sq in.', '30 sq in.', '40 sq in.', '60 sq in.'],
      answer: 'b',
    },
    {
      id: 16,
      type: 'multiple-choice',
      text: 'Ethan and Mom walked 2.8 miles in 45 minutes. What was their average speed in miles per hour?',
      options: ['3.2 mph', '3.5 mph', '3.73 mph', '4.0 mph'],
      answer: 'c',
    },
    {
      id: 17,
      type: 'multiple-choice',
      text: 'What is the correct sequence of energy transfer in wind chimes?',
      options: ['Wind → Chimes → Sound', 'Sound → Wind → Chimes', 'Chimes → Wind → Sound', 'Wind → Sound → Chimes'],
      answer: 'a',
    },
    {
      id: 18,
      type: 'multiple-choice',
      text: 'What property makes rhombuses important in geometry?',
      options: ['They have four equal sides', 'They have only right angles', 'They are always squares', 'They can\'t be divided into triangles'],
      answer: 'a',
    },
    {
      id: 19,
      type: 'multiple-choice',
      text: 'Why do writers use personification in their writing?',
      options: ['To confuse readers', 'To make non-human things relatable', 'To avoid using similes', 'To follow grammar rules'],
      answer: 'b',
    },
    {
      id: 20,
      type: 'multiple-choice',
      text: 'When a diagonal splits a rhombus, what special property do the triangles have?',
      options: ['They are different sizes', 'They are congruent', 'They are always scalene', 'They are always obtuse'],
      answer: 'b',
    },
  ],
  // Chapter 3 with the remaining questions
  '8001-3': [
    {
      id: 1,
      type: 'multiple-choice',
      text: 'If Ethan walked 2.8 miles and took 5600 steps, what is his average stride length in feet? (1 mile = 5280 ft)',
      options: ['2.1 feet', '2.5 feet', '2.8 feet', '3.0 feet'],
      answer: 'b',
    },
    {
      id: 2,
      type: 'unscramble',
      text: 'Unscramble these energy types we discussed:\nTENTIALPO, TICKNIGE, DINW',
      letters: 'POTENTIALLINETICIGWINDKETIQ',
      answer: ['POTENTIAL', 'KINETIC', 'WIND'],
    },
    {
      id: 3,
      type: 'multiple-choice',
      text: 'In the phrase "Ethan observed the world with careful attention", which word best describes his approach to learning?',
      options: ['Casual', 'Methodical', 'Haphazard', 'Disinterested'],
      answer: 'b',
    },
    {
      id: 4,
      type: 'matching',
      text: 'Match each energy type with its definition:',
      items: [
        { item: 'Potential energy', match: 'Stored energy due to position' },
        { item: 'Kinetic energy', match: 'Energy of motion' },
        { item: 'Thermal energy', match: 'Energy related to temperature' }
      ],
      answer: ['Potential energy:Stored energy due to position', 'Kinetic energy:Energy of motion', 'Thermal energy:Energy related to temperature'],
    },
    {
      id: 5,
      type: 'multiple-choice',
      text: 'If the wind transfers energy to the chimes, what principle of physics is demonstrated?',
      options: ['Conservation of matter', 'Conservation of energy', 'Newton\'s first law', 'Law of reflection'],
      answer: 'b',
    },
    {
      id: 6,
      type: 'fill-blank',
      text: 'The concept of studying the world through multiple subjects, like Ethan does on his walk, is called _______.',
      answer: 'interdisciplinary learning',
    },
    {
      id: 7,
      type: 'matching',
      text: 'Match each shape with its property:',
      items: [
        { item: 'Triangle', match: 'Most stable simple shape' },
        { item: 'Rectangle', match: 'Has four right angles' },
        { item: 'Circle', match: 'All points equidistant from center' }
      ],
      answer: ['Triangle:Most stable simple shape', 'Rectangle:Has four right angles', 'Circle:All points equidistant from center'],
    },
    {
      id: 8,
      type: 'fill-blank',
      text: 'When we calculate the area of a triangle using the formula A = (1/2)bh, the "b" stands for _______ and "h" stands for _______.',
      answer: 'base, height',
    },
    {
      id: 9,
      type: 'multiple-choice',
      text: 'What physics concept explains why walking uphill feels harder than walking on flat ground?',
      options: ['Momentum', 'Friction', 'Gravity', 'Inertia'],
      answer: 'c',
    },
    {
      id: 10,
      type: 'multiple-choice',
      text: 'What would be the most appropriate title for a story about Ethan\'s walk?',
      options: ['Fun with Math', 'The Science of Walking', 'Learning Through Everyday Experiences', 'A Day in the Life'],
      answer: 'c',
    },
  ],
  // Add more chapters as needed
};

export default chapterQuestions;