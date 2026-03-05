import { useAuth } from "@/hooks/useAuth";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { BookOpen, Loader2, Star } from "lucide-react";
import type { Story } from "@shared/schema";

export default function KidDashboard() {
  const { activeProfile } = useAuth();
  const [, setLocation] = useLocation();

  const { data: storyList = [], isLoading } = useQuery<Story[]>({
    queryKey: ["/api/stories"],
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-8">
      <div>
        <h1 className="text-3xl font-bold">
          Hey, {activeProfile?.name}!
        </h1>
        <p className="text-muted-foreground mt-1">
          Ready to explore and learn? Pick a story to get started.
        </p>
      </div>

      {storyList.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <BookOpen className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-lg font-medium">No stories available yet</p>
            <p className="text-muted-foreground">Check back soon for new adventures!</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {storyList.map((story) => (
            <StoryCard
              key={story.id}
              story={story}
              profileId={activeProfile?.id}
              onClick={() => setLocation(`/stories/${story.id}/chapters/1`)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function StoryCard({
  story,
  profileId,
  onClick,
}: {
  story: Story;
  profileId?: number;
  onClick: () => void;
}) {
  const { data: progress } = useQuery<{
    currentChapter: number;
    completedChapters: number[];
  }>({
    queryKey: [`/api/progress/${profileId}/${story.id}`],
    enabled: !!profileId,
  });

  const completedCount = progress?.completedChapters?.length ?? 0;
  const progressPct = story.totalChapters > 0
    ? Math.round((completedCount / story.totalChapters) * 100)
    : 0;

  return (
    <Card className="hover:border-primary/50 transition-all cursor-pointer group" onClick={onClick}>
      <CardContent className="p-6 space-y-4">
        <div className="flex items-start justify-between">
          <div className="p-3 rounded-lg bg-primary/10">
            <BookOpen className="h-8 w-8 text-primary" />
          </div>
          <Badge variant="secondary">Grade {story.gradeLevel}</Badge>
        </div>

        <div>
          <h3 className="font-semibold text-lg group-hover:text-primary transition-colors">
            {story.title}
          </h3>
          <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
            {story.description}
          </p>
        </div>

        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">
              {completedCount} / {story.totalChapters} chapters
            </span>
            <span className="font-medium">{progressPct}%</span>
          </div>
          <Progress value={progressPct} className="h-2" />
        </div>

        <Button className="w-full" variant={completedCount > 0 ? "default" : "outline"}>
          {completedCount > 0 ? (
            <>Continue Chapter {(progress?.currentChapter ?? 1)} <Star className="h-4 w-4 ml-1" /></>
          ) : (
            "Start Reading"
          )}
        </Button>
      </CardContent>
    </Card>
  );
}
