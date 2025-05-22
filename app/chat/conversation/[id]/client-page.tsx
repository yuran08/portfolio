"use client";

import ChatInput from "../../chat-input";
import { useState, ReactNode } from "react";

export default function ClientPage({
  conversationId,
  initConversationReactNode,
  conversationAddMessage,
}: {
  conversationId: string;
  initConversationReactNode: ReactNode;
  conversationAddMessage: (
    conversationId: string,
    message: string
  ) => Promise<ReactNode>;
}) {
  const [messagesNode, setMessagesNode] = useState<ReactNode[]>([
    initConversationReactNode,
  ]);

  return (
    <div className="flex h-screen w-full flex-col items-center justify-center overflow-hidden p-6">
      <div className="w-full max-w-3xl flex-1 overflow-scroll [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {messagesNode}
      </div>
      <ChatInput
        action={async (formData: FormData) => {
          const message = (formData.get("message") as string).trim();
          if (!message) return;
          const newMessage = await conversationAddMessage(
            conversationId,
            message
          );
          setMessagesNode([...messagesNode, newMessage]);
        }}
      />
    </div>
  );
}
