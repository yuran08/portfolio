"use client";

import { useState, useEffect, ReactNode, useCallback } from "react";
import { conversationAddMessage } from "./action";

export function ConversationMessages({
  conversationId,
  initialMessages,
}: {
  conversationId: string;
  initialMessages: ReactNode;
}) {
  const [messagesNode, setMessagesNode] = useState<ReactNode[]>([
    initialMessages,
  ]);

  // 添加消息的函数，供 ChatInput 调用
  const addMessage = useCallback(
    async (message: string) => {
      try {
        const newMessage = await conversationAddMessage(
          conversationId,
          message
        );
        setMessagesNode((prev) => [...prev, newMessage]);
      } catch (error) {
        console.error("Failed to send message:", error);
      }
    },
    [conversationId]
  );

  // 将 addMessage 函数暴露给父组件
  useEffect(() => {
    (
      window as unknown as {
        addMessageToConversation?: (message: string) => Promise<void>;
      }
    ).addMessageToConversation = addMessage;
    return () => {
      delete (
        window as unknown as {
          addMessageToConversation?: (message: string) => Promise<void>;
        }
      ).addMessageToConversation;
    };
  }, [conversationId, addMessage]);

  return <div className="w-full">{messagesNode}</div>;
}
