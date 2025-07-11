"use server";

import db from "@/lib/redis";
import {
  UserMessageWrapper,
  AssistantMessageWrapper,
  ToolMessageWrapper,
} from "./components/message";
import { ReactNode } from "react";
import { revalidatePath } from "next/cache";
import { Message } from "./type";
import { convertToModelMessages, ToolResultPart } from "ai";
import GetNextResponse from "./get-next-response";
import { formatToolResult } from "./tools";
import { MemoizedMarkdown } from "./components/markdown";
import { getAiResponseStream } from "./lib/ai/stream";
import MessageGroup from "./components/message-group";
import { getAIState, getMutableAIState, streamUI } from "@ai-sdk/rsc";
import { aiProvider } from "./lib/ai/provider";
import { LoadingSpinner } from "./components/skeleton";

// 开始对话
export const startConversation = async (
  conversationId: string,
  message: string
) => {
  await db.conversation.create({
    id: conversationId,
    title: "",
  });

  await db.message.create({
    content: message,
    role: "user",
    conversationId,
  });
};

// 更新对话标题
export const updateConversationTitle = async (
  conversationId: string,
  title: string
) => {
  await db.conversation.update(conversationId, { title });
  revalidatePath(`/chat/conversation/${conversationId}`);
};

// 删除对话
export const deleteConversation = async (conversationId: string) => {
  await db.conversation.delete(conversationId);
  revalidatePath(`/chat`);
};

// 添加消息
export const conversationAddMessage = async (
  conversationId: string,
  message: string
): Promise<ReactNode> => {
  await db.message.create({
    content: message,
    role: "user",
    conversationId,
  });
  const messages = await db.message.findByConversationId(conversationId);

  const llmResponseReactNode = await getLLMResponseReactNode(
    conversationId,
    messages
  );

  revalidatePath(`/chat/conversation/${conversationId}`, "layout");
  return llmResponseReactNode;
};

// 获取对话列表
export const getConversationList = async () => {
  const conversations = await db.conversation.findMany();
  return conversations;
};

// 根据消息生成LLM响应的React节点
export const getLLMResponseReactNode = async (
  conversationId: string,
  messages: Message[]
): Promise<ReactNode> => {
  const stream = await getAiResponseStream(conversationId, messages);
  return (
    <MessageGroup
      userMessage={messages[messages.length - 1].content as string}
      stream={stream}
      conversationId={conversationId}
    />
  );
};

// 获取初始对话的React节点
export const getInitConversationReactNode = async (conversationId: string) => {
  const messages = await db.message.findByConversationId(conversationId);
  // console.log(messages, "messages");

  if (messages.length === 0)
    return (
      <div
        key={conversationId}
        className="flex h-full items-center justify-center"
      >
        <p>未找到当前对话</p>
      </div>
    );

  if (messages.length === 1)
    return (
      <GetNextResponse
        key={conversationId}
        conversationId={conversationId}
        messages={messages}
      />
    );

  return (
    <>
      {messages.map((message) => {
        if (message.role === "user") {
          return (
            <UserMessageWrapper key={message.id}>
              {message.content as string}
            </UserMessageWrapper>
          );
        }

        if (
          message.role === "assistant" &&
          typeof message.content === "string"
        ) {
          return (
            <AssistantMessageWrapper key={message.id}>
              <MemoizedMarkdown
                id={message.id}
                content={message.content || "## 系统错误，请重试"}
              />
            </AssistantMessageWrapper>
          );
        }

        // 处理工具消息
        if (message.role === "tool") {
          const tools = message.content as unknown as ToolResultPart[];

          // 只有当有工具结果时才渲染 ToolMessageWrapper
          if (tools.length > 0) {
            return (
              <ToolMessageWrapper key={message.id}>
                {tools.map((item, index) => (
                  <MemoizedMarkdown
                    key={`${item.toolName}-${index}`}
                    id={message.id}
                    content={formatToolResult(item.toolName, item.result)}
                  />
                ))}
              </ToolMessageWrapper>
            );
          }
        }

        // 如果没有匹配的类型，返回 null
        return null;
      })}
    </>
  );
};

// Define the AI state and UI state types
export type ServerMessage = {
  role: "user" | "assistant";
  content: string;
};

export type ClientMessage = {
  id: string;
  role: "user" | "assistant";
  display: ReactNode;
};

export const sendMessage = async (input: string): Promise<ReactNode> => {
  const history = getMutableAIState();
  history.update([...history.get(), { role: "user", content: input }]);
  const messageId = String(Date.now());

  const result = await streamUI({
    model: aiProvider.languageModel("chat-model"),
    initial: (
      <AssistantMessageWrapper>
        <LoadingSpinner />
      </AssistantMessageWrapper>
    ),
    text: ({ content, done }) => {
      if (done) {
        history.done([...history.get(), { role: "assistant", content }]);
      }

      return (
        <AssistantMessageWrapper>
          <MemoizedMarkdown id={messageId} content={content} />
        </AssistantMessageWrapper>
      );
    },
    messages: history.get(),
  });

  return result.value;
};
