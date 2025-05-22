"use server";

import { streamText } from "ai";
import { deepseek } from "@ai-sdk/deepseek";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import {
  UserMessageWrapper,
  AssistantMessageWrapper,
  ParseToMarkdown,
} from "./message";
import { Suspense, ReactNode } from "react";
import { Message } from "./type";
import ParseLLMReaderToMarkdownGenerator from "./parser";

// 从表单数据中提取消息
export const getMessageFromFormData = async (formData: FormData) => {
  const message = (formData.get("message") as string)?.trim();

  return message || undefined;
};

// 开始对话
export const startConversation = async (formData: FormData) => {
  const message = await getMessageFromFormData(formData);
  if (!message) return;
  const conversation = await prisma.conversation.create({
    data: {},
  });
  await prisma.message.create({
    data: {
      content: message,
      role: "user",
      conversationId: conversation.id,
    },
  });
  redirect(`/chat/conversation/${conversation.id}`);
};

// 从流中获取LLM响应
const getLLMResponseStream = async (
  messages: Omit<Message, "createAt" | "updateAt">[]
) => {
  const { textStream } = streamText({
    model: deepseek("deepseek-chat"),
    system: "你是一个专业的AI助手，请根据用户的问题给出最专业的回答。",
    messages,
  });

  return textStream;
};

// 生成LLM响应的React节点
export const getLLMResponseReactNode = async (
  conversationId: string,
  messages: Omit<Message, "createAt" | "updateAt">[]
): Promise<ReactNode> => {
  const llmReader = (await getLLMResponseStream(messages)).getReader();
  const llmGenerator = ParseLLMReaderToMarkdownGenerator(llmReader);
  const messageId = await prisma.message
    .create({
      data: {
        content: "",
        role: "assistant",
        conversationId,
      },
    })
    .then((message) => message.id);

  // 递归式流式渲染组件
  const StreamWithRecursion = async (props: { accumulator?: string }) => {
    const currentAccumulator = props.accumulator || "";

    // 从流中读取下一个片段
    const { done, value } = await llmGenerator.next();

    // 如果流结束，返回最终结果
    if (done) {
      await prisma.message.update({
        where: {
          id: messageId,
        },
        data: {
          content: currentAccumulator,
        },
      });
      return (
        <ParseToMarkdown
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
          <>
            <ParseToMarkdown
              block={newAccumulator}
              data-message-id={messageId.toString()}
            />
            <p>...</p>
          </>
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
        <Suspense fallback={<div>Loading...</div>}>
          <StreamWithRecursion />
        </Suspense>
      </AssistantMessageWrapper>
    </>
  );
};

// 获取初始对话的React节点
export const getInitConversationReactNode = async (conversationId: string) => {
  const messages = await prisma.message.findMany({
    where: {
      conversationId,
    },
    orderBy: {
      createdAt: "asc",
    },
  });

  if (messages.length === 0)
    return <div key="start conversation">开始对话吧</div>;

  if (messages.length === 1)
    return getLLMResponseReactNode(conversationId, [
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
            <ParseToMarkdown block={message.content} />
          </AssistantMessageWrapper>
        )
      )}
    </>
  );
};
