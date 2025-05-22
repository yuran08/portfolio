"use client";

import ChatInput from "../../chat-input";
import { useState, ReactNode } from "react";
import { Message } from "../../type";

export default function ClientPage({
  conversationId,
  getLLMResponseReactNode,
  initConversationReactNode,
}: {
  conversationId: string;
  initConversationReactNode: ReactNode;
  getLLMResponseReactNode: (
    conversationId: string,
    messages: Omit<Message, "createAt" | "updateAt">[]
  ) => Promise<ReactNode>;
}) {
  const [messages, setMessages] = useState<ReactNode[]>([
    initConversationReactNode,
  ]);

  return (
    <div className="flex h-screen w-full flex-col items-center justify-center overflow-hidden p-6">
      <div className="w-full max-w-3xl flex-1 overflow-scroll [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {messages}
      </div>
      <ChatInput />
    </div>
  );
}
