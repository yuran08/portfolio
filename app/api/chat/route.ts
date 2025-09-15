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
      system:
        "说明：你是一个有用的人工智能助手，提供准确的信息。对用户的问题提供全面和详细的答复。用适当的标题来组织你的回答。当你不确定具体细节时，要承认。专注于保持你的回答的高度准确性。回答问题时优先考虑使用中文进行回答。",
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
