import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useParams, useLocation } from "wouter";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { toast } from "@/components/ui/use-toast";
import { ChapterQuestions } from "@/components/ChapterQuestions";
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  Loader2,
  CheckCircle2,
  ClipboardList,
} from "lucide-react";
import type { Chapter, Story } from "@shared/schema";

export default function StoryReader() {
  const params = useParams<{ storyId: string; chapterNum: string }>();
  const storyId = Number(params.storyId);
  const chapterNum = Number(params.chapterNum);
  const { activeProfile } = useAuth();
  const [, setLocation] = useLocation();
  const [showQuiz, setShowQuiz] = useState(false);
  const [readingStartTime] = useState(Date.now());

  const { data: story } = useQuery<Story>({
    queryKey: [`/api/stories/${storyId}`],
    enabled: false, // We don't have a single-story endpoint yet; use storyList
  });

  const { data: chapter, isLoading } = useQuery<Chapter>({
    queryKey: [`/api/stories/${storyId}/chapters/${chapterNum}`],
  });

  const updateProgress = useMutation({
    mutationFn: async (data: {
      childProfileId: number;
      storyId: number;
      currentChapter: number;
      completedChapters: number[];
    }) => {
      await apiRequest("POST", "/api/progress/update", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [`/api/progress/${activeProfile?.id}/${storyId}`],
      });
    },
  });

  function handleQuizComplete(score: number, total: number) {
    setShowQuiz(false);
    const readingTime = Math.floor((Date.now() - readingStartTime) / 1000);

    toast({
      title: `Quiz Complete! Score: ${score}/${total}`,
      description: `Reading time: ${Math.floor(readingTime / 60)}m ${readingTime % 60}s`,
    });

    // Update progress
    if (activeProfile) {
      updateProgress.mutate({
        childProfileId: activeProfile.id,
        storyId,
        currentChapter: chapterNum + 1,
        completedChapters: [chapterNum], // Simplified; in production, merge with existing
      });
    }
  }

  function goToChapter(num: number) {
    setShowQuiz(false);
    setLocation(`/stories/${storyId}/chapters/${num}`);
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!chapter) {
    return (
      <div className="max-w-3xl mx-auto p-6 text-center">
        <p className="text-muted-foreground">Chapter not found</p>
        <Button className="mt-4" onClick={() => setLocation("/kid-dashboard")}>
          Back to Stories
        </Button>
      </div>
    );
  }

  if (showQuiz && chapter) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <Button variant="ghost" onClick={() => setShowQuiz(false)} className="mb-4">
          <ArrowLeft className="h-4 w-4 mr-2" /> Back to Chapter
        </Button>
        <ChapterQuestions
          chapterId={chapter.id}
          profileId={activeProfile?.id ?? 0}
          onComplete={handleQuizComplete}
        />
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto p-6 space-y-6">
      {/* Navigation */}
      <div className="flex items-center justify-between">
        <Button variant="ghost" onClick={() => setLocation("/kid-dashboard")}>
          <ArrowLeft className="h-4 w-4 mr-2" /> Stories
        </Button>
        <Badge variant="outline">Chapter {chapterNum}</Badge>
      </div>

      {/* Chapter Content */}
      <Card>
        <CardContent className="p-8">
          <div className="flex items-center gap-3 mb-6">
            <BookOpen className="h-6 w-6 text-primary" />
            <h1 className="text-2xl font-bold">{chapter.title}</h1>
          </div>

          <div className="prose prose-invert max-w-none">
            {chapter.content.split("\n").map((paragraph, i) => (
              <p key={i} className="mb-4 text-base leading-relaxed">
                {paragraph}
              </p>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex gap-3 justify-between">
        <Button
          variant="outline"
          disabled={chapterNum <= 1}
          onClick={() => goToChapter(chapterNum - 1)}
        >
          <ArrowLeft className="h-4 w-4 mr-2" /> Previous
        </Button>

        <Button onClick={() => setShowQuiz(true)} className="gap-2">
          <ClipboardList className="h-4 w-4" /> Take the Quiz
        </Button>

        <Button
          variant="outline"
          onClick={() => goToChapter(chapterNum + 1)}
        >
          Next <ArrowRight className="h-4 w-4 ml-2" />
        </Button>
      </div>
    </div>
  );
}
