"use client";

import {
  useState,
  useCallback,
  ReactNode,
  useRef,
  useOptimistic,
  startTransition,
} from "react";
import { conversationAddMessage } from "./action";
import ChatInput, { ChatInputRef } from "./chat-input";
import { ConversationMessages } from "./conversation-messages";
import { AwaitResponseMessageWrapper } from "./components/message";

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
  const chatInputRef = useRef<ChatInputRef>(null);
  const isSendMessage = useRef(false);

  // useOptimistic 基于实际状态，只用于临时显示乐观消息
  const [optimisticMessages, addOptimisticMessage] = useOptimistic(
    messagesNode, // 实际状态
    (state: ReactNode[], optimisticUserMessage: string) => {
      // 在实际状态基础上添加乐观的用户消息
      return [
        ...state,
        <AwaitResponseMessageWrapper input={optimisticUserMessage} />,
      ];
    }
  );

  const handleMessageSubmit = useCallback(
    async (formData: FormData) => {
      const message = (formData.get("message") as string)?.trim();
      if (!message) return;

      if (isSendMessage.current) return;
      isSendMessage.current = true;

      chatInputRef.current?.clearInput();

      addOptimisticMessage(message);

      try {
        const newMessagesNode = await conversationAddMessage(
          conversationId,
          message
        );

        startTransition(() => {
          setMessagesNode((prevMessagesNode: ReactNode[]) => [
            ...prevMessagesNode,
            newMessagesNode,
          ]);
        });
      } catch (error) {
        console.error("❌ 发送消息失败:", error);
      } finally {
        isSendMessage.current = false;
      }
    },
    [conversationId, addOptimisticMessage]
  );

  return (
    <div className="relative flex h-screen w-full flex-col bg-white dark:bg-slate-950">
      {/* 顶部渐变遮罩 */}
      <div className="absolute left-0 top-0 z-30 box-border h-4 w-full bg-gradient-to-r from-white to-transparent px-6 dark:from-slate-950">
        <div className="h-full w-full bg-gradient-to-b from-white to-transparent dark:from-slate-950"></div>
      </div>

      <ConversationMessages
        conversationId={conversationId}
        initialMessages={optimisticMessages}
      />

      <div className="sticky bottom-0 bg-white px-6 pb-6 dark:bg-slate-950">
        <div className="mx-auto max-w-3xl">
          <ChatInput
            ref={chatInputRef}
            conversationId={conversationId}
            action={handleMessageSubmit}
          />
        </div>
      </div>
    </div>
  );
}
