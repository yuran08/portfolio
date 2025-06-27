import { CoreMessage, createDataStream } from "ai";
import { streamText } from "ai";
import systemPrompt from "./prompts";
import { Message } from "../../type";
import db from "@/lib/redis";
import { aiTools } from "../../tools";
import { aiProvider } from "./provider";

export const getAiResponseStream = async (
  conversationId: string,
  messages: Message[]
) => {
  return createDataStream({
    execute: (dataStream) => {
      const result = streamText({
        model: aiProvider.languageModel("chat-model"),
        system: systemPrompt({ model: "chat-model" }),
        messages: messages as unknown as CoreMessage[],
        tools: aiTools,
        maxSteps: 5,
        experimental_activeTools: ["web_search"],
        experimental_continueSteps: true,
        onFinish: (result) => {
          const { text } = result;

          if (text) {
            db.message.create({
              content: text,
              role: "assistant",
              conversationId,
            });
          }
        },
      });
      result.mergeIntoDataStream(dataStream);
    },
  });
};
