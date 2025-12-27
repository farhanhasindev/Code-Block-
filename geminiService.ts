
import { GoogleGenAI } from "@google/genai";

export interface SearchResult {
  text: string;
  sources: { title: string, uri: string }[];
}

export class GeminiService {
  private ai: GoogleGenAI;

  constructor() {
    this.ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
  }

  async generateResponse(prompt: string): Promise<string> {
    try {
      const response = await this.ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: prompt,
        config: {
          systemInstruction: "You are CodeBlock Assistant. Be concise.",
          temperature: 0.7,
        }
      });
      return response.text || "No response.";
    } catch (error) {
      console.error("Gemini Error:", error);
      return `Error: ${error instanceof Error ? error.message : "Unknown error"}`;
    }
  }

  async searchGrounding(query: string): Promise<SearchResult> {
    try {
      const response = await this.ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: query,
        config: {
          tools: [{ googleSearch: {} }]
        }
      });
      
      const text = response.text || "No summary available.";
      const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
      const sources = chunks
        .filter((c: any) => c.web)
        .map((c: any) => ({ title: c.web.title, uri: c.web.uri }));

      return { text, sources };
    } catch (error) {
      console.error("Search Error:", error);
      return { text: "Failed to search.", sources: [] };
    }
  }

  async generateImage(prompt: string): Promise<string | null> {
    try {
      const response = await this.ai.models.generateContent({
        model: 'gemini-2.5-flash-image',
        contents: { parts: [{ text: prompt }] },
        config: {
          imageConfig: { aspectRatio: "1:1" }
        }
      });

      for (const part of response.candidates?.[0]?.content?.parts || []) {
        if (part.inlineData) {
          return `data:image/png;base64,${part.inlineData.data}`;
        }
      }
      return null;
    } catch (error) {
      console.error("Image Error:", error);
      return null;
    }
  }

  async explainCode(blocksJson: string): Promise<string> {
    const prompt = `Explain this visual logic as a technical architect:\n${blocksJson}`;
    return this.generateResponse(prompt);
  }
}

export const gemini = new GeminiService();
