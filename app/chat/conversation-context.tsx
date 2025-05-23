"use client";

import {
  createContext,
  useContext,
  useState,
  ReactNode,
  useEffect,
} from "react";
import { Conversation } from "@prisma/client";
import { usePathname } from "next/navigation";

type ConversationContextType = {
  currentConversationId: string | null;
  setCurrentConversationId: (id: string | null) => void;
  conversations: Conversation[];
  setConversations: (conversations: Conversation[]) => void;
  conversationCache: Map<string, ReactNode>;
  setCachedConversation: (id: string, content: ReactNode) => void;
};

const ConversationContext = createContext<ConversationContextType | undefined>(
  undefined
);

export const useConversation = () => {
  const context = useContext(ConversationContext);
  if (!context) {
    throw new Error("useConversation must be used within ConversationProvider");
  }
  return context;
};

// 从路径中提取 conversationId 的工具函数
const extractConversationIdFromPath = (pathname: string): string | null => {
  const pathParts = pathname.split("/");
  if (
    pathParts.length >= 4 &&
    pathParts[1] === "chat" &&
    pathParts[2] === "conversation"
  ) {
    return pathParts[3];
  }
  return null;
};

export const ConversationProvider = ({
  children,
  initialConversations,
}: {
  children: ReactNode;
  initialConversations: Conversation[];
}) => {
  const pathname = usePathname();

  // 在客户端初始化时就设置正确的 conversationId
  const [currentConversationId, setCurrentConversationId] = useState<
    string | null
  >(() => {
    // 只在客户端执行
    if (typeof window !== "undefined") {
      return extractConversationIdFromPath(pathname);
    }
    // 服务器端返回 null，避免水合不匹配
    return null;
  });

  const [conversations, setConversations] =
    useState<Conversation[]>(initialConversations);
  const [conversationCache] = useState(new Map<string, ReactNode>());

  // 监听路径变化，同步状态
  useEffect(() => {
    const conversationId = extractConversationIdFromPath(pathname);
    setCurrentConversationId(conversationId);
  }, [pathname]);

  const setCachedConversation = (id: string, content: ReactNode) => {
    conversationCache.set(id, content);
  };

  return (
    <ConversationContext.Provider
      value={{
        currentConversationId,
        setCurrentConversationId,
        conversations,
        setConversations,
        conversationCache,
        setCachedConversation,
      }}
    >
      {children}
    </ConversationContext.Provider>
  );
};
