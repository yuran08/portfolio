import { deepseek } from "@ai-sdk/deepseek";
import { UIMessage, streamText, convertToModelMessages } from "ai";

export const maxDuration = 60;

export async function POST(req: Request) {
  try {
    const {
      messages,
      model = "deepseek-chat",
    }: { messages: UIMessage[]; model: string } = await req.json();

    // Configure model based on selection
    const selectedModel =
      model === "deepseek-reasoner" ? "deepseek-reasoner" : "deepseek-chat";

    const result = streamText({
      model: deepseek(selectedModel),
      messages: convertToModelMessages(messages),
      temperature: 0.7,
      maxOutputTokens: 2000,
    });

    // For reasoning model, include reasoning tokens
    if (selectedModel === "deepseek-reasoner") {
      return result.toUIMessageStreamResponse({
        sendReasoning: true,
      });
    }

    return result.toUIMessageStreamResponse();
  } catch (error) {
    console.error("Chat API error:", error);
    return new Response("Internal Server Error", { status: 500 });
  }
}
