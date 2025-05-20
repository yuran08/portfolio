"use server";

import { streamText } from "ai";
import { deepseek } from "@ai-sdk/deepseek";
import {
  UserMessageWrapper,
  AssistantMessageWrapper,
  ParseToMarkdown,
} from "./message";
import { Suspense } from "react";
import { Message } from "./type";
import ParseLLMReaderToMarkdownGenerator from "./parser";
// 生成随机ID
const generateId = () => (Math.random() * 10000000).toFixed(0);

// 从流中获取LLM响应
const getLLMResponseStream = async (messages: Message[]) => {
  const { textStream } = streamText({
    model: deepseek("deepseek-chat"),
    messages,
  });

  return textStream;
};

// 从表单数据中提取消息
export const getMessageFromFormData = async (formData: FormData) => {
  const message = (formData.get("message") as string)?.trim();

  if (!message) return undefined;

  return [
    {
      id: generateId(),
      role: "user",
      content: message,
    },
  ] as Message[];
};

// 生成LLM响应的React节点
export const getLLMResponseReactNode = async (messages: Message[]) => {
  const llmReader = (await getLLMResponseStream(messages)).getReader();
  const llmGenerator = ParseLLMReaderToMarkdownGenerator(llmReader);
  const messageId = generateId();

  // 递归式流式渲染组件
  const StreamWithRecursion = async (props: { accumulator?: string }) => {
    const currentAccumulator = props.accumulator || "";

    // 从流中读取下一个片段
    const { done, value } = await llmGenerator.next();

    // 如果流结束，返回最终结果
    if (done) {
      return (
        <ParseToMarkdown
          block={currentAccumulator}
          data-message-id={messageId}
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
              data-message-id={messageId}
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
