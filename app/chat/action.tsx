"use server";

import { db } from "@/lib/redis-adapter";
import {
  UserMessageWrapper,
  AssistantMessageWrapper,
  ParseToMarkdown,
} from "./message";
import { Suspense, ReactNode } from "react";
import { revalidatePath } from "next/cache";
import { Message } from "./type";
import ParseLLMReaderToMarkdownGenerator from "./parser";
import { LoadingWithText } from "./skeleton";
import { createLLMStream } from "./llm";

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
  revalidatePath(`/chat/conversation/${conversationId}`);
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

// 根据消息生成LLM响应的React节点
export const getLLMResponseReactNode = async (
  conversationId: string,
  messages: Omit<Message, "createAt" | "updateAt">[]
): Promise<ReactNode> => {
  const { textStream, toolCalls, toolResults } =
    await createLLMStream(messages);
  const llmReader = textStream.getReader();
  const llmGenerator = ParseLLMReaderToMarkdownGenerator(llmReader);
  const messageId = await db.message
    .create({
      content: "",
      role: "assistant",
      conversationId,
    })
    .then((message) => message.id);

  const wrappedToolResults = createPromiseWithStatus(toolResults);

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
      return <ParseToMarkdown block={currentAccumulator} />;
    }

    // 更新累积文本
    const newAccumulator = currentAccumulator + value;

    // 渲染当前文本，并设置下一次更新
    return (
      <Suspense fallback={<ParseToMarkdown block={newAccumulator} />}>
        <StreamWithRecursion accumulator={newAccumulator} />
      </Suspense>
    );
  };

  const StreamWithToolCalls = async () => {
    const streamToolCalls = await toolCalls;
    console.log(streamToolCalls, "*streamToolCalls*");

    if (streamToolCalls.length === 0) {
      return null;
    }

    if (wrappedToolResults.isPending) {
      return (
        <div>
          {streamToolCalls.map((toolCall) => (
            <div key={toolCall.toolCallId}>Tool Call: {toolCall.toolName}</div>
          ))}
        </div>
      );
    }

    return (
      <>
        <div>Tool Call: done</div>
      </>
    );
  };

  return (
    <>
      <UserMessageWrapper>
        {messages[messages.length - 1].content}
      </UserMessageWrapper>
      <AssistantMessageWrapper>
        <Suspense fallback={<LoadingWithText text="AI 正在思考..." />}>
          <StreamWithToolCalls />
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

function createPromiseWithStatus<T>(promise: Promise<T>) {
  let status = "pending";

  const wrappedPromise = promise.then(
    (value) => {
      status = "fulfilled";
      console.log(value, "*toolResults*");
      return value;
    },
    (error) => {
      status = "rejected";
      throw error;
    }
  );

  return {
    isPending: status === "pending",
    isFulfilled: status === "fulfilled",
    isRejected: status === "rejected",
    wrappedPromise,
  };
}
