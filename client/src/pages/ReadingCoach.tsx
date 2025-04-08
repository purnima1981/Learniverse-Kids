import { useState } from "react";
import { useLocation } from "wouter";
import Navigation from "@/components/Navigation";
import AIReadingCoach from "@/components/AIReadingCoach";
import { Button } from "@/components/ui/button";
import { ChevronLeft } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function ReadingCoach() {
  const [_, setLocation] = useLocation();
  const [tab, setTab] = useState("practice");
  
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
                <div className="glass-panel p-6">
                  <h3 className="font-bold text-xl mb-4 text-white">Your Reading Progress</h3>
                  <p className="text-white">
                    Track your reading performance over time. Practice regularly to see improvements in your fluency and accuracy.
                  </p>
                  
                  <div className="h-60 mt-6 flex items-center justify-center">
                    <p className="text-white/60">Start practicing to see your progress!</p>
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