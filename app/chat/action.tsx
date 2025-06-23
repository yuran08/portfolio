"use server";

import db from "@/lib/redis";
import {
  UserMessageWrapper,
  AssistantMessageWrapper,
  ToolMessageWrapper,
} from "./components/message";
import { Suspense, ReactNode } from "react";
import { revalidatePath } from "next/cache";
import { Message } from "./type";
import ParseLLMReaderToMarkdownGenerator from "./lib/parser";
import { LoadingWithText, ErrorText } from "./components/skeleton";
import { createLLMStream } from "./lib/llm";
import { CoreMessage, ToolResultPart } from "ai";
import GetNextResponse from "./get-next-response";
import { BaseToolResult, formatToolResult } from "./tools";
import { MemoizedMarkdown } from "./components/markdown";
import StreamHandler from "./components/stream-handler";

// 开始对话
export const startConversation = async (
  conversationId: string,
  message: string
) => {
  await db.conversation.create({
    id: conversationId,
    title: message,
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
  revalidatePath(`/chat`);
};

// 删除对话
export const deleteConversation = async (conversationId: string) => {
  await db.conversation.delete(conversationId);
  revalidatePath(`/chat`);
  revalidatePath(`/chat/conversation/${conversationId}`);
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
  const { textStream, toolCalls, toolResults } = await createLLMStream(
    messages as CoreMessage[],
    conversationId
  );
  const llmReader = textStream.getReader();
  const llmGenerator = ParseLLMReaderToMarkdownGenerator(llmReader);

  const wrappedToolResults = createPromiseWithStatus(toolResults);

  const { done: hasToolCall, value: firstChunck } = await llmGenerator.next();

  const StreamWithToolCalls = async () => {
    const streamToolCalls = await toolCalls;

    await db.message.create({
      content: JSON.stringify(streamToolCalls),
      role: "assistant",
      conversationId,
    });

    const toolName = streamToolCalls[0].toolName;

    // 递归处理工具调用结果
    const ProcessToolResults = async () => {
      if (wrappedToolResults.isPending) {
        return (
          <Suspense
            fallback={
              <ToolMessageWrapper>
                <LoadingWithText text={`🔧正在执行 ${toolName} 工具...`} />
              </ToolMessageWrapper>
            }
          >
            <ProcessToolResults />
          </Suspense>
        );
      }

      if (wrappedToolResults.isFulfilled) {
        const result = await wrappedToolResults.wrappedPromise;
        const llmResponseReactNode = await addToolResultForNextMessage(
          conversationId,
          result
        );
        return llmResponseReactNode;
      }

      return (
        <ToolMessageWrapper>
          <ErrorText text={`工具调用失败: ${toolName}`} />
        </ToolMessageWrapper>
      );
    };

    return <ProcessToolResults />;
  };

  return (
    <>
      <UserMessageWrapper>
        {messages[messages.length - 1].content as string}
      </UserMessageWrapper>
      {hasToolCall ? (
        <Suspense
          fallback={
            <ToolMessageWrapper>
              <LoadingWithText text={`🔧正在识别工具调用...`} />
            </ToolMessageWrapper>
          }
        >
          <StreamWithToolCalls />
        </Suspense>
      ) : (
        <AssistantMessageWrapper>
          <Suspense fallback={<LoadingWithText text="AI 正在思考..." />}>
            <StreamHandler
              generator={llmGenerator}
              conversationId={conversationId}
              initialContent={firstChunck}
            />
          </Suspense>
        </AssistantMessageWrapper>
      )}
    </>
  );
};

// 获取工具调用结果
export const addToolResultForNextMessage = async (
  conversationId: string,
  content: Message["content"]
) => {
  // 检查工具是否需要AI进一步处理结果
  let requiresFollowUp = true;

  // 提取renderData字段进行存储，减少数据库内存压力
  const extractRenderData = (toolResults: ToolResultPart[]) => {
    return toolResults.map((toolResult) => {
      const result = toolResult.result as BaseToolResult;

      // 检查工具是否需要AI后续处理
      // 当前最多只有一个toolcall，若增加多个需要修改判断逻辑
      if (result.requiresFollowUp === false) {
        requiresFollowUp = false;
      }

      return {
        type: toolResult.type,
        toolCallId: toolResult.toolCallId,
        toolName: toolResult.toolName,
        result: result.renderData, // 只存储渲染必要的数据
      };
    });
  };

  const optimizedContent = extractRenderData(content as ToolResultPart[]);

  await db.message.create({
    content: JSON.stringify(optimizedContent),
    role: "tool",
    conversationId,
  });

  // 如果工具不需要AI进一步处理，直接返回工具结果
  if (!requiresFollowUp) {
    return (
      <>
        <ToolMessageWrapper>
          <MemoizedMarkdown
            id={(content as ToolResultPart[])[0].toolCallId}
            content={formatToolResult(
              (content as ToolResultPart[])[0].toolName,
              (content as ToolResultPart[])[0].result
            )}
          />
        </ToolMessageWrapper>
      </>
    );
  }

  const messages = (await db.message.findByConversationId(conversationId)).map(
    (message) => ({
      id: message.id,
      role: message.role,
      content: message.content,
    })
  );
  const llm = await createLLMStream(messages as CoreMessage[], conversationId);
  const llmReader = llm.textStream.getReader();
  const llmGenerator = ParseLLMReaderToMarkdownGenerator(llmReader);

  return (
    <>
      <ToolMessageWrapper>
        <MemoizedMarkdown
          id={(content as ToolResultPart[])[0].toolCallId}
          content={formatToolResult(
            (content as ToolResultPart[])[0].toolName,
            (content as ToolResultPart[])[0].result
          )}
        />
      </ToolMessageWrapper>
      <AssistantMessageWrapper>
        <Suspense fallback={<LoadingWithText text="正在等待工具调用结果..." />}>
          <StreamHandler
            generator={llmGenerator}
            conversationId={conversationId}
          />
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
