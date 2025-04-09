import { RegionalEpic } from "@shared/schema";

export const regionalEpicsData: { [themeId: number]: RegionalEpic[] } = {
  // Mythology Theme (ID: 1)
  1: [
    {
      id: 101,
      name: "Greek and Roman",
      description: "Stories of gods and heroes from ancient Greece and Rome",
      region: "Mediterranean",
      imageUrl: "/epics/greek-roman.svg",
      themeId: 1,
      stories: [
        { id: 1001, title: "Odyssey: The Journey Home", grade: "6-8" },
        { id: 1002, title: "Prometheus and the Gift of Fire", grade: "3-5" },
        { id: 1003, title: "Pandora's Curiosity", grade: "1-2" }
      ]
    },
    {
      id: 102,
      name: "Norse Legends",
      description: "Tales from the frozen north featuring gods, giants and heroes",
      region: "Scandinavia",
      imageUrl: "/epics/norse.svg",
      themeId: 1,
      stories: [
        { id: 1004, title: "Thor's Mighty Hammer", grade: "3-5" },
        { id: 1005, title: "The World Tree Yggdrasil", grade: "4-6" }
      ]
    },
    {
      id: 103,
      name: "Egyptian Mythology",
      description: "Ancient stories from the land of pharaohs and pyramids",
      region: "North Africa",
      imageUrl: "/epics/egyptian.svg",
      themeId: 1,
      stories: [
        { id: 1006, title: "Isis and Osiris", grade: "4-6" },
        { id: 1007, title: "The Book of Thoth", grade: "5-8" }
      ]
    },
    {
      id: 104,
      name: "Hindu Epics",
      description: "Ancient Indian tales of gods, heroes and cosmic principles",
      region: "South Asia",
      imageUrl: "/epics/hindu.svg",
      themeId: 1,
      stories: [
        { id: 1008, title: "Ramayana: The Journey of Rama", grade: "5-8" },
        { id: 1009, title: "Krishna and the Butter", grade: "1-3" }
      ]
    }
  ],
  
  // Realistic Fiction Theme (ID: 2)
  2: [
    {
      id: 201,
      name: "Family Adventures",
      description: "Family Adventures showing how subjects integrate into everyday life and learning",
      region: "United States",
      imageUrl: "/epics/family-adventures.svg",
      themeId: 2,
      stories: [
        { 
          id: 8001, 
          title: "A Walk to Remember",
          imageUrl: "/stories/a-walk-to-remember.png",
          grade: "1-5"
        },
        { id: 8002, title: "The Park Adventure", grade: "1-5" },
        { id: 8003, title: "The Long Drive", grade: "1-5" },
        { id: 8004, title: "The Backyard Project", grade: "1-5" }
      ]
    },
    {
      id: 202,
      name: "School Stories",
      description: "Realistic stories set in school environments that connect academic subjects",
      region: "Global",
      imageUrl: "/epics/school-stories.svg",
      themeId: 2,
      stories: [
        { id: 2003, title: "The Science Fair Project", grade: "3-5" },
        { id: 2004, title: "Math Olympics", grade: "4-6" }
      ]
    }
  ],
  
  // Ancient Kingdoms Theme (ID: 3)
  3: [
    {
      id: 301,
      name: "Mesopotamian Empires",
      description: "The cradle of civilization and its legendary kings",
      region: "Middle East",
      imageUrl: "/epics/mesopotamia.svg",
      themeId: 3,
      stories: [
        { id: 3001, title: "Gilgamesh: The First Hero", grade: "6-8" },
        { id: 3002, title: "Hammurabi's Code of Laws", grade: "5-7" }
      ]
    },
    {
      id: 302,
      name: "Chinese Dynasties",
      description: "The rise and fall of China's ancient imperial houses",
      region: "East Asia",
      imageUrl: "/epics/chinese-dynasties.svg",
      themeId: 3,
      stories: [
        { id: 3003, title: "The First Emperor and the Terra Cotta Army", grade: "4-6" },
        { id: 3004, title: "Journey Along the Silk Road", grade: "5-7" }
      ]
    },
    {
      id: 303,
      name: "African Kingdoms",
      description: "Powerful empires and city-states across the African continent",
      region: "Africa",
      imageUrl: "/epics/african-kingdoms.svg",
      themeId: 3,
      stories: [
        { id: 3005, title: "Mansa Musa: The Golden King", grade: "4-6" },
        { id: 3006, title: "Great Zimbabwe: City of Stone", grade: "5-7" }
      ]
    },
    {
      id: 304,
      name: "Pre-Columbian Americas",
      description: "Advanced civilizations of the Western Hemisphere",
      region: "Americas",
      imageUrl: "/epics/pre-columbian.svg",
      themeId: 3,
      stories: [
        { id: 3007, title: "Maya Calendar Mysteries", grade: "5-7" },
        { id: 3008, title: "Incan Roads Across Mountains", grade: "4-6" }
      ]
    }
  ],
  
  // Modern Civilization Theme (ID: 4) 
  4: [
    {
      id: 401,
      name: "Industrial Revolutions",
      description: "How technology transformed society across the globe",
      region: "Global",
      imageUrl: "/epics/industrial.svg",
      themeId: 4,
      stories: [
        { id: 4001, title: "Steam Power Changes Everything", grade: "5-7" },
        { id: 4002, title: "Assembly Lines and Automobiles", grade: "4-6" }
      ]
    },
    {
      id: 402,
      name: "Democracy Movements",
      description: "The struggle for representation and equality",
      region: "Global",
      imageUrl: "/epics/democracy.svg",
      themeId: 4,
      stories: [
        { id: 4003, title: "Votes for All: Expanding the Franchise", grade: "6-8" },
        { id: 4004, title: "Gandhi's Peaceful Resistance", grade: "5-7" }
      ]
    }
  ],
  
  // Folklore & Fairy Tales Theme (ID: 5)
  5: [
    {
      id: 501,
      name: "European Fairy Tales",
      description: "Classic stories that have enchanted generations",
      region: "Europe",
      imageUrl: "/epics/european-tales.svg",
      themeId: 5,
      stories: [
        { id: 5001, title: "Little Red Riding Hood's Journey", grade: "1-3" },
        { id: 5002, title: "The Snow Queen's Palace", grade: "3-5" }
      ]
    },
    {
      id: 502,
      name: "Asian Folk Tales",
      description: "Wisdom and wonder from the East",
      region: "Asia",
      imageUrl: "/epics/asian-tales.svg",
      themeId: 5,
      stories: [
        { id: 5003, title: "The Crane Wife", grade: "3-5" },
        { id: 5004, title: "Journey to the West", grade: "4-6" }
      ]
    },
    {
      id: 503,
      name: "African Folklore",
      description: "Tales of wisdom, tricksters, and explanation",
      region: "Africa",
      imageUrl: "/epics/african-tales.svg",
      themeId: 5,
      stories: [
        { id: 5005, title: "Anansi the Spider", grade: "1-3" },
        { id: 5006, title: "Why Tortoise Has a Cracked Shell", grade: "2-4" }
      ]
    },
    {
      id: 504,
      name: "Indigenous American Stories",
      description: "Traditional tales from North, Central and South America",
      region: "Americas",
      imageUrl: "/epics/indigenous-tales.svg",
      themeId: 5,
      stories: [
        { id: 5007, title: "Raven Brings the Light", grade: "2-4" },
        { id: 5008, title: "The Rainbow Serpent", grade: "3-5" }
      ]
    }
  ],
  
  // Biblical Stories Theme (ID: 6)
  6: [
    {
      id: 601,
      name: "Genesis Stories",
      description: "Tales of creation and the earliest people",
      region: "Middle East",
      imageUrl: "/epics/genesis.svg",
      themeId: 6,
      stories: [
        { id: 6001, title: "Noah's Ark and the Great Flood", grade: "1-3" },
        { id: 6002, title: "Joseph and His Colorful Coat", grade: "2-4" }
      ]
    },
    {
      id: 602,
      name: "Exodus Journey",
      description: "The liberation and wandering of the Israelites",
      region: "Egypt and Sinai",
      imageUrl: "/epics/exodus.svg",
      themeId: 6,
      stories: [
        { id: 6003, title: "Moses and the Burning Bush", grade: "3-5" },
        { id: 6004, title: "Crossing the Red Sea", grade: "2-4" }
      ]
    }
  ],
  
  // Ocean Adventures Theme (ID: 7)
  7: [
    {
      id: 701,
      name: "Polynesian Navigation",
      description: "How Pacific Islanders mastered sailing the world's largest ocean",
      region: "Pacific Islands",
      imageUrl: "/epics/polynesian.svg",
      themeId: 7,
      stories: [
        { id: 7001, title: "Wayfinders: Navigating by Stars", grade: "4-6" },
        { id: 7002, title: "Maui and the Fish", grade: "2-4" }
      ]
    },
    {
      id: 702,
      name: "European Exploration",
      description: "Voyages of discovery that connected the world",
      region: "Europe",
      imageUrl: "/epics/european-ocean.svg",
      themeId: 7,
      stories: [
        { id: 7003, title: "Magellan's Voyage Around the World", grade: "5-7" },
        { id: 7004, title: "Cook's Pacific Discoveries", grade: "4-6" }
      ]
    }
  ],
  
  // Future Technology Theme (ID: 8)
  8: [
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