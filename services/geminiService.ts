
import { GoogleGenAI } from "@google/genai";

// Initialize using the pre-configured environment variable without fallbacks.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const getBusinessInsights = async (businessData: any) => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `As a senior hospitality consultant, analyze this business data and provide 3 actionable insights for growth. Keep it professional and concise. Data: ${JSON.stringify(businessData)}`,
      config: {
        thinkingConfig: { thinkingBudget: 0 }
      }
    });
    // Accessing text as a property on the response object.
    return response.text;
  } catch (error) {
    console.error("Gemini Error:", error);
    return "AI Insights currently unavailable. Please check your analytics dashboard manually.";
  }
};

export const generatePropertyDescription = async (details: { name: string, category: string, amenities: string[] }) => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Write a compelling, SEO-friendly property description for ${details.name}, a ${details.category}. Amenities include: ${details.amenities.join(', ')}.`,
    });
    // Accessing text as a property on the response object.
    return response.text;
  } catch (error) {
    console.error("Gemini Error:", error);
    return "";
  }
};
