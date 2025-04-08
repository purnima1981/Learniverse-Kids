import OpenAI from "openai";
import fs from "fs";
import path from "path";
import { v4 as uuidv4 } from "uuid";
import os from "os";

// the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
const MODEL = "gpt-4o";

// Initialize the OpenAI client with API key from environment variables
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

/**
 * Analyzes a student's reading based on audio and expected text
 */
export async function analyzeReading(audioBase64: string, expectedText: string): Promise<{
  transcript: string;
  fluencyScore: number;
  accuracyScore: number;
  suggestions: string[];
  feedback: string;
}> {
  try {
    // Create a temporary file for the audio data
    const tmpDir = os.tmpdir();
    const tempFilePath = path.join(tmpDir, `audio-${uuidv4()}.mp3`);
    
    // Write the base64 audio data to the temp file
    fs.writeFileSync(tempFilePath, Buffer.from(audioBase64, 'base64'));
    
    try {
      // Step 1: Transcribe the audio using OpenAI's Whisper model
      const fileStream = fs.createReadStream(tempFilePath);
      const transcription = await openai.audio.transcriptions.create({
        file: fileStream,
        model: "whisper-1",
      });
      
      const transcript = transcription.text;
      
      // Step 2: Analyze the transcription using GPT-4o
      const analysisPrompt = `
As a reading coach, analyze this student's reading of the given text.

Expected Text:
"""
${expectedText}
"""

Student's Reading Transcription:
"""
${transcript}
"""

Please provide a detailed assessment in JSON format with the following fields:
1. fluencyScore: A number from 0-100 indicating how fluently the student read (rhythm, pace, expression)
2. accuracyScore: A number from 0-100 indicating how accurately the student read the text
3. suggestions: An array of 1-3 specific, actionable suggestions for improvement
4. feedback: An encouraging, constructive feedback paragraph (max 3 sentences)

Don't make up any information. If you can't assess a particular aspect, provide a reasonable score based on what you can evaluate.
`;

      const response = await openai.chat.completions.create({
        model: MODEL,
        messages: [
          { role: "system", content: "You are an expert reading coach for elementary and middle school students. Provide constructive, encouraging feedback." },
          { role: "user", content: analysisPrompt }
        ],
        response_format: { type: "json_object" },
      });

      const messageContent = response.choices[0].message.content;
      if (!messageContent) {
        throw new Error("No content returned from OpenAI");
      }
      
      const analysisResult = JSON.parse(messageContent);
      
      // Process the result
      return {
        transcript,
        fluencyScore: Math.max(0, Math.min(100, Math.round(analysisResult.fluencyScore))),
        accuracyScore: Math.max(0, Math.min(100, Math.round(analysisResult.accuracyScore))),
        suggestions: analysisResult.suggestions || [],
        feedback: analysisResult.feedback || "Great effort! Keep practicing to improve your reading skills.",
      };
    } finally {
      // Clean up the temporary file
      try {
        fs.unlinkSync(tempFilePath);
      } catch (err) {
        console.error("Error cleaning up temporary file:", err);
      }
    }
  } catch (error) {
    console.error("Error analyzing reading:", error);
    throw new Error("Failed to analyze reading. Please try again.");
  }
}

/**
 * Generates age-appropriate sample reading passages
 */
export async function generateReadingPassage(grade: string): Promise<string> {
  try {
    const prompt = `
Generate an engaging, age-appropriate reading passage for a grade ${grade} student.
The passage should:
- Be about 3-4 sentences long
- Include some vocabulary words appropriate for the grade level
- Be educational and interesting
- Be about one of these topics: science, history, nature, or interesting facts
- Not contain any potentially offensive or controversial content
    `;

    const response = await openai.chat.completions.create({
      model: MODEL,
      messages: [
        { role: "system", content: "You are an educational content creator specializing in creating engaging reading passages for students." },
        { role: "user", content: prompt }
      ],
      max_tokens: 200,
    });

    const content = response.choices[0].message.content;
    if (!content) {
      return "The journey to the stars begins with understanding our place in the universe. As we look up at the night sky, we see countless points of light, each representing distant suns much like our own. Some of these stars have planets orbiting them, just as Earth orbits our Sun.";
    }
    
    return content.trim();
  } catch (error) {
    console.error("Error generating reading passage:", error);
    throw new Error("Failed to generate reading passage. Please try again.");
  }
}