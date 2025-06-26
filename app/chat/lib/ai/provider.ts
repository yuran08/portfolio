import { customProvider } from "ai";
import { deepseek } from "@ai-sdk/deepseek";

export const aiProvider = customProvider({
  languageModels: {
    "chat-model": deepseek("deepseek-chat"),
    "chat-model-reasoning": deepseek("deepseek-reasoner"),
    "title-model": deepseek("deepseek-chat"),
  },
});
