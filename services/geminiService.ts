
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
    return response.text;
  } catch (error) {
    console.error("Gemini Error:", error);
    return "";
  }
};

export const generateWelcomeEmail = async (partnerName: string, businessName: string, category: string) => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Draft a professional welcome email for a new property partner on the SEULANGA platform. 
      Partner Name: ${partnerName}
      Business: ${businessName}
      Category: ${category}
      
      The email should:
      1. Congratulate them on joining the elite ecosystem.
      2. Provide a link to their dashboard (https://seulanga.com/partner-dash).
      3. Mention a "Quick-Start Guide" attached.
      4. Highlight one specific benefit of using SEULANGA for their specific business category.
      Keep it high-end, encouraging, and under 200 words.`,
    });
    return response.text;
  } catch (error) {
    console.error("Gemini Error:", error);
    return `Welcome to SEULANGA, ${partnerName}! Your property ${businessName} is now live. Access your dashboard at https://seulanga.com/partner-dash to begin managing your assets.`;
  }
};
