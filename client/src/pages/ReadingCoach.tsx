import { useState } from "react";
import { useLocation } from "wouter";
import Navigation from "@/components/Navigation";
import AIReadingCoach from "@/components/AIReadingCoach";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ChevronLeft, BookOpenIcon, Award, TrendingUpIcon } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar } from 'recharts';

export default function ReadingCoach() {
  const [_, setLocation] = useLocation();
  const [tab, setTab] = useState("practice");
  
  // Example progress data (would typically come from an API/database)
  const progressData = [
    { day: 'Day 1', fluency: 65, accuracy: 72 },
    { day: 'Day 2', fluency: 68, accuracy: 75 },
    { day: 'Day 3', fluency: 72, accuracy: 78 },
    { day: 'Day 4', fluency: 75, accuracy: 80 },
    { day: 'Day 5', fluency: 78, accuracy: 82 },
    { day: 'Day 6', fluency: 81, accuracy: 85 },
    { day: 'Day 7', fluency: 85, accuracy: 88 },
  ];
  
  const readingTimeData = [
    { day: 'Day 1', minutes: 5 },
    { day: 'Day 2', minutes: 7 },
    { day: 'Day 3', minutes: 6 },
    { day: 'Day 4', minutes: 8 },
    { day: 'Day 5', minutes: 10 },
    { day: 'Day 6', minutes: 12 },
    { day: 'Day 7', minutes: 15 },
  ];
  
  const statsData = [
    { name: 'Total Practice Sessions', value: 7, icon: BookOpenIcon },
    { name: 'Highest Fluency Score', value: '85%', icon: Award },
    { name: 'Reading Improvement', value: '+20%', icon: TrendingUpIcon },
  ];
  
  return (
    <div className="min-h-screen">
      <Navigation />
      
      <div className="container mx-auto px-4 py-6">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center mb-6">
            <Button 
              variant="ghost" 
              className="text-white hover:text-white/80 mr-4"
              onClick={() => setLocation("/dashboard")}
            >
              <ChevronLeft className="h-5 w-5 mr-2" />
              Back
            </Button>
            <h1 className="font-bold text-3xl text-white">AI Reading Coach</h1>
          </div>
          
          <div className="glass-panel p-6 mb-8">
            <h2 className="font-bold text-2xl mb-4 text-white">Improve Your Reading Skills</h2>
            <p className="text-white mb-6">
              Practice reading aloud with our AI coach to improve your fluency, pronunciation, and comprehension. 
              The AI will listen to your reading and provide personalized feedback to help you improve.
            </p>
            
            <Tabs defaultValue={tab} onValueChange={setTab} className="w-full">
              <TabsList className="grid w-full grid-cols-3 mb-6">
                <TabsTrigger value="practice">Practice</TabsTrigger>
                <TabsTrigger value="progress">Progress</TabsTrigger>
                <TabsTrigger value="tips">Reading Tips</TabsTrigger>
              </TabsList>
              
              <TabsContent value="practice">
                <AIReadingCoach />
              </TabsContent>
              
              <TabsContent value="progress">
                <div className="space-y-6">
                  <div className="glass-panel p-6">
                    <h3 className="font-bold text-xl mb-4 text-white">Your Reading Progress</h3>
                    <p className="text-white mb-6">
                      Track your reading performance over time. Practice regularly to see improvements in your fluency and accuracy.
                    </p>
                    
                    {/* Stats Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                      {statsData.map((stat, index) => (
                        <Card key={index} className="bg-white/10 backdrop-blur-sm border-0">
                          <div className="p-4 flex items-center">
                            <div className="mr-4 bg-yellow-400/20 p-3 rounded-full">
                              <stat.icon className="h-6 w-6 text-yellow-400" />
                            </div>
                            <div>
                              <p className="text-sm text-white/70">{stat.name}</p>
                              <p className="text-xl font-bold text-white">{stat.value}</p>
                            </div>
                          </div>
                        </Card>
                      ))}
                    </div>
                    
                    {/* Fluency & Accuracy Chart */}
                    <div className="bg-white/10 p-4 rounded-lg mb-6">
                      <h4 className="font-bold text-white mb-4">Fluency & Accuracy Progress</h4>
                      <div className="h-80">
                        <ResponsiveContainer width="100%" height="100%">
                          <LineChart
                            data={progressData}
                            margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                          >
                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                            <XAxis dataKey="day" stroke="rgba(255,255,255,0.7)" />
                            <YAxis stroke="rgba(255,255,255,0.7)" />
                            <Tooltip 
                              contentStyle={{ 
                                backgroundColor: 'rgba(15, 23, 42, 0.8)', 
                                border: 'none',
                                borderRadius: '8px',
                                color: 'white'
                              }} 
                            />
                            <Legend />
                            <Line 
                              type="monotone" 
                              dataKey="fluency" 
                              name="Fluency Score" 
                              stroke="#FFD600" 
                              strokeWidth={2}
                              dot={{ stroke: '#FFD600', strokeWidth: 2, r: 4 }}
                              activeDot={{ r: 6 }}
                            />
                            <Line 
                              type="monotone" 
                              dataKey="accuracy" 
                              name="Accuracy Score" 
                              stroke="#36D7B7"
                              strokeWidth={2}
                              dot={{ stroke: '#36D7B7', strokeWidth: 2, r: 4 }}
                              activeDot={{ r: 6 }}
                            />
                          </LineChart>
                        </ResponsiveContainer>
                      </div>
                    </div>
                    
                    {/* Reading Time Chart */}
                    <div className="bg-white/10 p-4 rounded-lg">
                      <h4 className="font-bold text-white mb-4">Daily Reading Practice</h4>
                      <div className="h-60">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart
                            data={readingTimeData}
                            margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                          >
                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                            <XAxis dataKey="day" stroke="rgba(255,255,255,0.7)" />
                            <YAxis stroke="rgba(255,255,255,0.7)" />
                            <Tooltip 
                              contentStyle={{ 
                                backgroundColor: 'rgba(15, 23, 42, 0.8)', 
                                border: 'none',
                                borderRadius: '8px',
                                color: 'white'
                              }} 
                            />
                            <Legend />
                            <Bar 
                              dataKey="minutes" 
                              name="Minutes Spent Reading" 
                              fill="#45AEF5" 
                              radius={[4, 4, 0, 0]}
                            />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    </div>
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="tips">
                <div className="glass-panel p-6">
                  <h3 className="font-bold text-xl mb-4 text-white">Reading Tips</h3>
                  
                  <div className="space-y-4">
                    <div className="bg-white/10 p-4 rounded-lg">
                      <h4 className="font-bold text-white mb-2">Read Actively</h4>
                      <p className="text-white text-sm">
                        Engage with the text by asking questions, making predictions, and connecting with the content.
                        Active reading improves comprehension and retention.
                      </p>
                    </div>
                    
                    <div className="bg-white/10 p-4 rounded-lg">
                      <h4 className="font-bold text-white mb-2">Control Your Pace</h4>
                      <p className="text-white text-sm">
                        Don't rush through challenging passages. Adjust your reading speed based on the difficulty and familiarity 
                        of the material. Slow down for complex concepts.
                      </p>
                    </div>
                    
                    <div className="bg-white/10 p-4 rounded-lg">
                      <h4 className="font-bold text-white mb-2">Practice Pronunciation</h4>
                      <p className="text-white text-sm">
                        When you encounter unfamiliar words, take time to pronounce them correctly. Use dictionary 
                        apps with pronunciation guides if you're unsure.
                      </p>
                    </div>
                    
                    <div className="bg-white/10 p-4 rounded-lg">
                      <h4 className="font-bold text-white mb-2">Read Aloud Regularly</h4>
                      <p className="text-white text-sm">
                        Reading aloud for just 15 minutes a day can significantly improve your fluency, pronunciation, and comprehension.
                        Make it a daily habit!
                      </p>
                    </div>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  );
}