import { Subject } from "@shared/schema";

// Define a custom subject type that can handle both our DB Subject model
// and any mock data we might be using
interface CustomSubject {
  name: string;
  code?: string;
  color?: string;
}

interface SubjectTagProps {
  subject: Subject | CustomSubject;
  small?: boolean;
}

// Color mapping for subjects
const subjectColors: Record<string, string> = {
  mathematics: "bg-blue-500/30",
  physics: "bg-green-500/30",
  chemistry: "bg-red-500/30",
  biology: "bg-emerald-500/30",
  astronomy: "bg-purple-500/30",
  history: "bg-amber-500/30",
  geography: "bg-cyan-500/30",
  literature: "bg-pink-500/30",
  engineering: "bg-yellow-500/30",
  economics: "bg-indigo-500/30",
};

export function SubjectTag({ subject, small = false }: SubjectTagProps) {
  // Default color if none can be determined
  const defaultColor = "bg-blue-500/30";
  
  // Safely get the color based on subject properties
  let bgColor = defaultColor;
  
  if (!subject) {
    // If subject is null or undefined, return nothing
    return null;
  }
  
  // Handle code property - present in both real DB data and mock data
  if (subject.code) {
    bgColor = subjectColors[subject.code.toLowerCase()] || defaultColor;
  }
  
  // For mock data that might have a direct color property
  const customSubject = subject as CustomSubject;
  if (customSubject.color) {
    bgColor = customSubject.color.startsWith('bg-') 
      ? customSubject.color 
      : `bg-${customSubject.color}-500/30`;
  }
  
  return (
    <span 
      className={`${bgColor} text-white px-2 ${small ? 'py-0.5 text-xs' : 'py-1 text-sm'} rounded-full`}
    >
      {subject.name}
    </span>
  );
}
