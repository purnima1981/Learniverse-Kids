import {
  User,
  InsertUser,
  Profile,
  InsertProfile,
  Theme,
  InsertTheme,
  Subject,
  InsertSubject,
  Story,
  InsertStory,
  Chapter,
  InsertChapter,
  UserProgress,
  Flashcard,
  InsertFlashcard,
  Microgame,
  InsertMicrogame,
  UserGameResult,
  InsertUserGameResult,
  users,
  profiles,
  themes,
  subjects,
  stories,
  storySubjects,
  chapters,
  userProgress as userProgressTable,
  flashcards as flashcardsTable,
  microgames,
  userGameResults,
} from "@shared/schema";
import { db } from "./db";
import { eq, and, desc, asc } from "drizzle-orm";
import { sql } from "drizzle-orm/sql";
import session from "express-session";
import connectPg from "connect-pg-simple";
import { pool } from "./db";

// Storage interface
export interface IStorage {
  // Session management
  sessionStore: session.Store;
  
  // Users
  getUser(id: number): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  getUserByGoogleId(googleId: string): Promise<User | undefined>;
  getUserByFacebookId(facebookId: string): Promise<User | undefined>;
  getUserByAppleId(appleId: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(userId: number, updates: Partial<User>): Promise<void>;
  updateUserLastActive(userId: number): Promise<void>;
  deleteUser(userId: number): Promise<void>;
  
  // Profiles
  getProfile(id: number): Promise<Profile | undefined>;
  getProfilesByUserId(userId: number): Promise<Profile[]>;
  getDefaultProfile(userId: number): Promise<Profile | undefined>;
  createProfile(profile: InsertProfile): Promise<Profile>;
  updateProfile(profileId: number, updates: Partial<Profile>): Promise<void>;
  updateProfileTheme(profileId: number, themeId: number): Promise<void>;
  setDefaultProfile(profileId: number): Promise<void>;
  deleteProfile(profileId: number): Promise<void>;

  // Themes
  getTheme(id: number): Promise<Theme | undefined>;
  getAllThemes(): Promise<Theme[]>;
  createTheme(theme: InsertTheme): Promise<Theme>;

  // Subjects
  getSubject(id: number): Promise<Subject | undefined>;
  getAllSubjects(): Promise<Subject[]>;
  createSubject(subject: InsertSubject): Promise<Subject>;

  // Stories
  getStory(id: number): Promise<Story | undefined>;
  getStoriesByTheme(themeId: number): Promise<Story[]>;
  getStoriesByGrade(grade: string): Promise<Story[]>;
  createStory(story: InsertStory): Promise<Story>;
  getCurrentStory(userId: number): Promise<Story | undefined>;
  getRecommendedStories(userId: number): Promise<Story[]>;

  // Chapters
  getChapter(storyId: number, chapterNumber: number): Promise<Chapter | undefined>;
  createChapter(chapter: InsertChapter): Promise<Chapter>;
  
  // User Progress
  getUserProgress(userId: number): Promise<UserProgress>;
  updateUserStoryProgress(userId: number, storyId: number, chapterNumber: number): Promise<void>;
  
  // Flashcards
  getUserFlashcards(userId: number): Promise<Flashcard[]>;
  createFlashcard(flashcard: InsertFlashcard): Promise<Flashcard>;
  
  // Microgames
  getMicrogame(id: number): Promise<Microgame | undefined>;
  getMicrogamesBySubject(subject: string): Promise<Microgame[]>;
  getMicrogamesByGrade(grade: string): Promise<Microgame[]>;
  getRandomMicrogame(grade: string, subject?: string): Promise<Microgame | undefined>;
  createMicrogame(microgame: InsertMicrogame): Promise<Microgame>;
  
  // User Game Results
  saveUserGameResult(result: InsertUserGameResult): Promise<UserGameResult>;
  getUserGameResults(userId: number): Promise<UserGameResult[]>;
  getUserGameResultsByMicrogame(userId: number, microgameId: number): Promise<UserGameResult[]>;
  
  // Initial data seeding
  seedInitialData(): Promise<void>;
}

// In-memory storage implementation
export class MemStorage implements IStorage {
  sessionStore: session.Store;
  
  private users: Map<number, User>;
  private profiles: Map<number, Profile>;
  private themes: Map<number, Theme>;
  private subjects: Map<number, Subject>;
  private stories: Map<number, Story>;
  private chapters: Map<string, Chapter>; // key is storyId:chapterNumber
  private userProgress: Map<string, any>; // key is userId:storyId
  private flashcards: Map<number, Flashcard>;
  private microgames: Map<number, Microgame>;
  private userGameResults: Map<number, UserGameResult>;
  private storySubjects: Map<string, number[]>; // key is storyId, value is array of subjectIds

  // Auto-increment IDs
  private userId: number;
  private profileId: number;
  private themeId: number;
  private subjectId: number;
  private storyId: number;
  private chapterId: number;
  private flashcardId: number;
  private microgameId: number;
  private userGameResultId: number;

  constructor() {
    // Create memory store for sessions
    const MemoryStore = require('memorystore')(session);
    this.sessionStore = new MemoryStore({
      checkPeriod: 86400000 // prune expired entries every 24h
    });
    
    this.users = new Map();
    this.profiles = new Map();
    this.themes = new Map();
    this.subjects = new Map();
    this.stories = new Map();
    this.chapters = new Map();
    this.userProgress = new Map();
    this.flashcards = new Map();
    this.microgames = new Map();
    this.userGameResults = new Map();
    this.storySubjects = new Map();

    this.userId = 1;
    this.profileId = 1;
    this.themeId = 1;
    this.subjectId = 1;
    this.storyId = 1;
    this.chapterId = 1;
    this.flashcardId = 1;
    this.microgameId = 1;
    this.userGameResultId = 1;
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.email === email
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.userId++;
    const now = new Date();
    const user: User = {
      ...insertUser,
      id,
      createdAt: now,
      lastActive: now,
    };
    this.users.set(id, user);
    return user;
  }

  async updateUserTheme(userId: number, themeId: number): Promise<void> {
    const user = this.users.get(userId);
    if (user) {
      this.users.set(userId, { ...user, themeId });
    }
  }

  async updateUserLastActive(userId: number): Promise<void> {
    const user = this.users.get(userId);
    if (user) {
      this.users.set(userId, { ...user, lastActive: new Date() });
    }
  }
  
  async deleteUser(userId: number): Promise<void> {
    // Remove user from users map
    this.users.delete(userId);
    
    // Remove user's profiles
    Array.from(this.profiles.values())
      .filter(profile => profile.userId === userId)
      .forEach(profile => this.profiles.delete(profile.id));
    
    // Remove user's progress
    Array.from(this.userProgress.keys())
      .filter(key => key.startsWith(`${userId}:`))
      .forEach(key => this.userProgress.delete(key));
    
    // Remove user's flashcards
    Array.from(this.flashcards.values())
      .filter(flashcard => flashcard.userId === userId)
      .forEach(flashcard => this.flashcards.delete(flashcard.id));
  }
  
  // Social login methods
  async getUserByGoogleId(googleId: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.googleId === googleId
    );
  }

  async getUserByFacebookId(facebookId: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.facebookId === facebookId
    );
  }

  async getUserByAppleId(appleId: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.appleId === appleId
    );
  }
  
  async updateUser(userId: number, updates: Partial<User>): Promise<void> {
    const user = await this.getUser(userId);
    if (user) {
      this.users.set(userId, { ...user, ...updates });
    }
  }

  // Profile methods
  async getProfile(id: number): Promise<Profile | undefined> {
    return this.profiles.get(id);
  }
  
  async getProfilesByUserId(userId: number): Promise<Profile[]> {
    return Array.from(this.profiles.values()).filter(
      (profile) => profile.userId === userId
    );
  }
  
  async getDefaultProfile(userId: number): Promise<Profile | undefined> {
    return Array.from(this.profiles.values()).find(
      (profile) => profile.userId === userId && profile.isDefault
    );
  }
  
  async createProfile(profile: InsertProfile): Promise<Profile> {
    const id = this.profileId++;
    const now = new Date();
    
    // If this is the first profile for the user, make it the default
    const existingProfiles = await this.getProfilesByUserId(profile.userId);
    const isDefault = existingProfiles.length === 0 ? true : profile.isDefault;
    
    const newProfile: Profile = {
      ...profile,
      id,
      isDefault,
      createdAt: now,
      lastActive: now,
    };
    
    this.profiles.set(id, newProfile);
    
    // If this is a default profile, ensure no other profile for this user is default
    if (isDefault) {
      await this.setDefaultProfile(id);
    }
    
    return newProfile;
  }
  
  async updateProfile(profileId: number, updates: Partial<Profile>): Promise<void> {
    const profile = await this.getProfile(profileId);
    if (profile) {
      this.profiles.set(profileId, { ...profile, ...updates });
    }
  }
  
  async updateProfileTheme(profileId: number, themeId: number): Promise<void> {
    const profile = await this.getProfile(profileId);
    if (profile) {
      this.profiles.set(profileId, { ...profile, themeId });
    }
  }
  
  async setDefaultProfile(profileId: number): Promise<void> {
    const profile = await this.getProfile(profileId);
    if (!profile) return;
    
    // Reset isDefault for all profiles of this user
    const userProfiles = await this.getProfilesByUserId(profile.userId);
    for (const userProfile of userProfiles) {
      if (userProfile.id !== profileId) {
        await this.updateProfile(userProfile.id, { isDefault: false });
      }
    }
    
    // Set the specified profile as default
    await this.updateProfile(profileId, { isDefault: true });
  }
  
  async deleteProfile(profileId: number): Promise<void> {
    const profile = await this.getProfile(profileId);
    if (!profile) return;
    
    // Delete the profile
    this.profiles.delete(profileId);
    
    // If this was the default profile, set another profile as default if available
    if (profile.isDefault) {
      const remainingProfiles = await this.getProfilesByUserId(profile.userId);
      if (remainingProfiles.length > 0) {
        await this.setDefaultProfile(remainingProfiles[0].id);
      }
    }
  }

  // Theme methods
  async getTheme(id: number): Promise<Theme | undefined> {
    return this.themes.get(id);
  }

  async getAllThemes(): Promise<Theme[]> {
    return Array.from(this.themes.values());
  }

  async createTheme(theme: InsertTheme): Promise<Theme> {
    const id = this.themeId++;
    const newTheme: Theme = { ...theme, id };
    this.themes.set(id, newTheme);
    return newTheme;
  }

  // Subject methods
  async getSubject(id: number): Promise<Subject | undefined> {
    return this.subjects.get(id);
  }

  async getAllSubjects(): Promise<Subject[]> {
    return Array.from(this.subjects.values());
  }

  async createSubject(subject: InsertSubject): Promise<Subject> {
    const id = this.subjectId++;
    const newSubject: Subject = { ...subject, id };
    this.subjects.set(id, newSubject);
    return newSubject;
  }

  // Story methods
  async getStory(id: number): Promise<Story | undefined> {
    const story = this.stories.get(id);
    if (!story) return undefined;

    // Add subjects
    const subjectIds = this.storySubjects.get(id.toString()) || [];
    const subjects = subjectIds
      .map((subjectId) => this.subjects.get(subjectId))
      .filter((subject): subject is Subject => subject !== undefined);

    return {
      ...story,
      subjects,
      progressPercent: 0, // Default value
    };
  }

  async getStoriesByTheme(themeId: number): Promise<Story[]> {
    return Array.from(this.stories.values())
      .filter((story) => story.themeId === themeId)
      .map((story) => {
        // Add subjects
        const subjectIds = this.storySubjects.get(story.id.toString()) || [];
        const subjects = subjectIds
          .map((subjectId) => this.subjects.get(subjectId))
          .filter((subject): subject is Subject => subject !== undefined);

        return {
          ...story,
          subjects,
          progressPercent: 0,
        };
      });
  }

  async getStoriesByGrade(grade: string): Promise<Story[]> {
    return Array.from(this.stories.values())
      .filter((story) => story.gradeLevel === grade)
      .map((story) => {
        // Add subjects
        const subjectIds = this.storySubjects.get(story.id.toString()) || [];
        const subjects = subjectIds
          .map((subjectId) => this.subjects.get(subjectId))
          .filter((subject): subject is Subject => subject !== undefined);

        return {
          ...story,
          subjects,
          progressPercent: 0,
        };
      });
  }

  async createStory(story: InsertStory): Promise<Story> {
    const id = this.storyId++;
    const newStory: Story = {
      ...story,
      id,
      subjects: [],
      progressPercent: 0,
    };
    this.stories.set(id, newStory);
    return newStory;
  }

  async getCurrentStory(userId: number): Promise<Story | undefined> {
    // Find the story in progress for this user
    const user = this.users.get(userId);
    if (!user) return undefined;

    // For demo purpose, return the first story of user's theme
    const storiesOfTheme = await this.getStoriesByTheme(user.themeId || 1);
    if (storiesOfTheme.length === 0) return undefined;

    const story = storiesOfTheme[0];
    
    // Find user progress for this story
    const progressKey = `${userId}:${story.id}`;
    const progress = this.userProgress.get(progressKey);
    
    // If progress exists, update the story with progress info
    if (progress) {
      const completedChapters = progress.completedChapters || [];
      const currentChapter = progress.currentChapter || 1;
      
      // Get current chapter title
      const chapterKey = `${story.id}:${currentChapter}`;
      const chapter = this.chapters.get(chapterKey);
      
      return {
        ...story,
        currentChapter,
        currentChapterTitle: chapter?.title || "Unknown Chapter",
        progressPercent: Math.round((completedChapters.length / story.totalChapters) * 100),
      };
    }
    
    // If no progress, return story with default progress values
    return {
      ...story,
      currentChapter: 1,
      currentChapterTitle: "Chapter 1",
      progressPercent: 0,
    };
  }

  async getRecommendedStories(userId: number): Promise<Story[]> {
    const user = this.users.get(userId);
    if (!user) return [];

    // For demo, return the stories of user's theme
    const storiesOfTheme = await this.getStoriesByTheme(user.themeId || 1);
    
    // Exclude the current story
    const currentStory = await this.getCurrentStory(userId);
    return storiesOfTheme.filter(story => story.id !== currentStory?.id);
  }

  // Chapter methods
  async getChapter(storyId: number, chapterNumber: number): Promise<Chapter | undefined> {
    const key = `${storyId}:${chapterNumber}`;
    const chapter = this.chapters.get(key);
    
    if (!chapter) return undefined;
    
    // Add previous and next chapter info
    const totalChapters = this.stories.get(storyId)?.totalChapters || 1;
    
    return {
      ...chapter,
      previousChapter: chapterNumber > 1 ? chapterNumber - 1 : undefined,
      nextChapter: chapterNumber < totalChapters ? chapterNumber + 1 : undefined,
    };
  }

  async createChapter(chapter: InsertChapter): Promise<Chapter> {
    const id = this.chapterId++;
    const newChapter: Chapter = { ...chapter, id };
    
    const key = `${chapter.storyId}:${chapter.chapterNumber}`;
    this.chapters.set(key, newChapter);
    
    return newChapter;
  }

  // User Progress methods
  async getUserProgress(userId: number): Promise<UserProgress> {
    // Get all user progress entries
    const userProgressEntries = Array.from(this.userProgress.entries())
      .filter(([key]) => key.startsWith(`${userId}:`))
      .map(([_, value]) => value);
    
    // Calculate total completed chapters
    const completedChapters = userProgressEntries.reduce(
      (total, progress) => total + (progress.completedChapters?.length || 0),
      0
    );
    
    // Calculate total chapters
    const totalChapters = userProgressEntries.reduce(
      (total, progress) => {
        const story = this.stories.get(progress.storyId);
        return total + (story?.totalChapters || 0);
      },
      0
    );
    
    // For demo purposes, create some placeholder data
    return {
      storyProgressPercent: totalChapters > 0 ? Math.round((completedChapters / totalChapters) * 100) : 0,
      completedChapters,
      totalChapters,
      daysActive: 3, // Placeholder
      vocabularyLearned: 42, // Placeholder
      vocabularyGoal: 60, // Placeholder
    };
  }

  async updateUserStoryProgress(userId: number, storyId: number, chapterNumber: number): Promise<void> {
    const key = `${userId}:${storyId}`;
    const existing = this.userProgress.get(key) || {
      userId,
      storyId,
      currentChapter: 1,
      completedChapters: [],
      lastAccessedAt: new Date(),
    };
    
    // Update current chapter
    const updated = {
      ...existing,
      currentChapter: chapterNumber,
      lastAccessedAt: new Date(),
    };
    
    // Add to completed chapters if not already included
    if (!updated.completedChapters.includes(chapterNumber - 1) && chapterNumber > 1) {
      updated.completedChapters.push(chapterNumber - 1);
    }
    
    this.userProgress.set(key, updated);
  }

  // Flashcard methods
  async getUserFlashcards(userId: number): Promise<Flashcard[]> {
    return Array.from(this.flashcards.values()).filter(
      (flashcard) => flashcard.userId === userId
    );
  }

  async createFlashcard(flashcard: InsertFlashcard): Promise<Flashcard> {
    const id = this.flashcardId++;
    const newFlashcard: Flashcard = { ...flashcard, id };
    this.flashcards.set(id, newFlashcard);
    return newFlashcard;
  }

  // Microgame methods
  async getMicrogame(id: number): Promise<Microgame | undefined> {
    return this.microgames.get(id);
  }

  async getMicrogamesBySubject(subject: string): Promise<Microgame[]> {
    return Array.from(this.microgames.values()).filter(
      (microgame) => microgame.subject === subject
    );
  }

  async getMicrogamesByGrade(grade: string): Promise<Microgame[]> {
    return Array.from(this.microgames.values()).filter(
      (microgame) => microgame.gradeLevel === grade
    );
  }

  async getRandomMicrogame(grade: string, subject?: string): Promise<Microgame | undefined> {
    let games = await this.getMicrogamesByGrade(grade);
    
    if (subject) {
      games = games.filter((game) => game.subject === subject);
    }
    
    if (games.length === 0) return undefined;
    
    // Return a random game
    const randomIndex = Math.floor(Math.random() * games.length);
    return games[randomIndex];
  }

  async createMicrogame(microgame: InsertMicrogame): Promise<Microgame> {
    const id = this.microgameId++;
    const newMicrogame: Microgame = { ...microgame, id };
    this.microgames.set(id, newMicrogame);
    return newMicrogame;
  }

  // User Game Results methods
  async saveUserGameResult(result: InsertUserGameResult): Promise<UserGameResult> {
    const id = this.userGameResultId++;
    const newResult: UserGameResult = { 
      ...result, 
      id,
      completedAt: new Date()
    };
    this.userGameResults.set(id, newResult);
    return newResult;
  }

  async getUserGameResults(userId: number): Promise<UserGameResult[]> {
    return Array.from(this.userGameResults.values()).filter(
      (result) => result.userId === userId
    );
  }

  async getUserGameResultsByMicrogame(userId: number, microgameId: number): Promise<UserGameResult[]> {
    return Array.from(this.userGameResults.values()).filter(
      (result) => result.userId === userId && result.microgameId === microgameId
    );
  }
  
  // Add subjects to a story
  async addSubjectsToStory(storyId: number, subjectIds: number[]): Promise<void> {
    this.storySubjects.set(storyId.toString(), subjectIds);
  }

  // Seed initial data for demo
  async seedInitialData(): Promise<void> {
    // Create themes
    const themes = [
      {
        name: "Mythologies",
        description: "Explore ancient stories and legends",
        imageUrl: "https://via.placeholder.com/500x300?text=Mythologies",
      },
      {
        name: "Folklore",
        description: "Discover traditional stories and customs",
        imageUrl: "https://via.placeholder.com/500x300?text=Folklore",
      },
      {
        name: "Sports",
        description: "Learn through games and athletics",
        imageUrl: "https://via.placeholder.com/500x300?text=Sports",
      },
      {
        name: "Space Exploration",
        description: "Journey through the cosmos",
        imageUrl: "https://via.placeholder.com/500x300?text=Space+Exploration",
      },
      {
        name: "Historical Voyages",
        description: "Travel through time and history",
        imageUrl: "https://via.placeholder.com/500x300?text=Historical+Voyages",
      },
      {
        name: "Ancient Civilization",
        description: "Discover lost worlds and cultures",
        imageUrl: "https://via.placeholder.com/500x300?text=Ancient+Civilization",
      },
      {
        name: "Fiction",
        description: "Explore imaginary worlds and adventures",
        imageUrl: "https://via.placeholder.com/500x300?text=Fiction",
      },
    ];

    for (const theme of themes) {
      await this.createTheme(theme);
    }

    // Create subjects
    const subjects = [
      { name: "Mathematics", code: "mathematics" },
      { name: "Physics", code: "physics" },
      { name: "Chemistry", code: "chemistry" },
      { name: "Biology", code: "biology" },
      { name: "Astronomy", code: "astronomy" },
      { name: "History", code: "history" },
      { name: "Geography", code: "geography" },
      { name: "Literature", code: "literature" },
      { name: "Engineering", code: "engineering" },
      { name: "Economics", code: "economics" },
    ];

    for (const subject of subjects) {
      await this.createSubject(subject);
    }

    // Create a space story
    const spaceStory = await this.createStory({
      title: "Journey to the Stars",
      description: "Join astronaut Maya as she prepares for her mission to the International Space Station! Learn about orbital mechanics, calculate distances between celestial bodies, and discover how astronauts live in zero gravity.",
      imageUrl: "https://via.placeholder.com/500x300?text=Journey+to+the+Stars",
      themeId: 4, // Space Exploration
      gradeLevel: "5",
      totalChapters: 10,
    });

    // Add subjects to the space story
    await this.addSubjectsToStory(spaceStory.id, [1, 2, 5]); // Math, Physics, Astronomy

    // Create chapters for the space story
    const spaceChapter1 = await this.createChapter({
      storyId: spaceStory.id,
      chapterNumber: 1,
      title: "Preparing for Launch",
      content: `<p>Maya had dreamed of becoming an astronaut since she was a little girl. Now, at the age of 35, she was finally going to space.</p>
      <p>"The training has been intense," Maya told her family during their last video call before launch day. "We've been preparing for every possible scenario."</p>
      <p>Maya's daughter, Sofia, had a question. "Mom, how fast will your rocket go?"</p>
      <p>Maya smiled. "Great question! Our rocket needs to reach what we call <span class="bg-yellow-300/20 px-1 rounded cursor-help" title="An escape velocity is the minimum speed needed for an object to escape from a planet's gravitational pull.">escape velocity</span>, which is about 11.2 kilometers per second."</p>
      <p>"That's super fast!" Sofia's eyes widened. "How do you calculate that?"</p>
      <p>"It's actually a math formula that uses gravity and the size of Earth," Maya explained.</p>`,
      question: {
        title: "Calculating Speed",
        description: "If the rocket accelerates at 30 meters per second squared, how many seconds will it take to reach escape velocity (11.2 km/s)?",
        hint: "Convert km/s to m/s first, then use the formula: time = velocity / acceleration",
        answer: "373",
      },
      vocabularyWords: [
        {
          word: "escape velocity",
          definition: "The minimum speed needed for an object to escape from a planet's gravitational pull",
          context: "The rocket needs to reach escape velocity to break free from Earth's gravity.",
        },
        {
          word: "gravitational",
          definition: "Relating to gravity, which is the force that attracts objects toward the center of the Earth",
          context: "The gravitational pull of Earth keeps us on the ground.",
        },
      ],
    });

    const spaceChapter2 = await this.createChapter({
      storyId: spaceStory.id,
      chapterNumber: 2,
      title: "The Launch Sequence",
      content: `<p>Maya checked her spacesuit one last time before entering the spacecraft. Today was the big day – she was finally going to launch into space!</p>
      
      <p>"Remember," said Commander Rodriguez, "a successful launch depends on precise calculations. We need to reach <span class="bg-yellow-300/20 px-1 rounded cursor-help" title="An escape velocity is the minimum speed needed for an object to escape from a planet's gravitational pull.">escape velocity</span> of about 11.2 kilometers per second to break free from Earth's gravity."</p>
      
      <p>Maya nodded. She had spent months studying the mathematics behind orbital mechanics.</p>
      
      <div class="bg-white/10 p-4 rounded-lg my-6">
        <h3 class="font-bold text-xl mb-2">Understanding Escape Velocity</h3>
        <p class="mb-2">The formula for escape velocity is:</p>
        <div class="bg-black/30 p-3 rounded text-center my-3">
          <p class="font-mono">v<sub>e</sub> = √(2GM/r)</p>
        </div>
        <p>Where:</p>
        <ul class="list-disc pl-5 space-y-1">
          <li>v<sub>e</sub> is the escape velocity</li>
          <li>G is the gravitational constant (6.674 × 10<sup>-11</sup> m<sup>3</sup> kg<sup>-1</sup> s<sup>-2</sup>)</li>
          <li>M is the mass of the planet (for Earth: 5.972 × 10<sup>24</sup> kg)</li>
          <li>r is the distance from the center of the planet (for Earth's surface: 6.371 × 10<sup>6</sup> m)</li>
        </ul>
      </div>
      
      <p>"The rocket will accelerate at 3g," explained the engineer, "which means it will increase speed at three times the rate of Earth's gravity – about 29.4 meters per second squared."</p>
      
      <p>Maya did a quick calculation in her head. "So if we maintain that acceleration, we'll reach escape velocity in just about..." she paused, working through the math.</p>`,
      question: {
        title: "Your Turn: Calculate the Time",
        description: "If the rocket accelerates at 29.4 m/s², how many seconds will it take to reach escape velocity (11.2 km/s)?",
        hint: "Use the formula for acceleration: v = at, where v is final velocity, a is acceleration, and t is time.",
        answer: "381",
      },
      vocabularyWords: [
        {
          word: "orbital mechanics",
          definition: "The science of the motion of objects in space, especially artificial satellites",
          context: "Maya had spent months studying the mathematics behind orbital mechanics.",
        },
        {
          word: "acceleration",
          definition: "The rate at which the velocity of an object changes over time",
          context: "The rocket's acceleration will be three times the Earth's gravity.",
        },
      ],
    });

    // Create more stories
    const stellarMath = await this.createStory({
      title: "Stellar Math",
      description: "Calculate distances between planets and understand the scale of our solar system.",
      imageUrl: "https://via.placeholder.com/500x300?text=Stellar+Math",
      themeId: 4, // Space Exploration
      gradeLevel: "5",
      totalChapters: 8,
    });
    
    await this.addSubjectsToStory(stellarMath.id, [1, 5]); // Math, Astronomy
    
    const spaceStationEngineering = await this.createStory({
      title: "Space Station Engineering",
      description: "Learn about the engineering challenges of building structures in space.",
      imageUrl: "https://via.placeholder.com/500x300?text=Space+Station+Engineering",
      themeId: 4, // Space Exploration
      gradeLevel: "5",
      totalChapters: 7,
    });
    
    await this.addSubjectsToStory(spaceStationEngineering.id, [2, 9]); // Physics, Engineering
    
    const cosmicChemistry = await this.createStory({
      title: "Cosmic Chemistry",
      description: "Discover the elements that make up stars and how they're formed in space.",
      imageUrl: "https://via.placeholder.com/500x300?text=Cosmic+Chemistry",
      themeId: 4, // Space Exploration
      gradeLevel: "5",
      totalChapters: 6,
    });
    
    await this.addSubjectsToStory(cosmicChemistry.id, [3, 5]); // Chemistry, Astronomy
    
    // Create sample microgames for quick feedback
    const mathGame1 = await this.createMicrogame({
      title: "Cosmic Calculations",
      type: "quiz",
      difficulty: "easy",
      subject: "Mathematics",
      gradeLevel: "5",
      instructions: "Calculate the answers to these space math problems!",
      content: {
        questions: [
          {
            id: 1,
            question: "If a space shuttle travels at 28,000 km/h, how far will it travel in 3 hours?",
            options: ["56,000 km", "84,000 km", "28,003 km", "31,000 km"],
            answer: 1 // 84,000 km
          },
          {
            id: 2,
            question: "The Moon is approximately 384,400 km from Earth. If a spacecraft travels at 3,600 km/h, how many hours will it take to reach the Moon?",
            options: ["96 hours", "107 hours", "110 hours", "120 hours"],
            answer: 1 // 107 hours (rounded)
          },
          {
            id: 3,
            question: "If an astronaut weighs 80 kg on Earth, how much would they weigh on the Moon where gravity is 1/6 of Earth's?",
            options: ["13.3 kg", "70 kg", "480 kg", "16 kg"],
            answer: 0 // 13.3 kg
          }
        ]
      },
      timeLimit: 120,
      points: 15
    });
    
    const physicsGame = await this.createMicrogame({
      title: "Gravity Master",
      type: "arrange",
      difficulty: "medium",
      subject: "Physics",
      gradeLevel: "5",
      instructions: "Arrange these objects from the lowest to highest falling speed in a vacuum.",
      content: {
        items: [
          { id: 1, text: "Feather", position: 1 },
          { id: 2, text: "Basketball", position: 1 },
          { id: 3, text: "Bowling Ball", position: 1 },
          { id: 4, text: "Paper", position: 1 }
        ],
        correctOrder: [1, 2, 3, 4], // In vacuum, they all fall at the same rate
        explanation: "In a vacuum, all objects fall at the same rate regardless of their mass. This is because there's no air resistance to slow down lighter objects."
      },
      timeLimit: 60,
      points: 10
    });
    
    const astronomyGame = await this.createMicrogame({
      title: "Planet Matcher",
      type: "match",
      difficulty: "easy",
      subject: "Astronomy",
      gradeLevel: "5",
      instructions: "Match each planet with its correct characteristic!",
      content: {
        pairs: [
          { id: 1, left: "Mercury", right: "Closest to the Sun" },
          { id: 2, left: "Venus", right: "Hottest planet" },
          { id: 3, left: "Earth", right: "Only planet with liquid water on its surface" },
          { id: 4, left: "Mars", right: "Known as the Red Planet" },
          { id: 5, left: "Jupiter", right: "Largest planet in our solar system" }
        ]
      },
      timeLimit: 90,
      points: 10
    });
    
    const chemistryGame = await this.createMicrogame({
      title: "Element Explorer",
      type: "fill-in-blank",
      difficulty: "medium",
      subject: "Chemistry",
      gradeLevel: "5",
      instructions: "Fill in the blanks with the correct chemical symbols for these elements!",
      content: {
        sentences: [
          { 
            id: 1, 
            text: "Oxygen has the chemical symbol __.", 
            answer: "O", 
            hint: "This element is essential for breathing." 
          },
          { 
            id: 2, 
            text: "Water (H₂O) is made of hydrogen and __.", 
            answer: "oxygen", 
            hint: "It's the same element from the first question." 
          },
          { 
            id: 3, 
            text: "The chemical symbol for hydrogen is __.", 
            answer: "H", 
            hint: "It's the lightest element in the periodic table." 
          }
        ]
      },
      timeLimit: 60,
      points: 15
    });
  }
}

// Database storage implementation
export class DatabaseStorage implements IStorage {
  sessionStore: session.Store;

  constructor() {
    // Initialize session store with PostgreSQL
    const PostgresSessionStore = connectPg(session);
    this.sessionStore = new PostgresSessionStore({ 
      pool, 
      createTableIfMissing: true 
    });
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user;
  }
  
  async getUserByGoogleId(googleId: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.googleId, googleId));
    return user;
  }

  async getUserByFacebookId(facebookId: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.facebookId, facebookId));
    return user;
  }

  async getUserByAppleId(appleId: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.appleId, appleId));
    return user;
  }

  async createUser(user: InsertUser): Promise<User> {
    const [newUser] = await db.insert(users).values(user).returning();
    return newUser;
  }
  
  async updateUser(userId: number, updates: Partial<User>): Promise<void> {
    await db.update(users)
      .set(updates)
      .where(eq(users.id, userId));
  }

  async updateUserTheme(userId: number, themeId: number): Promise<void> {
    await db.update(users)
      .set({ themeId })
      .where(eq(users.id, userId));
  }

  async updateUserLastActive(userId: number): Promise<void> {
    await db.update(users)
      .set({ lastActive: new Date() })
      .where(eq(users.id, userId));
  }
  
  async deleteUser(userId: number): Promise<void> {
    try {
      // Delete user's profiles first
      await db.delete(profiles).where(eq(profiles.userId, userId));
      
      // Delete user's progress to maintain referential integrity
      await db.delete(userProgressTable).where(eq(userProgressTable.userId, userId));
      
      // Delete user's flashcards
      await db.delete(flashcardsTable).where(eq(flashcardsTable.userId, userId));
      
      // Finally delete the user
      await db.delete(users).where(eq(users.id, userId));
    } catch (error) {
      console.error("Error deleting user:", error);
      throw error;
    }
  }
  
  // Profile methods
  async getProfile(id: number): Promise<Profile | undefined> {
    const [profile] = await db.select().from(profiles).where(eq(profiles.id, id));
    return profile;
  }
  
  async getProfilesByUserId(userId: number): Promise<Profile[]> {
    return await db.select().from(profiles).where(eq(profiles.userId, userId));
  }
  
  async getDefaultProfile(userId: number): Promise<Profile | undefined> {
    const [profile] = await db.select()
      .from(profiles)
      .where(and(
        eq(profiles.userId, userId),
        eq(profiles.isDefault, true)
      ));
    return profile;
  }
  
  async createProfile(profile: InsertProfile): Promise<Profile> {
    // If this is the first profile for the user, make it the default
    const existingProfiles = await this.getProfilesByUserId(profile.userId);
    const isDefault = existingProfiles.length === 0 ? true : profile.isDefault;
    
    const [createdProfile] = await db.insert(profiles)
      .values({ ...profile, isDefault })
      .returning();
    
    // If this is a default profile, ensure no other profile for this user is default
    if (isDefault) {
      await this.setDefaultProfile(createdProfile.id);
    }
    
    return createdProfile;
  }
  
  async updateProfile(profileId: number, updates: Partial<Profile>): Promise<void> {
    await db.update(profiles)
      .set(updates)
      .where(eq(profiles.id, profileId));
  }
  
  async updateProfileTheme(profileId: number, themeId: number): Promise<void> {
    await db.update(profiles)
      .set({ themeId })
      .where(eq(profiles.id, profileId));
  }
  
  async setDefaultProfile(profileId: number): Promise<void> {
    const [profile] = await db.select().from(profiles).where(eq(profiles.id, profileId));
    if (!profile) return;
    
    // Reset isDefault for all profiles of this user
    await db.update(profiles)
      .set({ isDefault: false })
      .where(and(
        eq(profiles.userId, profile.userId),
        sql`${profiles.id} != ${profileId}`
      ));
    
    // Set the specified profile as default
    await db.update(profiles)
      .set({ isDefault: true })
      .where(eq(profiles.id, profileId));
  }
  
  async deleteProfile(profileId: number): Promise<void> {
    const [profile] = await db.select().from(profiles).where(eq(profiles.id, profileId));
    if (!profile) return;
    
    // Delete the profile
    await db.delete(profiles).where(eq(profiles.id, profileId));
    
    // If this was the default profile, set another profile as default if available
    if (profile.isDefault) {
      const remainingProfiles = await db.select()
        .from(profiles)
        .where(eq(profiles.userId, profile.userId))
        .limit(1);
      
      if (remainingProfiles.length > 0) {
        await this.setDefaultProfile(remainingProfiles[0].id);
      }
    }
  }

  // Theme methods
  async getTheme(id: number): Promise<Theme | undefined> {
    const [theme] = await db.select().from(themes).where(eq(themes.id, id));
    return theme;
  }

  async getAllThemes(): Promise<Theme[]> {
    return db.select().from(themes);
  }

  async createTheme(theme: InsertTheme): Promise<Theme> {
    const [newTheme] = await db.insert(themes).values(theme).returning();
    return newTheme;
  }

  // Subject methods
  async getSubject(id: number): Promise<Subject | undefined> {
    const [subject] = await db.select().from(subjects).where(eq(subjects.id, id));
    return subject;
  }

  async getAllSubjects(): Promise<Subject[]> {
    return db.select().from(subjects);
  }

  async createSubject(subject: InsertSubject): Promise<Subject> {
    const [newSubject] = await db.insert(subjects).values(subject).returning();
    return newSubject;
  }

  // Story methods
  async getStory(id: number): Promise<Story | undefined> {
    const [story] = await db.select().from(stories).where(eq(stories.id, id));
    if (!story) return undefined;

    // Get subjects for this story
    const storySubjectsData = await db
      .select()
      .from(storySubjects)
      .leftJoin(subjects, eq(storySubjects.subjectId, subjects.id))
      .where(eq(storySubjects.storyId, id));

    const subjectList = storySubjectsData.map(row => ({
      id: row.subjects.id,
      name: row.subjects.name,
      code: row.subjects.code
    }));

    return {
      ...story,
      subjects: subjectList,
      progressPercent: 0 // Default value, will be updated if user progress exists
    };
  }

  async getStoriesByTheme(themeId: number): Promise<Story[]> {
    const storiesData = await db
      .select()
      .from(stories)
      .where(eq(stories.themeId, themeId));

    // Add subjects to each story
    const result: Story[] = [];
    for (const story of storiesData) {
      const storyWithSubjects = await this.getStory(story.id);
      if (storyWithSubjects) {
        result.push(storyWithSubjects);
      }
    }

    return result;
  }

  async getStoriesByGrade(grade: string): Promise<Story[]> {
    const storiesData = await db
      .select()
      .from(stories)
      .where(eq(stories.gradeLevel, grade));

    // Add subjects to each story
    const result: Story[] = [];
    for (const story of storiesData) {
      const storyWithSubjects = await this.getStory(story.id);
      if (storyWithSubjects) {
        result.push(storyWithSubjects);
      }
    }

    return result;
  }

  async createStory(story: InsertStory): Promise<Story> {
    const [newStory] = await db.insert(stories).values(story).returning();
    
    return {
      ...newStory,
      subjects: [],
      progressPercent: 0
    };
  }

  async getCurrentStory(userId: number): Promise<Story | undefined> {
    // Find the user
    const user = await this.getUser(userId);
    if (!user) return undefined;

    // Get the most recently accessed story for this user
    const [userProgressEntry] = await db
      .select()
      .from(userProgressTable)
      .where(eq(userProgressTable.userId, userId))
      .orderBy(desc(userProgressTable.lastAccessedAt))
      .limit(1);

    // If user has no progress, return the first story of their theme
    if (!userProgressEntry) {
      const storiesOfTheme = await this.getStoriesByTheme(user.themeId || 1);
      if (storiesOfTheme.length === 0) return undefined;

      return {
        ...storiesOfTheme[0],
        currentChapter: 1,
        currentChapterTitle: "Chapter 1",
        progressPercent: 0,
      };
    }

    // Get the story with subjects
    const story = await this.getStory(userProgressEntry.storyId);
    if (!story) return undefined;

    // Get chapter title
    const [chapter] = await db
      .select()
      .from(chapters)
      .where(and(
        eq(chapters.storyId, userProgressEntry.storyId),
        eq(chapters.chapterNumber, userProgressEntry.currentChapter)
      ));

    // Calculate progress percentage
    const completedChaptersCount = userProgressEntry.completedChapters 
      ? (userProgressEntry.completedChapters as number[]).length 
      : 0;
    
    const progressPercent = Math.round((completedChaptersCount / story.totalChapters) * 100);

    return {
      ...story,
      currentChapter: userProgressEntry.currentChapter,
      currentChapterTitle: chapter?.title || "Unknown Chapter",
      progressPercent
    };
  }

  async getRecommendedStories(userId: number): Promise<Story[]> {
    const user = await this.getUser(userId);
    if (!user) return [];

    // Get all stories for this user's theme
    const storiesOfTheme = await this.getStoriesByTheme(user.themeId || 1);
    
    // Get the current story
    const currentStory = await this.getCurrentStory(userId);
    if (!currentStory) return storiesOfTheme;
    
    // Return all stories except the current one
    return storiesOfTheme.filter(story => story.id !== currentStory.id);
  }

  // Chapter methods
  async getChapter(storyId: number, chapterNumber: number): Promise<Chapter | undefined> {
    const [chapter] = await db
      .select()
      .from(chapters)
      .where(and(
        eq(chapters.storyId, storyId),
        eq(chapters.chapterNumber, chapterNumber)
      ));
    
    if (!chapter) return undefined;
    
    // Get story to check total chapters
    const [story] = await db
      .select()
      .from(stories)
      .where(eq(stories.id, storyId));
    
    if (!story) return undefined;
    
    return {
      ...chapter,
      previousChapter: chapterNumber > 1 ? chapterNumber - 1 : undefined,
      nextChapter: chapterNumber < story.totalChapters ? chapterNumber + 1 : undefined,
    };
  }

  async createChapter(chapter: InsertChapter): Promise<Chapter> {
    const [newChapter] = await db.insert(chapters).values(chapter).returning();
    
    return newChapter;
  }

  // User Progress methods
  async getUserProgress(userId: number): Promise<UserProgress> {
    // Get all progress entries for this user
    const userProgressEntries = await db
      .select()
      .from(userProgressTable)
      .where(eq(userProgressTable.userId, userId));
    
    // Get all stories relevant to this user
    const storiesData = await db
      .select({ id: stories.id, totalChapters: stories.totalChapters })
      .from(stories)
      .leftJoin(userProgressTable, eq(stories.id, userProgressTable.storyId))
      .where(eq(userProgressTable.userId, userId));
    
    // Calculate total completed chapters
    let completedChapters = 0;
    for (const entry of userProgressEntries) {
      if (entry.completedChapters) {
        completedChapters += (entry.completedChapters as number[]).length;
      }
    }
    
    // Calculate total chapters
    const totalChapters = storiesData.reduce(
      (total, story) => total + story.totalChapters,
      0
    );
    
    // Get days active 
    const daysActive = 3; // Mock value for now
    
    // Get vocabulary stats
    const flashcardsCount = await db
      .select({ count: sql<number>`count(*)` })
      .from(flashcardsTable)
      .where(eq(flashcardsTable.userId, userId));
    
    const vocabularyLearned = flashcardsCount[0]?.count || 0;
    const vocabularyGoal = 60; // Default goal
    
    return {
      storyProgressPercent: totalChapters > 0 ? Math.round((completedChapters / totalChapters) * 100) : 0,
      completedChapters,
      totalChapters,
      daysActive,
      vocabularyLearned,
      vocabularyGoal,
    };
  }

  async updateUserStoryProgress(userId: number, storyId: number, chapterNumber: number): Promise<void> {
    // Check if progress entry exists
    const [existingProgress] = await db
      .select()
      .from(userProgressTable)
      .where(and(
        eq(userProgressTable.userId, userId),
        eq(userProgressTable.storyId, storyId)
      ));
    
    if (existingProgress) {
      // Update existing progress
      let completedChapters = existingProgress.completedChapters as number[] || [];
      
      // Add previous chapter to completed chapters if moving forward
      if (!completedChapters.includes(chapterNumber - 1) && chapterNumber > 1) {
        completedChapters.push(chapterNumber - 1);
      }
      
      await db
        .update(userProgressTable)
        .set({
          currentChapter: chapterNumber,
          completedChapters,
          lastAccessedAt: new Date()
        })
        .where(and(
          eq(userProgressTable.userId, userId),
          eq(userProgressTable.storyId, storyId)
        ));
    } else {
      // Create new progress entry
      const completedChapters = chapterNumber > 1 ? [chapterNumber - 1] : [];
      
      await db
        .insert(userProgressTable)
        .values({
          userId,
          storyId,
          currentChapter: chapterNumber,
          completedChapters,
        });
    }
  }

  // Flashcard methods
  async getUserFlashcards(userId: number): Promise<Flashcard[]> {
    return db
      .select()
      .from(flashcardsTable)
      .where(eq(flashcardsTable.userId, userId));
  }

  async createFlashcard(flashcard: InsertFlashcard): Promise<Flashcard> {
    const [newFlashcard] = await db
      .insert(flashcardsTable)
      .values(flashcard)
      .returning();
    
    return newFlashcard;
  }

  // Add subjects to a story
  async addSubjectsToStory(storyId: number, subjectIds: number[]): Promise<void> {
    // Remove existing subjects
    await db
      .delete(storySubjects)
      .where(eq(storySubjects.storyId, storyId));
    
    // Add new subjects
    for (const subjectId of subjectIds) {
      await db
        .insert(storySubjects)
        .values({ storyId, subjectId });
    }
  }

  // Microgame methods
  async getMicrogame(id: number): Promise<Microgame | undefined> {
    const [microgame] = await db
      .select()
      .from(microgames)
      .where(eq(microgames.id, id));
    
    return microgame;
  }

  async getMicrogamesBySubject(subject: string): Promise<Microgame[]> {
    return db
      .select()
      .from(microgames)
      .where(eq(microgames.subject, subject));
  }

  async getMicrogamesByGrade(grade: string): Promise<Microgame[]> {
    return db
      .select()
      .from(microgames)
      .where(eq(microgames.gradeLevel, grade));
  }

  async getRandomMicrogame(grade: string, subject?: string): Promise<Microgame | undefined> {
    let query = db
      .select()
      .from(microgames)
      .where(eq(microgames.gradeLevel, grade));
    
    if (subject) {
      query = db
        .select()
        .from(microgames)
        .where(and(
          eq(microgames.gradeLevel, grade),
          eq(microgames.subject, subject)
        ));
    }
    
    const games = await query;
    
    if (games.length === 0) return undefined;
    
    // Return a random game
    const randomIndex = Math.floor(Math.random() * games.length);
    return games[randomIndex];
  }

  async createMicrogame(microgame: InsertMicrogame): Promise<Microgame> {
    const [newMicrogame] = await db
      .insert(microgames)
      .values({
        ...microgame,
        createdAt: new Date()
      })
      .returning();
    
    return newMicrogame;
  }

  // User Game Results methods
  async saveUserGameResult(result: InsertUserGameResult): Promise<UserGameResult> {
    const [newResult] = await db
      .insert(userGameResults)
      .values({
        ...result,
        completedAt: new Date(),
        answers: result.answers || null,
        timeTaken: result.timeTaken || null
      })
      .returning();
    
    return newResult;
  }

  async getUserGameResults(userId: number): Promise<UserGameResult[]> {
    return db
      .select()
      .from(userGameResults)
      .where(eq(userGameResults.userId, userId))
      .orderBy(desc(userGameResults.completedAt));
  }

  async getUserGameResultsByMicrogame(userId: number, microgameId: number): Promise<UserGameResult[]> {
    return db
      .select()
      .from(userGameResults)
      .where(and(
        eq(userGameResults.userId, userId),
        eq(userGameResults.microgameId, microgameId)
      ))
      .orderBy(desc(userGameResults.completedAt));
  }

  // Seed initial data for demo
  async seedInitialData(): Promise<void> {
    // Create themes
    const themes = [
      {
        name: "Mythologies",
        description: "Explore ancient stories and legends",
        imageUrl: "https://via.placeholder.com/500x300?text=Mythologies",
      },
      {
        name: "Folklore",
        description: "Discover traditional stories and customs",
        imageUrl: "https://via.placeholder.com/500x300?text=Folklore",
      },
      {
        name: "Sports",
        description: "Learn through games and athletics",
        imageUrl: "https://via.placeholder.com/500x300?text=Sports",
      },
      {
        name: "Space Exploration",
        description: "Journey through the cosmos",
        imageUrl: "https://via.placeholder.com/500x300?text=Space+Exploration",
      },
      {
        name: "Historical Voyages",
        description: "Travel through time and history",
        imageUrl: "https://via.placeholder.com/500x300?text=Historical+Voyages",
      },
      {
        name: "Ancient Civilization",
        description: "Discover lost worlds and cultures",
        imageUrl: "https://via.placeholder.com/500x300?text=Ancient+Civilization",
      },
      {
        name: "Fiction",
        description: "Explore imaginary worlds and adventures",
        imageUrl: "https://via.placeholder.com/500x300?text=Fiction",
      },
    ];

    for (const theme of themes) {
      await this.createTheme(theme);
    }

    // Create subjects
    const subjects = [
      { name: "Mathematics", code: "mathematics" },
      { name: "Physics", code: "physics" },
      { name: "Chemistry", code: "chemistry" },
      { name: "Biology", code: "biology" },
      { name: "Astronomy", code: "astronomy" },
      { name: "History", code: "history" },
      { name: "Geography", code: "geography" },
      { name: "Literature", code: "literature" },
      { name: "Engineering", code: "engineering" },
      { name: "Economics", code: "economics" },
    ];

    for (const subject of subjects) {
      await this.createSubject(subject);
    }

    // Create a space story
    const spaceStory = await this.createStory({
      title: "Journey to the Stars",
      description: "Join astronaut Maya as she prepares for her mission to the International Space Station! Learn about orbital mechanics, calculate distances between celestial bodies, and discover how astronauts live in zero gravity.",
      imageUrl: "https://via.placeholder.com/500x300?text=Journey+to+the+Stars",
      themeId: 4, // Space Exploration
      gradeLevel: "5",
      totalChapters: 10,
    });

    // Add subjects to the space story
    await this.addSubjectsToStory(spaceStory.id, [1, 2, 5]); // Math, Physics, Astronomy

    // Create chapters for the space story
    await this.createChapter({
      storyId: spaceStory.id,
      chapterNumber: 1,
      title: "Preparing for Launch",
      content: `<p>Maya had dreamed of becoming an astronaut since she was a little girl. Now, at the age of 35, she was finally going to space.</p>
      <p>"The training has been intense," Maya told her family during their last video call before launch day. "We've been preparing for every possible scenario."</p>
      <p>Maya's daughter, Sofia, had a question. "Mom, how fast will your rocket go?"</p>
      <p>Maya smiled. "Great question! Our rocket needs to reach what we call <span class="bg-yellow-300/20 px-1 rounded cursor-help" title="An escape velocity is the minimum speed needed for an object to escape from a planet's gravitational pull.">escape velocity</span>, which is about 11.2 kilometers per second."</p>
      <p>"That's super fast!" Sofia's eyes widened. "How do you calculate that?"</p>
      <p>"It's actually a math formula that uses gravity and the size of Earth," Maya explained.</p>`,
      question: {
        title: "Calculating Speed",
        description: "If the rocket accelerates at 30 meters per second squared, how many seconds will it take to reach escape velocity (11.2 km/s)?",
        hint: "Convert km/s to m/s first, then use the formula: time = velocity / acceleration",
        answer: "373",
      },
      vocabularyWords: [
        {
          word: "escape velocity",
          definition: "The minimum speed needed for an object to escape from a planet's gravitational pull.",
          context: "The rocket needs to reach escape velocity to break free from Earth's gravity."
        },
        {
          word: "orbital mechanics",
          definition: "The mathematics describing the motions of objects in orbit, such as satellites or spacecraft.",
          context: "Understanding orbital mechanics is essential for planning space missions."
        }
      ]
    });
  }
}

export const storage = new DatabaseStorage();
