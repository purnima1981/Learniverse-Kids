import { Microgame, UserGameResult } from "@shared/schema";
import { queryClient, apiRequest } from "@/lib/queryClient";

export interface MicrogameConfig {
  timeLimit?: number;
  shuffleOptions?: boolean;
  showFeedback?: boolean;
  showExplanation?: boolean;
  showHints?: boolean;
}

export interface UserAnswer {
  questionId?: number | string;
  userAnswer: string | string[];
  isCorrect: boolean;
}

/**
 * Checks if a user's answer is correct
 */
export function checkAnswer(userAnswer: string | string[], correctAnswer: string | string[]): boolean {
  if (Array.isArray(userAnswer) && Array.isArray(correctAnswer)) {
    // For arrange/order type questions
    if (userAnswer.length !== correctAnswer.length) return false;
    return userAnswer.every((item, index) => item === correctAnswer[index]);
  } else if (Array.isArray(userAnswer)) {
    // If user answer is an array but correct answer is a string (unexpected)
    console.error("Mismatch in answer types: userAnswer is array, correctAnswer is string");
    return false;
  } else if (Array.isArray(correctAnswer)) {
    // If correct answer is an array but user answer is a string (unexpected)
    console.error("Mismatch in answer types: userAnswer is string, correctAnswer is array");
    return false;
  } else {
    // Simple string comparison for single answers
    // Normalize both strings for comparison (trim whitespace, case insensitive)
    return userAnswer.toString().trim().toLowerCase() === correctAnswer.toString().trim().toLowerCase();
  }
}

/**
 * Fetches a random microgame appropriate for the student's grade level
 * Optionally filtered by subject
 */
export async function fetchRandomMicrogame(gradeLevel: string, subject?: string): Promise<Microgame> {
  try {
    const queryParams = new URLSearchParams();
    if (subject) queryParams.append('subject', subject);
    queryParams.append('grade', gradeLevel);
    
    const response = await apiRequest('GET', `/api/microgames/random?${queryParams.toString()}`);
    const data = await response.json();
    
    // Ensure the content is parsed if it's a string
    if (data && typeof data.content === 'string') {
      try {
        data.content = JSON.parse(data.content);
      } catch (e) {
        console.warn("Could not parse microgame content JSON:", e);
      }
    }
    
    return data;
  } catch (error) {
    console.error("Error fetching random microgame:", error);
    throw new Error("Failed to load a microgame");
  }
}

/**
 * Saves the result of a game
 */
export async function saveGameResult(
  microgameId: number,
  score: number,
  timeTaken?: number,
  answers?: UserAnswer[]
): Promise<UserGameResult> {
  try {
    const response = await apiRequest('POST', '/api/user-game-results', {
      microgameId,
      score,
      timeTaken,
      answers: answers ? JSON.stringify(answers) : undefined,
    });
    
    const data = await response.json();
    
    // Invalidate any cached game results
    queryClient.invalidateQueries({ queryKey: ['/api/user-game-results'] });
    
    return data;
  } catch (error) {
    console.error("Error saving game result:", error);
    throw new Error("Failed to save your progress");
  }
}

/**
 * Gets the user's previous results for a specific microgame
 */
export async function getUserGameResults(microgameId?: number): Promise<UserGameResult[]> {
  try {
    const endpoint = microgameId 
      ? `/api/user-game-results?microgameId=${microgameId}` 
      : '/api/user-game-results';
      
    const response = await apiRequest('GET', endpoint);
    const data = await response.json();
    
    return data;
  } catch (error) {
    console.error("Error fetching user game results:", error);
    throw new Error("Failed to load your progress");
  }
}