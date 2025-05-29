"use server";

import { streamText } from "ai";
import { deepseek } from "@ai-sdk/deepseek";
import { db } from "@/lib/redis-adapter";
import {
  UserMessageWrapper,
  AssistantMessageWrapper,
  ParseToMarkdown,
} from "./message";
import { Suspense, ReactNode } from "react";
import { Message } from "./type";
import ParseLLMReaderToMarkdownGenerator from "./parser";
import { LoadingWithText } from "./skeleton";
import { StreamingMarkdown } from "./streaming-markdown";

// 开始对话
export const startConversation = async (message: string) => {
  const conversation = await db.conversation.create({
    title: message,
  });
  await db.message.create({
    content: message,
    role: "user",
    conversationId: conversation.id,
  });
  const conversationList = await db.conversation.findMany();
  return conversationList;
};

// 更新对话标题
export const updateConversationTitle = async (
  conversationId: string,
  title: string
) => {
  await db.conversation.update(conversationId, { title });
};

// 删除对话
export const deleteConversation = async (conversationId: string) => {
  await db.conversation.delete(conversationId);
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
  return llmResponseReactNode;
};

// 获取对话列表
export const getConversationList = async () => {
  const conversations = await db.conversation.findMany();
  return conversations;
};

// 从流中获取LLM响应
const getLLMResponseStream = async (
  messages: Omit<Message, "createAt" | "updateAt">[]
) => {
  const { textStream } = streamText({
    model: deepseek("deepseek-chat"),
    system: `你是一个专业的AI助手, 服务并所属于yr-chat,请根据用户的问题给出最专业的回答。今天的日期是${new Date().toLocaleDateString()}`,
    messages,
  });

  return textStream;
};

// 根据消息生成LLM响应的React节点
export const getLLMResponseReactNode = async (
  conversationId: string,
  messages: Omit<Message, "createAt" | "updateAt">[]
): Promise<ReactNode> => {
  const llmReader = (await getLLMResponseStream(messages)).getReader();
  const llmGenerator = ParseLLMReaderToMarkdownGenerator(llmReader);
  const messageId = await db.message
    .create({
      content: "",
      role: "assistant",
      conversationId,
    })
    .then((message) => message.id);

  // 递归式流式渲染组件
  const StreamWithRecursion = async (props: { accumulator?: string }) => {
    const currentAccumulator = props.accumulator || "";

    // 从流中读取下一个片段
    const { done, value } = await llmGenerator.next();

    // 如果流结束，返回最终结果
    if (done) {
      await db.message.update(messageId, {
        content: currentAccumulator,
      });
      console.log(currentAccumulator, "*ai response result*");
      return (
        <StreamingMarkdown
          block={currentAccumulator}
          data-message-id={messageId.toString()}
        />
      );
    }

    // 更新累积文本
    const newAccumulator = currentAccumulator + value;

    // 渲染当前文本，并设置下一次更新
    return (
      <Suspense
        fallback={
          <StreamingMarkdown
            block={newAccumulator}
            data-message-id={messageId.toString()}
          />
        }
      >
        <StreamWithRecursion accumulator={newAccumulator} />
      </Suspense>
    );
  };

  return (
    <>
      <UserMessageWrapper>
        {messages[messages.length - 1].content}
      </UserMessageWrapper>
      <AssistantMessageWrapper>
        <Suspense fallback={<LoadingWithText text="AI 正在思考..." />}>
          <StreamWithRecursion />
        </Suspense>
      </AssistantMessageWrapper>
    </>
  );
};

// 获取初始对话的React节点
export const getInitConversationReactNode = async (conversationId: string) => {
  const messages = await db.message.findByConversationId(conversationId);

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
    return await getLLMResponseReactNode(conversationId, [
      {
        id: messages[0].id,
        role: "user",
        content: messages[0].content,
      },
    ]);

  return (
    <>
      {messages.map((message) =>
        message.role === "user" ? (
          <UserMessageWrapper key={message.id}>
            {message.content}
          </UserMessageWrapper>
        ) : (
          <AssistantMessageWrapper key={message.id}>
            <ParseToMarkdown block={message.content || "## 系统错误，请重试"} />
          </AssistantMessageWrapper>
        )
      )}
    </>
  );
};
