interface ProgressBarProps {
  progress: number;
}

export default function ProgressBar({ progress }: ProgressBarProps) {
  // Ensure progress is between 0 and 100
  const normalizedProgress = Math.max(0, Math.min(100, progress));
  
  return (
    <div className="story-progress-bar">
      <div 
        className="progress" 
        style={{ width: `${normalizedProgress}%` }}
      />
    </div>
  );
}
