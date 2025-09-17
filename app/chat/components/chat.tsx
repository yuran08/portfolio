"use client";

import { useChat } from "@ai-sdk/react";

import Welcome from "./welcome";
import ChatInput from "./chat-input";
import { ChatMessages } from "./chat-messages";

export default function Chat() {
  const { messages, sendMessage, status, stop } = useChat({
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

  return (
    <div className="relative flex h-screen w-full flex-col">
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
