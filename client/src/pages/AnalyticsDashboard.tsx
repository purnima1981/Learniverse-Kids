import { useQuery } from "@tanstack/react-query";
import { useParams, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  ArrowLeft,
  Target,
  Clock,
  Lightbulb,
  TrendingUp,
  Loader2,
  Brain,
  BarChart3,
  Calculator,
  Flame,
  Calendar,
  CheckCircle2,
  AlertTriangle,
} from "lucide-react";
import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  LineChart,
  Line,
  Cell,
} from "recharts";

interface OverallStats {
  totalQuestions: number;
  totalCorrect: number;
  avgTime: number;
  avgHints: number;
  totalSessions: number;
}

interface WeeklyStats {
  totalQuestions: number;
  totalCorrect: number;
  avgTime: number;
  totalSessions: number;
}

interface DailyBreakdown {
  day: string;
  date: string;
  total: number;
  correct: number;
}

interface BloomStat {
  bloomLevel: string;
  total: number;
  correct: number;
  avgTime: number;
}

interface DifficultyStat {
  difficulty: string;
  total: number;
  correct: number;
  avgTime: number;
}

interface SessionRecord {
  id: number;
  topicId: number;
  difficulty: string | null;
  startedAt: string;
  completedAt: string;
  score: number;
  totalQuestions: number;
}

interface HintUsage {
  sessionId: number;
  hintsZero: number;
  hintsOne: number;
  hintsTwo: number;
  hintsThree: number;
}

interface CategoryStat {
  category: string;
  total: number;
  correct: number;
  avgTime: number;
}

const BLOOM_ORDER = ["remember", "understand", "apply", "analyze", "evaluate", "create"];
const BLOOM_LABELS: Record<string, string> = {
  remember: "Remember",
  understand: "Understand",
  apply: "Apply",
  analyze: "Analyze",
  evaluate: "Evaluate",
  create: "Create",
};
const BLOOM_DESCRIPTIONS: Record<string, string> = {
  remember: "Recall facts and basic concepts",
  understand: "Explain ideas and concepts",
  apply: "Use information in new situations",
  analyze: "Draw connections among ideas",
  evaluate: "Justify a decision or course of action",
  create: "Produce new or original work",
};

const DIFFICULTY_COLORS: Record<string, string> = {
  easy: "hsl(162 72% 45%)",
  medium: "hsl(38 92% 50%)",
  hard: "hsl(262 83% 58%)",
  olympiad: "hsl(0 72% 51%)",
};

const CATEGORY_COLORS: Record<string, string> = {
  arithmetic: "hsl(243 75% 59%)",
  algebra: "hsl(262 83% 58%)",
  geometry: "hsl(162 72% 45%)",
  "number-theory": "hsl(199 89% 48%)",
  combinatorics: "hsl(330 81% 60%)",
  "logical-reasoning": "hsl(38 92% 50%)",
  "data-handling": "hsl(187 72% 50%)",
};

export default function AnalyticsDashboard() {
  const params = useParams<{ profileId: string }>();
  const profileId = params.profileId;
  const [, setLocation] = useLocation();

  const { data: stats, isLoading: statsLoading } = useQuery<OverallStats>({
    queryKey: [`/api/analytics/${profileId}`],
  });

  const { data: weeklyStats } = useQuery<WeeklyStats>({
    queryKey: [`/api/analytics/${profileId}/weekly`],
  });

  const { data: dailyBreakdown = [] } = useQuery<DailyBreakdown[]>({
    queryKey: [`/api/analytics/${profileId}/weekly-daily`],
  });

  const { data: bloomStats = [] } = useQuery<BloomStat[]>({
    queryKey: [`/api/analytics/${profileId}/bloom`],
  });

  const { data: difficultyStats = [] } = useQuery<DifficultyStat[]>({
    queryKey: [`/api/analytics/${profileId}/difficulty`],
  });

  const { data: sessions = [] } = useQuery<SessionRecord[]>({
    queryKey: [`/api/analytics/${profileId}/sessions`],
  });

  const { data: hintData = [] } = useQuery<HintUsage[]>({
    queryKey: [`/api/analytics/${profileId}/hints`],
  });

  const { data: categoryData = [] } = useQuery<CategoryStat[]>({
    queryKey: [`/api/analytics/${profileId}/categories`],
  });

  if (statsLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const accuracy = stats && stats.totalQuestions > 0
    ? Math.round((stats.totalCorrect / stats.totalQuestions) * 100)
    : 0;

  const weeklyAccuracy = weeklyStats && weeklyStats.totalQuestions > 0
    ? Math.round((weeklyStats.totalCorrect / weeklyStats.totalQuestions) * 100)
    : 0;

  // Bloom radar data
  const bloomRadarData = BLOOM_ORDER.map((level) => {
    const stat = bloomStats.find((s) => s.bloomLevel === level);
    return {
      level: BLOOM_LABELS[level] ?? level,
      accuracy: stat && stat.total > 0 ? Math.round((stat.correct / stat.total) * 100) : 0,
      avgTime: stat?.avgTime ?? 0,
      total: stat?.total ?? 0,
      correct: stat?.correct ?? 0,
    };
  });

  // Difficulty bar data
  const difficultyBarData = ["easy", "medium", "hard", "olympiad"].map((d) => {
    const stat = difficultyStats.find((s) => s.difficulty === d);
    return {
      difficulty: d.charAt(0).toUpperCase() + d.slice(1),
      accuracy: stat && stat.total > 0 ? Math.round((stat.correct / stat.total) * 100) : 0,
      total: stat?.total ?? 0,
      avgTime: stat?.avgTime ?? 0,
      color: DIFFICULTY_COLORS[d],
    };
  });

  // Session trend
  const sessionLineData = sessions.slice(0, 20).reverse().map((s, i) => ({
    session: `#${i + 1}`,
    accuracy: s.totalQuestions > 0 ? Math.round((s.score / s.totalQuestions) * 100) : 0,
  }));

  // Hint usage
  const hintBarData = hintData.slice(0, 15).map((h, i) => ({
    session: `#${i + 1}`,
    "No hints": h.hintsZero,
    "1 hint": h.hintsOne,
    "2 hints": h.hintsTwo,
    "3+ hints": h.hintsThree,
  }));

  // Category data
  const categoryBarData = categoryData.map((c) => ({
    category: c.category.split("-").map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(" "),
    accuracy: c.total > 0 ? Math.round((c.correct / c.total) * 100) : 0,
    total: c.total,
    avgTime: c.avgTime,
    color: CATEGORY_COLORS[c.category] ?? "hsl(var(--primary))",
  }));

  // Daily breakdown chart
  const dailyChartData = dailyBreakdown.map((d) => ({
    day: d.day,
    solved: d.total,
    correct: d.correct,
    accuracy: d.total > 0 ? Math.round((d.correct / d.total) * 100) : 0,
  }));

  // Find strengths and weaknesses
  const strongBloom = bloomRadarData.filter(d => d.total > 0).sort((a, b) => b.accuracy - a.accuracy)[0];
  const weakBloom = bloomRadarData.filter(d => d.total > 0).sort((a, b) => a.accuracy - b.accuracy)[0];
  const strongCategory = categoryBarData.filter(d => d.total > 0).sort((a, b) => b.accuracy - a.accuracy)[0];
  const weakCategory = categoryBarData.filter(d => d.total > 0).sort((a, b) => a.accuracy - b.accuracy)[0];

  return (
    <div className="max-w-6xl mx-auto p-4 lg:p-6 space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => setLocation("/parent-dashboard")} aria-label="Back to dashboard">
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-xl lg:text-2xl font-bold flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-primary" /> Performance Analytics
          </h1>
          <p className="text-sm text-muted-foreground">Comprehensive view of your child's math preparation</p>
        </div>
      </div>

      {/* ═══ WEEKLY SUMMARY ═══ */}
      <Card className="border-primary/30 bg-gradient-to-r from-primary/5 to-background">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-primary" /> This Week's Summary
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-4 mb-6">
            <div className="text-center p-3 rounded-xl bg-card border">
              <p className="text-3xl font-bold">{weeklyStats?.totalSessions ?? 0}</p>
              <p className="text-sm text-muted-foreground">Sessions</p>
            </div>
            <div className="text-center p-3 rounded-xl bg-card border">
              <p className="text-3xl font-bold">{weeklyStats?.totalQuestions ?? 0}</p>
              <p className="text-sm text-muted-foreground">Problems Solved</p>
            </div>
            <div className="text-center p-3 rounded-xl bg-card border">
              <p className="text-3xl font-bold">{weeklyAccuracy}%</p>
              <p className="text-sm text-muted-foreground">Accuracy</p>
            </div>
            <div className="text-center p-3 rounded-xl bg-card border">
              <p className="text-3xl font-bold">{weeklyStats?.avgTime ?? 0}s</p>
              <p className="text-sm text-muted-foreground">Avg Time/Question</p>
            </div>
          </div>

          {/* Daily activity chart */}
          {dailyChartData.length > 0 && (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={dailyChartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="day" tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }} />
                <YAxis tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }} />
                <Tooltip contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "8px" }} />
                <Legend />
                <Bar dataKey="solved" name="Solved" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                <Bar dataKey="correct" name="Correct" fill="hsl(var(--secondary))" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>

      {/* ═══ OVERALL STATS ═══ */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        <SummaryCard icon={<Target className="h-5 w-5 text-primary" />} label="Total Problems" value={stats?.totalQuestions ?? 0} />
        <SummaryCard icon={<TrendingUp className="h-5 w-5 text-secondary" />} label="Accuracy" value={`${accuracy}%`} />
        <SummaryCard icon={<Clock className="h-5 w-5 text-[hsl(var(--warning))]" />} label="Avg Time" value={`${stats?.avgTime ?? 0}s`} />
        <SummaryCard icon={<Lightbulb className="h-5 w-5 text-accent" />} label="Avg Hints" value={stats?.avgHints ?? 0} />
        <SummaryCard icon={<Flame className="h-5 w-5 text-destructive" />} label="Total Sessions" value={stats?.totalSessions ?? 0} />
      </div>

      {/* No data state */}
      {(!stats || stats.totalQuestions === 0) && (
        <Card>
          <CardContent className="py-12 text-center">
            <Calculator className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-lg font-medium">No practice data yet</p>
            <p className="text-muted-foreground">
              Analytics will appear here once your child starts solving problems!
            </p>
          </CardContent>
        </Card>
      )}

      {stats && stats.totalQuestions > 0 && (
        <>
          {/* ═══ PARENT INSIGHTS ═══ */}
          <Card className="border-primary/20 bg-primary/5">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Brain className="h-5 w-5" /> Key Insights
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 sm:grid-cols-2">
                {strongBloom && (
                  <InsightCard
                    icon={<CheckCircle2 className="h-5 w-5 text-secondary" />}
                    title="Strongest Thinking Skill"
                    value={strongBloom.level}
                    detail={`${strongBloom.accuracy}% accuracy (${strongBloom.correct}/${strongBloom.total})`}
                    description={BLOOM_DESCRIPTIONS[BLOOM_ORDER[BLOOM_ORDER.indexOf(strongBloom.level.toLowerCase())] ?? ""] ?? ""}
                  />
                )}
                {weakBloom && weakBloom.level !== strongBloom?.level && (
                  <InsightCard
                    icon={<AlertTriangle className="h-5 w-5 text-[hsl(var(--warning))]" />}
                    title="Needs More Practice"
                    value={weakBloom.level}
                    detail={`${weakBloom.accuracy}% accuracy (${weakBloom.correct}/${weakBloom.total})`}
                    description={BLOOM_DESCRIPTIONS[BLOOM_ORDER[BLOOM_ORDER.indexOf(weakBloom.level.toLowerCase())] ?? ""] ?? ""}
                  />
                )}
                {strongCategory && (
                  <InsightCard
                    icon={<CheckCircle2 className="h-5 w-5 text-secondary" />}
                    title="Strongest Category"
                    value={strongCategory.category}
                    detail={`${strongCategory.accuracy}% accuracy across ${strongCategory.total} problems`}
                    description="Consider moving to harder difficulty in this area"
                  />
                )}
                {weakCategory && weakCategory.category !== strongCategory?.category && (
                  <InsightCard
                    icon={<AlertTriangle className="h-5 w-5 text-[hsl(var(--warning))]" />}
                    title="Weakest Category"
                    value={weakCategory.category}
                    detail={`${weakCategory.accuracy}% accuracy across ${weakCategory.total} problems`}
                    description="Focus more practice sessions here"
                  />
                )}
                <InsightCard
                  icon={<Clock className="h-5 w-5 text-[hsl(var(--info))]" />}
                  title="Response Speed"
                  value={`${stats.avgTime}s average`}
                  detail={stats.avgTime < 20 ? "Very fast" : stats.avgTime < 40 ? "Good pace" : stats.avgTime < 60 ? "Moderate" : "Needs speed work"}
                  description={
                    stats.avgTime < 20
                      ? "Fast solver — check if they're reading questions carefully"
                      : stats.avgTime < 40
                      ? "Good balance of speed and accuracy"
                      : "May need help with concepts to improve speed"
                  }
                />
                <InsightCard
                  icon={<Lightbulb className="h-5 w-5 text-[hsl(var(--warning))]" />}
                  title="Hint Dependency"
                  value={`${stats.avgHints} hints/question`}
                  detail={Number(stats.avgHints) < 0.5 ? "Very independent" : Number(stats.avgHints) < 1 ? "Occasionally uses hints" : "Relies on hints frequently"}
                  description={
                    Number(stats.avgHints) < 0.5
                      ? "Your child solves problems independently — great sign!"
                      : "Encourage attempting without hints first"
                  }
                />
              </div>
            </CardContent>
          </Card>

          {/* ═══ BLOOM'S TAXONOMY ═══ */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Brain className="h-5 w-5 text-primary" /> Bloom's Taxonomy Analysis
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                Shows cognitive skill progression from basic recall to creative problem solving
              </p>
            </CardHeader>
            <CardContent>
              <div className="grid gap-6 lg:grid-cols-2">
                <ResponsiveContainer width="100%" height={300}>
                  <RadarChart data={bloomRadarData}>
                    <PolarGrid stroke="hsl(var(--border))" />
                    <PolarAngleAxis dataKey="level" tick={{ fill: "hsl(var(--foreground))", fontSize: 12 }} />
                    <PolarRadiusAxis angle={90} domain={[0, 100]} tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 10 }} />
                    <Radar name="Accuracy %" dataKey="accuracy" stroke="hsl(var(--primary))" fill="hsl(var(--primary))" fillOpacity={0.3} />
                  </RadarChart>
                </ResponsiveContainer>
                <div className="grid grid-cols-2 gap-3">
                  {bloomRadarData.map((d, i) => (
                    <div key={d.level} className="p-3 rounded-lg border bg-card space-y-1">
                      <div className="flex items-center justify-between">
                        <p className="font-semibold text-sm">{d.level}</p>
                        <Badge variant={d.accuracy >= 70 ? "default" : "secondary"} className="text-xs">{d.accuracy}%</Badge>
                      </div>
                      <p className="text-xs text-muted-foreground">{BLOOM_DESCRIPTIONS[BLOOM_ORDER[i]]}</p>
                      <p className="text-xs text-muted-foreground">{d.correct}/{d.total} correct | {d.avgTime}s avg</p>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* ═══ CHARTS ROW 1 ═══ */}
          <div className="grid gap-6 lg:grid-cols-2">
            {/* Difficulty Breakdown */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <Target className="h-4 w-4" /> Accuracy by Difficulty
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={difficultyBarData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="difficulty" tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }} />
                    <YAxis domain={[0, 100]} tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }} />
                    <Tooltip contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "8px" }} />
                    <Bar dataKey="accuracy" radius={[4, 4, 0, 0]}>
                      {difficultyBarData.map((entry, index) => (
                        <Cell key={index} fill={entry.color} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
                <div className="grid grid-cols-4 gap-2 mt-2">
                  {difficultyBarData.map((d) => (
                    <div key={d.difficulty} className="text-center text-xs">
                      <p className="font-medium">{d.total} solved</p>
                      <p className="text-muted-foreground">{d.avgTime}s avg</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Session Trend */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <TrendingUp className="h-4 w-4" /> Accuracy Over Time
                </CardTitle>
              </CardHeader>
              <CardContent>
                {sessionLineData.length > 1 ? (
                  <ResponsiveContainer width="100%" height={250}>
                    <LineChart data={sessionLineData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis dataKey="session" tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }} />
                      <YAxis domain={[0, 100]} tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }} />
                      <Tooltip contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "8px" }} />
                      <Line type="monotone" dataKey="accuracy" stroke="hsl(var(--primary))" strokeWidth={2} dot={{ fill: "hsl(var(--primary))" }} />
                    </LineChart>
                  </ResponsiveContainer>
                ) : (
                  <p className="text-center text-muted-foreground py-8">Complete more sessions to see trends</p>
                )}
              </CardContent>
            </Card>
          </div>

          {/* ═══ CHARTS ROW 2 ═══ */}
          <div className="grid gap-6 lg:grid-cols-2">
            {/* Category Performance */}
            {categoryBarData.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-base">
                    <Calculator className="h-4 w-4" /> Performance by Category
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={250}>
                    <BarChart data={categoryBarData} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis type="number" domain={[0, 100]} tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }} />
                      <YAxis dataKey="category" type="category" width={120} tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }} />
                      <Tooltip contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "8px" }} />
                      <Bar dataKey="accuracy" radius={[0, 4, 4, 0]}>
                        {categoryBarData.map((entry, index) => (
                          <Cell key={index} fill={entry.color} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            )}

            {/* Hint Usage */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <Lightbulb className="h-4 w-4" /> Hint Usage Over Time
                </CardTitle>
                <p className="text-xs text-muted-foreground">Fewer hints = growing confidence</p>
              </CardHeader>
              <CardContent>
                {hintBarData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={250}>
                    <BarChart data={hintBarData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis dataKey="session" tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }} />
                      <YAxis tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }} />
                      <Tooltip contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "8px" }} />
                      <Legend />
                      <Bar dataKey="No hints" stackId="a" fill="hsl(var(--secondary))" />
                      <Bar dataKey="1 hint" stackId="a" fill="hsl(var(--warning))" />
                      <Bar dataKey="2 hints" stackId="a" fill="hsl(var(--accent))" />
                      <Bar dataKey="3+ hints" stackId="a" fill="hsl(var(--destructive))" />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <p className="text-center text-muted-foreground py-8">No hint data yet</p>
                )}
              </CardContent>
            </Card>
          </div>
        </>
      )}
    </div>
  );
}

function SummaryCard({ icon, label, value }: { icon: React.ReactNode; label: string; value: string | number }) {
  return (
    <Card className="shadow-soft">
      <CardContent className="flex items-center gap-3 p-4">
        <div className="p-2.5 rounded-lg bg-muted">{icon}</div>
        <div>
          <p className="text-xl font-bold text-foreground">{value}</p>
          <p className="text-xs text-muted-foreground">{label}</p>
        </div>
      </CardContent>
    </Card>
  );
}

function InsightCard({ icon, title, value, detail, description }: {
  icon: React.ReactNode;
  title: string;
  value: string;
  detail: string;
  description: string;
}) {
  return (
    <div className="p-4 rounded-xl border bg-card space-y-1">
      <div className="flex items-center gap-2">
        {icon}
        <p className="text-sm text-muted-foreground">{title}</p>
      </div>
      <p className="text-lg font-semibold">{value}</p>
      <p className="text-sm font-medium text-primary">{detail}</p>
      <p className="text-xs text-muted-foreground">{description}</p>
    </div>
  );
}
