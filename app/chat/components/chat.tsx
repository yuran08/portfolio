"use client";

import { useChat } from "@ai-sdk/react";

import Welcome from "./welcome";
import ChatInput from "./chat-input";
import { ChatMessages } from "./chat-messages";
import { DefaultChatTransport } from "ai";
import type { MyUIMessage } from "../lib/message-type";

export default function Chat({
  id,
  initialMessages,
}: {
  id: string;
  initialMessages?: MyUIMessage[];
}) {
  const { messages, sendMessage, status, stop, regenerate } =
    useChat<MyUIMessage>({
      transport: new DefaultChatTransport({
        body: {
          chatId: id,
        },
      }),
      messages: initialMessages,
      id: id,
      experimental_throttle: 100,
      onFinish: () => {
        window.history.replaceState({}, "", `/chat/${id}`);
        window.dispatchEvent(new CustomEvent("chat-history-updated"));
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
      <ChatMessages
        messages={messages}
        status={status}
        regenerate={regenerate}
      />

      <div className="sticky bottom-0 w-full px-6">
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
