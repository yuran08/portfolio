import { deepseek } from "@ai-sdk/deepseek";
import {
  UIMessage,
  streamText,
  convertToModelMessages,
  createIdGenerator,
} from "ai";
import { cookies } from "next/headers";

export const maxDuration = 60;

export async function POST(req: Request) {
  try {
    const { messages }: { messages: UIMessage[]; model: string } =
      await req.json();

    const cookieStore = await cookies();
    const reasonerModel = cookieStore.get("reasoner-model")?.value === "true";
    const searchMode = cookieStore.get("search-mode")?.value === "true";

    const result = streamText({
      model: deepseek(reasonerModel ? "deepseek-reasoner" : "deepseek-chat"),
      messages: convertToModelMessages(messages),
      temperature: 0.7,
      maxOutputTokens: 2000,
      system:
        "说明：你是一个有用的人工智能助手，提供准确的信息。对用户的问题提供全面和详细的答复。用适当的标题来组织你的回答。当你不确定具体细节时，要承认。专注于保持你的回答的高度准确性。回答问题时优先考虑使用中文进行回答。",
    });

    return result.toUIMessageStreamResponse({
      sendReasoning: reasonerModel,
      generateMessageId: createIdGenerator({
        prefix: "msg",
        size: 16,
      }),
    });
  } catch (error) {
    console.error("Chat API error:", error);
    return new Response("Internal Server Error", { status: 500 });
  }
}
