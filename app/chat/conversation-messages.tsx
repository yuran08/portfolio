"use client";

import { useState, useEffect, useRef, ReactNode, useCallback } from "react";
import { conversationAddMessage } from "./action";
import { useAutoScroll } from "./use-auto-scroll";
import { ScrollIndicator } from "./scroll-indicator";

export function ConversationMessages({
  conversationId,
  initialMessages,
}: {
  conversationId: string;
  initialMessages: ReactNode;
}) {
  const [messagesNode, setMessagesNode] = useState<ReactNode[]>([
    initialMessages,
  ]);
  const [showScrollIndicator, setShowScrollIndicator] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const isInitializedRef = useRef(false);

  // 使用自动滚动Hook
  const {
    scrollToBottom,
    findScrollContainer,
    isUserAtBottom,
    scrollToBottomInstant,
  } = useAutoScroll({
    enabled: true,
    behavior: "smooth",
    delay: 100,
    onlyWhenAtBottom: false, // 改为false，减少限制
    bottomThreshold: 150,
  });

  // 检查是否显示滚动指示器
  const checkScrollIndicator = useCallback(() => {
    const atBottom = isUserAtBottom();
    // 只有当用户不在底部且有内容时才显示指示器
    setShowScrollIndicator(!atBottom && messagesNode.length > 0);
  }, [isUserAtBottom, messagesNode.length]);

  // 初始化滚动容器和初始滚动
  useEffect(() => {
    if (containerRef.current && !isInitializedRef.current) {
      findScrollContainer(containerRef.current);

      scrollToBottomInstant(); // 强制滚动到底部
      checkScrollIndicator();
      isInitializedRef.current = true;
    }
  }, [findScrollContainer, scrollToBottomInstant, checkScrollIndicator]);

  // 监听消息变化，触发滚动
  useEffect(() => {
    if (messagesNode.length > 0 && isInitializedRef.current) {
      // 延迟滚动，确保DOM已更新
      setTimeout(() => {
        scrollToBottom();
        checkScrollIndicator();
      }, 50);
    }
  }, [messagesNode, scrollToBottom, checkScrollIndicator]);

  // 定期检查滚动指示器状态
  useEffect(() => {
    const interval = setInterval(() => {
      checkScrollIndicator();
    }, 1000);

    return () => clearInterval(interval);
  }, [checkScrollIndicator]);

  // 使用MutationObserver监听DOM变化（用于流式渲染时的自动滚动）
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const observer = new MutationObserver((mutations) => {
      // 检查是否有文本内容变化（流式渲染）
      const hasTextChanges = mutations.some(
        (mutation) =>
          mutation.type === "childList" ||
          mutation.type === "characterData" ||
          (mutation.type === "attributes" &&
            mutation.attributeName === "data-message-id")
      );

      if (hasTextChanges && isInitializedRef.current) {
        // 流式渲染时的滚动，使用较短的延迟
        setTimeout(() => {
          scrollToBottom();
          checkScrollIndicator();
        }, 30);
      }
    });

    // 监听自定义的流式更新事件
    const handleStreamingUpdate = (event: Event) => {
      const customEvent = event as CustomEvent;
      if (customEvent.detail && isInitializedRef.current) {
        // 流式内容更新时立即滚动
        setTimeout(() => {
          scrollToBottom();
          checkScrollIndicator();
        }, 20);
      }
    };

    // 观察整个消息容器的变化
    observer.observe(container, {
      childList: true,
      subtree: true,
      characterData: true,
      attributes: true,
      attributeFilter: ["data-message-id"],
    });

    // 监听流式更新事件
    container.addEventListener("streamingUpdate", handleStreamingUpdate);

    return () => {
      observer.disconnect();
      container.removeEventListener("streamingUpdate", handleStreamingUpdate);
    };
  }, [scrollToBottom, checkScrollIndicator]);

  // 添加消息的函数，供 ChatInput 调用
  const addMessage = useCallback(
    async (message: string) => {
      try {
        const newMessage = await conversationAddMessage(
          conversationId,
          message
        );
        setMessagesNode((prev) => [...prev, newMessage]);
      } catch (error) {
        console.error("Failed to send message:", error);
      }
    },
    [conversationId]
  );

  // 将 addMessage 函数暴露给父组件
  useEffect(() => {
    (
      window as unknown as {
        addMessageToConversation?: (message: string) => Promise<void>;
      }
    ).addMessageToConversation = addMessage;
    return () => {
      delete (
        window as unknown as {
          addMessageToConversation?: (message: string) => Promise<void>;
        }
      ).addMessageToConversation;
    };
  }, [conversationId, addMessage]);

  // 处理滚动指示器点击
  const handleScrollIndicatorClick = useCallback(() => {
    scrollToBottomInstant();
    setShowScrollIndicator(false);

    // 延迟再次检查状态
    setTimeout(() => {
      checkScrollIndicator();
    }, 500);
  }, [scrollToBottomInstant, checkScrollIndicator]);

  return (
    <>
      <div ref={containerRef} className="w-full">
        {messagesNode}
      </div>

      <ScrollIndicator
        isVisible={showScrollIndicator}
        onClick={handleScrollIndicatorClick}
      />
    </>
  );
}
