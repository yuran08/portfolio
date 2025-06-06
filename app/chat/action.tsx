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
import { CoreMessage, ToolCallPart, ToolResultPart } from "ai";

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
  messages: Message[]
): Promise<ReactNode> => {
  const { textStream, toolCalls, toolResults } = await createLLMStream(
    messages as CoreMessage[]
  );
  const llmReader = textStream.getReader();
  const llmGenerator = ParseLLMReaderToMarkdownGenerator(llmReader);

  const wrappedToolResults = createPromiseWithStatus(toolResults);

  // 递归式流式渲染组件
  const StreamWithRecursion = async (props: { accumulator?: string }) => {
    const currentAccumulator = props.accumulator || "";

    // 从流中读取下一个片段
    const { done, value } = await llmGenerator.next();

    if (done && !currentAccumulator) {
      return null;
    }

    // 如果流结束，返回最终结果
    if (done && currentAccumulator && currentAccumulator !== "undefined") {
      await db.message.create({
        content: currentAccumulator,
        role: "assistant",
        conversationId,
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

  const StreamWithToolCalls = async (props: {
    promise: ReturnType<
      typeof createPromiseWithStatus<Awaited<typeof toolResults>>
    >;
  }) => {
    const streamToolCalls = await toolCalls;
    const toolResultsPromise = props.promise;

    if (streamToolCalls.length === 0) {
      return null;
    }

    console.log(streamToolCalls, "*streamToolCalls*");
    await db.message.create({
      content: JSON.stringify(streamToolCalls),
      role: "assistant",
      conversationId,
    });

    const toolName = streamToolCalls[0].toolName;
    if (toolResultsPromise.isPending) {
      return (
        <Suspense fallback={<div>Tool Call: {toolName} pending</div>}>
          <StreamWithToolCalls promise={toolResultsPromise} />
        </Suspense>
      );
    }

    if (toolResultsPromise.isFulfilled) {
      const result = await toolResultsPromise.wrappedPromise;
      const llmResponseReactNode = await addToolResultForNextMessage(
        conversationId,
        result,
        toolName
      );
      return llmResponseReactNode;
    }

    return <div>Tool Call: {toolName} error</div>;
  };

  return (
    <>
      <UserMessageWrapper>
        {messages[messages.length - 1].content as string}
      </UserMessageWrapper>
      <AssistantMessageWrapper>
        <Suspense fallback={null}>
          <StreamWithToolCalls promise={wrappedToolResults} />
        </Suspense>
        <Suspense fallback={<LoadingWithText text="AI 正在思考..." />}>
          <StreamWithRecursion />
        </Suspense>
      </AssistantMessageWrapper>
    </>
  );
};

// 获取工具调用结果
export const addToolResultForNextMessage = async (
  conversationId: string,
  content: Message["content"],
  toolName: string
) => {
  await db.message.create({
    content: JSON.stringify(content),
    role: "tool",
    conversationId,
  });

  const messages = (await db.message.findByConversationId(conversationId)).map(
    (message) => ({
      id: message.id,
      role: message.role,
      content: message.content,
    })
  );
  const llm = await createLLMStream(messages as CoreMessage[]);
  const llmReader = llm.textStream.getReader();
  const llmGenerator = ParseLLMReaderToMarkdownGenerator(llmReader);

  // 递归式流式渲染组件
  const StreamWithRecursion = async (props: { accumulator?: string }) => {
    const currentAccumulator = props.accumulator || "";

    // 从流中读取下一个片段
    const { done, value } = await llmGenerator.next();

    if (done && !currentAccumulator) {
      return null;
    }

    // 如果流结束，返回最终结果
    if (done && currentAccumulator) {
      await db.message.create({
        content: currentAccumulator,
        role: "assistant",
        conversationId,
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

  return (
    <>
      <div>Tool Call: {toolName} done</div>
      <Suspense fallback={<LoadingWithText text="AI 正在思考..." />}>
        <StreamWithRecursion />
      </Suspense>
    </>
  );
  // revalidatePath(`/chat/conversation/${conversationId}`);
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
            {message.content as string}
          </UserMessageWrapper>
        ) : message.role === "assistant" &&
          typeof message.content === "string" ? (
          <AssistantMessageWrapper key={message.id}>
            <ParseToMarkdown block={message.content || "## 系统错误，请重试"} />
          </AssistantMessageWrapper>
        ) : (
          <AssistantMessageWrapper key={message.id}>
            {(
              message.content as unknown as (ToolCallPart | ToolResultPart)[]
            ).map((item, index) => {
              return (
                <ParseToMarkdown
                  key={index}
                  block={
                    item.type === "tool-call"
                      ? item.toolName
                      : item.type === "tool-result"
                        ? ((item as ToolResultPart).result as { summary?: string }).summary || "工具调用结果"
                        : "## 系统错误，请重试"
                  }
                />
              );
            })}
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
      return value;
    },
    (error) => {
      status = "rejected";
      throw error;
    }
  );

  return {
    get isPending() {
      return status === "pending";
    },
    get isFulfilled() {
      return status === "fulfilled";
    },
    get isRejected() {
      return status === "rejected";
    },
    wrappedPromise,
  };
}
