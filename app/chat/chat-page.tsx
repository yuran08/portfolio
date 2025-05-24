"use client";

import { useState, useEffect } from "react";
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
  const [isLoading, setIsLoading] = useState(true);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (!isMounted) return;

    const loadConversation = async () => {
      setIsLoading(true);

      // 检查缓存
      const cached = conversationCache.get(conversationId);
      if (cached) {
        setMessagesNode([cached]);
        setIsLoading(false);
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
      } finally {
        setIsLoading(false);
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
  if (isLoading) {
    return (
      <div className="flex h-screen w-full flex-col items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-blue-500"></div>
        <p className="mt-2 text-gray-500">加载中...</p>
      </div>
    );
  }

  return (
    <div className="flex relative h-screen w-full flex-col items-center justify-center overflow-hidden p-6">
      <div className="absolute z-50 top-6 left-0 box-border px-6 w-full h-4 bg-linear-to-r ">
        <div className=" bg-linear-to-b from-white to-transparent w-full h-full"></div>
      </div>
      <div className="w-full max-w-3xl flex-1 overflow-scroll [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
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
      <div className="flex h-full w-full flex-col items-center justify-center p-6">
        <ChatInput action={handleStartConversation} />
      </div>
    );
  }

  return <ConversationView conversationId={currentConversationId} />;
}
