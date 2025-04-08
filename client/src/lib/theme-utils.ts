// Theme color mapping for consistent theme-based styling
export type ThemeColors = {
  primary: string;
  secondary: string;
  accent: string;
  background: {
    from: string;
    to: string;
  };
  card: {
    background: string;
    border: string;
  };
  text: {
    primary: string;
    secondary: string;
  };
  button: {
    from: string;
    to: string;
    hover: {
      from: string;
      to: string;
    },
    text: string;
  }
};

// Define theme colors for each theme ID
export const themeColorMap: Record<number, ThemeColors> = {
  // Mythology Theme
  1: {
    primary: "purple-600",
    secondary: "purple-300",
    accent: "amber-500",
    background: {
      from: "purple-700",
      to: "indigo-900"
    },
    card: {
      background: "bg-purple-900/30",
      border: "border-purple-400/30"
    },
    text: {
      primary: "text-white",
      secondary: "text-purple-100"
    },
    button: {
      from: "from-amber-400",
      to: "to-orange-500",
      hover: {
        from: "from-amber-500",
        to: "to-orange-600"
      },
      text: "text-purple-900"
    }
  },
  
  // Space Exploration Theme
  2: {
    primary: "blue-600",
    secondary: "blue-300",
    accent: "yellow-400",
    background: {
      from: "blue-950",
      to: "slate-900"
    },
    card: {
      background: "bg-blue-900/30",
      border: "border-blue-400/30"
    },
    text: {
      primary: "text-white",
      secondary: "text-blue-100"
    },
    button: {
      from: "from-yellow-400",
      to: "to-amber-500",
      hover: {
        from: "from-yellow-500",
        to: "to-amber-600"
      },
      text: "text-slate-900"
    }
  },
  
  // Ancient Kingdoms Theme
  3: {
    primary: "amber-600",
    secondary: "amber-300",
    accent: "emerald-500",
    background: {
      from: "amber-800",
      to: "yellow-700"
    },
    card: {
      background: "bg-amber-900/30",
      border: "border-amber-400/30"
    },
    text: {
      primary: "text-white",
      secondary: "text-amber-100"
    },
    button: {
      from: "from-emerald-400",
      to: "to-teal-500",
      hover: {
        from: "from-emerald-500",
        to: "to-teal-600"
      },
      text: "text-amber-900"
    }
  },
  
  // Modern Civilization Theme
  4: {
    primary: "slate-600",
    secondary: "slate-300",
    accent: "sky-500",
    background: {
      from: "slate-700",
      to: "zinc-900"
    },
    card: {
      background: "bg-slate-800/30",
      border: "border-slate-400/30"
    },
    text: {
      primary: "text-white",
      secondary: "text-slate-100"
    },
    button: {
      from: "from-sky-400",
      to: "to-blue-500",
      hover: {
        from: "from-sky-500",
        to: "to-blue-600"
      },
      text: "text-slate-900"
    }
  },
  
  // Folklore & Fairy Tales Theme
  5: {
    primary: "emerald-600",
    secondary: "emerald-300",
    accent: "pink-500",
    background: {
      from: "emerald-700",
      to: "teal-900"
    },
    card: {
      background: "bg-emerald-900/30",
      border: "border-emerald-400/30"
    },
    text: {
      primary: "text-white",
      secondary: "text-emerald-100"
    },
    button: {
      from: "from-pink-400",
      to: "to-rose-500",
      hover: {
        from: "from-pink-500",
        to: "to-rose-600"
      },
      text: "text-emerald-900"
    }
  },
  
  // Biblical Stories Theme
  6: {
    primary: "amber-600",
    secondary: "amber-300",
    accent: "indigo-500",
    background: {
      from: "amber-700",
      to: "orange-800"
    },
    card: {
      background: "bg-amber-800/30",
      border: "border-amber-400/30"
    },
    text: {
      primary: "text-white",
      secondary: "text-amber-100"
    },
    button: {
      from: "from-indigo-400",
      to: "to-purple-500",
      hover: {
        from: "from-indigo-500",
        to: "to-purple-600"
      },
      text: "text-amber-900"
    }
  },
  
  // Ocean Adventures Theme
  7: {
    primary: "cyan-600",
    secondary: "cyan-300",
    accent: "amber-500",
    background: {
      from: "cyan-700",
      to: "blue-900"
    },
    card: {
      background: "bg-cyan-900/30",
      border: "border-cyan-400/30"
    },
    text: {
      primary: "text-white",
      secondary: "text-cyan-100"
    },
    button: {
      from: "from-amber-400",
      to: "to-orange-500",
      hover: {
        from: "from-amber-500",
        to: "to-orange-600"
      },
      text: "text-cyan-900"
    }
  },
  
  // Future Technology Theme
  8: {
    primary: "violet-600",
    secondary: "violet-300",
    accent: "cyan-500",
    background: {
      from: "violet-800",
      to: "purple-900"
    },
    card: {
      background: "bg-violet-900/30",
      border: "border-violet-400/30"
    },
    text: {
      primary: "text-white",
      secondary: "text-violet-100"
    },
    button: {
      from: "from-cyan-400",
      to: "to-blue-500",
      hover: {
        from: "from-cyan-500",
        to: "to-blue-600"
      },
      text: "text-violet-900"
    }
  }
};

// Default theme colors if theme ID is not found
export const defaultThemeColors: ThemeColors = {
  primary: "blue-600",
  secondary: "blue-300",
  accent: "amber-500",
  background: {
    from: "cyan-500",
    to: "blue-500"
  },
  card: {
    background: "bg-blue-900/30",
    border: "border-blue-400/30"
  },
  text: {
    primary: "text-white",
    secondary: "text-blue-100"
  },
  button: {
    from: "from-amber-400",
    to: "to-orange-500",
    hover: {
      from: "from-amber-500",
      to: "to-orange-600"
    },
    text: "text-blue-900"
  }
};

// Helper function to get theme colors
export function getThemeColors(themeId: number): ThemeColors {
  return themeColorMap[themeId] || defaultThemeColors;
}

// Check if a story grade range is appropriate for a user's grade
export function isGradeAppropriate(storyGradeRange: string, userGrade: string): boolean {
  // Parse user grade (assuming format like "1", "2", "3", etc.)
  const userGradeNum = parseInt(userGrade);
  
  // Parse story grade range (assuming format like "1-3", "4-6", "6-8", etc.)
  const [minGrade, maxGrade] = storyGradeRange.split("-").map(g => parseInt(g));
  
  // If user grade is within the range (inclusive), then it's appropriate
  return userGradeNum >= minGrade && userGradeNum <= maxGrade;
}