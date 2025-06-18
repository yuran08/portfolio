"use client";

import { useState, useEffect, ReactNode, useCallback, useRef } from "react";
import { ChevronDown } from "lucide-react";

export function ConversationMessages({
  initialMessages,
}: {
  conversationId: string;
  initialMessages: ReactNode;
}) {
  const messagesRef = useRef<HTMLDivElement | null>(null);
  const [showScrollToBottom, setShowScrollToBottom] = useState(false);
  const hasInitiallyScrolled = useRef(false); // 用于跟踪是否已执行初始滚动

  // 滚动到底部的函数（平滑滚动）
  const scrollToBottom = useCallback(() => {
    if (messagesRef.current) {
      messagesRef.current.scrollTo({
        top: messagesRef.current.scrollHeight,
        behavior: "smooth",
      });
    }
  }, []);

  // 监听滚动事件，判断是否显示"回到底部"按钮
  const handleScroll = useCallback(() => {
    if (messagesRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = messagesRef.current;
      const distanceFromBottom = scrollHeight - scrollTop - clientHeight;
      // 当用户向上滚动超过300px时显示按钮
      setShowScrollToBottom(distanceFromBottom > 300);
    }
  }, []);

  useEffect(() => {
    if (hasInitiallyScrolled) {
      scrollToBottom();
    }
  }, [initialMessages]);

  // 主Effect，处理初始滚动和滚动事件监听
  useEffect(() => {
    const messagesElement = messagesRef.current;
    if (!messagesElement) return;

    // 创建一个 MutationObserver 实例来监听内容变化
    const observer = new MutationObserver(() => {
      // 检查是否是首次加载内容（Suspense解析完成）
      if (!hasInitiallyScrolled.current && messagesElement.scrollHeight > 0) {
        // 立即滚动到底部，无动画
        messagesElement.scrollTo({
          top: messagesElement.scrollHeight,
          behavior: "auto",
        });
        hasInitiallyScrolled.current = true; // 标记为已滚动
        observer.disconnect(); // 完成初始滚动后，断开观察，不再自动滚动
      }
    });

    // 开始观察DOM变化（childList和subtree确保能捕获到Suspense内容的替换）
    observer.observe(messagesElement, {
      childList: true,
      subtree: true,
    });

    // 添加滚动事件监听
    messagesElement.addEventListener("scroll", handleScroll);

    // 清理函数
    return () => {
      observer.disconnect();
      messagesElement.removeEventListener("scroll", handleScroll);
    };
    // 依赖项为空数组，此Effect仅在组件挂载时运行一次
  }, [handleScroll]);

  return (
    <div
      ref={messagesRef}
      className="relative flex-1 overflow-y-auto px-6 py-4 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
    >
      <div className="mx-auto max-w-3xl">
        <div className="w-full">{initialMessages}</div>
      </div>

      {/* 回到底部按钮 */}
      {showScrollToBottom && (
        <div className="sticky bottom-0 left-0 right-0 mx-auto flex max-w-3xl justify-end">
          <button
            onClick={scrollToBottom}
            className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-500 shadow-lg transition-all duration-200 hover:bg-blue-600 hover:shadow-xl dark:bg-indigo-600 dark:hover:bg-indigo-500"
            aria-label="回到底部"
          >
            <ChevronDown className="h-5 w-5 text-white" />
          </button>
        </div>
      )}
    </div>
  );
}
