import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { useLocation } from 'wouter';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { useQuery } from '@tanstack/react-query';
import { 
  Profile, 
  UserProgress, 
  UserQuestionResponse, 
  UserGameResult,
  Question
} from '@shared/schema';
import { 
  BarChart, 
  Bar, 
  LineChart, 
  Line, 
  PieChart, 
  Pie, 
  Cell, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
} from 'recharts';
import { 
  Book, 
  Brain, 
  Clock, 
  Crown, 
  GraduationCap, 
  LineChart as LineChartIcon,
  ListChecks, 
  Rocket, 
  Sparkles, 
  Star, 
  Target, 
  Timer, 
  TrendingUp, 
  User, 
  Users, 
  ChevronLeft,
  BarChart2,
  PieChart as PieChartIcon,
  Activity,
  Award,
} from 'lucide-react';

// Define colors for charts
const CHART_COLORS = {
  math: '#38bdf8', // sky-400
  science: '#22c55e', // green-500
  language: '#a855f7', // purple-500
  engineering: '#f97316', // orange-500
  materials: '#f43f5e', // rose-500
  interdisciplinary: '#8b5cf6', // violet-500
};

const DIFFICULTY_COLORS = {
  easy: '#22c55e', // green-500
  medium: '#f59e0b', // amber-500
  hard: '#ef4444', // red-500
};

const QUESTION_TYPE_COLORS = {
  'multiple-choice': '#8b5cf6', // violet-500
  'matching': '#38bdf8', // sky-400
  'unscramble': '#f97316', // orange-500
  'fill-blank': '#22c55e', // green-500
  'true-false': '#64748b', // slate-500
  'hidden-word': '#ec4899', // pink-500
  'word-sequence': '#f59e0b', // amber-500
};

export default function ParentDashboard() {
  const { user } = useAuth();
  const [_, navigate] = useLocation();
  const { toast } = useToast();
  const [selectedProfileId, setSelectedProfileId] = useState<number | null>(null);

  // Get profiles from API
  const { data: profiles, isLoading: profilesLoading } = useQuery<Profile[]>({
    queryKey: ['/api/profiles'],
    enabled: !!user,
  });

  // Set default selected profile when profiles are loaded
  useEffect(() => {
    if (profiles && profiles.length > 0 && !selectedProfileId) {
      // Find default profile if exists, otherwise use first
      const defaultProfile = profiles.find(p => p.isDefault) || profiles[0];
      setSelectedProfileId(defaultProfile.id);
    }
  }, [profiles, selectedProfileId]);

  // Get progress data for selected profile
  const { data: progress, isLoading: progressLoading } = useQuery<UserProgress>({
    queryKey: ['/api/profiles', selectedProfileId, 'progress'],
    enabled: !!selectedProfileId,
  });

  // Get responses data for selected profile
  const { data: responses, isLoading: responsesLoading } = useQuery<UserQuestionResponse[]>({
    queryKey: ['/api/profiles', selectedProfileId, 'question-responses'],
    enabled: !!selectedProfileId,
  });

  // Get game results for selected profile
  const { data: gameResults, isLoading: gameResultsLoading } = useQuery<UserGameResult[]>({
    queryKey: ['/api/profiles', selectedProfileId, 'game-results'],
    enabled: !!selectedProfileId,
  });

  // Function to navigate back to profile selection
  const goToProfiles = () => {
    navigate('/profiles');
  };

  // Prepare data for subject performance chart
  const prepareSubjectPerformanceData = () => {
    if (!responses) return [];

    const subjectStats: Record<string, { correct: number, total: number }> = {};
    
    responses.forEach(resp => {
      const question = resp.question as Question;
      const subject = question.theme;
      
      if (!subjectStats[subject]) {
        subjectStats[subject] = { correct: 0, total: 0 };
      }
      
      subjectStats[subject].total += 1;
      if (resp.isCorrect) {
        subjectStats[subject].correct += 1;
      }
    });
    
    return Object.entries(subjectStats).map(([subject, stats]) => ({
      subject,
      score: Math.round((stats.correct / stats.total) * 100),
      total: stats.total,
    }));
  };

  // Prepare data for difficulty performance chart
  const prepareDifficultyPerformanceData = () => {
    if (!responses) return [];

    const difficultyStats: Record<string, { correct: number, total: number }> = {};
    
    responses.forEach(resp => {
      const question = resp.question as Question;
      const difficulty = question.difficulty;
      
      if (!difficultyStats[difficulty]) {
        difficultyStats[difficulty] = { correct: 0, total: 0 };
      }
      
      difficultyStats[difficulty].total += 1;
      if (resp.isCorrect) {
        difficultyStats[difficulty].correct += 1;
      }
    });
    
    return Object.entries(difficultyStats).map(([difficulty, stats]) => ({
      difficulty,
      score: Math.round((stats.correct / stats.total) * 100),
      total: stats.total,
    }));
  };

  // Prepare data for question type performance chart
  const prepareQuestionTypePerformanceData = () => {
    if (!responses) return [];

    const typeStats: Record<string, { correct: number, total: number, avgTime: number, totalTime: number }> = {};
    
    responses.forEach(resp => {
      const question = resp.question as Question;
      const type = question.type;
      
      if (!typeStats[type]) {
        typeStats[type] = { correct: 0, total: 0, avgTime: 0, totalTime: 0 };
      }
      
      typeStats[type].total += 1;
      typeStats[type].totalTime += resp.timeTaken || 0;
      
      if (resp.isCorrect) {
        typeStats[type].correct += 1;
      }
    });
    
    return Object.entries(typeStats).map(([type, stats]) => ({
      type,
      score: Math.round((stats.correct / stats.total) * 100),
      avgTime: Math.round(stats.totalTime / stats.total),
      total: stats.total,
    }));
  };

  // Prepare data for time trend chart
  const prepareTimeTrendData = () => {
    if (!responses) return [];

    // Group responses by date
    const responsesPerDay: Record<string, { correct: number, total: number }> = {};
    
    responses.forEach(resp => {
      const date = new Date(resp.attemptedAt).toLocaleDateString();
      
      if (!responsesPerDay[date]) {
        responsesPerDay[date] = { correct: 0, total: 0 };
      }
      
      responsesPerDay[date].total += 1;
      if (resp.isCorrect) {
        responsesPerDay[date].correct += 1;
      }
    });
    
    return Object.entries(responsesPerDay).map(([date, stats]) => ({
      date,
      accuracy: Math.round((stats.correct / stats.total) * 100),
      questions: stats.total,
    }));
  };

  // Prepare data for strengths and weaknesses
  const prepareStrengthsWeaknesses = () => {
    if (!responses) return { strengths: [], weaknesses: [] };

    const subjectStats: Record<string, { correct: number, total: number, score: number }> = {};
    
    responses.forEach(resp => {
      const question = resp.question as Question;
      const subject = question.theme;
      
      if (!subjectStats[subject]) {
        subjectStats[subject] = { correct: 0, total: 0, score: 0 };
      }
      
      subjectStats[subject].total += 1;
      if (resp.isCorrect) {
        subjectStats[subject].correct += 1;
      }
    });
    
    // Calculate score percentages
    Object.keys(subjectStats).forEach(subject => {
      subjectStats[subject].score = Math.round((subjectStats[subject].correct / subjectStats[subject].total) * 100);
    });
    
    // Convert to arrays and sort
    const subjectArray = Object.entries(subjectStats).map(([subject, stats]) => ({
      subject,
      score: stats.score,
      total: stats.total,
    }));
    
    // Sort by score (descending for strengths, ascending for weaknesses)
    const strengths = [...subjectArray].sort((a, b) => b.score - a.score).slice(0, 3);
    const weaknesses = [...subjectArray].sort((a, b) => a.score - b.score).slice(0, 3);
    
    return { strengths, weaknesses };
  };

  // Prepare data for time distribution radar chart
  const prepareTimeDistributionData = () => {
    if (!responses) return [];

    const timeBySubject: Record<string, number> = {};
    const countBySubject: Record<string, number> = {};
    
    responses.forEach(resp => {
      const question = resp.question as Question;
      const subject = question.theme;
      const timeTaken = resp.timeTaken || 0;
      
      if (!timeBySubject[subject]) {
        timeBySubject[subject] = 0;
        countBySubject[subject] = 0;
      }
      
      timeBySubject[subject] += timeTaken;
      countBySubject[subject] += 1;
    });
    
    // Calculate average time per subject
    return Object.entries(timeBySubject).map(([subject, totalTime]) => ({
      subject,
      avgTime: Math.round(totalTime / countBySubject[subject]),
    }));
  };

  // Prepare challenge and game data
  const prepareGamePerformanceData = () => {
    if (!gameResults) return [];

    const gameData: Record<string, { totalScore: number, gamesPlayed: number, avgScore: number }> = {};
    
    gameResults.forEach(result => {
      const game = result.microgame;
      const gameType = game.type;
      
      if (!gameData[gameType]) {
        gameData[gameType] = { totalScore: 0, gamesPlayed: 0, avgScore: 0 };
      }
      
      gameData[gameType].totalScore += result.score;
      gameData[gameType].gamesPlayed += 1;
    });
    
    // Calculate average scores
    Object.keys(gameData).forEach(type => {
      gameData[type].avgScore = Math.round(gameData[type].totalScore / gameData[type].gamesPlayed);
    });
    
    return Object.entries(gameData).map(([type, data]) => ({
      type,
      avgScore: data.avgScore,
      gamesPlayed: data.gamesPlayed,
    }));
  };

  const selectedProfile = profiles?.find(p => p.id === selectedProfileId);
  const subjectPerformance = prepareSubjectPerformanceData();
  const difficultyPerformance = prepareDifficultyPerformanceData();
  const questionTypePerformance = prepareQuestionTypePerformanceData();
  const timeTrendData = prepareTimeTrendData();
  const { strengths, weaknesses } = prepareStrengthsWeaknesses();
  const timeDistribution = prepareTimeDistributionData();
  const gamePerformance = prepareGamePerformanceData();

  if (profilesLoading || !user) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-gradient-to-br from-indigo-900 to-blue-900">
        <div className="animate-pulse text-white text-2xl">Loading dashboard...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-950 via-blue-950 to-indigo-900 text-white">
      <div className="container mx-auto px-4 py-8">
        {/* Header with navigation */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center">
            <Button variant="ghost" onClick={goToProfiles} className="mr-4 text-blue-300 hover:text-white">
              <ChevronLeft className="h-5 w-5 mr-1" />
              Back to Profiles
            </Button>
            <h1 className="text-3xl font-bold flex items-center">
              <GraduationCap className="h-8 w-8 mr-3 text-blue-400" />
              Parent Dashboard
            </h1>
          </div>
          
          {/* Profile selector */}
          {profiles && profiles.length > 0 && (
            <div className="flex items-center">
              <span className="mr-2 text-blue-200">Child Profile:</span>
              <Select
                value={selectedProfileId?.toString()}
                onValueChange={(value) => setSelectedProfileId(Number(value))}
              >
                <SelectTrigger className="w-[180px] bg-blue-900/50 border-blue-700/50 text-white">
                  <SelectValue placeholder="Select a profile" />
                </SelectTrigger>
                <SelectContent className="bg-blue-900 border-blue-700 text-white">
                  {profiles.map((profile) => (
                    <SelectItem key={profile.id} value={profile.id.toString()}>
                      {profile.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
        </div>

        {/* Selected Profile Overview Card */}
        {selectedProfile && (
          <Card className="bg-blue-900/20 backdrop-blur-md border border-blue-700/30 shadow-xl mb-8">
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
                <div className={`h-24 w-24 rounded-full ${selectedProfile.avatar || 'bg-purple-500'} flex items-center justify-center`}>
                  <span className="text-3xl font-bold text-white">{selectedProfile.name.charAt(0).toUpperCase()}</span>
                </div>
                
                <div className="flex-1">
                  <h2 className="text-2xl font-bold mb-2">{selectedProfile.name}'s Learning Journey</h2>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <div className="flex items-center">
                      <GraduationCap className="h-5 w-5 mr-2 text-blue-400" />
                      <span className="text-blue-200">Grade {selectedProfile.grade}</span>
                    </div>
                    <div className="flex items-center">
                      <Book className="h-5 w-5 mr-2 text-green-400" />
                      <span className="text-blue-200">
                        {progress ? `${progress.completedChapters} chapters completed` : 'No chapters completed yet'}
                      </span>
                    </div>
                    <div className="flex items-center">
                      <Clock className="h-5 w-5 mr-2 text-yellow-400" />
                      <span className="text-blue-200">
                        {progress ? `${progress.daysActive} days active` : 'Not active yet'}
                      </span>
                    </div>
                  </div>
                  
                  {/* Progress overview */}
                  {progress && (
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6">
                      <div className="bg-blue-800/30 rounded-lg p-4 flex flex-col items-center">
                        <div className="text-3xl font-bold text-blue-300 mb-1">{progress.storyProgressPercent}%</div>
                        <div className="text-sm text-blue-200">Story Progress</div>
                      </div>
                      <div className="bg-blue-800/30 rounded-lg p-4 flex flex-col items-center">
                        <div className="text-3xl font-bold text-green-400 mb-1">{progress.vocabularyLearned}</div>
                        <div className="text-sm text-blue-200">Vocabulary Words</div>
                      </div>
                      <div className="bg-blue-800/30 rounded-lg p-4 flex flex-col items-center">
                        <div className="text-3xl font-bold text-purple-400 mb-1">
                          {responses ? Math.round((responses.filter(r => r.isCorrect).length / responses.length) * 100) : 0}%
                        </div>
                        <div className="text-sm text-blue-200">Quiz Accuracy</div>
                      </div>
                      <div className="bg-blue-800/30 rounded-lg p-4 flex flex-col items-center">
                        <div className="text-3xl font-bold text-orange-400 mb-1">
                          {gameResults ? gameResults.length : 0}
                        </div>
                        <div className="text-sm text-blue-200">Games Played</div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Main Dashboard Content */}
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="bg-blue-900/50 border border-blue-800 p-1">
            <TabsTrigger value="overview" className="data-[state=active]:bg-blue-700">
              <BarChart2 className="h-4 w-4 mr-2" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="subjects" className="data-[state=active]:bg-blue-700">
              <Book className="h-4 w-4 mr-2" />
              Subject Performance
            </TabsTrigger>
            <TabsTrigger value="skills" className="data-[state=active]:bg-blue-700">
              <Target className="h-4 w-4 mr-2" />
              Skills Analysis
            </TabsTrigger>
            <TabsTrigger value="time" className="data-[state=active]:bg-blue-700">
              <Clock className="h-4 w-4 mr-2" />
              Time & Activity
            </TabsTrigger>
            <TabsTrigger value="recommendations" className="data-[state=active]:bg-blue-700">
              <Sparkles className="h-4 w-4 mr-2" />
              Recommendations
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Strengths */}
              <Card className="bg-blue-900/20 backdrop-blur-md border border-blue-700/30 shadow-xl">
                <CardHeader>
                  <CardTitle className="flex items-center text-xl font-medium">
                    <Award className="h-5 w-5 mr-2 text-yellow-400" />
                    Strengths
                  </CardTitle>
                  <CardDescription className="text-blue-300">
                    Subjects where {selectedProfile?.name} excels
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {strengths.length > 0 ? (
                    <div className="space-y-4">
                      {strengths.map((strength, idx) => (
                        <div key={idx} className="flex items-center justify-between">
                          <div className="flex items-center">
                            <div className={`w-3 h-3 rounded-full mr-3`} style={{ backgroundColor: CHART_COLORS[strength.subject as keyof typeof CHART_COLORS] || '#64748b' }}></div>
                            <span className="text-blue-100 capitalize">{strength.subject}</span>
                          </div>
                          <div className="flex items-center">
                            <div className="w-32 bg-blue-950/50 rounded-full h-2.5 mr-3">
                              <div 
                                className="h-2.5 rounded-full" 
                                style={{ 
                                  width: `${strength.score}%`,
                                  backgroundColor: CHART_COLORS[strength.subject as keyof typeof CHART_COLORS] || '#64748b'
                                }}
                              ></div>
                            </div>
                            <span className="text-blue-200 font-medium">{strength.score}%</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center text-blue-300 py-6">
                      No data available yet
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Weaknesses */}
              <Card className="bg-blue-900/20 backdrop-blur-md border border-blue-700/30 shadow-xl">
                <CardHeader>
                  <CardTitle className="flex items-center text-xl font-medium">
                    <Target className="h-5 w-5 mr-2 text-orange-400" />
                    Areas for Improvement
                  </CardTitle>
                  <CardDescription className="text-blue-300">
                    Subjects where {selectedProfile?.name} needs more practice
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {weaknesses.length > 0 ? (
                    <div className="space-y-4">
                      {weaknesses.map((weakness, idx) => (
                        <div key={idx} className="flex items-center justify-between">
                          <div className="flex items-center">
                            <div className={`w-3 h-3 rounded-full mr-3`} style={{ backgroundColor: CHART_COLORS[weakness.subject as keyof typeof CHART_COLORS] || '#64748b' }}></div>
                            <span className="text-blue-100 capitalize">{weakness.subject}</span>
                          </div>
                          <div className="flex items-center">
                            <div className="w-32 bg-blue-950/50 rounded-full h-2.5 mr-3">
                              <div 
                                className="h-2.5 rounded-full" 
                                style={{ 
                                  width: `${weakness.score}%`,
                                  backgroundColor: CHART_COLORS[weakness.subject as keyof typeof CHART_COLORS] || '#64748b'
                                }}
                              ></div>
                            </div>
                            <span className="text-blue-200 font-medium">{weakness.score}%</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center text-blue-300 py-6">
                      No data available yet
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Overall Progress Chart */}
            <Card className="bg-blue-900/20 backdrop-blur-md border border-blue-700/30 shadow-xl">
              <CardHeader>
                <CardTitle className="flex items-center text-xl font-medium">
                  <TrendingUp className="h-5 w-5 mr-2 text-blue-400" />
                  Learning Progress Over Time
                </CardTitle>
                <CardDescription className="text-blue-300">
                  Performance trends and activity
                </CardDescription>
              </CardHeader>
              <CardContent>
                {timeTrendData.length > 0 ? (
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart
                        data={timeTrendData}
                        margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                        <XAxis dataKey="date" stroke="#94a3b8" />
                        <YAxis stroke="#94a3b8" />
                        <Tooltip 
                          contentStyle={{ 
                            backgroundColor: '#1e293b', 
                            borderColor: '#475569',
                            color: '#f8fafc'
                          }} 
                        />
                        <Legend />
                        <Line 
                          type="monotone" 
                          dataKey="accuracy" 
                          name="Accuracy (%)" 
                          stroke="#38bdf8" 
                          activeDot={{ r: 8 }} 
                        />
                        <Line 
                          type="monotone" 
                          dataKey="questions" 
                          name="Questions Answered" 
                          stroke="#a855f7" 
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                ) : (
                  <div className="text-center text-blue-300 py-16">
                    No time data available yet
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Subject Performance Tab */}
          <TabsContent value="subjects" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Subject Performance Chart */}
              <Card className="bg-blue-900/20 backdrop-blur-md border border-blue-700/30 shadow-xl">
                <CardHeader>
                  <CardTitle className="flex items-center text-xl font-medium">
                    <Book className="h-5 w-5 mr-2 text-blue-400" />
                    Subject Performance
                  </CardTitle>
                  <CardDescription className="text-blue-300">
                    Scores by subject area
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {subjectPerformance.length > 0 ? (
                    <div className="h-80">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                          data={subjectPerformance}
                          margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                        >
                          <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                          <XAxis dataKey="subject" stroke="#94a3b8" />
                          <YAxis stroke="#94a3b8" />
                          <Tooltip 
                            contentStyle={{ 
                              backgroundColor: '#1e293b', 
                              borderColor: '#475569',
                              color: '#f8fafc'
                            }} 
                          />
                          <Legend />
                          <Bar dataKey="score" name="Score (%)" radius={[4, 4, 0, 0]}>
                            {subjectPerformance.map((entry, index) => (
                              <Cell 
                                key={`cell-${index}`} 
                                fill={CHART_COLORS[entry.subject as keyof typeof CHART_COLORS] || '#64748b'} 
                              />
                            ))}
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  ) : (
                    <div className="text-center text-blue-300 py-16">
                      No subject performance data available yet
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Difficulty Performance Chart */}
              <Card className="bg-blue-900/20 backdrop-blur-md border border-blue-700/30 shadow-xl">
                <CardHeader>
                  <CardTitle className="flex items-center text-xl font-medium">
                    <Activity className="h-5 w-5 mr-2 text-purple-400" />
                    Performance by Difficulty
                  </CardTitle>
                  <CardDescription className="text-blue-300">
                    How well {selectedProfile?.name} handles different challenge levels
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {difficultyPerformance.length > 0 ? (
                    <div className="h-80">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                          data={difficultyPerformance}
                          margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                        >
                          <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                          <XAxis dataKey="difficulty" stroke="#94a3b8" />
                          <YAxis stroke="#94a3b8" />
                          <Tooltip 
                            contentStyle={{ 
                              backgroundColor: '#1e293b', 
                              borderColor: '#475569',
                              color: '#f8fafc'
                            }} 
                          />
                          <Legend />
                          <Bar dataKey="score" name="Score (%)" radius={[4, 4, 0, 0]}>
                            {difficultyPerformance.map((entry, index) => (
                              <Cell 
                                key={`cell-${index}`} 
                                fill={DIFFICULTY_COLORS[entry.difficulty as keyof typeof DIFFICULTY_COLORS] || '#64748b'} 
                              />
                            ))}
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  ) : (
                    <div className="text-center text-blue-300 py-16">
                      No difficulty performance data available yet
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Subject distribution */}
            <Card className="bg-blue-900/20 backdrop-blur-md border border-blue-700/30 shadow-xl">
              <CardHeader>
                <CardTitle className="flex items-center text-xl font-medium">
                  <PieChartIcon className="h-5 w-5 mr-2 text-green-400" />
                  Subject Distribution
                </CardTitle>
                <CardDescription className="text-blue-300">
                  Distribution of questions attempted across subject areas
                </CardDescription>
              </CardHeader>
              <CardContent>
                {subjectPerformance.length > 0 ? (
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={subjectPerformance}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          outerRadius={120}
                          fill="#8884d8"
                          dataKey="total"
                          nameKey="subject"
                          label={({ subject, percent }) => `${subject}: ${(percent * 100).toFixed(0)}%`}
                        >
                          {subjectPerformance.map((entry, index) => (
                            <Cell 
                              key={`cell-${index}`} 
                              fill={CHART_COLORS[entry.subject as keyof typeof CHART_COLORS] || '#64748b'} 
                            />
                          ))}
                        </Pie>
                        <Tooltip 
                          contentStyle={{ 
                            backgroundColor: '#1e293b', 
                            borderColor: '#475569',
                            color: '#f8fafc'
                          }} 
                        />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                ) : (
                  <div className="text-center text-blue-300 py-16">
                    No subject distribution data available yet
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Skills Analysis Tab */}
          <TabsContent value="skills" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Question Type Performance */}
              <Card className="bg-blue-900/20 backdrop-blur-md border border-blue-700/30 shadow-xl">
                <CardHeader>
                  <CardTitle className="flex items-center text-xl font-medium">
                    <ListChecks className="h-5 w-5 mr-2 text-yellow-400" />
                    Question Type Performance
                  </CardTitle>
                  <CardDescription className="text-blue-300">
                    How well {selectedProfile?.name} handles different question formats
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {questionTypePerformance.length > 0 ? (
                    <div className="h-80">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                          data={questionTypePerformance}
                          margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                        >
                          <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                          <XAxis dataKey="type" stroke="#94a3b8" />
                          <YAxis stroke="#94a3b8" />
                          <Tooltip 
                            contentStyle={{ 
                              backgroundColor: '#1e293b', 
                              borderColor: '#475569',
                              color: '#f8fafc'
                            }} 
                          />
                          <Legend />
                          <Bar dataKey="score" name="Score (%)" radius={[4, 4, 0, 0]}>
                            {questionTypePerformance.map((entry, index) => (
                              <Cell 
                                key={`cell-${index}`} 
                                fill={QUESTION_TYPE_COLORS[entry.type as keyof typeof QUESTION_TYPE_COLORS] || '#64748b'} 
                              />
                            ))}
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  ) : (
                    <div className="text-center text-blue-300 py-16">
                      No question type data available yet
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Game Performance */}
              <Card className="bg-blue-900/20 backdrop-blur-md border border-blue-700/30 shadow-xl">
                <CardHeader>
                  <CardTitle className="flex items-center text-xl font-medium">
                    <Rocket className="h-5 w-5 mr-2 text-orange-400" />
                    Game Performance
                  </CardTitle>
                  <CardDescription className="text-blue-300">
                    Performance in educational games and challenges
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {gamePerformance.length > 0 ? (
                    <div className="h-80">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                          data={gamePerformance}
                          margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                        >
                          <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                          <XAxis dataKey="type" stroke="#94a3b8" />
                          <YAxis stroke="#94a3b8" />
                          <Tooltip 
                            contentStyle={{ 
                              backgroundColor: '#1e293b', 
                              borderColor: '#475569',
                              color: '#f8fafc'
                            }} 
                          />
                          <Legend />
                          <Bar dataKey="avgScore" name="Average Score" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
                          <Bar dataKey="gamesPlayed" name="Games Played" fill="#38bdf8" radius={[4, 4, 0, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  ) : (
                    <div className="text-center text-blue-300 py-16">
                      No game performance data available yet
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Skills Radar Chart */}
            <Card className="bg-blue-900/20 backdrop-blur-md border border-blue-700/30 shadow-xl">
              <CardHeader>
                <CardTitle className="flex items-center text-xl font-medium">
                  <Target className="h-5 w-5 mr-2 text-purple-400" />
                  Skills Radar
                </CardTitle>
                <CardDescription className="text-blue-300">
                  Comprehensive view of skill levels across different areas
                </CardDescription>
              </CardHeader>
              <CardContent>
                {subjectPerformance.length > 0 ? (
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <RadarChart outerRadius={150} width={500} height={300} data={subjectPerformance}>
                        <PolarGrid stroke="#334155" />
                        <PolarAngleAxis dataKey="subject" stroke="#94a3b8" />
                        <PolarRadiusAxis stroke="#94a3b8" />
                        <Radar 
                          name="Score" 
                          dataKey="score" 
                          stroke="#8b5cf6" 
                          fill="#8b5cf6" 
                          fillOpacity={0.6} 
                        />
                        <Tooltip 
                          contentStyle={{ 
                            backgroundColor: '#1e293b', 
                            borderColor: '#475569',
                            color: '#f8fafc'
                          }} 
                        />
                        <Legend />
                      </RadarChart>
                    </ResponsiveContainer>
                  </div>
                ) : (
                  <div className="text-center text-blue-300 py-16">
                    No skills data available yet
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Time & Activity Tab */}
          <TabsContent value="time" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Average Time by Subject */}
              <Card className="bg-blue-900/20 backdrop-blur-md border border-blue-700/30 shadow-xl">
                <CardHeader>
                  <CardTitle className="flex items-center text-xl font-medium">
                    <Timer className="h-5 w-5 mr-2 text-pink-400" />
                    Average Time by Subject
                  </CardTitle>
                  <CardDescription className="text-blue-300">
                    Average time spent per question in each subject (seconds)
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {timeDistribution.length > 0 ? (
                    <div className="h-80">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                          data={timeDistribution}
                          margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                        >
                          <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                          <XAxis dataKey="subject" stroke="#94a3b8" />
                          <YAxis stroke="#94a3b8" />
                          <Tooltip 
                            contentStyle={{ 
                              backgroundColor: '#1e293b', 
                              borderColor: '#475569',
                              color: '#f8fafc'
                            }} 
                          />
                          <Legend />
                          <Bar dataKey="avgTime" name="Average Time (seconds)" radius={[4, 4, 0, 0]}>
                            {timeDistribution.map((entry, index) => (
                              <Cell 
                                key={`cell-${index}`} 
                                fill={CHART_COLORS[entry.subject as keyof typeof CHART_COLORS] || '#64748b'} 
                              />
                            ))}
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  ) : (
                    <div className="text-center text-blue-300 py-16">
                      No time distribution data available yet
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Question Type Response Time */}
              <Card className="bg-blue-900/20 backdrop-blur-md border border-blue-700/30 shadow-xl">
                <CardHeader>
                  <CardTitle className="flex items-center text-xl font-medium">
                    <Clock className="h-5 w-5 mr-2 text-cyan-400" />
                    Question Type Response Time
                  </CardTitle>
                  <CardDescription className="text-blue-300">
                    Average time spent on different question types (seconds)
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {questionTypePerformance.length > 0 ? (
                    <div className="h-80">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                          data={questionTypePerformance}
                          margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                        >
                          <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                          <XAxis dataKey="type" stroke="#94a3b8" />
                          <YAxis stroke="#94a3b8" />
                          <Tooltip 
                            contentStyle={{ 
                              backgroundColor: '#1e293b', 
                              borderColor: '#475569',
                              color: '#f8fafc'
                            }} 
                          />
                          <Legend />
                          <Bar dataKey="avgTime" name="Average Time (seconds)" radius={[4, 4, 0, 0]}>
                            {questionTypePerformance.map((entry, index) => (
                              <Cell 
                                key={`cell-${index}`} 
                                fill={QUESTION_TYPE_COLORS[entry.type as keyof typeof QUESTION_TYPE_COLORS] || '#64748b'} 
                              />
                            ))}
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  ) : (
                    <div className="text-center text-blue-300 py-16">
                      No response time data available yet
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Activity Calendar View - Placeholder */}
            <Card className="bg-blue-900/20 backdrop-blur-md border border-blue-700/30 shadow-xl">
              <CardHeader>
                <CardTitle className="flex items-center text-xl font-medium">
                  <Calendar className="h-5 w-5 mr-2 text-green-400" />
                  Learning Activity Calendar
                </CardTitle>
                <CardDescription className="text-blue-300">
                  Activity frequency and consistency over time
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center text-blue-300 py-16">
                  Activity calendar visualization will be available soon
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Recommendations Tab */}
          <TabsContent value="recommendations" className="space-y-6">
            {/* Practice Recommendations */}
            <Card className="bg-blue-900/20 backdrop-blur-md border border-blue-700/30 shadow-xl">
              <CardHeader>
                <CardTitle className="flex items-center text-xl font-medium">
                  <Sparkles className="h-5 w-5 mr-2 text-yellow-400" />
                  Personalized Recommendations
                </CardTitle>
                <CardDescription className="text-blue-300">
                  Suggested focus areas based on {selectedProfile?.name}'s performance
                </CardDescription>
              </CardHeader>
              <CardContent>
                {weaknesses.length > 0 ? (
                  <div className="space-y-6">
                    <div className="space-y-4">
                      <h3 className="text-lg font-medium text-white">Focus Areas</h3>
                      {weaknesses.map((weakness, idx) => (
                        <div key={idx} className="bg-blue-900/40 rounded-lg p-4">
                          <div className="flex items-center mb-2">
                            <div 
                              className="w-3 h-3 rounded-full mr-3" 
                              style={{ backgroundColor: CHART_COLORS[weakness.subject as keyof typeof CHART_COLORS] || '#64748b' }}
                            ></div>
                            <h4 className="font-medium text-white capitalize">{weakness.subject}</h4>
                          </div>
                          <p className="text-blue-200 ml-6">
                            Recommend focusing on {weakness.subject} topics as the current score is {weakness.score}%.
                          </p>
                          <div className="ml-6 mt-3">
                            <Button 
                              className="bg-blue-600 hover:bg-blue-700"
                              onClick={() => toast({
                                title: 'Feature Coming Soon',
                                description: 'Personalized practice sets will be available soon!',
                              })}
                            >
                              Practice {weakness.subject}
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Question Type Recommendations */}
                    {questionTypePerformance.length > 0 && (
                      <div className="space-y-4 pt-4 border-t border-blue-800">
                        <h3 className="text-lg font-medium text-white">Question Format Practice</h3>
                        {questionTypePerformance
                          .sort((a, b) => a.score - b.score)
                          .slice(0, 2)
                          .map((type, idx) => (
                            <div key={idx} className="bg-blue-900/40 rounded-lg p-4">
                              <div className="flex items-center mb-2">
                                <div 
                                  className="w-3 h-3 rounded-full mr-3" 
                                  style={{ backgroundColor: QUESTION_TYPE_COLORS[type.type as keyof typeof QUESTION_TYPE_COLORS] || '#64748b' }}
                                ></div>
                                <h4 className="font-medium text-white capitalize">{type.type.replace(/-/g, ' ')}</h4>
                              </div>
                              <p className="text-blue-200 ml-6">
                                Practice with {type.type.replace(/-/g, ' ')} questions to improve from the current score of {type.score}%.
                              </p>
                              <div className="ml-6 mt-3">
                                <Button 
                                  className="bg-blue-600 hover:bg-blue-700"
                                  onClick={() => toast({
                                    title: 'Feature Coming Soon',
                                    description: 'Targeted question type practice will be available soon!',
                                  })}
                                >
                                  Practice {type.type.replace(/-/g, ' ')}
                                </Button>
                              </div>
                            </div>
                          ))
                        }
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center text-blue-300 py-16">
                    Not enough data to generate personalized recommendations yet
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Learning Resources */}
            <Card className="bg-blue-900/20 backdrop-blur-md border border-blue-700/30 shadow-xl">
              <CardHeader>
                <CardTitle className="flex items-center text-xl font-medium">
                  <Book className="h-5 w-5 mr-2 text-green-400" />
                  Suggested Learning Resources
                </CardTitle>
                <CardDescription className="text-blue-300">
                  Additional materials to support {selectedProfile?.name}'s learning journey
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="bg-blue-900/40 rounded-lg p-4">
                    <h4 className="font-medium text-white mb-2">Interactive Stories</h4>
                    <p className="text-blue-200 mb-3">
                      Explore interactive stories that combine multiple subjects in engaging narratives.
                    </p>
                    <Button 
                      className="bg-blue-600 hover:bg-blue-700"
                      onClick={() => navigate('/regional-stories/1')}
                    >
                      Browse Stories
                    </Button>
                  </div>
                  
                  <div className="bg-blue-900/40 rounded-lg p-4">
                    <h4 className="font-medium text-white mb-2">Educational Games</h4>
                    <p className="text-blue-200 mb-3">
                      Fun educational games that reinforce concepts while building skills.
                    </p>
                    <Button 
                      className="bg-blue-600 hover:bg-blue-700"
                      onClick={() => toast({
                        title: 'Feature Coming Soon',
                        description: 'Educational games library will be available soon!',
                      })}
                    >
                      Explore Games
                    </Button>
                  </div>
                  
                  <div className="bg-blue-900/40 rounded-lg p-4">
                    <h4 className="font-medium text-white mb-2">AI Reading Coach</h4>
                    <p className="text-blue-200 mb-3">
                      Interactive reading sessions with personalized AI feedback.
                    </p>
                    <Button 
                      className="bg-blue-600 hover:bg-blue-700"
                      onClick={() => navigate('/reading-coach')}
                    >
                      Start Reading Practice
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

function Calendar(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect width="18" height="18" x="3" y="4" rx="2" ry="2" />
      <line x1="16" x2="16" y1="2" y2="6" />
      <line x1="8" x2="8" y1="2" y2="6" />
      <line x1="3" x2="21" y1="10" y2="10" />
      <path d="M8 14h.01" />
      <path d="M12 14h.01" />
      <path d="M16 14h.01" />
      <path d="M8 18h.01" />
      <path d="M12 18h.01" />
      <path d="M16 18h.01" />
    </svg>
  );
}