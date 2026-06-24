import { db } from "../db";
import { topics, questions } from "@shared/schema";
import { eq } from "drizzle-orm";

interface TopicSeed {
  title: string;
  description: string;
  category: string;
  gradeLevel: number;
  difficulty: string;
  questions: {
    type: string;
    text: string;
    diagram?: unknown;
    options: unknown;
    answer: unknown;
    difficulty: string;
    bloomLevel: string;
    topic: string;
    hints: string[];
    explanation: string;
  }[];
}

const TOPICS: TopicSeed[] = [
  // ── Arithmetic (Grade 3-4) ─────────────────────────────────────────────────
  {
    title: "Speed Arithmetic",
    description: "Quick mental math: addition, subtraction, multiplication tricks for olympiad speed rounds.",
    category: "arithmetic",
    gradeLevel: 3,
    difficulty: "easy",
    questions: [
      {
        type: "multiple-choice",
        text: "What is 48 + 37 + 52 + 63?",
        options: { choices: ["190", "195", "200", "205"] },
        answer: "c",
        difficulty: "easy",
        bloomLevel: "apply",
        topic: "mental math",
        hints: ["Try grouping: (48+52) and (37+63)", "Each group sums to 100"],
        explanation: "48+52 = 100 and 37+63 = 100, so the total is 200.",
      },
      {
        type: "fill-blank",
        text: "What is 25 x 16?",
        options: null,
        answer: "400",
        difficulty: "easy",
        bloomLevel: "apply",
        topic: "mental math",
        hints: ["25 x 4 = 100", "16 = 4 x 4"],
        explanation: "25 x 16 = 25 x 4 x 4 = 100 x 4 = 400.",
      },
      {
        type: "multiple-choice",
        text: "If you multiply 99 by 7, what do you get?",
        options: { choices: ["686", "693", "700", "707"] },
        answer: "b",
        difficulty: "easy",
        bloomLevel: "apply",
        topic: "mental math",
        hints: ["Think of 99 as (100 - 1)", "So 99 x 7 = 700 - 7"],
        explanation: "99 x 7 = (100-1) x 7 = 700 - 7 = 693.",
      },
      {
        type: "true-false",
        text: "The sum of any two odd numbers is always odd.",
        options: null,
        answer: "false",
        difficulty: "easy",
        bloomLevel: "understand",
        topic: "number properties",
        hints: ["Try 3 + 5"],
        explanation: "The sum of two odd numbers is always even. For example, 3 + 5 = 8.",
      },
      {
        type: "multiple-choice",
        text: "What is the value of 1000 - 567?",
        options: { choices: ["423", "433", "443", "533"] },
        answer: "b",
        difficulty: "easy",
        bloomLevel: "remember",
        topic: "subtraction",
        hints: ["1000 - 500 = 500, then subtract 67 more"],
        explanation: "1000 - 567 = 433.",
      },
    ],
  },

  // ── Number Theory (Grade 4-5) ──────────────────────────────────────────────
  {
    title: "Factors & Multiples",
    description: "Master GCD, LCM, prime factorization — essential for math olympiad problems.",
    category: "number-theory",
    gradeLevel: 4,
    difficulty: "medium",
    questions: [
      {
        type: "multiple-choice",
        text: "What is the GCD (Greatest Common Divisor) of 24 and 36?",
        options: { choices: ["6", "8", "12", "18"] },
        answer: "c",
        difficulty: "medium",
        bloomLevel: "apply",
        topic: "GCD",
        hints: ["List the factors of 24: 1,2,3,4,6,8,12,24", "List the factors of 36: 1,2,3,4,6,9,12,18,36"],
        explanation: "Factors of 24: {1,2,3,4,6,8,12,24}. Factors of 36: {1,2,3,4,6,9,12,18,36}. The greatest common factor is 12.",
      },
      {
        type: "fill-blank",
        text: "What is the LCM of 6 and 8?",
        options: null,
        answer: "24",
        difficulty: "medium",
        bloomLevel: "apply",
        topic: "LCM",
        hints: ["List multiples of 6: 6, 12, 18, 24...", "List multiples of 8: 8, 16, 24..."],
        explanation: "Multiples of 6: 6,12,18,24... Multiples of 8: 8,16,24... The LCM is 24.",
      },
      {
        type: "multiple-choice",
        text: "How many prime numbers are there between 1 and 20?",
        options: { choices: ["6", "7", "8", "9"] },
        answer: "c",
        difficulty: "medium",
        bloomLevel: "remember",
        topic: "prime numbers",
        hints: ["Primes are numbers with exactly 2 factors", "Check each number: 2,3,5,7,11,13,17,19"],
        explanation: "The primes between 1 and 20 are: 2, 3, 5, 7, 11, 13, 17, 19. That's 8 primes.",
      },
      {
        type: "true-false",
        text: "Every even number greater than 2 can be expressed as the sum of two prime numbers.",
        options: null,
        answer: "true",
        difficulty: "hard",
        bloomLevel: "evaluate",
        topic: "prime numbers",
        hints: ["This is known as Goldbach's Conjecture", "Try: 4=2+2, 6=3+3, 8=3+5"],
        explanation: "This is Goldbach's Conjecture. While not formally proven for all numbers, it has been verified for all even numbers up to very large values.",
      },
      {
        type: "multiple-choice",
        text: "What is the prime factorization of 60?",
        options: { choices: ["2 x 2 x 3 x 5", "2 x 3 x 10", "2 x 2 x 15", "4 x 15"] },
        answer: "a",
        difficulty: "medium",
        bloomLevel: "apply",
        topic: "prime factorization",
        hints: ["Start dividing by the smallest prime: 60/2 = 30", "30/2 = 15, 15/3 = 5"],
        explanation: "60 = 2 x 30 = 2 x 2 x 15 = 2 x 2 x 3 x 5.",
      },
    ],
  },

  // ── Geometry (Grade 4-5) ───────────────────────────────────────────────────
  {
    title: "Angles & Triangles",
    description: "Properties of triangles, angle relationships, and geometric reasoning for competitions.",
    category: "geometry",
    gradeLevel: 4,
    difficulty: "medium",
    questions: [
      {
        type: "multiple-choice",
        text: "Look at the triangle below. What is the value of angle x?",
        diagram: {
          type: "triangle",
          vertices: [[0, 0], [6, 0], [3, 4]],
          labels: { vertices: ["A", "B", "C"], angles: ["50°", "70°", "x"] },
        },
        options: { choices: ["50°", "55°", "60°", "70°"] },
        answer: "c",
        difficulty: "medium",
        bloomLevel: "apply",
        topic: "triangle angles",
        hints: ["The sum of all angles in a triangle is 180°", "x = 180 - 50 - 70"],
        explanation: "Sum of angles = 180°. So x = 180 - 50 - 70 = 60°.",
      },
      {
        type: "multiple-choice",
        text: "What type of triangle is shown below?",
        diagram: {
          type: "triangle",
          vertices: [[0, 0], [4, 0], [4, 3]],
          labels: { vertices: ["P", "Q", "R"], sides: ["4", "3", "5"] },
          showRightAngle: 1,
        },
        options: { choices: ["Equilateral", "Isosceles", "Right-angled", "Obtuse"] },
        answer: "c",
        difficulty: "easy",
        bloomLevel: "understand",
        topic: "triangle types",
        hints: ["Look at the angle marker at vertex Q"],
        explanation: "The square marker at Q indicates a 90° angle, making this a right-angled triangle (a 3-4-5 Pythagorean triple).",
      },
      {
        type: "fill-blank",
        text: "In the right triangle below, what is the value of angle x?",
        diagram: {
          type: "triangle",
          vertices: [[0, 0], [5, 0], [5, 3]],
          labels: { angles: ["x", "90°", "35°"] },
          showRightAngle: 1,
        },
        options: null,
        answer: "55",
        difficulty: "medium",
        bloomLevel: "apply",
        topic: "triangle angles",
        hints: ["Sum of all angles = 180°", "x = 180 - 90 - 35"],
        explanation: "180 - 90 - 35 = 55 degrees.",
      },
      {
        type: "true-false",
        text: "An obtuse triangle can have two obtuse angles.",
        options: null,
        answer: "false",
        difficulty: "medium",
        bloomLevel: "analyze",
        topic: "triangle properties",
        hints: ["An obtuse angle is > 90 degrees", "What happens if two angles are each > 90?"],
        explanation: "If two angles were both > 90, their sum would be > 180, which is impossible in a triangle. So a triangle can have at most one obtuse angle.",
      },
      {
        type: "multiple-choice",
        text: "What is the area of a triangle with base 10 cm and height 6 cm?",
        options: { choices: ["16 sq cm", "30 sq cm", "60 sq cm", "120 sq cm"] },
        answer: "b",
        difficulty: "easy",
        bloomLevel: "apply",
        topic: "area",
        hints: ["Area = (1/2) x base x height"],
        explanation: "Area = (1/2) x 10 x 6 = 30 sq cm.",
      },
    ],
  },

  // ── Algebra (Grade 5-6) ────────────────────────────────────────────────────
  {
    title: "Patterns & Sequences",
    description: "Identify and extend number patterns, arithmetic and geometric sequences.",
    category: "algebra",
    gradeLevel: 5,
    difficulty: "medium",
    questions: [
      {
        type: "fill-blank",
        text: "What is the next number in the sequence: 2, 6, 18, 54, ___?",
        options: null,
        answer: "162",
        difficulty: "medium",
        bloomLevel: "analyze",
        topic: "geometric sequences",
        hints: ["Find the pattern: each number is multiplied by something", "6/2 = 3, 18/6 = 3"],
        explanation: "Each number is multiplied by 3. So 54 x 3 = 162.",
      },
      {
        type: "multiple-choice",
        text: "In the sequence 3, 7, 11, 15, 19, ..., what is the 10th term?",
        options: { choices: ["35", "39", "43", "47"] },
        answer: "b",
        difficulty: "medium",
        bloomLevel: "apply",
        topic: "arithmetic sequences",
        hints: ["The common difference is 4", "nth term = first term + (n-1) x common difference"],
        explanation: "Common difference = 4. 10th term = 3 + (10-1) x 4 = 3 + 36 = 39.",
      },
      {
        type: "fill-blank",
        text: "If x + 5 = 12, what is x?",
        options: null,
        answer: "7",
        difficulty: "easy",
        bloomLevel: "apply",
        topic: "linear equations",
        hints: ["Subtract 5 from both sides"],
        explanation: "x = 12 - 5 = 7.",
      },
      {
        type: "multiple-choice",
        text: "What is the sum of the first 10 natural numbers?",
        options: { choices: ["45", "50", "55", "100"] },
        answer: "c",
        difficulty: "medium",
        bloomLevel: "apply",
        topic: "series",
        hints: ["Use the formula: n(n+1)/2", "Or pair them: 1+10, 2+9, 3+8..."],
        explanation: "Sum = n(n+1)/2 = 10 x 11 / 2 = 55.",
      },
      {
        type: "multiple-choice",
        text: "If 3a = 15 and 2b = 10, what is a + b?",
        options: { choices: ["8", "10", "12", "15"] },
        answer: "b",
        difficulty: "medium",
        bloomLevel: "apply",
        topic: "linear equations",
        hints: ["Solve for a first: a = 15/3", "Then solve for b: b = 10/2"],
        explanation: "a = 15/3 = 5, b = 10/2 = 5, so a + b = 10.",
      },
    ],
  },

  // ── Logical Reasoning (Grade 3-5) ──────────────────────────────────────────
  {
    title: "Logic Puzzles",
    description: "Olympiad-style logical reasoning: patterns, deductions, and clever thinking.",
    category: "logical-reasoning",
    gradeLevel: 3,
    difficulty: "medium",
    questions: [
      {
        type: "multiple-choice",
        text: "If all Bloops are Razzles and all Razzles are Lazzles, then which statement must be true?",
        options: { choices: ["All Lazzles are Bloops", "All Bloops are Lazzles", "Some Lazzles are Razzles", "All Razzles are Bloops"] },
        answer: "b",
        difficulty: "medium",
        bloomLevel: "analyze",
        topic: "logical deduction",
        hints: ["Think of it like circles inside circles", "Bloops are inside Razzles, Razzles are inside Lazzles"],
        explanation: "Since Bloops are a subset of Razzles, and Razzles are a subset of Lazzles, all Bloops must be Lazzles.",
      },
      {
        type: "multiple-choice",
        text: "A clock shows 3:15. What is the angle between the hour and minute hands?",
        options: { choices: ["0 degrees", "7.5 degrees", "15 degrees", "22.5 degrees"] },
        answer: "b",
        difficulty: "hard",
        bloomLevel: "analyze",
        topic: "clock problems",
        hints: ["The minute hand is at 3 (90 degrees from 12)", "The hour hand moves 0.5 degrees per minute past the hour mark"],
        explanation: "At 3:15, the minute hand is at 3 (90 degrees). The hour hand has moved 15 x 0.5 = 7.5 degrees past the 3. So the angle between them is 7.5 degrees.",
      },
      {
        type: "fill-blank",
        text: "What comes next: 1, 1, 2, 3, 5, 8, 13, ___?",
        options: null,
        answer: "21",
        difficulty: "medium",
        bloomLevel: "analyze",
        topic: "fibonacci",
        hints: ["Each number is the sum of the two before it", "8 + 13 = ?"],
        explanation: "This is the Fibonacci sequence. Each term = sum of previous two. 8 + 13 = 21.",
      },
      {
        type: "multiple-choice",
        text: "If yesterday was two days after Monday, what day is today?",
        options: { choices: ["Wednesday", "Thursday", "Friday", "Saturday"] },
        answer: "b",
        difficulty: "medium",
        bloomLevel: "apply",
        topic: "logical deduction",
        hints: ["Two days after Monday is Wednesday", "If yesterday was Wednesday, today is..."],
        explanation: "Two days after Monday = Wednesday. If yesterday was Wednesday, today is Thursday.",
      },
      {
        type: "multiple-choice",
        text: "How many squares are there on a standard 8x8 chessboard? (Count all sizes!)",
        options: { choices: ["64", "200", "204", "256"] },
        answer: "c",
        difficulty: "olympiad",
        bloomLevel: "evaluate",
        topic: "counting",
        hints: ["Don't just count 1x1 squares!", "Count 1x1, 2x2, 3x3, ... up to 8x8", "Number of nxn squares = (9-n)^2"],
        explanation: "1x1: 64, 2x2: 49, 3x3: 36, 4x4: 25, 5x5: 16, 6x6: 9, 7x7: 4, 8x8: 1. Total = 64+49+36+25+16+9+4+1 = 204.",
      },
    ],
  },

  // ── Combinatorics (Grade 5-6) ──────────────────────────────────────────────
  {
    title: "Counting & Probability",
    description: "Permutations, combinations, and basic probability for competition math.",
    category: "combinatorics",
    gradeLevel: 5,
    difficulty: "hard",
    questions: [
      {
        type: "multiple-choice",
        text: "How many 3-digit numbers can be formed using digits 1, 2, 3 without repetition?",
        options: { choices: ["3", "6", "9", "27"] },
        answer: "b",
        difficulty: "medium",
        bloomLevel: "apply",
        topic: "permutations",
        hints: ["First digit: 3 choices. Second digit: 2 remaining. Third digit: 1 remaining.", "Multiply the choices"],
        explanation: "3 x 2 x 1 = 6 three-digit numbers: 123, 132, 213, 231, 312, 321.",
      },
      {
        type: "fill-blank",
        text: "How many ways can you choose 2 books from a shelf of 5 books?",
        options: null,
        answer: "10",
        difficulty: "medium",
        bloomLevel: "apply",
        topic: "combinations",
        hints: ["Use the combination formula: C(n,r) = n! / (r!(n-r)!)", "C(5,2) = 5!/(2!3!)"],
        explanation: "C(5,2) = 5!/(2! x 3!) = (5x4)/(2x1) = 10.",
      },
      {
        type: "multiple-choice",
        text: "A bag has 3 red and 2 blue marbles. What is the probability of drawing a red marble?",
        options: { choices: ["1/5", "2/5", "3/5", "3/2"] },
        answer: "c",
        difficulty: "easy",
        bloomLevel: "apply",
        topic: "probability",
        hints: ["P(event) = favorable outcomes / total outcomes", "Total marbles = 3 + 2 = 5"],
        explanation: "P(red) = 3/5. There are 3 red marbles out of 5 total.",
      },
      {
        type: "multiple-choice",
        text: "In how many ways can 4 people stand in a line?",
        options: { choices: ["4", "12", "16", "24"] },
        answer: "d",
        difficulty: "medium",
        bloomLevel: "apply",
        topic: "permutations",
        hints: ["This is 4!", "4 x 3 x 2 x 1"],
        explanation: "4! = 4 x 3 x 2 x 1 = 24 ways.",
      },
      {
        type: "fill-blank",
        text: "If you flip a coin 3 times, how many different outcomes are possible?",
        options: null,
        answer: "8",
        difficulty: "medium",
        bloomLevel: "apply",
        topic: "counting",
        hints: ["Each flip has 2 outcomes (H or T)", "Total = 2 x 2 x 2"],
        explanation: "2^3 = 8 outcomes: HHH, HHT, HTH, HTT, THH, THT, TTH, TTT.",
      },
    ],
  },

  // ── Number Theory Advanced (Grade 6-7) ─────────────────────────────────────
  {
    title: "Divisibility & Remainders",
    description: "Divisibility rules, modular arithmetic, and remainder problems for olympiads.",
    category: "number-theory",
    gradeLevel: 6,
    difficulty: "hard",
    questions: [
      {
        type: "multiple-choice",
        text: "What is the remainder when 2^10 is divided by 7?",
        options: { choices: ["1", "2", "3", "4"] },
        answer: "b",
        difficulty: "hard",
        bloomLevel: "analyze",
        topic: "modular arithmetic",
        hints: ["2^1=2, 2^2=4, 2^3=8=1(mod 7)", "Since 2^3 = 1 (mod 7), what is 2^10 = 2^(3x3+1)?"],
        explanation: "2^3 = 8 = 1 (mod 7). So 2^10 = 2^(3x3) x 2^1 = 1 x 2 = 2 (mod 7). Remainder is 2.",
      },
      {
        type: "true-false",
        text: "A number is divisible by 6 if and only if it is divisible by both 2 and 3.",
        options: null,
        answer: "true",
        difficulty: "medium",
        bloomLevel: "understand",
        topic: "divisibility",
        hints: ["6 = 2 x 3, and 2 and 3 are coprime"],
        explanation: "Since 6 = 2 x 3 and gcd(2,3) = 1, a number is divisible by 6 iff it is divisible by both 2 and 3.",
      },
      {
        type: "multiple-choice",
        text: "What is the sum of all divisors of 12?",
        options: { choices: ["24", "28", "32", "36"] },
        answer: "b",
        difficulty: "medium",
        bloomLevel: "apply",
        topic: "divisors",
        hints: ["List all divisors of 12: 1, 2, 3, 4, 6, 12"],
        explanation: "Divisors of 12: 1+2+3+4+6+12 = 28.",
      },
      {
        type: "fill-blank",
        text: "What is the last digit of 7^100?",
        options: null,
        answer: "1",
        difficulty: "olympiad",
        bloomLevel: "analyze",
        topic: "number patterns",
        hints: ["Find the pattern of last digits: 7^1=7, 7^2=49, 7^3=343, 7^4=2401", "The last digits cycle: 7, 9, 3, 1"],
        explanation: "The last digits of powers of 7 cycle with period 4: 7,9,3,1. Since 100 is divisible by 4, the last digit of 7^100 is 1.",
      },
      {
        type: "multiple-choice",
        text: "How many numbers between 1 and 100 are divisible by both 3 and 5?",
        options: { choices: ["3", "5", "6", "7"] },
        answer: "c",
        difficulty: "medium",
        bloomLevel: "apply",
        topic: "divisibility",
        hints: ["Divisible by both 3 and 5 = divisible by LCM(3,5) = 15", "Count multiples of 15 up to 100"],
        explanation: "LCM(3,5) = 15. Multiples of 15 up to 100: 15,30,45,60,75,90. That's 6 numbers.",
      },
    ],
  },

  // ── Geometry Advanced (Grade 6-7) ──────────────────────────────────────────
  {
    title: "Perimeter, Area & Volume",
    description: "Calculate perimeters, areas, and volumes of various shapes — competition-level problems.",
    category: "geometry",
    gradeLevel: 6,
    difficulty: "hard",
    questions: [
      {
        type: "multiple-choice",
        text: "A rectangle has length 12 cm and width 5 cm. What is its diagonal?",
        options: { choices: ["11 cm", "13 cm", "15 cm", "17 cm"] },
        answer: "b",
        difficulty: "medium",
        bloomLevel: "apply",
        topic: "pythagorean theorem",
        hints: ["Use the Pythagorean theorem: d = sqrt(l^2 + w^2)", "12^2 + 5^2 = 144 + 25 = 169"],
        explanation: "d = sqrt(12^2 + 5^2) = sqrt(144+25) = sqrt(169) = 13 cm.",
      },
      {
        type: "fill-blank",
        text: "What is the area of a circle with radius 7 cm? (Use pi = 22/7, give answer as a number)",
        options: null,
        answer: "154",
        difficulty: "medium",
        bloomLevel: "apply",
        topic: "circles",
        hints: ["Area = pi x r^2", "22/7 x 7 x 7"],
        explanation: "Area = (22/7) x 7^2 = (22/7) x 49 = 22 x 7 = 154 sq cm.",
      },
      {
        type: "multiple-choice",
        text: "What is the volume of a cube with side length 5 cm?",
        options: { choices: ["25 cu cm", "75 cu cm", "100 cu cm", "125 cu cm"] },
        answer: "d",
        difficulty: "easy",
        bloomLevel: "apply",
        topic: "volume",
        hints: ["Volume of cube = side^3"],
        explanation: "Volume = 5^3 = 125 cubic cm.",
      },
      {
        type: "multiple-choice",
        text: "Two circles have radii 3 and 5. If they share the same center, what is the area of the ring between them? (Use pi = 3.14)",
        options: { choices: ["25.12", "50.24", "75.36", "100.48"] },
        answer: "b",
        difficulty: "hard",
        bloomLevel: "analyze",
        topic: "circles",
        hints: ["Area of ring = pi(R^2 - r^2)", "= 3.14 x (25 - 9)"],
        explanation: "Area = pi(5^2 - 3^2) = 3.14 x 16 = 50.24 sq units.",
      },
      {
        type: "fill-blank",
        text: "A right triangle has legs of 6 cm and 8 cm. What is its hypotenuse in cm?",
        options: null,
        answer: "10",
        difficulty: "medium",
        bloomLevel: "apply",
        topic: "pythagorean theorem",
        hints: ["c^2 = a^2 + b^2", "6^2 + 8^2 = 36 + 64 = 100"],
        explanation: "c = sqrt(6^2 + 8^2) = sqrt(36+64) = sqrt(100) = 10 cm.",
      },
    ],
  },

  // ── Grade 1 ──
  {
    title: "Counting & Addition",
    description: "Count objects, add single-digit numbers, and solve simple word problems.",
    category: "arithmetic",
    gradeLevel: 1,
    difficulty: "easy",
    questions: [
      { type: "multiple-choice", text: "What is 3 + 4?", options: { choices: ["5", "6", "7", "8"] }, answer: "c", difficulty: "easy", bloomLevel: "remember", topic: "addition", hints: ["Count on from 3"], explanation: "3 + 4 = 7" },
      { type: "multiple-choice", text: "Which number comes after 9?", options: { choices: ["8", "10", "11", "7"] }, answer: "b", difficulty: "easy", bloomLevel: "remember", topic: "counting", hints: ["Count: 8, 9, ..."], explanation: "10 comes after 9." },
      { type: "fill-blank", text: "5 + ___ = 8", options: null, answer: "3", difficulty: "easy", bloomLevel: "apply", topic: "addition", hints: ["What do you add to 5 to get 8?"], explanation: "5 + 3 = 8" },
      { type: "true-false", text: "6 is greater than 9.", options: null, answer: "false", difficulty: "easy", bloomLevel: "understand", topic: "comparison", hints: ["Compare the two numbers"], explanation: "6 is less than 9." },
      { type: "multiple-choice", text: "Sam has 2 apples and gets 3 more. How many does he have?", options: { choices: ["3", "4", "5", "6"] }, answer: "c", difficulty: "easy", bloomLevel: "apply", topic: "word problems", hints: ["Add 2 + 3"], explanation: "2 + 3 = 5 apples." },
    ],
  },

  // ── Grade 2 ──
  {
    title: "Addition & Subtraction within 100",
    description: "Two-digit addition and subtraction with and without regrouping.",
    category: "arithmetic",
    gradeLevel: 2,
    difficulty: "easy",
    questions: [
      { type: "multiple-choice", text: "What is 24 + 15?", options: { choices: ["37", "38", "39", "40"] }, answer: "c", difficulty: "easy", bloomLevel: "apply", topic: "addition", hints: ["Add the ones: 4+5=9, then add the tens: 2+1=3"], explanation: "24 + 15 = 39" },
      { type: "fill-blank", text: "50 - 23 = ___", options: null, answer: "27", difficulty: "easy", bloomLevel: "apply", topic: "subtraction", hints: ["50 - 20 = 30, then 30 - 3 = 27"], explanation: "50 - 23 = 27" },
      { type: "multiple-choice", text: "Which is the largest: 45, 54, 34, 43?", options: { choices: ["45", "54", "34", "43"] }, answer: "b", difficulty: "easy", bloomLevel: "analyze", topic: "comparison", hints: ["Look at the tens digit first"], explanation: "54 has the largest tens digit (5), so it is the largest." },
      { type: "true-false", text: "35 + 10 = 55", options: null, answer: "false", difficulty: "easy", bloomLevel: "remember", topic: "addition", hints: ["Add carefully"], explanation: "35 + 10 = 45, not 55." },
      { type: "multiple-choice", text: "A book has 48 pages. You read 20. How many are left?", options: { choices: ["18", "28", "38", "68"] }, answer: "b", difficulty: "easy", bloomLevel: "apply", topic: "word problems", hints: ["Subtract: 48 - 20"], explanation: "48 - 20 = 28 pages left." },
    ],
  },

  // ── Grade 7 ──
  {
    title: "Integers & Rational Numbers",
    description: "Operations with negative numbers, absolute value, and rational number properties.",
    category: "arithmetic",
    gradeLevel: 7,
    difficulty: "medium",
    questions: [
      { type: "multiple-choice", text: "What is (-8) + 5?", options: { choices: ["-13", "-3", "3", "13"] }, answer: "b", difficulty: "easy", bloomLevel: "apply", topic: "integer operations", hints: ["Start at -8 and move 5 to the right"], explanation: "(-8) + 5 = -3" },
      { type: "fill-blank", text: "What is the absolute value of -15?", options: null, answer: "15", difficulty: "easy", bloomLevel: "remember", topic: "absolute value", hints: ["Distance from zero on number line"], explanation: "|-15| = 15" },
      { type: "multiple-choice", text: "(-6) × (-4) = ?", options: { choices: ["-24", "-10", "10", "24"] }, answer: "d", difficulty: "medium", bloomLevel: "apply", topic: "integer multiplication", hints: ["Negative × Negative = Positive"], explanation: "(-6) × (-4) = 24. Multiplying two negatives gives a positive." },
      { type: "true-false", text: "-3 > -1", options: null, answer: "false", difficulty: "easy", bloomLevel: "understand", topic: "number line", hints: ["-3 is further left on the number line"], explanation: "-3 is less than -1 because it is further from zero in the negative direction." },
      { type: "multiple-choice", text: "What is (-12) ÷ 3?", options: { choices: ["-9", "-4", "4", "9"] }, answer: "b", difficulty: "medium", bloomLevel: "apply", topic: "integer division", hints: ["Negative ÷ Positive = Negative"], explanation: "(-12) ÷ 3 = -4" },
    ],
  },
  {
    title: "Linear Equations",
    description: "Solve and graph linear equations, understand slope-intercept form.",
    category: "algebra",
    gradeLevel: 7,
    difficulty: "medium",
    questions: [
      { type: "fill-blank", text: "Solve for x: 2x + 6 = 14", options: null, answer: "4", difficulty: "medium", bloomLevel: "apply", topic: "linear equations", hints: ["Subtract 6 from both sides, then divide by 2"], explanation: "2x + 6 = 14 → 2x = 8 → x = 4" },
      { type: "multiple-choice", text: "What is the slope of y = 3x - 5?", options: { choices: ["-5", "-3", "3", "5"] }, answer: "c", difficulty: "medium", bloomLevel: "understand", topic: "slope", hints: ["In y = mx + b, the slope is m"], explanation: "In y = 3x - 5, the slope m = 3." },
      { type: "multiple-choice", text: "If 5x - 3 = 2x + 9, what is x?", options: { choices: ["2", "3", "4", "6"] }, answer: "c", difficulty: "medium", bloomLevel: "apply", topic: "linear equations", hints: ["Move x terms to one side: 5x - 2x = 9 + 3"], explanation: "3x = 12, so x = 4." },
      { type: "true-false", text: "The equation y = 2x + 1 passes through the origin (0,0).", options: null, answer: "false", difficulty: "easy", bloomLevel: "understand", topic: "graphing", hints: ["Plug in x=0: y = 2(0) + 1 = 1"], explanation: "When x=0, y=1, not 0. The line passes through (0,1)." },
      { type: "multiple-choice", text: "Which pair satisfies y = x + 3?", options: { choices: ["(1, 3)", "(2, 5)", "(3, 5)", "(0, 0)"] }, answer: "b", difficulty: "easy", bloomLevel: "apply", topic: "equations", hints: ["Substitute each x value and check if y matches"], explanation: "When x=2, y = 2+3 = 5. So (2,5) satisfies the equation." },
    ],
  },
  {
    title: "Pythagorean Theorem",
    description: "Apply the Pythagorean theorem to find missing sides of right triangles.",
    category: "geometry",
    gradeLevel: 7,
    difficulty: "medium",
    questions: [
      { type: "multiple-choice", text: "A right triangle has legs 3 and 4. What is the hypotenuse?", options: { choices: ["5", "6", "7", "12"] }, answer: "a", difficulty: "easy", bloomLevel: "apply", topic: "pythagorean theorem", hints: ["c² = a² + b² = 9 + 16 = 25"], explanation: "c = √(9+16) = √25 = 5" },
      { type: "fill-blank", text: "A right triangle has hypotenuse 13 and one leg 5. What is the other leg?", options: null, answer: "12", difficulty: "medium", bloomLevel: "apply", topic: "pythagorean theorem", hints: ["b² = 13² - 5² = 169 - 25 = 144"], explanation: "b = √(169-25) = √144 = 12" },
      { type: "true-false", text: "A triangle with sides 6, 8, 10 is a right triangle.", options: null, answer: "true", difficulty: "easy", bloomLevel: "analyze", topic: "pythagorean triples", hints: ["Check: 6² + 8² = 36 + 64 = 100 = 10²"], explanation: "6² + 8² = 100 = 10², so yes, it's a right triangle." },
      { type: "multiple-choice", text: "Which set of numbers is NOT a Pythagorean triple?", options: { choices: ["3, 4, 5", "5, 12, 13", "8, 15, 17", "4, 6, 8"] }, answer: "d", difficulty: "medium", bloomLevel: "analyze", topic: "pythagorean triples", hints: ["Check: does a² + b² = c²?"], explanation: "4² + 6² = 16 + 36 = 52 ≠ 64 = 8². So 4,6,8 is NOT a Pythagorean triple." },
      { type: "multiple-choice", text: "The distance between (0,0) and (3,4) is:", options: { choices: ["5", "6", "7", "25"] }, answer: "a", difficulty: "medium", bloomLevel: "apply", topic: "distance formula", hints: ["d = √(3² + 4²)"], explanation: "d = √(9+16) = √25 = 5" },
    ],
  },

  // ── Grade 8 ──
  {
    title: "Exponents & Powers",
    description: "Laws of exponents, negative exponents, and scientific notation.",
    category: "arithmetic",
    gradeLevel: 8,
    difficulty: "medium",
    questions: [
      { type: "multiple-choice", text: "What is 2⁵?", options: { choices: ["16", "32", "64", "10"] }, answer: "b", difficulty: "easy", bloomLevel: "remember", topic: "exponents", hints: ["2×2×2×2×2"], explanation: "2⁵ = 32" },
      { type: "fill-blank", text: "Simplify: 3² × 3³", options: null, answer: "243", difficulty: "medium", bloomLevel: "apply", topic: "exponent rules", hints: ["When multiplying same base, add exponents: 3^(2+3) = 3⁵"], explanation: "3² × 3³ = 3⁵ = 243" },
      { type: "multiple-choice", text: "What is 10⁰?", options: { choices: ["0", "1", "10", "100"] }, answer: "b", difficulty: "easy", bloomLevel: "remember", topic: "exponents", hints: ["Any number to the power of 0 equals..."], explanation: "Any non-zero number raised to the power 0 equals 1." },
      { type: "true-false", text: "(2³)² = 2⁶", options: null, answer: "true", difficulty: "medium", bloomLevel: "apply", topic: "exponent rules", hints: ["Power of a power: multiply exponents"], explanation: "(2³)² = 2^(3×2) = 2⁶ = 64" },
      { type: "multiple-choice", text: "Express 0.00045 in scientific notation.", options: { choices: ["4.5 × 10⁻⁴", "4.5 × 10⁻³", "45 × 10⁻⁵", "0.45 × 10⁻³"] }, answer: "a", difficulty: "hard", bloomLevel: "apply", topic: "scientific notation", hints: ["Move decimal 4 places right to get 4.5"], explanation: "0.00045 = 4.5 × 10⁻⁴" },
    ],
  },
  {
    title: "Quadratic Equations",
    description: "Solve quadratic equations by factoring and using the quadratic formula.",
    category: "algebra",
    gradeLevel: 8,
    difficulty: "hard",
    questions: [
      { type: "multiple-choice", text: "Solve: x² - 5x + 6 = 0", options: { choices: ["x = 1, 6", "x = 2, 3", "x = -2, -3", "x = -1, 6"] }, answer: "b", difficulty: "medium", bloomLevel: "apply", topic: "factoring quadratics", hints: ["Find two numbers that multiply to 6 and add to -5"], explanation: "x² - 5x + 6 = (x-2)(x-3) = 0, so x = 2 or x = 3." },
      { type: "fill-blank", text: "What is the discriminant of x² + 4x + 4 = 0?", options: null, answer: "0", difficulty: "medium", bloomLevel: "apply", topic: "discriminant", hints: ["Discriminant = b² - 4ac, where a=1, b=4, c=4"], explanation: "D = 4² - 4(1)(4) = 16 - 16 = 0" },
      { type: "multiple-choice", text: "The graph of y = x² opens:", options: { choices: ["Upward", "Downward", "Left", "Right"] }, answer: "a", difficulty: "easy", bloomLevel: "understand", topic: "parabolas", hints: ["The coefficient of x² is positive"], explanation: "When the coefficient of x² is positive, the parabola opens upward." },
      { type: "true-false", text: "x² = -4 has real solutions.", options: null, answer: "false", difficulty: "medium", bloomLevel: "analyze", topic: "quadratic equations", hints: ["Can a square of a real number be negative?"], explanation: "No real number squared gives a negative result. x² = -4 has no real solutions." },
      { type: "multiple-choice", text: "If x² - 9 = 0, then x = ?", options: { choices: ["±3", "±9", "3", "9"] }, answer: "a", difficulty: "easy", bloomLevel: "apply", topic: "difference of squares", hints: ["x² = 9, so x = ±√9"], explanation: "x² = 9, so x = 3 or x = -3." },
    ],
  },
];

export async function seedMathTopics() {
  for (const topicData of TOPICS) {
    // Check if topic already exists
    const existing = await db
      .select()
      .from(topics)
      .where(eq(topics.title, topicData.title));

    if (existing.length > 0) {
      continue;
    }

    console.log(`Seeding topic: ${topicData.title}`);

    const [topic] = await db
      .insert(topics)
      .values({
        title: topicData.title,
        description: topicData.description,
        category: topicData.category,
        gradeLevel: topicData.gradeLevel,
        difficulty: topicData.difficulty,
        totalQuestions: topicData.questions.length,
      })
      .returning();

    for (const q of topicData.questions) {
      await db.insert(questions).values({
        topicId: topic.id,
        type: q.type,
        text: q.text,
        diagram: q.diagram ?? null,
        options: q.options,
        answer: q.answer,
        difficulty: q.difficulty,
        bloomLevel: q.bloomLevel,
        topic: q.topic,
        hints: q.hints,
        explanation: q.explanation,
        tags: null,
      });
    }
  }
}
