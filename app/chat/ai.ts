import { createAI } from "@ai-sdk/rsc";
import { ClientMessage, ServerMessage, sendMessage } from "./action";

export type AIState = ServerMessage[];
export type UIState = ClientMessage[];
export type AIActions = {
  sendMessage: typeof sendMessage;
};

// Create the AI provider with the initial states and allowed actions
export const AI = createAI<AIState, UIState, AIActions>({
  initialAIState: [],
  initialUIState: [],
  actions: {
    sendMessage,
  },
});
