import { storage } from './storage';

/**
 * Seeds the database with initial data if needed
 */
export async function seedInitialData(): Promise<void> {
  try {
    // Check if data already exists
    const existingThemes = await storage.getAllThemes();
    const existingSubjects = await storage.getAllSubjects();
    
    // Skip seeding if we already have data
    if (existingThemes.length > 0 && existingSubjects.length > 0) {
      console.log("Database already seeded, skipping initial data creation");
      return;
    }
    
    console.log("Seeding database with initial data...");
    
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
      await storage.createTheme(theme);
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
      try {
        await storage.createSubject(subject);
      } catch (error) {
        console.log(`Subject ${subject.name} may already exist, skipping`);
      }
    }
    
    console.log("Database seeding completed successfully");
  } catch (error) {
    console.error("Error seeding database:", error);
    throw error;
  }
}