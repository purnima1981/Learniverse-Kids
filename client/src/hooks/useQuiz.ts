import { useState, useCallback, useEffect, useRef } from "react";
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

const QUESTION_TIME_LIMIT = 60; // seconds per question

export function useQuiz(
  questions: Question[],
  profileId: number,
  topicId: number,
  onComplete: (score: number, total: number) => void
) {
  const [sessionId, setSessionId] = useState<number | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [questionStates, setQuestionStates] = useState<Map<number, QuestionState>>(new Map());
  const [score, setScore] = useState(0);
  const [quizComplete, setQuizComplete] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [questionTimeLeft, setQuestionTimeLeft] = useState(QUESTION_TIME_LIMIT);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Overall timer
  useEffect(() => {
    if (quizComplete || !sessionId) return;
    const interval = setInterval(() => setElapsed((p) => p + 1), 1000);
    return () => clearInterval(interval);
  }, [quizComplete, sessionId]);

  // Per-question countdown timer
  useEffect(() => {
    if (quizComplete || !sessionId) return;
    const state = questionStates.get(questions[currentIndex]?.id);
    if (state?.answered) return;

    setQuestionTimeLeft(QUESTION_TIME_LIMIT);
    if (timerRef.current) clearInterval(timerRef.current);

    timerRef.current = setInterval(() => {
      setQuestionTimeLeft((prev) => {
        if (prev <= 1) {
          // Time's up — auto-skip
          if (timerRef.current) clearInterval(timerRef.current);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [currentIndex, sessionId, quizComplete]);

  // Auto-submit when timer hits 0
  useEffect(() => {
    if (questionTimeLeft === 0 && sessionId && !quizComplete) {
      const q = questions[currentIndex];
      if (q && !questionStates.get(q.id)?.answered) {
        submitAnswer(q.id, null, false);
      }
    }
  }, [questionTimeLeft]);

  const startQuiz = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", "/api/quiz/start", { childProfileId: profileId, topicId });
      return res.json();
    },
    onSuccess: (data) => {
      setSessionId(data.id);
      const states = new Map<number, QuestionState>();
      questions.forEach((q) => {
        states.set(q.id, { startTime: Date.now(), attempts: 0, hintsUsed: 0, answered: false, isCorrect: false });
      });
      setQuestionStates(states);
    },
  });

  const submitResponse = useMutation({
    mutationFn: async (data: any) => {
      await apiRequest("POST", "/api/quiz/respond", { sessionId, childProfileId: profileId, ...data });
    },
  });

  const completeQuiz = useMutation({
    mutationFn: async (data: { score: number; totalQuestions: number }) => {
      await apiRequest("POST", "/api/quiz/complete", { sessionId, ...data });
    },
  });

  const currentQuestion = questions[currentIndex];

  const getState = useCallback(
    (questionId: number): QuestionState =>
      questionStates.get(questionId) ?? { startTime: Date.now(), attempts: 0, hintsUsed: 0, answered: false, isCorrect: false },
    [questionStates]
  );

  function updateState(questionId: number, update: Partial<QuestionState>) {
    setQuestionStates((prev) => {
      const next = new Map(prev);
      const current = next.get(questionId) ?? { startTime: Date.now(), attempts: 0, hintsUsed: 0, answered: false, isCorrect: false };
      next.set(questionId, { ...current, ...update });
      return next;
    });
  }

  function submitAnswer(questionId: number, userAnswer: unknown, isCorrect: boolean) {
    const state = getState(questionId);
    if (state.answered) return;
    const timeTaken = Math.floor((Date.now() - state.startTime) / 1000);
    const newAttempts = state.attempts + 1;

    updateState(questionId, { attempts: newAttempts, answered: true, isCorrect });
    if (timerRef.current) clearInterval(timerRef.current);

    if (isCorrect) setScore((prev) => prev + 1);

    const question = questions.find((q) => q.id === questionId);
    submitResponse.mutate({
      questionId, userAnswer, isCorrect, timeTaken,
      attempts: newAttempts, hintsUsed: state.hintsUsed,
      difficulty: question?.difficulty ?? "medium",
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
      const nextQ = questions[currentIndex + 1];
      if (nextQ) updateState(nextQ.id, { startTime: Date.now() });
    }
  }

  function prevQuestion() {
    if (currentIndex > 0) setCurrentIndex((prev) => prev - 1);
  }

  function finishQuiz() {
    setQuizComplete(true);
    if (timerRef.current) clearInterval(timerRef.current);
    completeQuiz.mutate({ score, totalQuestions: questions.length });
    onComplete(score, questions.length);
  }

  return {
    sessionId, currentIndex, currentQuestion, score, quizComplete, elapsed,
    questionTimeLeft, questionTimeLimit: QUESTION_TIME_LIMIT,
    totalQuestions: questions.length, getState, startQuiz,
    submitAnswer, requestHint, nextQuestion, prevQuestion, finishQuiz,
  };
}
