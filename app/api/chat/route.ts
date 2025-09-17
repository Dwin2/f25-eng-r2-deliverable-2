/* eslint-disable */
import { generateResponse } from "@/lib/services/species-chat";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { question } = body as { question: string };
    
    if (!question) {
      return Response.json({ error: "No question provided" }, { status: 400 });
    }
    
    const answer = await generateResponse(question);
    return Response.json({ answer });
  } catch (error) {
    console.error("API Error:", error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
