import {
  User,
  InsertUser,
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
  users,
  themes,
  subjects,
  stories,
  storySubjects,
  chapters,
  userProgress as userProgressTable,
  flashcards as flashcardsTable,
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
  createUser(user: InsertUser): Promise<User>;
  updateUserTheme(userId: number, themeId: number): Promise<void>;
  updateUserLastActive(userId: number): Promise<void>;

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
  
  // Initial data seeding
  seedInitialData(): Promise<void>;
}

// In-memory storage implementation
export class MemStorage implements IStorage {
  sessionStore: session.Store;
  
  private users: Map<number, User>;
  private themes: Map<number, Theme>;
  private subjects: Map<number, Subject>;
  private stories: Map<number, Story>;
  private chapters: Map<string, Chapter>; // key is storyId:chapterNumber
  private userProgress: Map<string, any>; // key is userId:storyId
  private flashcards: Map<number, Flashcard>;
  private storySubjects: Map<string, number[]>; // key is storyId, value is array of subjectIds

  // Auto-increment IDs
  private userId: number;
  private themeId: number;
  private subjectId: number;
  private storyId: number;
  private chapterId: number;
  private flashcardId: number;

  constructor() {
    // Create memory store for sessions
    const MemoryStore = require('memorystore')(session);
    this.sessionStore = new MemoryStore({
      checkPeriod: 86400000 // prune expired entries every 24h
    });
    
    this.users = new Map();
    this.themes = new Map();
    this.subjects = new Map();
    this.stories = new Map();
    this.chapters = new Map();
    this.userProgress = new Map();
    this.flashcards = new Map();
    this.storySubjects = new Map();

    this.userId = 1;
    this.themeId = 1;
    this.subjectId = 1;
    this.storyId = 1;
    this.chapterId = 1;
    this.flashcardId = 1;
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

  async createUser(user: InsertUser): Promise<User> {
    const [newUser] = await db.insert(users).values(user).returning();
    return newUser;
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

// Seed initial data on startup
storage.seedInitialData().catch(error => {
  console.error("Error seeding initial data:", error);
});
