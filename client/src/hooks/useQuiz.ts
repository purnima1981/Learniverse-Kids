import { useState, useRef, useCallback, useEffect } from "react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import type { Question } from "@shared/schema";

interface QuestionState {
  startTime: number;
  attempts: number;
  hintsUsed: number;
  answered: boolean;
  isCorrect: boolean;
}

export function useQuiz(
  questions: Question[],
  profileId: number,
  chapterId: number,
  onComplete: (score: number, total: number) => void
) {
  const [sessionId, setSessionId] = useState<number | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [questionStates, setQuestionStates] = useState<Map<number, QuestionState>>(new Map());
  const [score, setScore] = useState(0);
  const [quizComplete, setQuizComplete] = useState(false);
  const timerRef = useRef<number>(0);
  const [elapsed, setElapsed] = useState(0);

  // Timer that ticks every second
  useEffect(() => {
    if (quizComplete || !sessionId) return;
    const interval = setInterval(() => {
      setElapsed((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [quizComplete, sessionId]);

  const startQuiz = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", "/api/quiz/start", {
        childProfileId: profileId,
        chapterId,
      });
      return res.json();
    },
    onSuccess: (data) => {
      setSessionId(data.id);
      // Initialize question states
      const states = new Map<number, QuestionState>();
      questions.forEach((q) => {
        states.set(q.id, {
          startTime: Date.now(),
          attempts: 0,
          hintsUsed: 0,
          answered: false,
          isCorrect: false,
        });
      });
      setQuestionStates(states);
    },
  });

  const submitResponse = useMutation({
    mutationFn: async (data: {
      questionId: number;
      userAnswer: unknown;
      isCorrect: boolean;
      timeTaken: number;
      attempts: number;
      hintsUsed: number;
      bloomLevel: string;
    }) => {
      await apiRequest("POST", "/api/quiz/respond", {
        sessionId,
        childProfileId: profileId,
        ...data,
      });
    },
  });

  const completeQuiz = useMutation({
    mutationFn: async (data: { score: number; totalQuestions: number }) => {
      await apiRequest("POST", "/api/quiz/complete", {
        sessionId,
        ...data,
      });
    },
  });

  const currentQuestion = questions[currentIndex];

  const getState = useCallback(
    (questionId: number): QuestionState =>
      questionStates.get(questionId) ?? {
        startTime: Date.now(),
        attempts: 0,
        hintsUsed: 0,
        answered: false,
        isCorrect: false,
      },
    [questionStates]
  );

  function updateState(questionId: number, update: Partial<QuestionState>) {
    setQuestionStates((prev) => {
      const next = new Map(prev);
      const current = next.get(questionId) ?? {
        startTime: Date.now(),
        attempts: 0,
        hintsUsed: 0,
        answered: false,
        isCorrect: false,
      };
      next.set(questionId, { ...current, ...update });
      return next;
    });
  }

  function submitAnswer(questionId: number, userAnswer: unknown, isCorrect: boolean) {
    const state = getState(questionId);
    const timeTaken = Math.floor((Date.now() - state.startTime) / 1000);
    const newAttempts = state.attempts + 1;

    updateState(questionId, {
      attempts: newAttempts,
      answered: true,
      isCorrect,
    });

    if (isCorrect) {
      setScore((prev) => prev + 1);
    }

    const question = questions.find((q) => q.id === questionId);

    submitResponse.mutate({
      questionId,
      userAnswer,
      isCorrect,
      timeTaken,
      attempts: newAttempts,
      hintsUsed: state.hintsUsed,
      bloomLevel: question?.bloomLevel ?? "understand",
    });
  }

  function requestHint(questionId: number) {
    const state = getState(questionId);
    const question = questions.find((q) => q.id === questionId);
    const hints = (question?.hints as string[]) ?? [];
    if (state.hintsUsed < hints.length) {
      updateState(questionId, { hintsUsed: state.hintsUsed + 1 });
    }
  }

  function nextQuestion() {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex((prev) => prev + 1);
      // Reset timer for next question
      const nextQ = questions[currentIndex + 1];
      if (nextQ) {
        updateState(nextQ.id, { startTime: Date.now() });
      }
    }
  }

  function prevQuestion() {
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
    }
  }

  function finishQuiz() {
    setQuizComplete(true);
    completeQuiz.mutate({
      score,
      totalQuestions: questions.length,
    });
    onComplete(score, questions.length);
  }

  return {
    sessionId,
    currentIndex,
    currentQuestion,
    score,
    quizComplete,
    elapsed,
    totalQuestions: questions.length,
    getState,
    startQuiz,
    submitAnswer,
    requestHint,
    nextQuestion,
    prevQuestion,
    finishQuiz,
  };
}
