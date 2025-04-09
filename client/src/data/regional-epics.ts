import { RegionalEpic } from "@shared/schema";

export const regionalEpicsData: { [themeId: number]: RegionalEpic[] } = {
  // Mythology Theme (ID: 1)
  
   
  // Realistic Fiction Theme (ID: 2)
  2: [
    {
      id: 801,
      name: "Family Adventures",
      description: "Family Adventures showing how subjects integrates into everyday life and learning",
      region: "United States",
      imageUrl: "/epics/family-adventures.svg",
      themeId: 8,
      stories: [
        { 
          id: 8001, 
          title: "A Walk to Remember",
          imageUrl: "/stories/a-walk-to-remember.png" 
        },
        { id: 8002, title: "The Park Adventure" },
        { id: 8003, title: "The Long Drive" },
        { id: 8004, title: "The Backyard Project" }
      ]
    }
  ]
};