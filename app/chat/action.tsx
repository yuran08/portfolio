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
  const messageId = generateId();

  // 创建流式响应组件
  const StreamingResponse = async () => {
    let responseText = "";

    // 使用循环处理流式数据更新
    while (true) {
      const { done, value } = await llmReader.read();
      if (done) break;

      responseText += value;
      // React 19的服务器组件会在每次循环后更新UI
    }

    return <ParseToMarkdown block={responseText} data-message-id={messageId} />;
  };

  return (
    <>
      <UserMessageWrapper>
        {messages[messages.length - 1].content}
      </UserMessageWrapper>
      <AssistantMessageWrapper>
        <Suspense fallback={<div>Loading...</div>}>
          <StreamingResponse />
        </Suspense>
      </AssistantMessageWrapper>
    </>
  );
};
