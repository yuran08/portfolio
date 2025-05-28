"use client";

import { useState, useEffect, useRef, ReactNode, useCallback } from "react";
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
  const containerRef = useRef<HTMLDivElement>(null);

  // 滚动到底部的函数 - 现在滚动父容器
  const scrollToBottom = () => {
    // 查找可滚动的父容器
    const scrollableParent = containerRef.current?.closest('[class*="overflow-y-auto"]') as HTMLElement;
    if (scrollableParent) {
      scrollableParent.scrollTop = scrollableParent.scrollHeight;
    }
  };

  useEffect(() => {
    if (messagesNode.length > 0) {
      // 延迟滚动，确保DOM已更新
      setTimeout(scrollToBottom, 100);
    }
  }, [messagesNode]);

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

  return (
    <div
      ref={containerRef}
      className="w-full"
    >
      {messagesNode}
    </div>
  );
}
