// Story service for fetching and managing story content

export interface Story {
  id: number;
  title: string;
  description: string;
  chapters: Chapter[];
  subjects: string[];
  gradeLevel: string;
}

export interface Chapter {
  id: number;
  chapterNumber: number;
  title: string;
  content: string;
  vocabularyWords?: VocabularyWord[];
  question?: Question;
}

export interface VocabularyWord {
  word: string;
  definition: string;
  context: string;
}

export interface Question {
  title: string;
  description: string;
  hint?: string;
  answer: string;
}

// Fetch a story by ID
export async function fetchStory(storyId: number): Promise<Story> {
  try {
    // For now, we'll fetch from static JSON files in the public folder
    const response = await fetch(`/story-content/a-walk-to-remember.json`);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch story: ${response.statusText}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error fetching story:', error);
    throw error;
  }
}

// Get a specific chapter from a story
export function getChapter(story: Story, chapterNumber: number): Chapter | undefined {
  return story.chapters.find(chapter => chapter.chapterNumber === chapterNumber);
}

// Get the next chapter number (or undefined if at the end)
export function getNextChapterNumber(story: Story, currentChapterNumber: number): number | undefined {
  const nextChapter = story.chapters.find(chapter => chapter.chapterNumber === currentChapterNumber + 1);
  return nextChapter?.chapterNumber;
}

// Get the previous chapter number (or undefined if at the beginning)
export function getPrevChapterNumber(story: Story, currentChapterNumber: number): number | undefined {
  const prevChapter = story.chapters.find(chapter => chapter.chapterNumber === currentChapterNumber - 1);
  return prevChapter?.chapterNumber;
}

// Calculate progress percentage through the story
export function calculateProgress(story: Story, currentChapterNumber: number): number {
  const chapterIndex = story.chapters.findIndex(chapter => chapter.chapterNumber === currentChapterNumber);
  if (chapterIndex === -1) return 0;
  
  return Math.round(((chapterIndex + 1) / story.chapters.length) * 100);
}