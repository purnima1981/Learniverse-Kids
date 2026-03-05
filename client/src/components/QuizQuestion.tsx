import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { CheckCircle2, XCircle, Lightbulb, ArrowUp, ArrowDown } from "lucide-react";
import type { Question } from "@shared/schema";

interface QuizQuestionProps {
  question: Question;
  hintsUsed: number;
  answered: boolean;
  isCorrect: boolean;
  onSubmit: (answer: unknown, isCorrect: boolean) => void;
  onRequestHint: () => void;
}

export function QuizQuestion({
  question,
  hintsUsed,
  answered,
  isCorrect,
  onSubmit,
  onRequestHint,
}: QuizQuestionProps) {
  const hints = (question.hints as string[]) ?? [];
  const hasMoreHints = hintsUsed < hints.length;

  return (
    <div className="space-y-6">
      {/* Question Header */}
      <div className="space-y-2">
        <div className="flex items-center gap-2 flex-wrap">
          <Badge variant="outline" className="capitalize">{question.bloomLevel}</Badge>
          <Badge variant="secondary" className="capitalize">{question.difficulty}</Badge>
          {question.theme && <Badge variant="secondary">{question.theme}</Badge>}
        </div>
        <p className="text-lg font-medium">{question.text}</p>
      </div>

      {/* Hints */}
      {hints.length > 0 && (
        <div className="space-y-2">
          {hints.slice(0, hintsUsed).map((hint, i) => (
            <div key={i} className="flex items-start gap-2 p-3 rounded-lg bg-yellow-500/10 border border-yellow-500/20">
              <Lightbulb className="h-4 w-4 text-yellow-500 mt-0.5 shrink-0" />
              <p className="text-sm">{hint}</p>
            </div>
          ))}
          {!answered && hasMoreHints && (
            <Button variant="ghost" size="sm" onClick={onRequestHint} className="text-yellow-500">
              <Lightbulb className="h-4 w-4 mr-1" />
              Need a hint? ({hintsUsed}/{hints.length})
            </Button>
          )}
        </div>
      )}

      {/* Answer Area */}
      <QuestionRenderer question={question} answered={answered} onSubmit={onSubmit} />

      {/* Feedback */}
      {answered && (
        <div
          className={cn(
            "flex items-center gap-3 p-4 rounded-lg border",
            isCorrect
              ? "bg-green-500/10 border-green-500/30 text-green-400"
              : "bg-red-500/10 border-red-500/30 text-red-400"
          )}
        >
          {isCorrect ? (
            <CheckCircle2 className="h-5 w-5 shrink-0" />
          ) : (
            <XCircle className="h-5 w-5 shrink-0" />
          )}
          <div>
            <p className="font-medium">{isCorrect ? "Correct!" : "Not quite right"}</p>
            {question.explanation && (
              <p className="text-sm mt-1 opacity-80">{question.explanation}</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function QuestionRenderer({
  question,
  answered,
  onSubmit,
}: {
  question: Question;
  answered: boolean;
  onSubmit: (answer: unknown, isCorrect: boolean) => void;
}) {
  switch (question.type) {
    case "multiple-choice":
      return <MultipleChoice question={question} answered={answered} onSubmit={onSubmit} />;
    case "true-false":
      return <TrueFalse question={question} answered={answered} onSubmit={onSubmit} />;
    case "fill-blank":
      return <FillBlank question={question} answered={answered} onSubmit={onSubmit} />;
    case "matching":
      return <Matching question={question} answered={answered} onSubmit={onSubmit} />;
    case "unscramble":
      return <Unscramble question={question} answered={answered} onSubmit={onSubmit} />;
    case "hidden-word":
      return <HiddenWord question={question} answered={answered} onSubmit={onSubmit} />;
    case "word-sequence":
      return <WordSequence question={question} answered={answered} onSubmit={onSubmit} />;
    default:
      return <p className="text-muted-foreground">Unsupported question type: {question.type}</p>;
  }
}

// ─── Multiple Choice ──────────────────────────────────────────────────────────

function MultipleChoice({
  question,
  answered,
  onSubmit,
}: {
  question: Question;
  answered: boolean;
  onSubmit: (answer: unknown, isCorrect: boolean) => void;
}) {
  const [selected, setSelected] = useState("");
  const options = (question.options as { choices: string[] })?.choices ?? [];
  const labels = ["a", "b", "c", "d"];

  function handleSubmit() {
    if (!selected) return;
    const isCorrect = selected === (question.answer as string);
    onSubmit(selected, isCorrect);
  }

  return (
    <div className="space-y-4">
      <RadioGroup value={selected} onValueChange={setSelected} disabled={answered}>
        {options.map((opt, i) => (
          <div key={i} className="flex items-center space-x-3 p-3 rounded-lg border hover:bg-accent/50 transition-colors">
            <RadioGroupItem value={labels[i]} id={`opt-${i}`} />
            <Label htmlFor={`opt-${i}`} className="flex-1 cursor-pointer">
              <span className="font-mono mr-2">{labels[i]}.</span>{opt}
            </Label>
          </div>
        ))}
      </RadioGroup>
      {!answered && (
        <Button onClick={handleSubmit} disabled={!selected}>Submit Answer</Button>
      )}
    </div>
  );
}

// ─── True / False ─────────────────────────────────────────────────────────────

function TrueFalse({
  question,
  answered,
  onSubmit,
}: {
  question: Question;
  answered: boolean;
  onSubmit: (answer: unknown, isCorrect: boolean) => void;
}) {
  function handleSelect(value: string) {
    if (answered) return;
    const isCorrect = value === (question.answer as string);
    onSubmit(value, isCorrect);
  }

  return (
    <div className="flex gap-4">
      <Button
        size="lg"
        variant="outline"
        className="flex-1 h-16 text-lg"
        onClick={() => handleSelect("true")}
        disabled={answered}
      >
        True
      </Button>
      <Button
        size="lg"
        variant="outline"
        className="flex-1 h-16 text-lg"
        onClick={() => handleSelect("false")}
        disabled={answered}
      >
        False
      </Button>
    </div>
  );
}

// ─── Fill in the Blank ────────────────────────────────────────────────────────

function FillBlank({
  question,
  answered,
  onSubmit,
}: {
  question: Question;
  answered: boolean;
  onSubmit: (answer: unknown, isCorrect: boolean) => void;
}) {
  const [value, setValue] = useState("");

  function handleSubmit() {
    if (!value.trim()) return;
    const correctAnswer = (question.answer as string).toLowerCase().trim();
    const isCorrect = value.toLowerCase().trim() === correctAnswer;
    onSubmit(value.trim(), isCorrect);
  }

  return (
    <div className="space-y-4">
      <Input
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="Type your answer..."
        disabled={answered}
        onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
        className="text-lg"
      />
      {!answered && (
        <Button onClick={handleSubmit} disabled={!value.trim()}>Submit Answer</Button>
      )}
    </div>
  );
}

// ─── Matching ─────────────────────────────────────────────────────────────────

function Matching({
  question,
  answered,
  onSubmit,
}: {
  question: Question;
  answered: boolean;
  onSubmit: (answer: unknown, isCorrect: boolean) => void;
}) {
  const items = (question.options as { items: { item: string; match: string }[] })?.items ?? [];
  const matches = items.map((i) => i.match);
  const shuffledMatches = [...matches].sort(() => Math.random() - 0.5);
  const [selections, setSelections] = useState<Record<string, string>>({});

  function handleSubmit() {
    const correctAnswer = question.answer as string[];
    const userPairs = items.map((item) => `${item.item}:${selections[item.item] ?? ""}`);
    const allCorrect = items.every(
      (item) => selections[item.item] === item.match
    );
    onSubmit(userPairs, allCorrect);
  }

  const allSelected = items.every((item) => selections[item.item]);

  return (
    <div className="space-y-4">
      {items.map((item, i) => (
        <div key={i} className="flex items-center gap-4">
          <span className="font-medium min-w-[150px]">{item.item}</span>
          <Select
            value={selections[item.item] ?? ""}
            onValueChange={(val) =>
              setSelections((prev) => ({ ...prev, [item.item]: val }))
            }
            disabled={answered}
          >
            <SelectTrigger className="flex-1">
              <SelectValue placeholder="Select match..." />
            </SelectTrigger>
            <SelectContent>
              {shuffledMatches.map((match, j) => (
                <SelectItem key={j} value={match}>
                  {match}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      ))}
      {!answered && (
        <Button onClick={handleSubmit} disabled={!allSelected}>Submit Answer</Button>
      )}
    </div>
  );
}

// ─── Unscramble ───────────────────────────────────────────────────────────────

function Unscramble({
  question,
  answered,
  onSubmit,
}: {
  question: Question;
  answered: boolean;
  onSubmit: (answer: unknown, isCorrect: boolean) => void;
}) {
  const letters = (question.options as { letters: string })?.letters ?? "";
  const scrambled = letters.split(",").map((s) => s.trim());
  const correctAnswers = question.answer as string[];
  const [inputs, setInputs] = useState<string[]>(scrambled.map(() => ""));

  function handleSubmit() {
    const isCorrect = inputs.every(
      (input, i) => input.toUpperCase().trim() === correctAnswers[i]?.toUpperCase()
    );
    onSubmit(inputs, isCorrect);
  }

  const allFilled = inputs.every((v) => v.trim());

  return (
    <div className="space-y-4">
      {scrambled.map((word, i) => (
        <div key={i} className="flex items-center gap-4">
          <span className="font-mono text-lg min-w-[150px] text-primary">{word}</span>
          <Input
            value={inputs[i]}
            onChange={(e) => {
              const next = [...inputs];
              next[i] = e.target.value;
              setInputs(next);
            }}
            placeholder="Unscrambled word..."
            disabled={answered}
          />
        </div>
      ))}
      {!answered && (
        <Button onClick={handleSubmit} disabled={!allFilled}>Submit Answer</Button>
      )}
    </div>
  );
}

// ─── Hidden Word (Word Search) ────────────────────────────────────────────────

function HiddenWord({
  question,
  answered,
  onSubmit,
}: {
  question: Question;
  answered: boolean;
  onSubmit: (answer: unknown, isCorrect: boolean) => void;
}) {
  const opts = question.options as { grid: string[]; words: string[] };
  const grid = opts?.grid ?? [];
  const wordsToFind = opts?.words ?? [];
  const [foundWords, setFoundWords] = useState<string[]>([]);
  const [currentInput, setCurrentInput] = useState("");

  function tryAddWord() {
    const word = currentInput.toUpperCase().trim();
    if (
      wordsToFind.map((w) => w.toUpperCase()).includes(word) &&
      !foundWords.includes(word)
    ) {
      setFoundWords((prev) => [...prev, word]);
    }
    setCurrentInput("");
  }

  function handleSubmit() {
    const allFound = wordsToFind.every((w) =>
      foundWords.includes(w.toUpperCase())
    );
    onSubmit(foundWords, allFound);
  }

  return (
    <div className="space-y-4">
      {/* Grid */}
      <div className="font-mono text-sm leading-relaxed bg-card border rounded-lg p-4 overflow-x-auto">
        {grid.map((row, i) => (
          <div key={i} className="tracking-widest">
            {row.split("").map((char, j) => (
              <span key={j} className="inline-block w-6 text-center">
                {char}
              </span>
            ))}
          </div>
        ))}
      </div>

      {/* Words to find */}
      <div className="flex flex-wrap gap-2">
        {wordsToFind.map((word) => (
          <Badge
            key={word}
            variant={foundWords.includes(word.toUpperCase()) ? "default" : "outline"}
          >
            {foundWords.includes(word.toUpperCase()) ? "✓ " : ""}{word}
          </Badge>
        ))}
      </div>

      {/* Input */}
      {!answered && (
        <div className="flex gap-2">
          <Input
            value={currentInput}
            onChange={(e) => setCurrentInput(e.target.value)}
            placeholder="Type a word you found..."
            onKeyDown={(e) => e.key === "Enter" && tryAddWord()}
          />
          <Button variant="outline" onClick={tryAddWord}>Add</Button>
        </div>
      )}

      {!answered && (
        <Button onClick={handleSubmit} disabled={foundWords.length === 0}>
          Submit ({foundWords.length}/{wordsToFind.length} found)
        </Button>
      )}
    </div>
  );
}

// ─── Word Sequence ────────────────────────────────────────────────────────────

function WordSequence({
  question,
  answered,
  onSubmit,
}: {
  question: Question;
  answered: boolean;
  onSubmit: (answer: unknown, isCorrect: boolean) => void;
}) {
  const opts = question.options as { wordSequence: string[] };
  const shuffledInitial = [...(opts?.wordSequence ?? [])].sort(() => Math.random() - 0.5);
  const [items, setItems] = useState<string[]>(shuffledInitial);

  function moveItem(index: number, direction: "up" | "down") {
    if (answered) return;
    const newItems = [...items];
    const swapIndex = direction === "up" ? index - 1 : index + 1;
    if (swapIndex < 0 || swapIndex >= newItems.length) return;
    [newItems[index], newItems[swapIndex]] = [newItems[swapIndex], newItems[index]];
    setItems(newItems);
  }

  function handleSubmit() {
    const correctOrder = question.answer as string[];
    const isCorrect = items.every((item, i) => item === correctOrder[i]);
    onSubmit(items, isCorrect);
  }

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">Arrange these in the correct order using the arrows:</p>
      <div className="space-y-2">
        {items.map((item, i) => (
          <div
            key={`${item}-${i}`}
            className="flex items-center gap-2 p-3 rounded-lg border bg-card"
          >
            <span className="font-mono text-muted-foreground w-6">{i + 1}.</span>
            <span className="flex-1">{item}</span>
            {!answered && (
              <div className="flex gap-1">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => moveItem(i, "up")}
                  disabled={i === 0}
                >
                  <ArrowUp className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => moveItem(i, "down")}
                  disabled={i === items.length - 1}
                >
                  <ArrowDown className="h-4 w-4" />
                </Button>
              </div>
            )}
          </div>
        ))}
      </div>
      {!answered && <Button onClick={handleSubmit}>Submit Answer</Button>}
    </div>
  );
}
