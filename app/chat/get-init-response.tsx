"use client";

import { ReactNode, useEffect, useRef, useState } from "react";
import { getLLMResponseReactNode } from "./action";
import { Message } from "./type";
import { UserMessageWrapper, AssistantMessageWrapper } from "./ui/message";
import { LoadingWithText } from "./ui/skeleton";

export default function GetInitResponse({
  conversationId,
  messages,
}: {
  conversationId: string;
  messages: Message[];
}) {
  const [response, setResponse] = useState<ReactNode>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const isMounted = useRef(true);

  useEffect(() => {
    const fetchResponse = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const llmResponseReactNode = await getLLMResponseReactNode(
          conversationId,
          messages
        );

        // 只有在组件仍然挂载时才更新状态
        if (isMounted.current) {
          setResponse(llmResponseReactNode);
        }
      } catch (err) {
        if (isMounted.current) {
          setError(err instanceof Error ? err.message : "获取响应失败");
        }
      } finally {
        if (isMounted.current) {
          setIsLoading(false);
        }
      }
    };

    fetchResponse();

    return () => {
      isMounted.current = false;
    };
  }, [conversationId, messages]); // 添加正确的依赖项

  // 显示加载状态
  if (isLoading) {
    return (
      <>
        <UserMessageWrapper>{messages[0].content as string}</UserMessageWrapper>
        <AssistantMessageWrapper>
          <LoadingWithText text="AI 正在思考..." />
        </AssistantMessageWrapper>
      </>
    );
  }

  // 显示错误状态
  if (error) {
    return <div className="text-red-500">错误: {error}</div>;
  }

  return response;
}
