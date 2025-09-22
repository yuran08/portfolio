import {
  UIMessage,
  streamText,
  convertToModelMessages,
  createIdGenerator,
  smoothStream,
} from "ai";
import { cookies } from "next/headers";
import { getModelConfig } from "@/app/chat/lib/model";
import { createChat } from "@/app/chat/lib/db/actions";

export const maxDuration = 60;

export async function POST(req: Request) {
  try {
    const { messages, id }: { messages: UIMessage[]; id: string } =
      await req.json();

    console.log(id, "id");

    // await createChat(id);
    console.log(messages, "route messages");

    const cookieStore = await cookies();
    const reasonerModel = cookieStore.get("reasoner-model")?.value === "true";
    const searchMode = cookieStore.get("search-mode")?.value === "true";

    const modelConfig = getModelConfig(reasonerModel, searchMode);

    const result = streamText({
      model: modelConfig.model,
      messages: convertToModelMessages(messages),
      tools: modelConfig.tools,
      temperature: modelConfig.temperature,
      system: modelConfig.system,
      stopWhen: modelConfig.stopWhen,
      experimental_transform: smoothStream({
        delayInMs: 10,
        chunking: "word",
      }),
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
