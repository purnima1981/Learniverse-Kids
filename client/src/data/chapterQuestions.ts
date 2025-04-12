// Sample chapter questions based on the imported questions
export interface Question {
  id: number;
  type: 'multiple-choice' | 'fill-blank' | 'matching' | 'unscramble' | 'hidden-word' | 'word-sequence' | 'true-false';
  text: string;
  // Properties for multiple choice questions
  options?: string[];
  // Properties for matching questions
  items?: { item: string; match: string }[];
  // Properties for unscramble questions
  letters?: string;
  // Properties for hidden-word questions
  grid?: string[];
  words?: string[];
  // Properties for word-sequence questions
  wordSequence?: string[];
  // Common properties for all question types
  answer: string | string[];
  theme?: string;
  difficulty?: 'easy' | 'medium' | 'hard';
  tags?: string[];
  explanation?: string;
}

export interface ChapterQuestionsMap {
  [key: string]: Question[];
}

export const chapterQuestions: ChapterQuestionsMap = {
  // For Chapter 1 of story ID 8001 - Ethan's Walk story with new question set
  '8001-1': [
    // Level 1: Geometry Explorer
    {
      id: 1,
      type: 'multiple-choice',
      text: 'Stop signs are shaped as octagons because:',
      options: ['They\'re easier to make than circles', 'The unique shape is recognizable even when partially covered or at night', 'Octagons use less material than circles', 'They\'re less likely to roll away if knocked down'],
      answer: 'b',
      theme: 'math',
      difficulty: 'easy',
      tags: ['GEOMETRY', 'REAL-WORLD SHAPES', 'CRITICAL THINKING', 'EVERYDAY MATH']
    },
    {
      id: 2,
      type: 'matching',
      text: 'Match the Shape with its real-world example from Ethan\'s walk:',
      items: [
        { item: 'Triangle', match: 'Roof' },
        { item: 'Rhombus', match: 'Construction warning sign' },
        { item: 'Pentagon', match: 'School zone sign' },
        { item: 'Octagon', match: 'Stop sign' }
      ],
      answer: ['triangle=roof', 'rhombus=construction warning sign', 'pentagon=school zone sign', 'octagon=stop sign'],
      theme: 'math',
      difficulty: 'easy',
      tags: ['GEOMETRY', 'SHAPE RECOGNITION', 'VISUAL MATCHING', 'SPATIAL REASONING']
    },
    {
      id: 3,
      type: 'unscramble',
      text: 'Unscramble these geometric shapes mentioned in Ethan\'s walk:',
      letters: 'GONACOT GLITRANE BOMSHUR GONTAPEN',
      answer: ['OCTAGON', 'TRIANGLE', 'RHOMBUS', 'PENTAGON'],
      theme: 'math',
      difficulty: 'medium',
      tags: ['GEOMETRY', 'VOCABULARY', 'WORD DECODING', 'SPELLING']
    },
    {
      id: 4,
      type: 'hidden-word',
      text: 'Find six geometric shapes in this word search that appeared in Ethan\'s walk:',
      grid: [
        'O C T A G O N P Q',
        'P E N T A G O N E',
        'S Q U A R E D R H',
        'T R I A N G L E O',
        'C I R C L E D C M',
        'T K O V A L P T B',
        'D I A M O N D A U',
        'R H O M B U S N S'
      ],
      words: ['OCTAGON', 'PENTAGON', 'TRIANGLE', 'CIRCLE', 'RHOMBUS', 'SQUARE'],
      theme: 'math',
      difficulty: 'medium',
      tags: ['GEOMETRY', 'VISUAL PERCEPTION', 'WORD SEARCH', 'ATTENTION TO DETAIL']
    },
    {
      id: 5,
      type: 'multiple-choice',
      text: 'What is the area of a triangular roof with base 10 ft and height 5 ft?',
      options: ['25 square feet', '50 square feet', '5 square feet', '10 square feet'],
      answer: 'a',
      theme: 'math',
      difficulty: 'medium',
      tags: ['GEOMETRY', 'AREA CALCULATION', 'TRIANGLE PROPERTIES', 'STATE MATH TEST']
    },
    {
      id: 6,
      type: 'multiple-choice',
      text: 'When Ethan walked uphill, what happened to his potential energy?',
      options: ['It decreased', 'It remained constant', 'It increased', 'It was converted to chemical energy'],
      answer: 'c',
      theme: 'science',
      difficulty: 'medium',
      tags: ['PHYSICS', 'ENERGY CONCEPTS', 'GRAVITATIONAL POTENTIAL', 'SCIENCE ASSESSMENT']
    },
    {
      id: 7,
      type: 'matching',
      text: 'Match each energy type with its definition from Ethan\'s explanation:',
      items: [
        { item: 'Potential Energy', match: 'Energy stored due to height' },
        { item: 'Kinetic Energy', match: 'Energy of motion' },
        { item: 'Wind Energy', match: 'Moving air with power to move objects' },
        { item: 'Sound Energy', match: 'Vibrations traveling through air' }
      ],
      answer: ['potential energy=energy stored due to height', 'kinetic energy=energy of motion', 'wind energy=moving air with power to move objects', 'sound energy=vibrations traveling through air'],
      theme: 'science',
      difficulty: 'medium',
      tags: ['PHYSICS', 'ENERGY TRANSFORMATION', 'CONCEPTUAL UNDERSTANDING', 'SCIENCE OLYMPIAD']
    },
    {
      id: 8,
      type: 'unscramble',
      text: 'Unscramble these energy types discussed during Ethan\'s walk:',
      letters: 'TENTIAK TENTIAPOL DWIN NOITOM',
      answer: ['KINETIC', 'POTENTIAL', 'WIND', 'MOTION'],
      theme: 'science',
      difficulty: 'medium',
      tags: ['PHYSICS', 'SCIENTIFIC TERMINOLOGY', 'WORD SKILLS', 'VOCABULARY BUILDING']
    },
    {
      id: 9,
      type: 'fill-blank',
      text: 'When Ethan goes downhill, potential energy is converted to ___________ energy.',
      answer: 'kinetic',
      theme: 'science',
      difficulty: 'medium',
      tags: ['PHYSICS', 'ENERGY CONVERSION', 'CONCEPTUAL UNDERSTANDING', 'SCIENCE RECALL']
    },
    {
      id: 10,
      type: 'multiple-choice',
      text: 'According to Ethan\'s observations, why are stop signs made of metal instead of wood?',
      options: ['Metal is cheaper', 'Metal is more durable', 'Metal is lighter', 'Metal is easier to shape'],
      answer: 'b',
      theme: 'materials',
      difficulty: 'easy',
      tags: ['MATERIALS SCIENCE', 'PROPERTIES OF MATTER', 'ENGINEERING', 'LOGICAL REASONING']
    },
    {
      id: 11,
      type: 'true-false',
      text: 'In the story, Ethan and his mom walked for exactly 2.8 miles during their neighborhood stroll.',
      answer: 'true',
      theme: 'language',
      difficulty: 'easy',
      tags: ['READING COMPREHENSION', 'DETAIL RECALL', 'CLOSE READING', 'STORY ANALYSIS']
    },
    {
      id: 12,
      type: 'matching',
      text: 'Match each material with why it\'s used for specific objects in Ethan\'s observations:',
      items: [
        { item: 'Metal', match: 'Durable for stop signs' },
        { item: 'Glass', match: 'Transparent for windows' },
        { item: 'Wood', match: 'Natural material for fences' },
        { item: 'Rock', match: 'Dense material that rolls downhill' }
      ],
      answer: ['metal=durable for stop signs', 'glass=transparent for windows', 'wood=natural material for fences', 'rock=dense material that rolls downhill'],
      theme: 'interdisciplinary',
      difficulty: 'medium',
      tags: ['INTERDISCIPLINARY', 'SCIENCE PRINCIPLES', 'CONCEPTUAL MATCHING', 'CRITICAL THINKING']
    },
    {
      id: 13,
      type: 'multiple-choice',
      text: 'Why are triangular roofs so common according to Ethan?',
      options: [
        'They are the easiest shape to build',
        'They use the least amount of material',
        'Triangles are strong and can handle pressure without collapsing',
        'They are the most visually appealing shape'
      ],
      answer: 'c',
      theme: 'engineering',
      difficulty: 'medium',
      tags: ['ENGINEERING', 'STRUCTURAL DESIGN', 'FUNCTIONAL REASONING', 'PRACTICAL SCIENCE']
    },
    {
      id: 14,
      type: 'word-sequence',
      text: 'Place these events from Ethan\'s walk in the correct sequence:',
      options: [
        'Ethan explains about potential energy',
        'They see wind chimes making music',
        'They observe the triangular roofs',
        'Ethan rolls a rock down the hill'
      ],
      answer: ['They observe the triangular roofs', 'Ethan explains about potential energy', 'Ethan rolls a rock down the hill', 'They see wind chimes making music'],
      theme: 'science',
      difficulty: 'medium',
      tags: ['PHYSICS', 'SEQUENTIAL REASONING', 'STORY COMPREHENSION', 'TIME ORDERING']
    },
    {
      id: 15,
      type: 'multiple-choice',
      text: 'What force did Ethan say was trying to push them back when they faced the strong breeze?',
      options: ['Gravity', 'Magnetism', 'Air resistance', 'Friction'],
      answer: 'c',
      theme: 'science',
      difficulty: 'medium',
      tags: ['PHYSICS', 'FORCES', 'EVERYDAY SCIENCE', 'CONCEPTUAL UNDERSTANDING']
    },
    {
      id: 16,
      type: 'multiple-choice',
      text: 'What literary device does Ethan use when he says "the wind is playing us a song"?',
      options: ['Metaphor', 'Personification', 'Simile', 'Hyperbole'],
      answer: 'b',
      theme: 'language',
      difficulty: 'medium',
      tags: ['LANGUAGE ARTS', 'LITERARY DEVICES', 'READING COMPREHENSION', 'WRITING SKILLS']
    },
    {
      id: 17,
      type: 'unscramble',
      text: 'Unscramble these words related to the story\'s literary elements:',
      letters: 'NOIFICATIONPERS APHORMET MIILES RYHPEOLEB',
      answer: ['PERSONIFICATION', 'METAPHOR', 'SIMILE', 'HYPERBOLE'],
      theme: 'language',
      difficulty: 'hard',
      tags: ['LANGUAGE ARTS', 'VOCABULARY', 'LITERARY TERMS', 'ENGLISH']
    },
    {
      id: 18,
      type: 'matching',
      text: 'Match each literary device with its example from the story:',
      items: [
        { item: 'Personification', match: '"The wind is playing us a song"' },
        { item: 'Description', match: '"The spring air carried the scent of new beginnings"' },
        { item: 'Technical term', match: '"That\'s called potential energy!"' },
        { item: 'Dialogue', match: '"Mom, let\'s explore more places next weekend!"' }
      ],
      answer: ['personification=the wind is playing us a song', 'description=the spring air carried the scent of new beginnings', 'technical term=that\'s called potential energy!', 'dialogue=mom, let\'s explore more places next weekend!'],
      theme: 'language',
      difficulty: 'medium',
      tags: ['LANGUAGE ARTS', 'LITERARY ANALYSIS', 'READING SKILLS', 'TEXT EVIDENCE']
    },
    {
      id: 19,
      type: 'multiple-choice',
      text: 'What aspect of their surroundings did Ethan and his mom find transformed during their walk?',
      options: [
        'The neighborhood became unfamiliar',
        'The familiar surroundings became a living classroom',
        'The buildings looked different than usual',
        'The trees had changed color'
      ],
      answer: 'b',
      theme: 'interdisciplinary',
      difficulty: 'medium',
      tags: ['INTERDISCIPLINARY', 'READING COMPREHENSION', 'INFERENTIAL THINKING', 'THEMATIC ANALYSIS']
    },
    {
      id: 20,
      type: 'fill-blank',
      text: 'Ethan described how wind transfers ________ energy to wind chimes to create sound waves.',
      answer: 'kinetic',
      theme: 'language',
      difficulty: 'medium',
      tags: ['LANGUAGE ARTS', 'READING COMPREHENSION', 'SCIENTIFIC LITERACY', 'TECHNICAL VOCABULARY']
    },
    {
      id: 21,
      type: 'multiple-choice',
      text: 'If Ethan jogged downhill at 6 mph for 0.4 miles, how many minutes did that take?',
      options: ['3 minutes', '4 minutes', '5 minutes', '6 minutes'],
      answer: 'b',
      theme: 'math',
      difficulty: 'medium',
      tags: ['MATH', 'RATE PROBLEMS', 'REAL-WORLD APPLICATIONS', 'CALCULATIONS']
    },
    {
      id: 22,
      type: 'word-sequence',
      text: 'Arrange these words to form the sentence from the story describing when the walk began:',
      options: ['on', 'struck', 'PM', 'As', 'the', 'a', 'clock', '2:45', 'crisp', 'Sunday', 'afternoon'],
      answer: ['As', 'the', 'clock', 'struck', '2:45', 'PM', 'on', 'a', 'crisp', 'Sunday', 'afternoon'],
      theme: 'language',
      difficulty: 'medium',
      tags: ['LANGUAGE ARTS', 'SENTENCE STRUCTURE', 'WORD ORDER', 'GRAMMAR']
    },
    {
      id: 23,
      type: 'multiple-choice',
      text: 'What mathematical concept did Ethan demonstrate with the rhombus he drew in the dirt?',
      options: [
        'How to calculate area using diagonals',
        'How to find the perimeter',
        'How to calculate the angles',
        'How to calculate the density'
      ],
      answer: 'a',
      theme: 'math',
      difficulty: 'medium',
      tags: ['MATH', 'GEOMETRY', 'AREA CALCULATION', 'EDUCATIONAL CONTENT']
    },
    {
      id: 24,
      type: 'multiple-choice',
      text: 'According to the story, what happens when a diagonal line splits a rhombus?',
      options: [
        'It creates a square',
        'It creates two congruent triangles',
        'It creates a pentagon',
        'It creates two rectangles'
      ],
      answer: 'b',
      theme: 'engineering',
      difficulty: 'medium',
      tags: ['ENGINEERING', 'GEOMETRY', 'STRUCTURAL PROPERTIES', 'MATHEMATICAL UNDERSTANDING']
    },
    {
      id: 25,
      type: 'multiple-choice',
      text: 'If Ethan\'s walk covered 2.8 miles and took 45 minutes, what was his average walking speed?',
      options: ['3.73 mph', '2.8 mph', '3.5 mph', '3.1 mph'],
      answer: 'a',
      theme: 'interdisciplinary',
      difficulty: 'hard',
      tags: ['INTERDISCIPLINARY', 'MATH APPLICATIONS', 'RATE CALCULATIONS', 'PROBLEM SOLVING']
    },
    {
      id: 26,
      type: 'multiple-choice',
      text: 'What month does the story take place in?',
      options: ['January', 'March', 'June', 'September'],
      answer: 'b',
      theme: 'interdisciplinary',
      difficulty: 'easy',
      tags: ['INTERDISCIPLINARY', 'READING COMPREHENSION', 'CONTEXTUAL DETAILS', 'ATTENTION TO DETAIL']
    },
    {
      id: 27,
      type: 'multiple-choice',
      text: 'What did Ethan\'s mom recognize when he said "the wind is playing us a song"?',
      options: [
        'A simile',
        'A metaphor',
        'Personification',
        'An idiom'
      ],
      answer: 'c',
      theme: 'language',
      difficulty: 'medium',
      tags: ['LANGUAGE ARTS', 'LITERARY DEVICES', 'READING ANALYSIS', 'VOCABULARY']
    },
    {
      id: 28,
      type: 'multiple-choice',
      text: 'What demonstration did Ethan use to show kinetic energy in action?',
      options: [
        'He jumped up and down',
        'He threw a ball in the air',
        'He rolled a rock down the hill',
        'He pushed against a fence'
      ],
      answer: 'c',
      theme: 'science',
      difficulty: 'easy',
      tags: ['SCIENCE', 'PHYSICS CONCEPTS', 'ENERGY DEMONSTRATION', 'PRACTICAL EXAMPLE']
    },
    {
      id: 29,
      type: 'multiple-choice',
      text: 'What was Ethan\'s reaction when his mom recognized his use of personification?',
      options: [
        'He was confused',
        'He was surprised',
        'He agreed and laughed',
        'He corrected her'
      ],
      answer: 'c',
      theme: 'language',
      difficulty: 'medium',
      tags: ['LANGUAGE ARTS', 'CHARACTER REACTIONS', 'DIALOGUE ANALYSIS', 'READING COMPREHENSION']
    },
    {
      id: 30,
      type: 'multiple-choice',
      text: 'At what time did Ethan and his mom return home from their walk?',
      options: ['2:45 PM', '3:15 PM', '3:30 PM', '4:00 PM'],
      answer: 'c',
      theme: 'language',
      difficulty: 'medium',
      tags: ['LANGUAGE ARTS', 'DETAIL RECALL', 'STORY TIMELINE', 'CHRONOLOGY']
    },
    {
      id: 31,
      type: 'fill-blank',
      text: 'Ethan described wooden fences as feeling ________ compared to metal.',
      answer: 'coarse',
      theme: 'math',
      difficulty: 'medium',
      tags: ['MATH', 'MATERIAL PROPERTIES', 'DESCRIPTIVE LANGUAGE', 'SENSORY DETAILS']
    },
    {
      id: 32,
      type: 'multiple-choice',
      text: 'What shape is formed when cutting a diagonal across a rhombus?',
      options: ['Two squares', 'Two rectangles', 'Two triangles', 'Two pentagons'],
      answer: 'c',
      theme: 'math',
      difficulty: 'easy',
      tags: ['MATH', 'GEOMETRY', 'SHAPE PROPERTIES', 'SPATIAL REASONING']
    },
    {
      id: 33,
      type: 'multiple-choice',
      text: 'What was Ethan looking forward to at the end of the story?',
      options: [
        'Doing his homework',
        'Playing video games',
        'Exploring the park in the next neighborhood',
        'Going back to school'
      ],
      answer: 'c',
      theme: 'science',
      difficulty: 'easy',
      tags: ['SCIENCE', 'CURIOSITY', 'STORY CONCLUSION', 'CHARACTER MOTIVATION']
    },
    {
      id: 34,
      type: 'multiple-choice',
      text: 'In addition to shape recognition, what other educational topic did Ethan and his mom discuss in depth?',
      options: ['American history', 'Energy transformation', 'Plant biology', 'Computer programming'],
      answer: 'b',
      theme: 'science',
      difficulty: 'easy',
      tags: ['SCIENCE', 'PHYSICS', 'EDUCATIONAL CONTENT', 'CURRICULUM CONNECTIONS']
    },
    {
      id: 35,
      type: 'multiple-choice',
      text: 'If the diagonal of a rhombus is 8 cm and the other diagonal is 6 cm, what is the area of the rhombus?',
      options: ['24 sq cm', '48 sq cm', '12 sq cm', '14 sq cm'],
      answer: 'a',
      theme: 'math',
      difficulty: 'hard',
      tags: ['MATH', 'GEOMETRY', 'AREA CALCULATION', 'FORMULA APPLICATION']
    },
    {
      id: 36,
      type: 'hidden-word',
      text: 'Find the following materials mentioned in the story:',
      grid: [
        'W F E N C E S M L',
        'I D G L A S S E W',
        'N M E T A L T W H',
        'D S R O C K S I O',
        'O T P A P E R N O',
        'W P L A S T I C D',
        'S D C H I M E S I'
      ],
      words: ['METAL', 'GLASS', 'WOOD', 'ROCK', 'FENCES', 'CHIMES'],
      theme: 'materials',
      difficulty: 'medium',
      tags: ['MATERIALS SCIENCE', 'VOCABULARY', 'WORD SEARCH', 'STORY ELEMENTS']
    },
    {
      id: 37,
      type: 'multiple-choice',
      text: 'What season does the story take place in?',
      options: ['Winter', 'Spring', 'Summer', 'Fall'],
      answer: 'b',
      theme: 'math',
      difficulty: 'easy',
      tags: ['MATH', 'CONTEXTUAL CLUES', 'INFERENCE', 'READING COMPREHENSION']
    },
    {
      id: 38,
      type: 'unscramble',
      text: 'Unscramble these materials mentioned during Ethan\'s observations:',
      letters: 'ASLSG DOLWO TEALM CKRO',
      answer: ['GLASS', 'WOOD', 'METAL', 'ROCK'],
      theme: 'materials',
      difficulty: 'medium',
      tags: ['MATERIALS SCIENCE', 'VOCABULARY', 'WORD SKILLS', 'SPELLING']
    },
    {
      id: 39,
      type: 'multiple-choice',
      text: 'What property makes a triangular roof good for areas with snow?',
      options: ['It stores heat well', 'It allows snow to slide off easily', 'It absorbs water', 'It expands in cold weather'],
      answer: 'b',
      theme: 'math',
      difficulty: 'medium',
      tags: ['MATH', 'GEOMETRY', 'PRACTICAL APPLICATIONS', 'ENGINEERING CONCEPTS']
    },
    {
      id: 40,
      type: 'multiple-choice',
      text: 'What causes wind chimes to make sound according to Ethan\'s explanation?',
      options: [
        'Electrical energy',
        'Vibrations created when kinetic energy is transferred',
        'Chemical reactions in the metal',
        'Thermal expansion and contraction'
      ],
      answer: 'b',
      theme: 'science',
      difficulty: 'medium',
      tags: ['SCIENCE', 'PHYSICS', 'SOUND PRODUCTION', 'ENERGY TRANSFER']
    },
    {
      id: 41,
      type: 'matching',
      text: 'Match each shape with its number of sides:',
      items: [
        { item: 'Pentagon', match: '5 sides' },
        { item: 'Octagon', match: '8 sides' },
        { item: 'Triangle', match: '3 sides' },
        { item: 'Rhombus', match: '4 sides' }
      ],
      answer: ['pentagon=5 sides', 'octagon=8 sides', 'triangle=3 sides', 'rhombus=4 sides'],
      theme: 'math',
      difficulty: 'easy',
      tags: ['MATH', 'GEOMETRY', 'SHAPE PROPERTIES', 'COUNTING']
    },
    {
      id: 42,
      type: 'multiple-choice',
      text: 'If Ethan walked 2.8 miles in 45 minutes, and maintained the same speed, how far would he walk in an hour?',
      options: ['3.2 miles', '3.5 miles', '3.73 miles', '4.0 miles'],
      answer: 'c',
      theme: 'math',
      difficulty: 'medium',
      tags: ['MATH', 'PROPORTIONAL REASONING', 'RATE PROBLEMS', 'MATH APPLICATIONS']
    },
    {
      id: 43,
      type: 'true-false',
      text: 'According to the story, metal is used for stop signs primarily because it is lighter than other materials.',
      answer: 'false',
      theme: 'math',
      difficulty: 'easy',
      tags: ['MATH', 'LOGICAL REASONING', 'MATERIAL PROPERTIES', 'READING COMPREHENSION']
    },
    {
      id: 44,
      type: 'multiple-choice',
      text: 'What was transformed during Ethan and his mom\'s walk according to the first paragraph?',
      options: [
        'The weather',
        'Their familiar surroundings',
        'Their relationship',
        'Their clothing'
      ],
      answer: 'b',
      theme: 'math',
      difficulty: 'easy',
      tags: ['MATH', 'READING COMPREHENSION', 'CONTEXT CLUES', 'INFERENCE']
    },
    {
      id: 45,
      type: 'multiple-choice',
      text: 'What did Ethan say was his favorite literary device?',
      options: ['Metaphor', 'Personification', 'Simile', 'Alliteration'],
      answer: 'b',
      theme: 'language',
      difficulty: 'medium',
      tags: ['LANGUAGE ARTS', 'LITERARY DEVICES', 'CHARACTER PREFERENCES', 'READING ANALYSIS']
    },
    {
      id: 46,
      type: 'multiple-choice',
      text: 'What did Ethan\'s mother think triangular roofs were useful for?',
      options: [
        'Decoration',
        'Making buildings taller',
        'Rain or snow sliding off easily',
        'Keeping birds away'
      ],
      answer: 'c',
      theme: 'interdisciplinary',
      difficulty: 'medium',
      tags: ['INTERDISCIPLINARY', 'PRACTICAL REASONING', 'ARCHITECTURE', 'INFERENCE']
    },
    {
      id: 47,
      type: 'multiple-choice',
      text: 'What did Ethan use to draw a rhombus during their walk?',
      options: ['A marker', 'A chalk', 'A stick', 'His finger'],
      answer: 'c',
      theme: 'engineering',
      difficulty: 'easy',
      tags: ['ENGINEERING', 'PRACTICAL TOOLS', 'IMPROVISATION', 'OBSERVATION']
    },
    {
      id: 48,
      type: 'multiple-choice',
      text: 'What did Ethan say happens when a rock rolls down a hill?',
      options: [
        'It loses all its energy',
        'It gains electrical energy',
        'It speeds up as potential energy converts to kinetic energy',
        'It maintains constant speed'
      ],
      answer: 'c',
      theme: 'science',
      difficulty: 'medium',
      tags: ['SCIENCE', 'PHYSICS', 'ENERGY CONVERSION', 'NATURAL PHENOMENA']
    },
    {
      id: 49,
      type: 'hidden-word',
      text: 'Find these energy terms from Ethan\'s walk:',
      grid: [
        'P O T E N T I A L S',
        'R E S I S T A N C E',
        'K E F O R C E S T N',
        'I U V I B R A T E E',
        'N S O U N D R I C R',
        'E W I N D P O W E G',
        'T M O T I O N A I Y',
        'I S T O R E D R N X',
        'C O N V E R S I O N'
      ],
      words: ['KINETIC', 'POTENTIAL', 'SOUND', 'WIND', 'RESISTANCE', 'MOTION'],
      theme: 'language',
      difficulty: 'medium',
      tags: ['LANGUAGE ARTS', 'SCIENTIFIC VOCABULARY', 'WORD SEARCH', 'READING COMPREHENSION']
    },
  ],
  
  // Chapter 2 with intermediate questions
  '8001-2': [
    {
      id: 1,
      type: 'multiple-choice',
      text: 'What is the measure of a right angle?',
      options: ['45 degrees', '90 degrees', '180 degrees', '270 degrees'],
      answer: 'b',
    },
    {
      id: 2,
      type: 'multiple-choice',
      text: 'When water changes from liquid to gas, this process is called:',
      options: ['Evaporation', 'Condensation', 'Sublimation', 'Freezing'],
      answer: 'a',
    },
    {
      id: 3,
      type: 'multiple-choice',
      text: 'Which of these is NOT a form of renewable energy?',
      options: ['Solar', 'Wind', 'Natural gas', 'Hydroelectric'],
      answer: 'c',
    },
    {
      id: 4,
      type: 'multiple-choice',
      text: 'When two objects have an equal but opposite electric charge, they will:',
      options: ['Repel each other', 'Attract each other', 'Neither attract nor repel', 'Gain weight'],
      answer: 'b',
    },
    {
      id: 5,
      type: 'multiple-choice',
      text: 'In a rhombus, what do we know about the opposite sides?',
      options: ['They are unequal', 'They are perpendicular', 'They are parallel', 'They have different lengths'],
      answer: 'c',
    },
    {
      id: 6,
      type: 'multiple-choice',
      text: 'Which of the following is the best thermal insulator?',
      options: ['Metal', 'Air', 'Water', 'Concrete'],
      answer: 'b',
    },
    {
      id: 7,
      type: 'multiple-choice',
      text: 'What part of speech is the word "quickly"?',
      options: ['Noun', 'Verb', 'Adjective', 'Adverb'],
      answer: 'd',
    },
    {
      id: 8,
      type: 'multiple-choice',
      text: 'Which of these is NOT a point on the scientific method?',
      options: ['Form a hypothesis', 'Collect data', 'Perform experiments', 'Form a theory before research'],
      answer: 'd',
    },
    {
      id: 9,
      type: 'multiple-choice',
      text: 'When a metal spoon is placed in a hot cup of tea, the handle eventually gets warm because of:',
      options: ['Radiation', 'Conduction', 'Sublimation', 'Convection'],
      answer: 'b',
    },
    {
      id: 10,
      type: 'multiple-choice',
      text: 'A rhombus with four equal angles is also called a:',
      options: ['Square', 'Rectangle', 'Parallelogram', 'Trapezoid'],
      answer: 'a',
    },
    {
      id: 11,
      type: 'multiple-choice',
      text: 'If you apply a force of 20 Newtons to move an object 5 meters, how much work have you done?',
      options: ['4 Joules', '25 Joules', '100 Joules', '15 Joules'],
      answer: 'c',
    },
    {
      id: 12,
      type: 'multiple-choice',
      text: 'What figure of speech is used in the sentence: "The wind whispered through the trees"?',
      options: ['Metaphor', 'Personification', 'Simile', 'Onomatopoeia'],
      answer: 'b',
    },
    {
      id: 13,
      type: 'multiple-choice',
      text: 'What is the area of a circle with radius 5 cm?',
      options: ['25π cm²', '10π cm²', '75π cm²', '5π cm²'],
      answer: 'a',
    },
    {
      id: 14,
      type: 'multiple-choice',
      text: 'Which of these materials is the best conductor of electricity?',
      options: ['Rubber', 'Wood', 'Copper', 'Plastic'],
      answer: 'c',
    },
    {
      id: 15,
      type: 'multiple-choice',
      text: 'If you throw a ball upward, at the highest point, its velocity is:',
      options: ['At its maximum', 'Zero', 'Negative', 'Impossible to determine'],
      answer: 'b',
    },
    {
      id: 16,
      type: 'multiple-choice',
      text: 'When a beam of white light passes through a prism, what happens?',
      options: [
        'It turns invisible',
        'It separates into different colors',
        'It becomes more intense',
        'It turns into ultraviolet light'
      ],
      answer: 'b',
    },
    {
      id: 17,
      type: 'multiple-choice',
      text: 'What type of triangle has three equal sides?',
      options: ['Scalene', 'Isosceles', 'Equilateral', 'Right'],
      answer: 'c',
    },
    {
      id: 18,
      type: 'multiple-choice',
      text: 'Which material would be most appropriate for making a window?',
      options: ['Metal', 'Wood', 'Glass', 'Concrete'],
      answer: 'c',
    },
    {
      id: 19,
      type: 'multiple-choice',
      text: 'In the water cycle, what is the process called when water vapor turns into liquid?',
      options: ['Evaporation', 'Precipitation', 'Condensation', 'Transpiration'],
      answer: 'c',
    },
    {
      id: 20,
      type: 'multiple-choice',
      text: 'Which of these devices directly transforms electrical energy into mechanical energy?',
      options: ['Solar panel', 'Electric motor', 'Battery', 'Light bulb'],
      answer: 'b',
    }
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
        { item: 'Potential Energy', match: 'Energy stored in an object\'s position' },
        { item: 'Kinetic Energy', match: 'Energy of motion' },
        { item: 'Thermal Energy', match: 'Energy from heat' },
        { item: 'Sound Energy', match: 'Energy from vibrations' }
      ],
      answer: ['potential energy=energy stored in an object\'s position', 'kinetic energy=energy of motion', 'thermal energy=energy from heat', 'sound energy=energy from vibrations'],
    },
    {
      id: 5,
      type: 'multiple-choice',
      text: 'Which shape has exactly one line of symmetry?',
      options: ['Square', 'Circle', 'Isosceles Triangle', 'Regular Hexagon'],
      answer: 'c',
    },
    {
      id: 6,
      type: 'multiple-choice',
      text: 'What force pulls objects toward Earth\'s center?',
      options: ['Friction', 'Magnetism', 'Gravity', 'Tension'],
      answer: 'c',
    },
    {
      id: 7,
      type: 'multiple-choice',
      text: 'A car moving at constant speed in a circle is:',
      options: ['Not accelerating', 'Accelerating', 'Decelerating', 'None of the above'],
      answer: 'b',
    },
    {
      id: 8,
      type: 'multiple-choice',
      text: 'Which of these is the most resilient material?',
      options: ['Glass', 'Paper', 'Rubber', 'Chalk'],
      answer: 'c',
    },
    {
      id: 9,
      type: 'multiple-choice',
      text: 'Which literary device is used when saying "The stars danced in the sky"?',
      options: ['Simile', 'Metaphor', 'Personification', 'Hyperbole'],
      answer: 'c',
    },
    {
      id: 10,
      type: 'multiple-choice',
      text: 'If a ball is thrown upward with an initial velocity of 20 m/s, how long will it take to reach its maximum height? (g = 10 m/s²)',
      options: ['1 second', '2 seconds', '3 seconds', '4 seconds'],
      answer: 'b',
    }
  ],
  
  // Chapter 4 with all 49 questions
  '8001-4': [
    // Level 1: Geometry Explorer
    {
      id: 1,
      type: 'multiple-choice',
      text: 'Stop signs are shaped as octagons because:',
      options: ['They\'re easier to make than circles', 'The unique shape is recognizable even when partially covered or at night', 'Octagons use less material than circles', 'They\'re less likely to roll away if knocked down'],
      answer: 'b',
      theme: 'math',
      difficulty: 'easy',
      tags: ['GEOMETRY', 'REAL-WORLD SHAPES', 'CRITICAL THINKING', 'EVERYDAY MATH']
    },
    {
      id: 2,
      type: 'matching',
      text: 'Match the Shape with its real-world example from Ethan\'s walk:',
      items: [
        { item: 'Triangle', match: 'Roof' },
        { item: 'Rhombus', match: 'Construction warning sign' },
        { item: 'Pentagon', match: 'School zone sign' },
        { item: 'Octagon', match: 'Stop sign' }
      ],
      answer: ['triangle=roof', 'rhombus=construction warning sign', 'pentagon=school zone sign', 'octagon=stop sign'],
      theme: 'math',
      difficulty: 'easy',
      tags: ['GEOMETRY', 'SHAPE RECOGNITION', 'VISUAL MATCHING', 'SPATIAL REASONING']
    },
    {
      id: 3,
      type: 'unscramble',
      text: 'Unscramble these geometric shapes mentioned in Ethan\'s walk:',
      letters: 'GONACOT GULITRANE BOMSHUR GONTAPEN',
      answer: ['OCTAGON', 'TRIANGLE', 'RHOMBUS', 'PENTAGON'],
      theme: 'math',
      difficulty: 'medium',
      tags: ['GEOMETRY', 'VOCABULARY', 'WORD DECODING', 'SPELLING']
    },
    {
      id: 4,
      type: 'hidden-word',
      text: 'Find six geometric shapes in this word search that appeared in Ethan\'s walk:',
      grid: [
        'O C T A G O N P Q',
        'P E N T A G O N E',
        'S Q U A R E D R H',
        'T R I A N G L E O',
        'C I R C L E D C M',
        'T K O V A L P T B',
        'D I A M O N D A U',
        'R H O M B U S N S'
      ],
      words: ['OCTAGON', 'PENTAGON', 'TRIANGLE', 'CIRCLE', 'RHOMBUS', 'SQUARE'],
      theme: 'math',
      difficulty: 'medium',
      tags: ['GEOMETRY', 'VISUAL PERCEPTION', 'WORD SEARCH', 'ATTENTION TO DETAIL']
    },
    {
      id: 5,
      type: 'multiple-choice',
      text: 'What is the area of a triangular roof with base 10 ft and height 5 ft?',
      options: ['25 square feet', '50 square feet', '5 square feet', '10 square feet'],
      answer: 'a',
      theme: 'math',
      difficulty: 'medium',
      tags: ['GEOMETRY', 'AREA CALCULATION', 'TRIANGLE PROPERTIES', 'STATE MATH TEST']
    },
    {
      id: 6,
      type: 'multiple-choice',
      text: 'When Ethan walked uphill, what happened to his potential energy?',
      options: ['It decreased', 'It remained constant', 'It increased', 'It was converted to chemical energy'],
      answer: 'c',
      theme: 'science',
      difficulty: 'medium',
      tags: ['PHYSICS', 'ENERGY CONCEPTS', 'GRAVITATIONAL POTENTIAL', 'SCIENCE ASSESSMENT']
    },
    {
      id: 7,
      type: 'matching',
      text: 'Match each energy type with its definition from Ethan\'s explanation:',
      items: [
        { item: 'Potential Energy', match: 'Energy stored due to height' },
        { item: 'Kinetic Energy', match: 'Energy of motion' },
        { item: 'Wind Energy', match: 'Moving air with power to move objects' },
        { item: 'Sound Energy', match: 'Vibrations traveling through air' }
      ],
      answer: ['potential energy=energy stored due to height', 'kinetic energy=energy of motion', 'wind energy=moving air with power to move objects', 'sound energy=vibrations traveling through air'],
      theme: 'science',
      difficulty: 'medium',
      tags: ['PHYSICS', 'ENERGY TRANSFORMATION', 'CONCEPTUAL UNDERSTANDING', 'SCIENCE OLYMPIAD']
    },
    {
      id: 8,
      type: 'unscramble',
      text: 'Unscramble these energy types discussed during Ethan\'s walk:',
      letters: 'TENTIAKL TENTIAPOL DWIN NOITOM',
      answer: ['KINETIC', 'POTENTIAL', 'WIND', 'MOTION'],
      theme: 'science',
      difficulty: 'medium',
      tags: ['PHYSICS', 'SCIENTIFIC TERMINOLOGY', 'WORD SKILLS', 'VOCABULARY BUILDING']
    },
    {
      id: 9,
      type: 'fill-blank',
      text: 'When Ethan goes downhill, potential energy is converted to ___________ energy.',
      answer: 'kinetic',
      theme: 'science',
      difficulty: 'medium',
      tags: ['PHYSICS', 'ENERGY CONVERSION', 'CONCEPTUAL UNDERSTANDING', 'SCIENCE RECALL']
    },
    {
      id: 10,
      type: 'multiple-choice',
      text: 'According to Ethan\'s observations, why are stop signs made of metal instead of wood?',
      options: ['Metal is cheaper', 'Metal is more durable', 'Metal is lighter', 'Metal is easier to shape'],
      answer: 'b',
      theme: 'materials',
      difficulty: 'easy',
      tags: ['MATERIALS SCIENCE', 'PROPERTIES OF MATTER', 'ENGINEERING', 'LOGICAL REASONING']
    },
    {
      id: 11,
      type: 'true-false',
      text: 'In the story, Ethan and his mom walked for exactly 2.8 miles during their neighborhood stroll.',
      answer: 'true',
      theme: 'language',
      difficulty: 'easy',
      tags: ['READING COMPREHENSION', 'DETAIL RECALL', 'CLOSE READING', 'STORY ANALYSIS']
    },
    {
      id: 12,
      type: 'matching',
      text: 'Match each material with why it\'s used for specific objects in Ethan\'s observations:',
      items: [
        { item: 'Metal', match: 'Durable for stop signs' },
        { item: 'Glass', match: 'Transparent for windows' },
        { item: 'Wood', match: 'Natural material for fences' },
        { item: 'Rock', match: 'Dense material that rolls downhill' }
      ],
      answer: ['metal=durable for stop signs', 'glass=transparent for windows', 'wood=natural material for fences', 'rock=dense material that rolls downhill'],
      theme: 'interdisciplinary',
      difficulty: 'medium',
      tags: ['INTERDISCIPLINARY', 'SCIENCE PRINCIPLES', 'CONCEPTUAL MATCHING', 'CRITICAL THINKING']
    },
    {
      id: 13,
      type: 'multiple-choice',
      text: 'Why are triangular roofs so common according to Ethan?',
      options: [
        'They are the easiest shape to build',
        'They use the least amount of material',
        'Triangles are strong and can handle pressure without collapsing',
        'They are the most visually appealing shape'
      ],
      answer: 'c',
      theme: 'engineering',
      difficulty: 'medium',
      tags: ['ENGINEERING', 'STRUCTURAL DESIGN', 'FUNCTIONAL REASONING', 'PRACTICAL SCIENCE']
    },
    {
      id: 14,
      type: 'word-sequence',
      text: 'Place these events from Ethan\'s walk in the correct sequence:',
      options: [
        'Ethan explains about potential energy',
        'They see wind chimes making music',
        'They observe the triangular roofs',
        'Ethan rolls a rock down the hill'
      ],
      answer: ['They observe the triangular roofs', 'Ethan explains about potential energy', 'Ethan rolls a rock down the hill', 'They see wind chimes making music'],
      theme: 'science',
      difficulty: 'medium',
      tags: ['PHYSICS', 'SEQUENTIAL REASONING', 'STORY COMPREHENSION', 'TIME ORDERING']
    },
    {
      id: 15,
      type: 'multiple-choice',
      text: 'What force did Ethan say was trying to push them back when they faced the strong breeze?',
      options: ['Gravity', 'Magnetism', 'Air resistance', 'Friction'],
      answer: 'c',
      theme: 'science',
      difficulty: 'medium',
      tags: ['PHYSICS', 'FORCES', 'EVERYDAY SCIENCE', 'CONCEPTUAL UNDERSTANDING']
    },
    {
      id: 16,
      type: 'multiple-choice',
      text: 'What literary device does Ethan use when he says "the wind is playing us a song"?',
      options: ['Metaphor', 'Personification', 'Simile', 'Hyperbole'],
      answer: 'b',
      theme: 'language',
      difficulty: 'medium',
      tags: ['LANGUAGE ARTS', 'LITERARY DEVICES', 'READING COMPREHENSION', 'WRITING SKILLS']
    },
    {
      id: 17,
      type: 'unscramble',
      text: 'Unscramble these words related to the story\'s literary elements:',
      letters: 'NOIFICATIONPERS APHORMET MIILES RYHPEOLEB',
      answer: ['PERSONIFICATION', 'METAPHOR', 'SIMILE', 'HYPERBOLE'],
      theme: 'language',
      difficulty: 'hard',
      tags: ['LANGUAGE ARTS', 'VOCABULARY', 'LITERARY TERMS', 'ENGLISH']
    },
    {
      id: 18,
      type: 'matching',
      text: 'Match each literary device with its example from the story:',
      items: [
        { item: 'Personification', match: '"The wind is playing us a song"' },
        { item: 'Description', match: '"The spring air carried the scent of new beginnings"' },
        { item: 'Technical term', match: '"That\'s called potential energy!"' },
        { item: 'Dialogue', match: '"Mom, let\'s explore more places next weekend!"' }
      ],
      answer: ['personification=the wind is playing us a song', 'description=the spring air carried the scent of new beginnings', 'technical term=that\'s called potential energy!', 'dialogue=mom, let\'s explore more places next weekend!'],
      theme: 'language',
      difficulty: 'medium',
      tags: ['LANGUAGE ARTS', 'LITERARY ANALYSIS', 'READING SKILLS', 'TEXT EVIDENCE']
    },
    {
      id: 19,
      type: 'multiple-choice',
      text: 'What aspect of their surroundings did Ethan and his mom find transformed during their walk?',
      options: [
        'The neighborhood became unfamiliar',
        'The familiar surroundings became a living classroom',
        'The buildings looked different than usual',
        'The trees had changed color'
      ],
      answer: 'b',
      theme: 'interdisciplinary',
      difficulty: 'medium',
      tags: ['INTERDISCIPLINARY', 'READING COMPREHENSION', 'INFERENTIAL THINKING', 'THEMATIC ANALYSIS']
    },
    {
      id: 20,
      type: 'fill-blank',
      text: 'Ethan described how wind transfers ________ energy to wind chimes to create sound waves.',
      answer: 'kinetic',
      theme: 'language',
      difficulty: 'medium',
      tags: ['LANGUAGE ARTS', 'READING COMPREHENSION', 'SCIENTIFIC LITERACY', 'TECHNICAL VOCABULARY']
    },
    {
      id: 21,
      type: 'multiple-choice',
      text: 'If Ethan jogged downhill at 6 mph for 0.4 miles, how many minutes did that take?',
      options: ['3 minutes', '4 minutes', '5 minutes', '6 minutes'],
      answer: 'b',
      theme: 'math',
      difficulty: 'medium',
      tags: ['MATH', 'RATE PROBLEMS', 'REAL-WORLD APPLICATIONS', 'CALCULATIONS']
    },
    {
      id: 22,
      type: 'word-sequence',
      text: 'Arrange these words to form the sentence from the story describing when the walk began:',
      options: ['on', 'struck', 'PM', 'As', 'the', 'a', 'clock', '2:45', 'crisp', 'Sunday', 'afternoon'],
      answer: ['As', 'the', 'clock', 'struck', '2:45', 'PM', 'on', 'a', 'crisp', 'Sunday', 'afternoon'],
      theme: 'language',
      difficulty: 'medium',
      tags: ['LANGUAGE ARTS', 'SENTENCE STRUCTURE', 'WORD ORDER', 'GRAMMAR']
    },
    {
      id: 23,
      type: 'multiple-choice',
      text: 'What mathematical concept did Ethan demonstrate with the rhombus he drew in the dirt?',
      options: [
        'How to calculate area using diagonals',
        'How to find the perimeter',
        'How to calculate the angles',
        'How to calculate the density'
      ],
      answer: 'a',
      theme: 'math',
      difficulty: 'medium',
      tags: ['MATH', 'GEOMETRY', 'AREA CALCULATION', 'EDUCATIONAL CONTENT']
    },
    {
      id: 24,
      type: 'multiple-choice',
      text: 'According to the story, what happens when a diagonal line splits a rhombus?',
      options: [
        'It creates a square',
        'It creates two congruent triangles',
        'It creates a pentagon',
        'It creates two rectangles'
      ],
      answer: 'b',
      theme: 'engineering',
      difficulty: 'medium',
      tags: ['ENGINEERING', 'GEOMETRY', 'STRUCTURAL PROPERTIES', 'MATHEMATICAL UNDERSTANDING']
    },
    {
      id: 25,
      type: 'multiple-choice',
      text: 'If Ethan\'s walk covered 2.8 miles and took 45 minutes, what was his average walking speed?',
      options: ['3.73 mph', '2.8 mph', '3.5 mph', '3.1 mph'],
      answer: 'a',
      theme: 'interdisciplinary',
      difficulty: 'hard',
      tags: ['INTERDISCIPLINARY', 'MATH APPLICATIONS', 'RATE CALCULATIONS', 'PROBLEM SOLVING']
    },
    {
      id: 26,
      type: 'multiple-choice',
      text: 'What month does the story take place in?',
      options: ['January', 'March', 'June', 'September'],
      answer: 'b',
      theme: 'interdisciplinary',
      difficulty: 'easy',
      tags: ['INTERDISCIPLINARY', 'READING COMPREHENSION', 'CONTEXTUAL DETAILS', 'ATTENTION TO DETAIL']
    },
    {
      id: 27,
      type: 'multiple-choice',
      text: 'What did Ethan\'s mom recognize when he said "the wind is playing us a song"?',
      options: [
        'A simile',
        'A metaphor',
        'Personification',
        'An idiom'
      ],
      answer: 'c',
      theme: 'language',
      difficulty: 'medium',
      tags: ['LANGUAGE ARTS', 'LITERARY DEVICES', 'READING ANALYSIS', 'VOCABULARY']
    },
    {
      id: 28,
      type: 'multiple-choice',
      text: 'What demonstration did Ethan use to show kinetic energy in action?',
      options: [
        'He jumped up and down',
        'He threw a ball in the air',
        'He rolled a rock down the hill',
        'He pushed against a fence'
      ],
      answer: 'c',
      theme: 'science',
      difficulty: 'easy',
      tags: ['SCIENCE', 'PHYSICS CONCEPTS', 'ENERGY DEMONSTRATION', 'PRACTICAL EXAMPLE']
    },
    {
      id: 29,
      type: 'multiple-choice',
      text: 'What was Ethan\'s reaction when his mom recognized his use of personification?',
      options: [
        'He was confused',
        'He was surprised',
        'He agreed and laughed',
        'He corrected her'
      ],
      answer: 'c',
      theme: 'language',
      difficulty: 'medium',
      tags: ['LANGUAGE ARTS', 'CHARACTER REACTIONS', 'DIALOGUE ANALYSIS', 'READING COMPREHENSION']
    },
    {
      id: 30,
      type: 'multiple-choice',
      text: 'At what time did Ethan and his mom return home from their walk?',
      options: ['2:45 PM', '3:15 PM', '3:30 PM', '4:00 PM'],
      answer: 'c',
      theme: 'language',
      difficulty: 'medium',
      tags: ['LANGUAGE ARTS', 'DETAIL RECALL', 'STORY TIMELINE', 'CHRONOLOGY']
    },
    {
      id: 31,
      type: 'fill-blank',
      text: 'Ethan described wooden fences as feeling ________ compared to metal.',
      answer: 'coarse',
      theme: 'math',
      difficulty: 'medium',
      tags: ['MATH', 'MATERIAL PROPERTIES', 'DESCRIPTIVE LANGUAGE', 'SENSORY DETAILS']
    },
    {
      id: 32,
      type: 'multiple-choice',
      text: 'What shape is formed when cutting a diagonal across a rhombus?',
      options: ['Two squares', 'Two rectangles', 'Two triangles', 'Two pentagons'],
      answer: 'c',
      theme: 'math',
      difficulty: 'easy',
      tags: ['MATH', 'GEOMETRY', 'SHAPE PROPERTIES', 'SPATIAL REASONING']
    },
    {
      id: 33,
      type: 'multiple-choice',
      text: 'What was Ethan looking forward to at the end of the story?',
      options: [
        'Doing his homework',
        'Playing video games',
        'Exploring the park in the next neighborhood',
        'Going back to school'
      ],
      answer: 'c',
      theme: 'science',
      difficulty: 'easy',
      tags: ['SCIENCE', 'CURIOSITY', 'STORY CONCLUSION', 'CHARACTER MOTIVATION']
    },
    {
      id: 34,
      type: 'multiple-choice',
      text: 'In addition to shape recognition, what other educational topic did Ethan and his mom discuss in depth?',
      options: ['American history', 'Energy transformation', 'Plant biology', 'Computer programming'],
      answer: 'b',
      theme: 'science',
      difficulty: 'easy',
      tags: ['SCIENCE', 'PHYSICS', 'EDUCATIONAL CONTENT', 'CURRICULUM CONNECTIONS']
    },
    {
      id: 35,
      type: 'multiple-choice',
      text: 'If the diagonal of a rhombus is 8 cm and the other diagonal is 6 cm, what is the area of the rhombus?',
      options: ['24 sq cm', '48 sq cm', '12 sq cm', '14 sq cm'],
      answer: 'a',
      theme: 'math',
      difficulty: 'hard',
      tags: ['MATH', 'GEOMETRY', 'AREA CALCULATION', 'FORMULA APPLICATION']
    },
    {
      id: 36,
      type: 'hidden-word',
      text: 'Find the following materials mentioned in the story:',
      grid: [
        'W F E N C E S M L',
        'I D G L A S S E W',
        'N M E T A L T W H',
        'D S R O C K S I O',
        'O T P A P E R N O',
        'W P L A S T I C D',
        'S D C H I M E S I'
      ],
      words: ['METAL', 'GLASS', 'WOOD', 'ROCK', 'FENCES', 'CHIMES'],
      theme: 'materials',
      difficulty: 'medium',
      tags: ['MATERIALS SCIENCE', 'VOCABULARY', 'WORD SEARCH', 'STORY ELEMENTS']
    },
    {
      id: 37,
      type: 'multiple-choice',
      text: 'What season does the story take place in?',
      options: ['Winter', 'Spring', 'Summer', 'Fall'],
      answer: 'b',
      theme: 'math',
      difficulty: 'easy',
      tags: ['MATH', 'CONTEXTUAL CLUES', 'INFERENCE', 'READING COMPREHENSION']
    },
    {
      id: 38,
      type: 'unscramble',
      text: 'Unscramble these materials mentioned during Ethan\'s observations:',
      letters: 'ASLSG DOLWO TEALM CKRO',
      answer: ['GLASS', 'WOOD', 'METAL', 'ROCK'],
      theme: 'materials',
      difficulty: 'medium',
      tags: ['MATERIALS SCIENCE', 'VOCABULARY', 'WORD SKILLS', 'SPELLING']
    },
    {
      id: 39,
      type: 'multiple-choice',
      text: 'What property makes a triangular roof good for areas with snow?',
      options: ['It stores heat well', 'It allows snow to slide off easily', 'It absorbs water', 'It expands in cold weather'],
      answer: 'b',
      theme: 'math',
      difficulty: 'medium',
      tags: ['MATH', 'GEOMETRY', 'PRACTICAL APPLICATIONS', 'ENGINEERING CONCEPTS']
    },
    {
      id: 40,
      type: 'multiple-choice',
      text: 'What causes wind chimes to make sound according to Ethan\'s explanation?',
      options: [
        'Electrical energy',
        'Vibrations created when kinetic energy is transferred',
        'Chemical reactions in the metal',
        'Thermal expansion and contraction'
      ],
      answer: 'b',
      theme: 'science',
      difficulty: 'medium',
      tags: ['SCIENCE', 'PHYSICS', 'SOUND PRODUCTION', 'ENERGY TRANSFER']
    },
    {
      id: 41,
      type: 'matching',
      text: 'Match each shape with its number of sides:',
      items: [
        { item: 'Pentagon', match: '5 sides' },
        { item: 'Octagon', match: '8 sides' },
        { item: 'Triangle', match: '3 sides' },
        { item: 'Rhombus', match: '4 sides' }
      ],
      answer: ['pentagon=5 sides', 'octagon=8 sides', 'triangle=3 sides', 'rhombus=4 sides'],
      theme: 'math',
      difficulty: 'easy',
      tags: ['MATH', 'GEOMETRY', 'SHAPE PROPERTIES', 'COUNTING']
    },
    {
      id: 42,
      type: 'multiple-choice',
      text: 'If Ethan walked 2.8 miles in 45 minutes, and maintained the same speed, how far would he walk in an hour?',
      options: ['3.2 miles', '3.5 miles', '3.73 miles', '4.0 miles'],
      answer: 'c',
      theme: 'math',
      difficulty: 'medium',
      tags: ['MATH', 'PROPORTIONAL REASONING', 'RATE PROBLEMS', 'MATH APPLICATIONS']
    },
    {
      id: 43,
      type: 'true-false',
      text: 'According to the story, metal is used for stop signs primarily because it is lighter than other materials.',
      answer: 'false',
      theme: 'math',
      difficulty: 'easy',
      tags: ['MATH', 'LOGICAL REASONING', 'MATERIAL PROPERTIES', 'READING COMPREHENSION']
    },
    {
      id: 44,
      type: 'multiple-choice',
      text: 'What was transformed during Ethan and his mom\'s walk according to the first paragraph?',
      options: [
        'The weather',
        'Their familiar surroundings',
        'Their relationship',
        'Their clothing'
      ],
      answer: 'b',
      theme: 'math',
      difficulty: 'easy',
      tags: ['MATH', 'READING COMPREHENSION', 'CONTEXT CLUES', 'INFERENCE']
    },
    {
      id: 45,
      type: 'multiple-choice',
      text: 'What did Ethan say was his favorite literary device?',
      options: ['Metaphor', 'Personification', 'Simile', 'Alliteration'],
      answer: 'b',
      theme: 'language',
      difficulty: 'medium',
      tags: ['LANGUAGE ARTS', 'LITERARY DEVICES', 'CHARACTER PREFERENCES', 'READING ANALYSIS']
    },
    {
      id: 46,
      type: 'multiple-choice',
      text: 'What did Ethan\'s mother think triangular roofs were useful for?',
      options: [
        'Decoration',
        'Making buildings taller',
        'Rain or snow sliding off easily',
        'Keeping birds away'
      ],
      answer: 'c',
      theme: 'interdisciplinary',
      difficulty: 'medium',
      tags: ['INTERDISCIPLINARY', 'PRACTICAL REASONING', 'ARCHITECTURE', 'INFERENCE']
    },
    {
      id: 47,
      type: 'multiple-choice',
      text: 'What did Ethan use to draw a rhombus during their walk?',
      options: ['A marker', 'A chalk', 'A stick', 'His finger'],
      answer: 'c',
      theme: 'engineering',
      difficulty: 'easy',
      tags: ['ENGINEERING', 'PRACTICAL TOOLS', 'IMPROVISATION', 'OBSERVATION']
    },
    {
      id: 48,
      type: 'multiple-choice',
      text: 'What did Ethan say happens when a rock rolls down a hill?',
      options: [
        'It loses all its energy',
        'It gains electrical energy',
        'It speeds up as potential energy converts to kinetic energy',
        'It maintains constant speed'
      ],
      answer: 'c',
      theme: 'science',
      difficulty: 'medium',
      tags: ['SCIENCE', 'PHYSICS', 'ENERGY CONVERSION', 'NATURAL PHENOMENA']
    },
    {
      id: 49,
      type: 'hidden-word',
      text: 'Find these energy terms from Ethan\'s walk:',
      grid: [
        'P O T E N T I A L S',
        'R E S I S T A N C E',
        'K E F O R C E S T N',
        'I U V I B R A T E E',
        'N S O U N D R I C R',
        'E W I N D P O W E G',
        'T M O T I O N A I Y',
        'I S T O R E D R N X',
        'C O N V E R S I O N'
      ],
      words: ['KINETIC', 'POTENTIAL', 'SOUND', 'WIND', 'RESISTANCE', 'MOTION'],
      theme: 'language',
      difficulty: 'medium',
      tags: ['LANGUAGE ARTS', 'SCIENTIFIC VOCABULARY', 'WORD SEARCH', 'READING COMPREHENSION']
    },
  ]
};

// These import statements will be added when needed by dynamic imports
export default chapterQuestions;