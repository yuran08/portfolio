import { CoreMessage } from "ai";
import { streamText } from "ai";
import { deepseek } from "@ai-sdk/deepseek";
import systemPrompt from "./prompts";
import { Message } from "../../type";
import db from "@/lib/redis";
import { aiTools } from "../../tools";
import { aiProvider } from "./provider";

export const getAiResponseStream = async (
  conversationId: string,
  messages: Message[]
) => {};
