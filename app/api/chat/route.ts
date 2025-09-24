import { streamText, convertToModelMessages, createIdGenerator } from "ai";
import { cookies } from "next/headers";
import { getModelConfig } from "@/app/chat/lib/model";
import { createChat, upsertMessage } from "@/app/chat/lib/db/actions";
import { MyUIMessage } from "@/app/chat/lib/message-type";

export const maxDuration = 30;

export async function POST(req: Request) {
  try {
    const { messages, chatId }: { messages: MyUIMessage[]; chatId: string } =
      await req.json();

    const ifCreateChat = messages.length === 1;
    const lastMessage = messages[messages.length - 1];

    console.log(chatId, ifCreateChat, "chatId");
    if (ifCreateChat) {
      await createChat(chatId);
    }

    await upsertMessage({
      chatId,
      id: lastMessage.id,
      message: lastMessage,
    });

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
      // experimental_transform: smoothStream({
      //   delayInMs: 10,
      //   chunking: "word",
      // }),
    });

    return result.toUIMessageStreamResponse({
      sendReasoning: reasonerModel,
      generateMessageId: createIdGenerator({
        prefix: "msg",
        size: 16,
      }),
      onFinish: async ({ messages }) => {
        console.log(messages, "onfinish callback");
        try {
          const responseMessage = messages[messages.length - 1] as MyUIMessage;
          await upsertMessage({
            chatId,
            id: responseMessage.id,
            message: responseMessage,
          });
        } catch (error) {
          console.error("upsert error:", error);
        }
      },
    });
  } catch (error) {
    console.error("Chat API error:", error);
    return new Response("Internal Server Error", { status: 500 });
  }
}
