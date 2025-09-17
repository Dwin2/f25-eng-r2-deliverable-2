/* eslint-disable */
import OpenAI from 'openai';
import Groq from 'groq-sdk';

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});
const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

export async function generateResponse(message: string): Promise<string> {
  try {
    const completion = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [
        {
          role: "system",
          content: "You are a specialized species chatbot that answers questions about animals, plants, and other living organisms. You provide information about their habitat, diet, conservation status, behavior, and other relevant biological details. If asked about non-species related topics, politely redirect the conversation back to species-related questions. Keep responses informative but concise."
        },
        {
          role: "user",
          content: message
        }
      ],
    });

    return completion.choices[0]?.message.content || "Sorry could not generate a response";
  } catch (error) {
    console.error("Groq API Error:", error);
    return String(error);
  }
}
