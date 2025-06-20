"use client";

import {
  useState,
  useCallback,
  ReactNode,
  useRef,
  useOptimistic,
  startTransition,
  Suspense,
} from "react";
import { conversationAddMessage, startConversation } from "./action";
import ChatInput, { ChatInputRef } from "./chat-input";
import { ConversationMessages } from "./conversation-messages";
import { AwaitResponseMessageWrapper } from "./components/message";
import { NewChatSkeleton } from "./components/skeleton";
import Welcome from "./components/welcome";
import { v4 as uuidv4 } from "uuid";
import { useRouter } from "next/navigation";

export default function ClientPage({
  conversationId = '',
  initialMessages,
}: {
  conversationId?: string;
  initialMessages?: ReactNode;
}) {
  const router = useRouter();

  // 所有的 hooks 必须在条件性返回之前调用
  const [messagesNode, setMessagesNode] = useState<ReactNode[]>(
    initialMessages ? [initialMessages] : []
  );
  const chatInputRef = useRef<ChatInputRef>(null);
  const isSendMessage = useRef(false);

  // useOptimistic 基于实际状态，只用于临时显示乐观消息
  const [optimisticMessages, addOptimisticMessage] = useOptimistic(
    messagesNode, // 实际状态
    (state: ReactNode[], optimisticUserMessage: string) => {
      // 在实际状态基础上添加乐观的用户消息
      return [
        ...state,
        <AwaitResponseMessageWrapper key={`optimistic-${Date.now()}`} input={optimisticUserMessage} />,
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
          conversationId!,
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

  const startConversationAction = async (formData: FormData) => {
    const message = String(formData.get("message"))?.trim();
    if (!message) return;

    if (isSendMessage.current) return;
    isSendMessage.current = true;

    // 清空输入框
    chatInputRef.current?.clearInput();

    const newConversationId = uuidv4();

    // 添加乐观消息 (用户消息 + AI响应等待状态)
    addOptimisticMessage(message);

    try {
      // 异步创建对话并获取AI响应
      await startConversation(newConversationId, message);

      // 等待状态更新完成后再更改URL，避免竞态条件
      router.replace(`/chat/conversation/${newConversationId}`);

    } catch (error) {
      console.error("❌ 创建对话失败:", error);
    } finally {
      isSendMessage.current = false;
    }
  };

  // 条件性返回必须在所有 hooks 之后
  if (optimisticMessages.length === 0) {
    return <Suspense fallback={<NewChatSkeleton />}>
      <div className="flex h-full w-full flex-col items-center justify-center bg-white p-6 dark:bg-slate-950">
        <div className="w-full max-w-3xl">
          <Welcome />
          <ChatInput ref={chatInputRef} action={startConversationAction} />
        </div>
      </div>
    </Suspense>
  }

  return (
    <div className="relative flex h-screen w-full flex-col bg-white dark:bg-slate-950">
      {/* 顶部渐变遮罩 */}
      <div className="absolute left-0 top-0 z-10 box-border h-4 w-full bg-gradient-to-r from-white to-transparent px-6 dark:from-slate-950">
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
            action={handleMessageSubmit}
          />
        </div>
      </div>
    </div>
  );
}
