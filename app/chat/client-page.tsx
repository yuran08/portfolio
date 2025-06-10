"use client";

import { useState, useCallback, ReactNode, useRef } from "react";
import { conversationAddMessage } from "./action";
import ChatInput from "./chat-input";
import { ConversationMessages } from "./conversation-messages";

export default function ClientPage({
  conversationId,
  initialMessages,
}: {
  conversationId: string;
  initialMessages: ReactNode;
}) {
  const [messagesNode, setMessagesNode] = useState<ReactNode[]>([
    initialMessages,
  ]);
  const isSendMessage = useRef(false);

  // 创建消息发送action
  const handleMessageSubmit = useCallback(
    async (formData: FormData) => {
      const message = (formData.get("message") as string)?.trim();
      if (!message) return;

      if (isSendMessage.current) return;
      isSendMessage.current = true;

      try {
        const newMessage = await conversationAddMessage(
          conversationId,
          message
        );
        setMessagesNode((prev) => [...prev, newMessage]);
      } catch (error) {
        console.error("❌ 发送消息失败:", error);
      } finally {
        isSendMessage.current = false;
      }
    },
    [conversationId]
  );

  return (
    <div className="relative flex h-screen w-full flex-col bg-white dark:bg-slate-950">
      {/* 顶部渐变遮罩 */}
      <div className="absolute left-0 top-0 z-50 box-border h-4 w-full bg-gradient-to-r from-white to-transparent px-6 dark:from-slate-950">
        <div className="h-full w-full bg-gradient-to-b from-white to-transparent dark:from-slate-950"></div>
      </div>

      {/* 可滚动的消息区域 */}
      <ConversationMessages
        conversationId={conversationId}
        initialMessages={messagesNode}
      />

      {/* 固定在底部的输入框 */}
      <div className="sticky bottom-0 bg-white px-6 pb-6 dark:bg-slate-950">
        <div className="mx-auto max-w-3xl">
          <ChatInput
            conversationId={conversationId}
            action={handleMessageSubmit}
          />
        </div>
      </div>
    </div>
  );
}
