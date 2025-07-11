"use client";

import ChatInput from "./chat-input";
import { ChatMessages } from "./chat-messages";
import Welcome from "./welcome";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import { useState } from "react";

export default function Chat() {
  const [model, setModel] = useState<"deepseek-chat" | "deepseek-reasoner">(
    "deepseek-chat"
  );
  const { messages, sendMessage, status, stop } = useChat({
    transport: new DefaultChatTransport({
      api: "/api/chat",
      body: {
        model,
      },
    }),
  });

  if (!messages.length) {
    return (
      <div className="flex h-full w-full flex-col items-center justify-center bg-white p-6 dark:bg-slate-950">
        <div className="w-full max-w-3xl">
          <Welcome />
          <ChatInput
            sendMessage={sendMessage}
            model={model}
            setModel={setModel}
            isLoading={status === "submitted" || status === "streaming"}
            stop={stop}
          />
        </div>
      </div>
    );
  }

  console.log(messages, "messages");

  return (
    <div className="relative flex h-screen w-full flex-col bg-white dark:bg-slate-950">
      {/* 顶部渐变遮罩 */}
      <div className="absolute left-0 top-0 z-10 box-border h-4 w-full bg-gradient-to-r from-white to-transparent px-6 dark:from-slate-950">
        <div className="h-full w-full bg-gradient-to-b from-white to-transparent dark:from-slate-950"></div>
      </div>

      <ChatMessages messages={messages} status={status} />

      <div className="sticky bottom-0 bg-white px-6 pb-6 dark:bg-slate-950">
        <div className="mx-auto max-w-3xl">
          <ChatInput
            sendMessage={sendMessage}
            model={model}
            setModel={setModel}
            isLoading={status === "submitted" || status === "streaming"}
            stop={stop}
          />
        </div>
      </div>
    </div>
  );
}
