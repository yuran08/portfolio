"use client";

import { useState, useEffect, useRef } from "react";
import { useConversation } from "./conversation-context";
import ChatInput from "./chat-input";
import {
  getInitConversationReactNode,
  conversationAddMessage,
  startConversation,
} from "./action";
import { ReactNode } from "react";
import { redirect } from "next/navigation";

const ConversationView = ({ conversationId }: { conversationId: string }) => {
  const { conversationCache, setCachedConversation } = useConversation();
  const [messagesNode, setMessagesNode] = useState<ReactNode[]>([]);
  const [isMounted, setIsMounted] = useState(false);
  const scrollDivRef = useRef<HTMLDivElement>(null);

  // 滚动到底部的函数
  const scrollToBottom = () => {
    if (scrollDivRef.current) {
      scrollDivRef.current.scrollTop = scrollDivRef.current.scrollHeight;
    }
  };

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (messagesNode.length > 0) {
      scrollToBottom();
    }
  }, [messagesNode]);

  useEffect(() => {
    if (!isMounted) return;

    const loadConversation = async () => {

      // 检查缓存
      const cached = conversationCache.get(conversationId);
      if (cached) {
        setMessagesNode([cached]);
        return;
      }

      try {
        // 异步加载对话内容
        const initNode = await getInitConversationReactNode(conversationId);
        setMessagesNode((prev) => [...prev, initNode]);
        setCachedConversation(conversationId, initNode);
      } catch (error) {
        console.error("Failed to load conversation:", error);
        setMessagesNode([<div key="error">加载对话失败</div>]);
      }
    };

    loadConversation();

    return () => {
      setMessagesNode([]);
    };
  }, [conversationId, conversationCache, setCachedConversation, isMounted]);

  if (!isMounted) {
    return null;
  }

  const handleAddMessage = async (formData: FormData) => {
    const message = (formData.get("message") as string).trim();
    if (!message) return;

    try {
      const newMessage = await conversationAddMessage(conversationId, message);
      setMessagesNode((prev) => [...prev, newMessage]);
      // 更新缓存
      setCachedConversation(
        conversationId,
        messagesNode[messagesNode.length - 1]
      );
    } catch (error) {
      console.error("Failed to send message:", error);
    }
  };

  // 服务器端和客户端首次渲染显示加载状态，避免水合差异
  if (messagesNode.length <= 0) {
    return (
      <div className="flex h-screen w-full flex-col items-center justify-center bg-white dark:bg-gray-900">
        <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-blue-500 dark:border-blue-400"></div>
        <p className="mt-2 text-gray-500 dark:text-gray-400">加载中...</p>
      </div>
    );
  }

  return (
    <div className="flex relative h-screen w-full flex-col items-center justify-center overflow-hidden p-6 bg-white dark:bg-gray-900">
      <div className="absolute z-50 top-6 left-0 box-border px-6 w-full h-4 bg-gradient-to-r from-white dark:from-gray-900 to-transparent">
        <div className="bg-gradient-to-b from-white dark:from-gray-900 to-transparent w-full h-full"></div>
      </div>
      <div
        ref={scrollDivRef}
        className="w-full max-w-3xl flex-1 overflow-scroll [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {messagesNode}
      </div>
      <ChatInput action={handleAddMessage} />
    </div>
  );
};

export default function ChatPage() {
  const { currentConversationId, setCurrentConversationId, setConversations } =
    useConversation();
  const [isMounted, setIsMounted] = useState(false);

  // 客户端挂载检测
  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return null;
  }

  const handleStartConversation = async (formData: FormData) => {
    const message = (formData.get("message") as string)?.trim();
    if (!message) return;
    const conversationList = await startConversation(message);
    setConversations(conversationList);
    setCurrentConversationId(conversationList[0].id);
    redirect(`/chat/conversation/${conversationList[0].id}`);
  };

  // 客户端挂载后根据实际状态渲染
  if (!currentConversationId) {
    return (
      <div className="flex h-full w-full flex-col items-center justify-center p-6 bg-white dark:bg-gray-900">
        <ChatInput action={handleStartConversation} />
      </div>
    );
  }

  return <ConversationView conversationId={currentConversationId} />;
}
