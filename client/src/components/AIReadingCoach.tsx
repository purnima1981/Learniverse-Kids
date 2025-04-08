import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { MicIcon, StopCircleIcon, PlayIcon, RefreshCwIcon } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export default function AIReadingCoach() {
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [sampleText, setSampleText] = useState(
    "The journey to the stars begins with understanding our place in the universe. As we look up at the night sky, we see countless points of light, each representing distant suns much like our own."
  );
  const [feedback, setFeedback] = useState<null | {
    fluencyScore: number;
    accuracyScore: number;
    suggestions: string[];
    feedback: string;
  }>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  const startRecording = async () => {
    try {
      audioChunksRef.current = [];
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };
      
      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/mp3' });
        await processAudio(audioBlob);
        
        // Stop all tracks to release the microphone
        stream.getTracks().forEach(track => track.stop());
      };
      
      mediaRecorderRef.current = mediaRecorder;
      mediaRecorder.start();
      setIsRecording(true);
      
      toast({
        title: "Recording started",
        description: "Read the passage aloud. Click stop when you're finished.",
      });
    } catch (error) {
      console.error('Error accessing microphone:', error);
      toast({
        title: "Microphone error",
        description: "We couldn't access your microphone. Please check your browser permissions.",
        variant: "destructive",
      });
    }
  };
  
  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      toast({
        title: "Recording finished",
        description: "Processing your reading...",
      });
    }
  };
  
  const processAudio = async (audioBlob: Blob) => {
    setIsLoading(true);
    try {
      // Convert audioBlob to base64
      const reader = new FileReader();
      const audioBase64Promise = new Promise<string>((resolve) => {
        reader.onloadend = () => {
          if (typeof reader.result === 'string') {
            const base64 = reader.result.split(',')[1];
            resolve(base64);
          }
        };
      });
      reader.readAsDataURL(audioBlob);
      const audioBase64 = await audioBase64Promise;
      
      // Send audio to server for analysis
      const response = await apiRequest('POST', '/api/reading-coach/analyze', {
        audio: audioBase64,
        text: sampleText,
      });
      
      const result = await response.json();
      setTranscript(result.transcript);
      setFeedback({
        fluencyScore: result.fluencyScore,
        accuracyScore: result.accuracyScore,
        suggestions: result.suggestions,
        feedback: result.feedback,
      });
    } catch (error) {
      console.error('Error processing audio:', error);
      toast({
        title: "Processing error",
        description: "We couldn't process your recording. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const resetPractice = () => {
    setTranscript("");
    setFeedback(null);
  };
  
  const getSampleText = async () => {
    setIsLoading(true);
    try {
      const response = await apiRequest('GET', '/api/reading-coach/sample');
      const result = await response.json();
      setSampleText(result.text);
    } catch (error) {
      console.error('Error getting sample text:', error);
      toast({
        title: "Error",
        description: "We couldn't load a new passage. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div className="space-y-6">
      <Card className="p-6 glass-panel">
        <h3 className="font-bold text-xl mb-4 text-white">Practice Reading</h3>
        <p className="text-sm mb-4 text-white">
          Read the text below aloud when you press "Start Recording". 
          Your reading will be analyzed for fluency and accuracy.
        </p>
        
        <div className="bg-white/10 p-4 rounded-lg mb-4">
          <p className="text-white">{sampleText}</p>
        </div>
        
        <div className="flex justify-between">
          <Button 
            variant="outline" 
            className="bg-white/20 hover:bg-white/30 text-white border-transparent"
            onClick={getSampleText}
            disabled={isRecording || isLoading}
          >
            <RefreshCwIcon className="h-4 w-4 mr-2" />
            New Passage
          </Button>
          
          {!isRecording ? (
            <Button 
              className="bg-yellow-400 hover:bg-yellow-500 text-black font-bold"
              onClick={startRecording}
              disabled={isLoading}
            >
              <MicIcon className="h-4 w-4 mr-2" />
              Start Recording
            </Button>
          ) : (
            <Button 
              variant="destructive"
              onClick={stopRecording}
            >
              <StopCircleIcon className="h-4 w-4 mr-2" />
              Stop Recording
            </Button>
          )}
        </div>
      </Card>
      
      {(transcript || isLoading) && (
        <Card className="p-6 glass-panel">
          <h3 className="font-bold text-xl mb-4 text-white">Your Reading</h3>
          
          {isLoading ? (
            <div className="flex justify-center items-center h-20">
              <div className="text-white">Analyzing your reading...</div>
            </div>
          ) : (
            <>
              <div className="bg-white/10 p-4 rounded-lg mb-4">
                <p className="text-white">{transcript}</p>
              </div>
              
              {feedback && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-white/10 p-4 rounded-lg">
                      <div className="text-sm text-white/80 mb-1">Fluency</div>
                      <div className="flex items-center">
                        <div className="w-full bg-white/20 rounded-full h-2.5 mr-2">
                          <div 
                            className="bg-yellow-400 h-2.5 rounded-full" 
                            style={{ width: `${feedback.fluencyScore}%` }}
                          ></div>
                        </div>
                        <span className="text-white font-bold">{feedback.fluencyScore}%</span>
                      </div>
                    </div>
                    
                    <div className="bg-white/10 p-4 rounded-lg">
                      <div className="text-sm text-white/80 mb-1">Accuracy</div>
                      <div className="flex items-center">
                        <div className="w-full bg-white/20 rounded-full h-2.5 mr-2">
                          <div 
                            className="bg-yellow-400 h-2.5 rounded-full" 
                            style={{ width: `${feedback.accuracyScore}%` }}
                          ></div>
                        </div>
                        <span className="text-white font-bold">{feedback.accuracyScore}%</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-white/10 p-4 rounded-lg">
                    <h4 className="font-bold text-white mb-2">AI Feedback</h4>
                    <p className="text-white mb-4">{feedback.feedback}</p>
                    
                    {feedback.suggestions.length > 0 && (
                      <>
                        <h5 className="font-bold text-sm text-white mb-2">Suggestions for Improvement:</h5>
                        <ul className="text-white text-sm list-disc pl-5 space-y-1">
                          {feedback.suggestions.map((suggestion, index) => (
                            <li key={index}>{suggestion}</li>
                          ))}
                        </ul>
                      </>
                    )}
                  </div>
                </div>
              )}
              
              <div className="mt-4 flex justify-end">
                <Button
                  variant="outline"
                  className="bg-white/20 hover:bg-white/30 text-white border-transparent"
                  onClick={resetPractice}
                >
                  <PlayIcon className="h-4 w-4 mr-2" />
                  Try Again
                </Button>
              </div>
            </>
          )}
        </Card>
      )}
    </div>
  );
}