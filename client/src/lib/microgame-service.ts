// Microgame service for fetching and managing microgames

import { Microgame, UserGameResult } from "@shared/schema";

export type MicrogameType = 'quiz' | 'match' | 'arrange' | 'fill-in-blank';

export interface MicrogameContent {
  questions?: Array<{
    question: string;
    options?: string[];
    correctAnswer: string | string[];
    explanation?: string;
  }>;
  pairs?: Array<{
    left: string;
    right: string;
  }>;
  items?: string[];
  correctOrder?: string[];
  text?: string;
  blanks?: Array<{
    id: string;
    correctAnswer: string;
    options?: string[];
  }>;
  imageUrl?: string;
}

export interface MicrogameConfig {
  timeLimit?: number; // in seconds
  shuffleOptions?: boolean;
  showFeedback?: boolean;
  showHints?: boolean;
  showExplanation?: boolean;
  attemptsAllowed?: number;
}

export interface UserAnswer {
  questionId?: string | number;
  userAnswer: string | string[] | Record<string, string>;
  isCorrect?: boolean;
  timeTaken?: number; // in seconds
}

// Fetch a random microgame by grade and optional subject
export async function fetchRandomMicrogame(grade: string, subject?: string): Promise<Microgame> {
  try {
    const queryParams = new URLSearchParams();
    queryParams.append('grade', grade);
    if (subject) {
      queryParams.append('subject', subject);
    }
    
    const response = await fetch(`/api/microgames/random?${queryParams.toString()}`);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch microgame: ${response.statusText}`);
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching random microgame:', error);
    throw error;
  }
}

// Fetch microgames by subject
export async function fetchMicrogamesBySubject(subject: string): Promise<Microgame[]> {
  try {
    const response = await fetch(`/api/microgames/subject/${subject}`);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch microgames: ${response.statusText}`);
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching microgames by subject:', error);
    throw error;
  }
}

// Save a user's result for a microgame
export async function saveGameResult(microgameId: number, score: number, timeTaken?: number, answers?: UserAnswer[]): Promise<UserGameResult> {
  try {
    const response = await fetch('/api/microgames/results', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        microgameId,
        score,
        timeTaken,
        answers: answers ? JSON.stringify(answers) : undefined,
      }),
    });
    
    if (!response.ok) {
      throw new Error(`Failed to save game result: ${response.statusText}`);
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error saving game result:', error);
    throw error;
  }
}

// Check a single answer for correctness (used by various microgame types)
export function checkAnswer(userAnswer: string | string[], correctAnswer: string | string[]): boolean {
  if (Array.isArray(userAnswer) && Array.isArray(correctAnswer)) {
    // Compare arrays (order matters)
    if (userAnswer.length !== correctAnswer.length) return false;
    return userAnswer.every((item, index) => item === correctAnswer[index]);
  } else if (Array.isArray(userAnswer) && !Array.isArray(correctAnswer)) {
    // User provided multiple answers but only one correct answer
    return userAnswer.includes(correctAnswer);
  } else if (!Array.isArray(userAnswer) && Array.isArray(correctAnswer)) {
    // User provided one answer but multiple correct answers
    return correctAnswer.includes(userAnswer);
  } else {
    // Simple string comparison
    return userAnswer === correctAnswer;
  }
}

// Calculate score based on correct answers
export function calculateScore(answers: UserAnswer[], totalQuestions: number, maxPoints: number = 100): number {
  if (totalQuestions === 0) return 0;
  
  const correctAnswers = answers.filter(answer => answer.isCorrect).length;
  return Math.round((correctAnswers / totalQuestions) * maxPoints);
}