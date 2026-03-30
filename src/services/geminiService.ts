import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

export const generateAIInsight = async (topic: string, data: any) => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Analyze the following data for ${topic} in Africa and provide 3-4 actionable insights or predictions. 
      Use real-time information from the internet to ground these insights in current events and trends.
      Data: ${JSON.stringify(data)}`,
      config: {
        systemInstruction: "You are an expert data scientist and policy advisor specializing in African development. Provide concise, professional, and data-driven insights. Always ground your responses in real-time data using Google Search.",
        tools: [{ googleSearch: {} }],
      },
    });
    return response.text;
  } catch (error) {
    console.error("Error generating AI insight:", error);
    return "Unable to generate AI insights at this time. Please check your connection.";
  }
};

export const generateFullReport = async (topic: string, data: any) => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Generate a highly detailed, comprehensive 2-page report on ${topic} in Africa. 
      Use Google Search to find the latest real-time data, news, and policy updates for 2024-2026.
      Include the following sections:
      1. Executive Summary (with 2024-2026 context)
      2. Regional Data Analysis (based on: ${JSON.stringify(data)} and real-time search results)
      3. Socio-Economic Impact Assessment
      4. Predictive Modeling & Future Trends (next 12-24 months)
      5. Strategic Recommendations for Policy Makers
      6. Resource Allocation Strategy
      
      Use professional, academic language. Ensure the content is substantial enough to fill at least two pages of a standard report.`,
      config: {
        systemInstruction: "You are a senior analyst at the African Development Bank. Your reports are used for high-level strategic planning. Be thorough, data-driven, and visionary. Use Google Search to ensure all information is current and accurate.",
        tools: [{ googleSearch: {} }],
      },
    });
    return response.text;
  } catch (error) {
    console.error("Error generating full report:", error);
    return "Error generating detailed report. Please try again.";
  }
};

export const chatWithAI = async (message: string, context: string) => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Context: ${context}\nUser Question: ${message}`,
      config: {
        systemInstruction: "You are Africa Insight AI, a helpful assistant for the Africa Insight platform. You help users understand health, agriculture, education, and infrastructure data across Africa. Be informative, encouraging, and focused on solutions. Use Google Search to provide real-time information when asked about current events.",
        tools: [{ googleSearch: {} }],
      },
    });
    return response.text;
  } catch (error) {
    console.error("Error in AI chat:", error);
    return "I'm having trouble processing that right now. How else can I help you explore Africa's data?";
  }
};

export const analyzeCropImage = async (base64Image: string, mimeType: string) => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: {
        parts: [
          {
            text: "Analyze this image of a crop or plant. Identify any potential diseases, nutrient deficiencies, or pest infestations. Provide clear, actionable advice for a farmer in Africa on how to treat the issue and optimize yield. Be concise and professional.",
          },
          {
            inlineData: {
              data: base64Image,
              mimeType: mimeType,
            },
          },
        ],
      },
      config: {
        systemInstruction: "You are an expert agricultural scientist specializing in African crops. Your goal is to provide accurate diagnosis and practical solutions for smallholder farmers.",
      },
    });
    return response.text;
  } catch (error) {
    console.error("Error analyzing crop image:", error);
    return "Unable to analyze the image at this time. Please ensure the image is clear and try again.";
  }
};

export const getPlantingSchedule = async (locality: string) => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Provide an optimal planting schedule for a farmer in ${locality}, Africa. 
      Use Google Search to find current weather patterns, seasonal forecasts for 2026, and soil conditions for this specific region.
      Include:
      1. Recommended crops for the current season.
      2. Optimal planting dates.
      3. Expected harvest windows.
      4. Soil preparation and maintenance tips.
      5. Climate resilience strategies for this locality.`,
      config: {
        systemInstruction: "You are an expert agronomist specializing in African agriculture. Provide precise, localized, and data-driven planting schedules. Use Google Search to ensure all information is current and accurate for the specific locality.",
        tools: [{ googleSearch: {} }],
      },
    });
    return response.text;
  } catch (error) {
    console.error("Error getting planting schedule:", error);
    return "Unable to retrieve a localized planting schedule at this time. Please try again later.";
  }
};
