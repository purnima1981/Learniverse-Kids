import { useQuery } from "@tanstack/react-query";
import { useParams, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  ArrowLeft,
  Target,
  Clock,
  Lightbulb,
  TrendingUp,
  Loader2,
  Brain,
  BarChart3,
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
} from "recharts";

interface OverallStats {
  totalQuestions: number;
  totalCorrect: number;
  avgTime: number;
  avgHints: number;
  totalSessions: number;
}

interface BloomStat {
  bloomLevel: string;
  total: number;
  correct: number;
  avgTime: number;
}

interface SessionRecord {
  id: number;
  chapterId: number;
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

interface ThemeStat {
  theme: string;
  total: number;
  correct: number;
}

const BLOOM_ORDER = ["remember", "understand", "apply", "analyze", "evaluate", "create"];
const BLOOM_COLORS: Record<string, string> = {
  remember: "#60a5fa",
  understand: "#34d399",
  apply: "#fbbf24",
  analyze: "#f97316",
  evaluate: "#ef4444",
  create: "#a855f7",
};

export default function AnalyticsDashboard() {
  const params = useParams<{ profileId: string }>();
  const profileId = params.profileId;
  const [, setLocation] = useLocation();

  const { data: stats, isLoading: statsLoading } = useQuery<OverallStats>({
    queryKey: [`/api/analytics/${profileId}`],
  });

  const { data: bloomStats = [] } = useQuery<BloomStat[]>({
    queryKey: [`/api/analytics/${profileId}/bloom`],
  });

  const { data: sessions = [] } = useQuery<SessionRecord[]>({
    queryKey: [`/api/analytics/${profileId}/sessions`],
  });

  const { data: hintData = [] } = useQuery<HintUsage[]>({
    queryKey: [`/api/analytics/${profileId}/hints`],
  });

  const { data: themeData = [] } = useQuery<ThemeStat[]>({
    queryKey: [`/api/analytics/${profileId}/themes`],
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

  // Prepare bloom radar data
  const bloomRadarData = BLOOM_ORDER.map((level) => {
    const stat = bloomStats.find((s) => s.bloomLevel === level);
    return {
      level: level.charAt(0).toUpperCase() + level.slice(1),
      accuracy: stat && stat.total > 0 ? Math.round((stat.correct / stat.total) * 100) : 0,
      avgTime: stat?.avgTime ?? 0,
    };
  });

  // Prepare session history for line chart
  const sessionLineData = sessions.map((s, i) => ({
    session: `#${i + 1}`,
    accuracy: s.totalQuestions > 0 ? Math.round((s.score / s.totalQuestions) * 100) : 0,
    date: new Date(s.completedAt).toLocaleDateString(),
  }));

  // Prepare hint usage data
  const hintBarData = hintData.map((h, i) => ({
    session: `#${i + 1}`,
    "No hints": h.hintsZero,
    "1 hint": h.hintsOne,
    "2 hints": h.hintsTwo,
    "3 hints": h.hintsThree,
  }));

  // Prepare theme data
  const themeBarData = themeData.map((t) => ({
    theme: t.theme.charAt(0).toUpperCase() + t.theme.slice(1),
    accuracy: t.total > 0 ? Math.round((t.correct / t.total) * 100) : 0,
    total: t.total,
  }));

  // Prepare bloom time data
  const bloomTimeData = BLOOM_ORDER.map((level) => {
    const stat = bloomStats.find((s) => s.bloomLevel === level);
    return {
      level: level.charAt(0).toUpperCase() + level.slice(1),
      avgTime: stat?.avgTime ?? 0,
    };
  });

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-8">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => setLocation("/parent-dashboard")}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <BarChart3 className="h-6 w-6 text-primary" /> Learning Analytics
          </h1>
          <p className="text-muted-foreground">Detailed performance insights</p>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <SummaryCard
          icon={<Target className="h-5 w-5 text-blue-500" />}
          label="Questions Answered"
          value={stats?.totalQuestions ?? 0}
        />
        <SummaryCard
          icon={<TrendingUp className="h-5 w-5 text-green-500" />}
          label="Accuracy"
          value={`${accuracy}%`}
        />
        <SummaryCard
          icon={<Clock className="h-5 w-5 text-yellow-500" />}
          label="Avg Time/Question"
          value={`${stats?.avgTime ?? 0}s`}
        />
        <SummaryCard
          icon={<Lightbulb className="h-5 w-5 text-orange-500" />}
          label="Avg Hints/Question"
          value={stats?.avgHints ?? 0}
        />
      </div>

      {/* No data state */}
      {(!stats || stats.totalQuestions === 0) && (
        <Card>
          <CardContent className="py-12 text-center">
            <Brain className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-lg font-medium">No quiz data yet</p>
            <p className="text-muted-foreground">
              Your child hasn't completed any quizzes yet. Analytics will appear here once they start learning!
            </p>
          </CardContent>
        </Card>
      )}

      {stats && stats.totalQuestions > 0 && (
        <>
          {/* Charts Row 1 */}
          <div className="grid gap-6 lg:grid-cols-2">
            {/* Bloom Taxonomy Radar */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <Brain className="h-4 w-4" /> Bloom's Taxonomy Accuracy
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <RadarChart data={bloomRadarData}>
                    <PolarGrid stroke="hsl(var(--border))" />
                    <PolarAngleAxis dataKey="level" tick={{ fill: "hsl(var(--foreground))", fontSize: 12 }} />
                    <PolarRadiusAxis angle={90} domain={[0, 100]} tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 10 }} />
                    <Radar
                      name="Accuracy %"
                      dataKey="accuracy"
                      stroke="hsl(var(--primary))"
                      fill="hsl(var(--primary))"
                      fillOpacity={0.3}
                    />
                  </RadarChart>
                </ResponsiveContainer>
                <div className="flex flex-wrap gap-2 mt-2 justify-center">
                  {bloomRadarData.map((d) => (
                    <Badge key={d.level} variant="outline" className="text-xs">
                      {d.level}: {d.accuracy}%
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Accuracy Over Time */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <TrendingUp className="h-4 w-4" /> Accuracy Over Time
                </CardTitle>
              </CardHeader>
              <CardContent>
                {sessionLineData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={sessionLineData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis dataKey="session" tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }} />
                      <YAxis domain={[0, 100]} tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "hsl(var(--card))",
                          border: "1px solid hsl(var(--border))",
                          borderRadius: "8px",
                        }}
                      />
                      <Line
                        type="monotone"
                        dataKey="accuracy"
                        stroke="hsl(var(--primary))"
                        strokeWidth={2}
                        dot={{ fill: "hsl(var(--primary))" }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                ) : (
                  <p className="text-center text-muted-foreground py-8">Complete more quizzes to see trends</p>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Charts Row 2 */}
          <div className="grid gap-6 lg:grid-cols-2">
            {/* Hint Dependency */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <Lightbulb className="h-4 w-4" /> Hint Usage by Session
                </CardTitle>
              </CardHeader>
              <CardContent>
                {hintBarData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={hintBarData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis dataKey="session" tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }} />
                      <YAxis tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "hsl(var(--card))",
                          border: "1px solid hsl(var(--border))",
                          borderRadius: "8px",
                        }}
                      />
                      <Legend />
                      <Bar dataKey="No hints" stackId="a" fill="#34d399" />
                      <Bar dataKey="1 hint" stackId="a" fill="#fbbf24" />
                      <Bar dataKey="2 hints" stackId="a" fill="#f97316" />
                      <Bar dataKey="3 hints" stackId="a" fill="#ef4444" />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <p className="text-center text-muted-foreground py-8">No hint data yet</p>
                )}
              </CardContent>
            </Card>

            {/* Subject Performance */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <Target className="h-4 w-4" /> Subject Performance
                </CardTitle>
              </CardHeader>
              <CardContent>
                {themeBarData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={themeBarData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis dataKey="theme" tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }} />
                      <YAxis domain={[0, 100]} tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "hsl(var(--card))",
                          border: "1px solid hsl(var(--border))",
                          borderRadius: "8px",
                        }}
                      />
                      <Bar dataKey="accuracy" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <p className="text-center text-muted-foreground py-8">No subject data yet</p>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Bloom Level Time */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Clock className="h-4 w-4" /> Average Time by Bloom's Taxonomy Level
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={bloomTimeData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="level" tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }} />
                  <YAxis tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }} label={{ value: "seconds", angle: -90, position: "insideLeft", fill: "hsl(var(--muted-foreground))" }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px",
                    }}
                  />
                  <Bar dataKey="avgTime" radius={[4, 4, 0, 0]}>
                    {bloomTimeData.map((entry, i) => (
                      <rect key={i} fill={BLOOM_COLORS[BLOOM_ORDER[i]] ?? "hsl(var(--primary))"} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}

function SummaryCard({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string | number;
}) {
  return (
    <Card>
      <CardContent className="flex items-center gap-4 p-6">
        <div className="p-3 rounded-lg bg-card border">{icon}</div>
        <div>
          <p className="text-2xl font-bold">{value}</p>
          <p className="text-sm text-muted-foreground">{label}</p>
        </div>
      </CardContent>
    </Card>
  );
}
