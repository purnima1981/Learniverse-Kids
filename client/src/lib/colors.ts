// Standardized color scheme for the entire application

// Main Structural Colors
export const COLORS = {
  // Background Gradients
  BG_GRADIENT_FROM: 'from-indigo-950',
  BG_GRADIENT_VIA: 'via-blue-950',
  BG_GRADIENT_TO: 'to-indigo-900',
  APP_BACKGROUND: 'bg-gradient-to-br from-indigo-900 to-blue-900',
  
  // Card/Element Background
  CARD_BG: 'bg-blue-900/20',
  CARD_BG_HOVER: 'bg-blue-900/40',
  CARD_BORDER: 'border-blue-700/30',
  CARD_BORDER_HOVER: 'border-blue-400',
  DIALOG_BG: 'bg-blue-900',
  DIALOG_BORDER: 'border-blue-700',
  
  // Form Elements
  INPUT_BG: 'bg-blue-800/50',
  INPUT_BORDER: 'border-blue-700/50',
  
  // Text Colors
  TEXT_PRIMARY: 'text-white',
  TEXT_SECONDARY: 'text-blue-200',
  TEXT_TERTIARY: 'text-blue-300',
  TEXT_MUTED: 'text-blue-100',
  TEXT_ERROR: 'text-red-300',
  
  // Button Colors
  BUTTON_PRIMARY: 'bg-blue-600 hover:bg-blue-700',
  BUTTON_SECONDARY: 'bg-white/20 hover:bg-white/30',
  BUTTON_OUTLINE: 'border-blue-700 text-blue-200 hover:bg-blue-800',
  BUTTON_DESTRUCTIVE: 'bg-red-600 hover:bg-red-700',
  
  // Additional UI Elements
  HIGHLIGHT: 'bg-yellow-500',
  ACCENT_BLUE: 'bg-blue-600',
  ACCENT_PURPLE: 'bg-purple-500',
};

// Subject Theme Colors
export const SUBJECT_COLORS = {
  math: '#38bdf8', // sky-400
  science: '#22c55e', // green-500
  language: '#a855f7', // purple-500
  engineering: '#f97316', // orange-500
  materials: '#f43f5e', // rose-500
  interdisciplinary: '#8b5cf6', // violet-500
  history: '#0EA5E9', // blue-500
  culture: '#F59E0B', // amber-500
  biology: '#10B981', // emerald-500
};

// Learning Theme Colors (for theme selection)
export const THEME_COLORS = {
  'Space Explorers': {
    icon: 'text-blue-300',
    color: 'from-blue-800 to-indigo-900',
    bgClass: 'bg-gradient-to-b from-blue-800/60 to-indigo-900/60',
  },
  'Historical Journeys': {
    icon: 'text-amber-300',
    color: 'from-amber-800 to-red-900',
    bgClass: 'bg-gradient-to-b from-amber-800/60 to-red-900/60',
  },
  'Voyages': {
    icon: 'text-emerald-300',
    color: 'from-emerald-800 to-teal-900',
    bgClass: 'bg-gradient-to-b from-emerald-800/60 to-teal-900/60',
  },
  'Realistic Fiction': {
    icon: 'text-purple-300',
    color: 'from-purple-800 to-fuchsia-900',
    bgClass: 'bg-gradient-to-b from-purple-800/60 to-fuchsia-900/60',
  },
  'Science Mysteries': {
    icon: 'text-cyan-300',
    color: 'from-cyan-800 to-blue-900',
    bgClass: 'bg-gradient-to-b from-cyan-800/60 to-blue-900/60',
  },
};