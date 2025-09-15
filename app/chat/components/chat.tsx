"use client";

import { getCookie } from "@/lib/utils/cookies";
import ChatInput from "./chat-input";
import { ChatMessages } from "./chat-messages";
import Welcome from "./welcome";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";

export default function Chat() {
  const { messages, sendMessage, status, stop } = useChat({
    transport: new DefaultChatTransport({
      api: "/api/chat",
      body: {
        model:
          getCookie("reasoner-model") === "true"
            ? "deepseek-reasoner"
            : "deepseek-chat",
      },
    }),
    onFinish: ({ message }) => {
      console.log(message, "finish");
    },
  });

  if (!messages.length) {
    return (
      <div className="flex h-full w-full flex-col items-center justify-center p-6">
        <div className="w-full max-w-3xl">
          <Welcome />
          <ChatInput
            sendMessage={sendMessage}
            isLoading={status === "submitted" || status === "streaming"}
            stop={stop}
          />
        </div>
      </div>
    );
  }

  // console.log(messages, "messages");

  return (
    <div className="relative flex h-screen w-full flex-col">
      {/* 顶部渐变遮罩 */}
      <div className="absolute top-0 left-0 z-10 box-border h-4 w-full bg-gradient-to-r to-transparent px-6">
        <div className="h-full w-full bg-gradient-to-b to-transparent"></div>
      </div>

      <ChatMessages messages={messages} status={status} />

      <div className="sticky bottom-0 px-6 pb-6">
        <div className="mx-auto max-w-3xl">
          <ChatInput
            sendMessage={sendMessage}
            isLoading={status === "submitted" || status === "streaming"}
            stop={stop}
          />
        </div>
      </div>
    </div>
  );
}
