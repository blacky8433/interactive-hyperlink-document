/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export interface EnhancedSearchResult {
  professionalQuery: string;
  topResultUrl: string | null;
}

/**
 * Generates a professional Google search query and finds the top search result using grounding.
 * @param text The input text to be transformed.
 * @returns A promise that resolves to an object containing the professional query and the top URL.
 */
export async function getEnhancedSearchResult(text: string): Promise<EnhancedSearchResult> {
  const trimmedText = text.trim();
  if (!trimmedText) {
    return { professionalQuery: "", topResultUrl: null };
  }
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `Based on Google search results for the text below, create an optimized, professional Google search query that best summarizes the user's intent. Only return the query itself, with no extra text or explanation.

      Text: "${trimmedText}"`,
      config: {
        tools: [{googleSearch: {}}],
      },
    });

    const professionalQuery = response.text.trim() || trimmedText;

    const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks;
    const topResultUrl = groundingChunks?.[0]?.web?.uri || null;
    
    return {
      professionalQuery,
      topResultUrl,
    };

  } catch (error) {
    console.error("Error generating enhanced search result:", error);
    // Fallback to the original text if the API fails
    return { professionalQuery: trimmedText, topResultUrl: null };
  }
}