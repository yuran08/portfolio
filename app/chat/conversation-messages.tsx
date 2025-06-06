"use client";

import { useState, useEffect, ReactNode, useCallback, useRef } from "react";
import { conversationAddMessage } from "./action";
import { ChevronDown } from "lucide-react";

export function ConversationMessages({
  conversationId,
  initialMessages,
}: {
  conversationId: string;
  initialMessages: ReactNode;
}) {
  const messagesRef = useRef<HTMLDivElement | null>(null);
  const [messagesNode, setMessagesNode] = useState<ReactNode[]>([
    initialMessages,
  ]);
  const [showScrollToBottom, setShowScrollToBottom] = useState(false);

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

  // 滚动到底部的函数
  const scrollToBottom = useCallback(() => {
    if (messagesRef.current) {
      messagesRef.current.scrollTo({
        top: messagesRef.current.scrollHeight,
        behavior: "smooth",
      });
    }
  }, []);

  // 监听滚动事件，判断是否显示回到底部按钮
  const handleScroll = useCallback(() => {
    if (messagesRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = messagesRef.current;
      const distanceFromBottom = scrollHeight - scrollTop - clientHeight;
      setShowScrollToBottom(distanceFromBottom > 300);
    }
  }, []);

  useEffect(() => {
    if (messagesRef.current) {
      messagesRef.current.scrollTo({
        top: messagesRef.current.scrollHeight,
      });
    }
  }, [messagesNode]);

  // 添加滚动事件监听器
  useEffect(() => {
    const messagesElement = messagesRef.current;
    if (messagesElement) {
      messagesElement.addEventListener("scroll", handleScroll);
      return () => {
        messagesElement.removeEventListener("scroll", handleScroll);
      };
    }
  }, [handleScroll]);

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
      ref={messagesRef}
      className="relative flex-1 overflow-y-auto px-6 py-4 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
    >
      <div className="mx-auto max-w-3xl">
        <div className="w-full">{messagesNode}</div>
      </div>

      {/* 回到底部按钮 */}
      {showScrollToBottom && (
        <div className="sticky bottom-0 left-0 right-0 mx-auto flex max-w-3xl justify-end">
          <button
            onClick={scrollToBottom}
            className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-500 shadow-lg transition-all duration-200 hover:bg-blue-600 hover:shadow-xl dark:bg-indigo-600 dark:hover:bg-indigo-500"
            aria-label="回到底部"
          >
            <ChevronDown className="h-5 w-5 text-white" />
          </button>
        </div>
      )}
    </div>
  );
}
